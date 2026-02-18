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
    // Get token from localStorage (or cookies)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Global 401 handler
    if (status === 401) {
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

    return Promise.reject(new Error(message));
  }
);
