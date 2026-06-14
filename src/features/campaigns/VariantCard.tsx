"use client";

import { Fragment, type ReactNode } from "react";
import { Check, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageVariant } from "@/lib/schemas/ai";

// Render {{first_name}} as a friendly chip ("first name"), never raw code.
function renderTokens(text: string): ReactNode {
  return text.split(/(\{\{\w+\}\})/g).map((part, i) =>
    /^\{\{\w+\}\}$/.test(part) ? (
      <span
        key={i}
        className="mx-0.5 rounded bg-primary/10 px-1 text-[0.95em] font-medium text-primary"
      >
        {part.replace(/[{}]/g, "").replace(/_/g, " ")}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

// Reasoning is shown prominently - it is the product thesis (explainable AI).
export function VariantCard({
  variant,
  selected,
  onSelect,
}: {
  variant: MessageVariant;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-surface-1 hover:bg-muted",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {variant.variant}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">{variant.tone}</Badge>
          {selected && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3.5" aria-hidden />
            </span>
          )}
        </div>
      </div>

      <p className="whitespace-pre-wrap rounded-lg bg-background px-2.5 py-2 text-sm text-foreground/90">
        {renderTokens(variant.message)}
      </p>

      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-ai-foreground" aria-hidden />
        <span>
          <span className="font-medium text-foreground/80">Why this fits: </span>
          {variant.reasoning}
        </span>
      </div>
    </button>
  );
}
