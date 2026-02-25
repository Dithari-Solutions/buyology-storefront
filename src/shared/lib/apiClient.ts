// src/shared/lib/apiClient.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in your .env.local"
  );
}

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});


// ==============================
// REQUEST INTERCEPTOR
// ==============================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint = config.url?.startsWith("/auth");

    if (isAuthEndpoint) {
      config.withCredentials = false;
    } else {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;

    // Global 401 handler — skip auth endpoints (wrong credentials / wrong OTP are handled locally)
    const isAuthEndpoint = error.config?.url?.startsWith("/auth");
    if (status === 401 && !isAuthEndpoint) {
      console.warn("Unauthorized. Redirecting to login...");

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
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
