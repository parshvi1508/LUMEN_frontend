import type { Customer } from "@/lib/schemas/customer";

const COLUMNS: (keyof Customer)[] = [
  "name",
  "email",
  "city",
  "total_spend",
  "order_count",
  "last_order_at",
  "external_id",
];

function escapeCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

/** Download the given customers as a CSV - a real, working bulk/row action. */
export function exportCustomersCsv(customers: Customer[], filename = "lumen-customers.csv") {
  const header = COLUMNS.join(",");
  const rows = customers.map((c) => COLUMNS.map((k) => escapeCell(c[k])).join(","));
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
