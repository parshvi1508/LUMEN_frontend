"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  ShieldCheck,
  Users,
  Send,
  CheckCircle2,
  ArrowRight,
  Layers,
  Radio,
} from "lucide-react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isApiError } from "@/lib/api";
import { useProposeCampaign } from "@/hooks/useAi";
import { getCampaign, createCampaign, dispatchCampaign } from "@/lib/api/campaigns";
import type { Channel } from "@/lib/schemas/types";
import { ChannelPicker } from "./ChannelPicker";
import { VariantCard } from "./VariantCard";
import { MessageEditorPreview } from "./MessageEditorPreview";
import { SegmentRulesView } from "./SegmentRulesView";

function errText(err: unknown, fallback: string): string {
  return isApiError(err) ? err.apiError.message : fallback;
}

export function GoalFlow() {
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [resultId, setResultId] = useState<string | null>(null);
  const [approveErr, setApproveErr] = useState<string | null>(null);

  const propose = useProposeCampaign();
  const proposal = propose.data;

  async function onPropose() {
    if (!goal.trim()) return;
    setApproveErr(null);
    setResultId(null);
    setPhase("idle");
    try {
      const res = await propose.mutateAsync({ goal: goal.trim() });
      // seed the editable proposal from the AI's recommendation
      setChannel(res.recommended_channel as Channel);
      setSelectedIdx(0);
      setMessage(res.variants[0]?.message ?? "");
      setName(`Proposed: ${goal.trim().slice(0, 50)}`);
    } catch {
      /* surfaced via propose.error */
    }
  }

  // Approve = create a campaign from the (edited) proposal, then dispatch.
  // We deliberately rebuild via /campaigns + /dispatch so the edits are honored;
  // the backend approve/execute endpoints take no body and would ship the
  // original proposal unchanged. See summary note.
  async function onApprove() {
    if (!proposal) return;
    setApproveErr(null);
    setPhase("working");
    try {
      const proposalCampaign = await getCampaign(proposal.campaign_id);
      if (!proposalCampaign.segment_id) {
        throw new Error("Proposal is missing its segment.");
      }
      const created = await createCampaign({
        name: name.trim() || "Proposed campaign",
        segment_id: proposalCampaign.segment_id,
        channel,
        message_template: message,
      });
      await dispatchCampaign(created.id);
      setResultId(created.id);
      setPhase("done");
    } catch (err) {
      setApproveErr(errText(err, "Approve & dispatch failed."));
      setPhase("idle");
    }
  }

  function reset() {
    setGoal("");
    setMessage("");
    setName("");
    setSelectedIdx(0);
    setPhase("idle");
    setResultId(null);
    setApproveErr(null);
    propose.reset();
  }

  if (phase === "done" && resultId) {
    return (
      <div className="rounded-xl border border-success-border bg-success p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-success-foreground" aria-hidden />
        <p className="mt-2 text-sm font-semibold text-foreground">
          Approved & dispatched
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          The campaign is live. Watch the funnel fill in real time.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href={`/campaigns/${resultId}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            View live funnel
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            New goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* goal input */}
      <section className="rounded-xl border border-ai-border bg-ai/40 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="size-4 text-ai-foreground" aria-hidden />
          <h3 className="text-sm font-semibold text-foreground">
            State a goal - the agent proposes everything
          </h3>
        </div>
        <textarea
          aria-label="Campaign goal"
          rows={2}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Win back lapsed high-spenders this weekend"
          className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Proposes a segment, channel, and copy - for your review.
          </span>
          <AsyncButton
            onClick={onPropose}
            loading={propose.isPending}
            loadingText="Thinking…"
            disabled={!goal.trim()}
            size="sm"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Propose campaign
          </AsyncButton>
        </div>
        {propose.isError && (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {errText(propose.error, "Couldn't generate a proposal.")}
          </p>
        )}
      </section>

      {proposal && (
        <div className="overflow-hidden rounded-xl border-2 border-ai-border">
          {/* not-sent ribbon */}
          <div className="flex items-center gap-2 bg-ai px-4 py-2">
            <Badge variant="ai">AI proposal</Badge>
            <span className="text-xs font-medium text-ai-foreground">
              Draft only - nothing has been created or sent. Edit anything below.
            </span>
          </div>

          <div className="space-y-5 p-4">
            {/* segment */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Layers className="size-4 text-muted-foreground" aria-hidden />
                  Proposed segment
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" aria-hidden />
                  {(proposal.audience_size ?? 0).toLocaleString("en-IN")} customers
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-1 p-3 space-y-2">
                <p className="text-xs leading-relaxed text-foreground/90">
                  {proposal.segment_rationale}
                </p>
                <div className="border-t border-border pt-2">
                  <SegmentRulesView definition={proposal.segment_definition} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Segment is read-only here - to change the audience, build it on the
                  Segments page first.
                </p>
              </div>
            </div>

            {/* channel + reasoning */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Radio className="size-4 text-muted-foreground" aria-hidden />
                Channel
              </h4>
              <div className="mb-2 flex items-start gap-1.5 rounded-lg bg-ai/40 px-3 py-2 text-xs text-foreground/90">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ai-foreground" aria-hidden />
                <span>
                  <span className="font-medium">Why {proposal.recommended_channel}: </span>
                  {proposal.channel_reasoning}
                </span>
              </div>
              <ChannelPicker
                value={channel}
                onChange={setChannel}
                recommended={proposal.recommended_channel as Channel}
              />
            </div>

            {/* variants */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Message - pick a variant, then edit
              </h4>
              <div className="grid gap-2.5 md:grid-cols-3">
                {proposal.variants.map((v, i) => (
                  <VariantCard
                    key={i}
                    variant={v}
                    selected={selectedIdx === i}
                    onSelect={() => {
                      setSelectedIdx(i);
                      setMessage(v.message);
                    }}
                  />
                ))}
              </div>
              <div className="mt-3">
                <MessageEditorPreview value={message} onChange={setMessage} />
              </div>
            </div>

            {/* name */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">
                Campaign name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          {/* ── human-in-the-loop boundary ── */}
          <div className="border-t-2 border-dashed border-ai-border bg-surface-1 px-4 py-4">
            <div className="mb-3 flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-ai-foreground" aria-hidden />
              <p className="text-xs text-muted-foreground">
                Everything above is a proposal. Approving creates the campaign and{" "}
                <span className="font-medium text-foreground">
                  immediately dispatches
                </span>{" "}
                to {(proposal.audience_size ?? 0).toLocaleString("en-IN")} customers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AsyncButton
                onClick={onApprove}
                loading={phase === "working"}
                loadingText="Approving & dispatching…"
                disabled={!message.trim() || (proposal.audience_size ?? 0) === 0}
              >
                <ShieldCheck className="size-4" aria-hidden />
                Approve & dispatch
              </AsyncButton>
              <button
                type="button"
                onClick={reset}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Discard proposal
              </button>
            </div>
            {(proposal.audience_size ?? 0) === 0 && (
              <p className="mt-2 text-xs text-warning-foreground">
                Proposed segment matches no customers - nothing to send.
              </p>
            )}
            {approveErr && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {approveErr}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
