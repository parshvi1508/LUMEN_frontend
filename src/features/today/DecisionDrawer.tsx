"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@base-ui/react/drawer";
import { Target, TrendingUp, Brain, X, Mail, MessageSquare, Smartphone } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useWinBack, useDispatchCampaign } from "@/hooks/useCampaigns";
import type { Decision } from "@/lib/schemas/insights";

const CHANNELS = [
  { value: "email" as const, label: "Email", icon: Mail },
  { value: "sms" as const, label: "SMS", icon: Smartphone },
  { value: "whatsapp" as const, label: "WhatsApp", icon: MessageSquare },
];

interface Props {
  decision: Decision | null;
  onClose: () => void;
}

export function DecisionDrawer({ decision, onClose }: Props) {
  const router = useRouter();
  const winBack = useWinBack();
  const dispatch = useDispatchCampaign();
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");

  const handleLaunch = async () => {
    if (!decision) return;
    const campaign = await winBack.mutateAsync({
      name: `Win back ${decision.name}`,
      channel,
      message_template: `Hi {{first_name}}, we noticed you haven't ordered in a while. Come back and enjoy something special!`,
      tier: decision.value_tier,
    });
    await dispatch.mutateAsync(campaign.id);
    onClose();
    router.push(`/campaigns/${campaign.id}`);
  };

  const busy = winBack.isPending || dispatch.isPending;

  return (
    <Drawer.Root open={decision !== null} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Drawer.Popup className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface-2 shadow-xl transition-transform duration-200 ease-out data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full focus:outline-none">
          <Drawer.Title className="sr-only">
            Customer decision detail
          </Drawer.Title>

          {decision && (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  >
                    {decision.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {decision.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {decision.value_tier} value tier
                    </p>
                  </div>
                </div>
                <Drawer.Close
                  aria-label="Close"
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="size-4" aria-hidden />
                </Drawer.Close>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Expected value"
                    value={formatCurrency(decision.expected_value)}
                    icon={<TrendingUp className="size-3.5" />}
                  />
                  <StatCard
                    label="Reactivation prob."
                    value={`${(decision.reactivation_probability * 100).toFixed(1)}%`}
                    icon={<Brain className="size-3.5" />}
                  />
                </div>

                {decision.recency_days !== null && (
                  <p className="text-xs text-muted-foreground">
                    Last order {decision.recency_days} days ago
                  </p>
                )}

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended action
                  </h3>
                  <p className="mt-1 text-sm text-foreground">
                    {decision.recommended_action}
                  </p>
                </div>

                {decision.reasons.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Why (SHAP)
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {decision.reasons.map((r) => (
                        <li
                          key={r.feature}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">
                            {r.feature.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              r.direction === "increases"
                                ? "text-success-foreground"
                                : "text-danger-foreground"
                            }`}
                          >
                            {r.direction === "increases" ? "+" : "-"}
                            {(r.impact * 100).toFixed(1)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(winBack.isError || dispatch.isError) && (
                  <p className="text-xs text-destructive">
                    Something went wrong. Try again.
                  </p>
                )}

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Channel
                  </h3>
                  <div className="mt-2 flex gap-2">
                    {CHANNELS.map((ch) => {
                      const Icon = ch.icon;
                      const active = channel === ch.value;
                      return (
                        <button
                          key={ch.value}
                          type="button"
                          onClick={() => setChannel(ch.value)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-surface-1 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="size-3.5" aria-hidden />
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-border p-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleLaunch}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Target className="size-4" aria-hidden />
                  {busy ? "Launching..." : "Launch win-back campaign"}
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Creates a {channel} campaign targeting {decision?.value_tier} tier lapsed customers
                </p>
              </div>
            </div>
          )}
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
