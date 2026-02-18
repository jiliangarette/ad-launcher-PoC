import { Router } from "express";
import { InsightsManager } from "../../src/insights";

export function insightRoutes(insights: InsightsManager): Router {
  const router = Router();

  router.get("/account", async (_req, res) => {
    try {
      const data = await insights.getAccountInsights(
        "impressions,clicks,spend",
        "last_30d"
      );
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.response?.data?.error?.message || err.message });
    }
  });

  return router;
}
