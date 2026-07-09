/**
 * RegisterForm — signup form matching LoginForm visual details.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { registerApi } from "../api";
import Link from "next/link";

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { setAuth } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const result = await registerApi(email, password, displayName);

    if (result.ok) {
      setAuth(result.data.user, result.data.access);
      router.replace("/tasks");
    } else {
      setError(result.error.detail || "Registration failed. Please check inputs.");
    }

    setIsSubmitting(false);
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    backgroundColor: "var(--surface-2)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up" style={{ width: "100%", maxWidth: 400 }}>
      {/* Display Name */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="display-name" style={labelStyle}>Display Name</label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. John Doe"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="email" style={labelStyle}>Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••••••"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.4 }}>
          Must be at least 8 characters, containing an uppercase, lowercase, number, and special character.
        </div>
      </div>

      {/* Confirm Password */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="confirm-password" style={labelStyle}>Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••••••"
          style={inputStyle}
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
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>

      <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
        <span style={{ color: "var(--text-secondary)" }}>Already have an account? </span>
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
          Sign in
        </Link>
      </div>
    </form>
  );
}
