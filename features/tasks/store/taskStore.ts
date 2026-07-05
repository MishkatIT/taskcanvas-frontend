/**
 * Task Zustand store — the ONLY place connecting "selected date/range" to "which tasks are visible."
 * Supports individual column-level scroll-based pagination.
 * Section 9: keep connective tissue here, not duplicated in components.
 */

import { create } from "zustand";
import type { Task, TaskInput, TaskMoveInput } from "@/shared/lib/types";
import {
  fetchTasksApi,
  fetchTasksByUrlApi,
  createTaskApi,
  updateTaskApi,
  moveTaskApi,
  deleteTaskApi,
  type DateFilter,
} from "../api";

/** Notion-style preset names for the date filter. */
export type FilterPreset = "today" | "yesterday" | "this_week" | "next_week" | "last_week" | "custom" | "all";

interface TaskState {
  tasks: Task[];
  selectedDate: string;
  activeFilter: DateFilter;
  activePreset: FilterPreset;
  isLoading: boolean;
  isLoadingMore: Record<Task["status"], boolean>;
  error: string | null;
  totalCount: Record<Task["status"], number>;
  nextPageUrl: Record<Task["status"], string | null>;

  setSelectedDate: (date: string) => void;
  setFilter: (preset: FilterPreset, customDate?: string) => void;
  fetchTasks: () => Promise<void>;
  loadMore: (status: Task["status"]) => Promise<void>;
  addTask: (input: TaskInput) => Promise<boolean>;
  editTask: (id: number, input: Partial<TaskInput>) => Promise<boolean>;
  moveTask: (id: number, input: TaskMoveInput) => Promise<boolean>;
  removeTask: (id: number) => Promise<boolean>;
}

function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getTodayString(): string {
  return toLocalDateString(new Date());
}

/** Get Monday of the week containing `d`. */
function getMonday(d: Date): Date {
  const clone = new Date(d);
  const day = clone.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + diff);
  return clone;
}

function getSunday(d: Date): Date {
  const mon = getMonday(d);
  mon.setDate(mon.getDate() + 6);
  return mon;
}

function buildFilter(preset: FilterPreset, customDate?: string): { filter: DateFilter; displayDate: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return { filter: { mode: "single", date: toLocalDateString(today) }, displayDate: toLocalDateString(today) };

    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { filter: { mode: "single", date: toLocalDateString(y) }, displayDate: toLocalDateString(y) };
    }

    case "this_week": {
      const mon = getMonday(today);
      const sun = getSunday(today);
      return { filter: { mode: "range", from: toLocalDateString(mon), to: toLocalDateString(sun) }, displayDate: toLocalDateString(today) };
    }

    case "next_week": {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const mon = getMonday(nextWeek);
      const sun = getSunday(nextWeek);
      return { filter: { mode: "range", from: toLocalDateString(mon), to: toLocalDateString(sun) }, displayDate: toLocalDateString(mon) };
    }

    case "last_week": {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const mon = getMonday(lastWeek);
      const sun = getSunday(lastWeek);
      return { filter: { mode: "range", from: toLocalDateString(mon), to: toLocalDateString(sun) }, displayDate: toLocalDateString(sun) };
    }

    case "all":
      return { filter: { mode: "all" }, displayDate: toLocalDateString(today) };

    case "custom": {
      const d = customDate || toLocalDateString(today);
      return { filter: { mode: "single", date: d }, displayDate: d };
    }
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: getTodayString(),
  activeFilter: { mode: "all" },
  activePreset: "all",
  isLoading: false,
  isLoadingMore: { todo: false, in_progress: false, done: false },
  error: null,
  totalCount: { todo: 0, in_progress: 0, done: 0 },
  nextPageUrl: { todo: null, in_progress: null, done: null },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date, activeFilter: { mode: "single", date }, activePreset: "custom" });
    get().fetchTasks();
  },

  setFilter: (preset: FilterPreset, customDate?: string) => {
    const { filter, displayDate } = buildFilter(preset, customDate);
    set({ activePreset: preset, activeFilter: filter, selectedDate: displayDate });
    get().fetchTasks();
  },

  fetchTasks: async () => {
    const filter = get().activeFilter;
    set({ isLoading: true, error: null });

    // Fetch the first page for each status column concurrently
    const [todoRes, inProgressRes, doneRes] = await Promise.all([
      fetchTasksApi(filter, 1, "todo"),
      fetchTasksApi(filter, 1, "in_progress"),
      fetchTasksApi(filter, 1, "done"),
    ]);

    if (todoRes.ok && inProgressRes.ok && doneRes.ok) {
      const allTasks = [
        ...todoRes.data.results,
        ...inProgressRes.data.results,
        ...doneRes.data.results,
      ];
      set({
        tasks: allTasks,
        totalCount: {
          todo: todoRes.data.count,
          in_progress: inProgressRes.data.count,
          done: doneRes.data.count,
        },
        nextPageUrl: {
          todo: todoRes.data.next,
          in_progress: inProgressRes.data.next,
          done: doneRes.data.next,
        },
        isLoading: false,
      });
    } else {
      const errorMsg =
        (!todoRes.ok ? todoRes.error?.detail : "") ||
        (!inProgressRes.ok ? inProgressRes.error?.detail : "") ||
        (!doneRes.ok ? doneRes.error?.detail : "") ||
        "Failed to fetch tasks";
      set({ error: errorMsg, isLoading: false });
    }
  },

  loadMore: async (status: Task["status"]) => {
    const { nextPageUrl, isLoadingMore } = get();
    const url = nextPageUrl[status];
    const loading = isLoadingMore[status];
    if (!url || loading) return;

    set((state) => ({
      isLoadingMore: {
        ...state.isLoadingMore,
        [status]: true,
      },
    }));

    const result = await fetchTasksByUrlApi(url);
    if (result.ok) {
      // Append non-duplicate tasks to store
      set((state) => {
        const existingIds = new Set(state.tasks.map((t) => t.id));
        const newTasks = result.data.results.filter((t) => !existingIds.has(t.id));
        return {
          tasks: [...state.tasks, ...newTasks],
          nextPageUrl: {
            ...state.nextPageUrl,
            [status]: result.data.next,
          },
          totalCount: {
            ...state.totalCount,
            [status]: result.data.count,
          },
          isLoadingMore: {
            ...state.isLoadingMore,
            [status]: false,
          },
        };
      });
    } else {
      set((state) => ({
        isLoadingMore: {
          ...state.isLoadingMore,
          [status]: false,
        },
        error: result.error.detail,
      }));
    }
  },

  addTask: async (input: TaskInput) => {
    const result = await createTaskApi(input);
    if (result.ok) {
      // Refetch to get correct ordering
      await get().fetchTasks();
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  editTask: async (id: number, input: Partial<TaskInput>) => {
    const result = await updateTaskApi(id, input);
    if (result.ok) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...result.data } : t)),
      }));
      return true;
    }
    set({ error: result.error.detail });
    return false;
  },

  moveTask: async (id: number, input: TaskMoveInput) => {
    const previousTasks = get().tasks;
    const previousTotalCount = get().totalCount;

    const taskToMove = previousTasks.find((t) => t.id === id);
    if (!taskToMove) return false;

    const oldStatus = taskToMove.status;
    const newStatus = input.status;

    // Optimistic update
    set((state) => {
      const updatedTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, status: newStatus, order: input.order } : t
      );

      // Recalculate local status total counts
      let updatedTotalCount = { ...state.totalCount };
      if (oldStatus !== newStatus) {
        updatedTotalCount[oldStatus] = Math.max(0, updatedTotalCount[oldStatus] - 1);
        updatedTotalCount[newStatus] = updatedTotalCount[newStatus] + 1;
      }

      return {
        tasks: updatedTasks,
        totalCount: updatedTotalCount,
      };
    });

    const result = await moveTaskApi(id, input);
    if (!result.ok) {
      // Rollback on failure
      set({ tasks: previousTasks, totalCount: previousTotalCount, error: result.error.detail });
      return false;
    }

    return true;
  },

  removeTask: async (id: number) => {
    const previousTasks = get().tasks;
    const previousTotalCount = get().totalCount;

    const taskToRemove = previousTasks.find((t) => t.id === id);
    if (!taskToRemove) return false;
    const status = taskToRemove.status;

    // Optimistic removal
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      totalCount: {
        ...state.totalCount,
        [status]: Math.max(0, state.totalCount[status] - 1),
      },
    }));

    const result = await deleteTaskApi(id);
    if (!result.ok) {
      // Rollback
      set({ tasks: previousTasks, totalCount: previousTotalCount, error: result.error.detail });
      return false;
    }
    return true;
  },
}));
