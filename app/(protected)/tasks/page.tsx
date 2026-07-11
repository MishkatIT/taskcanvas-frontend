/**
 * Tasks page — wires DateSelector + Board with unauthenticated onboarding mode.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { DateSelector } from "@/features/tasks/components/DateSelector";
import { Board } from "@/features/tasks/components/Board";
import { useTaskStore } from "@/features/tasks/store/taskStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import Link from "next/link";

export default function TasksPage() {
  const { selectedDate, setSelectedDate, setFilter, activePreset, fetchTasks, isLoading, showOverdueOnly, setShowOverdueOnly, tasks } = useTaskStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [triggerNewTask, setTriggerNewTask] = useState(false);
  const handleModalHandled = useCallback(() => setTriggerNewTask(false), []);
  const [searchVal, setSearchVal] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  // Handle search query updates with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentQuery = useTaskStore.getState().searchQuery;
      if (currentQuery !== searchVal) {
        useTaskStore.setState({ searchQuery: searchVal });
        fetchTasks();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal, fetchTasks]);

  useEffect(() => {
    document.title = "TaskCanvas Tasks";
    fetchTasks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Banner call to action */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--accent-subtle) 0%, var(--surface-1) 100%)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            border: "1px solid var(--border)",
            textAlign: "center",
            boxShadow: "var(--shadow-md)",
            marginBottom: 48,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "var(--accent)",
              opacity: 0.05,
              filter: "blur(40px)",
            }}
          />
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Supercharge Your Workflows with Kanban Boards
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 700, margin: "0 auto 32px auto", lineHeight: 1.6 }}>
            Organize daily tasks, track progress columns, set item priorities, and coordinate team collaborations in real-time. 
            Sign in to unlock persistent databases and sync your workspaces across all devices.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/login"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-text)",
                padding: "12px 28px",
                borderRadius: "var(--radius-md)",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>

        {/* Animation visual section */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--surface-1)", padding: 32, boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 24, textAlign: "center" }}>
            See How Easily You Can Organize Tasks
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              position: "relative",
              minHeight: 280,
            }}
          >
            {/* Column 1: To Do */}
            <div style={{ backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--danger)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>To Do</h3>
              </div>
              <div style={{ minHeight: 180, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
                {/* Animated dragging card */}
                <div
                  id="animated-drag-card"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: 12,
                    boxShadow: "var(--shadow-sm)",
                    animation: "dragCardAnimation 8s infinite ease-in-out",
                    zIndex: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "2px 6px", borderRadius: 4 }}>High</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Design Database Schema</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Create relational maps for studies.</div>
                </div>

                <div style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12, opacity: 0.7 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Setup Redis Cache</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Speed up slice indexing loads.</div>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div style={{ backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--warning)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>In Progress</h3>
              </div>
              <div style={{ minHeight: 180, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
                {/* Drag target indicator slot */}
                <div
                  style={{
                    border: "2px dashed var(--accent-subtle)",
                    borderRadius: "var(--radius-md)",
                    height: 100,
                    animation: "pulseSlot 8s infinite",
                  }}
                />

                <div style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Audit Brain Slices</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Annotate findings on slice sequence.</div>
                </div>
              </div>
            </div>

            {/* Column 3: Done */}
            <div style={{ backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--success)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Done</h3>
              </div>
              <div style={{ minHeight: 180, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Theme Preferences</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Toggle between light and dark viewport themes.</div>
                </div>
              </div>
            </div>

            {/* Simulated cursor icon tracking */}
            <div
              style={{
                position: "absolute",
                width: 24,
                height: 24,
                pointerEvents: "none",
                zIndex: 100,
                animation: "pointerAnimation 8s infinite ease-in-out",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)" stroke="#ffffff" strokeWidth="2">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CSS Keyframes Animations injected directly */}
        <style>{`
          @keyframes dragCardAnimation {
            0%, 20% {
              transform: none;
              box-shadow: var(--shadow-sm);
            }
            35%, 65% {
              transform: translate(320px, 0px) scale(1.02);
              box-shadow: var(--shadow-md);
              border-color: var(--accent);
            }
            80%, 100% {
              transform: none;
              box-shadow: var(--shadow-sm);
            }
          }
          @keyframes pulseSlot {
            0%, 20% {
              opacity: 0;
            }
            35%, 65% {
              opacity: 1;
              background-color: var(--accent-subtle);
            }
            80%, 100% {
              opacity: 0;
            }
          }
          @keyframes pointerAnimation {
            0% {
              left: 10%;
              top: 50%;
            }
            20% {
              left: 5%;
              top: 30%;
            }
            30% {
              left: 5%;
              top: 30%;
            }
            45% {
              left: 35%;
              top: 30%;
            }
            60% {
              left: 35%;
              top: 30%;
            }
            75% {
              left: 10%;
              top: 50%;
            }
            100% {
              left: 10%;
              top: 50%;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px min(4vw, 40px)", maxWidth: 1600, margin: "0 auto", width: "100%", height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", boxSizing: "border-box", minHeight: 0 }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Tasks
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Organize your work with Kanban boards
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{
                padding: "8px 12px 8px 36px",
                fontSize: 13,
                backgroundColor: "var(--surface-1)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                outline: "none",
                width: searchVal ? 240 : 200,
                transition: "all var(--transition-fast)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.width = "240px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                if (!e.currentTarget.value) {
                  e.currentTarget.style.width = "200px";
                }
              }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: 12,
                color: "var(--text-secondary)",
                opacity: 0.7,
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal("")}
                style={{
                  position: "absolute",
                  right: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Overdue Toggle */}
          <button
            type="button"
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            title="Toggle Overdue Filter"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: showOverdueOnly ? "var(--danger-subtle)" : "var(--surface-1)",
              color: showOverdueOnly ? "var(--danger)" : "var(--text-secondary)",
              border: `1px solid ${showOverdueOnly ? "var(--danger)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Overdue Only</span>
          </button>

          {/* Insights Toggle Button */}
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            title="Toggle Analytics Insights"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: showInsights ? "var(--accent-subtle)" : "var(--surface-1)",
              color: showInsights ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${showInsights ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Insights</span>
          </button>

          <DateSelector
            value={selectedDate}
            activePreset={activePreset}
            onPresetChange={setFilter}
            onShift={setSelectedDate}
          />

          <button
            data-tour="new-task-btn"
            onClick={() => setTriggerNewTask(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: "var(--accent)",
              color: "var(--accent-text)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Insights Panel */}
      <div
        style={{
          maxHeight: showInsights ? "600px" : "0px",
          opacity: showInsights ? 1 : 0,
          overflow: "hidden",
          transition: "all var(--transition-normal)",
          marginBottom: showInsights ? 24 : 0,
          backgroundColor: "var(--surface-1)",
          border: showInsights ? "1px solid var(--border)" : "1px solid transparent",
          borderRadius: "var(--radius-md)",
          padding: showInsights ? 20 : 0,
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Board Analytics & Insights
          </h3>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Calculated from {tasks.length} loaded tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: 13 }}>
            No tasks loaded. Add some tasks to view dashboard analytics!
          </div>
        ) : (
          (() => {
            const total = tasks.length;
            const completed = tasks.filter((t) => t.status === "done").length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            const highCount = tasks.filter((t) => t.priority === "high").length;
            const medCount = tasks.filter((t) => t.priority === "medium").length;
            const lowCount = tasks.filter((t) => t.priority === "low").length;

            // Compute tags counts
            const tagsMap: Record<string, number> = {};
            tasks.forEach((t) => {
              t.tags.forEach((tag) => {
                tagsMap[tag] = (tagsMap[tag] || 0) + 1;
              });
            });
            const topTags = Object.entries(tagsMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10);

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                {/* Column 1: Completion Rate Circle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 12, backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Completion Rate</span>
                  <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--surface-2)" strokeWidth="3" />
                      {/* Foreground indicator */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3.2"
                        strokeDasharray={`${percent} ${100 - percent}`}
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{percent}%</span>
                      <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>{completed} / {total} done</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Priority Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Priority Distribution</span>
                  {/* High Priority Bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
                      <span style={{ color: "var(--priority-high)" }}>High</span>
                      <span style={{ color: "var(--text-primary)" }}>{highCount} ({total > 0 ? Math.round((highCount / total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${total > 0 ? (highCount / total) * 100 : 0}%`, height: "100%", backgroundColor: "var(--priority-high)", borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                  {/* Medium Priority Bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
                      <span style={{ color: "var(--priority-medium)" }}>Medium</span>
                      <span style={{ color: "var(--text-primary)" }}>{medCount} ({total > 0 ? Math.round((medCount / total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${total > 0 ? (medCount / total) * 100 : 0}%`, height: "100%", backgroundColor: "var(--priority-medium)", borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                  {/* Low Priority Bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
                      <span style={{ color: "var(--priority-low)" }}>Low</span>
                      <span style={{ color: "var(--text-primary)" }}>{lowCount} ({total > 0 ? Math.round((lowCount / total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${total > 0 ? (lowCount / total) * 100 : 0}%`, height: "100%", backgroundColor: "var(--priority-low)", borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                </div>

                {/* Column 3: Top Tags Cloud */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Top Tags</span>
                  {topTags.length === 0 ? (
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", padding: "10px 0" }}>
                      No tags found on loaded tasks.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {topTags.map(([tag, count]) => (
                        <div
                          key={tag}
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: "3px 8px",
                            backgroundColor: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>{tag}</span>
                          <span style={{ fontWeight: 600, color: "var(--accent)" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 280,
                maxWidth: 400,
              }}
            >
              <div
                style={{
                  height: 24,
                  width: 100,
                  backgroundColor: "var(--surface-2)",
                  borderRadius: 6,
                  marginBottom: 16,
                  animation: "shimmer 1.5s infinite",
                  backgroundImage: "linear-gradient(90deg, var(--surface-2) 0%, var(--border) 50%, var(--surface-2) 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
              <div
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: 8,
                  minHeight: 200,
                }}
              >
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      height: 80,
                      backgroundColor: "var(--surface-1)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: 8,
                      animation: "shimmer 1.5s infinite",
                      backgroundImage: "linear-gradient(90deg, var(--surface-1) 0%, var(--surface-2) 50%, var(--surface-1) 100%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div data-tour="kanban-board" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Board externalOpenModal={triggerNewTask} onExternalModalHandled={handleModalHandled} />
        </div>
      )}
    </div>
  );
}
