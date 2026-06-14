"use client";

import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mermaid } from "@/components/ui/Mermaid";
import { ARCHITECTURE_DIAGRAM, RECEIPT_LOOP_DIAGRAM } from "@/lib/diagrams";

// Static reviewer-facing page. No data fetching by design: it exists to show
// system thinking in one place, not to scatter diagrams onto functional pages.
export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        title="Architecture"
        description="How the system fits together, and the one loop worth reading closely."
      />

      <div className="mx-auto max-w-4xl space-y-8 px-6 py-6 md:px-8">
        {/* Explainability thesis */}
        <section className="rounded-2xl border border-ai-border bg-ai/40 p-6 shadow-ai">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-ai-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">The bet: explainable AI</h2>
          </div>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p>
              Marketers do not adopt AI they cannot see into. So every AI decision
              in Lumen ships with the reasoning that produced it, shown next to the
              output, not hidden behind a tooltip.
            </p>
            <p>
              A natural-language segment returns its rules and the rationale. A
              drafted message carries its tone and audience-fit reason. An insight
              narrative is grounded by construction: it can only cite numbers that
              are also in the response payload, so a hallucinated figure is visibly
              checkable.
            </p>
            <p>
              Nothing executes without an explicit human approve step. The AI
              proposes; the human disposes.
            </p>
          </div>
        </section>

        {/* System architecture */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">System architecture</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Four deployable units. The two backend services share nothing at runtime
            and talk over HTTP only.
          </p>
          <div className="mt-4">
            <Mermaid chart={ARCHITECTURE_DIAGRAM} label="System architecture diagram" />
          </div>
        </section>

        {/* Receipt loop */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Receipt loop</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The channel simulates outcomes and calls back out of order, with
            duplicates and retries. The CRM keeps each communication correct under
            all of it: idempotent inserts, never-downgrade status, harmless retries.
          </p>
          <div className="mt-4">
            <Mermaid chart={RECEIPT_LOOP_DIAGRAM} label="Receipt loop sequence diagram" />
          </div>
        </section>
      </div>
    </>
  );
}
