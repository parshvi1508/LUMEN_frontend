import { CampaignComposer } from "@/features/campaigns/CampaignComposer";

export const metadata = {
  title: "New campaign · Lumen",
  description: "Draft and dispatch a reasoned campaign.",
};

export default function NewCampaignPage() {
  return <CampaignComposer />;
}
