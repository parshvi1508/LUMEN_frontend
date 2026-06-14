import { apiGet, apiPost } from "./client";
import type {
  PreviewRequest,
  PreviewResponse,
  SegmentCreate,
  SegmentOut,
} from "@/lib/schemas/segment";

// POST /api/v1/segments/preview - rule AST -> {count, sample, per_rule_impact}
export async function previewSegment(
  body: PreviewRequest,
): Promise<PreviewResponse> {
  return apiPost<PreviewResponse>("/api/v1/segments/preview", body);
}

// POST /api/v1/segments - create (201)
export async function createSegment(
  body: SegmentCreate,
): Promise<SegmentOut> {
  return apiPost<SegmentOut>("/api/v1/segments", body);
}

// GET /api/v1/segments
export async function getSegments(): Promise<SegmentOut[]> {
  return apiGet<SegmentOut[]>("/api/v1/segments");
}

// GET /api/v1/segments/{id}
export async function getSegment(id: string): Promise<SegmentOut> {
  return apiGet<SegmentOut>(`/api/v1/segments/${id}`);
}
