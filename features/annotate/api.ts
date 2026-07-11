/**
 * Annotation API functions.
 */

import { api } from "@/shared/lib/api-client";
import type {
  ApiResult,
  AnnotatedImage,
  Polygon,
  PolygonInput,
  RadiologyStudy,
  RadiologyAnnotation,
} from "@/shared/lib/types";

interface ImageListResponse {
  results: AnnotatedImage[];
  count: number;
}

interface PolygonListResponse {
  results: Polygon[];
}

interface StudyListResponse {
  results: RadiologyStudy[];
}

export async function fetchImagesApi(): Promise<ApiResult<ImageListResponse>> {
  return api.get<ImageListResponse>("/api/images/");
}

export async function uploadImageApi(file: File): Promise<ApiResult<AnnotatedImage>> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<AnnotatedImage>("/api/images/", formData);
}

export async function deleteImageApi(id: number): Promise<ApiResult<null>> {
  return api.delete<null>(`/api/images/${id}/`);
}

export async function fetchPolygonsApi(imageId: number): Promise<ApiResult<PolygonListResponse>> {
  return api.get<PolygonListResponse>(`/api/images/${imageId}/polygons/`);
}

export async function createPolygonApi(
  imageId: number,
  input: PolygonInput
): Promise<ApiResult<Polygon>> {
  return api.post<Polygon>(`/api/images/${imageId}/polygons/`, input);
}

export async function deletePolygonApi(id: number): Promise<ApiResult<null>> {
  return api.delete<null>(`/api/polygons/${id}/`);
}

// Radiology PACS API endpoints
export async function fetchStudiesApi(): Promise<ApiResult<StudyListResponse>> {
  return api.get<StudyListResponse>("/api/studies/");
}

export async function fetchStudyDetailApi(id: number): Promise<ApiResult<RadiologyStudy>> {
  return api.get<RadiologyStudy>(`/api/studies/${id}/`);
}

export async function createStudyApi(
  name: string,
  demoScan?: boolean,
  axialFiles?: File[],
  sagittalFiles?: File[],
  coronalFiles?: File[]
): Promise<ApiResult<RadiologyStudy>> {
  const hasFiles =
    (axialFiles && axialFiles.length > 0) ||
    (sagittalFiles && sagittalFiles.length > 0) ||
    (coronalFiles && coronalFiles.length > 0);

  if (hasFiles) {
    const formData = new FormData();
    formData.append("name", name);
    if (demoScan) {
      formData.append("demo_scan", "true");
    }
    axialFiles?.forEach((file) => formData.append("axial_files", file));
    sagittalFiles?.forEach((file) => formData.append("sagittal_files", file));
    coronalFiles?.forEach((file) => formData.append("coronal_files", file));
    return api.upload<RadiologyStudy>("/api/studies/", formData);
  } else {
    return api.post<RadiologyStudy>("/api/studies/", {
      name,
      demo_scan: !!demoScan,
    });
  }
}

export async function deleteStudyApi(id: number): Promise<ApiResult<null>> {
  return api.delete<null>(`/api/studies/${id}/`);
}

export async function updateStudyStatusApi(
  id: number,
  status: "draft" | "reviewed" | "approved" | "rejected"
): Promise<ApiResult<RadiologyStudy>> {
  return api.patch<RadiologyStudy>(`/api/studies/${id}/status/`, { status });
}

export async function createRadiologyAnnotationApi(
  input: Omit<RadiologyAnnotation, "id" | "status" | "created_at">
): Promise<ApiResult<RadiologyAnnotation>> {
  return api.post<RadiologyAnnotation>("/api/annotations/", input);
}

export async function updateRadiologyAnnotationApi(
  id: number,
  input: Partial<RadiologyAnnotation>
): Promise<ApiResult<RadiologyAnnotation>> {
  return api.patch<RadiologyAnnotation>(`/api/annotations/${id}/`, input);
}

export async function deleteRadiologyAnnotationApi(id: number): Promise<ApiResult<null>> {
  return api.delete<null>(`/api/annotations/${id}/`);
}
