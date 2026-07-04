import { Router } from "express";
import { mongoDb } from "../index.js";
import { callLLM } from "../utils/ai.js";
import { extractJsonBlock, parseLLMJson } from "../utils/extractJsonBlock.js";
import { ChromaClient } from "chromadb";
import { redisClient } from "../index.js";

const chromaClient = new ChromaClient();
const router = Router();

router.post("/strategy", async (req, res) => {
  try {
    const { accountName, accountInfo, opportunities, recentActivities } =
      req.body;

    const cacheKey = `analytics:strategy:${accountName}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }

    // Call unified AI client to generate strategy
    let messagesVP = "";
    try {
      messagesVP = await callLLM([
        {
          role: "user",
      content: `We are an industrial company that sells to the company called ${accountName}. Analyze all the recent updates and now analyze all my recent conversation with these account. Give me a concise strategy in order to close this opportunity. Can you provide me with a strategy for the product based on what company does? Here is the information about the company: ${JSON.stringify(accountInfo)}.Here is the information about the opportunities: ${JSON.stringify(opportunities)}.Here is the information about the recent activities: ${JSON.stringify(recentActivities)}`
        }
      ]);
    } catch (err) {
      console.error("Failed to generate strategy:", err.message);
      messagesVP = "Failed to generate strategy. Please verify your AI configuration.";
    }

    // Get closed opportunities from MongoDB
    const oppRows = await mongoDb.collection("opportunities")
      .find({ IS_CLOSED: 1 })
      .toArray();

    let data = oppRows.map(o => ({
      OPPORTUNITY_ID: o.ID,
      OPPORTUNITY_NAME: o.NAME,
      STAGE_NAME: o.STAGE_NAME,
      AMOUNT: o.AMOUNT,
      CLOSE_DATE: o.CLOSE_DATE,
      IS_CLOSED: o.IS_CLOSED,
      IS_WON: o.IS_WON
    }));

    let opportunitiesFromDB = [];
    try {
      const collection = await chromaClient.getOrCreateCollection({
        name: "value_proposition",
      });
      
      // ChromaDB upsert
      if (data.length > 0) {
        const documents = data.map((doc) => JSON.stringify(doc));
        const ids = data.map((_, i) => String(i));
        await collection.upsert({ documents, ids });
      }

      const queryResults = await collection.query({
        queryTexts: [
          `Which opportunity is closed and related to the account similar to the company ${accountName}`,
        ],
        n_results: data.length < 3 ? data.length : 3,
      });

      const docsResult = queryResults.documents ? queryResults.documents[0] : [];
      opportunitiesFromDB = docsResult.map((doc) => JSON.parse(doc));
    } catch (chromaErr) {
      console.warn("ChromaDB failed/offline, using local fallback slicing:", chromaErr.message);
      opportunitiesFromDB = data.slice(0, 3);
    }
    const oppIds = opportunitiesFromDB.map((o) => o.OPPORTUNITY_ID);

    while (oppIds.length < 3) {
      oppIds.push(null);
    }

    const emailRows = await mongoDb.collection("emails")
      .find({ RELATED_TO_ID: { $in: oppIds.filter(id => id !== null) } })
      .toArray();

    let emailData = emailRows || [];

    const emailByOpportunity = {};
    opportunitiesFromDB.forEach((o) => {
      emailByOpportunity[o.OPPORTUNITY_ID] = [];
    });
    emailData.forEach((email) => {
      const oppId = email.RELATED_TO_ID;
      if (emailByOpportunity[oppId]) {
        emailByOpportunity[oppId].push(email);
      }
    });
    let insights = [];
    for (const opp of opportunitiesFromDB) {
      const messages = [
        {
          role: "system",
          content:
            "Extract key insights into challenges, strategies, relationship factors, outcomes, and market trends from provided sales opportunity and related email. Format the response as follows: { 'Challenges': { 'Objections': 'Client concerns', 'Competitors': 'Rivals considered', 'Internal': 'Resource/pricing issues' }, 'Strategies': { 'Approach': 'Sales style', 'Value': 'Key selling points', 'Tactics': 'Demos, trials, etc.' }, 'Relationship': { 'Touchpoints': 'Communication frequency', 'Engagement': 'Events, outreach' }, 'Outcome': { 'Result': 'Key metrics', 'Feedback': 'Client reviews', 'Potential': 'Upsell opportunities' }, 'Insights': { 'Success': 'What worked', 'Improvement': 'What to avoid', 'Trends': 'Market patterns' } }. Use the given opportunity details and emails to populate this structure accurately with concise, relevant information. Only JSON format is accepted.",
        },
        {
          role: "user",
          content: `Here is the information about the email you are researching: ${JSON.stringify(
            emailByOpportunity[opp.OPPORTUNITY_ID]
          )}`,
        },
        {
          role: "user",
          content: `Here is the information about the email you are researching: ${JSON.stringify(
            opp
          )}`,
        },
      ];
      try {
        const messageContent = await callLLM(messages, { json: true });
        let insight = parseLLMJson(messageContent, null);
        if (!insight) {
          console.error("Something went wrong in ValueProposition in choices loop: parsed insight is null/invalid.");
          return res.json({ error: "Something went wrong." });
        }
        insights.push({ opportunity: opp, overview: insight });
      } catch (err) {
        console.error(
          "Failed to fetch insights from OpenAI in ValueProposition.",
          err
        );
        return res.json({ error: "Something went wrong." });
      }
    }

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        stratergy: messagesVP,
        insights: insights,
      }),
      {
        EX: 60 * 60 * 24 * 1000,
      }
    );

    return res.json({ stratergy: messagesVP, insights: insights });
  } catch (e) {
    console.error("Failed to fetch value proposition:", e);
    return res.json({ stratergy: "Failed to generate strategy: " + e.message, insights: [] });
  }
});

export default router;
