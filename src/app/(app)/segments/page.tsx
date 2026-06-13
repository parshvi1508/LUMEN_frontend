import { SegmentWorkspace } from "@/features/segments/SegmentWorkspace";

export const metadata = {
  title: "Segments · Lumen",
  description: "Build audiences with rules or natural language.",
};

export default function SegmentsPage() {
  return <SegmentWorkspace />;
}
