"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/api/insights";

export function usePortfolio() {
  return useQuery({
    queryKey: ["insights", "portfolio"],
    queryFn: getPortfolio,
    staleTime: 60_000,
  });
}
