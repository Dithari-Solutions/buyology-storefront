import { apiClient } from "@/shared/lib/apiClient";
import type {
  ApiResponse,
  OtpVerifyRequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
} from "@/features/auth/types";

type HttpError = Error & { status?: number };

// Normalize backend responses that use { statusCode, message, data }
// instead of our expected { success, message, data } shape.
function normalizeResponse<T>(data: any): ApiResponse<T> {
  if ("success" in data) return data as ApiResponse<T>;
  const statusCode: number = data.statusCode ?? 200;
  return {
    success: statusCode < 400,
    message: data.message ?? "",
    data: data.data ?? null,
  };
}

function errorResponse<T>(error: unknown): ApiResponse<T> {
  const err = error as HttpError;
  const message = err.message || "Something went wrong";
  const status = err.status;

  switch (status) {
    case 400: return { success: false, message, data: null };
    case 401: return { success: false, message, data: null };
    case 409: return { success: false, message, data: null };
    case 410: return { success: false, message, data: null };
    case 429: return { success: false, message, data: null };
    case 503: return { success: false, message, data: null };
    default: return { success: false, message: message || "Unexpected error. Please try again.", data: null };
  }
}

// ── Sign Up — validates and sends OTP to the provided email ───────────────────
// 400 bad request | 409 email already exists | 429 rate limited | 503 email unavailable

export async function signup(payload: SignUpRequest): Promise<ApiResponse<string>> {
  try {
    const { data } = await apiClient.post<any>("/auth/signup", payload);
    return normalizeResponse<string>(data);
  } catch (error) {
    return errorResponse<string>(error);
  }
}

// ── Verify OTP — creates the account and returns JWT tokens ───────────────────
// 400 bad request | 401 wrong OTP | 410 OTP expired | 429 too many attempts

export async function verifyOtp(payload: OtpVerifyRequest): Promise<ApiResponse<SignInResponse>> {
  try {
    const { data } = await apiClient.post<any>("/auth/verify-otp", payload);
    return normalizeResponse<SignInResponse>(data);
  } catch (error) {
    return errorResponse<SignInResponse>(error);
  }
}

// ── Sign In ───────────────────────────────────────────────────────────────────
// 400 bad request | 401 invalid credentials

export async function signin(payload: SignInRequest): Promise<ApiResponse<SignInResponse>> {
  try {
    const { data } = await apiClient.post<any>("/auth/signin", payload);
    return normalizeResponse<SignInResponse>(data);
  } catch (error) {
    return errorResponse<SignInResponse>(error);
  }
}