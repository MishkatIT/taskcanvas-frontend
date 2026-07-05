/**
 * Auth Zustand store — access token lives in memory only.
 * Section 2a: token never persisted to localStorage.
 */

import { create } from "zustand";
import type { User } from "@/shared/lib/types";
import { setAccessToken, getAccessToken } from "@/shared/lib/api-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  updateUser: (user: User) => {
    set({ user });
  },
}));
