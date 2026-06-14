// Single-brand config. In a multi-tenant deployment this would be loaded from
// an API or environment variable per client. For now it is a static object.
export const BRAND = {
  name: "Lumen",
  tagline: "AI-native CRM",
  sampleLabel: "Sample data for Lumen, a demo D2C coffee brand",
} as const;
