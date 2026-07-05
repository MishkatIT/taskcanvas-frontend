/**
 * SettingsModal — modern, premium tabbed settings layout.
 * Includes:
 * 1. Profile Tab: display name, email (readonly), avatar upload with preview/delete.
 * 2. Security Tab: old password, new password, confirm password.
 * 3. Preferences Tab: Theme selection (System, Light, Dark) card.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { updateProfileApi, changePasswordApi } from "../api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

type Tab = "profile" | "security" | "preferences";

export function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}: SettingsModalProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      if (user.avatar) {
        setAvatarPreview(user.avatar.startsWith("http") ? user.avatar : `${apiBase}${user.avatar}`);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [user, isOpen, apiBase]);

  if (!isOpen) return null;

  function clearMessages() {
    setSuccessMsg("");
    setErrorMsg("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please select an image file.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsDeletingAvatar(false);
      clearMessages();
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("display_name", displayName);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    } else if (isDeletingAvatar) {
      // Send empty string or null depending on what backend expects for clearing
      formData.append("avatar", "");
    }

    const result = await updateProfileApi(formData);
    setIsSubmitting(false);

    if (result.ok) {
      updateUser(result.data);
      setSuccessMsg("Profile updated successfully!");
      setAvatarFile(null);
    } else {
      setErrorMsg(result.error.detail);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await changePasswordApi(oldPassword, newPassword, confirmPassword);
    setIsSubmitting(false);

    if (result.ok) {
      setSuccessMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setErrorMsg(result.error.detail || "Incorrect current password.");
    }
  }

  function handleRemoveAvatar(e: React.MouseEvent) {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsDeletingAvatar(true);
    clearMessages();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    backgroundColor: "var(--surface-2)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: 6,
  };

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: "transparent",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
    color: activeTab === tab ? "var(--accent)" : "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  });

  return (
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
      onClick={onClose}
    >
      <div
        className="animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 540,
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
            Account Settings
          </h2>
        </div>

        {/* Tabs navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            padding: "0 24px",
            marginTop: 12,
          }}
        >
          <button onClick={() => { setActiveTab("profile"); clearMessages(); }} style={tabStyle("profile")}>
            Profile
          </button>
          <button onClick={() => { setActiveTab("security"); clearMessages(); }} style={tabStyle("security")}>
            Security
          </button>
          <button onClick={() => { setActiveTab("preferences"); clearMessages(); }} style={tabStyle("preferences")}>
            Preferences
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: 24, minHeight: 320 }}>
          {successMsg && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--success-subtle)",
                color: "var(--success)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--danger-subtle)",
                color: "var(--danger)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                {/* Avatar Preview & Upload */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "var(--surface-2)",
                      border: "2px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 28, color: "var(--text-secondary)", fontWeight: 600 }}>
                        {displayName ? displayName.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Remove overlay */}
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      title="Remove image"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "var(--danger)",
                        color: "#fff",
                        border: "2px solid var(--surface-1)",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      backgroundColor: "var(--surface-2)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                    }}
                  >
                    Change Picture
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6, opacity: 0.6 }}>
                    JPG, PNG, WebP. Max 5MB.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email Address</label>
                <input value={user?.email || ""} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="display-name" style={labelStyle}>Display Name</label>
                <input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: "var(--accent)",
                    color: "var(--accent-text)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="old-pass" style={labelStyle}>Current Password</label>
                <input
                  id="old-pass"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="new-pass" style={labelStyle}>New Password</label>
                <input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="confirm-pass" style={labelStyle}>Confirm New Password</label>
                <input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: "var(--accent)",
                    color: "var(--accent-text)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
                Choose your visual appearance for TaskCanvas.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  {
                    id: "system" as const,
                    name: "System",
                    desc: "Syncs with device",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    ),
                  },
                  {
                    id: "light" as const,
                    name: "Light Mode",
                    desc: "Classic light look",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                      </svg>
                    ),
                  },
                  {
                    id: "dark" as const,
                    name: "Dark Mode",
                    desc: "Easy on the eyes",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    ),
                  },
                ].map((t) => {
                  const isSel = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onThemeChange(t.id)}
                      style={{
                        padding: 16,
                        backgroundColor: isSel ? "var(--accent-subtle)" : "var(--surface-2)",
                        border: isSel ? "2px solid var(--accent)" : "2px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        textAlign: "center",
                        color: isSel ? "var(--accent)" : "var(--text-primary)",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {t.icon}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
