"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useAnnotationStore } from "../store/annotationStore";
import type { RadiologyAnnotation } from "@/shared/lib/types";
import { getCachedImage } from "../utils/preloader";

interface ViewportProps {
  seriesName: "Axial" | "Sagittal" | "Coronal";
  seriesId: number;
}

export function Viewport({ seriesName, seriesId }: ViewportProps) {
  const {
    selectedStudy,
    sliceIndices,
    activeTool,
    brightness,
    contrast,
    hideAnnotations,
    hideReviewAnnotations,
    crosshair,
    sync3DCrosshair,
    addRadiologyAnnotation,
    deleteRadiologyAnnotation,
    viewportVisibility,
    toggleViewportVisibility,
    transitionDuration,
    slideshowActive,
    slideshowSpeed,
    selectedRadiologyAnnotationId,
    activeAnnotationColor,
  } = useAnnotationStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Custom image loading states
  const seriesData = selectedStudy?.series?.find((s) => s.id === seriesId);
  const currentSlice = sliceIndices[seriesName];
  const sliceRecord = seriesData?.slices?.find((sl) => sl.slice_number === currentSlice);
  
  const imgRef = useRef<HTMLImageElement | null>(null);
  const prevImgRef = useRef<HTMLImageElement | null>(null);
  const transitionProgress = useRef<number>(1.0);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [imgLoadedToggle, setImgLoadedToggle] = useState(false);
  const [localSlice, setLocalSlice] = useState(currentSlice);

  useEffect(() => {
    setLocalSlice(currentSlice);
  }, [currentSlice]);

  useEffect(() => {
    if (!sliceRecord?.file) {
      setLoadedSrc(null);
      imgRef.current = null;
      prevImgRef.current = null;
      transitionProgress.current = 1.0;
      return;
    }

    const fileUrl = sliceRecord.file.startsWith("http")
      ? sliceRecord.file
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${sliceRecord.file}`;

    const startTransition = (newImg: HTMLImageElement) => {
      prevImgRef.current = imgRef.current;
      imgRef.current = newImg;
      setLoadedSrc(sliceRecord.file);

      if (transitionDuration > 0 && prevImgRef.current) {
        transitionProgress.current = 0.0;
        let start: number | null = null;
        const durationMs = transitionDuration * 100; // e.g. 1 = 100ms
        
        const animate = (timestamp: number) => {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(1.0, elapsed / durationMs);
          transitionProgress.current = progress;
          
          setImgLoadedToggle((prev) => !prev);
          
          if (progress < 1.0) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      } else {
        transitionProgress.current = 1.0;
        setImgLoadedToggle((prev) => !prev);
      }
    };

    const cachedImg = getCachedImage(fileUrl);
    if (cachedImg) {
      startTransition(cachedImg);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = fileUrl;
    img.onload = () => {
      startTransition(img);
    };
    img.onerror = () => {
      console.error("Failed to load image slice from URL:", fileUrl);
    };
  }, [sliceRecord?.file, transitionDuration]);

  const totalSlices = seriesData?.slices?.length || 50;

  // Drawing states
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [boxStart, setBoxStart] = useState({ x: 0, y: 0 });
  const [boxEnd, setBoxEnd] = useState({ x: 0, y: 0 });
  const [polyPoints, setPolyPoints] = useState<{ x: number; y: number }[]>([]);
  const [hoveredAnnoId, setHoveredAnnoId] = useState<number | null>(null);

  // Track slice scroll index using key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        changeSlice(-1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        changeSlice(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlice, totalSlices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slideshow autoplay effect
  useEffect(() => {
    if (!slideshowActive[seriesName]) return;

    const interval = setInterval(() => {
      const nextIdx = currentSlice >= totalSlices ? 1 : currentSlice + 1;
      useAnnotationStore.getState().setSliceIndex(seriesName, nextIdx);
    }, slideshowSpeed);

    return () => clearInterval(interval);
  }, [slideshowActive, seriesName, currentSlice, totalSlices, slideshowSpeed]);
  function changeSlice(delta: number) {
    const nextIdx = Math.max(1, Math.min(totalSlices, currentSlice + delta));
    useAnnotationStore.getState().setSliceIndex(seriesName, nextIdx);
  }

  // Draw simulated medical MRI/CT slice
  const drawMedicalSlice = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    // Apply contrast/brightness filter only to the scan image, leaving UI sharp
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // Fill background with black scan window
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, width, height);

    // Apply zoom translation and scale to the coordinate system
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    if (loadedSrc && imgRef.current) {
      const alpha = transitionProgress.current;
      if (alpha < 1.0 && prevImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 1.0 - alpha;
        const prevImg = prevImgRef.current;
        const scaleToFitPrev = Math.min(width / prevImg.width, height / prevImg.height);
        const dwPrev = prevImg.width * scaleToFitPrev;
        const dhPrev = prevImg.height * scaleToFitPrev;
        const dxPrev = (width - dwPrev) / 2;
        const dyPrev = (height - dhPrev) / 2;
        ctx.drawImage(prevImg, dxPrev, dyPrev, dwPrev, dhPrev);
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      const img = imgRef.current;
      const scaleToFit = Math.min(width / img.width, height / img.height);
      const dw = img.width * scaleToFit;
      const dh = img.height * scaleToFit;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      ctx.restore();
      return;
    }

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.38;

    // Draw Skull boundary
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (seriesName === "Axial") {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (seriesName === "Sagittal") {
      // Sagittal oval side cut
      ctx.ellipse(cx, cy - 20, r, r * 1.1, 0, 0, Math.PI * 2);
    } else {
      // Coronal rounded rectangle
      ctx.roundRect(cx - r, cy - r - 10, r * 2, r * 2.1, 40);
    }
    ctx.stroke();

    // Draw Brain anatomical structures
    ctx.fillStyle = "#18181b";
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;
    
    // Draw cerebral hemispheres / main brain tissue
    ctx.beginPath();
    if (seriesName === "Axial") {
      ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Horizontal central ventricle divider
      ctx.beginPath();
      ctx.moveTo(cx, cy - r + 8);
      ctx.lineTo(cx, cy + r - 8);
      ctx.stroke();

      // Brain ventricles (butterfly shapes)
      ctx.fillStyle = "#0c0c0d";
      ctx.beginPath();
      ctx.ellipse(cx - 20, cy, 12, 35, Math.PI / 12, 0, Math.PI * 2);
      ctx.ellipse(cx + 20, cy, 12, 35, -Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (seriesName === "Sagittal") {
      // Side tissue view
      ctx.ellipse(cx, cy - 20, r - 8, r * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cerebellum & Brain Stem profile
      ctx.fillStyle = "#111113";
      ctx.beginPath();
      ctx.ellipse(cx + 30, cy + r - 50, 45, 60, Math.PI / 6, 0, Math.PI * 2);
      ctx.moveTo(cx + 10, cy + r - 20);
      ctx.bezierCurveTo(cx - 10, cy + r + 30, cx + 40, cy + r + 40, cx + 20, cy + r + 80);
      ctx.lineTo(cx + 60, cy + r + 80);
      ctx.fill();
      ctx.stroke();
    } else {
      // Frontal cut tissue
      ctx.roundRect(cx - r + 8, cy - r - 2, (r - 8) * 2, r * 2, 32);
      ctx.fill();
      ctx.stroke();

      // Vertical hemisphere divider
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r - 10);
      ctx.stroke();

      // Frontal ventricles
      ctx.fillStyle = "#0c0c0d";
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 10, 16, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 10, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // DRAW SIMULATED LESION (Tumor) in 3D volume space
    // Let's assume the tumor is located at X = 0.42, Y = 0.58, Z = 24.
    const tumorCenterZ = 24;
    const tumorCenterX = 0.42;
    const tumorCenterY = 0.58;

    // Check if tumor is visible in the current slice
    let distFromCenter = 0;
    let visible = false;

    if (seriesName === "Axial") {
      distFromCenter = Math.abs(currentSlice - tumorCenterZ);
      visible = distFromCenter < 18;
    } else if (seriesName === "Sagittal") {
      // Sagittal slice maps to X coordinate
      const currentX = sliceIndices.Sagittal / 50;
      distFromCenter = Math.abs(currentX - tumorCenterX) * 50;
      visible = distFromCenter < 18;
    } else {
      // Coronal slice maps to Y coordinate
      const currentY = sliceIndices.Coronal / 50;
      distFromCenter = Math.abs(currentY - tumorCenterY) * 50;
      visible = distFromCenter < 18;
    }

    if (visible) {
      // Calculate dynamic radius based on slice distance
      const maxRadius = Math.min(width, height) * 0.07;
      const tumorRadius = Math.max(2, maxRadius * (1 - distFromCenter / 18));
      
      // Determine center coords in pixels on this viewport
      let tx = cx;
      let ty = cy;

      if (seriesName === "Axial") {
        tx = cx + (tumorCenterX - 0.5) * (r * 2);
        ty = cy + (tumorCenterY - 0.5) * (r * 2);
      } else if (seriesName === "Sagittal") {
        // Sagittal displays Y (horizontal) and Z (vertical)
        tx = cx + (tumorCenterY - 0.5) * (r * 2);
        ty = cy + ((tumorCenterZ - 25) / 25) * (r * 1.8) - 10;
      } else {
        // Coronal displays X (horizontal) and Z (vertical)
        tx = cx + (tumorCenterX - 0.5) * (r * 2);
        ty = cy + ((tumorCenterZ - 25) / 25) * (r * 1.8) - 10;
      }

      // Draw tumor with fuzzy gradient/opacity (typical scan appearance)
      const grad = ctx.createRadialGradient(tx, ty, tumorRadius * 0.2, tx, ty, tumorRadius);
      grad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
      grad.addColorStop(0.4, "rgba(220, 220, 220, 0.35)");
      grad.addColorStop(1, "rgba(24, 24, 27, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tx, ty, tumorRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bright inner core
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.beginPath();
      ctx.arc(tx, ty, tumorRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [seriesName, currentSlice, sliceIndices, brightness, contrast, scale, offset, loadedSrc, imgLoadedToggle]);

  // Convert canvas pixel back to normalized (0-1) coordinates
  function getNormalizedCoords(px: number, py: number, width: number, height: number) {
    // Inverse scale and offset
    const x = (px - offset.x) / (width * scale);
    const y = (py - offset.y) / (height * scale);
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  }

  // Convert normalized back to pixel
  function getPixelCoords(nx: number, ny: number, width: number, height: number) {
    return {
      x: nx * width * scale + offset.x,
      y: ny * height * scale + offset.y,
    };
  }

  // Draw annotations & overlay items
  const drawOverlays = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!selectedStudy) return;

    // Filter annotations for this series & slice
    const annotations = (selectedStudy.annotations || []).filter((anno) => {
      if (hideAnnotations) return false;
      if (hideReviewAnnotations && anno.status !== "pending") return false;
      return anno.series === seriesId && anno.slice_number === currentSlice;
    });

    // Draw completed annotations
    annotations.forEach((anno) => {
      const isHovered = anno.id === hoveredAnnoId;
      const isSelected = anno.id === selectedRadiologyAnnotationId;
      ctx.strokeStyle = anno.color;
      ctx.fillStyle = `color-mix(in srgb, ${anno.color} 15%, transparent)`;
      ctx.lineWidth = (isHovered || isSelected) ? 3 : 2;

      if (anno.annotation_type === "point") {
        const pt = anno.points[0];
        if (!pt) return;
        const px = getPixelCoords(pt.x, pt.y, width, height);
        ctx.beginPath();
        ctx.arc(px.x, px.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner dot
        ctx.fillStyle = anno.color;
        ctx.beginPath();
        ctx.arc(px.x, px.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (anno.annotation_type === "box") {
        const start = anno.points[0];
        const end = anno.points[1] || start;
        if (!start) return;
        
        const pStart = getPixelCoords(start.x, start.y, width, height);
        const pEnd = getPixelCoords(end.x, end.y, width, height);
        
        ctx.beginPath();
        ctx.rect(pStart.x, pStart.y, pEnd.x - pStart.x, pEnd.y - pStart.y);
        ctx.fill();
        ctx.stroke();
      } else if (anno.annotation_type === "polygon") {
        if (anno.points.length < 2) return;
        ctx.beginPath();
        const p0 = getPixelCoords(anno.points[0].x, anno.points[0].y, width, height);
        ctx.moveTo(p0.x, p0.y);
        
        for (let i = 1; i < anno.points.length; i++) {
          const pi = getPixelCoords(anno.points[i].x, anno.points[i].y, width, height);
          ctx.lineTo(pi.x, pi.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw annotation text label if hovered or selected
      if (isHovered || isSelected) {
        const anchor = anno.points[0];
        if (anchor) {
          const px = getPixelCoords(anchor.x, anchor.y, width, height);
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.font = "11px Inter, sans-serif";
          const typeLabel = anno.annotation_type === "point"
            ? "Point"
            : anno.annotation_type === "box"
            ? "Bounding Box"
            : "Polygon";
          const text = `${typeLabel}: ${anno.label} (${anno.status})`;
          const textWidth = ctx.measureText(text).width;
          
          ctx.fillRect(px.x + 8, px.y - 18, textWidth + 12, 22);
          ctx.strokeStyle = anno.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(px.x + 8, px.y - 18, textWidth + 12, 22);

          ctx.fillStyle = "#ffffff";
          ctx.fillText(text, px.x + 14, px.y - 3);
        }
      }
    });

    // Draw active drawing guides
    if (activeTool === "box" && isDrawingBox) {
      ctx.strokeStyle = "var(--accent)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      
      const pStart = getPixelCoords(boxStart.x, boxStart.y, width, height);
      const pEnd = getPixelCoords(boxEnd.x, boxEnd.y, width, height);
      
      ctx.beginPath();
      ctx.rect(pStart.x, pStart.y, pEnd.x - pStart.x, pEnd.y - pStart.y);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (activeTool === "polygon" && polyPoints.length > 0) {
      ctx.strokeStyle = "var(--accent)";
      ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const p0 = getPixelCoords(polyPoints[0].x, polyPoints[0].y, width, height);
      ctx.moveTo(p0.x, p0.y);
      
      for (let i = 1; i < polyPoints.length; i++) {
        const pi = getPixelCoords(polyPoints[i].x, polyPoints[i].y, width, height);
        ctx.lineTo(pi.x, pi.y);
      }
      ctx.stroke();

      // Draw vertex circles
      polyPoints.forEach((pt, index) => {
        const px = getPixelCoords(pt.x, pt.y, width, height);
        ctx.fillStyle = index === 0 ? "#10B981" : "#ffffff";
        ctx.beginPath();
        ctx.arc(px.x, px.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // DRAW SYNCED CROSSHAIR
    if (crosshair) {
      const px = getPixelCoords(crosshair.x, crosshair.y, width, height);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(px.x, 0);
      ctx.lineTo(px.x, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, px.y);
      ctx.lineTo(width, px.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Small crosshair circle
      ctx.strokeStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(px.x, px.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [selectedStudy, hideAnnotations, hideReviewAnnotations, hoveredAnnoId, selectedRadiologyAnnotationId, currentSlice, seriesId, activeTool, isDrawingBox, boxStart, boxEnd, polyPoints, crosshair, scale, offset]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-DPI display density sizes
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    drawMedicalSlice(ctx, rect.width, rect.height);
    drawOverlays(ctx, rect.width, rect.height);
  }, [drawMedicalSlice, drawOverlays, scale, offset]);

  // Handle Resize
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (canvas && containerRef.current) {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Viewport interactions (Zoom & Pan)
  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (activeTool !== "zoom" && activeTool !== "pan" && !e.ctrlKey) {
      // Scroll slices using mouse wheel
      const delta = e.deltaY > 0 ? 1 : -1;
      changeSlice(delta);
      return;
    }

    const zoomFactor = 1.1;
    const nextScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    const boundedScale = Math.max(0.5, Math.min(8, nextScale));
    setScale(boundedScale);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const norm = getNormalizedCoords(px, py, rect.width, rect.height);

    // Pan Tool or Right click triggers Pan
    if (activeTool === "pan" || e.button === 2 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    // Annotation Tools
    if (activeTool === "point") {
      const label = window.prompt("Enter point finding label (e.g., Tumor core):");
      if (label?.trim()) {
        addRadiologyAnnotation({
          study: selectedStudy!.id,
          series: seriesId,
          slice_number: currentSlice,
          annotation_type: "point",
          label: label.trim(),
          color: activeAnnotationColor,
          points: [norm],
        });
      }
    } else if (activeTool === "box") {
      setIsDrawingBox(true);
      setBoxStart(norm);
      setBoxEnd(norm);
    } else if (activeTool === "polygon") {
      // If clicked close to the first point, complete polygon
      if (polyPoints.length >= 3) {
        const firstPt = getPixelCoords(polyPoints[0].x, polyPoints[0].y, rect.width, rect.height);
        const dist = Math.hypot(px - firstPt.x, py - firstPt.y);
        if (dist < 10) {
          handleCompletePolygon();
          return;
        }
      }
      setPolyPoints((prev) => [...prev, norm]);
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const norm = getNormalizedCoords(px, py, rect.width, rect.height);

    // Dynamic coordinates crosshair synchronization
    sync3DCrosshair(seriesName, norm);

    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (activeTool === "box" && isDrawingBox) {
      setBoxEnd(norm);
    }

    // Hover collision detection
    if (selectedStudy) {
      const annotations = (selectedStudy.annotations || []).filter(
        (anno) => anno.series === seriesId && anno.slice_number === currentSlice
      );
      
      let foundId: number | null = null;
      for (const anno of annotations) {
        if (anno.annotation_type === "point") {
          const pt = anno.points[0];
          if (pt) {
            const pCoord = getPixelCoords(pt.x, pt.y, rect.width, rect.height);
            if (Math.hypot(px - pCoord.x, py - pCoord.y) < 10) {
              foundId = anno.id;
              break;
            }
          }
        } else if (anno.annotation_type === "box") {
          const start = anno.points[0];
          const end = anno.points[1];
          if (start && end) {
            const pStart = getPixelCoords(start.x, start.y, rect.width, rect.height);
            const pEnd = getPixelCoords(end.x, end.y, rect.width, rect.height);
            
            const minX = Math.min(pStart.x, pEnd.x);
            const maxX = Math.max(pStart.x, pEnd.x);
            const minY = Math.min(pStart.y, pEnd.y);
            const maxY = Math.max(pStart.y, pEnd.y);
            
            if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
              foundId = anno.id;
              break;
            }
          }
        }
      }
      setHoveredAnnoId(foundId);
    }
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (activeTool === "box" && isDrawingBox) {
      setIsDrawingBox(false);
      // Ensure box has width/height before prompting
      if (Math.abs(boxEnd.x - boxStart.x) > 0.01 && Math.abs(boxEnd.y - boxStart.y) > 0.01) {
        const label = window.prompt("Enter bounding box finding label (e.g., Cyst):");
        if (label?.trim()) {
          addRadiologyAnnotation({
            study: selectedStudy!.id,
            series: seriesId,
            slice_number: currentSlice,
            annotation_type: "box",
            label: label.trim(),
            color: activeAnnotationColor,
            points: [boxStart, boxEnd],
          });
        }
      }
    }
  }

  function handleCompletePolygon() {
    if (polyPoints.length < 3) {
      setPolyPoints([]);
      return;
    }
    const label = window.prompt("Enter polygon finding label (e.g., Tumor outline):");
    if (label?.trim()) {
      addRadiologyAnnotation({
        study: selectedStudy!.id,
        series: seriesId,
        slice_number: currentSlice,
        annotation_type: "polygon",
        label: label.trim(),
        color: activeAnnotationColor,
        points: polyPoints,
      });
    }
    setPolyPoints([]);
  }

  function handleReset() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  if (!viewportVisibility[seriesName]) {
    return null;
  }

  const visibleCount = [
    viewportVisibility.Axial,
    viewportVisibility.Sagittal,
    viewportVisibility.Coronal,
  ].filter(Boolean).length;

  const viewportHeight = visibleCount === 1 ? 600 : 480;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        position: "relative",
        height: viewportHeight,
      }}
    >
      {/* Viewport Header */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--surface-0)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {seriesName} ({currentSlice}/{totalSlices})
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleViewportVisibility(seriesName);
            }}
            title={`Hide ${seriesName} View`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              padding: "2px 4px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            👁️
          </button>
        </div>

        {/* Local Slice controls */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            onClick={() => changeSlice(-1)}
            disabled={currentSlice === 1}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            ◀
          </button>
          <button
            onClick={() => useAnnotationStore.getState().toggleSlideshow(seriesName)}
            title={slideshowActive[seriesName] ? "Pause Slideshow" : "Play Slideshow"}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              backgroundColor: slideshowActive[seriesName] ? "var(--accent)" : "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: slideshowActive[seriesName] ? "#ffffff" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {slideshowActive[seriesName] ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => changeSlice(1)}
            disabled={currentSlice === totalSlices}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", cursor: activeTool === "pan" ? "move" : "crosshair" }}>
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "100%", height: "100%", display: "block" }}
        />

        {/* Floating slice indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "#ffffff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 11,
            pointerEvents: "none",
          }}
        >
          Slice: {currentSlice} / {totalSlices}
        </div>

        {/* View resetting button */}
        {(scale !== 1 || offset.x !== 0 || offset.y !== 0) && (
          <button
            onClick={handleReset}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "#ffffff",
              border: "none",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Reset View
          </button>
        )}
      </div>

      {/* Viewport Slider footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--surface-0)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <input
          type="range"
          min="1"
          max={totalSlices}
          step="0.01"
          value={localSlice}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setLocalSlice(val);
            const rounded = Math.round(val);
            if (rounded !== currentSlice && rounded >= 1 && rounded <= totalSlices) {
              useAnnotationStore.getState().setSliceIndex(seriesName, rounded);
            }
          }}
          style={{
            flex: 1,
            accentColor: "var(--accent)",
            height: 4,
            borderRadius: 2,
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
