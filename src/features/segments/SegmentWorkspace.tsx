"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, CheckCircle2, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type StatePanelStatus } from "@/components/ui/StatePanel";
import { usePreviewSegment, useCreateSegment } from "@/hooks/useSegments";
import { toast } from "sonner";
import { isApiError } from "@/lib/api";
import type { SegmentGroup } from "@/lib/schemas/types";
import type { SegmentOut } from "@/lib/schemas/segment";
import type { NLToSegmentResponse } from "@/lib/schemas/ai";
import {
  astFromDefinition,
  definitionFromAst,
  groupComplete,
  leafCount,
  newGroup,
} from "./segment-fields";
import { RuleBuilder } from "./RuleBuilder";
import { PreviewPanel } from "./PreviewPanel";
import { AiPromptPanel } from "./AiPromptPanel";
import { SavedSegmentsList } from "./SavedSegmentsList";

export function SegmentWorkspace() {
  const [ast, setAst] = useState<SegmentGroup>(() => newGroup());
  const [name, setName] = useState("");
  const [source, setSource] = useState<"manual" | "ai">("manual");
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const preview = usePreviewSegment();
  const create = useCreateSegment();

  // Only build a wire definition when every rule is complete - never send a
  // payload the backend would 422 on.
  const complete = groupComplete(ast) && leafCount(ast) > 0;
  const wireDef = useMemo(
    () => (complete ? definitionFromAst(ast) : null),
    [ast, complete],
  );
  const defKey = useMemo(
    () => (wireDef ? JSON.stringify(wireDef) : null),
    [wireDef],
  );

  // Live preview: debounce edits, then re-query /segments/preview.
  useEffect(() => {
    if (!defKey || !wireDef) return;
    const t = setTimeout(() => preview.mutate({ definition: wireDef }), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defKey]);

  const previewStatus: StatePanelStatus = !wireDef
    ? "idle"
    : preview.isError && !preview.isPending
      ? "error"
      : preview.data
        ? preview.data.count === 0
          ? "empty"
          : "success"
        : "loading";

  function resetPreview() {
    preview.reset();
  }

  function applyAi(res: NLToSegmentResponse) {
    setAst(astFromDefinition(res.definition));
    setAiRationale(res.rationale);
    setAiWarnings(res.warnings ?? []);
    setSource("ai");
    setActiveId(null);
    setSaveError(null);
    resetPreview();
  }

  function loadSegment(seg: SegmentOut) {
    setAst(astFromDefinition(seg.definition));
    setName(seg.name);
    if (seg.source === "ai" && seg.ai_rationale) {
      setSource("ai");
      setAiRationale(seg.ai_rationale);
    } else {
      setSource("manual");
      setAiRationale(null);
    }
    setAiWarnings([]);
    setActiveId(seg.id);
    setSaveError(null);
    create.reset();
    resetPreview();
  }

  function startNew() {
    setAst(newGroup());
    setName("");
    setSource("manual");
    setAiRationale(null);
    setAiWarnings([]);
    setActiveId(null);
    setSaveError(null);
    create.reset();
    resetPreview();
  }

  async function save() {
    if (!wireDef || !name.trim()) return;
    setSaveError(null);
    try {
      await create.mutateAsync({
        name: name.trim(),
        definition: wireDef,
        source,
        ai_rationale: source === "ai" ? aiRationale : null,
      });
      toast.success(`Segment "${name.trim()}" saved`);
    } catch (err) {
      const msg = isApiError(err)
        ? err.apiError.message
        : "Couldn't save the segment.";
      setSaveError(msg);
      toast.error(msg);
    }
  }

  const canSave = Boolean(wireDef) && name.trim().length > 0;

  return (
    <>
      <PageHeader
        title="Segments"
        description="Build an audience in plain English or with rules. Preview who is included before you save."
      />

      <p className="mx-6 mt-6 rounded-lg border border-border bg-surface-1 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground md:mx-8">
        A <span className="font-medium text-foreground">segment</span> is a saved
        group of customers. Describe one in plain English and the AI writes the
        rules, or build them by hand. The{" "}
        <span className="font-medium text-foreground">audience preview</span> on the
        right shows exactly who is in, and each rule&apos;s reach, before you save.
      </p>

      <div className="grid grid-cols-1 gap-5 px-6 pb-6 pt-3 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)_360px]">
        {/* ── saved segments ── */}
        <SavedSegmentsList
          activeId={activeId}
          onLoad={loadSegment}
          onNew={startNew}
        />

        {/* ── builder column ── */}
        <div className="space-y-5">
          <AiPromptPanel
            rationale={aiRationale}
            warnings={aiWarnings}
            onApply={applyAi}
          />

          <section aria-label="Rule builder" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Rules</h2>
              {source === "ai" ? (
                <Badge variant="ai">AI-generated · editable</Badge>
              ) : (
                <Badge variant="secondary">Manual</Badge>
              )}
            </div>
            <RuleBuilder value={ast} onChange={setAst} />
            {!complete && (
              <p className="text-xs text-muted-foreground">
                Fill in every rule&apos;s value to preview the audience.
              </p>
            )}
          </section>

          {/* ── save bar ── */}
          <section
            aria-label="Save segment"
            className="rounded-xl border border-border bg-surface-1 p-4"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="segment-name"
                  className="mb-1 block text-xs font-medium text-foreground"
                >
                  Segment name
                </label>
                <Input
                  id="segment-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lapsed high-spenders"
                />
              </div>
              <AsyncButton
                onClick={save}
                loading={create.isPending}
                loadingText="Saving…"
                success={create.isSuccess}
                successText="Saved"
                disabled={!canSave}
              >
                {create.isSuccess ? (
                  <CheckCircle2 className="size-4" aria-hidden />
                ) : (
                  <Save className="size-4" aria-hidden />
                )}
                Save segment
              </AsyncButton>
              {create.isSuccess && (
                <button
                  type="button"
                  onClick={startNew}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  New
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Saved as{" "}
              <span className="font-medium">
                {source === "ai" ? "AI" : "manual"}
              </span>
              {source === "ai" && aiRationale
                ? ". The AI rationale is stored with it."
                : "."}
            </p>
            {saveError && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {saveError}
              </p>
            )}
          </section>
        </div>

        {/* ── preview rail ── */}
        <div>
          {wireDef ? (
            <PreviewPanel
              status={previewStatus}
              data={preview.data}
              error={
                isApiError(preview.error) ? preview.error.apiError : undefined
              }
              refreshing={preview.isPending && Boolean(preview.data)}
              onRetry={() => wireDef && preview.mutate({ definition: wireDef })}
            />
          ) : (
            <section
              aria-label="Audience preview"
              className="rounded-xl border border-dashed border-border bg-surface-1 p-6 text-center"
            >
              <p className="text-sm font-medium text-foreground">
                Audience preview
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add at least one complete rule to see the live count, per-rule
                reach, and a sample of who&apos;s in.
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
