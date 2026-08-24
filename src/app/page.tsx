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
  title: `${BRAND.name} - see which customers are leaking revenue`,
  description:
    "Lumen scores every customer for churn risk and value, shows the reason behind each score, and tells you who to win back and what it is worth.",
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
            Explainable customer intelligence
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            See which customers are quietly{" "}
            <span className="bg-gradient-to-r from-primary to-ai-accent bg-clip-text text-transparent">
              leaking revenue
            </span>
            , and exactly who to win back.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Most CRMs store customers. {BRAND.name} scores every one for churn
            risk and value, shows the reason behind each score, and hands your
            team a ranked action list with the money attached.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Open the revenue radar
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              Sign in
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          <Stat value="95,420" label="customers scored" />
          <Stat value="0.01" label="calibration Brier, from 0.21" />
          <Stat value="SHAP" label="reason on every score" />
          <Stat value="R$ P&L" label="real attributed revenue" />
        </dl>
      </section>

      <section className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            The problem
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold md:text-3xl">
            You have thousands of customers. Some are churning right now. You
            cannot see which, or what it is costing you.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              icon={<TrendingDown className="size-5" aria-hidden />}
              title="Find the leak"
              body="Every customer is scored for reactivation risk and value. The dashboard leads with the revenue at risk across your dormant base."
            />
            <Feature
              icon={<Brain className="size-5" aria-hidden />}
              title="Trust the score"
              body="Each score ships with its SHAP reasons, so your team sees why a customer is flagged, not just a number they have to take on faith."
            />
            <Feature
              icon={<Target className="size-5" aria-hidden />}
              title="Act and measure"
              body="Launch a win-back campaign on the flagged segment, then watch real attributed revenue and P&L, not a vanity open rate."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Audience
            icon={<Target className="size-5" aria-hidden />}
            who="For the marketer"
            body="A ranked worklist: who to message today, why, and one click to launch the campaign. No spreadsheets, no guessing."
          />
          <Audience
            icon={<LineChart className="size-5" aria-hidden />}
            who="For the CMO"
            body="Revenue at risk, recoverable value, and per-campaign P&L. Proof the spend pays for itself, in Reais."
          />
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
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Open the revenue radar
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground">
          {BRAND.name} · Explainable customer intelligence · Demo on the public
          Olist dataset
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
