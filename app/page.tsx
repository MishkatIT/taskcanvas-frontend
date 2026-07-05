/**
 * Public Landing Page — showable when logged out.
 * Integrates light/dark mode styling, features showcases, and dynamic CTA buttons.
 */

"use client";

import { useEffect } from "react";
import { Header } from "@/features/auth/components/Header";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    document.title = "TaskCanvas Home";
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--surface-0)",
        color: "var(--text-primary)",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <section
          style={{
            padding: "80px 24px",
            textAlign: "center",
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
          className="animate-slide-up"
        >
          <div
            style={{
              padding: "6px 12px",
              backgroundColor: "var(--accent-subtle)",
              color: "var(--accent)",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            Unified Productivity Tool
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              backgroundImage: "linear-gradient(135deg, var(--text-primary) 30%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Coordinate Tasks.<br />Annotate Images.
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              maxWidth: 600,
            }}
          >
            TaskCanvas blends date-based Kanban boards and high-fidelity polygon annotation tools into a single, seamless environment. Built for radiologists, ML teams, and task planners.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <Link
              href={isAuthenticated ? "/tasks" : "/login"}
              style={{
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 600,
                backgroundColor: "var(--accent)",
                color: "var(--accent-text)",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                boxShadow: "var(--shadow-md)",
              }}
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section
          style={{
            padding: "60px 24px 100px",
            backgroundColor: "var(--surface-1)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 600,
                textAlign: "center",
                marginBottom: 48,
                letterSpacing: "-0.5px",
              }}
            >
              Features Designed for Precision
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {/* Feature 1 */}
              <div
                style={{
                  padding: 24,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-0)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Date-Based Kanban</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Schedule, drag, and reorder tasks across To Do, In Progress, and Done columns. Filter work dynamically by date index.
                </p>
              </div>

              {/* Feature 2 */}
              <div
                style={{
                  padding: 24,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-0)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 18V6" />
                    <path d="M6 12h12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Polygon Annotation Stage</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Upload radiology or general images, place precision dots, and label polygons. Automatically saved using resolution-independent coordinate layouts.
                </p>
              </div>

              {/* Feature 3 */}
              <div
                style={{
                  padding: 24,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-0)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>System Theme Sync</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Configure your workspace preferences. Fully synchronizes with dark, light, or device settings dynamically in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          textAlign: "center",
          fontSize: 12,
          color: "var(--text-secondary)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        &copy; 2026 TaskCanvas. Powered by Next.js & Django.
      </footer>
    </div>
  );
}
