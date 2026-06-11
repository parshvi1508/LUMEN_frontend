"use client";

import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckCircle2, Bell, Sparkles } from "lucide-react";

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

interface ComingSoonProps {
  title: string;
  description: string;
  /** Large hero icon. */
  icon: ReactNode;
  /** Plain-language teaser of what's coming. */
  pitch: ReactNode;
  features: Feature[];
}

/**
 * Honest "coming soon" landing — no fake data, no dead 404. Teases the real
 * roadmap and offers a notify affordance so a nav item always lands somewhere.
 */
export function ComingSoon({ title, description, icon, pitch, features }: ComingSoonProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        eyebrow={
          <span className="inline-flex items-center gap-1 text-ai-foreground">
            <Sparkles className="size-3" aria-hidden />
            In development
          </span>
        }
      />

      <div className="px-6 md:px-8 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Hero */}
          <div className="rounded-2xl border border-ai-border bg-ai p-8 shadow-ai">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ai-accent/15 text-ai-foreground">
                {icon}
              </span>
              <div>
                <p className="text-lg font-semibold text-foreground">{pitch}</p>
                <NotifyForm surface={title} />
              </div>
            </div>
          </div>

          {/* What's coming */}
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            What&apos;s coming
          </h2>
          <ul role="list" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li
                key={f.title}
                className="flex gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-card"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function NotifyForm({ surface }: { surface: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError(true);
      return;
    }
    setError(false);
    setDone(value);
  }

  if (done) {
    return (
      <div
        role="status"
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-success-border bg-success px-3.5 py-2.5 text-sm text-success-foreground"
      >
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        You&apos;re on the list — we&apos;ll email <span className="font-medium">{done}</span> when{" "}
        {surface} ships.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="notify-email" className="sr-only">
            Email address
          </label>
          <input
            id="notify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@brand.com"
            aria-invalid={error || undefined}
            aria-describedby={error ? "notify-error" : undefined}
            className="h-9 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-danger-border aria-invalid:ring-danger-border/40"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-ai-accent px-4 text-sm font-semibold text-[oklch(0.20_0.02_60)] shadow-sm transition-colors hover:bg-ai-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-accent"
        >
          <Bell className="size-4" aria-hidden />
          Notify me
        </button>
      </div>
      {error && (
        <p id="notify-error" className="mt-1.5 text-xs text-danger-foreground">
          Enter a valid email address.
        </p>
      )}
    </form>
  );
}
