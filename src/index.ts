import { Command } from "commander";
import { loadConfig } from "./config";
import { MetaClient } from "./meta-client";
import { CampaignManager } from "./campaigns";
import { AdSetManager } from "./adsets";
import { AdManager } from "./ads";
import { InsightsManager } from "./insights";
import { CampaignObjective } from "./types";

const config = loadConfig();
const client = new MetaClient(config);
const campaigns = new CampaignManager(client);
const adsets = new AdSetManager(client);
const ads = new AdManager(client);
const insights = new InsightsManager(client);

const program = new Command();

program
  .name("ads-launcher")
  .description("Launch and manage Meta (Facebook) ads from your terminal")
  .version("0.1.0");

// ─── Campaigns ───────────────────────────────────────────

const campaignCmd = program.command("campaign").description("Manage campaigns");

campaignCmd
  .command("list")
  .description("List all campaigns")
  .action(async () => {
    const list = await campaigns.list();
    if (list.length === 0) {
      console.log("No campaigns found.");
      return;
    }
    console.log("\nCampaigns:");
    console.log("─".repeat(60));
    for (const c of list) {
      console.log(`  ${c.id} | ${c.name} | ${c.status} | ${c.objective}`);
    }
  });

campaignCmd
  .command("create")
  .description("Create a new campaign")
  .requiredOption("--name <name>", "Campaign name")
  .requiredOption("--objective <objective>", "Campaign objective (OUTCOME_TRAFFIC, OUTCOME_SALES, etc.)")
  .option("--status <status>", "Campaign status", "PAUSED")
  .action(async (opts) => {
    await campaigns.create({
      name: opts.name,
      objective: opts.objective as CampaignObjective,
      status: opts.status,
      special_ad_categories: [],
    });
  });

campaignCmd
  .command("pause <id>")
  .description("Pause a campaign")
  .action(async (id: string) => {
    await campaigns.pause(id);
  });

campaignCmd
  .command("activate <id>")
  .description("Activate a campaign")
  .action(async (id: string) => {
    await campaigns.activate(id);
  });

campaignCmd
  .command("delete <id>")
  .description("Delete a campaign")
  .action(async (id: string) => {
    await campaigns.remove(id);
  });

// ─── Ad Sets ─────────────────────────────────────────────

const adsetCmd = program.command("adset").description("Manage ad sets");

adsetCmd
  .command("list")
  .description("List all ad sets")
  .option("--campaign <id>", "Filter by campaign ID")
  .action(async (opts) => {
    const list = await adsets.list(opts.campaign);
    if (list.length === 0) {
      console.log("No ad sets found.");
      return;
    }
    console.log("\nAd Sets:");
    console.log("─".repeat(60));
    for (const a of list) {
      console.log(`  ${a.id} | ${a.name} | ${a.status} | budget: ${a.daily_budget || "N/A"}`);
    }
  });

adsetCmd
  .command("create")
  .description("Create a new ad set")
  .requiredOption("--name <name>", "Ad set name")
  .requiredOption("--campaign <id>", "Campaign ID")
  .requiredOption("--budget <cents>", "Daily budget in cents (100 = $1)")
  .option("--countries <codes>", "Comma-separated country codes", "US")
  .option("--age-min <age>", "Minimum age", "18")
  .option("--age-max <age>", "Maximum age", "65")
  .option("--status <status>", "Status", "PAUSED")
  .action(async (opts) => {
    await adsets.create({
      name: opts.name,
      campaign_id: opts.campaign,
      daily_budget: opts.budget,
      status: opts.status,
      targeting: {
        geo_locations: {
          countries: opts.countries.split(","),
        },
        age_min: parseInt(opts.ageMin),
        age_max: parseInt(opts.ageMax),
      },
    });
  });

adsetCmd
  .command("pause <id>")
  .description("Pause an ad set")
  .action(async (id: string) => {
    await adsets.pause(id);
  });

adsetCmd
  .command("activate <id>")
  .description("Activate an ad set")
  .action(async (id: string) => {
    await adsets.activate(id);
  });

// ─── Ads ─────────────────────────────────────────────────

const adCmd = program.command("ad").description("Manage ads");

adCmd
  .command("list")
  .description("List all ads")
  .option("--adset <id>", "Filter by ad set ID")
  .action(async (opts) => {
    const list = await ads.list(opts.adset);
    if (list.length === 0) {
      console.log("No ads found.");
      return;
    }
    console.log("\nAds:");
    console.log("─".repeat(60));
    for (const a of list) {
      console.log(`  ${a.id} | ${a.name} | ${a.status}`);
    }
  });

adCmd
  .command("create")
  .description("Create a new ad")
  .requiredOption("--name <name>", "Ad name")
  .requiredOption("--adset <id>", "Ad set ID")
  .requiredOption("--creative <id>", "Creative ID")
  .option("--status <status>", "Status", "PAUSED")
  .action(async (opts) => {
    await ads.create({
      name: opts.name,
      adset_id: opts.adset,
      creative: { creative_id: opts.creative },
      status: opts.status,
    });
  });

adCmd
  .command("pause <id>")
  .description("Pause an ad")
  .action(async (id: string) => {
    await ads.pause(id);
  });

adCmd
  .command("activate <id>")
  .description("Activate an ad")
  .action(async (id: string) => {
    await ads.activate(id);
  });

// ─── Insights ────────────────────────────────────────────

const insightCmd = program.command("insights").description("View performance stats");

insightCmd
  .command("campaign <id>")
  .description("Get campaign insights")
  .option("--fields <fields>", "Comma-separated fields", "impressions,clicks,spend,ctr")
  .option("--period <period>", "Date preset", "last_7d")
  .action(async (id: string, opts) => {
    const data = await insights.getCampaignInsights(id, opts.fields, opts.period);
    if (data.length === 0) {
      console.log("No insights data available.");
      return;
    }
    console.log("\nCampaign Insights:");
    console.log("─".repeat(60));
    console.log(JSON.stringify(data, null, 2));
  });

insightCmd
  .command("account")
  .description("Get account-level insights")
  .option("--fields <fields>", "Comma-separated fields", "impressions,clicks,spend,ctr")
  .option("--period <period>", "Date preset", "last_7d")
  .action(async (opts) => {
    const data = await insights.getAccountInsights(opts.fields, opts.period);
    if (data.length === 0) {
      console.log("No insights data available.");
      return;
    }
    console.log("\nAccount Insights:");
    console.log("─".repeat(60));
    console.log(JSON.stringify(data, null, 2));
  });

program.parse();
