import { apiGet, apiPost } from "./client";
import type { CustomerFilters } from "@/lib/schemas/types";
import type {
  PaginatedCustomers,
  UploadResult,
  CsvRow,
} from "@/lib/schemas/customer";

export async function getCustomers(
  filters?: CustomerFilters,
): Promise<PaginatedCustomers> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.page != null) params.set("page", String(filters.page));
  if (filters?.pageSize != null)
    params.set("page_size", String(filters.pageSize));
  const qs = params.toString();
  return apiGet<PaginatedCustomers>(
    `/api/v1/customers${qs ? `?${qs}` : ""}`,
  );
}

export async function uploadCustomersCsv(
  rows: CsvRow[],
): Promise<UploadResult> {
  return apiPost<UploadResult>("/api/v1/customers/upload", { rows });
}
