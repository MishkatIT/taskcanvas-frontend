/**
 * TaskCard — memoized, renders a single task.
 * Priority encoding: priority label badge.
 * Pin status encoding: small color dot indicator at top left.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { Task } from "@/shared/lib/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  cursor?: string;
}

const priorityColors: Record<Task["priority"], string> = {
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
};

const priorityLabels: Record<Task["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const statusPinColors: Record<Task["status"], string> = {
  todo: "var(--text-secondary)",
  in_progress: "var(--priority-medium)",
  done: "var(--success)",
};

function formatRelativeDate(dueDateStr: string): string {
  const today = new Date();
  
  const toDateString = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = toDateString(today);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  if (dueDateStr === todayStr) {
    return "Today";
  }
  if (dueDateStr === tomorrowStr) {
    return "Tomorrow";
  }
  if (dueDateStr === yesterdayStr) {
    return "Yesterday";
  }

  return new Date(dueDateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDateStr: string, status: string): boolean {
  if (status === "done") return false;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return dueDateStr < todayStr;
}

export const TaskCard = React.memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  cursor,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch capability
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = useCallback(() => onEdit(task), [onEdit, task]);
  const handleDelete = useCallback(() => onDelete(task.id), [onDelete, task.id]);

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        ...style,
        backgroundColor: `color-mix(in srgb, ${priorityColors[task.priority]} 3%, var(--surface-1))`,
        border: `1.5px solid color-mix(in srgb, ${priorityColors[task.priority]} 25%, var(--border))`,
        borderRadius: "var(--radius-md)",
        padding: 16,
        boxShadow: isDragging ? "var(--shadow-md)" : "var(--shadow-sm)",
        cursor: cursor || (isDragging ? "grabbing" : "grab"),
        transition: `box-shadow var(--transition-fast), ${transition || ""}`,
        position: "relative",
      }}
      {...attributes}
      {...listeners}
    >
      {/* Title row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: task.description || task.tags.length > 0 ? 8 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <div
            title={`Status: ${task.status}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: statusPinColors[task.status],
              flexShrink: 0,
            }}
          />
          <h3
            title={task.title}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              flex: 1,
              overflow: isExpanded ? "visible" : "hidden",
              textOverflow: isExpanded ? "clip" : "ellipsis",
              whiteSpace: isExpanded ? "normal" : "nowrap",
              wordBreak: isExpanded ? "break-word" : "normal",
            }}
          >
            {task.title}
          </h3>
        </div>

        {/* Actions - visible on hover or always on touch */}
        <div
          style={{
            display: "flex",
            gap: 2,
            opacity: (isHovered || isTouchDevice) ? 1 : 0,
            visibility: (isHovered || isTouchDevice) ? "visible" : "hidden",
            transition: "opacity var(--transition-fast), visibility var(--transition-fast)",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {(task.description || task.title.length > 25) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              title={isExpanded ? "Collapse card" : "Expand card"}
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: "var(--text-secondary)",
                transition: "all var(--transition-fast)",
              }}
            >
              {isExpanded ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            title="Edit task"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all var(--transition-fast)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            title="Delete task"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all var(--transition-fast)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            marginBottom: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: isExpanded ? "block" : "-webkit-box",
            WebkitLineClamp: isExpanded ? undefined : 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {task.description}
        </p>
      )}

      {/* Bottom: Priority badge + tags */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 4,
            backgroundColor: `color-mix(in srgb, ${priorityColors[task.priority]} 15%, transparent)`,
            color: priorityColors[task.priority],
          }}
        >
          {priorityLabels[task.priority]}
        </span>

        {task.due_date && (
          (() => {
            const overdue = isOverdue(task.due_date, task.status);
            return (
              <span
                title={overdue ? "Overdue task!" : "Due date"}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: overdue ? "var(--danger-subtle)" : "var(--surface-2)",
                  color: overdue ? "var(--danger)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {overdue ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )}
                <span>
                  {formatRelativeDate(task.due_date)}
                  {overdue && " (Overdue)"}
                </span>
              </span>
            );
          })()
        )}

        {task.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
});
