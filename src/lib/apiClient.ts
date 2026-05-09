/**
 * Centralized HTTP client — all pages call these helpers, never raw fetch.
 * Base URL is injected from VITE_API_URL at build time; no hardcoded URLs anywhere.
 */

import { cognitoService } from "@/services/cognitoService";

const BASE = import.meta.env.VITE_API_URL as string;

if (!BASE) console.warn("[apiClient] VITE_API_URL is not set — API calls will fail");

async function getHeaders(): Promise<HeadersInit> {
  const token = await cognitoService.getAccessToken();
  
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE}${path}`;
  console.info("[apiClient] %s %s | body=%o", method, url, body ?? null);

  const headers = await getHeaders();
  
  const res = await fetch(url, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  // Handle 401 - token expired, redirect to login
  if (res.status === 401) {
    cognitoService.logout();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  const data = await res.json();
  console.info("[apiClient] %s %s | status=%d response=%o", method, url, res.status, data);

  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const apiClient = {
  get:    <T>(path: string)                  => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown)   => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown)   => request<T>("PUT",    path, body),
  del:    <T>(path: string)                  => request<T>("DELETE", path),
};
