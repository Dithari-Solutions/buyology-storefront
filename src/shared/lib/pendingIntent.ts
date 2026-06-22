import type { BuyNowItem } from "@/features/buyNow/store/buyNowSlice";
import type { AddToCartPayload, CartItemMeta } from "@/features/cart/types";

/**
 * A guarded shopping action (add-to-cart / buy-now) that a *guest* attempted.
 * We stash it before routing them through sign-in / sign-up, then replay it
 * once they're authenticated and forward them to the cart / checkout — so
 * "Add to cart" and "Buy now" finish the job after login instead of dropping
 * the user on the home page empty-handed.
 */
export type PendingIntent =
  | {
      kind: "cart";
      returnTo: string;
      ts: number;
      cart: {
        payload: AddToCartPayload;
        displayMeta: Omit<CartItemMeta, "id" | "cartItemId" | "pending">;
        tempId: string;
      };
    }
  | {
      kind: "buyNow";
      returnTo: string;
      ts: number;
      buyNow: BuyNowItem;
    };

const KEY = "post_login_intent";
// Drop intents older than this so a login made much later (unrelated to the
// stashed action) never silently re-adds an item or hijacks the landing page.
const TTL_MS = 20 * 60 * 1000;

export function setPendingIntent(intent: PendingIntent): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    /* sessionStorage unavailable (private mode / quota) — non-fatal */
  }
}

export function getPendingIntent(): PendingIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingIntent;
    if (!parsed || typeof parsed.ts !== "number" || Date.now() - parsed.ts > TTL_MS) {
      clearPendingIntent();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingIntent(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* non-fatal */
  }
}

export function hasPendingIntent(): boolean {
  return getPendingIntent() !== null;
}
