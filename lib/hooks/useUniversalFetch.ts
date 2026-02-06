"use client";

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-doktarant.tashmeduni.uz/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Refresh token promise to prevent multiple simultaneous refresh calls
let refreshTokenPromise: Promise<string> | null = null;

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<string> {
  // If refresh is already in progress, wait for it
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  refreshTokenPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        // Refresh token expired or invalid
        tokenStorage.removeTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new ApiError(response.status, "Refresh token expired");
      }

      const data = await response.json();
      const newAccessToken = data.access;

      // Save new access token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", newAccessToken);
        // If new refresh token is provided, save it too
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
      }

      return newAccessToken;
    } finally {
      // Clear the promise so next refresh can happen
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

// Base fetch function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized, try to refresh token and retry
    if (response.status === 401 && endpoint !== "/auth/token/refresh/") {
      try {
        const newAccessToken = await refreshAccessToken();

        // Retry the original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        response = await fetch(url, config);
      } catch {
        // Refresh failed, throw original error
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          ((errorData as { error?: string; message?: string })?.error) ||
          ((errorData as { error?: string; message?: string })?.message) ||
          response.statusText;
        throw new ApiError(
          response.status,
          errorMessage,
          errorData
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        ((errorData as { error?: string; message?: string })?.error) ||
        ((errorData as { error?: string; message?: string })?.message) ||
        response.statusText;
      throw new ApiError(
        response.status,
        errorMessage,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    }

    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// File upload function
async function apiUpload(
  endpoint: string,
  formData: FormData,
  method: string = "POST"
): Promise<unknown> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {},
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  config.body = formData;

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized, try to refresh token and retry
    if (response.status === 401 && endpoint !== "/auth/token/refresh/") {
      try {
        const newAccessToken = await refreshAccessToken();

        // Retry the original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        response = await fetch(url, config);
      } catch {
        // Refresh failed, throw original error
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          ((errorData as { error?: string; message?: string })?.error) ||
          ((errorData as { error?: string; message?: string })?.message) ||
          response.statusText;
        throw new ApiError(
          response.status,
          errorMessage,
          errorData
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        ((errorData as { error?: string; message?: string })?.error) ||
        ((errorData as { error?: string; message?: string })?.message) ||
        response.statusText;
      throw new ApiError(
        response.status,
        errorMessage,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// GET hook
export function useGet<TData = unknown>(
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn">
): UseQueryResult<TData, ApiError> {
  return useQuery<TData, ApiError>({
    queryKey: [endpoint],
    queryFn: () => apiRequest<TData>(endpoint, { method: "GET" }),
    ...options,
  });
}

// POST hook
export function usePost<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) =>
      apiRequest<TData>(endpoint, {
        method: "POST",
        body: JSON.stringify(variables),
      }),
    ...options,
  });
}

// PUT hook
export function usePut<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) =>
      apiRequest<TData>(endpoint, {
        method: "PUT",
        body: JSON.stringify(variables),
      }),
    ...options,
  });
}

// PATCH hook
export function usePatch<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) =>
      apiRequest<TData>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(variables),
      }),
    ...options,
  });
}

// DELETE hook
export function useDelete<TData = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, void>
): UseMutationResult<TData, ApiError, void> {
  return useMutation<TData, ApiError, void>({
    mutationFn: () => apiRequest<TData>(endpoint, { method: "DELETE" }),
    ...options,
  });
}

// Upload file hook (POST)
export function useUpload<TData = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, FormData>
): UseMutationResult<TData, ApiError, FormData> {
  return useMutation<TData, ApiError, FormData>({
    mutationFn: (formData) => apiUpload(endpoint, formData, "POST") as Promise<TData>,
    ...options,
  });
}

// Upload file hook (PATCH)
export function useUploadPatch<TData = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, FormData>
): UseMutationResult<TData, ApiError, FormData> {
  return useMutation<TData, ApiError, FormData>({
    mutationFn: (formData) => apiUpload(endpoint, formData, "PATCH") as Promise<TData>,
    ...options,
  });
}

// Export API base URL and request function for direct use if needed
export { API_BASE_URL, apiRequest, apiUpload };
