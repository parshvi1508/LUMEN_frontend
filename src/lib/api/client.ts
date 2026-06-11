import { ApiResponseError, type ApiError } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function parseErrorBody(res: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  const b = body as Record<string, unknown>;

  return {
    status: res.status,
    code: typeof b.code === "string" ? b.code : String(res.status),
    message:
      typeof b.message === "string"
        ? b.message
        : res.statusText || "An unexpected error occurred.",
    fieldErrors:
      b.field_errors != null &&
      typeof b.field_errors === "object" &&
      !Array.isArray(b.field_errors)
        ? (b.field_errors as Record<string, string[]>)
        : undefined,
    // AI endpoints (FRONTEND_SPEC §4.3): 422 + manualFallback flag
    manualFallback:
      res.status === 422 && typeof b.manual_fallback === "boolean"
        ? b.manual_fallback
        : res.status === 422
          ? true
          : undefined,
  };
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const apiError = await parseErrorBody(res);
    throw new ApiResponseError(apiError);
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Convenience wrappers

export const apiGet = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { method: "GET", ...init });

export const apiPost = <T>(path: string, body: unknown, init?: RequestInit) =>
  apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
  });

export const apiPatch = <T>(path: string, body: unknown, init?: RequestInit) =>
  apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...init,
  });

export const apiDelete = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { method: "DELETE", ...init });
