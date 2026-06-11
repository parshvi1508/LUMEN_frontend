import { Megaphone, Sparkles, GitBranch, Activity } from "lucide-react";
import { ComingSoon } from "@/features/marketing/ComingSoon";

export default function CampaignsPage() {
  return (
    <ComingSoon
      title="Campaigns"
      description="Draft, review, and dispatch reasoned campaigns across channels."
      icon={<Megaphone className="size-6" aria-hidden />}
      pitch={
        <>
          Go from a segment to a dispatched campaign — AI drafts the message variants, you approve,
          and nothing sends without your sign-off.
        </>
      }
      features={[
        {
          icon: <Sparkles className="size-4" aria-hidden />,
          title: "AI message drafts",
          body: "Three variants per channel — WhatsApp, SMS, email — each with its reasoning.",
        },
        {
          icon: <GitBranch className="size-4" aria-hidden />,
          title: "Propose-campaign agent",
          body: "Give a goal; get a proposed segment, channel, and copy to review and edit.",
        },
        {
          icon: <Activity className="size-4" aria-hidden />,
          title: "Live delivery funnel",
          body: "Watch queued → delivered → opened → converted update in real time.",
        },
        {
          icon: <Megaphone className="size-4" aria-hidden />,
          title: "Approval-gated dispatch",
          body: "A final confirm shows the exact audience size before anything ships.",
        },
      ]}
    />
  );
}
