// Domain type stubs — expanded per feature as contracts are confirmed with backend.

export interface CustomerFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

// Segment rule AST — mirrors backend Pydantic model (FRONTEND_SPEC §5.2)
export type SegmentOperator = "AND" | "OR";

// Comparators mirror backend WHITELIST in crm_api/services/segment_compiler.py exactly.
export type Comparator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in_list"
  | "is_set"
  | "is_not_set"
  | "older_than_days"
  | "within_days";

// Fields allowed by the backend whitelist.
export const SEGMENT_FIELDS = [
  "total_spend",
  "order_count",
  "city",
  "email",
  "last_order_at",
  "created_at",
] as const;
export type SegmentField = (typeof SEGMENT_FIELDS)[number];

// Per-field allowed comparators — mirrors backend WHITELIST. The builder must only
// offer these combos; anything else makes /preview and /segments return 422.
export const FIELD_COMPARATORS: Record<SegmentField, Comparator[]> = {
  total_spend: ["eq", "gt", "gte", "lt", "lte"],
  order_count: ["eq", "gt", "gte", "lt", "lte"],
  city: ["eq", "neq", "in_list"],
  email: ["is_set", "is_not_set"],
  last_order_at: ["older_than_days", "within_days", "is_not_set"],
  created_at: ["older_than_days", "within_days"],
};

export interface SegmentRule {
  id: string;
  field: string;
  comparator: Comparator;
  // number (numeric cmps), string (city eq/neq), string[] (in_list),
  // positive int days (older_than_days/within_days); set/unset take no value
  value?: string | number | boolean | string[] | null;
}

export interface SegmentGroup {
  id: string;
  operator: SegmentOperator;
  children: Array<SegmentRule | SegmentGroup>;
}

export type SegmentAST = SegmentGroup;

// Channel
export type Channel = "whatsapp" | "sms" | "email";

// Campaign status — matches backend CHECK constraint (models.py Campaign).
export type CampaignStatus =
  | "draft"
  | "dispatching"
  | "active"
  | "completed";
