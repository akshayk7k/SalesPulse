import { Router } from "express";
import { groupEmailsByThread } from "../utils/groupEmailsByThread.js";
import { redisClient } from "../index.js";
import { callLLM } from "../utils/ai.js";

const router = Router();

router.post("/contactSummary", async (req, res) => {
  try {
    const emailMessages = req.body.emailMessages;
    const contact = req.body.contact;
    const cacheKey = `analytics:contactSummary:${contact.ID}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for Contact Summary", contact.FIRST_NAME);
      return res.json(JSON.parse(cachedResult));
    }
    const emailMessagesGroupedByThread = groupEmailsByThread(emailMessages);
    let latestThreads = [];
    for (const threadId in emailMessagesGroupedByThread) {
      const emails = emailMessagesGroupedByThread[threadId];
      const lastEmailOfThread = emails[emails.length - 1];
      const lastEmailDate = lastEmailOfThread.Date;
      latestThreads.push({
        threadId,
        lastEmailDate,
        emails,
      });
    }

    latestThreads.sort((a, b) => {
      const dateA = new Date(a.lastEmailDate.slice(0, -6));
      const dateB = new Date(b.lastEmailDate.slice(0, -6));
      return dateB - dateA;
    });
    latestThreads = latestThreads.slice(0, 3);
    latestThreads = latestThreads.map(
      (item) => emailMessagesGroupedByThread[item.threadId]
    );
    const messages = [
      {
        role: "user",
        content:
          "I am salesagent. Help me to summarize the conversation with the customer. Respons should be at max 3 sentences with no pre-text. Here is the information about the email you are researching: " +
          JSON.stringify(latestThreads),
      },
    ];
    let updates = "";
    try {
      updates = await callLLM(messages);
    } catch (e) {
      console.error("Failed to generate contact summary:", e);
      return res.json({ error: "Failed to generate contact summary" });
    }

    console.log("Successfully fetched contact summary for", contact.ID);
    await redisClient.set(cacheKey, JSON.stringify({ updates }), {
      EX: 60 * 60 * 24 * 1000,
    });

    return res.json({ updates });
  } catch (e) {
    console.error("Failed to fetch contact summary", e);
    return res.json({ error: "Failed to fetch contact sumary" });
  }
});

export default router;
