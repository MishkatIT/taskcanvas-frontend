/**
 * AnnotationCanvas — react-konva canvas for polygon drawing.
 * Wrapped in dynamic(..., { ssr: false }) in the page.
 *
 * Section 8: dynamic import because react-konva needs window.
 * Section 9: receives one image + polygons, emits onPolygonComplete / onPolygonDelete.
 */

"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group, Text, Rect } from "react-konva";
import type { PolygonPoint, Polygon } from "@/shared/lib/types";

interface AnnotationCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  polygons: Polygon[];
  currentPoints: PolygonPoint[];
  selectedPolygonId: number | null;
  onAddPoint: (point: PolygonPoint) => void;
  onCompletePolygon: () => void;
  onSelectPolygon: (id: number | null) => void;
  onDeletePolygon: (id: number) => void;
}

export function AnnotationCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  polygons,
  currentPoints,
  selectedPolygonId,
  onAddPoint,
  onCompletePolygon,
  onSelectPolygon,
  onDeletePolygon,
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Fit to container
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const aspectRatio = imageHeight / imageWidth;
        const displayWidth = Math.min(containerWidth, 1000);
        const displayHeight = displayWidth * aspectRatio;

        setCanvasSize({ width: displayWidth, height: displayHeight });
        setScale(displayWidth / imageWidth);
      }
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [imageWidth, imageHeight]);

  // Convert normalized coords (0–1) to canvas pixels
  const toPixel = useCallback(
    (p: PolygonPoint) => ({
      x: p.x * canvasSize.width,
      y: p.y * canvasSize.height,
    }),
    [canvasSize]
  );

  // Convert canvas pixels to normalized coords
  const toNormalized = useCallback(
    (x: number, y: number): PolygonPoint => ({
      x: Math.max(0, Math.min(1, x / canvasSize.width)),
      y: Math.max(0, Math.min(1, y / canvasSize.height)),
    }),
    [canvasSize]
  );

  function handleStageClick(e: any) {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const normalized = toNormalized(pos.x, pos.y);

    // Check if click is near the starting point (close polygon)
    if (currentPoints.length >= 3) {
      const start = toPixel(currentPoints[0]);
      const dist = Math.sqrt((pos.x - start.x) ** 2 + (pos.y - start.y) ** 2);
      if (dist < 12) {
        onCompletePolygon();
        return;
      }
    }

    onAddPoint(normalized);
  }

  function handleDoubleClick() {
    if (currentPoints.length >= 3) {
      onCompletePolygon();
    }
  }

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleStageClick}
        onDblClick={handleDoubleClick}
        style={{
          backgroundColor: "var(--surface-2)",
          borderRadius: "var(--radius-md)",
          cursor: "crosshair",
        }}
      >
        {/* Image layer */}
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          )}
        </Layer>

        {/* Polygon layer */}
        <Layer>
          {/* Existing polygons */}
          {polygons.map((polygon) => {
            const points = polygon.points.flatMap((p) => {
              const px = toPixel(p);
              return [px.x, px.y];
            });
            const isSelected = polygon.id === selectedPolygonId;

            return (
              <Group key={polygon.id}>
                <Line
                  points={points}
                  closed
                  fill={polygon.color + "40"} // 25% opacity
                  stroke={polygon.color}
                  strokeWidth={isSelected ? 3 : 2}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onSelectPolygon(polygon.id);
                  }}
                  hitStrokeWidth={10}
                />
                {/* Label */}
                {polygon.label && (
                  <>
                    <Rect
                      x={toPixel(polygon.points[0]).x}
                      y={toPixel(polygon.points[0]).y - 22}
                      width={polygon.label.length * 8 + 12}
                      height={20}
                      fill={polygon.color}
                      cornerRadius={4}
                    />
                    <Text
                      x={toPixel(polygon.points[0]).x + 6}
                      y={toPixel(polygon.points[0]).y - 18}
                      text={polygon.label}
                      fontSize={12}
                      fill="#ffffff"
                    />
                  </>
                )}
                {/* Delete button when selected */}
                {isSelected && (
                  <Group
                    onClick={(e) => {
                      e.cancelBubble = true;
                      onDeletePolygon(polygon.id);
                    }}
                  >
                    <Circle
                      x={toPixel(polygon.points[0]).x}
                      y={toPixel(polygon.points[0]).y}
                      radius={10}
                      fill="#e24b4a"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <Text
                      x={toPixel(polygon.points[0]).x - 4}
                      y={toPixel(polygon.points[0]).y - 6}
                      text="×"
                      fontSize={14}
                      fill="#ffffff"
                      fontStyle="bold"
                    />
                  </Group>
                )}
              </Group>
            );
          })}

          {/* Current drawing polygon */}
          {currentPoints.length > 0 && (
            <>
              <Line
                points={currentPoints.flatMap((p) => {
                  const px = toPixel(p);
                  return [px.x, px.y];
                })}
                stroke="var(--accent)"
                strokeWidth={2}
                dash={[5, 5]}
              />
              {/* Vertex dots */}
              {currentPoints.map((point, i) => {
                const px = toPixel(point);
                return (
                  <Circle
                    key={i}
                    x={px.x}
                    y={px.y}
                    radius={i === 0 ? 7 : 5}
                    fill={i === 0 ? "#0F6E56" : "#ffffff"}
                    stroke="#0F6E56"
                    strokeWidth={2}
                  />
                );
              })}
            </>
          )}
        </Layer>
      </Stage>

      {/* Instructions overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        {currentPoints.length === 0
          ? "Click to start drawing a polygon"
          : currentPoints.length < 3
          ? `${3 - currentPoints.length} more points needed to close`
          : "Click near the start point or double-click to complete"}
      </div>
    </div>
  );
}
