/**
 * Board — top-level orchestrator for the Kanban board.
 * Renders 3 columns (todo, in_progress, done) with dnd-kit DndContext.
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import type { Task, TaskInput } from "@/shared/lib/types";
import { useTaskStore } from "../store/taskStore";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";

const COLUMNS: { status: Task["status"]; title: string }[] = [
  { status: "todo", title: "To Do" },
  { status: "in_progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

interface BoardProps {
  externalOpenModal?: boolean;
  onExternalModalHandled?: () => void;
}

export function Board({ externalOpenModal, onExternalModalHandled }: BoardProps) {
  const { tasks, selectedDate, addTask, editTask, moveTask, removeTask, loadMore, isLoadingMore, nextPageUrl, totalCount } =
    useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isCentered, setIsCentered] = useState(true);

  React.useEffect(() => {
    const checkWidth = () => {
      setIsCentered(window.innerWidth > 960);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Open modal when triggered externally (from page header "New Task" button)
  React.useEffect(() => {
    if (externalOpenModal) {
      setEditingTask(null);
      setModalOpen(true);
      onExternalModalHandled?.();
    }
  }, [externalOpenModal, onExternalModalHandled]);


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as number;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine the target column
      let targetStatus: Task["status"];

      // Check if dropped over a column (droppable id = status string)
      if (["todo", "in_progress", "done"].includes(over.id as string)) {
        targetStatus = over.id as Task["status"];
      } else {
        // Dropped over another task — find which column it's in
        const overTask = tasks.find((t) => t.id === over.id);
        if (overTask) {
          targetStatus = overTask.status;
        } else {
          return;
        }
      }

      // Calculate new order
      const targetTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== taskId)
        .sort((a, b) => a.order - b.order);

      let newOrder: number;

      if (over.id === targetStatus) {
        // Dropped on column itself — append at end
        newOrder = targetTasks.length > 0
          ? targetTasks[targetTasks.length - 1].order + 1
          : 0;
      } else {
        // Dropped over a specific task — insert at that position
        const overTask = tasks.find((t) => t.id === over.id);
        newOrder = overTask ? overTask.order : 0;
      }

      if (task.status === targetStatus && task.order === newOrder) return;

      moveTask(taskId, { status: targetStatus, order: newOrder });
    },
    [tasks, moveTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (taskId: number) => {
      setDeleteConfirm(taskId);
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (deleteConfirm !== null) {
      removeTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, removeTask]);

  const handleModalSubmit = useCallback(
    async (input: TaskInput) => {
      if (editingTask) {
        return editTask(editingTask.id, input);
      }
      return addTask(input);
    },
    [editingTask, editTask, addTask]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Kanban columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 24,
            overflowX: "auto",
            paddingBottom: 16,
            justifyContent: isCentered ? "center" : "flex-start",
            minHeight: 0,
          }}
        >
          {COLUMNS.map(({ status, title }) => (
            <Column
              key={status}
              status={status}
              title={title}
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div style={{ width: 320, opacity: 0.9 }}>
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>


      {/* Task modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        task={editingTask}
        defaultDate={selectedDate}
      />

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 360,
              padding: 24,
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              textAlign: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="1.5"
              style={{ margin: "0 auto 16px" }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
              Delete Task?
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  backgroundColor: "transparent",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: "var(--danger)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
