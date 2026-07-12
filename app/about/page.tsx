/**
 * Public About Page — accessible to all users.
 * Introduces the task management and image annotation features of TaskCanvas.
 * Fully supports responsive layout, light/dark themes, and interactive buttons.
 */

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/features/auth/components/Header";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function AboutPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    document.title = "About TaskCanvas | Unified Productivity & Annotation";
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

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Hero Section */}
        <section
          style={{
            padding: "80px 24px 40px",
            textAlign: "center",
            maxWidth: 900,
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
            The TaskCanvas Vision
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              backgroundImage: "linear-gradient(135deg, var(--text-primary) 30%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Bridging Task Planning &<br />High-Fidelity Annotation
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              maxWidth: 680,
              marginTop: 8,
            }}
          >
            TaskCanvas is a unified workspace designed to combine date-indexed task management with interactive image annotation. Our platform allows users to schedule Kanban cards and draw precision polygon labels on a high-fidelity canvas simultaneously.
          </p>
        </section>

        {/* Feature Highlights Grid */}
        <section
          style={{
            padding: "60px 24px 80px",
            backgroundColor: "var(--surface-1)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 600,
                textAlign: "center",
                marginBottom: 40,
                letterSpacing: "-0.5px",
              }}
            >
              Core Capabilities
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {/* Feature 1: Kanban Task Management */}
              <div
                id="feature-kanban"
                onMouseEnter={() => setHoveredCard("kanban")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: 28,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-0)",
                  transform: hoveredCard === "kanban" ? "translateY(-4px)" : "none",
                  boxShadow: hoveredCard === "kanban" ? "var(--shadow-lg)" : "var(--shadow-sm)",
                  transition: "all var(--transition-normal)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Flexible Kanban Board</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, textAlign: "justify" }}>
                  Coordinate and organize project queues using our responsive, date-indexed Kanban board. Team members can schedule cards, filter workflows dynamically by calendar dates, group tasks by tags, and prioritize items (High, Medium, Low) with distinct visual borders to streamline clinical operations and productivity.
                </p>
              </div>

              {/* Feature 2: Image Polygon Annotation */}
              <div
                id="feature-annotation"
                onMouseEnter={() => setHoveredCard("annotation")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: 28,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-0)",
                  transform: hoveredCard === "annotation" ? "translateY(-4px)" : "none",
                  boxShadow: hoveredCard === "annotation" ? "var(--shadow-lg)" : "var(--shadow-sm)",
                  transition: "all var(--transition-normal)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 18V6" />
                    <path d="M6 12h12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Precision Polygon Annotation</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, textAlign: "justify" }}>
                  Prepare high-quality machine learning datasets and medical images using our high-fidelity HTML5 drawing stage. Place sequential vertices on DICOM or standard images to outline detailed regions of interest, customize label attributes, and automatically sync annotations as resolution-independent normalized coordinates that scale across viewports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic CTA Section */}
        <section
          style={{
            padding: "80px 24px",
            backgroundColor: "var(--surface-0)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px" }}>Ready to Experience TaskCanvas?</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 500, lineHeight: 1.6 }}>
            Start planning, sorting, and labeling medical dataset schemas today. Click below to enter the platform.
          </p>

          <div style={{ marginTop: 8 }}>
            <Link
              id="cta-about-action"
              href={isAuthenticated ? "/tasks" : "/login"}
              style={{
                padding: "12px 32px",
                fontSize: 15,
                fontWeight: 600,
                backgroundColor: "var(--accent)",
                color: "var(--accent-text)",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                boxShadow: "var(--shadow-md)",
                display: "inline-block",
                transition: "background-color var(--transition-fast)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--accent)"}
            >
              {isAuthenticated ? "Go to Dashboard" : "Sign In to TaskCanvas"}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "var(--text-secondary)",
          backgroundColor: "var(--surface-1)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          &copy; 2026 TaskCanvas. Powered by Next.js & Django.
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link id="footer-link-home" href="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Home
          </Link>
          <span style={{ color: "var(--border)" }}>|</span>
          <Link id="footer-link-about" href="/about" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}
