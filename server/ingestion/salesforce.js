import jsforce from "jsforce";
import "dotenv/config";
import { MongoClient } from "mongodb";

// ─── MongoDB connection ────────────────────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "salesforce";

// ─── Salesforce connection config ─────────────────────────────────────────────
const SF_CONFIG = {
  loginUrl: process.env.SF_LOGIN_URL || "https://login.salesforce.com", // default — no need to set in .env
  username: process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD,
  securityToken: process.env.SF_SECURITY_TOKEN,
  clientId: process.env.SF_CLIENT_ID,
  clientSecret: process.env.SF_CLIENT_SECRET,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Authenticate with Salesforce via username/password + security token.
 * Only works when "Allow OAuth Username-Password Flows" is enabled in the org.
 */
async function connectSalesforce() {
  const connOptions = { loginUrl: SF_CONFIG.loginUrl };
  if (SF_CONFIG.clientId && SF_CONFIG.clientSecret) {
    connOptions.clientId = SF_CONFIG.clientId;
    connOptions.clientSecret = SF_CONFIG.clientSecret;
  }

  const conn = new jsforce.Connection(connOptions);
  const passwordWithToken = SF_CONFIG.securityToken
    ? SF_CONFIG.password + SF_CONFIG.securityToken
    : SF_CONFIG.password;

  await conn.login(SF_CONFIG.username, passwordWithToken);
  console.log(`✅ Salesforce authenticated. Instance: ${conn.instanceUrl}`);
  return conn;
}

/**
 * Create a jsforce Connection using a pre-obtained OAuth2 access token.
 * Used by the browser-based OAuth2 flow (for orgs that block username-password).
 */
export function connectionFromToken(accessToken, instanceUrl) {
  return new jsforce.Connection({ accessToken, instanceUrl });
}

/**
 * Build the Salesforce OAuth2 authorization URL.
 * The user visits this URL in their browser to approve access.
 */
export function getAuthorizationUrl(callbackUrl) {
  if (!SF_CONFIG.clientId) {
    throw new Error(
      "SF_CLIENT_ID is required for OAuth2 browser flow. " +
      "Create a Salesforce Connected App and add its Consumer Key to .env as SF_CLIENT_ID."
    );
  }
  const oauth2 = new jsforce.OAuth2({
    loginUrl: SF_CONFIG.loginUrl,
    clientId: SF_CONFIG.clientId,
    clientSecret: SF_CONFIG.clientSecret || undefined,
    redirectUri: callbackUrl,
  });
  return oauth2.getAuthorizationUrl({ scope: "api refresh_token" });
}

/**
 * Exchange an OAuth2 authorization code for an access token + instance URL.
 * Called after Salesforce redirects back to the callback URL.
 */
export async function exchangeCodeForToken(code, callbackUrl) {
  const oauth2 = new jsforce.OAuth2({
    loginUrl: SF_CONFIG.loginUrl,
    clientId: SF_CONFIG.clientId,
    clientSecret: SF_CONFIG.clientSecret || undefined,
    redirectUri: callbackUrl,
  });
  const conn = new jsforce.Connection({ oauth2 });
  await conn.authorize(code);
  console.log(`✅ OAuth2 token exchanged. Instance: ${conn.instanceUrl}`);
  return { accessToken: conn.accessToken, instanceUrl: conn.instanceUrl };
}

/**
 * Fetch ALL records for a SOQL query, auto-paginating through large result sets.
 */
async function queryAll(conn, soql) {
  const records = [];
  let result = await conn.query(soql);
  records.push(...result.records);
  while (!result.done) {
    result = await conn.queryMore(result.nextRecordsUrl);
    records.push(...result.records);
  }
  return records;
}

/**
 * Upsert an array of documents into a MongoDB collection by the `ID` field.
 * Returns the count of upserted/modified documents.
 */
async function upsertCollection(db, collectionName, docs) {
  if (!docs || docs.length === 0) {
    console.log(`  ⚠️  ${collectionName}: no records to upsert.`);
    return 0;
  }
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { ID: doc.ID },
      update: { $set: doc },
      upsert: true,
    },
  }));
  const result = await db.collection(collectionName).bulkWrite(ops, { ordered: false });
  const count = (result.upsertedCount || 0) + (result.modifiedCount || 0);
  console.log(`  ✅ ${collectionName}: ${count} records upserted/updated (${docs.length} total).`);
  return count;
}

// ─── Transformers ─────────────────────────────────────────────────────────────

function transformUsers(records) {
  return records.map((r) => ({
    ID: r.Id,
    NAME: r.Name,
    USERNAME: r.Username,
    EMAIL: r.Email,
  }));
}

function transformAccounts(records) {
  return records.map((r) => ({
    ID: r.Id,
    NAME: r.Name,
    TYPE: r.Type || null,
    WEBSITE: r.Website || null,
    INDUSTRY: r.Industry || null,
    PHONE: r.Phone || null,
    OWNER_ID: r.OwnerId || null,
  }));
}

function transformContacts(records) {
  return records.map((r) => ({
    ID: r.Id,
    ACCOUNT_ID: r.AccountId || null,
    FIRST_NAME: r.FirstName || null,
    LAST_NAME: r.LastName || null,
    NAME: r.Name,
    EMAIL: r.Email || null,
    PHONE: r.Phone || null,
    TITLE: r.Title || null,
  }));
}

function transformOpportunities(records) {
  return records.map((r) => ({
    ID: r.Id,
    NAME: r.Name,
    ACCOUNT_ID: r.AccountId || null,
    STAGE_NAME: r.StageName || null,
    AMOUNT: r.Amount || null,
    CLOSE_DATE: r.CloseDate || null,
    IS_CLOSED: r.IsClosed ? 1 : 0,
    IS_WON: r.IsWon ? 1 : 0,
  }));
}

function transformEvents(records) {
  return records.map((r) => ({
    ID: r.Id,
    ACCOUNT_ID: r.WhatId || r.AccountId || null, // WhatId = related Account/Opportunity
    SUBJECT: r.Subject || null,
    START_DATE_TIME: r.StartDateTime || null,
    END_DATE_TIME: r.EndDateTime || null,
    DESCRIPTION: r.Description || null,
  }));
}

function transformEmails(records) {
  return records.map((r) => ({
    ID: r.Id,
    SUBJECT: r.Subject || null,
    TEXT_BODY: r.TextBody || null,
    FROM_ADDRESS: r.FromAddress || null,
    TO_ADDRESS: r.ToAddress || null,
    MESSAGE_DATE: r.MessageDate || null,
    RELATED_TO_ID: r.RelatedToId || null,
    THREAD_IDENTIFIER: r.ThreadIdentifier || null,
    REPLY_TO_EMAIL_MESSAGE_ID: r.ReplyToEmailMessageId || null,
  }));
}

function transformEmailRelations(records) {
  // Only keep relations where the related object is a Contact (not Lead/User)
  return records
    .filter((r) => r.RelationObjectType === "Contact")
    .map((r) => ({
      EMAIL_MESSAGE_ID: r.EmailMessageId,
      RELATION_ID: r.RelationId,
    }));
}

// ─── SOQL Queries ─────────────────────────────────────────────────────────────

const SOQL = {
  users: `
    SELECT Id, Name, Username, Email
    FROM User
    WHERE IsActive = true
    LIMIT 200
  `,
  accounts: `
    SELECT Id, Name, Type, Website, Industry, Phone, OwnerId
    FROM Account
    ORDER BY LastModifiedDate DESC
    LIMIT 2000
  `,
  contacts: `
    SELECT Id, AccountId, FirstName, LastName, Name, Email, Phone, Title
    FROM Contact
    ORDER BY LastModifiedDate DESC
    LIMIT 5000
  `,
  opportunities: `
    SELECT Id, Name, AccountId, StageName, Amount, CloseDate, IsClosed, IsWon
    FROM Opportunity
    ORDER BY LastModifiedDate DESC
    LIMIT 5000
  `,
  events: `
    SELECT Id, WhatId, AccountId, Subject, StartDateTime, EndDateTime, Description
    FROM Event
    ORDER BY LastModifiedDate DESC
    LIMIT 5000
  `,
  emails: `
    SELECT Id, Subject, TextBody, FromAddress, ToAddress, MessageDate,
           RelatedToId, ThreadIdentifier, ReplyToEmailMessageId
    FROM EmailMessage
    ORDER BY MessageDate DESC
    LIMIT 10000
  `,
  emailRelations: `
    SELECT EmailMessageId, RelationId, RelationObjectType
    FROM EmailMessageRelation
    WHERE RelationObjectType = 'Contact'
    LIMIT 20000
  `,
};

/**
 * Run a full Salesforce → MongoDB sync using a pre-obtained OAuth2 access token.
 * Used by the browser OAuth2 flow (GET /ingestion/authorize → callback → this).
 */
export async function runSyncWithToken(accessToken, instanceUrl) {
  console.log("\n🔄 Starting Salesforce → MongoDB sync (OAuth2 token)...\n");
  const startTime = Date.now();

  const conn = connectionFromToken(accessToken, instanceUrl);

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  console.log(`✅ MongoDB connected: ${dbName}\n`);

  const summary = {};

  try {
    console.log("📥 Fetching Users...");
    summary.users = await upsertCollection(db, "users", transformUsers(await queryAll(conn, SOQL.users)));

    console.log("📥 Fetching Accounts...");
    summary.accounts = await upsertCollection(db, "accounts", transformAccounts(await queryAll(conn, SOQL.accounts)));

    console.log("📥 Fetching Contacts...");
    summary.contacts = await upsertCollection(db, "contacts", transformContacts(await queryAll(conn, SOQL.contacts)));

    console.log("📥 Fetching Opportunities...");
    summary.opportunities = await upsertCollection(db, "opportunities", transformOpportunities(await queryAll(conn, SOQL.opportunities)));

    console.log("📥 Fetching Events...");
    summary.events = await upsertCollection(db, "events", transformEvents(await queryAll(conn, SOQL.events)));

    console.log("📥 Fetching EmailMessages...");
    summary.emails = await upsertCollection(db, "emails", transformEmails(await queryAll(conn, SOQL.emails)));

    console.log("📥 Fetching EmailMessageRelations...");
    summary.email_relations = await upsertCollection(db, "email_relations", transformEmailRelations(await queryAll(conn, SOQL.emailRelations)));

    await db.collection("sync_meta").updateOne(
      { _id: "last_sync" },
      { $set: { timestamp: new Date().toISOString(), summary, method: "oauth2" } },
      { upsert: true }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Sync complete in ${elapsed}s`);
    return { success: true, elapsed: `${elapsed}s`, summary };
  } finally {
    await mongoClient.close();
  }
}

// ─── Username-Password sync (when org allows it) ─────────────────────────────

/**
 * Run a full Salesforce → MongoDB sync via username/password flow.
 * Requires "Allow OAuth Username-Password Flows" to be ON in Salesforce org settings.
 */
export async function runSync() {
  // Validate required env vars
  const missing = ["SF_USERNAME", "SF_PASSWORD"].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Please add them to server/.env — see .env.example for the full list.`
    );
  }

  console.log("\n🔄 Starting Salesforce → MongoDB sync...\n");
  const startTime = Date.now();

  // Connect to Salesforce
  const conn = await connectSalesforce();


  // Connect to MongoDB
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  console.log(`✅ MongoDB connected: ${dbName}\n`);

  const summary = {};

  try {
    // 1. Users
    console.log("📥 Fetching Users...");
    const users = transformUsers(await queryAll(conn, SOQL.users));
    summary.users = await upsertCollection(db, "users", users);

    // 2. Accounts
    console.log("📥 Fetching Accounts...");
    const accounts = transformAccounts(await queryAll(conn, SOQL.accounts));
    summary.accounts = await upsertCollection(db, "accounts", accounts);

    // 3. Contacts
    console.log("📥 Fetching Contacts...");
    const contacts = transformContacts(await queryAll(conn, SOQL.contacts));
    summary.contacts = await upsertCollection(db, "contacts", contacts);

    // 4. Opportunities
    console.log("📥 Fetching Opportunities...");
    const opportunities = transformOpportunities(await queryAll(conn, SOQL.opportunities));
    summary.opportunities = await upsertCollection(db, "opportunities", opportunities);

    // 5. Events
    console.log("📥 Fetching Events...");
    const events = transformEvents(await queryAll(conn, SOQL.events));
    summary.events = await upsertCollection(db, "events", events);

    // 6. Emails
    console.log("📥 Fetching EmailMessages...");
    const emails = transformEmails(await queryAll(conn, SOQL.emails));
    summary.emails = await upsertCollection(db, "emails", emails);

    // 7. Email Relations
    console.log("📥 Fetching EmailMessageRelations...");
    const relations = transformEmailRelations(await queryAll(conn, SOQL.emailRelations));
    summary.email_relations = await upsertCollection(db, "email_relations", relations);

    // Record last sync timestamp
    await db.collection("sync_meta").updateOne(
      { _id: "last_sync" },
      { $set: { timestamp: new Date().toISOString(), summary } },
      { upsert: true }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Sync complete in ${elapsed}s`);
    console.log("Summary:", summary);
    return { success: true, elapsed: `${elapsed}s`, summary };
  } finally {
    await mongoClient.close();
    await conn.logout();
  }
}

// ─── CLI entry point ──────────────────────────────────────────────────────────
// Run directly: node ingestion/salesforce.js
if (process.argv[1] && process.argv[1].endsWith("salesforce.js")) {
  runSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\n❌ Sync failed:", err.message);
      process.exit(1);
    });
}
