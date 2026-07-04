import { Router } from "express";
import { mongoDb } from "../index.js";
import { redisClient } from "../index.js";

const router = Router();

router.post("/accountDetails", async (req, res) => {
  try {
    const { accountName } = req.body;
    console.log("Fetching account details for", accountName);
    const cacheKey = `analytics:accountDetails-v2-${accountName}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }

    // 1. Fetch Account from MongoDB
    const accountRow = await mongoDb.collection("accounts").findOne({ NAME: accountName });
    if (!accountRow) {
      console.log("Failed to find account details for:", accountName);
      return res.json({ error: "No data found" });
    }

    const account = {
      ID: accountRow.ID,
      Name: accountRow.NAME,
      Type: accountRow.TYPE,
      Industry: accountRow.INDUSTRY,
      Phone: accountRow.PHONE,
      Website: accountRow.WEBSITE
    };

    // 2. Fetch Owner details
    let owner = {};
    if (accountRow.OWNER_ID) {
      const ownerRow = await mongoDb.collection("users").findOne({ ID: accountRow.OWNER_ID });
      if (ownerRow) {
        owner = {
          ID: ownerRow.ID,
          NAME: ownerRow.NAME,
          USERNAME: ownerRow.USERNAME,
          EMAIL: ownerRow.EMAIL
        };
      }
    }

    // 3. Fetch Contacts
    const contactRows = await mongoDb.collection("contacts").find({ ACCOUNT_ID: account.ID }).toArray();
    const contacts = contactRows.map(c => ({
      ID: c.ID,
      ACCOUNT_ID: c.ACCOUNT_ID,
      FIRST_NAME: c.FIRST_NAME,
      LAST_NAME: c.LAST_NAME,
      NAME: c.NAME,
      EMAIL: c.EMAIL,
      PHONE: c.PHONE,
      TITLE: c.TITLE
    }));

    // 4. Fetch Opportunities
    const opportunityRows = await mongoDb.collection("opportunities").find({ ACCOUNT_ID: account.ID }).toArray();
    const opportunities = opportunityRows.map(o => ({
      ID: o.ID,
      NAME: o.NAME,
      ACCOUNT_ID: o.ACCOUNT_ID,
      STAGE_NAME: o.STAGE_NAME,
      AMOUNT: o.AMOUNT,
      CLOSE_DATE: o.CLOSE_DATE,
      IS_CLOSED: o.IS_CLOSED === 1,
      IS_WON: o.IS_WON === 1
    }));

    // 5. Fetch Events
    const eventRows = await mongoDb.collection("events").find({ ACCOUNT_ID: account.ID }).toArray();
    const events = eventRows.map(e => ({
      ID: e.ID,
      ACCOUNT_ID: e.ACCOUNT_ID,
      SUBJECT: e.SUBJECT,
      START_DATE_TIME: e.START_DATE_TIME,
      END_DATE_TIME: e.END_DATE_TIME,
      DESCRIPTION: e.DESCRIPTION,
      ACTIVITY_DATE_TIME: e.END_DATE_TIME
    }));

    // 6. Fetch Emails and relations
    const contactIds = contacts.map(c => c.ID);
    const relations = await mongoDb.collection("email_relations")
      .find({ RELATION_ID: { $in: contactIds } })
      .toArray();
    const emailIds = relations.map(r => r.EMAIL_MESSAGE_ID);

    const emailRows = await mongoDb.collection("emails")
      .find({ ID: { $in: emailIds } })
      .toArray();

    const emailsMapped = emailRows.map(em => {
      const rel = relations.find(r => r.EMAIL_MESSAGE_ID === em.ID);
      return {
        EmailId: em.ID,
        Subject: em.SUBJECT,
        Body: em.TEXT_BODY,
        From: em.FROM_ADDRESS,
        FromAddress: em.FROM_ADDRESS, // alias for client compatibility
        To: em.TO_ADDRESS,
        ToAddress: em.TO_ADDRESS,     // alias
        Date: em.MESSAGE_DATE,
        MessageDate: em.MESSAGE_DATE, // alias
        OpportunityId: em.RELATED_TO_ID,
        ThreadId: em.THREAD_IDENTIFIER,
        RelatedToId: em.RELATED_TO_ID,
        ReplyToEmailMessageId: em.REPLY_TO_EMAIL_MESSAGE_ID,
        CONTACT_ID: rel ? rel.RELATION_ID : null
      };
    });

    const emailMessagesGroupedByContact = {};
    contacts.forEach(c => {
      emailMessagesGroupedByContact[c.ID] = [];
    });
    emailsMapped.forEach(email => {
      if (email.CONTACT_ID && emailMessagesGroupedByContact[email.CONTACT_ID]) {
        emailMessagesGroupedByContact[email.CONTACT_ID].push(email);
      }
    });

    const uniqueEmailMessages = [];
    Object.keys(emailMessagesGroupedByContact).forEach((key) => {
      const emails = emailMessagesGroupedByContact[key];
      emails.forEach((email) => {
        uniqueEmailMessages.push(email);
      });
    });

    const emailMessagesGroupedByOpportunity = {};
    opportunities.forEach((o) => {
      emailMessagesGroupedByOpportunity[o.ID] = [];
    });
    uniqueEmailMessages.forEach((email) => {
      const opportunityId = email.RelatedToId;
      if (emailMessagesGroupedByOpportunity[opportunityId]) {
        emailMessagesGroupedByOpportunity[opportunityId].push(email);
      }
    });

    const accountDetails = {
      account,
      contacts,
      events,
      emailMessages: emailMessagesGroupedByOpportunity,
      opportunities,
      emailMessagesGroupedByContact,
      owner,
    };

    await redisClient.set(cacheKey, JSON.stringify(accountDetails), {
      EX: 60 * 60 * 24 * 1000,
    });

    console.log("Successfully fetched account details from MongoDB for", accountName);
    return res.json(accountDetails);
  } catch (error) {
    console.error("Failed to fetch account details:", error);
    return res.status(500).json({
      error: "Failed to fetch account details",
      errorMessage: error.toString(),
    });
  }
});

export default router;
