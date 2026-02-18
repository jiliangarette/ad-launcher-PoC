import { MetaClient } from "./meta-client";
import {
  AdSet,
  CreateAdSetParams,
  MetaApiResponse,
  MetaApiCreateResponse,
  CampaignStatus,
} from "./types";

export class AdSetManager {
  private client: MetaClient;

  constructor(client: MetaClient) {
    this.client = client;
  }

  async create(params: CreateAdSetParams): Promise<string> {
    const data: Record<string, any> = {
      name: params.name,
      campaign_id: params.campaign_id,
      status: params.status || "PAUSED",
      targeting: JSON.stringify(params.targeting),
      billing_event: params.billing_event || "IMPRESSIONS",
      optimization_goal: params.optimization_goal || "LINK_CLICKS",
    };

    if (params.daily_budget) data.daily_budget = params.daily_budget;
    if (params.lifetime_budget) data.lifetime_budget = params.lifetime_budget;
    if (params.destination_type) data.destination_type = params.destination_type;
    if (params.bid_amount) data.bid_amount = params.bid_amount;
    if (params.start_time) data.start_time = params.start_time;
    if (params.end_time) data.end_time = params.end_time;

    const result = await this.client.post<MetaApiCreateResponse>(
      `/${this.client.adAccountId}/adsets`,
      data
    );

    console.log(`Ad Set created: ${result.id}`);
    return result.id;
  }

  async list(campaignId?: string): Promise<AdSet[]> {
    const endpoint = campaignId
      ? `/${campaignId}/adsets`
      : `/${this.client.adAccountId}/adsets`;

    const result = await this.client.get<MetaApiResponse<AdSet>>(endpoint, {
      fields: "id,name,campaign_id,status,daily_budget,targeting,start_time,end_time",
    });

    return result.data || [];
  }

  async get(adSetId: string): Promise<AdSet> {
    return this.client.get<AdSet>(`/${adSetId}`, {
      fields: "id,name,campaign_id,status,daily_budget,lifetime_budget,targeting,start_time,end_time",
    });
  }

  async updateStatus(adSetId: string, status: CampaignStatus): Promise<void> {
    await this.client.post(`/${adSetId}`, { status });
    console.log(`Ad Set ${adSetId} → ${status}`);
  }

  async pause(adSetId: string): Promise<void> {
    await this.updateStatus(adSetId, "PAUSED");
  }

  async activate(adSetId: string): Promise<void> {
    await this.updateStatus(adSetId, "ACTIVE");
  }
}
