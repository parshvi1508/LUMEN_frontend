"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Send,
  TrendingUp,
  XCircle,
  Radio,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { isApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useCampaign, useCampaignStats, useCampaignPnl } from "@/hooks/useCampaigns";
import { computeReach } from "./funnel";
import { FunnelChart } from "./FunnelChart";
import { InsightPanel } from "./InsightPanel";
import { CAMPAIGN_STATUS_VARIANT, campaignStatusLabel, campaignStatusHint } from "./status";

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

  const seen = useRef<Record<string, number>>({});
  const [rows, setRows] = useState<ReturnType<typeof computeReach>>([]);
  const [converted, setConverted] = useState(0);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    if (!stats.data) return;
    const clamped = computeReach(stats.data.funnel).map((r) => {
      const next = Math.max(seen.current[r.key] ?? 0, r.reach);
      seen.current[r.key] = next;
      return { ...r, reach: next };
    });
    setRows(clamped);

    const c = Math.max(seen.current._converted ?? 0, stats.data.converted ?? 0);
    seen.current._converted = c;
    setConverted(c);

    const f = Math.max(seen.current._failed ?? 0, stats.data.failed ?? 0);
    seen.current._failed = f;
    setFailed(f);
  }, [stats.data]);

  const total = stats.data?.total ?? 0;

  const failureRate = total ? failed / total : 0;
  const conversionRate = total ? converted / total : 0;
  const polling = interval !== false;
  const insightEnabled = total > 0;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!polling) return;
    const t = window.setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(t);
  }, [polling]);

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
            ? `Watch this campaign move from sent to opened to converted, with an AI summary of what happened. ${campaign.data.channel ?? "-"} · created ${new Date(
                campaign.data.created_at,
              ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
            : "Watch this campaign move from sent to opened to converted, with an AI summary of what happened."
        }
        actions={
          status ? (
            <div className="flex items-center gap-2">
              <Badge
                variant={CAMPAIGN_STATUS_VARIANT[status] ?? "secondary"}
                title={campaignStatusHint(status)}
              >
                {campaignStatusLabel(status)}
              </Badge>
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
        ) : !stats.data ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center">
            <Send className="mx-auto size-6 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-sm font-medium text-foreground">
              Waiting for dispatch
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stats will appear here once the campaign sends its first messages.
            </p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StaggerItem>
                <Kpi
                  icon={<Users className="size-4" aria-hidden />}
                  label="Audience"
                  value={stats.data.audience_size ?? total}
                />
              </StaggerItem>
              <StaggerItem>
                <Kpi
                  icon={<Send className="size-4" aria-hidden />}
                  label="Messages"
                  value={total}
                />
              </StaggerItem>
              <StaggerItem>
                <Kpi
                  icon={<TrendingUp className="size-4 text-success-foreground" aria-hidden />}
                  label="Converted"
                  value={converted}
                  sub={`${(conversionRate * 100).toFixed(1)}% of sent`}
                />
              </StaggerItem>
              <StaggerItem>
                <Kpi
                  icon={<XCircle className="size-4 text-destructive" aria-hidden />}
                  label="Failed"
                  value={failed}
                  sub={`${(failureRate * 100).toFixed(1)}% failure rate`}
                />
              </StaggerItem>
            </Stagger>

            {/* funnel + raw stage numbers, side by side */}
            <section className="rounded-xl border border-border bg-surface-1 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Radio className="size-4 text-muted-foreground" aria-hidden />
                  Delivery funnel
                </h2>
                <div className="flex items-center gap-3">
                  {polling && stats.dataUpdatedAt > 0 && (
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      Updated {Math.round((now - stats.dataUpdatedAt) / 1000)}s ago
                    </span>
                  )}
                  <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
                    Simulated channel (demo)
                  </span>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FunnelChart rows={rows} />
                {/* the raw numbers behind the chart - checkable */}
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
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: r.fill }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                  No failures. All {total.toLocaleString("en-IN")} messages were
                  accepted by the channel.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-destructive"
                      initial={{ width: 0 }}
                      animate={{ width: `${failureRate * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

            {/* P&L: the closed-loop proof */}
            <PnlCard id={id} />
          </>
        )}
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
        <CountUp value={value} />
      </p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function PnlCard({ id }: { id: string }) {
  const pnl = useCampaignPnl(id);

  if (pnl.isLoading) return <Skeleton className="h-28 w-full rounded-xl" />;
  if (!pnl.data || pnl.isError) return null;

  const d = pnl.data;
  const roiPct = d.roi * 100;

  return (
    <section className="rounded-xl border border-border bg-surface-1 p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <DollarSign className="size-4 text-muted-foreground" aria-hidden />
        Profit & Loss (attributed)
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PnlStat label="Contacted" value={d.contacted.toLocaleString("en")} />
        <PnlStat label="Cost" value={formatCurrency(d.cost)} />
        <PnlStat label="Revenue" value={formatCurrency(d.attributed_revenue)} />
        <PnlStat
          label="Profit"
          value={formatCurrency(d.profit)}
          sub={`${roiPct >= 0 ? "+" : ""}${roiPct.toFixed(0)}% ROI`}
          positive={d.profit >= 0}
        />
      </div>
    </section>
  );
}

function PnlStat({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] font-medium ${
            positive ? "text-success-foreground" : "text-danger-foreground"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
