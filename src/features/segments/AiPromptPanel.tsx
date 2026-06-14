"use client";

import { useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Badge } from "@/components/ui/badge";
import { useNlToSegment } from "@/hooks/useAi";
import { isApiError } from "@/lib/api";
import type { NLToSegmentResponse } from "@/lib/schemas/ai";

export function AiPromptPanel({
  rationale,
  warnings,
  onApply,
}: {
  rationale: string | null;
  warnings: string[];
  onApply: (res: NLToSegmentResponse) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const mutation = useNlToSegment();

  async function generate() {
    if (!prompt.trim()) return;
    setErrorMsg(null);
    setFallback(false);
    try {
      const res = await mutation.mutateAsync({ prompt: prompt.trim() });
      onApply(res);
    } catch (err) {
      if (isApiError(err)) {
        setErrorMsg(err.apiError.message);
        setFallback(Boolean(err.apiError.manualFallback));
      } else {
        setErrorMsg("Couldn't generate a segment. Try rephrasing.");
      }
    }
  }

  return (
    <section
      aria-label="Describe your segment"
      className="rounded-xl border border-ai-border bg-ai/40 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-ai-foreground" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">
          Describe your segment
        </h2>
      </div>
      <p className="mb-2.5 text-xs text-muted-foreground">
        Plain English - the AI returns rules you can review and edit below.
      </p>

      <textarea
        aria-label="Segment description"
        rows={2}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
        }}
        placeholder="High spenders in Mumbai who haven't ordered in 90 days"
        className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      />

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">⌘/Ctrl + Enter</span>
        <AsyncButton
          onClick={generate}
          loading={mutation.isPending}
          loadingText="Generating…"
          disabled={!prompt.trim()}
          variant="default"
          size="sm"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Generate segment
        </AsyncButton>
      </div>

      {errorMsg && (
        <div role="alert" className="mt-3 space-y-1">
          <p className="text-xs text-destructive">{errorMsg}</p>
          {fallback && (
            <p className="text-xs text-muted-foreground">
              Build the rules manually below - the visual builder works the same way.
            </p>
          )}
        </div>
      )}

      {/* rationale + warnings for the currently applied AI segment */}
      {rationale && (
        <div className="mt-3 space-y-2 border-t border-ai-border/60 pt-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="ai">AI rationale</Badge>
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{rationale}</p>
          {warnings.length > 0 && (
            <ul className="space-y-1 pt-0.5">
              {warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-warning-foreground"
                >
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
