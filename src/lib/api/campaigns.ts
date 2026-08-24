import { apiDelete, apiGet, apiPost } from "./client";
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

// POST /api/v1/campaigns/{id}/approve - mark an AI proposal approved (bodyless).
// Used only when the human accepts the proposal unchanged.
export async function approveCampaign(id: string): Promise<CampaignOut> {
  return apiPost<CampaignOut>(`/api/v1/campaigns/${id}/approve`, {});
}

// POST /api/v1/campaigns/{id}/execute - dispatch an approved proposal (bodyless).
// Runs the backend's real proposal lifecycle; requires approve first (409 otherwise).
export async function executeCampaign(id: string): Promise<CampaignOut> {
  return apiPost<CampaignOut>(`/api/v1/campaigns/${id}/execute`, {});
}

// GET /api/v1/campaigns/{id}
export async function getCampaign(id: string): Promise<CampaignOut> {
  return apiGet<CampaignOut>(`/api/v1/campaigns/${id}`);
}

// DELETE /api/v1/campaigns/{id} - hard delete campaign + cascade
export async function deleteCampaign(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/campaigns/${id}`);
}

// GET /api/v1/campaigns/{id}/stats - funnel + failure + conversion counts
export async function getCampaignStats(id: string): Promise<CampaignStats> {
  return apiGet<CampaignStats>(`/api/v1/campaigns/${id}/stats`);
}

// GET /api/v1/campaigns/{id}/pnl - profit and loss breakdown
export async function getCampaignPnl(
  id: string,
): Promise<import("@/lib/api/insights").CampaignPnl> {
  return apiGet<import("@/lib/api/insights").CampaignPnl>(
    `/api/v1/campaigns/${id}/pnl`,
  );
}
