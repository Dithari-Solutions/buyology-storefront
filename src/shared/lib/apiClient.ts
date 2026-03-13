// src/shared/lib/apiClient.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setTokens, clearTokens } from "@/shared/lib/tokenManager";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in your .env.local"
  );
}

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true globally so the browser sends the HttpOnly
  // refresh-token cookie to /auth/refresh and stores the Set-Cookie on signin.
  withCredentials: true,
});


// ==============================
// REQUEST INTERCEPTOR
// ==============================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint = config.url?.startsWith("/auth");

    // Attach the in-memory access token for non-auth endpoints.
    // Auth endpoints (/auth/signin, /auth/refresh, etc.) don't need it.
    if (!isAuthEndpoint) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ==============================
// RESPONSE INTERCEPTOR
// ==============================

// Extend AxiosRequestConfig to carry a retry flag so we never loop.
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableConfig | undefined;
    const isAuthEndpoint = originalRequest?.url?.startsWith("/auth");

    // ── 401 on a protected endpoint: try refreshing once ─────────────────────
    if (status === 401 && !isAuthEndpoint && !originalRequest?._retry) {
      if (originalRequest) originalRequest._retry = true;

      try {
        // Call refresh directly with axios (not apiClient) to avoid recursion.
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh`,
          undefined,
          { withCredentials: true }
        );
        const d: { accessToken: string; expiresIn: number } =
          refreshRes.data?.data ?? refreshRes.data;

        setTokens(d.accessToken, d.expiresIn);

        // Retry the original request with the new token.
        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${d.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh token is expired/revoked — log out and redirect to sign-in.
        clearTokens();

        if (typeof window !== "undefined") {
          const lang = window.location.pathname.split("/")[1] || "en";
          window.location.href = `/${lang}/auth`;
        }
      }
    }

    // Normalize error message
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    const err = new Error(message) as Error & { status?: number };
    err.status = status;
    return Promise.reject(err);
  }
);
