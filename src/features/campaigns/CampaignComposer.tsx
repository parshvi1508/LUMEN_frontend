"use client";

import { useState } from "react";
import { ListChecks, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";
import { StandardFlow } from "./StandardFlow";
import { GoalFlow } from "./GoalFlow";

type Mode = "standard" | "goal";

const TABS: { id: Mode; label: string; hint: string; Icon: typeof Wand2 }[] = [
  {
    id: "standard",
    label: "Pick a segment",
    hint: "Segment → AI drafts → review → send",
    Icon: ListChecks,
  },
  {
    id: "goal",
    label: "Start from a goal",
    hint: "Agent proposes everything; you approve",
    Icon: Wand2,
  },
];

export function CampaignComposer() {
  const [mode, setMode] = useState<Mode>("standard");

  return (
    <>
      <PageHeader
        title="New campaign"
        description="Build a campaign yourself, or let the agent propose one from a goal. Either way, the AI's reasoning is on the table and nothing sends without your say-so."
      >
        <div role="tablist" aria-label="Campaign mode" className="flex flex-wrap gap-2">
          {TABS.map(({ id, label, hint, Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => setMode(id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface-2 hover:bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "size-4",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-6 py-6 md:px-8">
        {/* Plain-language orientation: most reviewers will not know the CRM terms. */}
        <p className="mb-4 rounded-lg border border-border bg-surface-1 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Segment</span> = a saved group
          of customers (for example, lapsed high-spenders).{" "}
          <span className="font-medium text-foreground">Campaign</span> = one message
          sent to one segment.{" "}
          {mode === "standard"
            ? "Here you pick the segment, the AI drafts the message, and you review before sending."
            : "Here you state a goal, the AI proposes the segment, channel, and message with its reasoning, and nothing sends until you approve."}
        </p>
        {mode === "standard" ? <StandardFlow /> : <GoalFlow />}
      </div>
    </>
  );
}
