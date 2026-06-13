"use client";

import Link from "next/link";
import { useSegments } from "@/hooks/useSegments";

const selectCls =
  "h-8 w-full rounded-lg border border-border bg-surface-2 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50";

export function SegmentPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const { data, isLoading, isError } = useSegments();
  const segments = data ?? [];

  if (!isLoading && !isError && segments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No segments yet.{" "}
        <Link href="/segments" className="text-primary underline underline-offset-2">
          Build one first
        </Link>
        .
      </p>
    );
  }

  return (
    <select
      aria-label="Target segment"
      value={value ?? ""}
      disabled={isLoading}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
    >
      <option value="" disabled>
        {isLoading ? "Loading segments…" : "Select a segment"}
      </option>
      {segments.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
          {s.source === "ai" ? "  (AI)" : ""}
        </option>
      ))}
    </select>
  );
}
