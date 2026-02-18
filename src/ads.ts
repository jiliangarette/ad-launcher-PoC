import { MetaClient } from "./meta-client";
import {
  Ad,
  CreateAdParams,
  MetaApiResponse,
  MetaApiCreateResponse,
  CampaignStatus,
} from "./types";

export class AdManager {
  private client: MetaClient;

  constructor(client: MetaClient) {
    this.client = client;
  }

  async create(params: CreateAdParams): Promise<string> {
    const data = {
      name: params.name,
      adset_id: params.adset_id,
      creative: JSON.stringify(params.creative),
      status: params.status || "PAUSED",
    };

    const result = await this.client.post<MetaApiCreateResponse>(
      `/${this.client.adAccountId}/ads`,
      data
    );

    console.log(`Ad created: ${result.id}`);
    return result.id;
  }

  async list(adSetId?: string): Promise<Ad[]> {
    const endpoint = adSetId
      ? `/${adSetId}/ads`
      : `/${this.client.adAccountId}/ads`;

    const result = await this.client.get<MetaApiResponse<Ad>>(endpoint, {
      fields: "id,name,adset_id,status,creative{id,name}",
    });

    return result.data || [];
  }

  async get(adId: string): Promise<Ad> {
    return this.client.get<Ad>(`/${adId}`, {
      fields: "id,name,adset_id,status,creative{id,name}",
    });
  }

  async updateStatus(adId: string, status: CampaignStatus): Promise<void> {
    await this.client.post(`/${adId}`, { status });
    console.log(`Ad ${adId} → ${status}`);
  }

  async pause(adId: string): Promise<void> {
    await this.updateStatus(adId, "PAUSED");
  }

  async activate(adId: string): Promise<void> {
    await this.updateStatus(adId, "ACTIVE");
  }
}
