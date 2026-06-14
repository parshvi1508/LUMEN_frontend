"use client";

import { Fragment } from "react";
import { Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCampaignInsight } from "@/hooks/useAi";
import { isApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const FACT_LABELS: Record<string, string> = {
  total: "Total",
  queued: "Queued",
  sent: "Sent",
  failed: "Failed",
  delivered: "Delivered",
  opened: "Opened",
  read: "Read",
  clicked: "Clicked",
  converted: "Converted",
  failure_rate_pct: "Failure rate",
  conversion_rate_pct: "Conversion rate",
  audience_size: "Audience",
};

function isPct(label: string) {
  return label.endsWith("_pct");
}

// Bold every numeric token so each claim is eyeball-checkable against the facts.
function Grounded({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,]*%?)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\d[\d,]*%?$/.test(p) ? (
          <mark
            key={i}
            className="rounded bg-ai/50 px-0.5 font-semibold text-foreground"
          >
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function InsightPanel({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) {
  const q = useCampaignInsight(id, enabled);

  return (
    <section
      aria-label="AI insight"
      className="rounded-xl border border-ai-border bg-ai/30 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-ai-foreground" aria-hidden />
          AI insight
        </h2>
        {enabled && (
          <button
            type="button"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <RefreshCw
              className={cn("size-3.5", q.isFetching && "animate-spin")}
              aria-hidden
            />
            Regenerate
          </button>
        )}
      </div>

      {!enabled ? (
        <p className="text-sm text-muted-foreground">
          The narrative unlocks once this campaign has sent messages.
        </p>
      ) : q.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : q.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p className="text-destructive">
            {isApiError(q.error)
              ? q.error.apiError.message
              : "Couldn't generate the insight."}
          </p>
          <button
            type="button"
            onClick={() => q.refetch()}
            className="text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : q.data ? (
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          {/* narrative */}
          <div>
            <p className="text-sm leading-relaxed text-foreground/90">
              <Grounded text={q.data.narrative} />
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
              Grounded by construction - every figure above must appear in the facts,
              so a hallucinated number is visible at a glance.
            </p>
          </div>

          {/* cited facts - the raw numbers, beside the prose */}
          <dl className="space-y-1 rounded-lg border border-border bg-surface-1 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cited facts
            </p>
            {q.data.facts.map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-2">
                <dt className="text-xs text-muted-foreground">
                  {FACT_LABELS[f.label] ?? f.label}
                </dt>
                <dd className="text-xs font-medium tabular-nums text-foreground">
                  {f.value.toLocaleString("en-IN")}
                  {isPct(f.label) ? "%" : ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
