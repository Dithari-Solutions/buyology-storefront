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
const SESSION_HINT_KEY = "hasRefreshSession";

let _accessToken: string | null = null;
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

function _hasSessionHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function _setSessionHint(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(SESSION_HINT_KEY, "1");
    else window.localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Called once on app startup. Attempts a silent token refresh using the
 * HttpOnly refresh-token cookie — but only if a "hasRefreshSession" hint
 * exists in localStorage (set on previous signin). Without the hint we
 * skip the call entirely, which avoids the spurious 401 console error and
 * a wasted network round-trip on logged-out page loads.
 */
export async function tryRestoreSession(): Promise<void> {
  if (typeof window !== "undefined" && !_hasSessionHint()) {
    // No prior signin recorded — stay logged out without hitting the API.
    import("@/store").then(({ store }) =>
      import("@/features/auth/store/authSlice").then(({ setAuthRestored }) => {
        store.dispatch(setAuthRestored());
      })
    );
    return;
  }
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, undefined, {
      withCredentials: true,
      // Treat anything <500 as a non-throw so 401 doesn't pollute the console.
      validateStatus: (s) => s >= 200 && s < 500,
    });
    if (res.status >= 200 && res.status < 300) {
      const d: { accessToken: string; expiresIn: number } =
        res.data?.data ?? res.data;
      setTokens(d.accessToken, d.expiresIn);
      return;
    }
    // Hint is stale (cookie expired/revoked) — clear it so we won't try again.
    _setSessionHint(false);
    if (typeof window !== "undefined") {
      import("@/store").then(({ store }) =>
        import("@/features/auth/store/authSlice").then(({ setAuthRestored }) => {
          store.dispatch(setAuthRestored());
        })
      );
    }
  } catch {
    if (typeof window !== "undefined") {
      import("@/store").then(({ store }) =>
        import("@/features/auth/store/authSlice").then(({ setAuthRestored }) => {
          store.dispatch(setAuthRestored());
        })
      );
    }
  }
}

/**
 * Store the new access token and schedule a proactive refresh
 * 30 seconds before it expires.
 */
function _extractUserIdFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Backend mints JWTs with `sub` = auth_credentials.id and `uid` = users.id.
    // The authenticated PRINCIPAL on the backend is users.id (uid), and every
    // user-scoped endpoint (/api/users/{userId}/** — addresses, profile, cart,
    // country-preference, etc.) checks ownership against that principal via
    // requireSelf(). So Redux's `userId` MUST be `uid`; using `sub` here makes
    // requireSelf compare auth_credentials.id against users.id → 403.
    return payload.uid ?? payload.sub ?? payload.userId ?? payload.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Extracts the `uid` claim (users.id) from the current access token.
 * Use only for endpoints that key by users.id rather than auth_credentials.id —
 * specifically {@code /api/membership/card?userId=…}.
 */
export function getUidFromAccessToken(): string | null {
  if (!_accessToken) return null;
  try {
    const payload = JSON.parse(atob(_accessToken.split(".")[1]));
    return (payload.uid as string | undefined) ?? null;
  } catch {
    return null;
  }
}

/**
 * Extracts the `sub` claim (auth_credentials.id) from the current access token.
 * Use for endpoints whose path key is the auth-credential id rather than the
 * users.id principal — specifically /api/cart/{id}/** and /api/favorites/{id}/**.
 * Redux's `userId` holds `uid` (users.id) and MUST NOT be used for those paths.
 */
export function getCredentialIdFromAccessToken(): string | null {
  if (!_accessToken) return null;
  try {
    const payload = JSON.parse(atob(_accessToken.split(".")[1]));
    return (payload.sub as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, expiresIn: number): void {
  _accessToken = accessToken;
  _scheduleRefresh(expiresIn);
  _setSessionHint(true);

  const userId = _extractUserIdFromJwt(accessToken);

  // Keep Redux auth state in sync (lazy import avoids circular deps)
  if (typeof window !== "undefined") {
    import("@/store").then(({ store }) =>
      import("@/features/auth/store/authSlice").then(({ setAuthenticated, setUserId }) => {
        store.dispatch(setAuthenticated());
        if (userId) store.dispatch(setUserId(userId));
      })
    );
  }
}

/**
 * Remove the in-memory token and cancel any pending refresh timer.
 * Called on logout or when a refresh attempt fails.
 */
export function clearTokens(): void {
  _accessToken = null;
  _setSessionHint(false);
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
