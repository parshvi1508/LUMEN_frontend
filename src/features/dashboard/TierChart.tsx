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
  vip: "var(--chart-5)", // violet - matches the VIP badge
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
          <defs>
            {data.map((d) => (
              <linearGradient
                key={d.tier}
                id={`bar-${d.tier}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={TIER_FILL[d.tier]} stopOpacity={0.95} />
                <stop offset="100%" stopColor={TIER_FILL[d.tier]} stopOpacity={0.45} />
              </linearGradient>
            ))}
          </defs>
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
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
            {data.map((d) => (
              <Cell key={d.tier} fill={`url(#bar-${d.tier})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
