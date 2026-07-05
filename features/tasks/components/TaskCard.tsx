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

export const TaskCard = React.memo(function TaskCard({
  task,
  onEdit,
  onDelete,
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
      style={{
        ...style,
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 16,
        boxShadow: isDragging ? "var(--shadow-md)" : "var(--shadow-sm)",
        cursor: "grab",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
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
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              flex: 1,
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
          {task.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse description" : "Expand description"}
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
            onClick={handleEdit}
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
            onClick={handleDelete}
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
