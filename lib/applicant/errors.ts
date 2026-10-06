import { ApiError } from "@/lib/hooks/useUniversalFetch";
import type { ApiErrorBody } from "@/types";

/** Backend error `code` (UPPER_SNAKE) if present. */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    const data = error.data as ApiErrorBody | undefined;
    if (data && typeof data === "object" && typeof data.code === "string") return data.code;
  }
  return undefined;
}

export function getErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

export function isNetworkError(error: unknown): boolean {
  return !(error instanceof ApiError) && error instanceof Error && error.message.startsWith("Network error");
}

/** Best human-readable message from an API error. */
export function getErrorMessage(error: unknown, fallback = "Xatolik yuz berdi"): string {
  if (isNetworkError(error)) return "Tarmoq bilan bog'lanib bo'lmadi. Internet aloqasini tekshiring.";
  if (error instanceof ApiError) {
    const data = error.data as ApiErrorBody | undefined;
    const fromBody =
      (typeof data?.message === "string" && data.message) || (typeof data?.error === "string" && data.error);
    if (fromBody) return fromBody;
    if (Array.isArray(error.data)) return (error.data as unknown[]).join(", ");
    if (error.message && error.message !== "Bad Request") return error.message;
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
