/**
 * useAuthGuard — the REAL, authoritative auth gate.
 *
 * Runs inside (protected)/layout.tsx. Calls GET /api/auth/me/ on mount.
 * 401 → attempt silent refresh once → still 401 → redirect to /login.
 *
 * This is what actually decides whether protected content renders,
 * not middleware.ts (which only does fast optimistic redirects).
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { getMeApi, refreshApi } from "../api";
import { setAccessToken } from "@/shared/lib/api-client";

export function useAuthGuard(): { isLoading: boolean; isAuthenticated: boolean } {
  const router = useRouter();
  const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function verifyAuth() {
      setLoading(true);

      // Try to get current user with existing token
      const meResult = await getMeApi();

      if (meResult.ok) {
        // Already authenticated
        setAuth(meResult.data, useAuthStore.getState().user ? "" : "");
        setLoading(false);
        return;
      }

      // Token might be expired — try silent refresh
      const refreshResult = await refreshApi();
      if (refreshResult.ok) {
        setAccessToken(refreshResult.data.access);

        // Retry /me with the new token
        const retryMe = await getMeApi();
        if (retryMe.ok) {
          setAuth(retryMe.data, refreshResult.data.access);
          return;
        }
      }

      // Both failed — clear auth state but do not force redirect
      clearAuth();
      setLoading(false);
    }

    verifyAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoading, isAuthenticated };
}
