"use client";

import { Plus, Layers } from "lucide-react";
import { StatePanel, type StatePanelStatus } from "@/components/ui/StatePanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSegments } from "@/hooks/useSegments";
import { isApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SegmentOut } from "@/lib/schemas/segment";

export function SavedSegmentsList({
  activeId,
  onLoad,
  onNew,
}: {
  activeId: string | null;
  onLoad: (seg: SegmentOut) => void;
  onNew: () => void;
}) {
  const query = useSegments();

  const status: StatePanelStatus = query.isLoading
    ? "loading"
    : query.isError
      ? "error"
      : (query.data?.length ?? 0) === 0
        ? "empty"
        : "success";

  return (
    <aside
      aria-label="Saved segments"
      className="rounded-xl border border-border bg-surface-1 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Saved</h2>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Plus className="size-3.5" aria-hidden />
          New
        </button>
      </div>

      <StatePanel<SegmentOut[]>
        status={status}
        data={query.data}
        error={isApiError(query.error) ? query.error.apiError : undefined}
        onRetry={() => query.refetch()}
        aria-label="Saved segments list"
        loading={
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        }
        empty={
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Layers className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-xs text-muted-foreground">
              No saved segments yet. Build one and save it.
            </p>
          </div>
        }
      >
        {(segments) => (
          <ul className="space-y-1.5">
            {segments.map((seg) => (
              <li key={seg.id}>
                <button
                  type="button"
                  onClick={() => onLoad(seg)}
                  aria-current={activeId === seg.id || undefined}
                  className={cn(
                    "w-full rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                    activeId === seg.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {seg.name}
                    </span>
                    {seg.source === "ai" && (
                      <Badge variant="ai" className="shrink-0">
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(seg.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </StatePanel>
    </aside>
  );
}
