/**
 * Task API functions — all return ApiResult<T>.
 */

import { api } from "@/shared/lib/api-client";
import type { ApiResult, Task, TaskInput, TaskMoveInput } from "@/shared/lib/types";

export interface TaskListResponse {
  results: Task[];
  count: number;
  next: string | null;
  previous: string | null;
}

export type DateFilter =
  | { mode: "single"; date: string }
  | { mode: "range"; from: string; to: string }
  | { mode: "all" };

function buildBaseUrl(filter: DateFilter): string {
  switch (filter.mode) {
    case "single":
      return `/api/tasks/?due_date=${filter.date}`;
    case "range":
      return `/api/tasks/?due_date_from=${filter.from}&due_date_to=${filter.to}`;
    case "all":
      return `/api/tasks/?all=true`;
  }
}

export async function fetchTasksApi(
  filter: DateFilter,
  page: number = 1,
  status?: string,
  search?: string
): Promise<ApiResult<TaskListResponse>> {
  const base = buildBaseUrl(filter);
  const separator = base.includes("?") ? "&" : "?";
  let url = `${base}${separator}page=${page}`;
  if (status) {
    url += `&status=${status}`;
  }
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return api.get<TaskListResponse>(url);
}

export async function fetchTasksByUrlApi(url: string): Promise<ApiResult<TaskListResponse>> {
  // For "Load More" — uses the `next` URL directly from the paginated response
  // Strip the API base from the URL if present (DRF returns absolute URLs)
  try {
    const parsed = new URL(url);
    const relativeUrl = parsed.pathname + parsed.search;
    return api.get<TaskListResponse>(relativeUrl);
  } catch {
    return api.get<TaskListResponse>(url);
  }
}

export async function createTaskApi(input: TaskInput): Promise<ApiResult<Task>> {
  return api.post<Task>("/api/tasks/", input);
}

export async function updateTaskApi(id: number, input: Partial<TaskInput>): Promise<ApiResult<Task>> {
  return api.patch<Task>(`/api/tasks/${id}/`, input);
}

export async function moveTaskApi(id: number, input: TaskMoveInput): Promise<ApiResult<Task>> {
  return api.patch<Task>(`/api/tasks/${id}/move/`, input);
}

export async function deleteTaskApi(id: number): Promise<ApiResult<null>> {
  return api.delete<null>(`/api/tasks/${id}/`);
}
