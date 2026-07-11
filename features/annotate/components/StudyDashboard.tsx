"use client";

import React, { useState } from "react";
import { useAnnotationStore } from "../store/annotationStore";
import type { RadiologyStudy } from "@/shared/lib/types";

interface StudyDashboardProps {
  onLoadSession: (id: number) => void;
}

export function StudyDashboard({ onLoadSession }: StudyDashboardProps) {
  const { studies, createStudy, deleteStudy, isLoading } = useAnnotationStore();
  const [studyName, setStudyName] = useState("");
  
  // Custom uploaded files
  const [axialFiles, setAxialFiles] = useState<File[]>([]);
  const [sagittalFiles, setSagittalFiles] = useState<File[]>([]);
  const [coronalFiles, setCoronalFiles] = useState<File[]>([]);
  
  // Drag states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedSeries, setDraggedSeries] = useState<"axial" | "sagittal" | "coronal" | null>(null);
  
  // Demo Scan Toggle
  const [useDemoScan, setUseDemoScan] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCreateStudy(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    
    if (!useDemoScan && axialFiles.length === 0 && sagittalFiles.length === 0 && coronalFiles.length === 0) {
      setErrorMsg("Please upload scan slice images, or toggle 'Load Demo Scan Study' below.");
      return;
    }

    const finalName = studyName.trim() || `${useDemoScan ? "Demo Scan" : "Custom Scan"} - ${new Date().toLocaleDateString()}`;
    const success = await createStudy(
      finalName,
      useDemoScan ? [] : axialFiles,
      useDemoScan ? [] : sagittalFiles,
      useDemoScan ? [] : coronalFiles
    );
    
    if (!success) {
      setErrorMsg("Failed to initialize study. Please check file sizes or try again.");
    } else {
      setStudyName("");
      setAxialFiles([]);
      setSagittalFiles([]);
      setCoronalFiles([]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, series: "axial" | "sagittal" | "coronal") {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    
    if (series === "axial") {
      setAxialFiles((prev) => [...prev, ...newFiles]);
    } else if (series === "sagittal") {
      setSagittalFiles((prev) => [...prev, ...newFiles]);
    } else {
      setCoronalFiles((prev) => [...prev, ...newFiles]);
    }
  }

  // Draggable rearranging helpers
  function handleDragStart(index: number, series: "axial" | "sagittal" | "coronal") {
    setDraggedIndex(index);
    setDraggedSeries(series);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(index: number, series: "axial" | "sagittal" | "coronal") {
    if (draggedIndex === null || draggedSeries !== series) return;
    
    let targetList: File[] = [];
    let setTargetList: React.Dispatch<React.SetStateAction<File[]>>;

    if (series === "axial") {
      targetList = [...axialFiles];
      setTargetList = setAxialFiles;
    } else if (series === "sagittal") {
      targetList = [...sagittalFiles];
      setTargetList = setSagittalFiles;
    } else {
      targetList = [...coronalFiles];
      setTargetList = setCoronalFiles;
    }

    const reordered = [...targetList];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    setTargetList(reordered);
    
    setDraggedIndex(null);
    setDraggedSeries(null);
  }

  function removeFile(index: number, series: "axial" | "sagittal" | "coronal") {
    if (series === "axial") {
      setAxialFiles((prev) => prev.filter((_, i) => i !== index));
    } else if (series === "sagittal") {
      setSagittalFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCoronalFiles((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function renderUploadSection(
    title: string,
    files: File[],
    series: "axial" | "sagittal" | "coronal"
  ) {
    return (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: 16,
          backgroundColor: "var(--surface-0)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h4>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{files.length} slices</span>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          id={`file-input-${series}`}
          onChange={(e) => handleFileChange(e, series)}
          style={{ display: "none" }}
        />
        
        <label
          htmlFor={`file-input-${series}`}
          style={{
            height: 38,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--text-secondary)",
            fontWeight: 500,
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          ＋ Select Slice Files
        </label>

        {files.length > 0 && (
          <div
            style={{
              maxHeight: 160,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "4px 0",
            }}
          >
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                draggable
                onDragStart={() => handleDragStart(idx, series)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx, series)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  fontSize: 11,
                  backgroundColor: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "grab",
                  transition: "background-color var(--transition-fast)",
                }}
              >
                <span style={{ color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                  {idx + 1}. {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx, series)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--danger)",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function getStatusColor(status: RadiologyStudy["status"]) {
    switch (status) {
      case "approved":
        return "var(--success)";
      case "rejected":
        return "var(--danger)";
      case "reviewed":
        return "var(--accent)";
      default:
        return "var(--text-secondary)";
    }
  }

  return (
    <div
      data-tour="study-dashboard"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: 32,
        width: "100%",
        maxWidth: 1300,
        margin: "24px auto",
        padding: "0 24px",
      }}
    >
      {/* Create New Session */}
      <div
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            New Study Session
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Upload custom scan image slices for Axial, Sagittal, and Coronal views. Drag list items to define slice ordering.
          </p>
        </div>

        <form onSubmit={handleCreateStudy} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {errorMsg && (
            <div style={{ color: "var(--danger)", fontSize: 12, backgroundColor: "var(--danger-subtle)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
              Study Session Name
            </label>
            <input
              type="text"
              placeholder="e.g., Patient MRI brain study"
              value={studyName}
              onChange={(e) => setStudyName(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--surface-0)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Upload zones */}
          {!useDemoScan && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {renderUploadSection("Axial Slice Sequence", axialFiles, "axial")}
              {renderUploadSection("Sagittal Slice Sequence", sagittalFiles, "sagittal")}
              {renderUploadSection("Coronal Slice Sequence", coronalFiles, "coronal")}
            </div>
          )}

          {/* Demo Scan toggle option */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="demo-scan-checkbox"
              checked={useDemoScan}
              onChange={(e) => setUseDemoScan(e.target.checked)}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <label htmlFor="demo-scan-checkbox" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
              Load Demo Scan Study (Skip manual uploads)
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: 40,
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "background-color var(--transition-fast)",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Creating Study..." : "Start Annotation Session"}
          </button>
        </form>
      </div>

      {/* Previous Sessions */}
      <div
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            Previous Annotation Sessions
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Audit findings or check status of previous study runs.
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", maxHeight: 480 }}>
          {studies.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13 }}>
              No ongoing annotation sessions found.
            </div>
          ) : (
            studies.map((study) => (
              <div
                key={study.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--surface-0)",
                  transition: "border-color var(--transition-fast)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {study.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-secondary)" }}>
                    <span>{new Date(study.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{study.annotation_count || 0} findings</span>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: getStatusColor(study.status), textTransform: "capitalize" }}>
                      {study.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                  <button
                    onClick={() => onLoadSession(study.id)}
                    style={{
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: "var(--accent)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                    }}
                  >
                    Open
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete annotation session "${study.name}"?`)) {
                        await deleteStudy(study.id);
                      }
                    }}
                    style={{
                      padding: "5px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: "transparent",
                      color: "var(--danger)",
                      border: "1px solid var(--danger)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
