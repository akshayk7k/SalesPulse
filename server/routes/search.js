import { Router } from "express";
import { mongoDb } from "../index.js";
import { jaroWinklerSimilarity } from "../utils/jaroWinkler.js";

const router = Router();

router.post("/search", async (req, res) => {
  try {
    const searchQuery = req.body.searchQuery;
    
    // Fetch all accounts to compute similarity locally
    const rows = await mongoDb.collection("accounts").find({}).toArray();

    if (rows && rows.length > 0) {
      const scoredRows = rows.map((row) => {
        const score = jaroWinklerSimilarity(row.NAME, searchQuery);
        return {
          NAME: row.NAME,
          TYPE: row.TYPE,
          WEBSITE: row.WEBSITE,
          SIMILARITY_SCORE: score,
          similarity_score: score
        };
      });

      // Filter and sort by score descending
      const finalData = scoredRows
        .filter((row) => row.SIMILARITY_SCORE > 55)
        .sort((a, b) => b.SIMILARITY_SCORE - a.SIMILARITY_SCORE)
        .slice(0, 3);

      return res.json({ searchResults: finalData });
    } else {
      console.log("Failed to search due to no data found.");
      return res.status(200).json({ error: "No data found" });
    }
  } catch (e) {
    console.error("Failed to search:", e);
    return res.status(200).json({ error: "Failed to search" });
  }
});

export default router;