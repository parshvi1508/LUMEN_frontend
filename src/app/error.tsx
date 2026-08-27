"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-danger/20">
        <AlertTriangle className="size-6 text-danger-foreground" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. Try refreshing, or head back to the
          dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
