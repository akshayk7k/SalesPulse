import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "salesforce";

console.log("Connecting to MongoDB...");
const mongoClient = new MongoClient(mongoUri);
await mongoClient.connect();
export const mongoDb = mongoClient.db(dbName);
console.log(`Connected to MongoDB database: ${dbName}`);
import AccountRouter from "./routes/account.js";
import NeedsAndRiskRouter from "./routes/needsAndRisks.js";
import RecentUpdates from "./routes/recentUpdates.js";
import ContactSummaryRouter from "./routes/contactSummary.js";
import NextStepsRouter from "./routes/nextSteps.js";
import RecentActivitiesRouter from "./routes/recentActivities.js";
import SearchRouter from "./routes/search.js";
import StrategyRouter from "./routes/strategy.js";
import IngestionRouter from "./routes/ingestion.js";
import { runAutomaticSync } from "./ingestion/salesforce.js";
import { createClient } from "redis";

const port = process.env.PORT || 3002 ;

let redisClient;
if (process.env.REDISHOST && process.env.REDISHOST !== "your_redis_host_here") {
  let host = process.env.REDISHOST;
  let port = 13618;
  if (host.includes(":")) {
    const parts = host.split(":");
    host = parts[0];
    port = parseInt(parts[1], 10);
  }
  redisClient = createClient({
    username: "default",
    password: process.env.REDISPASS,
    socket: {
      host,
      port,
    },
  });
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  try {
    await redisClient.connect();
    console.log("Connected to Redis Cloud.");
  } catch (err) {
    console.error("Failed to connect to Redis. Falling back to in-memory cache.", err.message);
    redisClient = null;
  }
} else {
  console.log("Redis host not configured. Using in-memory cache fallback.");
}

if (!redisClient) {
  const memoryCache = new Map();
  redisClient = {
    get: async (key) => memoryCache.get(key) || null,
    set: async (key, value) => {
      memoryCache.set(key, value);
      return "OK";
    }
  };
}

const app = express();
app.use(cors());
app.options('*', cors())
app.use(express.json());
app.use(AccountRouter);
app.use(NeedsAndRiskRouter);
app.use(RecentUpdates);
app.use(ContactSummaryRouter);
app.use(NextStepsRouter);
app.use(RecentActivitiesRouter);
app.use(SearchRouter);
app.use(StrategyRouter);
app.use(IngestionRouter);

// SQLite DB is exported as sqliteDb above

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Trigger background sync on startup
  console.log("🚀 Starting automatic Salesforce sync on server startup...");
  runAutomaticSync()
    .then((result) => console.log("✅ Startup Salesforce sync complete:", result.summary))
    .catch((err) => console.warn("⚠️ Startup Salesforce sync skipped/failed:", err.message));

  // Set up recurring sync every 1 hour
  setInterval(() => {
    console.log("🔄 Starting scheduled Salesforce sync...");
    runAutomaticSync()
      .then((result) => console.log("✅ Scheduled Salesforce sync complete:", result.summary))
      .catch((err) => console.warn("⚠️ Scheduled Salesforce sync skipped/failed:", err.message));
  }, 60 * 60 * 1000);
});

export { redisClient };
