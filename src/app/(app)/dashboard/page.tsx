"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  TrendingDown,
  Sparkles,
  Brain,
  UserPlus,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useDecisions } from "@/hooks/useDecisions";
import { useWinBack, useDispatchCampaign } from "@/hooks/useCampaigns";
import { formatCurrency } from "@/lib/format";
import type { Decision, PortfolioSummary } from "@/lib/schemas/insights";

const TIER_ORDER = ["high", "mid", "low"] as const;

const FEATURE_LABELS: Record<string, string> = {
  recency_days: "Days since last order",
  frequency: "Order frequency",
  monetary_total: "Total spend",
  monetary_avg: "Avg order value",
  tenure_days: "Tenure",
  avg_review: "Reviews",
  avg_installments: "Installments",
  avg_freight_ratio: "Shipping ratio",
  avg_delivery_delay: "Delivery delay",
  review_word_count: "Review detail",
  review_text_ratio: "Review engagement",
  review_topics: "Review topics",
  payment_type: "Payment method",
};

export default function DashboardPage() {
  const router = useRouter();
  const portfolio = usePortfolio();
  const decisions = useDecisions(undefined, 12);
  const p = portfolio.data;

  const isEmpty =
    !portfolio.isLoading && !portfolio.isError && p?.customers_scored === 0;

  return (
    <>
      <PageHeader
        title="Revenue radar"
        description="One screen: how much revenue is leaking, and exactly who to act on."
      />

      <div className="px-6 md:px-8 py-6 space-y-6">
        {portfolio.isError ? (
          <ErrorBanner onRetry={() => portfolio.refetch()} />
        ) : isEmpty ? (
          <div className="rounded-xl border border-border bg-surface-2 shadow-card">
            <EmptyState
              icon={<UserPlus className="size-8" />}
              title="No scored customers yet"
              description="Load customers and orders, run scoring, and the revenue radar lights up."
              action={{
                label: "Import customers",
                onClick: () => router.push("/customers"),
              }}
            />
          </div>
        ) : (
          <>
            <HeroRisk data={p} isLoading={portfolio.isLoading} />
            <SupportStats data={p} isLoading={portfolio.isLoading} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <TierPanel counts={p?.tier_counts} isLoading={portfolio.isLoading} />
              <PriorityList
                items={decisions.data ?? []}
                isLoading={decisions.isLoading}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function HeroRisk({
  data,
  isLoading,
}: {
  data?: PortfolioSummary;
  isLoading: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-ai-accent p-6 md:p-8 text-white shadow-raised">
      <div className="relative z-10 max-w-2xl">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide opacity-80">
          <TrendingDown className="size-3.5" aria-hidden />
          Revenue at risk right now
        </p>

        {isLoading || !data ? (
          <Skeleton className="mt-2 h-14 w-72 bg-white/20" />
        ) : (
          <p className="mt-1 text-4xl font-bold leading-none tabular-nums md:text-6xl">
            {formatCurrency(data.revenue_leakage)}
          </p>
        )}

        <p className="mt-3 text-sm opacity-90 md:text-base">
          {data ? (
            <>
              Leaking from{" "}
              <span className="font-semibold tabular-nums">
                {data.lapsed_count.toLocaleString("en")}
              </span>{" "}
              dormant customers.{" "}
              <span className="font-semibold tabular-nums">
                {formatCurrency(data.reactivation_opportunity_high_tier)}
              </span>{" "}
              is recoverable from your highest-value ones. Act before they churn
              for good.
            </>
          ) : (
            "Calculating where revenue is leaking."
          )}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/today"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Sparkles className="size-4" aria-hidden />
            Launch a win-back campaign
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            See all {data ? data.customers_scored.toLocaleString("en") : ""}{" "}
            scored customers
          </Link>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-28 size-44 rounded-full bg-white/15 blur-2xl"
      />
    </section>
  );
}

function SupportStats({
  data,
  isLoading,
}: {
  data?: PortfolioSummary;
  isLoading: boolean;
}) {
  const stats = [
    {
      label: "Recoverable now",
      value: data
        ? formatCurrency(data.reactivation_opportunity_high_tier)
        : "-",
      hint: "high-value customers",
    },
    {
      label: "Portfolio expected value",
      value: data ? formatCurrency(data.portfolio_expected_value) : "-",
      hint: "next-window revenue",
    },
    {
      label: "Avg per customer",
      value: data ? formatCurrency(data.avg_expected_value) : "-",
      hint: `${data ? data.customers_scored.toLocaleString("en") : ""} scored`,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-surface-2 px-4 py-3 shadow-card"
        >
          <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          {isLoading ? (
            <Skeleton className="mt-1.5 h-6 w-24" />
          ) : (
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {s.value}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">{s.hint}</p>
        </div>
      ))}
    </div>
  );
}

function TierPanel({
  counts,
  isLoading,
}: {
  counts?: Record<string, number>;
  isLoading: boolean;
}) {
  const fill: Record<string, string> = {
    high: "bg-vip",
    mid: "bg-info",
    low: "bg-muted-foreground/50",
  };
  const max = counts ? Math.max(1, ...TIER_ORDER.map((t) => counts[t] ?? 0)) : 1;
  return (
    <section
      aria-label="Customers by value tier"
      className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card lg:col-span-2"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Customers by value tier
        </h2>
        <span className="text-xs text-muted-foreground">ML-scored</span>
      </div>
      <div className="mt-4">
        {isLoading || !counts ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : (
          <ul className="space-y-3">
            {TIER_ORDER.map((tier) => {
              const count = counts[tier] ?? 0;
              return (
                <li key={tier}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium capitalize text-foreground">
                      {tier} value
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {count.toLocaleString("en")}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${fill[tier]}`}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function PriorityList({
  items,
  isLoading,
}: {
  items: Decision[];
  isLoading: boolean;
}) {
  return (
    <section
      aria-label="Priority customers"
      className="flex flex-col rounded-2xl border border-border bg-surface-2 p-6 shadow-card lg:col-span-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Act on these first
        </h2>
        <Link
          href="/today"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Full worklist
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>

      <ul role="list" className="mt-3 flex-1 divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </li>
          ))
        ) : items.length === 0 ? (
          <li className="py-8 text-center text-sm text-muted-foreground">
            No scored customers yet.
          </li>
        ) : (
          items.map((d) => <PriorityRow key={d.customer_id} d={d} />)
        )}
      </ul>
    </section>
  );
}

function PriorityRow({ d }: { d: Decision }) {
  const router = useRouter();
  const winBack = useWinBack();
  const dispatch = useDispatchCampaign();
  const busy = winBack.isPending || dispatch.isPending;

  const handleWinBack = async () => {
    const campaign = await winBack.mutateAsync({
      name: `Win back ${d.name}`,
      channel: "email",
      message_template: `Hi {{first_name}}, we noticed you haven't ordered in a while. Come back and enjoy something special!`,
      tier: d.value_tier,
    });
    await dispatch.mutateAsync(campaign.id);
    router.push(`/campaigns/${campaign.id}`);
  };

  const initials = d.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <li className="group flex items-center gap-3 py-3">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
      >
        {initials}
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
                {FEATURE_LABELS[r.feature] ?? r.feature.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={handleWinBack}
        aria-label={`Win back ${d.name}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Target className="size-3.5" aria-hidden />
        {busy ? "..." : "Win back"}
      </button>
    </li>
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

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-xl border border-danger-border bg-danger px-4 py-3 text-sm text-danger-foreground"
    >
      <span>Could not load the revenue radar.</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-medium underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
      >
        Try again
      </button>
    </div>
  );
}
