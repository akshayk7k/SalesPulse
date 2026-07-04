import { Router } from "express";
import crypto from "crypto";
import { mongoDb } from "../index.js";
import { connectionFromToken, runSyncWithToken } from "../ingestion/salesforce.js";

const router = Router();

const SF_LOGIN_URL = process.env.SF_LOGIN_URL || "https://login.salesforce.com";
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const CALLBACK_URL = "http://localhost:3002/ingestion/callback";

// In-memory PKCE store (single-user local dev)
let pkceStore = null;

// ─── PKCE helpers ─────────────────────────────────────────────────────────────

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /ingestion/authorize
 * Redirects the browser to Salesforce OAuth2 login (with PKCE).
 */
router.get("/ingestion/authorize", (req, res) => {
  if (!SF_CLIENT_ID) {
    return res.status(500).send("<h2>❌ SF_CLIENT_ID not set in .env</h2>");
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  pkceStore = { codeVerifier };

  const params = new URLSearchParams({
    response_type: "code",
    client_id: SF_CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: "api refresh_token offline_access",
  });

  const authUrl = `${SF_LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;
  console.log("🔗 Redirecting to Salesforce OAuth2 (PKCE)...");
  return res.redirect(authUrl);
});

/**
 * GET /ingestion/callback
 * Salesforce redirects here with auth code → exchange for token → sync.
 */
router.get("/ingestion/callback", async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error("❌ SF OAuth error:", error_description);
    return res.status(400).send(`<h2>❌ ${error}: ${error_description}</h2>`);
  }
  if (!code) {
    return res.status(400).send("<h2>❌ No authorization code received.</h2>");
  }
  if (!pkceStore?.codeVerifier) {
    return res.status(400).send("<h2>❌ PKCE verifier missing. Restart the flow.</h2>");
  }

  try {
    // Exchange authorization code for access token
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET || "",
      redirect_uri: CALLBACK_URL,
      code_verifier: pkceStore.codeVerifier,
    });

    const tokenRes = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const tokenData = await tokenRes.json();
    pkceStore = null; // clear after use

    if (tokenData.error) {
      console.error("❌ Token exchange error:", tokenData.error_description);
      return res.status(400).send(`<h2>❌ Token Error: ${tokenData.error_description}</h2>`);
    }

    const { access_token, refresh_token, instance_url } = tokenData;
    console.log(`✅ Token obtained. Instance: ${instance_url}`);

    if (refresh_token) {
      await mongoDb.collection("sync_meta").updateOne(
        { _id: "oauth_credentials" },
        { $set: { refresh_token, instance_url, timestamp: new Date().toISOString() } },
        { upsert: true }
      );
      console.log("💾 Saved Salesforce OAuth2 refresh token to database.");
    }

    // Respond immediately — sync runs in background
    res.send(`
      <html><head><title>Salesforce Sync</title></head>
      <body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#e2e8f0;">
        <h2 style="color:#22d3ee;">✅ Salesforce Connected!</h2>
        <p>Syncing CRM data to MongoDB... Check your server terminal for progress.</p>
        <p><strong>This tab can be closed.</strong></p>
      </body></html>
    `);

    // Run full sync in background
    runSyncWithToken(access_token, instance_url)
      .then((r) => console.log("✅ Sync complete:", r.summary))
      .catch((e) => console.error("❌ Sync failed:", e.message));

  } catch (err) {
    console.error("❌ Token exchange failed:", err.message);
    return res.status(500).send(`<h2>❌ ${err.message}</h2>`);
  }
});

/**
 * POST /ingestion/sync
 * Manual trigger via username/password (when org allows it).
 */
router.post("/ingestion/sync", async (req, res) => {
  try {
    const { runSync } = await import("../ingestion/salesforce.js");
    const result = await runSync();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /ingestion/status
 * Returns last sync timestamp and summary.
 */
router.get("/ingestion/status", async (req, res) => {
  try {
    const meta = await mongoDb.collection("sync_meta").findOne({ _id: "last_sync" });
    if (!meta) return res.json({ synced: false, message: "No sync run yet." });
    return res.json({ synced: true, lastSync: meta.timestamp, method: meta.method, summary: meta.summary });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
