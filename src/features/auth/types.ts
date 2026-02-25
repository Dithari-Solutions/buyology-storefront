// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface SignUpRequest {
  email: string;
  password: string;
  repeatedPassword: string;
}

export interface OtpVerifyRequest {
  email: string;
  otpCode: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
