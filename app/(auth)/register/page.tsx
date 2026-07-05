/**
 * Register page — public route.
 */

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "TaskCanvas Register",
  description: "Create a TaskCanvas account to manage your tasks and annotate images.",
};

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--surface-0)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 40,
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Logo / Branding */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              backgroundColor: "var(--accent-subtle)",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Join TaskCanvas to organize tasks and annotate datasets.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
