"use client";

import { useQuery } from "@tanstack/react-query";
import { getDecisions } from "@/lib/api/insights";

export function useDecisions(tier?: string, limit: number = 20) {
  return useQuery({
    queryKey: ["insights", "decisions", tier, limit],
    queryFn: () => getDecisions(tier, limit),
    staleTime: 60_000,
  });
}
