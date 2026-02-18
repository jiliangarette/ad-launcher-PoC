import dotenv from "dotenv";
import { MetaConfig } from "./types";

dotenv.config();

export function loadConfig(): MetaConfig {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const apiVersion = process.env.META_API_VERSION || "v21.0";
  const pageId = process.env.META_PAGE_ID;

  if (!accessToken) {
    console.error("ERROR: META_ACCESS_TOKEN is not set in .env");
    console.error("Get your token from: https://developers.facebook.com/tools/explorer/");
    process.exit(1);
  }

  if (!adAccountId) {
    console.error("ERROR: META_AD_ACCOUNT_ID is not set in .env");
    console.error("Format: act_XXXXXXXXX (find it in Meta Ads Manager → Settings)");
    process.exit(1);
  }

  if (!adAccountId.startsWith("act_")) {
    console.error("ERROR: META_AD_ACCOUNT_ID must start with 'act_'");
    process.exit(1);
  }

  if (!pageId) {
    console.error("ERROR: META_PAGE_ID is not set in .env");
    process.exit(1);
  }

  return { accessToken, adAccountId, apiVersion, pageId };
}
