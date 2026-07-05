/**
 * ImageUploader — drag-and-drop or click to upload images.
 */

"use client";

import React, { useState, useRef } from "react";

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<boolean>;
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        padding: 24,
        border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        backgroundColor: isDragging ? "var(--accent-subtle)" : "var(--surface-2)",
        cursor: "pointer",
        textAlign: "center",
        transition: "all var(--transition-fast)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {isUploading ? (
        <div style={{ color: "var(--accent)", fontSize: 14, fontWeight: 500 }}>
          Uploading...
        </div>
      ) : (
        <>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="1.5"
            style={{ margin: "0 auto 8px", opacity: 0.6 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Drop an image here or <span style={{ color: "var(--accent)", fontWeight: 500 }}>browse</span>
          </p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, opacity: 0.6 }}>
            PNG, JPG, WebP up to 10MB
          </p>
        </>
      )}
    </div>
  );
}
