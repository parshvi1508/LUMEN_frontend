import { apiGet } from "./client";
import type {
  CampaignPnl,
  Decision,
  PortfolioSummary,
} from "@/lib/schemas/insights";

// Re-exported so callers can import the contract types from the api module too.
export type { CampaignPnl, Decision, PortfolioSummary } from "@/lib/schemas/insights";

// GET /api/v1/insights/portfolio - tenant money summary
export async function getPortfolio(): Promise<PortfolioSummary> {
  return apiGet<PortfolioSummary>("/api/v1/insights/portfolio");
}

// GET /api/v1/insights/decisions - ranked per-customer decision layer
export async function getDecisions(
  tier?: string,
  limit?: number,
): Promise<Decision[]> {
  const query = new URLSearchParams();
  if (tier) query.set("tier", tier);
  if (limit) query.set("limit", String(limit));
  const qs = query.toString();
  return apiGet<Decision[]>(
    `/api/v1/insights/decisions${qs ? `?${qs}` : ""}`,
  );
}

// GET /api/v1/campaigns/{id}/pnl - real attributed-revenue P&L
export async function getCampaignPnl(id: string): Promise<CampaignPnl> {
  return apiGet<CampaignPnl>(`/api/v1/campaigns/${id}/pnl`);
}
