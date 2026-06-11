"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TIER_META, TIER_RANK, type CustomerTier } from "@/lib/customer-tier";

interface TierTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { label: string; count: number } }>;
}

// Tier → chart token (the redefined multi-hue palette doing functional work).
const TIER_FILL: Record<CustomerTier, string> = {
  vip: "var(--chart-5)", // violet — matches the VIP badge
  active: "var(--chart-3)", // teal/green
  "at-risk": "var(--chart-2)", // amber
  churned: "var(--muted-foreground)", // neutral, de-emphasized
};

function CustomTooltip({ active, payload }: TierTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface-3 px-3 py-1.5 text-xs shadow-overlay">
      <span className="font-medium text-foreground">{p.label}</span>
      <span className="text-muted-foreground"> · {p.count.toLocaleString("en-IN")}</span>
    </div>
  );
}

export function TierChart({ counts }: { counts: Record<CustomerTier, number> }) {
  const data = (Object.keys(TIER_META) as CustomerTier[])
    .sort((a, b) => TIER_RANK[a] - TIER_RANK[b])
    .map((tier) => ({
      tier,
      label: TIER_META[tier].label,
      count: counts[tier],
    }));

  return (
    <div className="h-44 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            width={32}
          />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {data.map((d) => (
              <Cell key={d.tier} fill={TIER_FILL[d.tier]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
