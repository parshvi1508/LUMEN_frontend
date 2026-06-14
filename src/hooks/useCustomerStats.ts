"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/lib/api/customers";
import { deriveTier, type CustomerTier } from "@/lib/customer-tier";
import type { Customer } from "@/lib/schemas/customer";

// Aggregates are computed from the live customer list - no fabricated numbers.
// We pull a bounded slice; if the base is larger, `sampled` is true so the UI
// can be honest that the figures are from a sample, not the full book.
const STATS_SAMPLE = 500;

export interface CustomerStats {
  total: number;
  sampled: boolean;
  totalSpend: number;
  avgOrderValue: number;
  tierCounts: Record<CustomerTier, number>;
  /** Customers with no order in 60+ days - the win-back pool. */
  dormant60: number;
  /** Most recently added customers (real created_at), newest first. */
  recentlyAdded: Customer[];
}

function computeStats(rows: Customer[], total: number): CustomerStats {
  const tierCounts: Record<CustomerTier, number> = {
    vip: 0,
    active: 0,
    "at-risk": 0,
    churned: 0,
  };
  let totalSpend = 0;
  let totalOrders = 0;

  for (const c of rows) {
    totalSpend += c.total_spend;
    totalOrders += c.order_count;
    tierCounts[deriveTier(c)] += 1;
  }

  const recentlyAdded = [...rows]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 6);

  return {
    total,
    sampled: rows.length < total,
    totalSpend,
    avgOrderValue: totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0,
    tierCounts,
    dormant60: tierCounts["at-risk"] + tierCounts.churned,
    recentlyAdded,
  };
}

export function useCustomerStats() {
  return useQuery({
    queryKey: ["customers", "stats", STATS_SAMPLE],
    queryFn: async () => {
      const res = await getCustomers({ page: 0, pageSize: STATS_SAMPLE });
      return computeStats(res.data, res.total);
    },
    staleTime: 30_000,
  });
}
