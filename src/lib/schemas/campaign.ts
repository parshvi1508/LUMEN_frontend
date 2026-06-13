import { z } from "zod";
import type { Channel } from "@/lib/schemas/types";

// POST /api/v1/campaigns  (request)
export const CampaignCreateSchema = z.object({
  name: z.string().min(1),
  segment_id: z.string(),
  channel: z.enum(["whatsapp", "sms", "email"]),
  message_template: z.string().min(1),
});
export type CampaignCreate = z.infer<typeof CampaignCreateSchema>;

// --- responses ---

export const CampaignOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment_id: z.string().nullable(),
  channel: z.string().nullable(),
  message_template: z.string(),
  status: z.string().nullable(),
  audience_size: z.number().int().nullable(),
  created_at: z.string(),
  dispatched_at: z.string().nullable(),
});
export type CampaignOut = z.infer<typeof CampaignOutSchema>;

export const FunnelStepSchema = z.object({
  status: z.string(),
  rank: z.number().int(),
  count: z.number().int(),
});
export type FunnelStep = z.infer<typeof FunnelStepSchema>;

export const CampaignStatsSchema = z.object({
  campaign_id: z.string(),
  campaign_status: z.string().nullable(),
  audience_size: z.number().int().nullable(),
  total: z.number().int(),
  funnel: z.array(FunnelStepSchema),
  failed: z.number().int(),
  failure_rate: z.number(),
  converted: z.number().int(),
  dispatched_at: z.string().nullable(),
});
export type CampaignStats = z.infer<typeof CampaignStatsSchema>;

// re-export Channel for convenience at call sites
export type { Channel };
