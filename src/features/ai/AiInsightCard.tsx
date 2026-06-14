"use client";

import type { ReactNode } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiInsightCardProps {
  /** Plain-language callout - the headline a marketer can act on. */
  headline: ReactNode;
  /** The grounded numbers the headline cites, shown beside it so the claim is checkable. */
  detail?: ReactNode;
  cta?: { label: string; onClick: () => void };
  /** Honest freshness, e.g. "from your live customer list". */
  source?: string;
  className?: string;
}

/**
 * The AI surface vocabulary: amber wash, accent rail, sparkle provenance, and
 * the dedicated `shadow-ai` glow. Wherever this appears, the user knows
 * intelligence is speaking - and the reasoning (detail) sits next to the claim,
 * never behind a tooltip (PRODUCT.md §1).
 */
export function AiInsightCard({
  headline,
  detail,
  cta,
  source,
  className,
}: AiInsightCardProps) {
  return (
    <section
      aria-label="AI insight"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-ai-border bg-ai shadow-ai",
        className,
      )}
    >
      {/* Accent rail - the amber doing functional work */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-ai-accent" />

      <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai-accent/15 text-ai-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ai-foreground/80">
                AI insight
              </span>
              {source && (
                <span className="text-[11px] text-ai-foreground/60">· {source}</span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium leading-snug text-foreground">
              {headline}
            </p>
            {detail && (
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            )}
          </div>
        </div>

        {cta && (
          <button
            type="button"
            onClick={cta.onClick}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-ai-accent px-3.5 py-2 text-sm font-semibold text-ai-accent-foreground shadow-sm transition-colors hover:bg-ai-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-accent sm:self-center"
          >
            {cta.label}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
