// Message token rendering - mirrors backend campaign_service.customer_fields/render_message.
// Backend supports exactly these tokens; unknown tokens are left literal at render time.
export const KNOWN_TOKENS = [
  "first_name",
  "name",
  "city",
  "total_spend",
  "last_order_amount",
  "last_order_at",
] as const;

export type KnownToken = (typeof KNOWN_TOKENS)[number];

export const TOKEN_LABELS: Record<KnownToken, string> = {
  first_name: "First name",
  name: "Full name",
  city: "City",
  total_spend: "Total spend",
  last_order_amount: "Last order amount",
  last_order_at: "Last order date",
};

// Sample customer used only for the client-side preview (no server preview endpoint).
export const SAMPLE_FIELDS: Record<string, string> = {
  first_name: "Aarav",
  name: "Aarav Sharma",
  city: "Mumbai",
  total_spend: "18,400",
  last_order_amount: "2,499",
  last_order_at: "12 Jun",
};

const TOKEN_RE = /\{\{(\w+)\}\}/g;

export function renderPreview(
  template: string,
  fields: Record<string, string> = SAMPLE_FIELDS,
): string {
  return template.replace(TOKEN_RE, (m, t) => (t in fields ? fields[t] : m));
}

export function tokensUsed(template: string): string[] {
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(template))) out.add(m[1]);
  return [...out];
}

export function unknownTokens(template: string): string[] {
  const known = KNOWN_TOKENS as readonly string[];
  return tokensUsed(template).filter((t) => !known.includes(t));
}
