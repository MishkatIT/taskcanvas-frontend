"use client";

import React from "react";
import { useAnnotationStore } from "../store/annotationStore";
import { Viewport } from "./Viewport";

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
    viewportVisibility,
    toggleViewportVisibility,
    slideshowSpeed,
    setSlideshowSpeed,
    transitionDuration,
    setTransitionDuration,
    activeAnnotationColor,
    setActiveAnnotationColor,
  } = useAnnotationStore();

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
      label: "Pan View",
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
      label: "Zoom View",
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
      label: "Bounding Box",
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: 16,
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {/* Left: Back button & Study title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBackToDashboard}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            ← Dashboard
          </button>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {selectedStudy.name}
            </h2>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "capitalize" }}>
              PACS Audit • Status: <span style={{ fontWeight: 600 }}>{selectedStudy.status}</span>
            </div>
          </div>
        </div>

        {/* Center: Tool Selection & Color Palette */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", backgroundColor: "var(--surface-0)", padding: 4, borderRadius: 8, border: "1px solid var(--border)", gap: 2 }}>
            {tools.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.label}
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: 500,
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
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
                  <span className="hidden md:inline">{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Color Palette Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--surface-0)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginRight: 4 }}>Color:</span>
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

        {/* Right: PACS Windows & Global adjustments */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Preset window */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="preset-ct"
              checked={contrastWindowActive}
              onChange={(e) => setContrastWindowActive(e.target.checked)}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <label htmlFor="preset-ct" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
              Apply CT Window
            </label>
          </div>

          {/* Brightness Adjust */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Bright:</span>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              style={{ width: 50, accentColor: "var(--accent)", height: 4 }}
            />
          </div>

          {/* Contrast Adjust */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Contrast:</span>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              style={{ width: 50, accentColor: "var(--accent)", height: 4 }}
            />
          </div>

          {/* Slideshow Speed */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Speed:</span>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={slideshowSpeed}
              onChange={(e) => setSlideshowSpeed(parseInt(e.target.value))}
              style={{ width: 50, accentColor: "var(--accent)", height: 4 }}
            />
            <span style={{ fontSize: 10, color: "var(--text-secondary)", minWidth: 36 }}>{slideshowSpeed}ms</span>
          </div>

          {/* Transition Duration */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Transition:</span>
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

          {/* Visibilities */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={hideAnnotations}
                onChange={(e) => setHideAnnotations(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              Hide Annotations
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={hideReviewAnnotations}
                onChange={(e) => setHideReviewAnnotations(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              Hide Audited
            </label>

            {/* Viewport Toggles */}
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
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

      {/* Grid of Viewports */}
      <div
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
