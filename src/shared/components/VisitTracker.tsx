"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * First-party page-view beacon.
 *
 * Feeds the "Unique Visitors" / "Total Visits" metric on the admin dashboard home page. Separate
 * from the GA4 tag in `Analytics.tsx` on purpose: GA4 numbers need a service account and the Data
 * API to read back, are sampled, and lag — the dashboard needs a figure it can show next to orders
 * and revenue right now, out of our own database.
 *
 * Two ids are sent, because the dashboard shows two different counts:
 *   - `visitorId` in localStorage — survives across sessions, so it counts *unique* visitors.
 *   - `sessionId` in sessionStorage — new per tab/visit, so it counts *visits* (the "general" count).
 *
 * Only the pathname is sent, never the query string: search params carry password-reset tokens,
 * emails and payment references. The referrer is sent only when it is off-site, so the backend
 * records where traffic came from without logging internal navigation.
 *
 * Fire-and-forget by design — every failure is swallowed. A visitor counter must never surface an
 * error to a shopper or delay a page.
 */

// Trailing slash stripped: axios normalises this for the other call sites, but a raw fetch would
// build a "//api/analytics/visit" that Spring's path matcher misses, silently killing the counter.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

const VISITOR_KEY = "bx_visitor_id";
const SESSION_KEY = "bx_session_id";

/** Matches the backend's id validation: 8-64 URL-safe characters. */
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "");
    }
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Ids for browsers that deny storage entirely. Held in module scope so such a visitor keeps one
 * identity for the life of the page instead of minting a fresh one on every navigation, which would
 * report each page view as a brand-new unique visitor and inflate both headline numbers.
 */
const inMemoryIds: Record<string, string> = {};

/**
 * Reads an id from the given store, minting and persisting one if absent.
 *
 * Storage access throws outright in some privacy modes, so a failure falls back to the in-memory id:
 * the page view is still counted, it just cannot be tied to the visitor's earlier sessions.
 */
function readOrCreateId(store: "localStorage" | "sessionStorage", key: string): string {
  try {
    const bucket = window[store];
    const existing = bucket.getItem(key);
    if (existing && ID_PATTERN.test(existing)) return existing;
    const created = newId();
    bucket.setItem(key, created);
    return created;
  } catch {
    return (inMemoryIds[key] ??= newId());
  }
}

/** Off-site referrer only — internal navigation is not a traffic source. */
function externalReferrer(): string | undefined {
  try {
    const raw = document.referrer;
    if (!raw) return undefined;
    return new URL(raw).host === window.location.host ? undefined : raw;
  } catch {
    return undefined;
  }
}

export default function VisitTracker() {
  const pathname = usePathname();

  /**
   * Last path sent, with its timestamp. React's development Strict Mode mounts effects twice and a
   * re-render can repeat the same pathname; without this the same view would be counted twice.
   */
  const lastSent = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!API_BASE || !pathname) return;

    const previous = lastSent.current;
    if (previous && previous.path === pathname && Date.now() - previous.at < 1000) return;
    lastSent.current = { path: pathname, at: Date.now() };

    const body = JSON.stringify({
      visitorId: readOrCreateId("localStorage", VISITOR_KEY),
      sessionId: readOrCreateId("sessionStorage", SESSION_KEY),
      path: pathname,
      referrer: externalReferrer(),
      language: document.documentElement.lang || undefined,
    });

    // keepalive so the beacon survives the shopper navigating away immediately; credentials are
    // omitted because the endpoint is anonymous and has no use for the session cookie.
    fetch(`${API_BASE}/api/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  }, [pathname]);

  return null;
}
