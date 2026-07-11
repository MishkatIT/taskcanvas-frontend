"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTourStore } from "../lib/tourStore";
import { useAnnotationStore } from "@/features/annotate/store/annotationStore";
import { useAuthStore } from "@/features/auth/store/authStore";

interface Step {
  title: string;
  content: string;
  target?: string;
  route?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export function TourGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useRef(false);

  const {
    isActive,
    currentStep,
    nextStep,
    prevStep,
    endTour,
    initialize,
    hasCompletedBefore,
  } = useTourStore();

  const {
    studies,
    selectedStudy,
    selectStudy,
    fetchStudies,
    createStudy,
  } = useAnnotationStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    fixed: boolean;
  }>({ top: 0, left: 0, fixed: true });

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Define steps
  const steps: Step[] = useMemo(() => [
    {
      title: "Welcome to TaskCanvas! 🎨",
      content: "TaskCanvas is a unified workspace that bridges Date-Based Kanban planning and precision polygon image annotations. Let's take a 1-minute guide to get familiar with it.",
      position: "center",
    },
    {
      title: "Workspace Navigation 🧭",
      content: "Easily switch back and forth between your Kanban boards (Tasks) and the PACS Image Annotation layout.",
      target: '[data-tour="nav-links"]',
      position: "bottom",
    },
    {
      title: "Date-Based Tasks 📅",
      content: "Plan daily agendas using our interactive schedule bar. Flip days or choose presets like 'Today', 'Tomorrow', or 'This Week' to view your filtered list.",
      target: '[data-tour="date-selector"]',
      route: "/tasks",
      position: "bottom",
    },
    {
      title: "Kanban Board Workflow 📋",
      content: isAuthenticated
        ? "Drag and drop cards here across 'To Do', 'In Progress', and 'Done' to manage task status in real-time."
        : "Guest Mode shows an interactive preview board. Log in to create your own columns, set item priority weights, and sync tasks.",
      target: '[data-tour="kanban-board"]',
      route: "/tasks",
      position: "bottom",
    },
    {
      title: "Add New Task ➕",
      content: "Create tasks instantly. Assign High, Medium, or Low priority badges, fill out descriptions, and tag specific dates.",
      target: '[data-tour="new-task-btn"]',
      route: "/tasks",
      position: "left",
    },
    {
      title: "Annotation Study Dashboard 🩺",
      content: "ML teams and clinicians use this dashboard to manage clinical scans. Drag and drop slice images to launch annotation sessions, or load our pre-packaged demo scan.",
      target: '[data-tour="study-dashboard"]',
      route: "/annotate",
      position: "right",
    },
    {
      title: "Synchronized 3D PACS Viewport 🔬",
      content: "Simultaneously view and scroll through scan slices in three planes: Axial, Sagittal, and Coronal. Drag to pan or zoom, adjust brightness and contrast windows, or play slice slideshows.",
      target: '[data-tour="pacs-viewport"]',
      route: "/annotate",
      position: "bottom",
    },
    {
      title: "Image Adjustments 🌗",
      content: "Fine-tune visibility levels. Use these sliders to adjust brightness and contrast parameters, or check 'Apply CT Window' to toggle preset high-contrast diagnostic presets.",
      target: '[data-tour="image-adjustments-block"]',
      route: "/annotate",
      position: "bottom",
    },
    {
      title: "Slideshow Controls ⏱️",
      content: "Control slice scrolling playback. Drag the sliders to configure speed intervals (ms) and adjust frame transitions for smooth slice animation.",
      target: '[data-tour="slideshow-controls-block"]',
      route: "/annotate",
      position: "bottom",
    },
    {
      title: "Visibility & Viewports 👁️",
      content: "Manage scan overlays. Toggle check boxes to hide annotations, audited items, or tooltips. Click the Axial, Sagittal, or Coronal buttons to toggle active scanner visibility.",
      target: '[data-tour="visibility-options-block"]',
      route: "/annotate",
      position: "bottom",
    },
    {
      title: "PACS Hotkeys & Shortcuts ℹ️",
      content: "Hover over this info icon to view essential diagnostic hotkeys: hold Space + Scroll wheel to zoom, hold Space + Click & Drag to pan, scroll to switch slices, and left-click to place markings.",
      target: '[data-tour="shortcuts-info"]',
      route: "/annotate",
      position: "bottom",
    },
    {
      title: "Precision Annotations ✏️",
      content: "Select a tool (point, bounding box, or polygon) to place markings directly on the image scan slices. Coordinates are saved automatically.",
      target: '[data-tour="active-tool-selector"]',
      route: "/annotate",
      position: "bottom",
    },
    {
      title: "Manage Findings List 🏷️",
      content: "View all marked anomalies, select custom label tags, update indicator colors, and audit properties.",
      target: '[data-tour="annotation-list"]',
      route: "/annotate",
      position: "left",
    },
    {
      title: "Workflow Review & Approval 🏁",
      content: "Complete clinical audits by approving or rejecting markings. Sync updates instantly with backend databases.",
      target: '[data-tour="review-panel"]',
      route: "/annotate",
      position: "top",
    },
    {
      title: "Settings & Themes 🌗",
      content: isAuthenticated
        ? "Access account configurations and toggle Light, Dark, or System themes in your profile dropdown."
        : "Click here to toggle Light and Dark modes or log in to customize user settings.",
      target: '[data-tour="auth-controls"]',
      position: "bottom",
    },
    {
      title: "You're All Set! 🎉",
      content: "You've finished the onboarding tour. Start adding tasks or uploading scans. Restart this tour anytime using the 'Quick Tour' button in the navbar.",
      position: "center",
    },
  ], [isAuthenticated]);

  // Initialize store on mount
  useEffect(() => {
    mounted.current = true;
    initialize();
    
    // Auto start tour for first-time visitors (logged-in only) after a brief delay
    if (isAuthenticated) {
      const completed = localStorage.getItem("taskcanvas_tour_completed") === "true";
      if (!completed) {
        const timer = setTimeout(() => {
          useTourStore.getState().startTour();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [initialize, isAuthenticated]);

  // Immediately terminate tour if user logs out or is unauthenticated
  useEffect(() => {
    if (isActive && !isAuthenticated) {
      endTour();
    }
  }, [isAuthenticated, isActive, endTour]);

  const step = steps[currentStep];

  // Handle route changes and special step setup actions
  useEffect(() => {
    if (!isActive || !step) return;

    // 1. Check if we need to route to a different page
    if (step.route && pathname !== step.route) {
      if (!loadingRoute) {
        setLoadingRoute(true);
      }
      router.push(step.route);
      // Wait for pathname to sync
      return;
    }

    if (loadingRoute) {
      setLoadingRoute(false);
    }

    // 2. Perform page-specific setup hooks
    // Transition to PACS Viewer (Step Indices 6-11): Load a study if not selected
    if (currentStep >= 6 && currentStep <= 11 && pathname === "/annotate" && !selectedStudy) {
      const loadDemoOrFirstStudy = async () => {
        await fetchStudies();
        const currentStudies = useAnnotationStore.getState().studies;
        if (currentStudies.length > 0) {
          selectStudy(currentStudies[0].id);
        } else {
          // If no study, create a demo study
          const success = await createStudy("Tour Patient Brain MRI", []);
          if (success) {
            await fetchStudies();
            const reloaded = useAnnotationStore.getState().studies;
            if (reloaded.length > 0) {
              selectStudy(reloaded[0].id);
            }
          }
        }
      };
      loadDemoOrFirstStudy();
    }

    // Going back to Study Dashboard (Step Index 5 or less): Unselect study to return to dashboard
    if (currentStep <= 5 && pathname === "/annotate" && selectedStudy) {
      selectStudy(null);
    }

    // 3. Locate target and compute coordinates
    let attempts = 0;
    const locateElement = () => {
      if (!step.target) {
        setCoords(null);
        setTooltipPos({ top: 0, left: 0, fixed: true });
        return;
      }

      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Element exists, update coordinates
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Compute tooltip coordinates
        const padding = 12;
        const tooltipWidth = 340;
        const tooltipHeight = 180; // approximate maximum height

        let tTop = 0;
        let tLeft = 0;

        const elemCenterY = rect.top + rect.height / 2 + window.scrollY;
        const elemCenterX = rect.left + rect.width / 2 + window.scrollX;

        switch (step.position) {
          case "top":
            tTop = rect.top - tooltipHeight - padding + window.scrollY;
            tLeft = elemCenterX - tooltipWidth / 2;
            break;
          case "bottom":
            tTop = rect.bottom + padding + window.scrollY;
            tLeft = elemCenterX - tooltipWidth / 2;
            break;
          case "left":
            tTop = elemCenterY - tooltipHeight / 2;
            tLeft = rect.left - tooltipWidth - padding + window.scrollX;
            break;
          case "right":
            tTop = elemCenterY - tooltipHeight / 2;
            tLeft = rect.right + padding + window.scrollX;
            break;
          default: // fallback to center if unspecified
            setCoords(null);
            setTooltipPos({ top: 0, left: 0, fixed: true });
            return;
        }

        // Clamp tooltip within viewport width boundaries
        const viewportWidth = window.innerWidth;
        if (tLeft < 16) {
          tLeft = 16;
        } else if (tLeft + tooltipWidth > viewportWidth - 16) {
          tLeft = viewportWidth - tooltipWidth - 16;
        }

        // Clamp top bounds
        if (tTop < 16 + window.scrollY) {
          tTop = rect.bottom + padding + window.scrollY; // flip to bottom if off-screen top
        }

        setTooltipPos({ top: tTop, left: tLeft, fixed: false });
      } else {
        // Element not found immediately (could be rendering dynamically)
        if (attempts < 10) {
          attempts++;
          setTimeout(locateElement, 150);
        } else {
          // Fallback to center if not found after retries
          setCoords(null);
          setTooltipPos({ top: 0, left: 0, fixed: true });
        }
      }
    };

    // Delay calculation slightly to allow React layout layout/DOM calculations to complete
    const timeoutId = setTimeout(locateElement, 200);

    // Watch scroll and resize to keep coordinates pinned
    const handleUpdate = () => {
      attempts = 9; // skip long retries on scroll/resize updates
      locateElement();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
    };
  }, [isActive, currentStep, pathname, retryCount, step, selectedStudy]);

  // Force recalculation when loading state finishes
  useEffect(() => {
    if (isActive && !loadingRoute) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loadingRoute, isActive]);

  if (!isActive || !step || !mounted.current) return null;

  const totalSteps = steps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* Backdrop overlay & target spotlight */}
      {coords ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: Math.max(
              typeof document !== "undefined" ? document.documentElement.scrollHeight : 0,
              typeof window !== "undefined" ? window.innerHeight : 0
            ),
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2.5px)",
            pointerEvents: "auto",
            WebkitClipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${coords.left}px 100%, 
              ${coords.left}px ${coords.top}px, 
              ${coords.left + coords.width}px ${coords.top}px, 
              ${coords.left + coords.width}px ${coords.top + coords.height}px, 
              ${coords.left}px ${coords.top + coords.height}px, 
              ${coords.left}px 100%, 
              100% 100%, 
              100% 0%
            )`,
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${coords.left}px 100%, 
              ${coords.left}px ${coords.top}px, 
              ${coords.left + coords.width}px ${coords.top}px, 
              ${coords.left + coords.width}px ${coords.top + coords.height}px, 
              ${coords.left}px ${coords.top + coords.height}px, 
              ${coords.left}px 100%, 
              100% 100%, 
              100% 0%
            )`,
            transition: "clip-path 0.35s ease, -webkit-clip-path 0.35s ease",
          }}
          onClick={endTour}
        />
      ) : (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(3px)",
            pointerEvents: "auto",
          }}
          onClick={endTour}
        />
      )}

      {/* Pulsing glow highlight around the targeted element */}
      {coords && (
        <div
          style={{
            position: "absolute",
            top: coords.top - 4,
            left: coords.left - 4,
            width: coords.width + 8,
            height: coords.height + 8,
            borderRadius: "var(--radius-sm)",
            border: "2.5px solid var(--accent)",
            boxShadow: "0 0 12px var(--accent), inset 0 0 4px var(--accent)",
            pointerEvents: "none",
            transition: "all 0.35s ease",
            animation: "pulseOutline 2s infinite ease-in-out",
          }}
        />
      )}

      {/* Tour Dialog Card */}
      <div
        className="animate-slide-up"
        style={{
          position: tooltipPos.fixed ? "fixed" : "absolute",
          top: tooltipPos.fixed ? "50%" : tooltipPos.top,
          left: tooltipPos.fixed ? "50%" : tooltipPos.left,
          transform: tooltipPos.fixed ? "translate(-50%, -50%)" : "none",
          width: "min(340px, 90vw)",
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          padding: 20,
          pointerEvents: "auto",
          zIndex: 10000,
          transition: tooltipPos.fixed ? "none" : "top 0.35s ease, left 0.35s ease",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Progress Bar */}
        <div style={{ width: "100%", height: 3, backgroundColor: "var(--surface-2)", borderRadius: 1.5, overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: "var(--accent)",
              borderRadius: 1.5,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            {step.title}
          </h3>
          <button
            onClick={endTour}
            style={{
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: 16,
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div style={{ minHeight: 60 }}>
          {loadingRoute ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
              <div style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Loading page...
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {step.content}
            </p>
          )}
        </div>

        {/* Footer controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          {/* Skip button */}
          <button
            onClick={endTour}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              padding: "6px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Skip Guide
          </button>

          {/* Nav Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                style={{
                  backgroundColor: "var(--surface-0)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-0)")}
              >
                Back
              </button>
            )}

            <button
              onClick={currentStep === totalSteps - 1 ? endTour : nextStep}
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-text)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
            >
              {currentStep === totalSteps - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>

        {/* Step index counter */}
        <div style={{ fontSize: 11, color: "var(--text-secondary)", alignSelf: "center", marginTop: -6 }}>
          {currentStep + 1} of {totalSteps}
        </div>
      </div>

      <style>{`
        @keyframes pulseOutline {
          0%, 100% {
            opacity: 0.85;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.015);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
