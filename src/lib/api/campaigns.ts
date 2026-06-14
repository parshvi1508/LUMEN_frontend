import { apiGet, apiPost } from "./client";
import type {
  CampaignCreate,
  CampaignOut,
  CampaignStats,
} from "@/lib/schemas/campaign";

// GET /api/v1/campaigns - all campaigns, newest first
export async function getCampaigns(): Promise<CampaignOut[]> {
  return apiGet<CampaignOut[]>("/api/v1/campaigns");
}

// POST /api/v1/campaigns - create draft (201)
export async function createCampaign(
  body: CampaignCreate,
): Promise<CampaignOut> {
  return apiPost<CampaignOut>("/api/v1/campaigns", body);
}

// POST /api/v1/campaigns/{id}/dispatch - resolve audience -> batch send
export async function dispatchCampaign(id: string): Promise<CampaignOut> {
  return apiPost<CampaignOut>(`/api/v1/campaigns/${id}/dispatch`, {});
}

// GET /api/v1/campaigns/{id}
export async function getCampaign(id: string): Promise<CampaignOut> {
  return apiGet<CampaignOut>(`/api/v1/campaigns/${id}`);
}

// GET /api/v1/campaigns/{id}/stats - funnel + failure + conversion counts
export async function getCampaignStats(id: string): Promise<CampaignStats> {
  return apiGet<CampaignStats>(`/api/v1/campaigns/${id}/stats`);
}
