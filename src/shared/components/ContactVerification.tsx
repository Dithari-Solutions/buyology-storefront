"use client";

import { useState } from "react";
import {
  verificationApi,
  verificationErrorMessage,
} from "@/shared/services/verification.api";

interface Props {
  channel: "email" | "phone";
  /** The email address or E.164 phone number to verify. */
  value: string;
  verified: boolean;
  onVerified: () => void;
  /** Disable sending when the value is empty/invalid. */
  disabled?: boolean;
  /** Accent color for the action buttons (matches the host form). */
  accent?: string;
}

/**
 * Reusable "send code → enter code → verified" widget.
 * Email codes are delivered via SendGrid, phone codes via Twilio Verify.
 */
export default function ContactVerification({
  channel,
  value,
  verified,
  onVerified,
  disabled,
  accent = "#402F75",
}: Props) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const label = channel === "email" ? "email" : "phone number";

  async function handleSend() {
    setError("");
    setSending(true);
    try {
      if (channel === "email") await verificationApi.startEmail(value);
      else await verificationApi.startPhone(value);
      setSent(true);
    } catch (e) {
      setError(verificationErrorMessage(e, `Failed to send code to your ${label}. Please try again.`));
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    if (!code.trim()) {
      setError("Enter the verification code.");
      return;
    }
    setError("");
    setChecking(true);
    try {
      if (channel === "email") await verificationApi.checkEmail(value, code.trim());
      else await verificationApi.checkPhone(value, code.trim());
      onVerified();
    } catch (e) {
      setError(verificationErrorMessage(e, "Invalid or expired code."));
    } finally {
      setChecking(false);
    }
  }

  if (verified) {
    return (
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-green-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {channel === "email" ? "Email verified" : "Phone verified"}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {!sent ? (
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || sending || !value.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          {sending ? "Sending…" : `Verify ${label}`}
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
            placeholder="Enter code"
            inputMode="numeric"
            className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] tracking-widest outline-none focus:border-[#402F75]"
          />
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: accent }}
          >
            {checking ? "Checking…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="text-[12px] font-medium text-gray-500 underline disabled:opacity-40"
          >
            {sending ? "Sending…" : "Resend"}
          </button>
        </div>
      )}
      {sent && !error && (
        <p className="text-[11px] text-gray-500">
          We sent a code to <span className="font-medium">{value}</span>.
        </p>
      )}
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
