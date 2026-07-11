"use client";

import React from "react";
import { useAnnotationStore } from "../store/annotationStore";
import { Viewport } from "./Viewport";
import { useTourStore } from "@/shared/lib/tourStore";

interface PACSViewerProps {
  onBackToDashboard: () => void;
}

export function PACSViewer({ onBackToDashboard }: PACSViewerProps) {
  const {
    selectedStudy,
    activeTool,
    setActiveTool,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    contrastWindowActive,
    setContrastWindowActive,
    hideAnnotations,
    setHideAnnotations,
    hideReviewAnnotations,
    setHideReviewAnnotations,
    hideHoverTooltip,
    setHideHoverTooltip,
    viewportVisibility,
    toggleViewportVisibility,
    slideshowSpeed,
    setSlideshowSpeed,
    transitionDuration,
    setTransitionDuration,
    activeAnnotationColor,
    setActiveAnnotationColor,
  } = useAnnotationStore();

  const [settingsExpanded, setSettingsExpanded] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  const isTourActive = useTourStore((s) => s.isActive);
  const currentStep = useTourStore((s) => s.currentStep);

  React.useEffect(() => {
    if (isTourActive && (currentStep >= 7 && currentStep <= 10)) {
      setSettingsExpanded(true);
    }
  }, [isTourActive, currentStep]);

  if (!selectedStudy) return null;

  // Find series IDs from study
  const axialSeries = selectedStudy.series?.find((s) => s.name === "Axial");
  const sagittalSeries = selectedStudy.series?.find((s) => s.name === "Sagittal");
  const coronalSeries = selectedStudy.series?.find((s) => s.name === "Coronal");

  const axialId = axialSeries?.id || 1;
  const sagittalId = sagittalSeries?.id || 2;
  const coronalId = coronalSeries?.id || 3;

  const tools: { id: typeof activeTool; label: string; icon: React.ReactNode }[] = [
    {
      id: "pan",
      label: "Pan",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9" />
          <path d="M8 15.5a5 5 0 0 0 5 5h3a5 5 0 0 0 5-5v-6.5a1.5 1.5 0 0 0-3 0v4.5" />
          <path d="M4 11.5v6" />
        </svg>
      )
    },
    {
      id: "zoom",
      label: "Zoom",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    },
    {
      id: "point",
      label: "Point",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      )
    },
    {
      id: "box",
      label: "Box",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      )
    },
    {
      id: "polygon",
      label: "Polygon",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {/* Top PACS Toolbar */}
      {/* Top PACS Toolbar Container */}
      {/* Top PACS Toolbar Container */}
      <div className="pacs-toolbar-container">
        {/* Row 1: Study details, active tools, custom colors */}
        <div className="pacs-toolbar-row1">
          {/* Left: Dashboard link & Study details */}
          <div className="pacs-study-section">
            <button
              onClick={onBackToDashboard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--text-primary)",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--border)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--surface-2)"}
            >
              ← Dashboard
            </button>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                {selectedStudy.name}
              </h2>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                PACS Audit • Status: <span style={{ fontWeight: 600, color: "var(--accent)" }}>{selectedStudy.status}</span>
              </div>
            </div>
          </div>

          {/* Center: Tools Segmented Control */}
          <div data-tour="active-tool-selector" className="pacs-tools-section">
            {tools.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.label}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 550,
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span>{tool.icon}</span>
                  <span className="pacs-tool-btn-text">{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section: Color Picker & Adjustments Toggle */}
          <div className="pacs-controls-section">
            <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--surface-2)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginRight: 4 }}>Color:</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#F59E0B"].map((c) => {
                  const isSelected = activeAnnotationColor === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setActiveAnnotationColor(c)}
                      title={`Select ${c} color`}
                      type="button"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: c,
                        border: isSelected ? "2px solid var(--text-primary)" : "1px solid rgba(0,0,0,0.15)",
                        boxShadow: isSelected ? "0 0 0 1px var(--surface-1)" : "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "transform 0.1s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    />
                  );
                })}
                
                {/* Custom Color Input */}
                <div
                  title="Custom color"
                  style={{
                    position: "relative",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: !["#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#F59E0B"].includes(activeAnnotationColor) 
                      ? "2px solid var(--text-primary)" 
                      : "1px solid var(--border)",
                    background: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)",
                    cursor: "pointer",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.1s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <input
                    type="color"
                    value={activeAnnotationColor}
                    onChange={(e) => setActiveAnnotationColor(e.target.value)}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Adjustments Panel Toggle */}
            <button
              data-tour="adjustments-btn"
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              title={settingsExpanded ? "Hide Adjustments" : "Show Adjustments"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: settingsExpanded ? "var(--accent)" : "var(--surface-2)",
                color: settingsExpanded ? "#ffffff" : "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!settingsExpanded) e.currentTarget.style.backgroundColor = "var(--border)";
              }}
              onMouseLeave={(e) => {
                if (!settingsExpanded) e.currentTarget.style.backgroundColor = "var(--surface-2)";
              }}
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">{settingsExpanded ? "Collapse" : "Adjustments"}</span>
            </button>

            {/* Keyboard Shortcuts Hover Info */}
            <div
              style={{ position: "relative", display: "flex", alignItems: "center" }}
              onMouseEnter={() => setShowShortcuts(true)}
              onMouseLeave={() => setShowShortcuts(false)}
            >
              <button
                data-tour="shortcuts-info"
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  transition: "all var(--transition-fast)",
                }}
              >
                ℹ️
              </button>
              {showShortcuts && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 8,
                    width: 320,
                    padding: "14px 18px",
                    backgroundColor: "rgba(20, 20, 25, 0.95)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 8,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                    color: "#ffffff",
                    fontSize: 11,
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    animation: "fadeInTooltip 0.15s ease",
                  }}
                >
                  <div style={{ fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 6, marginBottom: 2, color: "#ffffff", fontSize: 12 }}>
                    Keyboard & Mouse Shortcuts
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Space + Mouse Wheel</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>Zoom View</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Space + Click & Drag</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>Pan View</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Arrow Keys / Scroll</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>Switch Slices</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Left Click</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>Draw Shapes</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {settingsExpanded && (
          <>
            <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

            {/* Row 2: Adjustments, controls, visibilities */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, alignItems: "start" }}>
              
              {/* Block A: Image Adjustments */}
              <div data-tour="image-adjustments-block" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Image adjustments</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-primary)", fontWeight: 500, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={contrastWindowActive}
                      onChange={(e) => setContrastWindowActive(e.target.checked)}
                      style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                    />
                    Apply CT Window
                  </label>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 40 }}>Bright:</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      style={{ width: 60, accentColor: "var(--accent)", height: 4 }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 40 }}>Contrast:</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      style={{ width: 60, accentColor: "var(--accent)", height: 4 }}
                    />
                  </div>
                </div>
              </div>

              {/* Block B: Slideshow Speed & Transition */}
              <div data-tour="slideshow-controls-block" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Slideshow controls</span>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 36 }}>Speed:</span>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="50"
                      value={slideshowSpeed}
                      onChange={(e) => setSlideshowSpeed(parseInt(e.target.value))}
                      style={{ width: 60, accentColor: "var(--accent)", height: 4 }}
                    />
                    <span style={{ fontSize: 10, color: "var(--text-secondary)", minWidth: 36 }}>{slideshowSpeed}ms</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 54 }}>Transition:</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={transitionDuration}
                      onChange={(e) => setTransitionDuration(parseInt(e.target.value))}
                      style={{ width: 50, accentColor: "var(--accent)", height: 4 }}
                    />
                    <span style={{ fontSize: 10, color: "var(--text-secondary)", minWidth: 32 }}>
                      {transitionDuration === 0 ? "Strict" : `${transitionDuration}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Block C: Filters & Viewports visibility */}
              <div data-tour="visibility-options-block" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Visibility options</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Checkboxes */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={hideAnnotations}
                        onChange={(e) => setHideAnnotations(e.target.checked)}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      Hide Annotations
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={hideReviewAnnotations}
                        onChange={(e) => setHideReviewAnnotations(e.target.checked)}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      Hide Audited
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={hideHoverTooltip}
                        onChange={(e) => setHideHoverTooltip(e.target.checked)}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      Hide Tooltips
                    </label>
                  </div>

                  {/* Viewport Buttons */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["Axial", "Sagittal", "Coronal"] as const).map((view) => {
                      const isVisible = viewportVisibility[view];
                      return (
                        <button
                          key={view}
                          onClick={() => toggleViewportVisibility(view)}
                          type="button"
                          style={{
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: isVisible ? "var(--surface-2)" : "transparent",
                            color: isVisible ? "var(--text-primary)" : "var(--text-secondary)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>{isVisible ? "👁️" : "👁️‍🗨️"}</span>
                          <span>{view}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* Grid of Viewports */}
      <div
        data-tour="pacs-viewport"
        style={{
          display: "grid",
          gridTemplateColumns:
            [
              viewportVisibility.Axial,
              viewportVisibility.Sagittal,
              viewportVisibility.Coronal,
            ].filter(Boolean).length === 3
              ? "repeat(3, 1fr)"
              : [
                  viewportVisibility.Axial,
                  viewportVisibility.Sagittal,
                  viewportVisibility.Coronal,
                ].filter(Boolean).length === 2
              ? "repeat(2, 1fr)"
              : "1fr",
          gap: 20,
          width: "100%",
        }}
      >
        <Viewport seriesName="Axial" seriesId={axialId} />
        <Viewport seriesName="Sagittal" seriesId={sagittalId} />
        <Viewport seriesName="Coronal" seriesId={coronalId} />
      </div>
    </div>
  );
}
