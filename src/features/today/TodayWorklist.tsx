"use client";

import { useState } from "react";
import { Target, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDecisions } from "@/hooks/useDecisions";
import { formatCurrency } from "@/lib/format";
import type { Decision } from "@/lib/schemas/insights";
import { DecisionDrawer } from "./DecisionDrawer";

export function TodayWorklist() {
  const decisions = useDecisions(undefined, 20);
  const [selected, setSelected] = useState<Decision | null>(null);

  if (decisions.isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger-border bg-danger px-4 py-3 text-sm text-danger-foreground"
      >
        Could not load decisions.{" "}
        <button
          type="button"
          onClick={() => decisions.refetch()}
          className="font-medium underline underline-offset-2 hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface-2 shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Priority worklist
          </h2>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Brain className="size-3" aria-hidden />
            ranked by expected value
          </span>
        </div>

        <ul role="list" className="divide-y divide-border">
          {decisions.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </li>
              ))
            : (decisions.data ?? []).length === 0
              ? (
                <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No scored customers yet. Run the ML pipeline first.
                </li>
              )
              : (decisions.data ?? []).map((d) => (
                <li key={d.customer_id}>
                  <button
                    type="button"
                    onClick={() => setSelected(d)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {d.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {d.name}
                        </p>
                        <TierBadge tier={d.value_tier} />
                        <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-foreground">
                          {formatCurrency(d.expected_value)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {d.recommended_action}
                      </p>
                      {d.reasons.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {d.reasons.slice(0, 3).map((r) => (
                            <span
                              key={r.feature}
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                r.direction === "increases"
                                  ? "bg-success text-success-foreground"
                                  : "bg-danger text-danger-foreground"
                              }`}
                            >
                              {r.feature.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Target className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                </li>
              ))}
        </ul>
      </section>

      <DecisionDrawer
        decision={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    high: "bg-vip text-vip-foreground border-vip-border",
    mid: "bg-info text-info-foreground border-info-border",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${
        styles[tier] ?? styles.low
      }`}
    >
      {tier}
    </span>
  );
}
