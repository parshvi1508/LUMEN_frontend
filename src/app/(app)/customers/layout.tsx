import type { ReactNode } from "react";

export const metadata = {
  title: "Customers",
  description:
    "Browse, search, and manage your customer list. Each customer is scored for churn risk and lifetime value.",
};

export default function CustomersLayout({ children }: { children: ReactNode }) {
  return children;
}
