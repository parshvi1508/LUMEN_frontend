// Mirrors crm_api/schemas/scores.py.

export interface Reason {
  feature: string;
  impact: number;
  direction: string;
}

export interface Decision {
  customer_id: string;
  name: string;
  reactivation_probability: number;
  expected_value: number;
  value_tier: "low" | "mid" | "high";
  recency_days: number | null;
  recommended_action: string;
  reasons: Reason[];
}

export interface PortfolioSummary {
  customers_scored: number;
  portfolio_expected_value: number;
  reactivation_opportunity_high_tier: number;
  revenue_at_risk: number;
  revenue_leakage: number;
  lapsed_count: number;
  avg_expected_value: number;
  tier_counts: Record<string, number>;
}

export interface CampaignPnl {
  campaign_id: string;
  contacted: number;
  cost: number;
  attributed_revenue: number;
  profit: number;
  roi: number;
}
