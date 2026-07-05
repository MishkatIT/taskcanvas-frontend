"use client";

import React, { useState, useMemo } from "react";
import { useAnnotationStore } from "../store/annotationStore";
import type { RadiologyAnnotation } from "@/shared/lib/types";

export function AnnotationListPanel() {
  const {
    selectedStudy,
    deleteRadiologyAnnotation,
    setSliceIndex,
    setCrosshair,
    setSelectedRadiologyAnnotationId,
    selectedRadiologyAnnotationId,
    viewportVisibility,
  } = useAnnotationStore();

  const visibleCount = [
    viewportVisibility.Axial,
    viewportVisibility.Sagittal,
    viewportVisibility.Coronal,
  ].filter(Boolean).length;

  const panelHeight = visibleCount === 1 ? 688 : 568;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const seriesNameMap = useMemo(() => {
    const mapping: Record<number, "Axial" | "Sagittal" | "Coronal"> = {};
    selectedStudy?.series?.forEach((s) => {
      mapping[s.id] = s.name;
    });
    return mapping;
  }, [selectedStudy]);

  const filteredAnnotations = useMemo(() => {
    if (!selectedStudy) return [];
    return (selectedStudy.annotations || []).filter((anno) => {
      const matchesSearch = anno.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || anno.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [selectedStudy, searchQuery, statusFilter]);

  function handleFindingClick(anno: RadiologyAnnotation) {
    if (selectedRadiologyAnnotationId === anno.id) {
      setSelectedRadiologyAnnotationId(null);
      return;
    }
    setSelectedRadiologyAnnotationId(anno.id);
    const seriesName = seriesNameMap[anno.series] || "Axial";
    setSliceIndex(seriesName, anno.slice_number);
    
    // Set crosshair to focus on the first coordinate point of the finding
    const firstPt = anno.points[0];
    if (firstPt) {
      setCrosshair({ x: firstPt.x, y: firstPt.y });
    }
  }

  function getStatusLabelColor(status: RadiologyAnnotation["status"]) {
    switch (status) {
      case "approved":
        return "var(--success)";
      case "rejected":
        return "var(--danger)";
      default:
        return "var(--text-secondary)";
    }
  }

  return (
    <div
      className="right-panel-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 20,
      }}
    >
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
          Findings & Annotations
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          List of documented abnormalities and labeled regions of interest.
        </p>
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="text"
          placeholder="Search findings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            height: 36,
            padding: "0 10px",
            fontSize: 13,
            backgroundColor: "var(--surface-0)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: statusFilter === status ? "var(--surface-2)" : "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: statusFilter === status ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
        {filteredAnnotations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", fontSize: 12, color: "var(--text-secondary)" }}>
            No findings document matching filters.
          </div>
        ) : (
          filteredAnnotations.map((anno) => {
            const seriesName = seriesNameMap[anno.series] || "Axial";
            const isSelected = selectedRadiologyAnnotationId === anno.id;
            return (
              <div
                key={anno.id}
                onClick={() => handleFindingClick(anno)}
                style={{
                  padding: 12,
                  backgroundColor: "var(--surface-0)",
                  border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                  outline: isSelected ? "1px solid var(--accent)" : "none",
                  boxShadow: isSelected ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {anno.annotation_type === "point" ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#EF4444" }}>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                      ) : anno.annotation_type === "box" ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#F59E0B" }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#10B981" }}>
                          <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z" />
                        </svg>
                      )}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {anno.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--text-secondary)" }}>
                    <span>{seriesName}</span>
                    <span>•</span>
                    <span>Slice {anno.slice_number}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: getStatusLabelColor(anno.status), textTransform: "capitalize" }}>
                      {anno.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete annotation finding?")) {
                      await deleteRadiologyAnnotation(anno.id);
                    }
                  }}
                  title="Delete annotation"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--danger)",
                    cursor: "pointer",
                    padding: 4,
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
