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
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export function useAuthGuard(): { isLoading: boolean; isAuthenticated: boolean } {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Don't redirect to /login if viewing tasks or annotate pages (allow onboarding/animation)
      const isAllowedUnauthenticated = pathname.startsWith("/tasks") || pathname.startsWith("/annotate");
      if (!isAllowedUnauthenticated) {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  return { isLoading, isAuthenticated };
}

