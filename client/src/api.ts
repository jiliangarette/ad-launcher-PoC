const BASE = "/api";

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
}

export interface AccountStats {
  impressions?: string;
  clicks?: string;
  spend?: string;
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${BASE}/campaigns?include=insights`);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function createTestCampaign(): Promise<{ id: string; name: string }> {
  const res = await fetch(`${BASE}/campaigns`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create campaign");
  return res.json();
}

export async function pauseCampaign(id: string): Promise<void> {
  const res = await fetch(`${BASE}/campaigns/${id}/pause`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to pause campaign");
}

export async function activateCampaign(id: string): Promise<void> {
  const res = await fetch(`${BASE}/campaigns/${id}/activate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to activate campaign");
}

export async function fetchAccountStats(): Promise<AccountStats | null> {
  const res = await fetch(`${BASE}/insights/account`);
  if (!res.ok) throw new Error("Failed to fetch insights");
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

export interface LaunchAdParams {
  headline: string;
  body: string;
  imageUrl: string;
  link: string;
  country: string;
  ageMin: number;
  ageMax: number;
  dailyBudget: number;
  campaignName?: string;
  ctaType?: string;
  linkDescription?: string;
  gender?: string;
}

export interface LaunchAdResult {
  campaignId: string;
  adSetId: string;
  creativeId: string;
  adId: string;
}

export async function launchAd(params: LaunchAdParams): Promise<LaunchAdResult> {
  const res = await fetch(`${BASE}/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to launch ad");
  }
  return res.json();
}
