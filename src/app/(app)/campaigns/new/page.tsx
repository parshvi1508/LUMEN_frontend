import { CampaignComposer } from "@/features/campaigns/CampaignComposer";

export const metadata = {
  title: "New Campaign",
  description:
    "Draft a new campaign: pick an audience, write your message, preview, and dispatch.",
};

export default function NewCampaignPage() {
  return <CampaignComposer />;
}
