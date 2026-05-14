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

function isRetryable(status: number): boolean {
  return status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE}${path}`;
  console.info("[apiClient] %s %s | body=%o", method, url, body ?? null);

  const maxRetries = method === "GET" ? 2 : 0;
  const backoff = [1000, 2000];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
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

      // Retry on 5xx for GET requests
      if (isRetryable(res.status) && attempt < maxRetries) {
        console.warn("[apiClient] %s %s | status=%d, retrying in %dms", method, url, res.status, backoff[attempt]);
        await sleep(backoff[attempt]);
        continue;
      }

      const json = await res.json();
      console.info("[apiClient] %s %s | status=%d response=%o", method, url, res.status, json);

      if (!res.ok) throw new Error(json?.error?.message ?? json?.error ?? `HTTP ${res.status}`);
      return (json.data !== undefined ? json.data : json) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry non-network errors (like 401 redirect)
      if (lastError.message === 'Session expired. Please login again.') throw lastError;

      // Retry on network errors for GET requests
      if (attempt < maxRetries) {
        console.warn("[apiClient] %s %s | network error, retrying in %dms", method, url, backoff[attempt]);
        await sleep(backoff[attempt]);
        continue;
      }
    }
  }

  throw lastError ?? new Error(`Request failed: ${method} ${path}`);
}

export const apiClient = {
  get:    <T>(path: string)                  => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown)   => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown)   => request<T>("PUT",    path, body),
  del:    <T>(path: string)                  => request<T>("DELETE", path),
};
