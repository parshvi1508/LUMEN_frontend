"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  createSegment,
  deleteSegment,
  getSegment,
  getSegments,
  previewSegment,
} from "@/lib/api/segments";

export function useSegments() {
  return useQuery({
    queryKey: qk.segments(),
    queryFn: getSegments,
  });
}

export function useSegment(id: string) {
  return useQuery({
    queryKey: qk.segment(id),
    queryFn: () => getSegment(id),
    enabled: Boolean(id),
  });
}

// Preview is a read-only POST (rule AST -> count/sample/per_rule_impact).
// Exposed as a mutation for explicit, debounced triggering from the builder.
export function usePreviewSegment() {
  return useMutation({
    mutationFn: previewSegment,
  });
}

export function useCreateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSegment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.segments() });
    },
  });
}

export function useDeleteSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSegment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.segments() });
    },
  });
}
