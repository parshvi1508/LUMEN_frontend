import { SegmentWorkspace } from "@/features/segments/SegmentWorkspace";

export const metadata = {
  title: "Segments",
  description:
    "Build customer audiences with rules or natural language. Preview size and overlap before saving.",
};

export default function SegmentsPage() {
  return <SegmentWorkspace />;
}
