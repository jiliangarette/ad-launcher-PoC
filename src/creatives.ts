import { MetaClient } from "./meta-client";
import {
  AdCreative,
  CreateAdCreativeParams,
  MetaApiResponse,
  MetaApiCreateResponse,
} from "./types";

export class CreativeManager {
  private client: MetaClient;

  constructor(client: MetaClient) {
    this.client = client;
  }

  async create(params: CreateAdCreativeParams): Promise<string> {
    const data = {
      name: params.name,
      object_story_spec: JSON.stringify(params.object_story_spec),
    };

    const result = await this.client.post<MetaApiCreateResponse>(
      `/${this.client.adAccountId}/adcreatives`,
      data
    );

    console.log(`Creative created: ${result.id}`);
    return result.id;
  }

  async list(): Promise<AdCreative[]> {
    const result = await this.client.get<MetaApiResponse<AdCreative>>(
      `/${this.client.adAccountId}/adcreatives`,
      { fields: "id,name,title,body,image_url,object_story_spec" }
    );

    return result.data || [];
  }

  async get(creativeId: string): Promise<AdCreative> {
    return this.client.get<AdCreative>(`/${creativeId}`, {
      fields: "id,name,title,body,image_url,object_story_spec",
    });
  }
}
