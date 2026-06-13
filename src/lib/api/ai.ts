import { apiGet, apiPost } from "./client";
import type {
  DraftMessagesRequest,
  DraftMessagesResponse,
  InsightResponse,
  NLToSegmentRequest,
  NLToSegmentResponse,
  ProposeCampaignRequest,
  ProposeCampaignResponse,
} from "@/lib/schemas/ai";

// POST /api/v1/ai/nl-to-segment — prompt -> {definition, rationale, count, per_rule_impact, warnings}
export async function nlToSegment(
  body: NLToSegmentRequest,
): Promise<NLToSegmentResponse> {
  return apiPost<NLToSegmentResponse>("/api/v1/ai/nl-to-segment", body);
}

// POST /api/v1/ai/draft-messages — intent+segment+channel -> {variants[]}
export async function draftMessages(
  body: DraftMessagesRequest,
): Promise<DraftMessagesResponse> {
  return apiPost<DraftMessagesResponse>("/api/v1/ai/draft-messages", body);
}

// POST /api/v1/ai/propose-campaign — goal -> full proposal (agentic flow)
export async function proposeCampaign(
  body: ProposeCampaignRequest,
): Promise<ProposeCampaignResponse> {
  return apiPost<ProposeCampaignResponse>("/api/v1/ai/propose-campaign", body);
}

// GET /api/v1/ai/campaigns/{id}/insight — grounded narrative + cited facts
export async function getCampaignInsight(
  campaignId: string,
): Promise<InsightResponse> {
  return apiGet<InsightResponse>(
    `/api/v1/ai/campaigns/${campaignId}/insight`,
  );
}
