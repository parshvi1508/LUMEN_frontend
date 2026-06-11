// Normalized API error — all hooks surface this shape (FRONTEND_SPEC §4.3)
export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  // Set on 422 from AI endpoints: AI failed validation, offer manual fallback
  manualFallback?: boolean;
}

export class ApiResponseError extends Error {
  readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiResponseError";
    this.apiError = apiError;
  }
}

export function isApiError(err: unknown): err is ApiResponseError {
  return err instanceof ApiResponseError;
}
