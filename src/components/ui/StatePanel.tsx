"use client";

import type { ReactNode } from "react";
import type { ApiError } from "@/lib/api";

export type StatePanelStatus = "idle" | "loading" | "empty" | "error" | "success";

interface StatePanelProps<T> {
  status: StatePanelStatus;
  data?: T;
  error?: ApiError;
  // render slots
  loading?: ReactNode;
  empty?: ReactNode;
  errorSlot?: (error: ApiError, retry: () => void) => ReactNode;
  children: (data: T) => ReactNode;
  // a11y
  "aria-label"?: string;
  // Wrap in aria-live="polite" for polling surfaces (e.g. CampaignFunnel)
  liveRegion?: boolean;
  // For error retry — caller supplies this when status === "error"
  onRetry?: () => void;
}

function DefaultSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  );
}

function DefaultError({
  error,
  retry,
}: {
  error: ApiError;
  retry: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col gap-2 text-sm text-destructive">
      <p>{error.message}</p>
      <button
        type="button"
        onClick={retry}
        className="self-start underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        Try again
      </button>
    </div>
  );
}

export function StatePanel<T>({
  status,
  data,
  error,
  loading,
  empty,
  errorSlot,
  children,
  "aria-label": ariaLabel,
  liveRegion = false,
  onRetry,
}: StatePanelProps<T>) {
  const retry = onRetry ?? (() => {});

  let content: ReactNode;

  switch (status) {
    case "idle":
      content = null;
      break;
    case "loading":
      content = loading ?? <DefaultSkeleton />;
      break;
    case "empty":
      content = empty ?? null;
      break;
    case "error":
      content =
        error != null
          ? (errorSlot?.(error, retry) ?? (
              <DefaultError error={error} retry={retry} />
            ))
          : null;
      break;
    case "success":
      // data is guaranteed non-null at success — spec §3.2
      if (data == null) return null;
      content = children(data);
      break;
  }

  return (
    <div
      aria-label={ariaLabel}
      aria-live={liveRegion ? "polite" : undefined}
      aria-busy={status === "loading" ? true : undefined}
    >
      {content}
    </div>
  );
}
