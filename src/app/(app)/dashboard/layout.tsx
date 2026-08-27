import type { ReactNode } from "react";

export const metadata = {
  title: "Revenue Radar",
  description:
    "One screen showing how much revenue is leaking from dormant customers and exactly who to act on first.",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
