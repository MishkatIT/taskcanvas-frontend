/**
 * Shared TypeScript types — single source of truth.
 * Section 6 of the project plan.
 */

export interface User {
  id: number;
  email: string;
  display_name: string;
  avatar: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
  tags: string[];
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string;
  tags: string[];
}

export interface TaskMoveInput {
  status: Task["status"];
  order: number;
}

export interface PolygonPoint {
  x: number;
  y: number;
}

export interface Polygon {
  id: number;
  image: number;
  points: PolygonPoint[];
  label: string;
  color: string;
  created_at?: string;
}

export interface PolygonInput {
  points: PolygonPoint[];
  label?: string;
  color?: string;
}

export interface AnnotatedImage {
  id: number;
  file: string;
  original_filename: string;
  width: number;
  height: number;
  uploaded_at?: string;
  polygons?: Polygon[];
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        detail: string;
        code: string;
        errors?: Record<string, string[]>;
      };
    };

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
}

export interface RadiologyAnnotation {
  id: number;
  study: number;
  series: number;
  slice_number: number;
  annotation_type: "point" | "box" | "polygon";
  label: string;
  color: string;
  points: any[];
  status: "pending" | "approved" | "rejected";
  created_at?: string;
}

export interface RadiologySlice {
  id: number;
  series: number;
  slice_number: number;
  file: string | null;
}

export interface RadiologySeries {
  id: number;
  study: number;
  name: "Axial" | "Sagittal" | "Coronal";
  slices: RadiologySlice[];
}

export interface RadiologyStudy {
  id: number;
  name: string;
  status: "draft" | "reviewed" | "approved" | "rejected";
  created_at: string;
  annotation_count?: number;
  series?: RadiologySeries[];
  annotations?: RadiologyAnnotation[];
}

