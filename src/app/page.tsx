import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingDown,
  Brain,
  Target,
  ShieldCheck,
  LineChart,
  Sparkles,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "Klaviyo-level intelligence, zero Klaviyo complexity",
  description:
    "Lumen is a lightweight CRM for small D2C brands. It scores every customer for churn risk and value, explains why, and tells your 5-person team who to win back today.",
};

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          {BRAND.name}
        </span>
        <Link
          href="/login"
          className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-muted"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 md:pt-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai-border bg-ai/30 px-3 py-1 text-xs font-medium text-ai-foreground">
            <Brain className="size-3.5" aria-hidden />
            Built for small D2C teams
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            The CRM a 5-person D2C team can actually{" "}
            <span className="bg-gradient-to-r from-primary to-ai-accent bg-clip-text text-transparent">
              understand and act on
            </span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Klaviyo-level customer intelligence without Klaviyo-level complexity.
            {" "}{BRAND.name} scores every customer for churn risk and value, shows
            the reason behind each score in plain English, and hands your team a
            ranked daily worklist: who to talk to, why, and what it is worth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/today"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              See today's actions
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              Revenue radar
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          <Stat value="96,095" label="customers scored" />
          <Stat value="98.8%" label="probability calibration accuracy" />
          <Stat value="SHAP + NLP" label="plain-English reasons behind every score" />
          <Stat value="R$ P&L" label="real attributed revenue per campaign" />
        </dl>
      </section>

      {/* ICP + Why Lumen */}
      <section className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Who this is for
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold md:text-3xl">
            Small D2C brands that need customer intelligence but do not have a
            data team.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            If you run a direct-to-consumer brand with a few thousand customers,
            you know some are churning. You cannot see which. Klaviyo can tell
            you, but it costs more than your margins allow and takes a specialist
            to operate. {BRAND.name} gives you the same insight in a tool your
            whole team can read and act on in minutes.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              icon={<TrendingDown className="size-5" aria-hidden />}
              title="Find the leak"
              body="Open the dashboard Monday morning and see exactly how much revenue is leaking from dormant customers, ranked by what you can recover."
            />
            <Feature
              icon={<Brain className="size-5" aria-hidden />}
              title="Trust the score"
              body="Each score ships with its SHAP reasons in plain English. Your team sees why a customer is flagged, not a number they have to take on faith."
            />
            <Feature
              icon={<Target className="size-5" aria-hidden />}
              title="Act and measure"
              body="Launch a win-back campaign in one click, then watch real attributed revenue and P&L. Not a vanity open rate."
            />
          </div>
        </div>
      </section>

      {/* Why not Klaviyo */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Why {BRAND.name}
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold md:text-3xl">
          Three things Klaviyo cannot give a small team.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <WhyCard
            number="1"
            title="Explainability"
            body="Every AI score ships with the reasoning that produced it, visible next to the output. Your team can verify before acting."
          />
          <WhyCard
            number="2"
            title="Money framing"
            body="The dashboard leads with revenue at risk and expected value, not engagement metrics. You see the cost of inaction in your currency."
          />
          <WhyCard
            number="3"
            title="Decision, not dashboard"
            body={`Open Lumen Monday morning and it answers: "Who should I talk to today, and why?" One click to launch the campaign. No spreadsheet, no guessing.`}
          />
        </div>
      </section>

      <section className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <Audience
              icon={<Target className="size-5" aria-hidden />}
              who="For the marketer"
              body="A ranked worklist: who to message today, why, and one click to launch the campaign. No spreadsheets, no guessing."
            />
            <Audience
              icon={<LineChart className="size-5" aria-hidden />}
              who="For the founder"
              body="Revenue at risk, recoverable value, and per-campaign P&L. Proof the spend pays for itself, shown in real money."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              Stop guessing who is about to leave.
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" aria-hidden />
              Every recommendation is explained and measurable.
            </p>
          </div>
          <Link
            href="/today"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            See today's actions
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <Link
          href="/today"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
        >
          See today&apos;s actions
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <footer className="border-t border-border pb-20 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-8 text-xs text-muted-foreground">
          <span>{BRAND.name} · Explainable customer intelligence · Demo on the public Olist dataset</span>
          <span className="flex gap-3">
            <Link href="/privacy" className="underline hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
          </span>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-bold tabular-nums md:text-3xl">{value}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-card">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function WhyCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {number}
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Audience({
  icon,
  who,
  body,
}: {
  icon: ReactNode;
  who: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-6 shadow-card">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-ai/40 text-ai-foreground">
          {icon}
        </span>
        {who}
      </span>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
