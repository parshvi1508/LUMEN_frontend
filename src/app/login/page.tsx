"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Zap,
  Crown,
  Wand2,
  ShieldCheck,
  TriangleAlert,
  Sparkles,
  IndianRupee,
  Users,
} from "lucide-react";

type SignInState =
  | { id: "idle" }
  | { id: "loading" }
  | { id: "error"; kind: "denied" | "network" | "blocked" | "generic"; message: string };

const ERROR_COPY: Record<"denied" | "network" | "blocked" | "generic", string> = {
  denied: "Sign-in was cancelled. Approve the Google prompt to continue.",
  network: "Couldn't reach the sign-in service. Check your connection and try again.",
  blocked: "Your browser blocked the sign-in window. Allow pop-ups for this site and retry.",
  generic: "Sign-in failed. Please try again.",
};

const PROOF = [
  {
    icon: Crown,
    title: "Tiers on arrival",
    body: "Every customer scored VIP, active, at-risk, or churned the moment you land.",
  },
  {
    icon: Wand2,
    title: "Segments in one click",
    body: "Turn “who hasn't ordered in 60 days?” into a live audience - no SQL.",
  },
  {
    icon: ShieldCheck,
    title: "AI proposes, you approve",
    body: "Drafts come with their reasoning attached. Nothing sends without your sign-off.",
  },
];

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [state, setState] = useState<SignInState>({ id: "idle" });

  // Surface OAuth errors forwarded by /auth/callback (e.g. user declined).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    const kind = /denied|cancel/i.test(error) ? "denied" : "generic";
    // Surfacing an OAuth error forwarded in the URL is a legitimate sync from
    // an external system (the callback redirect), not a render-derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ id: "error", kind, message: ERROR_COPY[kind] });
    // Clean the URL so a refresh doesn't re-show the error.
    window.history.replaceState({}, "", "/login");
  }, []);

  async function signInWithGoogle() {
    setState({ id: "loading" });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        const kind = /popup|window/i.test(error.message)
          ? "blocked"
          : /network|fetch|connect/i.test(error.message)
            ? "network"
            : "generic";
        setState({ id: "error", kind, message: ERROR_COPY[kind] });
      }
      // On success the browser redirects to Google; loading state persists.
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      const kind = /network|fetch|connect/i.test(message) ? "network" : "generic";
      setState({ id: "error", kind, message: ERROR_COPY[kind] });
    }
  }

  const loading = state.id === "loading";

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: value prop + product preview ── */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-surface-1 p-10 lg:flex xl:p-14">
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-10 size-72 rounded-full bg-ai-accent/15 blur-3xl"
        />

        <div className="relative flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="size-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">Lumen</span>
        </div>

        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ai-border bg-ai px-3 py-1 text-xs font-medium text-ai-foreground">
            <Sparkles className="size-3" aria-hidden />
            AI-native marketing CRM for D2C
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground xl:text-4xl">
            From customer list to approved campaign - without code, SQL, or guesswork.
          </h1>

          {/* Product preview - a real slice of the dashboard's visual system */}
          <DashboardPreview />

          <ul className="mt-8 space-y-4">
            {PROOF.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-primary shadow-card">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Trusted with your customer data - read-only until you say otherwise.
        </p>
      </section>

      {/* ── Right: sign-in ── */}
      <section className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand (left panel hidden) */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="size-4 text-primary-foreground" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">Lumen</span>
          </div>

          <div className="rounded-2xl border border-border bg-surface-2 p-8 shadow-raised">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your workspace to continue.
            </p>

            {state.id === "error" && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger-border bg-danger px-3.5 py-3 text-sm text-danger-foreground"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>{state.message}</p>
              </div>
            )}

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              aria-busy={loading || undefined}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {loading ? (
                <>
                  <Spinner />
                  Connecting to Google…
                </>
              ) : (
                <>
                  <GoogleMark />
                  Continue with Google
                </>
              )}
            </button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to Lumen&apos;s Terms and acknowledge our Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardPreview() {
  return (
    <div
      aria-hidden
      className="mt-8 rounded-xl border border-border bg-surface-2 p-3 shadow-raised"
    >
      <div className="grid grid-cols-3 gap-2">
        <PreviewKpi icon={<Users className="size-3" />} label="Customers" value="2,481" tone="bg-muted text-muted-foreground" />
        <PreviewKpi icon={<IndianRupee className="size-3" />} label="Spend" value="₹38.2L" tone="bg-success text-success-foreground" />
        <PreviewKpi icon={<TriangleAlert className="size-3" />} label="At-risk" value="142" tone="bg-warning text-warning-foreground" />
      </div>
      <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-ai-border bg-ai px-3 py-2 shadow-ai">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ai-accent/15 text-ai-foreground">
          <Sparkles className="size-3" />
        </span>
        <p className="text-[11px] leading-tight text-foreground">
          <span className="font-semibold">142 customers</span> haven&apos;t ordered in 60 days -
          <span className="font-medium text-ai-foreground"> create a win-back segment</span>
        </p>
      </div>
    </div>
  );
}

function PreviewKpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className={`flex size-4 items-center justify-center rounded ${tone}`}>{icon}</span>
      </div>
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z" />
    </svg>
  );
}
