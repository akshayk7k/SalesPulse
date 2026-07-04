import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "salesforce.db");

console.log("Initializing SQLite database at:", dbPath);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  DROP TABLE IF EXISTS EMAIL_MESSAGE_RELATION;
  DROP TABLE IF EXISTS EMAIL_MESSAGE;
  DROP TABLE IF EXISTS EVENT;
  DROP TABLE IF EXISTS CONTACT;
  DROP TABLE IF EXISTS OPPORTUNITY;
  DROP TABLE IF EXISTS ACCOUNT;
  DROP TABLE IF EXISTS USER;

  CREATE TABLE USER (
    ID TEXT PRIMARY KEY,
    NAME TEXT,
    USERNAME TEXT,
    EMAIL TEXT
  );

  CREATE TABLE ACCOUNT (
    ID TEXT PRIMARY KEY,
    NAME TEXT,
    TYPE TEXT,
    WEBSITE TEXT,
    INDUSTRY TEXT,
    PHONE TEXT,
    OWNER_ID TEXT,
    FOREIGN KEY(OWNER_ID) REFERENCES USER(ID)
  );

  CREATE TABLE OPPORTUNITY (
    ID TEXT PRIMARY KEY,
    NAME TEXT,
    ACCOUNT_ID TEXT,
    STAGE_NAME TEXT,
    AMOUNT REAL,
    CLOSE_DATE TEXT,
    IS_CLOSED INTEGER, -- 1 = TRUE, 0 = FALSE
    IS_WON INTEGER,
    FOREIGN KEY(ACCOUNT_ID) REFERENCES ACCOUNT(ID)
  );

  CREATE TABLE CONTACT (
    ID TEXT PRIMARY KEY,
    ACCOUNT_ID TEXT,
    FIRST_NAME TEXT,
    LAST_NAME TEXT,
    NAME TEXT,
    EMAIL TEXT,
    PHONE TEXT,
    TITLE TEXT,
    FOREIGN KEY(ACCOUNT_ID) REFERENCES ACCOUNT(ID)
  );

  CREATE TABLE EVENT (
    ID TEXT PRIMARY KEY,
    ACCOUNT_ID TEXT,
    SUBJECT TEXT,
    START_DATE_TIME TEXT,
    END_DATE_TIME TEXT,
    DESCRIPTION TEXT,
    FOREIGN KEY(ACCOUNT_ID) REFERENCES ACCOUNT(ID)
  );

  CREATE TABLE EMAIL_MESSAGE (
    ID TEXT PRIMARY KEY,
    SUBJECT TEXT,
    TEXT_BODY TEXT,
    FROM_ADDRESS TEXT,
    TO_ADDRESS TEXT,
    MESSAGE_DATE TEXT,
    RELATED_TO_ID TEXT,
    THREAD_IDENTIFIER TEXT,
    REPLY_TO_EMAIL_MESSAGE_ID TEXT,
    FOREIGN KEY(RELATED_TO_ID) REFERENCES OPPORTUNITY(ID)
  );

  CREATE TABLE EMAIL_MESSAGE_RELATION (
    EMAIL_MESSAGE_ID TEXT,
    RELATION_ID TEXT,
    PRIMARY KEY (EMAIL_MESSAGE_ID, RELATION_ID),
    FOREIGN KEY(EMAIL_MESSAGE_ID) REFERENCES EMAIL_MESSAGE(ID),
    FOREIGN KEY(RELATION_ID) REFERENCES CONTACT(ID)
  );
`);

console.log("Tables created successfully. Seeding data...");

// Insert User
const insertUser = db.prepare(`
  INSERT INTO USER (ID, NAME, USERNAME, EMAIL)
  VALUES (?, ?, ?, ?)
`);
insertUser.run("u1", "Sarah Jenkins", "sarah.jenkins@industrialcorp.com", "sarah.jenkins@industrialcorp.com");

// Insert Accounts
const insertAccount = db.prepare(`
  INSERT INTO ACCOUNT (ID, NAME, TYPE, WEBSITE, INDUSTRY, PHONE, OWNER_ID)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
insertAccount.run("ac1", "Express Logistics", "Customer - Direct", "www.expresslogistics.com", "Transportation", "555-0199", "u1");
insertAccount.run("ac2", "Acme Corporation", "Customer - Channel", "www.acme.com", "Manufacturing", "555-0210", "u1");
insertAccount.run("ac3", "Global Retailers", "Prospect", "www.globalretailers.net", "Retail", "555-0344", "u1");

// Insert Opportunities
const insertOpp = db.prepare(`
  INSERT INTO OPPORTUNITY (ID, NAME, ACCOUNT_ID, STAGE_NAME, AMOUNT, CLOSE_DATE, IS_CLOSED, IS_WON)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
// Express Logistics opportunities
insertOpp.run("op1", "Express Logistics Fleet Upgrade", "ac1", "Closed Won", 150000, "2026-03-15", 1, 1);
insertOpp.run("op2", "Express Logistics Software License", "ac1", "Prospecting", 45000, "2026-09-30", 0, 0);
// Acme opportunities
insertOpp.run("op3", "Acme Production Line Upgrade", "ac2", "Qualification", 250000, "2026-11-15", 0, 0);

// Insert Contacts
const insertContact = db.prepare(`
  INSERT INTO CONTACT (ID, ACCOUNT_ID, FIRST_NAME, LAST_NAME, NAME, EMAIL, PHONE, TITLE)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertContact.run("c1", "ac1", "John", "Doe", "John Doe", "john.doe@expresslogistics.com", "555-0191", "VP of Operations");
insertContact.run("c2", "ac1", "Jane", "Smith", "Jane Smith", "jane.smith@expresslogistics.com", "555-0192", "Procurement Manager");
insertContact.run("c3", "ac2", "Alice", "Brown", "Alice Brown", "alice.brown@acme.com", "555-0211", "Director of IT");

// Insert Events
const insertEvent = db.prepare(`
  INSERT INTO EVENT (ID, ACCOUNT_ID, SUBJECT, START_DATE_TIME, END_DATE_TIME, DESCRIPTION)
  VALUES (?, ?, ?, ?, ?, ?)
`);
// End dates formatted similar to Fivetran: "YYYY-MM-DDTHH:MM:SS-00:00"
const futureDate1 = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 19) + "-00:00"; // 2 days in future
const futureDate1End = new Date(Date.now() + 86400000 * 2 + 3600000).toISOString().slice(0, 19) + "-00:00";
const futureDate2 = new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 19) + "-00:00"; // 5 days in future
const futureDate2End = new Date(Date.now() + 86400000 * 5 + 3600000).toISOString().slice(0, 19) + "-00:00";

insertEvent.run("ev1", "ac1", "Fleet Upgrade Requirements Alignment", futureDate1, futureDate1End, "Sync on specific vehicle tracking requirements.");
insertEvent.run("ev2", "ac1", "Executive Strategy Demo", futureDate2, futureDate2End, "Final pricing walk-through with key executives.");

// Insert Email Messages
const insertEmail = db.prepare(`
  INSERT INTO EMAIL_MESSAGE (ID, SUBJECT, TEXT_BODY, FROM_ADDRESS, TO_ADDRESS, MESSAGE_DATE, RELATED_TO_ID, THREAD_IDENTIFIER, REPLY_TO_EMAIL_MESSAGE_ID)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
// Emails for Express Logistics Fleet Upgrade (op1 - Closed Won)
insertEmail.run("em1", "Initial Fleet Upgrade Inquiry", "Hi Sarah, we are interested in upgrading our logistics tracking fleet hardware. Can you provide pricing details?", "john.doe@expresslogistics.com", "sarah.jenkins@industrialcorp.com", "2026-02-01T10:00:00Z", "op1", "thread_1", null);
insertEmail.run("em2", "Re: Initial Fleet Upgrade Inquiry", "Hi John, absolutely! I've attached our hardware options and value sheet. Let's hop on a call this Thursday.", "sarah.jenkins@industrialcorp.com", "john.doe@expresslogistics.com", "2026-02-02T09:30:00Z", "op1", "thread_1", "em1");
insertEmail.run("em3", "Fleet Upgrade - Pricing Objections", "Hi Sarah, the hardware quote looks a bit high, specifically the cost per unit of the smart telematics hub. Can we look into custom volume discounts?", "john.doe@expresslogistics.com", "sarah.jenkins@industrialcorp.com", "2026-02-15T15:20:00Z", "op1", "thread_1", "em2");
insertEmail.run("em4", "Re: Fleet Upgrade - Pricing Objections", "Hi John, I discussed with our VP of Sales and we can offer an additional 8% discount on orders exceeding 50 units. Does that meet your target budget?", "sarah.jenkins@industrialcorp.com", "john.doe@expresslogistics.com", "2026-02-16T11:00:00Z", "op1", "thread_1", "em3");

// Emails for Express Logistics Software License (op2 - Open)
insertEmail.run("em5", "Discussion on Logistics Portal License", "Hello Sarah, can you share documentation for your smart routing platform? We are considering a software rollout this Fall.", "jane.smith@expresslogistics.com", "sarah.jenkins@industrialcorp.com", "2026-06-10T14:00:00Z", "op2", "thread_2", null);
insertEmail.run("em6", "Re: Discussion on Logistics Portal License", "Hi Jane, happy to share our routing APIs documentation and portal access guide. I've set up a login credentials sheet for your trial sandbox.", "sarah.jenkins@industrialcorp.com", "jane.smith@expresslogistics.com", "2026-06-11T16:15:00Z", "op2", "thread_2", "em5");

// Insert Email Message Relations
const insertRelation = db.prepare(`
  INSERT INTO EMAIL_MESSAGE_RELATION (EMAIL_MESSAGE_ID, RELATION_ID)
  VALUES (?, ?)
`);
insertRelation.run("em1", "c1");
insertRelation.run("em2", "c1");
insertRelation.run("em3", "c1");
insertRelation.run("em4", "c1");
insertRelation.run("em5", "c2");
insertRelation.run("em6", "c2");

console.log("Database seeded successfully!");
db.close();
