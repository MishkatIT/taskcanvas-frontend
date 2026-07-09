/**
 * Login page — public route.
 */

import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";

export const metadata = {
  title: "TaskCanvas Login",
  description: "Sign in to TaskCanvas to manage your tasks and annotate images.",
};

export default function LoginPage() {
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
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 440 }}>
        <Link
          href="/"
          style={{
            alignSelf: "flex-start",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "color var(--transition-fast)",
          }}
          className="back-home-link"
        >
          ← Back to home
        </Link>
        <div
          style={{
            width: "100%",
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
            TaskCanvas
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Kanban boards & image annotation, unified.
          </p>
        </div>

        <LoginForm />

        <div
          style={{
            marginTop: 24,
            padding: "12px 16px",
            backgroundColor: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <div>Demo Email: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>demo@taskcanvas.com</span></div>
            <div>Password: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>TaskCanvas2026!</span></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
