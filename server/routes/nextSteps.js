import { Router } from "express";
import { ChromaClient } from "chromadb";
import { extractJsonBlock, parseLLMJson } from "../utils/extractJsonBlock.js";
import { groupEmailsByThread } from "../utils/groupEmailsByThread.js";
import { redisClient } from "../index.js";
import { callLLM } from "../utils/ai.js";
const client = new ChromaClient();
const router = Router();

router.post("/nextSteps", async (req, res) => {
  try {
    const { opportunityId, emailMessages, contacts } = req.body;

    const cacheKey = `analytics:nextSteps:${opportunityId}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for Next Steps", opportunityId);
      return res.json(JSON.parse(cachedResult));
    }
    const orderedEmailsByThread = groupEmailsByThread(emailMessages);
    let conversations = [];
    for (let thread in orderedEmailsByThread) {
      let emails = orderedEmailsByThread[thread];
      let conversation = "";
      for (let email of emails) {
        const role = contacts.some((i) => i.EMAIL === email.FromAddress)
          ? "customer"
          : "salesAgent";
        conversation += `${role}: ${email.Body}\n`;
        conversations.push(conversation);
      }
      let finalConversations = [];
      try {
        const collection = await client.getOrCreateCollection({
          name: "nextSteps",
        });
        await collection.upsert({
          documents: conversations,
          ids: Array.from({ length: conversations.length }, (_, i) => String(i)),
        });
        const result = await collection.query({
          queryTexts: [
            "What are the next steps yet to be done by Sales representative?",
          ],
          nResults: conversations.length > 3 ? 3 : conversations.length,
        });
        if (result.ids && result.ids.length > 0) {
          let ids = result.ids[0];
          for (let id of ids) {
            finalConversations.push(conversations[id]);
          }
        }
      } catch (chromaErr) {
        console.warn("ChromaDB failed/offline in nextSteps, using fallback:", chromaErr.message);
        finalConversations = conversations.slice(-3);
      }
      let messages = [
        {
          role: "system",
          content:
            'Based on the information provided, suggest the next steps sales agent should take to move the deal forward. Include the key actions sales agent should take, the stakeholders sales agent should engage with, and the timeline for each action. Provide your suggestions as an array of next steps in JSON format, where each step is a string: { "summary" : "Overall Summary of what to do next goes here." , "nextSteps": ["step 1", "step 2", ...] }. Please ensure the output to be structured as specified, without any extra narrative or introductory text.',
        },
        {
          role: "user",
          content: `Here is the information about the email you are researching: ${finalConversations}`,
        },
      ];
      try {
        const messageContent = await callLLM(messages, { json: true });
        let summary = "Something went wrong. Please try again.";
        let nextSteps = [];
        
        let parsedContent = parseLLMJson(messageContent, null);
        if (!parsedContent) {
          console.error("Something went wrong in NextSteps in parsing: parsedContent is null/invalid.");
          return res.json({ nextSteps: [], summary: "Failed to parse next steps suggestions." });
        }
        nextSteps = parsedContent.nextSteps || [];
        summary = parsedContent.summary || "";
        await redisClient.set(
          cacheKey,
          JSON.stringify({ nextSteps, summary }),
          {
            EX: 60 * 60 * 24 * 1000,
          }
        );

        return res.json({ nextSteps, summary });
      } catch (err) {
        console.error("Error getting next steps", err);
        return res.json({ nextSteps: [], summary: "Failed to fetch next steps due to LLM error." });
      }
    }
  } catch (err) {
    console.error("Error getting next steps", err);
    return res.json({ nextSteps: [], summary: "Failed to fetch next steps." });
  }
});

export default router;
