import type { ReactNode } from "react";

export const metadata = {
  title: "Today's Actions",
  description:
    "Your ranked worklist: which customers to win back today, why they were flagged, and the revenue at stake.",
  alternates: { canonical: "/today" },
};

export default function TodayLayout({ children }: { children: ReactNode }) {
  return children;
}
