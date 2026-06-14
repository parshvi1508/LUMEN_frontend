"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, CheckCircle2, Users, ArrowRight } from "lucide-react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api";
import { useDraftMessages } from "@/hooks/useAi";
import { useCreateCampaign, useDispatchCampaign } from "@/hooks/useCampaigns";
import type { Channel } from "@/lib/schemas/types";
import { SegmentPicker } from "./SegmentPicker";
import { ChannelPicker } from "./ChannelPicker";
import { VariantCard } from "./VariantCard";
import { MessageEditorPreview } from "./MessageEditorPreview";

function errText(err: unknown, fallback: string): string {
  return isApiError(err) ? err.apiError.message : fallback;
}

export function StandardFlow() {
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [intent, setIntent] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [name, setName] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const draft = useDraftMessages();
  const create = useCreateCampaign();
  const dispatch = useDispatchCampaign();

  const created = create.data;
  const dispatched = dispatch.isSuccess;
  const locked = Boolean(created); // once created, compose is frozen

  async function onDraft() {
    if (!segmentId || !intent.trim()) return;
    setSelectedIdx(null);
    await draft
      .mutateAsync({
        campaign_intent: intent.trim(),
        segment_id: segmentId,
        channel,
      })
      .catch(() => {}); // surfaced via draft.error below
  }

  async function onCreate() {
    if (!segmentId || !name.trim() || !message.trim()) return;
    await create
      .mutateAsync({
        name: name.trim(),
        segment_id: segmentId,
        channel,
        message_template: message,
      })
      .catch(() => {});
  }

  async function onDispatch() {
    if (!created) return;
    await dispatch.mutateAsync(created.id).catch(() => {});
  }

  function reset() {
    setSegmentId(null);
    setIntent("");
    setName("");
    setSelectedIdx(null);
    setMessage("");
    draft.reset();
    create.reset();
    dispatch.reset();
  }

  // ── success ──
  if (dispatched && created) {
    return (
      <SuccessCard
        id={created.id}
        audience={created.audience_size ?? 0}
        onReset={reset}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* 1 · setup */}
      <Section step={1} title="Who and why">
        <Field label="Target segment">
          <SegmentPicker value={segmentId} onChange={setSegmentId} />
        </Field>
        <Field label="Campaign intent" hint="What you want this campaign to achieve. The AI uses it to draft copy.">
          <textarea
            rows={2}
            value={intent}
            disabled={locked}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Win back lapsed high-spenders with a weekend offer"
            className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
          />
        </Field>
        <Field label="Channel">
          <ChannelPicker value={channel} onChange={setChannel} />
        </Field>
        <div>
          <AsyncButton
            onClick={onDraft}
            loading={draft.isPending}
            loadingText="Drafting…"
            disabled={!segmentId || !intent.trim() || locked}
            variant="secondary"
            size="sm"
          >
            <Sparkles className="size-3.5" aria-hidden />
            {draft.data ? "Re-draft messages" : "Draft 3 messages"}
          </AsyncButton>
          {draft.isError && (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {errText(draft.error, "Couldn't draft messages.")}
            </p>
          )}
        </div>
      </Section>

      {/* 2 · variants */}
      {draft.data && (
        <Section step={2} title="Pick a draft" subtitle="Each variant ships with the AI's reasoning. Select one to use as your starting point, then edit it.">
          <div className="grid gap-2.5 md:grid-cols-3">
            {draft.data.variants.map((v, i) => (
              <VariantCard
                key={i}
                variant={v}
                selected={selectedIdx === i}
                onSelect={() => {
                  if (locked) return;
                  setSelectedIdx(i);
                  setMessage(v.message);
                }}
              />
            ))}
          </div>
        </Section>
      )}

      {/* 3 · message + name */}
      <Section step={3} title="Compose & preview">
        <fieldset disabled={locked} className="space-y-3 disabled:opacity-60">
          <MessageEditorPreview value={message} onChange={setMessage} label="Message template" />
          <Field label="Campaign name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend win-back"
            />
          </Field>
        </fieldset>
      </Section>

      {/* 4 · create + dispatch (human-in-the-loop boundary) */}
      <Section step={4} title="Review & send">
        {!created ? (
          <>
            <AsyncButton
              onClick={onCreate}
              loading={create.isPending}
              loadingText="Creating…"
              disabled={!segmentId || !name.trim() || !message.trim()}
            >
              <ArrowRight className="size-4" aria-hidden />
              Create draft campaign
            </AsyncButton>
            {create.isError && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errText(create.error, "Couldn't create the campaign.")}
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Creating builds the campaign and renders a message per customer, but
              sends nothing until you dispatch.
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 px-4 py-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums leading-none text-foreground">
                  {(created.audience_size ?? 0).toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  customers will receive this {created.channel} message
                </p>
              </div>
            </div>
            {(created.audience_size ?? 0) === 0 ? (
              <p className="text-xs text-warning-foreground">
                This segment has no customers, so nothing would be sent. Adjust the
                segment, then start over.
              </p>
            ) : (
              <AsyncButton
                onClick={onDispatch}
                loading={dispatch.isPending}
                loadingText="Dispatching…"
              >
                <Send className="size-4" aria-hidden />
                Dispatch to {(created.audience_size ?? 0).toLocaleString("en-IN")}
              </AsyncButton>
            )}
            {dispatch.isError && (
              <p role="alert" className="text-xs text-destructive">
                {errText(dispatch.error, "Dispatch failed.")}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Start over
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}

// ── small layout helpers ──
function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-1 p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3 pl-8">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SuccessCard({
  id,
  audience,
  onReset,
}: {
  id: string;
  audience: number;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-success-border bg-success p-6 text-center">
      <CheckCircle2 className="mx-auto size-8 text-success-foreground" aria-hidden />
      <p className="mt-2 text-sm font-semibold text-foreground">
        Campaign dispatched
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {audience.toLocaleString("en-IN")} messages queued to the channel (simulated).
        Watch the funnel fill in real time.
      </p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Link
          href={`/campaigns/${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          View live funnel
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Create another
        </button>
      </div>
    </div>
  );
}
