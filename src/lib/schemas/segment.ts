import { z } from "zod";

// Wire-format rule AST - mirrors backend crm_api/schemas/segments.py exactly.
// NOTE: this is the over-the-wire shape ({op, rules} / {field, cmp, value}).
// The UI builder type (SegmentAST in lib/schemas/types.ts) uses a different,
// id-bearing shape and must be mapped to this before hitting the API.
export const RuleLeafSchema = z.object({
  field: z.string(),
  cmp: z.string(),
  // backend RuleLeaf.value is Any (default None); set/unset comparators omit it
  value: z.unknown().optional(),
});
export type RuleLeaf = z.infer<typeof RuleLeafSchema>;

// Recursive group - zod v4 getter pattern (avoids z.lazy deep-instantiation issues)
export const RuleGroupSchema = z.object({
  op: z.enum(["AND", "OR"]),
  get rules() {
    return z.array(z.union([RuleLeafSchema, RuleGroupSchema])).min(1);
  },
});
export type RuleGroup = z.infer<typeof RuleGroupSchema>;

// POST /api/v1/segments/preview  (request)
export const PreviewRequestSchema = z.object({
  definition: RuleGroupSchema,
});
export type PreviewRequest = z.infer<typeof PreviewRequestSchema>;

// POST /api/v1/segments  (request)
export const SegmentCreateSchema = z.object({
  name: z.string().min(1),
  definition: RuleGroupSchema,
  source: z.enum(["manual", "ai"]).default("manual"),
  ai_rationale: z.string().nullable().optional(),
});
export type SegmentCreate = z.infer<typeof SegmentCreateSchema>;

// --- responses ---

export const CustomerSampleSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  city: z.string().nullable(),
  total_spend: z.coerce.number(), // backend NUMERIC -> may arrive as string or number
  last_order_at: z.string().nullable(),
});
export type CustomerSample = z.infer<typeof CustomerSampleSchema>;

export const RuleImpactSchema = z.object({
  rule: z.string(),
  count: z.number().int(),
});
export type RuleImpact = z.infer<typeof RuleImpactSchema>;

export const PreviewResponseSchema = z.object({
  count: z.number().int(),
  sample: z.array(CustomerSampleSchema),
  per_rule_impact: z.array(RuleImpactSchema),
});
export type PreviewResponse = z.infer<typeof PreviewResponseSchema>;

export const SegmentOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  definition: z.record(z.string(), z.unknown()),
  source: z.string().nullable(),
  ai_rationale: z.string().nullable(),
  created_at: z.string(),
});
export type SegmentOut = z.infer<typeof SegmentOutSchema>;

export const SegmentListSchema = z.array(SegmentOutSchema);
