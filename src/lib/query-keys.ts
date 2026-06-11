import type { CustomerFilters, SegmentAST } from "@/lib/schemas/types";

export const qk = {
  customers: (filters?: CustomerFilters) =>
    ["customers", filters] as const,
  segment: (id: string) =>
    ["segments", id] as const,
  segmentPreview: (ast: SegmentAST) =>
    ["segments", "preview", ast] as const,
  campaign: (id: string) =>
    ["campaigns", id] as const,
  campaignStats: (id: string) =>
    ["campaigns", id, "stats"] as const,
  campaignInsight: (id: string) =>
    ["campaigns", id, "insight"] as const,
} as const;
