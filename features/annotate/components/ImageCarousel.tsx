/**
 * ImageCarousel — thumbnail strip for image selection.
 */

"use client";

import React from "react";
import type { AnnotatedImage } from "@/shared/lib/types";

interface ImageCarouselProps {
  images: AnnotatedImage[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ImageCarousel({
  images,
  selectedId,
  onSelect,
  onDelete,
}: ImageCarouselProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (images.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "8px 0",
      }}
    >
      {images.map((img) => {
        const isSelected = img.id === selectedId;
        const imgUrl = img.file.startsWith("http") ? img.file : `${apiBase}${img.file}`;

        return (
          <div
            key={img.id}
            style={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => onSelect(img.id)}
              style={{
                width: 72,
                height: 72,
                borderRadius: "var(--radius-sm)",
                border: isSelected
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border)",
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                backgroundColor: "var(--surface-2)",
                transition: "border-color var(--transition-fast)",
              }}
            >
              <img
                src={imgUrl}
                alt={img.original_filename}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(img.id);
              }}
              title="Delete image"
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "var(--danger)",
                color: "#ffffff",
                border: "2px solid var(--surface-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
