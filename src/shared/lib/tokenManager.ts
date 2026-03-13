/**
 * In-memory access-token manager.
 *
 * The access token is kept in a module-level variable (never in
 * localStorage / sessionStorage) to protect it from XSS.
 * The refresh token lives in an HttpOnly cookie managed by the browser;
 * this module never reads or writes it.
 */

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

let _accessToken: string | null = null;
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

/**
 * Called once on app startup. Attempts a silent token refresh using the
 * HttpOnly refresh-token cookie. If the cookie is missing or expired,
 * it silently does nothing (user stays logged out).
 */
export async function tryRestoreSession(): Promise<void> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, undefined, {
      withCredentials: true,
    });
    const d: { accessToken: string; expiresIn: number } =
      res.data?.data ?? res.data;
    setTokens(d.accessToken, d.expiresIn);
  } catch {
    // No valid refresh token — stay logged out
  }
}

/**
 * Store the new access token and schedule a proactive refresh
 * 30 seconds before it expires.
 */
export function setTokens(accessToken: string, expiresIn: number): void {
  _accessToken = accessToken;
  _scheduleRefresh(expiresIn);

  // Keep Redux auth state in sync (lazy import avoids circular deps)
  if (typeof window !== "undefined") {
    import("@/store").then(({ store }) =>
      import("@/features/auth/store/authSlice").then(({ setAuthenticated }) =>
        store.dispatch(setAuthenticated())
      )
    );
  }
}

/**
 * Remove the in-memory token and cancel any pending refresh timer.
 * Called on logout or when a refresh attempt fails.
 */
export function clearTokens(): void {
  _accessToken = null;
  if (_refreshTimer) {
    clearTimeout(_refreshTimer);
    _refreshTimer = null;
  }

  if (typeof window !== "undefined") {
    import("@/store").then(({ store }) =>
      import("@/features/auth/store/authSlice").then(({ clearAuthenticated }) =>
        store.dispatch(clearAuthenticated())
      )
    );
  }
}

// ── Internals ─────────────────────────────────────────────────────────────────

function _scheduleRefresh(expiresIn: number): void {
  if (_refreshTimer) clearTimeout(_refreshTimer);
  // Refresh 30 s before expiry; clamp to 0 to avoid negative delays
  const ms = Math.max((expiresIn - 30) * 1000, 0);
  _refreshTimer = setTimeout(_doProactiveRefresh, ms);
}

async function _doProactiveRefresh(): Promise<void> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, undefined, {
      withCredentials: true,
    });
    const d: { accessToken: string; expiresIn: number } =
      res.data?.data ?? res.data;
    setTokens(d.accessToken, d.expiresIn);
  } catch {
    // Refresh token expired or revoked — clear state; next API call will
    // return 401 and the response interceptor will redirect to login.
    clearTokens();
  }
}
