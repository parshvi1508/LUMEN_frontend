// Domain type stubs — expanded per feature as contracts are confirmed with backend.

export interface CustomerFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

// Segment rule AST — mirrors backend Pydantic model (FRONTEND_SPEC §5.2)
export type SegmentOperator = "AND" | "OR";

export type Comparator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "older_than_days"
  | "newer_than_days";

export interface SegmentRule {
  id: string;
  field: string;
  comparator: Comparator;
  value: string | number | boolean;
}

export interface SegmentGroup {
  id: string;
  operator: SegmentOperator;
  children: Array<SegmentRule | SegmentGroup>;
}

export type SegmentAST = SegmentGroup;

// Channel
export type Channel = "whatsapp" | "sms" | "email";

// Campaign status
export type CampaignStatus =
  | "draft"
  | "dispatching"
  | "active"
  | "completed"
  | "failed";
