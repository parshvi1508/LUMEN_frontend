import { z } from "zod";

// CSV row schema - validated client-side before upload (FRONTEND_SPEC §5.1)
export const CsvRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  city: z.string().optional().default(""),
  total_spend: z.coerce
    .number()
    .min(0, "Must be non-negative")
    .optional()
    .default(0),
  order_count: z.coerce
    .number()
    .int("Must be a whole number")
    .min(0, "Must be non-negative")
    .optional()
    .default(0),
  external_id: z.string().min(1, "External ID is required"),
});

export type CsvRow = z.infer<typeof CsvRowSchema>;

export const REQUIRED_HEADERS = ["name", "email", "external_id"] as const;

export interface Customer {
  id: string;
  name: string;
  email: string;
  city?: string;
  total_spend: number;
  order_count: number;
  last_order_at?: string;
  created_at: string;
  external_id: string;
}

export interface CustomerOrder {
  id: string;
  amount: number;
  status: "completed" | "refunded" | "pending";
  created_at: string;
  item_count: number;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface UploadResult {
  created: number;
  updated: number;
  rejected: RejectedRow[];
}

export interface RejectedRow {
  row: number;
  external_id?: string;
  errors: string[];
  data: Record<string, string>;
}
