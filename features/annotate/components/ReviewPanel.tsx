"use client";

import React, { useState, useMemo } from "react";
import { useAnnotationStore } from "../store/annotationStore";

export function ReviewPanel() {
  const {
    selectedStudy,
    updateStudyStatus,
    updateRadiologyAnnotationStatus,
    setSliceIndex,
    setCrosshair,
    setSelectedRadiologyAnnotationId,
  } = useAnnotationStore();

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  if (!selectedStudy) return null;

  const annotations = selectedStudy.annotations || [];

  const seriesNameMap = useMemo(() => {
    const mapping: Record<number, "Axial" | "Sagittal" | "Coronal"> = {};
    selectedStudy.series?.forEach((s) => {
      mapping[s.id] = s.name;
    });
    return mapping;
  }, [selectedStudy]);

  function jumpToFinding(index: number) {
    if (index < 0 || index >= annotations.length) return;
    setActiveIndex(index);
    const anno = annotations[index];
    setSelectedRadiologyAnnotationId(anno.id);
    const seriesName = seriesNameMap[anno.series] || "Axial";
    setSliceIndex(seriesName, anno.slice_number);
    const firstPt = anno.points[0];
    if (firstPt) {
      setCrosshair({ x: firstPt.x, y: firstPt.y });
    }
  }

  function handlePrev() {
    if (activeIndex > 0) {
      jumpToFinding(activeIndex - 1);
    }
  }

  function handleNext() {
    if (activeIndex < annotations.length - 1) {
      jumpToFinding(activeIndex + 1);
    }
  }

  const activeAnno = activeIndex >= 0 && activeIndex < annotations.length ? annotations[activeIndex] : null;

  async function handleAuditStatus(status: "approved" | "rejected") {
    if (activeAnno) {
      const nextStatus = activeAnno.status === status ? "pending" : status;
      await updateRadiologyAnnotationStatus(activeAnno.id, nextStatus);
    }
  }

  async function handleStudyAudit(status: "reviewed" | "approved" | "rejected") {
    if (!selectedStudy) return;
    const nextStatus = selectedStudy.status === status ? "draft" : status;
    await updateStudyStatus(nextStatus);
  }

  return (
    <div
      style={{
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            Study Audit & Review Workflow
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Go through findings to verify anomalies, then approve/reject the study.
          </p>
        </div>

        {/* Study Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", marginRight: 8 }}>
            Audit Study:
          </span>
          <button
            onClick={() => handleStudyAudit("approved")}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: selectedStudy.status === "approved" ? "var(--success)" : "var(--success-subtle)",
              color: selectedStudy.status === "approved" ? "#ffffff" : "var(--success)",
              border: "1px solid var(--success)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            ✓ Approve Study
          </button>
          <button
            onClick={() => handleStudyAudit("rejected")}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: selectedStudy.status === "rejected" ? "var(--danger)" : "var(--danger-subtle)",
              color: selectedStudy.status === "rejected" ? "#ffffff" : "var(--danger)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            ✕ Reject Study
          </button>
          <button
            onClick={() => handleStudyAudit("reviewed")}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: selectedStudy.status === "reviewed" ? "var(--accent)" : "transparent",
              color: selectedStudy.status === "reviewed" ? "#ffffff" : "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Mark Reviewed
          </button>
        </div>
      </div>

      {/* Audit Navigation */}
      {annotations.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: "16px 0" }}>
          No findings documented for audit. Annotate views to create items.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--surface-0)",
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handlePrev}
              disabled={activeIndex <= 0}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--text-primary)",
                opacity: activeIndex <= 0 ? 0.5 : 1,
              }}
            >
              ◀ Previous Finding
            </button>
            <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
              {activeIndex >= 0 ? `Finding ${activeIndex + 1} of ${annotations.length}` : `Unselected (${annotations.length} findings)`}
            </span>
            <button
              onClick={handleNext}
              disabled={activeIndex >= annotations.length - 1}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--text-primary)",
                opacity: activeIndex >= annotations.length - 1 ? 0.5 : 1,
              }}
            >
              Next Finding ▶
            </button>
          </div>

          {/* Active Audit info */}
          {activeAnno ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                Selected: <span style={{ fontWeight: 600 }}>{activeAnno.label}</span> (Slice {activeAnno.slice_number})
              </div>
              
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handleAuditStatus("approved")}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: activeAnno.status === "approved" ? "var(--success)" : "transparent",
                    color: activeAnno.status === "approved" ? "#ffffff" : "var(--success)",
                    border: "1px solid var(--success)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleAuditStatus("rejected")}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: activeAnno.status === "rejected" ? "var(--danger)" : "transparent",
                    color: activeAnno.status === "rejected" ? "#ffffff" : "var(--danger)",
                    border: "1px solid var(--danger)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => jumpToFinding(0)}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Start Review Loop
            </button>
          )}
        </div>
      )}
    </div>
  );
}
