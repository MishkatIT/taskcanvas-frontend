"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { getMeApi, refreshApi } from "../api";
import { setAccessToken } from "@/shared/lib/api-client";

export function AuthInitializer() {
  const { setAuth, clearAuth, setLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If we are already marked as authenticated, no need to verify again
    if (isAuthenticated) {
      setLoading(false);
      return;
    }

    async function verifyAuth() {
      setLoading(true);

      // Try to get current user with existing token
      const meResult = await getMeApi();

      if (meResult.ok) {
        setAuth(meResult.data, "");
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

      // Both failed — clear auth state
      clearAuth();
      setLoading(false);
    }

    verifyAuth();
  }, [setAuth, clearAuth, setLoading, isAuthenticated]);

  return null;
}
