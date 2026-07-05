/**
 * Forgot password page — public route.
 */

import Link from "next/link";

export const metadata = {
  title: "TaskCanvas Forgot Password",
  description: "Resetting passwords on TaskCanvas.",
};

export default function ForgotPasswordPage() {
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
            Reset Password
          </h1>
        </div>

        {/* Not Implemented Notice */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "var(--danger-subtle)",
            color: "var(--danger)",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Feature Not Implemented</p>
          Password recovery is disabled because this is a demonstration database. To proceed, please use the pre-seeded credentials or register a new account.
        </div>

        {/* Demo credentials reminder */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--text-secondary)",
            marginBottom: 24,
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Demo Credentials:</div>
          <div>Email: <strong style={{ color: "var(--text-primary)" }}>demo@taskcanvas.com</strong></div>
          <div>Password: <strong style={{ color: "var(--text-primary)" }}>TaskCanvas2026!</strong></div>
        </div>

        <div style={{ textAlign: "center", fontSize: 14 }}>
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
