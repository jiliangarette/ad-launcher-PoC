import { MetaClient } from "./meta-client";
import {
  Campaign,
  CreateCampaignParams,
  MetaApiResponse,
  MetaApiCreateResponse,
  CampaignStatus,
} from "./types";

export class CampaignManager {
  private client: MetaClient;

  constructor(client: MetaClient) {
    this.client = client;
  }

  async create(params: CreateCampaignParams): Promise<string> {
    const data: Record<string, any> = {
      name: params.name,
      objective: params.objective,
      status: params.status || "PAUSED",
      special_ad_categories: JSON.stringify(
        params.special_ad_categories?.length ? params.special_ad_categories : ["NONE"]
      ),
      is_adset_budget_sharing_enabled: false,
    };

    if (params.bid_strategy) data.bid_strategy = params.bid_strategy;

    const result = await this.client.post<MetaApiCreateResponse>(
      `/${this.client.adAccountId}/campaigns`,
      data
    );

    console.log(`Campaign created: ${result.id}`);
    return result.id;
  }

  async list(): Promise<Campaign[]> {
    const result = await this.client.get<MetaApiResponse<Campaign>>(
      `/${this.client.adAccountId}/campaigns`,
      { fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time" }
    );

    return result.data || [];
  }

  async get(campaignId: string): Promise<Campaign> {
    return this.client.get<Campaign>(`/${campaignId}`, {
      fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time",
    });
  }

  async updateStatus(campaignId: string, status: CampaignStatus): Promise<void> {
    await this.client.post(`/${campaignId}`, { status });
    console.log(`Campaign ${campaignId} → ${status}`);
  }

  async pause(campaignId: string): Promise<void> {
    await this.updateStatus(campaignId, "PAUSED");
  }

  async activate(campaignId: string): Promise<void> {
    await this.updateStatus(campaignId, "ACTIVE");
  }

  async remove(campaignId: string): Promise<void> {
    await this.client.delete(`/${campaignId}`);
    console.log(`Campaign ${campaignId} deleted`);
  }
}
