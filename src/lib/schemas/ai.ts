import { z } from "zod";
import { RuleImpactSchema } from "@/lib/schemas/segment";

// --- shared ---
export const MessageVariantSchema = z.object({
  variant: z.string(),
  message: z.string(),
  tone: z.string(),
  reasoning: z.string(),
});
export type MessageVariant = z.infer<typeof MessageVariantSchema>;

// POST /api/v1/ai/nl-to-segment
export const NLToSegmentRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
});
export type NLToSegmentRequest = z.infer<typeof NLToSegmentRequestSchema>;

export const NLToSegmentResponseSchema = z.object({
  definition: z.record(z.string(), z.unknown()),
  rationale: z.string(),
  count: z.number().int(),
  per_rule_impact: z.array(RuleImpactSchema),
  warnings: z.array(z.string()),
});
export type NLToSegmentResponse = z.infer<typeof NLToSegmentResponseSchema>;

// POST /api/v1/ai/draft-messages
export const DraftMessagesRequestSchema = z.object({
  campaign_intent: z.string().min(1).max(2000),
  segment_id: z.string(),
  channel: z.enum(["whatsapp", "sms", "email"]),
});
export type DraftMessagesRequest = z.infer<typeof DraftMessagesRequestSchema>;

export const DraftMessagesResponseSchema = z.object({
  segment_id: z.string(),
  channel: z.string(),
  variants: z.array(MessageVariantSchema),
});
export type DraftMessagesResponse = z.infer<typeof DraftMessagesResponseSchema>;

// GET /api/v1/ai/campaigns/{id}/insight
export const InsightFactSchema = z.object({
  label: z.string(),
  value: z.number().int(),
});
export type InsightFact = z.infer<typeof InsightFactSchema>;

export const InsightResponseSchema = z.object({
  campaign_id: z.string(),
  narrative: z.string(),
  facts: z.array(InsightFactSchema),
});
export type InsightResponse = z.infer<typeof InsightResponseSchema>;

// POST /api/v1/ai/propose-campaign
export const ProposeCampaignRequestSchema = z.object({
  goal: z.string().min(1).max(2000),
});
export type ProposeCampaignRequest = z.infer<
  typeof ProposeCampaignRequestSchema
>;

export const ProposeCampaignResponseSchema = z.object({
  campaign_id: z.string().nullable(),
  proposal_state: z.string(),
  goal: z.string(),
  segment_definition: z.record(z.string(), z.unknown()),
  segment_rationale: z.string(),
  audience_size: z.number().int().nullable(),
  recommended_channel: z.string(),
  channel_reasoning: z.string(),
  variants: z.array(MessageVariantSchema),
});
export type ProposeCampaignResponse = z.infer<
  typeof ProposeCampaignResponseSchema
>;
