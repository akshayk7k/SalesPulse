import { Router } from "express";
import { redisClient } from "../index.js";

const router = Router();

const mockUpdates = {
  "express logistics": [
    {
      title: "Express Logistics Rolls Out Green Fleet Initiative",
      description: "Express Logistics announces plans to transition 40% of its regional delivery fleet to zero-emission electric vehicles by the end of the fiscal year.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop",
      url: "https://www.expresslogistics.com/news/green-fleet"
    },
    {
      title: "Express Logistics partners with IndustrialCorp for Smart Telematics integration",
      description: "A new collaboration focuses on embedding real-time GPS tracking and fuel-efficiency monitoring systems across all transit corridors.",
      image: "https://images.unsplash.com/photo-1516575360438-15161dba78c1?w=500&auto=format&fit=crop",
      url: "https://www.expresslogistics.com/news/telematics-partnership"
    }
  ],
  "acme corporation": [
    {
      title: "Acme Corp Expands Midwest Smart Assembly Hub",
      description: "Acme Corporation opens a new state-of-the-art facility featuring smart factory robotics and automated inventory tracking.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop",
      url: "https://www.acme.com/press/midwest-expansion"
    },
    {
      title: "Acme Corp Announces Full-Scale IT Infrastructure Upgrade",
      description: "The multi-million dollar modernization initiative aims to move enterprise resource planning systems to a secure, private cloud network.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop",
      url: "https://www.acme.com/press/infrastructure-cloud"
    }
  ],
  "global retailers": [
    {
      title: "Global Retailers Posts Record Q1 Digital Sales Growth",
      description: "A surge in online channel optimization drives retail margins higher, showing a 15% increase in year-over-year e-commerce activity.",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format&fit=crop",
      url: "https://www.globalretailers.net/news/q1-report"
    }
  ]
};

const defaultUpdates = [
  {
    title: "Market Trends: AI-Driven Automation Sweeps Logistics",
    description: "Recent analyst reports indicate massive investments in supply chain operations, optimizing routing and reducing carbon footprints.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&auto=format&fit=crop",
    url: "https://www.industryupdates.com/trends/automation"
  }
];

router.post("/recentUpdates", async (req, res) => {
  try {
    const accountName = req.body.accountDetails.Name;
    const cacheKey = `analytics:recentUpdates:${accountName}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }

    // Match account name case-insensitively
    const cleanName = accountName.toLowerCase().trim();
    let updates = defaultUpdates;
    
    for (const key of Object.keys(mockUpdates)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        updates = mockUpdates[key];
        break;
      }
    }

    await redisClient.set(
      cacheKey,
      JSON.stringify({ updates }),
      {
        EX: 60 * 60 * 24 * 1000,
      }
    );

    return res.json({ updates });
  } catch (err) {
    console.error("Error getting recent updates", err);
    return res.status(500).json({ error: "Failed to get recent updates" });
  }
});

export default router;
