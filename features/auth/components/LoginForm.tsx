/**
 * LoginForm — email + password form with error display.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { loginApi } from "../api";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await loginApi(email, password);

    if (result.ok) {
      setAuth(result.data.user, result.data.access);
      router.replace("/tasks");
    } else {
      setError(result.error.detail);
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up" style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="demo@taskcanvas.com"
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 16,
            backgroundColor: "var(--surface-2)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            outline: "none",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label
            htmlFor="password"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            Password
          </label>
          <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 16,
            backgroundColor: "var(--surface-2)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            outline: "none",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--danger-subtle)",
            color: "var(--danger)",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: "12px 24px",
          fontSize: 16,
          fontWeight: 600,
          backgroundColor: "var(--accent)",
          color: "var(--accent-text)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) e.currentTarget.style.backgroundColor = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent)";
        }}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
        <span style={{ color: "var(--text-secondary)" }}>Don't have an account? </span>
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
          Sign up
        </Link>
      </div>
    </form>
  );
}
