/**
 * The ONE place the client talks to a backend. Every data call in the app goes
 * through `apiReq`. Today it is backed by the in-browser mock in src/data/*;
 * the moment `NEXT_PUBLIC_API_URL` is set to the live Express server, the same
 * calls hit the network instead — no component changes required.
 */

import type { ApiResult } from "@/lib/types";
import { mockApi } from "@/data/mockDb";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

/**
 * Use the mock backend whenever there's no real API URL configured. This is the
 * single switch to flip when the Express server ships.
 * TODO(server): remove the mock branch once the API is stable.
 */
const USE_MOCK = !API_URL || process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const TOKEN_KEY = "fundspring.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Extra headers merged onto the defaults. */
  headers?: Record<string, string>;
  /** Skip the automatic auth-redirect (used by the auth bootstrap itself). */
  noRedirect?: boolean;
}

function redirect(path: string): void {
  if (typeof window !== "undefined") window.location.href = path;
}

export async function apiReq<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<ApiResult<T>> {
  const method = options.method || "GET";

  // ---- Mock branch ------------------------------------------------------
  if (USE_MOCK) {
    // Small artificial latency keeps loading states honest during the demo.
    await new Promise((r) => setTimeout(r, 120));
    const { data, error, status } = mockApi(path, { method, body: options.body });
    if (status === 401 && !options.noRedirect) redirect("/login");
    if (status === 403 && !options.noRedirect) redirect("/unauthorized");
    return { data: data as T, error, status };
  }

  // ---- Real network branch ---------------------------------------------
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401 && !options.noRedirect) {
      redirect("/login");
      return { error: "Unauthorized", status: 401 };
    }
    if (res.status === 403 && !options.noRedirect) {
      redirect("/unauthorized");
      return { error: "Forbidden", status: 403 };
    }

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: (payload as { message?: string })?.message || `Request failed (${res.status})`,
        status: res.status,
      };
    }
    // Express is expected to return either the raw object or { data }.
    const data = (payload as { data?: T })?.data ?? (payload as T);
    return { data, status: res.status };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}
