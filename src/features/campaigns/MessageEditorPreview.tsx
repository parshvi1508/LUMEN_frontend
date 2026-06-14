"use client";

import { AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KNOWN_TOKENS,
  SAMPLE_FIELDS,
  renderPreview,
  unknownTokens,
} from "./tokens";

export function MessageEditorPreview({
  value,
  onChange,
  label = "Message",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const unknown = unknownTokens(value);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-foreground">{label}</label>
      <textarea
        aria-label={label}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      />

      {/* token palette */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">Insert:</span>
        {KNOWN_TOKENS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(`${value}${value.endsWith(" ") || !value ? "" : " "}{{${t}}}`)}
            className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {`{{${t}}}`}
          </button>
        ))}
      </div>

      {unknown.length > 0 && (
        <p className="flex items-start gap-1.5 text-xs text-warning-foreground">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Unknown token{unknown.length > 1 ? "s" : ""}{" "}
            <span className="font-mono">{unknown.map((t) => `{{${t}}}`).join(", ")}</span>{" "}
            will be sent literally - only {KNOWN_TOKENS.map((t) => `{{${t}}}`).join(", ")} are
            substituted.
          </span>
        </p>
      )}

      {/* live preview */}
      <div className="rounded-lg border border-border bg-surface-1 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Eye className="size-3.5" aria-hidden />
          Preview for {SAMPLE_FIELDS.name}
        </div>
        <p className={cn("whitespace-pre-wrap text-sm", value ? "text-foreground" : "text-muted-foreground")}>
          {value ? renderPreview(value) : "Your message preview shows here."}
        </p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Sample values - each customer gets their own at send time.
        </p>
      </div>
    </div>
  );
}
