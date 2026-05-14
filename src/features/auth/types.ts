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

export interface AppleSigninRequest {
  code: string;
  firstName?: string;
  lastName?: string;
}

export interface GoogleSigninRequest {
  code?: string;
  redirectUri?: string;
  idToken?: string;
}

export interface FacebookSigninRequest {
  code?: string;
  redirectUri?: string;
  accessToken?: string;
}

export interface SnapchatSigninRequest {
  code: string;
  codeVerifier: string;
  redirectUri?: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface SignInResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
