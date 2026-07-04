import { Router } from "express";
import { ChromaClient } from "chromadb";
import { extractJsonBlock, parseLLMJson } from "../utils/extractJsonBlock.js";
import { groupEmailsByThread } from "../utils/groupEmailsByThread.js";
import { redisClient } from "../index.js";
import { callLLM } from "../utils/ai.js";

const router = Router();
const client = new ChromaClient();

router.post("/needsAndRisk", async (req, res) => {
  try {
    const opportunityId = req.body.opportunityId;
    const emailDetails = req.body.emailMessages;
    const contactDetails = req.body.contacts;
    const cacheKey = `analytics:needsAndRisk:${opportunityId}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for Needs and Risk", opportunityId);
      return res.json(JSON.parse(cachedResult));
    }
    const emailGroupByThreadIdentifier = groupEmailsByThread(emailDetails);
    let finalConversationsforNeeds = [];
    let finalConversationsforRisk = [];

    if (emailDetails && emailDetails.length !== 0) {
      const conversations = [];
      Object.keys(emailGroupByThreadIdentifier).forEach((threadId) => {
        const emails = emailGroupByThreadIdentifier[threadId];
        let conversation = "";
        emails.forEach((email) => {
          const role = contactDetails.some((i) => i.EMAIL === email.FromAddress)
            ? "customer"
            : "salesAgent";
          conversation += `${role}: ${email.Body}\n`;
        });
        conversations.push(conversation);
      });

      try {
        const collection = await client.getOrCreateCollection({
          name: "needs_risk",
        });
        await collection.upsert({
          documents: conversations,
          ids: Array.from({ length: conversations.length }, (_, i) => String(i)),
        });

        const resultsForRisk = await collection.query({
          queryTexts: ["what are the Churn Risk in the conversation"],
          n_results: conversations.length < 3 ? conversations.length : 3,
        });
        if (resultsForRisk.ids && resultsForRisk.ids.length > 0) {
          const riskIds = resultsForRisk.ids[0];
          riskIds.forEach((result) => {
            finalConversationsforRisk.push(conversations[parseInt(result)]);
          });
        }

        const resultsForNeeds = await collection.query({
          queryTexts: ["what are the Needs of customer in the conversation"],
          n_results: conversations.length < 3 ? conversations.length : 3,
        });
        if (resultsForNeeds.ids && resultsForNeeds.ids.length > 0) {
          const needsIds = resultsForNeeds.ids[0];
          needsIds.forEach((result) => {
            finalConversationsforNeeds.push(conversations[parseInt(result)]);
          });
        }

        try {
          await client.deleteCollection({ name: "needs_risk" });
        } catch (delErr) {
          // ignore cleanup errors
        }
      } catch (chromaErr) {
        console.warn("ChromaDB failed/offline in needsAndRisk, using fallback:", chromaErr.message);
        finalConversationsforNeeds = conversations.slice(-3);
        finalConversationsforRisk = conversations.slice(-3);
      }
    }

    const messages = [
      {
        role: "system",
        content:
          'You are an experienced sales professional with a proven track record of understanding client needs and mitigating risks. Your task is to analyze the provided emails and transcripts to gain insights into the clients requirements and identify any potential risks that could jeopardize the ongoing business relationship. Provide your response in JSON format: { "overallNeeds" : "Overall Summary of what client needs." , "needsDetail": [{ "name" : "need 1" , "fulfiled" : "Number"}, ...], "overallRisks" : "Overall Summary of what risks are there such that client might leave." , "riskDetail": [{ "name" : "risk 1" , "riskParam" : "Number"}, ...] }. Fulfiled and Risk Param shoul be out of 100. needsDetail and riskDetail must be atleast 2. Please ensure the output to be structured as specified, without any extra narrative or introductory text.',
      },
      {
        role: "user",
        content: `Here is the information about the email you are researching: ${finalConversationsforNeeds} ${finalConversationsforRisk}`,
      },
    ];

    try {
      const messageContent = await callLLM(messages, { json: true });
      let overallNeeds = "";
      let needsDetail = [];
      let overallRisks = "";
      let riskDetail = [];

      let parsedContent = parseLLMJson(messageContent, null);
      if (!parsedContent) {
        console.error("Something went wrong in NeedsAndRisk in parsing: parsedContent is null/invalid.");
        return res.json({ overallNeeds: "Failed to parse needs from LLM.", needsDetail: [], overallRisks: "Failed to parse risks from LLM.", riskDetail: [] });
      }
      overallNeeds = parsedContent.overallNeeds || "";
      needsDetail = parsedContent.needsDetail || [];
      overallRisks = parsedContent.overallRisks || "";
      riskDetail = parsedContent.riskDetail || [];

      const needsAndRisks = {
        overallNeeds,
        needsDetail,
        overallRisks,
        riskDetail,
      };

      await redisClient.set(cacheKey, JSON.stringify(needsAndRisks), {
        EX: 60 * 60 * 24 * 1000,
      });
      return res.json(needsAndRisks);
    } catch (err) {
      console.error("Failed to call OpenAI for Needs and Risk.", err);
      return res.json({ overallNeeds: "Failed to fetch needs from LLM.", needsDetail: [], overallRisks: "Failed to fetch risks from LLM.", riskDetail: [] });
    }
  } catch (e) {
    console.error("Something went in NeedsAndRisk.", e);
    return res.json({ overallNeeds: "Error in request handling.", needsDetail: [], overallRisks: "Error in request handling.", riskDetail: [] });
  }
});

export default router;
