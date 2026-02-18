import axios, { AxiosInstance, AxiosError } from "axios";
import { MetaConfig, MetaApiResponse } from "./types";

export class MetaClient {
  private client: AxiosInstance;
  private accessToken: string;
  public adAccountId: string;

  constructor(config: MetaConfig) {
    this.accessToken = config.accessToken;
    this.adAccountId = config.adAccountId;

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${config.apiVersion}`,
      timeout: 30000,
    });
  }

  async get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.client.get(endpoint, {
        params: { ...params, access_token: this.accessToken },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<MetaApiResponse>);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, data: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.client.post(endpoint, null, {
        params: { ...data, access_token: this.accessToken },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<MetaApiResponse>);
      throw error;
    }
  }

  async delete(endpoint: string): Promise<any> {
    try {
      const response = await this.client.delete(endpoint, {
        params: { access_token: this.accessToken },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<MetaApiResponse>);
      throw error;
    }
  }

  private handleError(error: AxiosError<MetaApiResponse>): void {
    if (error.response?.data?.error) {
      const metaError = error.response.data.error;
      console.error(`\nMeta API Error [${metaError.code}]: ${metaError.message}`);
      console.error(`Type: ${metaError.type}`);
      console.error(`Trace ID: ${metaError.fbtrace_id}`);

      if (metaError.code === 190) {
        console.error("\nYour access token has expired. Get a new one from:");
        console.error("https://developers.facebook.com/tools/explorer/");
      }
      if (metaError.code === 17) {
        console.error("\nRate limit hit. Wait a moment and try again.");
      }
    } else {
      console.error(`\nNetwork Error: ${error.message}`);
    }
  }
}
