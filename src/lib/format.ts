export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = d.getTime() - Date.now();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffMonths / 12);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSecs) < 60) return "just now";
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, "month");
  return rtf.format(diffYears, "year");
}
