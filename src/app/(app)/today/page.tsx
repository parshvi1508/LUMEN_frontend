"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency } from "@/lib/format";
import { TodayWorklist } from "@/features/today/TodayWorklist";

export default function TodayPage() {
  const portfolio = usePortfolio();
  const p = portfolio.data;

  return (
    <>
      <PageHeader
        title="Today's actions"
        description="Ranked by expected value. Pick a customer, launch a win-back, close the loop."
        actions={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted"
          >
            <BarChart3 className="size-4" aria-hidden />
            Revenue radar
          </Link>
        }
      />
      <div className="px-6 md:px-8 py-6 space-y-5">
        {p && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Revenue at risk" value={formatCurrency(p.revenue_leakage)} accent />
            <MiniStat label="Recoverable (high tier)" value={formatCurrency(p.reactivation_opportunity_high_tier)} />
            <MiniStat label="Lapsed customers" value={p.lapsed_count.toLocaleString("en")} />
            <MiniStat label="Avg expected value" value={formatCurrency(p.avg_expected_value)} />
          </div>
        )}
        <TodayWorklist />
      </div>
    </>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 ${accent ? "border-danger-border bg-danger/30" : "border-border bg-surface-2"}`}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-base font-semibold tabular-nums ${accent ? "text-danger-foreground" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
