"use client";

import { useEffect } from "react";

/**
 * Receives the provider OAuth redirect inside the popup, forwards
 * { code, state } to the opener via postMessage, then closes itself.
 * Same path is reused for google / facebook / snapchat — the route
 * `/oauth/callback/[provider]` keeps the redirect URIs distinct so each
 * provider's allowlist can be configured separately.
 */
export default function SocialOAuthCallback() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") ?? undefined;
    const state = params.get("state") ?? undefined;
    const error = params.get("error") ?? params.get("error_description") ?? undefined;

    const payload = { source: "social-oauth", code, state, error };
    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
    }
    window.close();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      Completing sign-in… you can close this window.
    </div>
  );
}
