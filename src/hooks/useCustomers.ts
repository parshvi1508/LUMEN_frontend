"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { getCustomers, uploadCustomersCsv } from "@/lib/api/customers";
import type { CustomerFilters } from "@/lib/schemas/types";

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: qk.customers(filters),
    queryFn: () => getCustomers(filters),
    // Keep previous page visible while new page loads (no flicker)
    placeholderData: (prev) => prev,
  });
}

export function useUploadCsv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadCustomersCsv,
    onSuccess: () => {
      // Invalidate all customer queries after a successful upload
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
