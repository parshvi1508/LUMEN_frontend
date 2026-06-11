"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X, Wand2, Mail, Sparkles } from "lucide-react";

export type ComingSoonAction = "segment" | "email";

const COPY: Record<ComingSoonAction, { title: string; icon: typeof Wand2; body: string }> = {
  segment: {
    title: "Segments are coming soon",
    icon: Wand2,
    body: "Soon you'll group these customers into a saved, reusable audience — by hand or from a plain-English prompt — then target them in a campaign.",
  },
  email: {
    title: "Campaigns are coming soon",
    icon: Mail,
    body: "Soon you'll draft AI-assisted message variants for these customers, review the reasoning, and dispatch — with nothing sending without your approval.",
  },
};

interface ActionComingSoonProps {
  action: ComingSoonAction | null;
  /** How many customers the action would have applied to. */
  count: number;
  onOpenChange: (open: boolean) => void;
}

export function ActionComingSoon({ action, count, onOpenChange }: ActionComingSoonProps) {
  const open = action !== null;
  const copy = action ? COPY[action] : null;
  const Icon = copy?.icon ?? Wand2;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ai-border bg-surface-3 shadow-overlay transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 focus:outline-none">
          <div className="flex items-start justify-between gap-4 p-6">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ai text-ai-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <Dialog.Title className="text-base font-semibold text-foreground">
                  {copy?.title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  {copy?.body}
                </Dialog.Description>
                {count > 0 && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ai-border bg-ai px-2.5 py-1 text-xs font-medium text-ai-foreground">
                    <Sparkles className="size-3" aria-hidden />
                    {count.toLocaleString("en-IN")} {count === 1 ? "customer" : "customers"} ready when it ships
                  </p>
                )}
              </div>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Dialog.Close className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
              Got it
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
