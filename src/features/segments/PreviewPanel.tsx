"use client";

import { Users, Loader2 } from "lucide-react";
import { StatePanel, type StatePanelStatus } from "@/components/ui/StatePanel";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/lib/api";
import type { PreviewResponse } from "@/lib/schemas/segment";
import { prettyRuleLabel } from "./segment-fields";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function PreviewPanel({
  status,
  data,
  error,
  refreshing,
  onRetry,
}: {
  status: StatePanelStatus;
  data?: PreviewResponse;
  error?: ApiError;
  refreshing?: boolean;
  onRetry?: () => void;
}) {
  return (
    <section
      aria-label="Audience preview"
      className="rounded-xl border border-border bg-surface-1 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Audience preview</h2>
        {refreshing && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Refreshing" />
        )}
      </div>

      <StatePanel<PreviewResponse>
        status={status}
        data={data}
        error={error}
        onRetry={onRetry}
        liveRegion
        aria-label="Audience preview result"
        loading={
          <div className="space-y-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        }
        empty={
          <div className="py-6 text-center">
            <p className="text-2xl font-semibold tabular-nums text-foreground">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No customers match these rules. Loosen a condition to widen the audience.
            </p>
          </div>
        }
        errorSlot={(e, retry) => (
          <div role="alert" className="space-y-2 text-sm text-destructive">
            <p>{e.message}</p>
            <button
              type="button"
              onClick={retry}
              className="underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      >
        {(preview) => (
          <div className="space-y-4">
            {/* headline count */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums leading-none text-foreground">
                  {preview.count.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {preview.count === 1 ? "customer" : "customers"} in this segment
                </p>
              </div>
            </div>

            {/* per-rule impact */}
            {preview.per_rule_impact.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Per-rule reach
                </p>
                <ul className="space-y-1">
                  {preview.per_rule_impact.map((impact, i) => (
                    <li
                      key={`${impact.rule}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-md bg-surface-2/60 px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate text-foreground/80">
                        {prettyRuleLabel(impact.rule)}
                      </span>
                      <span className="shrink-0 tabular-nums font-medium text-foreground">
                        {impact.count.toLocaleString("en-IN")} match
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                  Each number is how many customers match that rule on its own — not
                  the marginal effect of removing it.
                </p>
              </div>
            )}

            {/* sample */}
            {preview.sample.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Top {preview.sample.length} by spend
                </p>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {preview.sample.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{c.name}</p>
                        {c.city && (
                          <p className="text-xs text-muted-foreground">{c.city}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        {inr.format(c.total_spend)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </StatePanel>
    </section>
  );
}
