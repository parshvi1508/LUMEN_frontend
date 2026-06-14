"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Plus, Users, ArrowRight, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatePanel, type StatePanelStatus } from "@/components/ui/StatePanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { useCampaignsList, useDeleteCampaign } from "@/hooks/useCampaigns";
import { isApiError } from "@/lib/api";
import type { CampaignOut } from "@/lib/schemas/campaign";
import { CAMPAIGN_STATUS_VARIANT, campaignStatusLabel, campaignStatusHint } from "./status";

export function CampaignsHub() {
  const router = useRouter();
  const query = useCampaignsList();
  const del = useDeleteCampaign();

  function onDelete(e: React.MouseEvent, c: CampaignOut) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete campaign "${c.name}"? This cannot be undone.`)) return;
    del.mutate(c.id, {
      onSuccess: () => toast.success(`Deleted "${c.name}"`),
      onError: () => toast.error("Couldn't delete the campaign."),
    });
  }

  const status: StatePanelStatus = query.isLoading
    ? "loading"
    : query.isError
      ? "error"
      : (query.data?.length ?? 0) === 0
        ? "empty"
        : "success";

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Reach a segment with a reasoned, approval-gated message. Watch delivery fill in real time."
        actions={
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Plus className="size-4" aria-hidden />
            New campaign
          </Link>
        }
      />

      <div className="px-6 py-6 md:px-8">
        <StatePanel<CampaignOut[]>
          status={status}
          data={query.data}
          error={isApiError(query.error) ? query.error.apiError : undefined}
          onRetry={() => query.refetch()}
          aria-label="Campaigns list"
          loading={
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          }
          empty={
            <div className="rounded-xl border border-border bg-surface-1">
              <EmptyState
                icon={<Megaphone className="size-8" aria-hidden />}
                title="No campaigns yet"
                description="Pick a segment and let the AI draft the message, or start from a goal and approve a full proposal."
                action={{
                  label: "Create your first campaign",
                  onClick: () => router.push("/campaigns/new"),
                }}
              />
            </div>
          }
        >
          {(campaigns) => (
            <Stagger className="space-y-2.5">
              {campaigns.map((c) => (
                <StaggerItem key={c.id}>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-surface-1 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Send className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.channel ?? "no channel"}
                        {c.created_at
                          ? ` · ${new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                          : ""}
                      </p>
                    </div>
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                      <Users className="size-3.5" aria-hidden />
                      {(c.audience_size ?? 0).toLocaleString("en-IN")}
                    </span>
                    <Badge
                      variant={CAMPAIGN_STATUS_VARIANT[c.status ?? "draft"] ?? "secondary"}
                      title={campaignStatusHint(c.status)}
                    >
                      {campaignStatusLabel(c.status)}
                    </Badge>
                    <button
                      type="button"
                      aria-label={`Delete campaign ${c.name}`}
                      onClick={(e) => onDelete(e, c)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </StatePanel>
      </div>
    </>
  );
}
