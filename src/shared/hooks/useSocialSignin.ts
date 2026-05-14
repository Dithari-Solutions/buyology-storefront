"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  googleSignin,
  facebookSignin,
  snapchatSignin,
} from "@/features/auth/services/auth.api";
import { setTokens } from "@/shared/lib/tokenManager";

// ──────────────────────────────────────────────────────────────────────────────
// Browser OAuth helpers — opens the provider's authorize URL in a popup and
// waits for the OAuth redirect back to /oauth/callback (a small page on our
// origin which window.opener.postMessage'es the code + state back, then closes).
// ──────────────────────────────────────────────────────────────────────────────

type OAuthResult = { code: string; state?: string };

function randomString(len = 64): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, len);
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  let str = "";
  new Uint8Array(digest).forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function openOAuthPopup(authUrl: string, expectedState: string): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      authUrl,
      "social-oauth",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
    if (!popup) {
      reject(new Error("Popup blocked. Please allow popups and try again."));
      return;
    }

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.source !== "social-oauth") return;
      window.removeEventListener("message", onMessage);
      try { popup.close(); } catch {}
      const { code, state, error } = e.data;
      if (error) return reject(new Error(error));
      if (!code) return reject(new Error("OAuth callback missing code"));
      if (state !== expectedState) return reject(new Error("OAuth state mismatch"));
      resolve({ code, state });
    };
    window.addEventListener("message", onMessage);

    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", onMessage);
        reject(new Error("Sign-in cancelled"));
      }
    }, 500);
  });
}

export function useSocialSignin() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";

  const finish = (res: { success: boolean; message: string; data: { accessToken: string; expiresIn: number } | null }) => {
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.expiresIn);
      router.push(`/${lang}`);
    } else {
      throw new Error(res.message || "Sign in failed");
    }
  };

  // ── Google (web-only) ─ uses Google Identity Services script, no popup. ───
  const handleGoogleSignin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("Google Client ID is not configured");

    const redirectUri = `${window.location.origin}/oauth/callback/google`;
    const state = randomString(32);
    sessionStorage.setItem("oauth_state", state);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");

    const { code } = await openOAuthPopup(url.toString(), state);
    const res = await googleSignin({ code, redirectUri });
    finish(res);
  };

  const handleFacebookSignin = async () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) throw new Error("Facebook App ID is not configured");

    const redirectUri = `${window.location.origin}/oauth/callback/facebook`;
    const state = randomString(32);
    sessionStorage.setItem("oauth_state", state);
    const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "public_profile,email");
    url.searchParams.set("state", state);

    const { code } = await openOAuthPopup(url.toString(), state);
    const res = await facebookSignin({ code, redirectUri });
    finish(res);
  };

  const handleSnapchatSignin = async () => {
    const clientId = process.env.NEXT_PUBLIC_SNAPCHAT_CLIENT_ID;
    if (!clientId) throw new Error("Snapchat Client ID is not configured");

    const redirectUri =
      process.env.NEXT_PUBLIC_SNAPCHAT_REDIRECT_URI ||
      `${window.location.origin}/oauth/callback/snapchat`;
    const state = randomString(32);
    const codeVerifier = randomString(64);
    const codeChallenge = await sha256Base64Url(codeVerifier);
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("snapchat_code_verifier", codeVerifier);

    const url = new URL("https://accounts.snapchat.com/accounts/oauth2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "https://auth.snapchat.com/oauth2/api/user.external_id https://auth.snapchat.com/oauth2/api/user.display_name");
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    const { code } = await openOAuthPopup(url.toString(), state);
    const verifier = sessionStorage.getItem("snapchat_code_verifier") || "";
    sessionStorage.removeItem("snapchat_code_verifier");
    const res = await snapchatSignin({ code, codeVerifier: verifier, redirectUri });
    finish(res);
  };

  return { handleGoogleSignin, handleFacebookSignin, handleSnapchatSignin };
}
