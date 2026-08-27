import { CampaignsHub } from "@/features/campaigns/CampaignsHub";

export const metadata = {
  title: "Campaigns",
  description:
    "View, launch, and measure win-back campaigns. Track delivery funnels and real attributed revenue.",
};

export default function CampaignsPage() {
  return <CampaignsHub />;
}
