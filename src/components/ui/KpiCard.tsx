import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/motion/CountUp";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value?: ReactNode;
  /** When set, the value animates a count-up to this number (formatted by `format`). */
  countTo?: number;
  format?: (n: number) => string;
  /** Small icon shown top-right, tinted per tone. */
  icon?: ReactNode;
  /** Sub-line under the value (context, comparison). */
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "info";
  isLoading?: boolean;
  isError?: boolean;
}

// Each tone gives the card a faint color wash (gradient start -> white) and a
// matching solid icon chip. Tokens already adapt to dark mode.
const TONE: Record<
  NonNullable<KpiCardProps["tone"]>,
  { card: string; icon: string }
> = {
  default: { card: "from-primary/10", icon: "bg-primary/15 text-primary" },
  success: { card: "from-success", icon: "bg-success-foreground/10 text-success-foreground" },
  warning: { card: "from-warning", icon: "bg-warning-foreground/10 text-warning-foreground" },
  info: { card: "from-info", icon: "bg-info-foreground/10 text-info-foreground" },
};

/**
 * KPI card - tinted stat tile (gradient wash + colored icon chip, soft hover
 * lift). On error shows a dash, never a crash.
 */
export function KpiCard({
  label,
  value,
  countTo,
  format,
  icon,
  hint,
  tone = "default",
  isLoading,
  isError,
}: KpiCardProps) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br to-surface-2 p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised",
        t.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-foreground/5 transition-transform duration-200 group-hover:scale-105",
              t.icon,
            )}
            aria-hidden
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-9 w-28" />
        ) : (
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {isError ? (
              "-"
            ) : countTo != null ? (
              <CountUp value={countTo} format={format} />
            ) : (
              value
            )}
          </p>
        )}
        {hint && !isLoading && (
          <p className="mt-1 text-xs text-muted-foreground">
            {isError ? "Unavailable" : hint}
          </p>
        )}
      </div>
    </div>
  );
}
