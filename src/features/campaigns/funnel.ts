// Funnel stage model. Ranks mirror backend receipt_service.STATUS_RANKS.
// "failed" (rank 15) is NOT a funnel stage - it's a terminal branch shown
// separately. Reach is cumulative by rank so it is monotonic and immune to
// out-of-order / duplicate events: a "clicked" that arrives before "delivered"
// still counts toward every lower stage via rank >=.
import type { FunnelStep } from "@/lib/schemas/campaign";

export interface FunnelStage {
  key: string;
  label: string;
  rank: number;
  fill: string;
}

export const FUNNEL_STAGES: FunnelStage[] = [
  { key: "queued", label: "Queued", rank: 0, fill: "var(--muted-foreground)" },
  { key: "sent", label: "Sent", rank: 10, fill: "var(--chart-1)" },
  { key: "delivered", label: "Delivered", rank: 20, fill: "var(--chart-2)" },
  { key: "opened", label: "Opened", rank: 30, fill: "var(--chart-3)" },
  { key: "read", label: "Read", rank: 40, fill: "var(--chart-4)" },
  { key: "clicked", label: "Clicked", rank: 50, fill: "var(--chart-5)" },
  { key: "converted", label: "Converted", rank: 60, fill: "var(--primary)" },
];

export interface ReachRow extends FunnelStage {
  reach: number; // customers who got at least this far
}

// Cumulative reach: for each stage, sum counts of all comms whose current
// status_rank >= the stage rank. Monotonic non-increasing down the funnel.
export function computeReach(funnel: FunnelStep[]): ReachRow[] {
  return FUNNEL_STAGES.map((stage) => ({
    ...stage,
    reach: funnel.reduce(
      (n, row) => n + (row.rank >= stage.rank ? row.count : 0),
      0,
    ),
  }));
}
