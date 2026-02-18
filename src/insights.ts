import { MetaClient } from "./meta-client";
import { InsightField } from "./types";

const DEFAULT_FIELDS = "impressions,clicks,spend,cpc,cpm,ctr,reach";

export class InsightsManager {
  private client: MetaClient;

  constructor(client: MetaClient) {
    this.client = client;
  }

  async getCampaignInsights(
    campaignId: string,
    fields?: string,
    datePreset?: string
  ): Promise<InsightField[]> {
    const result = await this.client.get(`/${campaignId}/insights`, {
      fields: fields || DEFAULT_FIELDS,
      date_preset: datePreset || "last_7d",
    });

    return result.data || [];
  }

  async getAdSetInsights(
    adSetId: string,
    fields?: string,
    datePreset?: string
  ): Promise<InsightField[]> {
    const result = await this.client.get(`/${adSetId}/insights`, {
      fields: fields || DEFAULT_FIELDS,
      date_preset: datePreset || "last_7d",
    });

    return result.data || [];
  }

  async getAccountInsights(
    fields?: string,
    datePreset?: string
  ): Promise<InsightField[]> {
    const result = await this.client.get(
      `/${this.client.adAccountId}/insights`,
      {
        fields: fields || DEFAULT_FIELDS,
        date_preset: datePreset || "last_7d",
      }
    );

    return result.data || [];
  }
}
