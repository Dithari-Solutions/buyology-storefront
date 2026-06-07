import { apiClient } from "@/shared/lib/apiClient";

/**
 * Contact verification (email via SendGrid, phone via Twilio Verify).
 * Backend: public endpoints under /api/verify/*.
 *
 * Flow: call `start*` to receive a code, then `check*` with the code.
 * A successful check marks the contact verified for a short window; the
 * supplier / B2B submit endpoints then require both contacts verified.
 */
export const verificationApi = {
  startEmail: (email: string) =>
    apiClient.post("/api/verify/email/start", { email }),

  checkEmail: (email: string, code: string) =>
    apiClient.post("/api/verify/email/check", { email, code }),

  startPhone: (phoneNumber: string) =>
    apiClient.post("/api/verify/phone/start", { phoneNumber }),

  checkPhone: (phoneNumber: string, code: string) =>
    apiClient.post("/api/verify/phone/check", { phoneNumber, code }),
};

/** Extracts a human-readable message from an axios error, with a fallback. */
export function verificationErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    fallback
  );
}
