import { Router } from "express";
import { CampaignManager } from "../../src/campaigns";
import { AdSetManager } from "../../src/adsets";
import { AdManager } from "../../src/ads";
import { InsightsManager } from "../../src/insights";

interface CampaignDeps {
  campaigns: CampaignManager;
  adSets: AdSetManager;
  ads: AdManager;
  insights: InsightsManager;
}

function extractError(err: any): string {
  return err.response?.data?.error?.message || err.message;
}

export function campaignRoutes(deps: CampaignDeps): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const list = await deps.campaigns.list();
      const includeInsights = req.query.include === "insights";

      if (!includeInsights) {
        return res.json(list);
      }

      // Enrich each campaign with insights (impressions, clicks, spend)
      const enriched = await Promise.all(
        list.map(async (campaign) => {
          try {
            const insights = await deps.insights.getCampaignInsights(
              campaign.id,
              "impressions,clicks,spend"
            );
            const data = insights[0] || {};
            return {
              ...campaign,
              impressions: data.impressions,
              clicks: data.clicks,
              spend: data.spend,
            };
          } catch {
            // If insights fail for a campaign, return without them
            return campaign;
          }
        })
      );

      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ error: extractError(err) });
    }
  });

  router.post("/", async (_req, res) => {
    try {
      const name = `Test Campaign ${new Date().toISOString().slice(0, 16)}`;
      const id = await deps.campaigns.create({
        name,
        objective: "OUTCOME_LEADS",
        status: "PAUSED",
        special_ad_categories: ["NONE"],
      });
      res.json({ id, name });
    } catch (err: any) {
      res.status(500).json({ error: extractError(err) });
    }
  });

  router.post("/:id/pause", async (req, res) => {
    try {
      const campaignId = req.params.id;

      // Pause campaign
      await deps.campaigns.pause(campaignId);

      // Cascade: pause all ad sets and ads under this campaign
      const adSets = await deps.adSets.list(campaignId);
      for (const adSet of adSets) {
        if (adSet.status === "ACTIVE") {
          await deps.adSets.pause(adSet.id);
        }
        const ads = await deps.ads.list(adSet.id);
        for (const ad of ads) {
          if (ad.status === "ACTIVE") {
            await deps.ads.pause(ad.id);
          }
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: extractError(err) });
    }
  });

  router.post("/:id/activate", async (req, res) => {
    try {
      const campaignId = req.params.id;

      // Activate campaign
      await deps.campaigns.activate(campaignId);

      // Cascade: activate all ad sets and ads under this campaign
      const adSets = await deps.adSets.list(campaignId);
      for (const adSet of adSets) {
        if (adSet.status === "PAUSED") {
          await deps.adSets.activate(adSet.id);
        }
        const ads = await deps.ads.list(adSet.id);
        for (const ad of ads) {
          if (ad.status === "PAUSED") {
            await deps.ads.activate(ad.id);
          }
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: extractError(err) });
    }
  });

  return router;
}
