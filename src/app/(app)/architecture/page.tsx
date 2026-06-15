"use client";

import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Scale,
  Zap,
  Database,
  Radio,
  Brain,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const TRADEOFFS: {
  chose: string;
  over: string;
  because: string;
  scale: string;
}[] = [
  {
    chose: "Direct transactional writes for receipts",
    over: "Redis/SQS queue",
    because:
      "Demo scale does not need async workers. The batch-shaped API means the swap is internal, not a contract change.",
    scale:
      "Same endpoint, swap processor internals for a buffer + batch flush. Interface already shaped for it.",
  },
  {
    chose: "5-second polling for campaign stats",
    over: "WebSockets",
    because:
      "Polling is stateless, cacheable, and trivial to deploy. WebSocket connection management adds complexity with no user-visible benefit at this scale.",
    scale:
      "SSE or WebSocket upgrade behind a feature flag. Polling stays as fallback.",
  },
  {
    chose: "Denormalized aggregates on customers",
    over: "Join-time aggregation from orders",
    because:
      "Segment queries hit customers only, never join orders. Write-time cost on ingest is acceptable for read-time speed on every segment preview.",
    scale:
      "Materialized views or a read replica. The segment compiler already reads from columns, so the source can change without touching query logic.",
  },
  {
    chose: "Supabase Auth (Google OAuth)",
    over: "Hand-rolled JWT auth",
    because:
      "Saves roughly a day of implementation. Production-credible, not a toy.",
    scale: "Swap provider or add SAML/SSO. Auth middleware is a single file.",
  },
  {
    chose: "Groq (Llama 3.3 70B) with OpenRouter fallback",
    over: "Self-hosted HuggingFace model",
    because:
      "Sub-second latency, zero infra. Automatic fallback covers provider instability without user-facing errors.",
    scale:
      "Add provider weights, circuit breaker, or swap to a dedicated API key with rate guarantees.",
  },
  {
    chose: "Append-only event log with derived status",
    over: "Status-only mutation on communications",
    because:
      "The event log is the source of truth. Derived status is a convenience column. If they disagree, the log wins. This gives auditability, idempotency, and debuggability for free.",
    scale: "Already correct at any scale. No change needed.",
  },
];

// Static reviewer-facing page. No data fetching by design: it exists to show
// system thinking in one place, not to scatter diagrams onto functional pages.
// Diagrams are pre-rendered SVGs (public/diagrams) so they render identically
// here and in the GitHub README, with no client-side diagram library.
export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        title="Architecture"
        description="How the system fits together, why each tradeoff was made, and the one loop worth reading closely."
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
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
            <Image
              src="/diagrams/architecture.svg"
              alt="System architecture: frontend to CRM API to channel service, database and LLM"
              width={980}
              height={440}
              unoptimized
              className="h-auto w-full"
            />
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
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
            <Image
              src="/diagrams/receipt-loop.svg"
              alt="Receipt loop sequence: HMAC verify, dedupe, idempotent insert, never-downgrade status, harmless retry"
              width={1020}
              height={620}
              unoptimized
              className="h-auto w-full"
            />
          </div>
        </section>

        {/* System tradeoffs */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Scale className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              System tradeoffs
            </h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Every shortcut is deliberate. Each row names what was chosen, what was
            not, why, and what the upgrade path looks like.
          </p>
          <div className="space-y-3">
            {TRADEOFFS.map((t) => (
              <div
                key={t.chose}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-medium text-foreground">
                    {t.chose}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    over {t.over}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                  {t.because}
                </p>
                <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                  <ArrowUpRight className="mt-0.5 size-3 shrink-0" aria-hidden />
                  <span>Scale path: {t.scale}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AI safety contract */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Brain className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              AI safety contract
            </h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            How the system keeps LLM output from becoming a liability.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AiSafetyCard
              title="Structured output only"
              body="Every AI endpoint defines a Pydantic response schema. The LLM is prompted for JSON. Output is parsed, validated, and type-checked before it reaches any downstream logic."
            />
            <AiSafetyCard
              title="One repair retry"
              body="If the LLM returns invalid JSON or fails validation, the system retries once with the error message appended. On second failure: 422 with a clear error and a manual-path fallback in the UI."
            />
            <AiSafetyCard
              title="No raw SQL from LLM"
              body="Segment rules go through a whitelisted AST compiler. Fields and comparators are enumerated in one file. The LLM produces a rule tree, never a query string."
            />
            <AiSafetyCard
              title="Grounded narratives"
              body="Insight prompts receive computed stats as structured data. The model is instructed to reference only provided numbers. The UI renders stats beside the narrative so any hallucination is visibly checkable."
            />
          </div>
        </section>

        {/* Security model */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Security model
            </h2>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SecurityCard
              title="Auth"
              body="Supabase Auth with Google OAuth. JWT verified in FastAPI middleware on every CRM route."
            />
            <SecurityCard
              title="Receipt callbacks"
              body="HMAC-SHA256 signature on every channel callback. Shared secret via environment variable. Reject on mismatch, no exceptions."
            />
            <SecurityCard
              title="Input validation"
              body="Pydantic on every request body. Segment AST fields and comparators whitelisted in a single file. No interpolation of user or LLM text into SQL."
            />
            <SecurityCard
              title="Deployment"
              body="CORS restricted to the frontend domain. Secrets in env vars only (.env never committed, .env.example tracks required keys). Rate limits on AI and receipt endpoints."
            />
          </div>
        </section>

        {/* Data model highlights */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Database className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Data model highlights
            </h2>
          </div>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              <span className="font-medium text-foreground">Append-only event log.</span>{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">communication_events</code>{" "}
              is never updated or deleted. It is the source of truth.{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">communications.status</code>{" "}
              is a derived convenience that only upgrades by rank precedence
              (queued &lt; sent &lt; delivered &lt; opened &lt; read &lt; clicked &lt; converted).
            </p>
            <p>
              <span className="font-medium text-foreground">Idempotent ingest.</span>{" "}
              Customers and orders upsert on <code className="rounded bg-muted px-1 py-0.5 text-xs">external_id</code>.
              Re-importing the same CSV changes nothing. Receipt callbacks deduplicate on{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">(communication_id, event_type)</code>.
            </p>
            <p>
              <span className="font-medium text-foreground">Segment definition hashing.</span>{" "}
              Segments deduplicate by SHA-256 of their canonical JSON definition, not by name.
              Creating the same rule set twice reuses the existing segment.
            </p>
          </div>
        </section>

        {/* Operational signals */}
        <section className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Radio className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Operational signals
            </h2>
          </div>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              <span className="font-medium text-foreground">Status strip.</span>{" "}
              The app footer shows live provider state: channel service connectivity
              and AI provider (Groq primary, OpenRouter fallback). If Groq is down,
              the strip reflects the fallback without user action.
            </p>
            <p>
              <span className="font-medium text-foreground">Campaign polling.</span>{" "}
              Active campaigns poll every 5 seconds with a monotonic clamp on counts
              (values only go up, even if a stale response arrives out of order).
              Polling stops on terminal status.
            </p>
            <p>
              <span className="font-medium text-foreground">Single-brand config.</span>{" "}
              Brand name, tagline, and sample-data label are pulled from one config
              object. The codebase reads as deployed-per-client, with multi-tenant
              documented as a future path, not built.
            </p>
          </div>
        </section>

        {/* Consciously skipped */}
        <section className="rounded-2xl border border-dashed border-border bg-surface-1 p-6">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Consciously skipped
            </h2>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Things not built, with the reasoning.
          </p>
          <ul className="space-y-2 text-sm text-foreground/85">
            <SkippedItem
              label="WebSocket live updates"
              reason="Polling is stateless and deployable anywhere. Upgrade path documented."
            />
            <SkippedItem
              label="Multi-tenancy"
              reason="Single-brand deployment. Config object is the seam for future tenant isolation."
            />
            <SkippedItem
              label="A/B testing engine"
              reason="Message variants exist, but statistical testing is out of scope."
            />
            <SkippedItem
              label="Real channel integrations"
              reason="The channel service is a deliberate stub. The contract (batch POST, HMAC callback) is production-shaped."
            />
            <SkippedItem
              label="Staging environment"
              reason="Single-developer project. CI (lint + test) gates the deploy."
            />
            <SkippedItem
              label="Email template designer"
              reason="Plain-text message templates with token substitution. Rich HTML is a product decision, not an engineering one."
            />
          </ul>
        </section>
      </div>
    </>
  );
}

function AiSafetyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/80">{body}</p>
    </div>
  );
}

function SecurityCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/80">{body}</p>
    </div>
  );
}

function SkippedItem({ label, reason }: { label: string; reason: string }) {
  return (
    <li className="flex items-baseline gap-2">
      <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden />
      <span>
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">: </span>
        <span>{reason}</span>
      </span>
    </li>
  );
}
