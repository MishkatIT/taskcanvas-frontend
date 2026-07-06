/**
 * Expandable Zustand store supporting both original polygon annotations and
 * advanced Radiology PACS viewer states, 3D coordinate syncing, and review workflows.
 */

import { create } from "zustand";
import type {
  AnnotatedImage,
  Polygon,
  PolygonInput,
  PolygonPoint,
  RadiologyStudy,
  RadiologyAnnotation,
} from "@/shared/lib/types";
import {
  fetchImagesApi,
  uploadImageApi,
  deleteImageApi,
  createPolygonApi,
  deletePolygonApi,
  fetchStudiesApi,
  fetchStudyDetailApi,
  createStudyApi,
  deleteStudyApi,
  updateStudyStatusApi,
  createRadiologyAnnotationApi,
  updateRadiologyAnnotationApi,
  deleteRadiologyAnnotationApi,
} from "../api";
import { preloadStudySlices } from "../utils/preloader";

interface AnnotationState {
  // Legacy states
  images: AnnotatedImage[];
  selectedImageId: number | null;
  isLoading: boolean;
  error: string | null;
  currentPoints: PolygonPoint[];
  isDrawing: boolean;
  selectedPolygonId: number | null;

  // Radiology PACS states
  studies: RadiologyStudy[];
  selectedStudy: RadiologyStudy | null;
  activeTool: "pan" | "zoom" | "point" | "box" | "polygon";
  sliceIndices: Record<"Axial" | "Sagittal" | "Coronal", number>;
  crosshair: { x: number; y: number } | null;
  brightness: number;
  contrast: number;
  contrastWindowActive: boolean;
  hideAnnotations: boolean;
  hideReviewAnnotations: boolean;
  hideHoverTooltip: boolean;
  viewportVisibility: Record<"Axial" | "Sagittal" | "Coronal", boolean>;
  slideshowActive: Record<"Axial" | "Sagittal" | "Coronal", boolean>;
  slideshowSpeed: number;
  transitionDuration: number;
  selectedRadiologyAnnotationId: number | null;
  activeAnnotationColor: string;

  // Legacy actions
  fetchImages: () => Promise<void>;
  uploadImage: (file: File) => Promise<boolean>;
  deleteImage: (id: number) => Promise<boolean>;
  selectImage: (id: number) => void;
  addPoint: (point: PolygonPoint) => void;
  clearDrawing: () => void;
  completePolygon: (label?: string, color?: string) => Promise<boolean>;
  deletePolygon: (id: number) => Promise<boolean>;
  selectPolygon: (id: number | null) => void;

  // Radiology PACS actions
  fetchStudies: () => Promise<void>;
  selectStudy: (id: number | null) => Promise<void>;
  createStudy: (
    name: string,
    axialFiles?: File[],
    sagittalFiles?: File[],
    coronalFiles?: File[]
  ) => Promise<boolean>;
  deleteStudy: (id: number) => Promise<boolean>;
  updateStudyStatus: (status: RadiologyStudy["status"]) => Promise<boolean>;
  setSliceIndex: (series: "Axial" | "Sagittal" | "Coronal", index: number) => void;
  toggleViewportVisibility: (series: "Axial" | "Sagittal" | "Coronal") => void;
  setActiveTool: (tool: "pan" | "zoom" | "point" | "box" | "polygon") => void;
  setBrightness: (b: number) => void;
  setContrast: (c: number) => void;
  setContrastWindowActive: (active: boolean) => void;
  setHideAnnotations: (hide: boolean) => void;
  setHideReviewAnnotations: (hide: boolean) => void;
  setHideHoverTooltip: (hide: boolean) => void;
  setCrosshair: (coords: { x: number; y: number } | null) => void;
  sync3DCrosshair: (sourceSeries: "Axial" | "Sagittal" | "Coronal", coords: { x: number; y: number }) => void;
  addRadiologyAnnotation: (input: Omit<RadiologyAnnotation, "id" | "status" | "created_at">) => Promise<boolean>;
  deleteRadiologyAnnotation: (id: number) => Promise<boolean>;
  updateRadiologyAnnotationStatus: (id: number, status: "pending" | "approved" | "rejected") => Promise<boolean>;
  toggleSlideshow: (series: "Axial" | "Sagittal" | "Coronal") => void;
  setSlideshowSpeed: (speed: number) => void;
  setTransitionDuration: (duration: number) => void;
  setSelectedRadiologyAnnotationId: (id: number | null) => void;
  setActiveAnnotationColor: (color: string) => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  // Defaults
  images: [],
  selectedImageId: null,
  isLoading: false,
  error: null,
  currentPoints: [],
  isDrawing: false,
  selectedPolygonId: null,

  studies: [],
  selectedStudy: null,
  activeTool: "polygon",
  sliceIndices: { Axial: 25, Sagittal: 25, Coronal: 25 },
  crosshair: null,
  brightness: 100,
  contrast: 100,
  contrastWindowActive: false,
  hideAnnotations: false,
  hideReviewAnnotations: false,
  hideHoverTooltip: false,
  viewportVisibility: { Axial: true, Sagittal: true, Coronal: true },
  slideshowActive: { Axial: false, Sagittal: false, Coronal: false },
  slideshowSpeed: 200,
  transitionDuration: 1,
  selectedRadiologyAnnotationId: null,
  activeAnnotationColor: "#10B981",

  // Legacy Actions
  fetchImages: async () => {
    set({ isLoading: true, error: null });
    const result = await fetchImagesApi();
    if (result.ok) {
      set({ images: result.data.results, isLoading: false });
      if (result.data.results.length > 0 && !get().selectedImageId) {
        set({ selectedImageId: result.data.results[0].id });
      }
    } else {
      set({ error: result.error.detail, isLoading: false });
    }
  },

  uploadImage: async (file: File) => {
    const result = await uploadImageApi(file);
    if (result.ok) {
      set((state) => ({
        images: [result.data, ...state.images],
        selectedImageId: result.data.id,
      }));
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  deleteImage: async (id: number) => {
    const result = await deleteImageApi(id);
    if (result.ok) {
      set((state) => {
        const remaining = state.images.filter((img) => img.id !== id);
        return {
          images: remaining,
          selectedImageId: remaining.length > 0 ? remaining[0].id : null,
        };
      });
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  selectImage: (id: number) => {
    if (get().currentPoints.length > 0) {
      const confirm = window.confirm("Discard unfinished polygon?");
      if (!confirm) return;
    }
    set({
      selectedImageId: id,
      currentPoints: [],
      isDrawing: false,
      selectedPolygonId: null,
    });
  },

  addPoint: (point: PolygonPoint) => {
    set((state) => ({
      currentPoints: [...state.currentPoints, point],
      isDrawing: true,
    }));
  },

  clearDrawing: () => {
    set({ currentPoints: [], isDrawing: false });
  },

  completePolygon: async (label = "", color = "#0F6E56") => {
    const { selectedImageId, currentPoints } = get();
    if (!selectedImageId || currentPoints.length < 3) return false;

    const result = await createPolygonApi(selectedImageId, {
      points: currentPoints,
      label,
      color,
    });

    if (result.ok) {
      set((state) => ({
        images: state.images.map((img) =>
          img.id === selectedImageId
            ? { ...img, polygons: [...(img.polygons || []), result.data] }
            : img
        ),
        currentPoints: [],
        isDrawing: false,
      }));
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  deletePolygon: async (id: number) => {
    const result = await deletePolygonApi(id);
    if (result.ok) {
      set((state) => ({
        images: state.images.map((img) => ({
          ...img,
          polygons: (img.polygons || []).filter((p) => p.id !== id),
        })),
        selectedPolygonId: null,
      }));
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  selectPolygon: (id: number | null) => {
    set({ selectedPolygonId: id });
  },

  // Radiology PACS actions
  fetchStudies: async () => {
    set({ isLoading: true, error: null });
    const result = await fetchStudiesApi();
    if (result.ok) {
      set({ studies: result.data.results, isLoading: false });
    } else {
      set({ error: result.error.detail, isLoading: false });
    }
  },

  selectStudy: async (id: number | null) => {
    if (!id) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("active_study_id");
      }
      set({ selectedStudy: null, crosshair: null });
      return;
    }
    set({ isLoading: true, error: null });
    const result = await fetchStudyDetailApi(id);
    if (result.ok) {
      // Trigger background preloading of study slice assets immediately
      preloadStudySlices(result.data.series || []);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("active_study_id", String(id));
      }

      const axialSeries = result.data.series?.find((s: any) => s.name === "Axial");
      const sagittalSeries = result.data.series?.find((s: any) => s.name === "Sagittal");
      const coronalSeries = result.data.series?.find((s: any) => s.name === "Coronal");

      const axialInitial = (axialSeries?.slices && axialSeries.slices.length > 0) ? 1 : 25;
      const sagittalInitial = (sagittalSeries?.slices && sagittalSeries.slices.length > 0) ? 1 : 25;
      const coronalInitial = (coronalSeries?.slices && coronalSeries.slices.length > 0) ? 1 : 25;

      const hasAxial = !!(axialSeries?.slices && axialSeries.slices.some((s: any) => s.file));
      const hasSagittal = !!(sagittalSeries?.slices && sagittalSeries.slices.some((s: any) => s.file));
      const hasCoronal = !!(coronalSeries?.slices && coronalSeries.slices.some((s: any) => s.file));

      const hasAnyImages = hasAxial || hasSagittal || hasCoronal;
      const initialVisibility = hasAnyImages
        ? { Axial: hasAxial, Sagittal: hasSagittal, Coronal: hasCoronal }
        : { Axial: true, Sagittal: true, Coronal: true };

      set({
        selectedStudy: result.data,
        isLoading: false,
        sliceIndices: { Axial: axialInitial, Sagittal: sagittalInitial, Coronal: coronalInitial },
        viewportVisibility: initialVisibility,
        crosshair: null,
      });
    } else {
      set({ error: result.error.detail, isLoading: false });
    }
  },

  createStudy: async (name, axialFiles = [], sagittalFiles = [], coronalFiles = []) => {
    set({ isLoading: true, error: null });
    let payload: string | FormData = name;
    if (axialFiles.length > 0 || sagittalFiles.length > 0 || coronalFiles.length > 0) {
      const formData = new FormData();
      formData.append("name", name);
      axialFiles.forEach((file) => formData.append("axial_files", file));
      sagittalFiles.forEach((file) => formData.append("sagittal_files", file));
      coronalFiles.forEach((file) => formData.append("coronal_files", file));
      payload = formData;
    }

    const result = await createStudyApi(payload);
    if (result.ok) {
      if (typeof window !== "undefined") {
        localStorage.setItem("active_study_id", String(result.data.id));
      }

      const axialSeries = result.data.series?.find((s: any) => s.name === "Axial");
      const sagittalSeries = result.data.series?.find((s: any) => s.name === "Sagittal");
      const coronalSeries = result.data.series?.find((s: any) => s.name === "Coronal");

      const axialInitial = (axialSeries?.slices && axialSeries.slices.length > 0) ? 1 : 25;
      const sagittalInitial = (sagittalSeries?.slices && sagittalSeries.slices.length > 0) ? 1 : 25;
      const coronalInitial = (coronalSeries?.slices && coronalSeries.slices.length > 0) ? 1 : 25;

      const hasAxial = !!(axialSeries?.slices && axialSeries.slices.some((s: any) => s.file));
      const hasSagittal = !!(sagittalSeries?.slices && sagittalSeries.slices.some((s: any) => s.file));
      const hasCoronal = !!(coronalSeries?.slices && coronalSeries.slices.some((s: any) => s.file));

      const hasAnyImages = hasAxial || hasSagittal || hasCoronal;
      const initialVisibility = hasAnyImages
        ? { Axial: hasAxial, Sagittal: hasSagittal, Coronal: hasCoronal }
        : { Axial: true, Sagittal: true, Coronal: true };

      set((state) => ({
        studies: [result.data, ...state.studies],
        selectedStudy: result.data,
        isLoading: false,
        sliceIndices: { Axial: axialInitial, Sagittal: sagittalInitial, Coronal: coronalInitial },
        viewportVisibility: initialVisibility,
        crosshair: null,
      }));
      return true;
    }
    set({ error: result.error.detail, isLoading: false });
    return false;
  },

  toggleViewportVisibility: (series) => {
    set((state) => ({
      viewportVisibility: {
        ...state.viewportVisibility,
        [series]: !state.viewportVisibility[series],
      },
    }));
  },

  deleteStudy: async (id: number) => {
    const result = await deleteStudyApi(id);
    if (result.ok) {
      set((state) => ({
        studies: state.studies.filter((s) => s.id !== id),
        selectedStudy: state.selectedStudy?.id === id ? null : state.selectedStudy,
      }));
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  updateStudyStatus: async (status: RadiologyStudy["status"]) => {
    const { selectedStudy } = get();
    if (!selectedStudy) return false;
    const result = await updateStudyStatusApi(selectedStudy.id, status);
    if (result.ok) {
      set((state) => ({
        studies: state.studies.map((s) => (s.id === selectedStudy.id ? { ...s, status } : s)),
        selectedStudy: { ...selectedStudy, status },
      }));
      return true;
    }
    return false;
  },

  setSliceIndex: (series: "Axial" | "Sagittal" | "Coronal", index: number) => {
    set((state) => ({
      sliceIndices: { ...state.sliceIndices, [series]: index },
    }));
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setBrightness: (b) => {
    set({ brightness: b });
  },

  setContrast: (c) => {
    set({ contrast: c });
  },

  setContrastWindowActive: (active) => {
    set({
      contrastWindowActive: active,
      brightness: active ? 110 : 100,
      contrast: active ? 140 : 100,
    });
  },

  setHideAnnotations: (hide) => {
    set({ hideAnnotations: hide });
  },

  setHideReviewAnnotations: (hide) => {
    set({ hideReviewAnnotations: hide });
  },

  setHideHoverTooltip: (hide) => {
    set({ hideHoverTooltip: hide });
  },

  setCrosshair: (coords) => {
    set({ crosshair: coords });
  },

  sync3DCrosshair: (sourceSeries, coords) => {
    const { selectedStudy } = get();
    if (!selectedStudy) return;

    const axialSeries = selectedStudy.series?.find((s) => s.name === "Axial");
    const sagittalSeries = selectedStudy.series?.find((s) => s.name === "Sagittal");
    const coronalSeries = selectedStudy.series?.find((s) => s.name === "Coronal");

    const axialMax = axialSeries?.slices?.length || 50;
    const sagittalMax = sagittalSeries?.slices?.length || 50;
    const coronalMax = coronalSeries?.slices?.length || 50;

    set((state) => {
      let nextIndices = { ...state.sliceIndices };
      if (sourceSeries === "Axial") {
        const sagIdx = Math.max(1, Math.min(sagittalMax, Math.round(coords.x * (sagittalMax - 1)) + 1));
        const corIdx = Math.max(1, Math.min(coronalMax, Math.round(coords.y * (coronalMax - 1)) + 1));
        nextIndices.Sagittal = sagIdx;
        nextIndices.Coronal = corIdx;
      } else if (sourceSeries === "Sagittal") {
        const corIdx = Math.max(1, Math.min(coronalMax, Math.round(coords.x * (coronalMax - 1)) + 1));
        const axIdx = Math.max(1, Math.min(axialMax, Math.round(coords.y * (axialMax - 1)) + 1));
        nextIndices.Coronal = corIdx;
        nextIndices.Axial = axIdx;
      } else if (sourceSeries === "Coronal") {
        const sagIdx = Math.max(1, Math.min(sagittalMax, Math.round(coords.x * (sagittalMax - 1)) + 1));
        const axIdx = Math.max(1, Math.min(axialMax, Math.round(coords.y * (axialMax - 1)) + 1));
        nextIndices.Sagittal = sagIdx;
        nextIndices.Axial = axIdx;
      }
      return {
        sliceIndices: nextIndices,
        crosshair: coords,
      };
    });
  },

  addRadiologyAnnotation: async (input) => {
    const { selectedStudy } = get();
    if (!selectedStudy) return false;
    const result = await createRadiologyAnnotationApi(input);
    if (result.ok) {
      set((state) => {
        if (!state.selectedStudy) return {};
        const updatedAnnotations = [...(state.selectedStudy.annotations || []), result.data];
        return {
          selectedStudy: {
            ...state.selectedStudy,
            annotations: updatedAnnotations,
          },
        };
      });
      return true;
    }
    return false;
  },

  deleteRadiologyAnnotation: async (id) => {
    const result = await deleteRadiologyAnnotationApi(id);
    if (result.ok) {
      set((state) => {
        if (!state.selectedStudy) return {};
        return {
          selectedStudy: {
            ...state.selectedStudy,
            annotations: (state.selectedStudy.annotations || []).filter((a) => a.id !== id),
          },
        };
      });
      return true;
    }
    return false;
  },

  updateRadiologyAnnotationStatus: async (id, status) => {
    const result = await updateRadiologyAnnotationApi(id, { status });
    if (result.ok) {
      set((state) => {
        if (!state.selectedStudy) return {};
        return {
          selectedStudy: {
            ...state.selectedStudy,
            annotations: (state.selectedStudy.annotations || []).map((a) =>
              a.id === id ? { ...a, status } : a
            ),
          },
        };
      });
      return true;
    }
    return false;
  },

  toggleSlideshow: (series) => {
    set((state) => ({
      slideshowActive: {
        ...state.slideshowActive,
        [series]: !state.slideshowActive[series],
      },
    }));
  },

  setSlideshowSpeed: (speed) => {
    set({ slideshowSpeed: speed });
  },

  setTransitionDuration: (duration) => {
    set({ transitionDuration: duration });
  },

  setSelectedRadiologyAnnotationId: (id) => {
    set({ selectedRadiologyAnnotationId: id });
  },

  setActiveAnnotationColor: (color) => {
    set({ activeAnnotationColor: color });
  },
}));
