/**
 * Column — filters tasks by status, renders TaskCards in a droppable zone.
 * useMemo for filtering per Section 8.
 * Supports individual column-level scroll-based pagination.
 */

"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task } from "@/shared/lib/types";
import { TaskCard } from "./TaskCard";
import { useTaskStore } from "../store/taskStore";

interface ColumnProps {
  status: Task["status"];
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const statusColors: Record<Task["status"], string> = {
  todo: "var(--text-secondary)",
  in_progress: "var(--priority-medium)",
  done: "var(--success)",
};

export function Column({ status, title, tasks, onEdit, onDelete }: ColumnProps) {
  const { loadMore, nextPageUrl, isLoadingMore, totalCount, showOverdueOnly } = useTaskStore();
  const hasMore = nextPageUrl[status];
  const loadingThisColumn = isLoadingMore[status];

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => t.status === status);
    if (showOverdueOnly) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;
      result = result.filter((t) => t.due_date < todayStr && t.status !== "done");
    }
    return result.sort((a, b) => a.order - b.order);
  }, [tasks, status, showOverdueOnly]);

  const { setNodeRef, isOver } = useDroppable({ id: status });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const setCombinedRef = useCallback(
    (element: HTMLDivElement | null) => {
      setNodeRef(element);
      scrollContainerRef.current = element;
    },
    [setNodeRef]
  );

  const taskIds = useMemo(
    () => filteredTasks.map((t) => t.id),
    [filteredTasks]
  );

  // Scroll handler for pagination when user scrolls to bottom of column
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMore || loadingThisColumn) return;
      const target = e.currentTarget;
      const bottomOffset = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (bottomOffset < 60) {
        loadMore(status);
      }
    },
    [hasMore, loadingThisColumn, loadMore, status]
  );


  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 4px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: statusColors[status],
          }}
        />
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-secondary)",
            backgroundColor: "var(--surface-2)",
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {filteredTasks.length} / {showOverdueOnly ? filteredTasks.length : totalCount[status]}
        </span>
      </div>

      {/* Droppable zone */}
      <div
        ref={setCombinedRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          backgroundColor: isOver ? "var(--accent-subtle)" : "var(--surface-2)",
          borderRadius: "var(--radius-md)",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          transition: "background-color var(--transition-fast)",
          border: isOver ? "2px dashed var(--accent)" : "2px dashed transparent",
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {/* Loading indicator inside the column scroll list */}
        {loadingThisColumn && hasMore && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "12px 0", gap: 8, color: "var(--text-secondary)", fontSize: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <path d="M22 12a10 10 0 0 1-10 10" />
            </svg>
            <span>Loading...</span>
          </div>
        )}

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              color: "var(--text-secondary)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ marginBottom: 12, opacity: 0.5 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p style={{ fontSize: 13, textAlign: "center" }}>
              No tasks yet.
              <br />
              Drag here or add a new task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
