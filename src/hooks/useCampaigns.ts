"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  createCampaign,
  deleteCampaign,
  dispatchCampaign,
  getCampaign,
  getCampaigns,
  getCampaignStats,
  winBackCampaign,
} from "@/lib/api/campaigns";
import { getCampaignPnl } from "@/lib/api/insights";

export function useCampaignsList() {
  return useQuery({
    queryKey: qk.campaigns(),
    queryFn: getCampaigns,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: qk.campaign(id),
    queryFn: () => getCampaign(id),
    enabled: Boolean(id),
  });
}

// Stats hook supports polling (PROJECT.md §9: poll every 5s while active).
// Pass refetchInterval (ms) from the caller; defaults to off.
export function useCampaignStats(
  id: string,
  refetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: qk.campaignStats(id),
    queryFn: () => getCampaignStats(id),
    enabled: Boolean(id),
    refetchInterval,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.campaigns() });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.campaigns() });
    },
  });
}

export function useDispatchCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dispatchCampaign(id),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: qk.campaign(campaign.id) });
      qc.invalidateQueries({ queryKey: qk.campaignStats(campaign.id) });
      qc.invalidateQueries({ queryKey: qk.campaigns() });
    },
  });
}

export function useWinBack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: winBackCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.campaigns() });
    },
  });
}

export function useCampaignPnl(id: string) {
  return useQuery({
    queryKey: qk.campaignPnl(id),
    queryFn: () => getCampaignPnl(id),
    enabled: Boolean(id),
  });
}
