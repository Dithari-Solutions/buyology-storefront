"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { setTokens } from "@/shared/lib/tokenManager";
import { b2bSetupApi, type SetupTokenInfo } from "./setupApi";

type Phase = "validating" | "form" | "submitting" | "success" | "expired" | "invalid" | "error";

export default function B2BSetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (Array.isArray(params?.lang) ? params.lang[0] : params?.lang) || "en";
  const token = searchParams.get("token") ?? "";

  const [phase, setPhase] = useState<Phase>("validating");
  const [info, setInfo] = useState<SetupTokenInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setPhase("invalid");
      setErrorMsg("No setup token in the URL.");
      return;
    }
    let cancelled = false;
    b2bSetupApi
      .validateToken(token)
      .then((data) => {
        if (cancelled) return;
        setInfo(data);
        setPhase("form");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        const message =
          (axios.isAxiosError(err) && (err.response?.data as { message?: string })?.message) ||
          "Could not validate this setup link.";
        if (status === 410) setPhase("expired");
        else if (status === 404) setPhase("invalid");
        else setPhase("error");
        setErrorMsg(message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const validatePassword = (): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const v = validatePassword();
    if (v) {
      setFormError(v);
      return;
    }
    setPhase("submitting");
    try {
      const result = await b2bSetupApi.setPassword({
        token,
        password,
        confirmedPassword: confirm,
      });
      setTokens(result.accessToken, result.expiresIn);
      setPhase("success");
      setTimeout(() => router.push(`/${lang}/b2b/account`), 1200);
    } catch (err: unknown) {
      const message =
        (axios.isAxiosError(err) && (err.response?.data as { message?: string })?.message) ||
        "Could not set password. Please try again.";
      setFormError(message);
      setPhase("form");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Set your password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to Buyology B2B Premium. Choose a password to access your account.
        </p>

        {phase === "validating" && (
          <p className="mt-8 text-center text-sm text-gray-500">Validating link…</p>
        )}

        {(phase === "expired" || phase === "invalid" || phase === "error") && (
          <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {phase === "expired"
              ? "This setup link has expired. Please contact support."
              : phase === "invalid"
              ? "This setup link is invalid or has already been used."
              : errorMsg}
          </div>
        )}

        {phase === "success" && (
          <div className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            Password set. Signing you in…
          </div>
        )}

        {(phase === "form" || phase === "submitting") && (
          <>
            {info && (
              <div className="mt-6 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Account:</span> {info.memberEmail}
                </div>
                <div>
                  <span className="font-medium">Company:</span> {info.companyName}
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={phase === "submitting"}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={phase === "submitting"}
                />
              </label>

              <ul className="space-y-1 text-xs text-gray-500">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One number</li>
              </ul>

              {formError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={phase === "submitting"}
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {phase === "submitting" ? "Setting password…" : "Set password and sign in"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
