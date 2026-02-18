import express from "express";
import cors from "cors";
import { loadConfig } from "../src/config";
import { MetaClient } from "../src/meta-client";
import { CampaignManager } from "../src/campaigns";
import { AdSetManager } from "../src/adsets";
import { CreativeManager } from "../src/creatives";
import { AdManager } from "../src/ads";
import { InsightsManager } from "../src/insights";
import { campaignRoutes } from "./routes/campaigns";
import { insightRoutes } from "./routes/insights";
import { launchRoutes } from "./routes/launch";

const config = loadConfig();
const client = new MetaClient(config);
const campaignManager = new CampaignManager(client);
const adSetManager = new AdSetManager(client);
const creativeManager = new CreativeManager(client);
const adManager = new AdManager(client);
const insightsManager = new InsightsManager(client);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/campaigns", campaignRoutes({
  campaigns: campaignManager,
  adSets: adSetManager,
  ads: adManager,
  insights: insightsManager,
}));
app.use("/api/insights", insightRoutes(insightsManager));
app.use("/api/launch", launchRoutes({
  campaigns: campaignManager,
  adSets: adSetManager,
  creatives: creativeManager,
  ads: adManager,
  pageId: config.pageId,
}));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
