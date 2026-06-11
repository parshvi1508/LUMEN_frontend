import type { Customer } from "@/lib/schemas/customer";

// Customer lifecycle tier — derived from recency + spend, never stored.
// VIP and At-risk are the two that must visually pop: one is your best,
// the other is the one slipping away (the actionable one).
export type CustomerTier = "vip" | "active" | "at-risk" | "churned";

// Thresholds (₹, days). Tuned for D2C cadence; single source of truth.
export const AT_RISK_DAYS = 60;
export const CHURNED_DAYS = 120;
export const VIP_SPEND = 50_000;

// Lower rank = higher priority → drives default visual rank-ordering.
export const TIER_RANK: Record<CustomerTier, number> = {
  vip: 0,
  "at-risk": 1,
  active: 2,
  churned: 3,
};

export interface TierMeta {
  label: string;
  /** badge classes built from the semantic token layer */
  badge: string;
  /** left accent rail color for rank-ordered rows */
  rail: string;
  description: string;
}

export const TIER_META: Record<CustomerTier, TierMeta> = {
  vip: {
    label: "VIP",
    badge: "bg-vip text-vip-foreground border-vip-border",
    rail: "bg-vip-foreground",
    description: "High spend, recently active",
  },
  active: {
    label: "Active",
    badge: "bg-success text-success-foreground border-success-border",
    rail: "bg-success-foreground/60",
    description: "Ordered within the last 60 days",
  },
  "at-risk": {
    label: "At-risk",
    badge: "bg-warning text-warning-foreground border-warning-border",
    rail: "bg-warning-foreground",
    description: `No order in ${AT_RISK_DAYS}–${CHURNED_DAYS} days`,
  },
  churned: {
    label: "Churned",
    badge: "bg-muted text-muted-foreground border-border",
    rail: "bg-border",
    description: `No order in over ${CHURNED_DAYS} days`,
  },
};

export function daysSince(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export function deriveTier(c: Pick<Customer, "total_spend" | "order_count" | "last_order_at">): CustomerTier {
  // Never ordered, or last order older than the churn window → churned.
  const recency = c.last_order_at ? daysSince(c.last_order_at) : Infinity;
  if (recency >= CHURNED_DAYS) return "churned";
  if (recency >= AT_RISK_DAYS) return "at-risk";
  // Recent + high lifetime value → VIP.
  if (c.total_spend >= VIP_SPEND) return "vip";
  return "active";
}
