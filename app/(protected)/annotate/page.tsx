/**
 * Annotate page — Unified Radiology PACS Viewer & Annotation Audit System with onboarding tutorial.
 */

"use client";

import { useEffect } from "react";
import { useAnnotationStore } from "@/features/annotate/store/annotationStore";
import { StudyDashboard } from "@/features/annotate/components/StudyDashboard";
import { PACSViewer } from "@/features/annotate/components/PACSViewer";
import { AnnotationListPanel } from "@/features/annotate/components/AnnotationListPanel";
import { ReviewPanel } from "@/features/annotate/components/ReviewPanel";
import { useAuthStore } from "@/features/auth/store/authStore";
import Link from "next/link";

export default function AnnotatePage() {
  const { selectedStudy, selectStudy, fetchStudies, isLoading } = useAnnotationStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    document.title = "TaskCanvas Annotate";
    fetchStudies().then(() => {
      if (typeof window !== "undefined") {
        const persistedId = localStorage.getItem("active_study_id");
        if (persistedId) {
          selectStudy(parseInt(persistedId));
        }
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Banner call to action */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--accent-subtle) 0%, var(--surface-1) 100%)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            border: "1px solid var(--border)",
            textAlign: "center",
            boxShadow: "var(--shadow-md)",
            marginBottom: 48,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "var(--accent)",
              opacity: 0.05,
              filter: "blur(40px)",
            }}
          />
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Next-Generation PACS Diagnostic Annotation
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 700, margin: "0 auto 32px auto", lineHeight: 1.6 }}>
            Simultaneously view and synchronize Axial, Sagittal, and Coronal slice sequences. 
            Identify key pathology findings with points, bounding boxes, or polygons, and complete standard clinical audit reviews.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/login"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-text)",
                padding: "12px 28px",
                borderRadius: "var(--radius-md)",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>

        {/* Animation visual section */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--surface-1)", padding: 32, boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 24, textAlign: "center" }}>
            Real-Time 3D Synchronization & Annotation
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 32,
              position: "relative",
              minHeight: 340,
            }}
            className="tutorial-grid"
          >
            {/* Viewport Animation */}
            <div
              style={{
                backgroundColor: "#0b0c10",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                height: 320,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid #1f2937", paddingBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>Axial View (Slice 18/50)</span>
                <span style={{ fontSize: 11, color: "#9ca3af", backgroundColor: "#1f2937", padding: "2px 6px", borderRadius: 4 }}>Contrast: 140%</span>
              </div>

              {/* Simulated medical scan container */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", position: "relative" }}>
                {/* Simulated Brain Cross Section skull shape */}
                <div
                  style={{
                    width: 160,
                    height: 180,
                    borderRadius: "50% 50% 45% 45%",
                    border: "3px solid #374151",
                    position: "relative",
                    backgroundColor: "#111827",
                  }}
                >
                  {/* Central brain lobes lines */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, backgroundColor: "#1f2937" }} />
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, backgroundColor: "#1f2937" }} />

                  {/* Bounding box animation */}
                  <div
                    style={{
                      position: "absolute",
                      border: "2.5px solid var(--accent)",
                      animation: "boxAnnotate 6s infinite ease-in-out",
                      boxShadow: "0 0 8px rgba(99, 102, 241, 0.4)",
                    }}
                  >
                    {/* Bounding Box label */}
                    <span
                      style={{
                        position: "absolute",
                        top: -18,
                        left: 0,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#ffffff",
                        backgroundColor: "var(--accent)",
                        padding: "1px 4px",
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Meningioma: 12mm
                    </span>
                  </div>
                </div>

                {/* Simulated 3D Crosshair */}
                <div
                  style={{
                    position: "absolute",
                    borderLeft: "1px dashed rgba(255, 255, 255, 0.3)",
                    borderTop: "1px dashed rgba(255, 255, 255, 0.3)",
                    animation: "crosshairMove 6s infinite ease-in-out",
                  }}
                />
              </div>

              {/* Slider footer bar */}
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, width: "100%", backgroundColor: "#1f2937", borderRadius: 3, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: "var(--accent)",
                      top: -4,
                      animation: "sliderMove 6s infinite ease-in-out",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mock right audit list panel */}
            <div
              style={{
                backgroundColor: "var(--surface-0)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                height: 320,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                Findings List (1)
              </h3>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--accent)",
                    backgroundColor: "var(--accent-subtle)",
                    animation: "cardHighlight 6s infinite ease-in-out",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Meningioma Outline</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)" }}>Axial Slice 18</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>Box finding drawn at coordinates.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#ffffff", backgroundColor: "var(--success)", padding: "2px 6px", borderRadius: 4 }}>Approved</span>
                  </div>
                </div>
              </div>

              {/* simulated audit loops footer */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Study Status:</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success)" }}>Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Keyframes Animations injected directly */}
        <style>{`
          @media (max-width: 768px) {
            .tutorial-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
          }
          @keyframes boxAnnotate {
            0%, 20% {
              left: 45%; top: 40%; width: 0px; height: 0px; opacity: 0;
            }
            35%, 65% {
              left: 35%; top: 30%; width: 45px; height: 40px; opacity: 1;
            }
            80%, 100% {
              left: 45%; top: 40%; width: 0px; height: 0px; opacity: 0;
            }
          }
          @keyframes crosshairMove {
            0%, 20% {
              left: 20%; top: 20%; width: 60%; height: 60%;
            }
            35%, 65% {
              left: 45%; top: 42%; width: 10%; height: 10%;
            }
            80%, 100% {
              left: 20%; top: 20%; width: 60%; height: 60%;
            }
          }
          @keyframes sliderMove {
            0%, 20% {
              left: 20%;
            }
            35%, 65% {
              left: 36%;
            }
            80%, 100% {
              left: 20%;
            }
          }
          @keyframes cardHighlight {
            0%, 20% {
              background-color: var(--surface-1);
              border-color: var(--border);
            }
            35%, 65% {
              background-color: var(--accent-subtle);
              border-color: var(--accent);
            }
            80%, 100% {
              background-color: var(--surface-1);
              border-color: var(--border);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px min(4vw, 40px)", maxWidth: 1600, margin: "0 auto", width: "100%" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Radiology PACS Annotator
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Simultaneously synchronize Axial, Sagittal, and Coronal views for point, box, and polygon annotations.
        </p>
      </div>

      {isLoading && !selectedStudy && (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!selectedStudy ? (
        <StudyDashboard onLoadSession={(id) => selectStudy(id)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Main workspace layout: viewports on left, list panel on right */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr minmax(300px, 340px)",
              gap: 24,
            }}
            className="pacs-responsive-grid"
          >
            {/* PACS Viewports */}
            <div style={{ minWidth: 0 }}>
              <PACSViewer onBackToDashboard={() => selectStudy(null)} />
            </div>

            {/* Findings list */}
            <div className="right-panel-wrapper" style={{ minWidth: 0 }}>
              <AnnotationListPanel />
            </div>
          </div>

          {/* Audit loop review workflow panel */}
          <ReviewPanel />
        </div>
      )}

      {/* CSS style to stack column on small screens & equalize right/left panel heights */}
      <style>{`
        @media (max-width: 1024px) {
          .pacs-responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .right-panel-container {
            position: relative !important;
            height: 480px !important;
          }
        }
        @media (min-width: 1025px) {
          .right-panel-wrapper {
            position: relative !important;
            min-height: 100%;
          }
          .right-panel-container {
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
