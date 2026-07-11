/**
 * DateSelector — Notion-style range filter with presets, day arrows, and custom picker.
 * Renders inline on a single row alongside the "New Task" button.
 */

"use client";

import React, { useState, useRef } from "react";
import type { FilterPreset } from "../store/taskStore";

interface DateSelectorProps {
  value: string;
  activePreset: FilterPreset;
  onPresetChange: (preset: FilterPreset, customDate?: string) => void;
  onShift: (date: string) => void;
}

/** Format a Date to local YYYY-MM-DD without UTC conversion. */
function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const PRESETS: { id: FilterPreset; label: string }[] = [
  { id: "all", label: "All" },
  { id: "from_today", label: "From Today" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This Week" },
  { id: "last_week", label: "Last Week" },
  { id: "next_week", label: "Next Week" },
];

export const DateSelector = React.memo(function DateSelector({
  value,
  activePreset,
  onPresetChange,
  onShift,
}: DateSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  function shiftDate(days: number) {
    const d = new Date(value + "T00:00:00");
    d.setDate(d.getDate() + days);
    onShift(toLocalDateString(d));
  }

  function formatDisplay(): string {
    const preset = PRESETS.find((p) => p.id === activePreset);
    if (preset) return preset.label;
    if (activePreset === "custom") {
      const d = new Date(value + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    return "Today";
  }

  const arrowBtnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--surface-1)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    color: "var(--text-secondary)",
    transition: "all var(--transition-fast)",
    flexShrink: 0,
  };

  const isRangeMode = ["all", "from_today", "this_week", "next_week", "last_week"].includes(activePreset);

  return (
    <div data-tour="date-selector" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {/* Day navigation arrows (only for single-day modes) */}
      {!isRangeMode && (
        <button type="button" onClick={() => shiftDate(-1)} title="Previous day" style={arrowBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Preset dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: "var(--surface-1)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            minWidth: 110,
            textAlign: "center",
            transition: "all var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>{formatDisplay()}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.5 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 50,
              minWidth: 180,
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              padding: "6px 0",
              animation: "scaleIn 0.15s ease",
            }}
          >
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onPresetChange(preset.id);
                  setDropdownOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: activePreset === preset.id ? 600 : 400,
                  color: activePreset === preset.id ? "var(--accent)" : "var(--text-primary)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {activePreset === preset.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 8, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                <span style={{ marginLeft: activePreset === preset.id ? 0 : 22 }}>{preset.label}</span>
              </button>
            ))}

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

            {/* Custom date option */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                // Small delay to allow dropdown to close before picker opens
                setTimeout(() => dateInputRef.current?.showPicker?.(), 100);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: activePreset === "custom" ? 600 : 400,
                color: activePreset === "custom" ? "var(--accent)" : "var(--text-primary)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                gap: 8,
                transition: "background-color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {activePreset === "custom" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
              <span>Custom Date…</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden native date input */}
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={(e) => {
          if (e.target.value) {
            onPresetChange("custom", e.target.value);
          }
        }}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        tabIndex={-1}
      />

      {/* Day navigation arrows (only for single-day modes) */}
      {!isRangeMode && (
        <button type="button" onClick={() => shiftDate(1)} title="Next day" style={arrowBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
});
