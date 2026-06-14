"use client";

import { useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "./TierBadge";
import { deriveTier } from "@/lib/customer-tier";
import type { Customer } from "@/lib/schemas/customer";
import { X, MapPin, Mail, Calendar, Store, Plug, Tag as TagIcon, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDetailSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailSheet({
  customer,
  open,
  onOpenChange,
}: CustomerDetailSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 bg-black/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 z-40" />
        <Drawer.Popup
          className={cn(
            "fixed right-0 top-0 bottom-0 z-50 flex flex-col",
            "w-full max-w-md bg-surface-2 shadow-overlay",
            "translate-x-0 transition-transform duration-200 ease-out",
            "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
            "focus:outline-none",
          )}
        >
          <Drawer.Title className="sr-only">
            {customer ? `${customer.name} - customer details` : "Customer details"}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Customer profile, statistics, notes, and tags
          </Drawer.Description>

          {customer ? (
            <SheetContent key={customer.id} customer={customer} onClose={() => onOpenChange(false)} />
          ) : (
            <SheetSkeleton onClose={() => onOpenChange(false)} />
          )}
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// ── Loaded content ─────────────────────────────────────────────────────────────

function SheetContent({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const memberSince = formatRelativeTime(customer.created_at);
  const tier = deriveTier(customer);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-4 min-w-0">
          <div
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm select-none"
          >
            {customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground leading-tight truncate">
                {customer.name}
              </h2>
              <TierBadge tier={tier} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Member {memberSince}</p>
          </div>
        </div>
        <Drawer.Close
          aria-label="Close customer details"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden />
        </Drawer.Close>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 space-y-6">
          {/* Contact info */}
          <section aria-label="Contact information">
            <SectionLabel>Contact</SectionLabel>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" aria-hidden />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-foreground hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded truncate"
                >
                  {customer.email}
                </a>
              </li>
              {customer.city && (
                <li className="flex items-center gap-2.5 text-sm">
                  <MapPin className="size-4 text-muted-foreground shrink-0" aria-hidden />
                  <span className="text-foreground">{customer.city}</span>
                </li>
              )}
              <li className="flex items-center gap-2.5 text-sm">
                <Calendar className="size-4 text-muted-foreground shrink-0" aria-hidden />
                <span className="text-foreground">
                  Joined{" "}
                  <time dateTime={customer.created_at}>
                    {new Date(customer.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
              </li>
            </ul>
          </section>

          <Separator />

          {/* Stats */}
          <section aria-label="Customer statistics">
            <SectionLabel>Lifetime stats</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total spend" value={formatCurrency(customer.total_spend)} />
              <StatCard label="Orders" value={String(customer.order_count)} />
              {customer.order_count > 0 && (
                <StatCard
                  label="Avg. order value"
                  value={formatCurrency(Math.round(customer.total_spend / customer.order_count))}
                />
              )}
              {customer.last_order_at && (
                <StatCard label="Last order" value={formatRelativeTime(customer.last_order_at)} />
              )}
            </div>
          </section>

          <Separator />

          {/* Orders - honest empty state, no fabricated history */}
          <section aria-label="Order history">
            <SectionLabel>Orders</SectionLabel>
            <div className="rounded-xl border border-dashed border-border bg-surface-1 px-5 py-6 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Store className="size-5" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Connect your store to see order history
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lumen will pull this customer&apos;s real orders, refunds, and timeline once a store
                is linked.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <IntegrationPill name="Shopify" />
                <IntegrationPill name="Klaviyo" />
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Plug className="size-4" aria-hidden />
                Connect a store
                <Badge variant="ai" className="ml-1">Soon</Badge>
              </button>
            </div>
          </section>

          <Separator />

          {/* Tags + Notes - local affordances, clearly not yet synced */}
          <TagsEditor />
          <NotesEditor />
        </div>
      </ScrollArea>
    </>
  );
}

function IntegrationPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-chart-3" aria-hidden />
      {name}
    </span>
  );
}

function TagsEditor() {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function add(value: string) {
    const v = value.trim();
    if (v && !tags.includes(v)) setTags((t) => [...t, v]);
    setInput("");
  }

  return (
    <section aria-label="Tags">
      <div className="flex items-center justify-between">
        <SectionLabel className="mb-0 flex items-center gap-1.5">
          <TagIcon className="size-3.5" aria-hidden />
          Tags
        </SectionLabel>
        <span className="text-[10px] font-medium text-muted-foreground">not synced yet</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => setTags((t) => t.filter((x) => x !== tag))}
              className="flex size-3.5 items-center justify-center rounded-full hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-3" aria-hidden />
            </button>
          </Badge>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={tags.length ? "Add tag…" : "e.g. wholesale, vip-list…"}
          aria-label="Add a tag"
          className="h-7 min-w-28 flex-1 rounded-md border border-border bg-surface-1 px-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>
    </section>
  );
}

function NotesEditor() {
  const [notes, setNotes] = useState("");
  return (
    <section aria-label="Notes">
      <div className="flex items-center justify-between">
        <SectionLabel className="mb-0 flex items-center gap-1.5">
          <StickyNote className="size-3.5" aria-hidden />
          Notes
        </SectionLabel>
        <span className="text-[10px] font-medium text-muted-foreground">not synced yet</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Add context for your team - preferences, past conversations, anything useful."
        aria-label="Customer notes"
        className="mt-3 w-full resize-y rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      />
    </section>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3",
        className,
      )}
    >
      {children}
    </p>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 px-3.5 py-3">
      <p className="text-xs text-muted-foreground leading-none">{label}</p>
      <p className="mt-1.5 text-base font-semibold tabular-nums text-foreground leading-none truncate">
        {value}
      </p>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function SheetSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-4">
          <Skeleton className="size-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-3/4" : "w-1/2")} />
        ))}
      </div>
    </>
  );
}
