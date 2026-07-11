/**
 * Shared Header component used across public landing page and protected layouts.
 * Integrates logo, navigation links, theme toggle, and user profile settings menu.
 * Fully supports mobile responsive hamburger drawer layouts.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { logoutApi } from "../api";
import { SettingsModal } from "./SettingsModal";
import { useTourStore } from "@/shared/lib/tourStore";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isTourActive = useTourStore((s) => s.isActive);
  
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const closeDropdown = () => setDropdownOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [dropdownOpen]);

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark" | "system" | null) || "system";
    setTheme(saved);
    applyTheme(saved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = localStorage.getItem("theme") || "system";
      if (current === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function applyTheme(targetTheme: "light" | "dark" | "system") {
    if (targetTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", targetTheme);
    }
  }

  function handleThemeChange(nextTheme: "light" | "dark" | "system") {
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  }

  function toggleTheme() {
    let next: "light" | "dark" | "system";
    if (theme === "light") next = "dark";
    else if (theme === "dark") next = "system";
    else next = "light";

    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  async function handleLogout() {
    await logoutApi();
    clearAuth();
    router.replace("/");
  }

  const navItems = [
    { href: "/tasks", label: "Tasks" },
    { href: "/annotate", label: "Annotate" },
  ];

  return (
    <>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface-1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 64,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo + Desktop navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "var(--text-primary)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "var(--accent-subtle)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.5px" }}>TaskCanvas</span>
          </Link>

          {!isMobile && (
            <div data-tour="nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <nav style={{ display: "flex", gap: 4 }}>
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 14,
                        fontWeight: 500,
                        textDecoration: "none",
                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                        backgroundColor: isActive ? "var(--accent-subtle)" : "transparent",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              {isAuthenticated && (
                <button
                  onClick={() => useTourStore.getState().startTour()}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 13,
                    fontWeight: 500,
                    backgroundColor: isTourActive ? "var(--accent-subtle)" : "transparent",
                    color: isTourActive ? "var(--accent)" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isTourActive ? "var(--accent)" : "var(--surface-2)";
                    e.currentTarget.style.color = isTourActive ? "var(--accent-text)" : "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isTourActive ? "var(--accent-subtle)" : "transparent";
                    e.currentTarget.style.color = isTourActive ? "var(--accent)" : "var(--text-secondary)";
                  }}
                >
                  Tour
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        {isMobile ? (
          <div data-tour="auth-controls" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Theme Toggle Button - only show when signed out */}
            {!isLoading && !isAuthenticated && (
              <button
                onClick={toggleTheme}
                title={`Toggle Theme (current: ${theme})`}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                {theme === "light" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                )}
              </button>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div data-tour="auth-controls" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Theme Toggle Button - only show when signed out */}
            {!isLoading && !isAuthenticated && (
              <button
                onClick={toggleTheme}
                title={`Toggle Theme (current: ${theme})`}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  transition: "all var(--transition-fast)",
                }}
              >
                {theme === "light" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                )}
              </button>
            )}

            {isLoading ? (
              <div
                style={{
                  width: 80,
                  height: 36,
                  backgroundColor: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  animation: "headerPulse 1.5s infinite ease-in-out",
                }}
              />
            ) : isAuthenticated ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    backgroundColor: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    color: "var(--text-primary)",
                    height: 36,
                  }}
                >
                  {/* User Avatar */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${user.avatar}`}
                        alt="User Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {user?.display_name ? user.display_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Display Name */}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {user?.display_name || user?.email}
                  </span>

                  {/* Down Arrow Chevron */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="animate-slide-up"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      marginTop: 8,
                      width: 220,
                      backgroundColor: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "var(--shadow-md)",
                      padding: "6px 0",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* User info summary */}
                    <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>Logged in as</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                        {user?.display_name || "User"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.email}
                      </div>
                    </div>

                    {/* Settings option */}
                    <button
                      onClick={() => {
                        setSettingsOpen(true);
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 500,
                        backgroundColor: "transparent",
                        border: "none",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-2)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Account Settings
                    </button>

                    {/* Sign out option */}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 500,
                        backgroundColor: "transparent",
                        border: "none",
                        color: "var(--danger)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-2)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: "8px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-text)",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  transition: "background-color var(--transition-fast)",
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {isMobile && mobileMenuOpen && (
        <div
          className="animate-slide-down"
          style={{
            backgroundColor: "var(--surface-1)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "absolute",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 49,
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 8, borderBottom: isAuthenticated ? "1px solid var(--border)" : "none", paddingBottom: isAuthenticated ? 12 : 0 }}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    backgroundColor: isActive ? "var(--accent-subtle)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  useTourStore.getState().startTour();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: isTourActive ? "var(--accent-subtle)" : "transparent",
                  color: isTourActive ? "var(--accent)" : "var(--text-secondary)",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Quick Tour Guide
              </button>
            )}
          </nav>

          {isLoading ? (
            <div
              style={{
                height: 48,
                backgroundColor: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                animation: "headerPulse 1.5s infinite ease-in-out",
              }}
            />
          ) : isAuthenticated ? (
            <>
              {/* User details */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${user.avatar}`}
                      alt="User Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                      {user?.display_name ? user.display_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {user?.display_name || "User"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Account Settings option */}
              <button
                onClick={() => {
                  setSettingsOpen(true);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Account Settings
              </button>

              {/* Sign out option */}
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: "transparent",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  textAlign: "left",
                  borderTop: "1px solid var(--border)",
                  paddingTop: 12,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: "var(--accent)",
                color: "var(--accent-text)",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      <style>{`
        @keyframes headerPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
