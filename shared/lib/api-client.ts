/**
 * API client — fetch wrapper with JWT auth.
 *
 * - Injects Authorization: Bearer <token> header on every request
 * - On 401: attempts silent refresh via /api/auth/refresh/ once
 * - If retry also 401s: redirects to /login
 *
 * Section 2a of the project plan.
 */

import type { ApiResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// In-memory access token — never persisted to localStorage
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// Shared refresh promise to prevent duplicate concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token using the httpOnly cookie.
 * Returns the new access token, or null if refresh failed.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh/`, {
        method: "POST",
        credentials: "include", // sends the httpOnly refresh_token cookie
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newToken = data.access as string;
      setAccessToken(newToken);
      return newToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Core fetch wrapper. Handles auth headers, 401 refresh, and error normalization.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResult<T>> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // always include cookies for refresh token
    });

    // Handle 401 — attempt silent refresh once (skip for login/register/refresh endpoints)
    const isAuthEndpoint =
      endpoint === "/api/auth/login/" ||
      endpoint === "/api/auth/register/" ||
      endpoint === "/api/auth/refresh/";

    if (response.status === 401 && !isRetry && !isAuthEndpoint) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiFetch<T>(endpoint, options, true);
      }

      // Refresh failed — return normal error structure instead of hard window redirect
      return {
        ok: false,
        error: { detail: "Session expired. Please log in again.", code: "session_expired" },
      };
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { ok: true, data: null as T };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: {
          detail: data.detail || "An error occurred.",
          code: data.code || "error",
          errors: data.errors,
        },
      };
    }

    return { ok: true, data: data as T };
  } catch (error) {
    return {
      ok: false,
      error: {
        detail: "Network error. Please check your connection.",
        code: "network_error",
      },
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: formData,
    }),
};
