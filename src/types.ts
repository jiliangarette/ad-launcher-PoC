// Meta Graph API Types

export interface MetaConfig {
  accessToken: string;
  adAccountId: string;
  apiVersion: string;
  pageId: string;
}

// Campaign objectives (Meta API v21.0+)
export type CampaignObjective =
  | "OUTCOME_AWARENESS"
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS"
  | "OUTCOME_APP_PROMOTION"
  | "OUTCOME_SALES";

export type CampaignStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
  updated_time?: string;
}

export interface CreateCampaignParams {
  name: string;
  objective: CampaignObjective;
  status?: CampaignStatus;
  special_ad_categories?: string[];
  bid_strategy?: string;
}

export interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: CampaignStatus;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting?: Targeting;
  start_time?: string;
  end_time?: string;
  bid_amount?: number;
  billing_event?: string;
  optimization_goal?: string;
}

export interface CreateAdSetParams {
  name: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting: Targeting;
  status?: CampaignStatus;
  billing_event?: string;
  optimization_goal?: string;
  destination_type?: string;
  bid_amount?: string;
  start_time?: string;
  end_time?: string;
}

export interface Targeting {
  geo_locations?: {
    countries?: string[];
    cities?: Array<{ key: string }>;
  };
  age_min?: number;
  age_max?: number;
  genders?: number[]; // 1=male, 2=female
  interests?: Array<{ id: string; name: string }>;
  targeting_automation?: {
    advantage_audience?: number; // 0=off, 1=on
  };
}

export interface AdCreative {
  id: string;
  name: string;
  title?: string;
  body?: string;
  image_hash?: string;
  image_url?: string;
  link_url?: string;
  call_to_action_type?: string;
}

export interface CreateAdCreativeParams {
  name: string;
  object_story_spec: {
    page_id: string;
    link_data?: {
      link: string;
      message: string;
      name?: string;
      description?: string;
      picture?: string;
      image_hash?: string;
      call_to_action?: {
        type: string;
        value?: { link: string };
      };
    };
  };
}

export interface Ad {
  id: string;
  name: string;
  adset_id: string;
  creative: { creative_id: string };
  status: CampaignStatus;
}

export interface CreateAdParams {
  name: string;
  adset_id: string;
  creative: { creative_id: string };
  status?: CampaignStatus;
}

export interface InsightField {
  impressions?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  reach?: string;
  frequency?: string;
  actions?: Array<{ action_type: string; value: string }>;
}

export interface MetaApiResponse<T = any> {
  data?: T[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface MetaApiCreateResponse {
  id: string;
}
