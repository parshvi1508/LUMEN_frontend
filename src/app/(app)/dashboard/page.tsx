"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  IndianRupee,
  Receipt,
  TriangleAlert,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { AiInsightCard } from "@/features/ai/AiInsightCard";
import { TierChart } from "@/features/dashboard/TierChart";
import { TierBadge } from "@/features/customers/TierBadge";
import { useCustomerStats } from "@/hooks/useCustomerStats";
import { deriveTier } from "@/lib/customer-tier";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCustomerStats();

  const isEmpty = !isLoading && !isError && data?.total === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your customer base at a glance - and the one move worth making next."
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
              title="No customers yet"
              description="Import your customer list to unlock aggregates, segments, and AI insights."
              action={{ label: "Import customers", onClick: () => router.push("/customers") }}
            />
          </div>
        ) : (
          <>
            {/* ── KPI row - real aggregates from the live customer list ── */}
            {/* Gradient hero band - states the product thesis up top */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.52_0.2_312)] p-6 text-primary-foreground shadow-raised">
              <div className="relative z-10 max-w-xl">
                <p className="text-sm font-medium opacity-80">Welcome back</p>
                <h2 className="mt-1 text-xl font-semibold leading-snug">
                  Decide who to reach and what to say, with the reasoning shown.
                </h2>
                <p className="mt-1.5 text-sm opacity-90">
                  Your customer base at a glance, and the one move worth making next.
                </p>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-white/10 blur-2xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-white/10 blur-2xl"
              />
            </div>

            <Stagger
              aria-label="Key metrics"
              role="group"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StaggerItem>
                <KpiCard
                  label="Total customers"
                  countTo={data?.total}
                  icon={<Users className="size-4" />}
                  hint={data?.sampled ? "metrics below sampled from 500" : "your full book"}
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Total spend"
                  countTo={data?.totalSpend}
                  format={formatCurrency}
                  icon={<IndianRupee className="size-4" />}
                  tone="success"
                  hint="lifetime, all customers"
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Avg order value"
                  countTo={data?.avgOrderValue}
                  format={formatCurrency}
                  icon={<Receipt className="size-4" />}
                  tone="info"
                  hint="spend ÷ orders"
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="At-risk"
                  countTo={data?.dormant60}
                  icon={<TriangleAlert className="size-4" />}
                  tone="warning"
                  hint="60+ days since last order"
                  isLoading={isLoading}
                  isError={isError}
                />
              </StaggerItem>
            </Stagger>

            {/* ── AI insight - the one-click next move ── */}
            {isError ? (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-danger-border bg-danger px-4 py-3 text-sm text-danger-foreground"
              >
                <span>Couldn&apos;t load your customer metrics.</span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="font-medium underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
                >
                  Try again
                </button>
              </div>
            ) : data && data.dormant60 > 0 ? (
              <AiInsightCard
                source="from your live customer list"
                headline={
                  <>
                    <span className="font-semibold tabular-nums">
                      {data.dormant60.toLocaleString("en-IN")} customers
                    </span>{" "}
                    haven&apos;t ordered in 60+ days. Win them back before they churn for good.
                  </>
                }
                detail={`${data.tierCounts["at-risk"].toLocaleString("en-IN")} at-risk · ${data.tierCounts.churned.toLocaleString("en-IN")} already churned`}
                cta={{ label: "Create win-back segment", onClick: () => router.push("/segments") }}
              />
            ) : null}

            {/* ── Tier mix + recent activity ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <section
                aria-label="Customers by tier"
                className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card lg:col-span-3"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Customers by tier</h2>
                  <span className="text-xs text-muted-foreground">recency + spend</span>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <Skeleton className="h-44 w-full rounded-lg" />
                  ) : data ? (
                    <TierChart counts={data.tierCounts} />
                  ) : null}
                </div>
              </section>

              <RecentActivity
                items={data?.recentlyAdded ?? []}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function RecentActivity({
  items,
  isLoading,
}: {
  items: import("@/lib/schemas/customer").Customer[];
  isLoading: boolean;
}) {
  return (
    <section
      aria-label="Recent activity"
      className="flex flex-col rounded-2xl border border-border bg-surface-2 p-6 shadow-card lg:col-span-2"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recently added</h2>
        <Link
          href="/customers"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
        >
          View all <ArrowRight className="size-3" aria-hidden />
        </Link>
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
                Nothing new yet.
              </li>
            )
            : items.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                  >
                    {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      added {formatRelativeTime(c.created_at)}
                    </p>
                  </div>
                  <TierBadge tier={deriveTier(c)} />
                </li>
              ))}
      </ul>
    </section>
  );
}
