import { Wand2, Filter, Eye, MessageSquareText } from "lucide-react";
import { ComingSoon } from "@/features/marketing/ComingSoon";

export default function SegmentsPage() {
  return (
    <ComingSoon
      title="Segments"
      description="Build audiences by hand or from a plain-English prompt."
      icon={<Wand2 className="size-6" aria-hidden />}
      pitch={
        <>
          Describe the audience you want — “VIPs in Mumbai who haven&apos;t ordered in 30 days” —
          and watch Lumen turn it into editable rules.
        </>
      }
      features={[
        {
          icon: <Filter className="size-4" aria-hidden />,
          title: "Visual rule builder",
          body: "Nested AND/OR groups over your real customer fields — no SQL required.",
        },
        {
          icon: <Wand2 className="size-4" aria-hidden />,
          title: "Natural-language → segment",
          body: "AI drafts the rules, you review and edit them before saving.",
        },
        {
          icon: <Eye className="size-4" aria-hidden />,
          title: "Per-rule impact preview",
          body: "See exactly how many customers each rule adds or removes, live.",
        },
        {
          icon: <MessageSquareText className="size-4" aria-hidden />,
          title: "Reasoning attached",
          body: "Every AI-generated segment ships with the rationale behind it.",
        },
      ]}
    />
  );
}
