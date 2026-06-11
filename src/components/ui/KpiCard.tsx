import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value?: ReactNode;
  /** Small icon shown top-right, tinted per tone. */
  icon?: ReactNode;
  /** Sub-line under the value (context, comparison). */
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "info";
  isLoading?: boolean;
  isError?: boolean;
}

const TONE_ICON: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
};

/**
 * KPI card — data surface (surface-2 + shadow-card). On error shows an em-dash,
 * never a crash (FRONTEND_SPEC §7).
 */
export function KpiCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
  isLoading,
  isError,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg",
              TONE_ICON[tone],
            )}
            aria-hidden
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2">
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {isError ? "—" : value}
          </p>
        )}
        {hint && !isLoading && (
          <p className="mt-1 text-xs text-muted-foreground">{isError ? "Unavailable" : hint}</p>
        )}
      </div>
    </div>
  );
}
