"use client";

import {
  Funnel,
  FunnelChart as ReFunnelChart,
  LabelList,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReachRow } from "./funnel";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { label: string; value: number } }>;
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface-3 px-3 py-1.5 text-xs shadow-overlay">
      <span className="font-medium text-foreground">{p.label}</span>
      <span className="text-muted-foreground">
        {" "}
        · {p.value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export function FunnelChart({ rows }: { rows: ReachRow[] }) {
  const data = rows.map((r) => ({ label: r.label, value: r.reach, fill: r.fill }));

  return (
    <div className="h-56 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <ReFunnelChart>
          <Tooltip content={<ChartTooltip />} />
          <Funnel dataKey="value" data={data} isAnimationActive>
            <LabelList
              position="right"
              dataKey="label"
              stroke="none"
              fill="var(--foreground)"
              fontSize={12}
            />
            {data.map((d) => (
              <Cell key={d.label} fill={d.fill} />
            ))}
          </Funnel>
        </ReFunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
