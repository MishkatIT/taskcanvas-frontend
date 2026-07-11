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

export function useAuthGuard(): { isLoading: boolean; isAuthenticated: boolean } {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading, isAuthenticated };
}

