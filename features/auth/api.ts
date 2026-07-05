/**
 * Auth API functions — all return ApiResult<T>.
 */

import { api, setAccessToken } from "@/shared/lib/api-client";
import type { ApiResult, User } from "@/shared/lib/types";

interface LoginResponse {
  access: string;
  user: User;
}

interface RefreshResponse {
  access: string;
}

export async function loginApi(
  email: string,
  password: string
): Promise<ApiResult<LoginResponse>> {
  return api.post<LoginResponse>("/api/auth/login/", { email, password });
}

export async function refreshApi(): Promise<ApiResult<RefreshResponse>> {
  return api.post<RefreshResponse>("/api/auth/refresh/");
}

export async function logoutApi(): Promise<ApiResult<null>> {
  const result = await api.post<null>("/api/auth/logout/");
  setAccessToken(null);
  return result;
}

export async function getMeApi(): Promise<ApiResult<User>> {
  return api.get<User>("/api/auth/me/");
}

export async function updateProfileApi(formData: FormData): Promise<ApiResult<User>> {
  return api.patch<User>("/api/auth/me/", formData);
}

export async function changePasswordApi(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResult<null>> {
  return api.post<null>("/api/auth/password/", {
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
}

export async function registerApi(
  email: string,
  password: string,
  displayName?: string
): Promise<ApiResult<LoginResponse>> {
  return api.post<LoginResponse>("/api/auth/register/", {
    email,
    password,
    display_name: displayName,
  });
}
