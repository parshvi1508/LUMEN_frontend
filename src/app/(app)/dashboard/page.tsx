"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Coins,
  TrendingDown,
  ArrowRight,
  UserPlus,
  Sparkles,
  Wand2,
  Megaphone,
  Brain,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { AiInsightCard } from "@/features/ai/AiInsightCard";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useDecisions } from "@/hooks/useDecisions";
import { formatCurrency } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import type { Decision } from "@/lib/schemas/insights";

const TIER_ORDER = ["high", "mid", "low"] as const;

export default function DashboardPage() {
  const router = useRouter();
  // Server-computed aggregates over the full book, never a client-side sample.
  const portfolio = usePortfolio();
  const decisions = useDecisions(undefined, 10);

  const pData = portfolio.data;
  const isLoading = portfolio.isLoading;
  const isError = portfolio.isError;
  const isEmpty = !isLoading && !isError && pData?.customers_scored === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Revenue intelligence at a glance. Every number is server-computed, not sampled."
        actions={
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Users className="size-4" aria-hidden />
            View customers
          </Link>
        }
      />

      <div className="px-6 md:px-8 py-6 space-y-6">
        {isEmpty ? (
          <div className="rounded-xl border border-border bg-surface-2 shadow-card">
            <EmptyState
              icon={<UserPlus className="size-8" />}
              title="No scored customers yet"
              description="Once customers and orders are loaded and scored, the revenue view unlocks."
              action={{ label: "Import customers", onClick: () => router.push("/customers") }}
            />
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-ai-accent p-6 text-white shadow-raised">
              <div className="relative z-10 max-w-xl">
                <p className="text-sm font-medium opacity-80">Welcome back to {BRAND.name}</p>
                <h2 className="mt-1 text-xl font-semibold leading-snug">
                  See where revenue is leaking, then act on the customers who move it most.
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <HeroAction
                    href="/campaigns/new"
                    icon={<Sparkles className="size-4" aria-hidden />}
                    label="Propose a campaign"
                    ai
                  />
                  <HeroAction
                    href="/segments"
                    icon={<Wand2 className="size-4" aria-hidden />}
                    label="Build a segment"
                  />
                  <HeroAction
                    href="/campaigns"
                    icon={<Megaphone className="size-4" aria-hidden />}
                    label="See live campaigns"
                  />
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-white/10 blur-2xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-white/15 blur-2xl"
              />
            </div>

            <Stagger
              aria-label="Key metrics"
              role="group"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StaggerItem>
                <KpiCard
                  label="Revenue at risk"
                  countTo={pData?.revenue_leakage}
                  format={formatCurrency}
                  icon={<TrendingDown className="size-4" />}
                  tone="warning"
                  hint={pData ? `${pData.lapsed_count.toLocaleString("en")} lapsed customers` : "loading"}
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Reactivation opportunity"
                  countTo={pData?.reactivation_opportunity_high_tier}
                  format={formatCurrency}
                  icon={<Sparkles className="size-4" />}
                  tone="success"
                  hint="high-tier customers"
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Portfolio expected value"
                  countTo={pData?.portfolio_expected_value}
                  format={formatCurrency}
                  icon={<Coins className="size-4" />}
                  tone="info"
                  hint={pData ? `${pData.customers_scored.toLocaleString("en")} scored` : "loading"}
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Avg expected value"
                  countTo={pData?.avg_expected_value}
                  format={formatCurrency}
                  icon={<Users className="size-4" />}
                  hint="per scored customer"
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
            </Stagger>

            {isError ? (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-danger-border bg-danger px-4 py-3 text-sm text-danger-foreground"
              >
                <span>Could not load portfolio metrics.</span>
                <button
                  type="button"
                  onClick={() => portfolio.refetch()}
                  className="font-medium underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
                >
                  Try again
                </button>
              </div>
            ) : pData && pData.revenue_leakage > 0 ? (
              <AiInsightCard
                source="from the ML-scored customer portfolio"
                headline={
                  <>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(pData.revenue_leakage)}
                    </span>{" "}
                    in revenue is at risk from{" "}
                    <span className="font-semibold tabular-nums">
                      {pData.lapsed_count.toLocaleString("en")}
                    </span>{" "}
                    dormant customers. Win them back before they churn for good.
                  </>
                }
                detail={`High-tier reactivation opportunity: ${formatCurrency(pData.reactivation_opportunity_high_tier)}`}
                cta={{ label: "Create win-back segment", onClick: () => router.push("/segments") }}
              />
            ) : null}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <section
                aria-label="Customers by value tier"
                className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card lg:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Customers by value tier</h2>
                  <span className="text-xs text-muted-foreground">ML-scored</span>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <Skeleton className="h-40 w-full rounded-lg" />
                  ) : pData ? (
                    <ValueTierBar counts={pData.tier_counts} />
                  ) : null}
                </div>
              </section>

              <DecisionsList items={decisions.data ?? []} isLoading={decisions.isLoading} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ValueTierBar({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(1, ...TIER_ORDER.map((t) => counts[t] ?? 0));
  const fill: Record<string, string> = {
    high: "bg-vip",
    mid: "bg-info",
    low: "bg-muted-foreground/50",
  };
  return (
    <ul className="space-y-3">
      {TIER_ORDER.map((tier) => {
        const count = counts[tier] ?? 0;
        return (
          <li key={tier}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium capitalize text-foreground">{tier}</span>
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
  );
}

function HeroAction({
  href,
  icon,
  label,
  ai = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  ai?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm transition-all hover:bg-white/25 hover:ring-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {icon}
      {label}
      {ai && (
        <span className="rounded bg-ai-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ai-accent-foreground">
          AI
        </span>
      )}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
    </Link>
  );
}

function DecisionsList({ items, isLoading }: { items: Decision[]; isLoading: boolean }) {
  return (
    <section
      aria-label="Top decisions"
      className="flex flex-col rounded-2xl border border-border bg-surface-2 p-6 shadow-card lg:col-span-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Priority customers</h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Brain className="size-3" aria-hidden />
          score to reason to action
        </span>
      </div>

      <ul role="list" className="mt-3 flex-1 divide-y divide-border">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <Skeleton className="h-3 flex-1" />
              </li>
            ))
          : items.length === 0
            ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                No scored customers yet.
              </li>
            )
            : items.map((d) => (
                <li key={d.customer_id} className="py-2.5 space-y-1">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                    >
                      {d.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {d.recommended_action} · EV {formatCurrency(d.expected_value)}
                      </p>
                    </div>
                    <TierBadge tier={d.value_tier} />
                  </div>
                  {d.reasons.length > 0 && (
                    <div className="ml-10 flex flex-wrap gap-1.5">
                      {d.reasons.slice(0, 3).map((r) => (
                        <span
                          key={r.feature}
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${
                            r.direction === "increases"
                              ? "bg-success text-success-foreground"
                              : "bg-danger text-danger-foreground"
                          }`}
                        >
                          {r.feature.replace(/_/g, " ")} {r.direction === "increases" ? "+" : "-"}
                          {Math.abs(r.impact).toFixed(3)}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
      </ul>
    </section>
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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        styles[tier] ?? styles.low
      }`}
    >
      {tier}
    </span>
  );
}
