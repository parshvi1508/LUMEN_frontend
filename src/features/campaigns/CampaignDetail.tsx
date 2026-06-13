"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Send,
  TrendingUp,
  XCircle,
  Radio,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { useCampaign, useCampaignStats } from "@/hooks/useCampaigns";
import { computeReach } from "./funnel";
import { FunnelChart } from "./FunnelChart";
import { InsightPanel } from "./InsightPanel";

const STATUS_BADGE: Record<
  string,
  "secondary" | "warning" | "info" | "success"
> = {
  draft: "secondary",
  dispatching: "warning",
  active: "info",
  completed: "success",
};

export function CampaignDetail({ id }: { id: string }) {
  const campaign = useCampaign(id);

  // Poll every 5s while dispatching/active; stop on terminal status.
  const [interval, setInterval_] = useState<number | false>(5000);
  const stats = useCampaignStats(id, interval);
  const status = stats.data?.campaign_status ?? campaign.data?.status ?? null;

  useEffect(() => {
    if (status === "completed" || status === "draft") setInterval_(false);
    else if (status === "active" || status === "dispatching") setInterval_(5000);
  }, [status]);

  // Monotonic clamp: counts only move forward, even if a poll returns a stale
  // or out-of-order snapshot. Mirrors the backend's status_rank guard in the UI.
  const seen = useRef<Record<string, number>>({});
  const rows = useMemo(() => {
    if (!stats.data) return [];
    return computeReach(stats.data.funnel).map((r) => {
      const next = Math.max(seen.current[r.key] ?? 0, r.reach);
      seen.current[r.key] = next;
      return { ...r, reach: next };
    });
  }, [stats.data]);

  const total = stats.data?.total ?? 0;
  const converted = useMemo(() => {
    const v = stats.data?.converted ?? 0;
    seen.current._converted = Math.max(seen.current._converted ?? 0, v);
    return seen.current._converted;
  }, [stats.data]);
  const failed = useMemo(() => {
    const v = stats.data?.failed ?? 0;
    seen.current._failed = Math.max(seen.current._failed ?? 0, v);
    return seen.current._failed;
  }, [stats.data]);

  const failureRate = total ? failed / total : 0;
  const conversionRate = total ? converted / total : 0;
  const polling = interval !== false;
  const insightEnabled = total > 0;

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Campaigns
          </Link>
        }
        title={campaign.data?.name ?? "Campaign"}
        description={
          campaign.data
            ? `${campaign.data.channel ?? "—"} · created ${new Date(
                campaign.data.created_at,
              ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
            : undefined
        }
        actions={
          status ? (
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_BADGE[status] ?? "secondary"}>{status}</Badge>
              {polling ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-info" />
                  </span>
                  Live · 5s
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Not polling</span>
              )}
            </div>
          ) : undefined
        }
      />

      <div
        aria-live="polite"
        aria-busy={stats.isLoading || undefined}
        className="space-y-5 px-6 py-6 md:px-8"
      >
        {stats.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : stats.isError ? (
          <div role="alert" className="rounded-xl border border-border bg-surface-1 p-6 text-sm">
            <p className="text-destructive">
              {isApiError(stats.error)
                ? stats.error.apiError.message
                : "Couldn't load campaign stats."}
            </p>
            <button
              type="button"
              onClick={() => stats.refetch()}
              className="mt-2 text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : stats.data ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi
                icon={<Users className="size-4" aria-hidden />}
                label="Audience"
                value={stats.data.audience_size ?? total}
              />
              <Kpi
                icon={<Send className="size-4" aria-hidden />}
                label="Messages"
                value={total}
              />
              <Kpi
                icon={<TrendingUp className="size-4 text-success-foreground" aria-hidden />}
                label="Converted"
                value={converted}
                sub={`${(conversionRate * 100).toFixed(1)}% of sent`}
              />
              <Kpi
                icon={<XCircle className="size-4 text-destructive" aria-hidden />}
                label="Failed"
                value={failed}
                sub={`${(failureRate * 100).toFixed(1)}% failure rate`}
              />
            </div>

            {/* funnel + raw stage numbers, side by side */}
            <section className="rounded-xl border border-border bg-surface-1 p-4">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Radio className="size-4 text-muted-foreground" aria-hidden />
                Delivery funnel
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FunnelChart rows={rows} />
                {/* the raw numbers behind the chart — checkable */}
                <ul className="space-y-1.5">
                  {rows.map((r) => {
                    const pct = total ? (r.reach / total) * 100 : 0;
                    return (
                      <li key={r.key} className="flex items-center gap-3">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: r.fill }}
                          aria-hidden
                        />
                        <span className="w-20 shrink-0 text-sm text-foreground/90">
                          {r.label}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: r.fill }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-sm tabular-nums text-foreground">
                          {r.reach.toLocaleString("en-IN")}
                          <span className="ml-1 text-[11px] text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            {/* failure breakdown */}
            <section className="rounded-xl border border-border bg-surface-1 p-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Failure breakdown
              </h2>
              {failed === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No failures — all {total.toLocaleString("en-IN")} messages were
                  accepted by the channel.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-destructive"
                      style={{ width: `${failureRate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-foreground">
                    {failed.toLocaleString("en-IN")}{" "}
                    <span className="text-muted-foreground">
                      ({(failureRate * 100).toFixed(1)}%)
                    </span>
                  </span>
                </div>
              )}
            </section>

            {/* AI insight beside the numbers it cites */}
            <InsightPanel id={id} enabled={insightEnabled} />
          </>
        ) : null}
      </div>
    </>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value.toLocaleString("en-IN")}
      </p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
