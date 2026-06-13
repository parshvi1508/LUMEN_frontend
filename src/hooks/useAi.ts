"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  draftMessages,
  getCampaignInsight,
  nlToSegment,
  proposeCampaign,
} from "@/lib/api/ai";

export function useNlToSegment() {
  return useMutation({
    mutationFn: nlToSegment,
  });
}

export function useDraftMessages() {
  return useMutation({
    mutationFn: draftMessages,
  });
}

export function useProposeCampaign() {
  return useMutation({
    mutationFn: proposeCampaign,
  });
}

// Insight is a GET; query keyed by campaign id. Disabled until enabled by caller.
export function useCampaignInsight(id: string, enabled = true) {
  return useQuery({
    queryKey: qk.campaignInsight(id),
    queryFn: () => getCampaignInsight(id),
    enabled: enabled && Boolean(id),
  });
}
