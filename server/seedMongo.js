import { MongoClient } from "mongodb";
import "dotenv/config";

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "salesforce";

console.log("Connecting to MongoDB at:", mongoUri);
const client = new MongoClient(mongoUri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(dbName);

    // Drop collections if they exist
    const collectionsToDrop = ["users", "accounts", "opportunities", "contacts", "events", "emails", "email_relations"];
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
    
    for (const collName of collectionsToDrop) {
      if (existingCollections.includes(collName)) {
        await db.collection(collName).drop();
        console.log(`Dropped collection: ${collName}`);
      }
    }

    // 1. Seed Users
    const users = [
      { ID: "u1", NAME: "Sarah Jenkins", USERNAME: "sarah.jenkins@industrialcorp.com", EMAIL: "sarah.jenkins@industrialcorp.com" }
    ];
    await db.collection("users").insertMany(users);
    console.log("Seeded users collection.");

    // 2. Seed Accounts
    const accounts = [
      { ID: "ac1", NAME: "Express Logistics", TYPE: "Customer - Direct", WEBSITE: "www.expresslogistics.com", INDUSTRY: "Transportation", PHONE: "555-0199", OWNER_ID: "u1" },
      { ID: "ac2", NAME: "Acme Corporation", TYPE: "Customer - Channel", WEBSITE: "www.acme.com", INDUSTRY: "Manufacturing", PHONE: "555-0210", OWNER_ID: "u1" },
      { ID: "ac3", NAME: "Global Retailers", TYPE: "Prospect", WEBSITE: "www.globalretailers.net", INDUSTRY: "Retail", PHONE: "555-0344", OWNER_ID: "u1" }
    ];
    await db.collection("accounts").insertMany(accounts);
    console.log("Seeded accounts collection.");

    // 3. Seed Opportunities
    const opportunities = [
      { ID: "op1", NAME: "Express Logistics Fleet Upgrade", ACCOUNT_ID: "ac1", STAGE_NAME: "Closed Won", AMOUNT: 150000, CLOSE_DATE: "2026-03-15", IS_CLOSED: 1, IS_WON: 1 },
      { ID: "op2", NAME: "Express Logistics Software License", ACCOUNT_ID: "ac1", STAGE_NAME: "Prospecting", AMOUNT: 45000, CLOSE_DATE: "2026-09-30", IS_CLOSED: 0, IS_WON: 0 },
      { ID: "op3", NAME: "Acme Production Line Upgrade", ACCOUNT_ID: "ac2", STAGE_NAME: "Qualification", AMOUNT: 250000, CLOSE_DATE: "2026-11-15", IS_CLOSED: 0, IS_WON: 0 }
    ];
    await db.collection("opportunities").insertMany(opportunities);
    console.log("Seeded opportunities collection.");

    // 4. Seed Contacts
    const contacts = [
      { ID: "c1", ACCOUNT_ID: "ac1", FIRST_NAME: "John", LAST_NAME: "Doe", NAME: "John Doe", EMAIL: "john.doe@expresslogistics.com", PHONE: "555-0191", TITLE: "VP of Operations" },
      { ID: "c2", ACCOUNT_ID: "ac1", FIRST_NAME: "Jane", LAST_NAME: "Smith", NAME: "Jane Smith", EMAIL: "jane.smith@expresslogistics.com", PHONE: "555-0192", TITLE: "Procurement Manager" },
      { ID: "c3", ACCOUNT_ID: "ac2", FIRST_NAME: "Alice", LAST_NAME: "Brown", NAME: "Alice Brown", EMAIL: "alice.brown@acme.com", PHONE: "555-0211", TITLE: "Director of IT" }
    ];
    await db.collection("contacts").insertMany(contacts);
    console.log("Seeded contacts collection.");

    // 5. Seed Events
    const futureDate1 = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 19) + "-00:00";
    const futureDate1End = new Date(Date.now() + 86400000 * 2 + 3600000).toISOString().slice(0, 19) + "-00:00";
    const futureDate2 = new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 19) + "-00:00";
    const futureDate2End = new Date(Date.now() + 86400000 * 5 + 3600000).toISOString().slice(0, 19) + "-00:00";
    const futureDate3 = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 19) + "-00:00";
    const futureDate3End = new Date(Date.now() + 86400000 * 7 + 3600000).toISOString().slice(0, 19) + "-00:00";
    const futureDate4 = new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 19) + "-00:00";
    const futureDate4End = new Date(Date.now() + 86400000 * 10 + 3600000).toISOString().slice(0, 19) + "-00:00";

    const events = [
      { ID: "ev1", ACCOUNT_ID: "ac1", SUBJECT: "Fleet Upgrade Requirements Alignment", START_DATE_TIME: futureDate1, END_DATE_TIME: futureDate1End, DESCRIPTION: "Sync on specific vehicle tracking requirements." },
      { ID: "ev2", ACCOUNT_ID: "ac1", SUBJECT: "Executive Strategy Demo", START_DATE_TIME: futureDate2, END_DATE_TIME: futureDate2End, DESCRIPTION: "Final pricing walk-through with key executives." },
      { ID: "ev3", ACCOUNT_ID: "ac2", SUBJECT: "Acme IT Team Technical Demo", START_DATE_TIME: futureDate3, END_DATE_TIME: futureDate3End, DESCRIPTION: "Live demo of the production line automation system for Acme IT team, covering SAP integration and real-time dashboards." },
      { ID: "ev4", ACCOUNT_ID: "ac2", SUBJECT: "Acme Proof-of-Concept Kickoff", START_DATE_TIME: futureDate4, END_DATE_TIME: futureDate4End, DESCRIPTION: "Kickoff session to begin the 3-week proof-of-concept SAP integration for Acme Corporation's production line upgrade." }
    ];
    await db.collection("events").insertMany(events);
    console.log("Seeded events collection.");

    // 6. Seed Emails
    const emails = [
      { ID: "em1", SUBJECT: "Initial Fleet Upgrade Inquiry", TEXT_BODY: "Hi Sarah, we are interested in upgrading our logistics tracking fleet hardware. Can you provide pricing details?", FROM_ADDRESS: "john.doe@expresslogistics.com", TO_ADDRESS: "sarah.jenkins@industrialcorp.com", MESSAGE_DATE: "2026-02-01T10:00:00Z", RELATED_TO_ID: "op1", THREAD_IDENTIFIER: "thread_1", REPLY_TO_EMAIL_MESSAGE_ID: null },
      { ID: "em2", SUBJECT: "Re: Initial Fleet Upgrade Inquiry", TEXT_BODY: "Hi John, absolutely! I've attached our hardware options and value sheet. Let's hop on a call this Thursday.", FROM_ADDRESS: "sarah.jenkins@industrialcorp.com", TO_ADDRESS: "john.doe@expresslogistics.com", MESSAGE_DATE: "2026-02-02T09:30:00Z", RELATED_TO_ID: "op1", THREAD_IDENTIFIER: "thread_1", REPLY_TO_EMAIL_MESSAGE_ID: "em1" },
      { ID: "em3", SUBJECT: "Fleet Upgrade - Pricing Objections", TEXT_BODY: "Hi Sarah, the hardware quote looks a bit high, specifically the cost per unit of the smart telematics hub. Can we look into custom volume discounts?", FROM_ADDRESS: "john.doe@expresslogistics.com", TO_ADDRESS: "sarah.jenkins@industrialcorp.com", MESSAGE_DATE: "2026-02-15T15:20:00Z", RELATED_TO_ID: "op1", THREAD_IDENTIFIER: "thread_1", REPLY_TO_EMAIL_MESSAGE_ID: "em2" },
      { ID: "em4", SUBJECT: "Re: Fleet Upgrade - Pricing Objections", TEXT_BODY: "Hi John, I discussed with our VP of Sales and we can offer an additional 8% discount on orders exceeding 50 units. Does that meet your target budget?", FROM_ADDRESS: "sarah.jenkins@industrialcorp.com", TO_ADDRESS: "john.doe@expresslogistics.com", MESSAGE_DATE: "2026-02-16T11:00:00Z", RELATED_TO_ID: "op1", THREAD_IDENTIFIER: "thread_1", REPLY_TO_EMAIL_MESSAGE_ID: "em3" },
      { ID: "em5", SUBJECT: "Discussion on Logistics Portal License", TEXT_BODY: "Hello Sarah, can you share documentation for your smart routing platform? We are considering a software rollout this Fall.", FROM_ADDRESS: "jane.smith@expresslogistics.com", TO_ADDRESS: "sarah.jenkins@industrialcorp.com", MESSAGE_DATE: "2026-06-10T14:00:00Z", RELATED_TO_ID: "op2", THREAD_IDENTIFIER: "thread_2", REPLY_TO_EMAIL_MESSAGE_ID: null },
      { ID: "em6", SUBJECT: "Re: Discussion on Logistics Portal License", TEXT_BODY: "Hi Jane, happy to share our routing APIs documentation and portal access guide. I've set up a login credentials sheet for your trial sandbox.", FROM_ADDRESS: "sarah.jenkins@industrialcorp.com", TO_ADDRESS: "jane.smith@expresslogistics.com", MESSAGE_DATE: "2026-06-11T16:15:00Z", RELATED_TO_ID: "op2", THREAD_IDENTIFIER: "thread_2", REPLY_TO_EMAIL_MESSAGE_ID: "em5" },
      { ID: "em7", SUBJECT: "Acme Production Line Upgrade - Initial Discussion", TEXT_BODY: "Hi Sarah, we are evaluating vendors for a major production line automation upgrade. Our budget is $250,000 and we need the system operational by Q4. Can IndustrialCorp support this timeline and scope?", FROM_ADDRESS: "alice.brown@acme.com", TO_ADDRESS: "sarah.jenkins@industrialcorp.com", MESSAGE_DATE: "2026-04-10T09:00:00Z", RELATED_TO_ID: "op3", THREAD_IDENTIFIER: "thread_3", REPLY_TO_EMAIL_MESSAGE_ID: null },
      { ID: "em8", SUBJECT: "Re: Acme Production Line Upgrade - Initial Discussion", TEXT_BODY: "Hi Alice, great to hear from you! Yes, IndustrialCorp has successfully delivered similar production automation projects for clients in manufacturing. I'd love to schedule a discovery call to understand your specific requirements and confirm the timeline. Can we meet next week?", FROM_ADDRESS: "sarah.jenkins@industrialcorp.com", TO_ADDRESS: "alice.brown@acme.com", MESSAGE_DATE: "2026-04-11T10:30:00Z", RELATED_TO_ID: "op3", THREAD_IDENTIFIER: "thread_3", REPLY_TO_EMAIL_MESSAGE_ID: "em7" },
      { ID: "em9", SUBJECT: "Acme Production Line Upgrade - Technical Requirements", TEXT_BODY: "Hi Sarah, following our call, here are the technical specs: we need integration with our existing SAP ERP system, real-time monitoring dashboards, and at least 99.5% uptime SLA. Our IT team is concerned about data security during integration. Can you provide a security compliance overview?", FROM_ADDRESS: "alice.brown@acme.com", TO_ADDRESS: "sarah.jenkins@industrialcorp.com", MESSAGE_DATE: "2026-05-05T14:00:00Z", RELATED_TO_ID: "op3", THREAD_IDENTIFIER: "thread_3", REPLY_TO_EMAIL_MESSAGE_ID: "em8" },
      { ID: "em10", SUBJECT: "Re: Acme Production Line Upgrade - Technical Requirements", TEXT_BODY: "Hi Alice, I've attached our ISO 27001 compliance documentation and the SAP integration architecture diagram. Our engineering team can run a proof-of-concept integration in 3 weeks. Regarding uptime, we offer a 99.9% SLA with 24/7 monitoring support included. Let's align on next steps — I'd like to propose a formal demo session with your IT team.", FROM_ADDRESS: "sarah.jenkins@industrialcorp.com", TO_ADDRESS: "alice.brown@acme.com", MESSAGE_DATE: "2026-05-07T11:00:00Z", RELATED_TO_ID: "op3", THREAD_IDENTIFIER: "thread_3", REPLY_TO_EMAIL_MESSAGE_ID: "em9" }
    ];
    await db.collection("emails").insertMany(emails);
    console.log("Seeded emails collection.");

    // 7. Seed Email Relations
    const emailRelations = [
      { EMAIL_MESSAGE_ID: "em1", RELATION_ID: "c1" },
      { EMAIL_MESSAGE_ID: "em2", RELATION_ID: "c1" },
      { EMAIL_MESSAGE_ID: "em3", RELATION_ID: "c1" },
      { EMAIL_MESSAGE_ID: "em4", RELATION_ID: "c1" },
      { EMAIL_MESSAGE_ID: "em5", RELATION_ID: "c2" },
      { EMAIL_MESSAGE_ID: "em6", RELATION_ID: "c2" },
      { EMAIL_MESSAGE_ID: "em7", RELATION_ID: "c3" },
      { EMAIL_MESSAGE_ID: "em8", RELATION_ID: "c3" },
      { EMAIL_MESSAGE_ID: "em9", RELATION_ID: "c3" },
      { EMAIL_MESSAGE_ID: "em10", RELATION_ID: "c3" }
    ];
    await db.collection("email_relations").insertMany(emailRelations);
    console.log("Seeded email_relations collection.");

    console.log("MongoDB seeded successfully!");
  } catch (err) {
    console.error("Error seeding MongoDB:", err);
  } finally {
    await client.close();
  }
}

run();
