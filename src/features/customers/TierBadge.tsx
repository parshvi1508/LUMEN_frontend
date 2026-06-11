import { Badge } from "@/components/ui/badge";
import { TIER_META, type CustomerTier } from "@/lib/customer-tier";
import { Crown, CircleCheck, TriangleAlert, MoonStar } from "lucide-react";

const TIER_ICON: Record<CustomerTier, typeof Crown> = {
  vip: Crown,
  active: CircleCheck,
  "at-risk": TriangleAlert,
  churned: MoonStar,
};

const VARIANT: Record<CustomerTier, "vip" | "success" | "warning" | "secondary"> = {
  vip: "vip",
  active: "success",
  "at-risk": "warning",
  churned: "secondary",
};

/**
 * Tier pill — color carries meaning but is never the only signal: an icon and
 * the text label both communicate tier (a11y bar, FRONTEND_SPEC §8.2).
 */
export function TierBadge({ tier }: { tier: CustomerTier }) {
  const Icon = TIER_ICON[tier];
  return (
    <Badge variant={VARIANT[tier]} className="gap-1">
      <Icon className="size-3" aria-hidden />
      {TIER_META[tier].label}
    </Badge>
  );
}
