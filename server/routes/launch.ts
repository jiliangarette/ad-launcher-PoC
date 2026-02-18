import { Router } from "express";
import { CampaignManager } from "../../src/campaigns";
import { AdSetManager } from "../../src/adsets";
import { CreativeManager } from "../../src/creatives";
import { AdManager } from "../../src/ads";
import type { CampaignObjective } from "../../src/types";

interface LaunchDeps {
  campaigns: CampaignManager;
  adSets: AdSetManager;
  creatives: CreativeManager;
  ads: AdManager;
  pageId: string;
}

function extractError(err: any): string {
  const metaErr = err.response?.data?.error;
  if (metaErr) {
    return metaErr.error_user_msg || metaErr.message || err.message;
  }
  return err.message;
}

export function launchRoutes(deps: LaunchDeps): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    const {
      // Campaign
      campaignName, objective, specialAdCategories, bidStrategy,
      // Ad Set
      dailyBudget, optimizationGoal, billingEvent, destinationType, bidAmount,
      startDate, endDate,
      // Targeting
      country, ageMin, ageMax, gender,
      // Creative
      headline, body, imageUrl, link, ctaType, linkDescription,
    } = req.body;

    if (!headline || !body || !link || !dailyBudget) {
      return res.status(400).json({ error: "headline, body, link, and dailyBudget are required" });
    }

    const timestamp = new Date().toISOString().slice(0, 16);
    const budgetCents = String(Math.round(Number(dailyBudget) * 100));
    const bidCents = bidAmount ? String(Math.round(Number(bidAmount))) : "200";
    let step = "";

    // Resolve special_ad_categories
    const categories = specialAdCategories && specialAdCategories !== "NONE"
      ? [specialAdCategories]
      : ["NONE"];

    try {
      // Step 1: Create Campaign
      step = "Campaign";
      const campaignId = await deps.campaigns.create({
        name: campaignName || `Ad Launch ${timestamp}`,
        objective: (objective || "OUTCOME_TRAFFIC") as CampaignObjective,
        status: "PAUSED",
        special_ad_categories: categories,
        bid_strategy: bidStrategy || undefined,
      });

      // Step 2: Create Ad Set
      step = "Ad Set";
      const adSetId = await deps.adSets.create({
        name: `AdSet ${timestamp}`,
        campaign_id: campaignId,
        daily_budget: budgetCents,
        targeting: {
          geo_locations: { countries: [country || "US"] },
          age_min: ageMin || 25,
          age_max: ageMax || 55,
          ...(gender && gender !== "all" ? { genders: gender === "male" ? [1] : [2] } : {}),
          targeting_automation: { advantage_audience: 0 },
        },
        optimization_goal: optimizationGoal || "LINK_CLICKS",
        billing_event: billingEvent || "IMPRESSIONS",
        destination_type: destinationType || "WEBSITE",
        bid_amount: bidCents,
        status: "PAUSED",
        start_time: startDate || undefined,
        end_time: endDate || undefined,
      });

      // Step 3: Create Ad Creative
      step = "Creative";
      const creativeId = await deps.creatives.create({
        name: `Creative ${timestamp}`,
        object_story_spec: {
          page_id: deps.pageId,
          link_data: {
            message: body,
            link,
            name: headline,
            description: linkDescription || undefined,
            picture: imageUrl || undefined,
            ...(ctaType ? { call_to_action: { type: ctaType, value: { link } } } : {}),
          },
        },
      });

      // Step 4: Create Ad
      step = "Ad";
      const adId = await deps.ads.create({
        name: `Ad ${timestamp}`,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: "PAUSED",
      });

      if (!adId) {
        throw new Error("Ad creation returned no ID — check Ads Manager for account authentication prompts");
      }

      res.json({ campaignId, adSetId, creativeId, adId });
    } catch (err: any) {
      const metaErr = err.response?.data?.error;
      console.error(`Launch failed at step [${step}]:`, JSON.stringify(metaErr, null, 2) || err.message);
      res.status(500).json({
        error: `${step}: ${extractError(err)}`,
      });
    }
  });

  return router;
}
