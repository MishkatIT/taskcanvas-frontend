"use client";

import React, { useEffect, useState } from "react";
import { useToastStore, type Toast, type ToastType } from "@/shared/lib/toastStore";

interface StyledToastTheme {
  color: string;
  icon: string;
}

function getToastStyles(type: ToastType): StyledToastTheme {
  switch (type) {
    case "success":
      return {
        color: "#10b981",
        icon: "✓",
      };
    case "error":
      return {
        color: "#ef4444",
        icon: "✕",
      };
    case "warning":
      return {
        color: "#f59e0b",
        icon: "⚠",
      };
    case "info":
    default:
      return {
        color: "#3b82f6",
        icon: "ℹ",
      };
  }
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const theme = getToastStyles(toast.type);

  useEffect(() => {
    // Entry animation
    const enterTimer = requestAnimationFrame(() => {
      setIsEntering(false);
    });

    // Exit animation before auto-removal
    const duration = toast.duration || 3500;
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.duration]);

  function handleDismiss() {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        backgroundColor: "rgba(20, 20, 25, 0.92)",
        border: `1px solid ${theme.color}40`,
        borderRadius: 10,
        color: "#f3f4f6",
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(12px)",
        minWidth: 280,
        maxWidth: 400,
        pointerEvents: "auto",
        transform: isEntering
          ? "translateX(120%)"
          : isExiting
          ? "translateX(120%)"
          : "translateX(0)",
        opacity: isEntering ? 0 : isExiting ? 0 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: `${theme.color}15`,
          color: theme.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {theme.icon}
      </div>

      {/* Message */}
      <span style={{ flex: 1, lineHeight: 1.4, color: "#e5e7eb" }}>{toast.message}</span>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "none",
          color: "rgba(255, 255, 255, 0.5)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 6px",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s ease",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
