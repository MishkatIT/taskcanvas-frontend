/**
 * Protected layout — wraps all authenticated routes.
 * Uses useAuthGuard as the REAL auth gate (not middleware).
 */

"use client";

import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { Header } from "@/features/auth/components/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuthGuard();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--surface-0)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }



  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
