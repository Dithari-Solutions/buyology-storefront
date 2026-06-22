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

/**
 * Build an "add this to cart after login, then go to the cart" intent. Shared by
 * every add-to-cart surface (product detail + listing/home cards) so the post-login
 * replay+redirect behaves identically everywhere.
 */
export function cartIntent(
  lang: string,
  storeId: string,
  productId: string,
  displayMeta: Omit<CartItemMeta, "id" | "cartItemId" | "pending">,
): PendingIntent {
  return {
    kind: "cart",
    returnTo: `/${lang}/cart`,
    ts: Date.now(),
    cart: {
      payload: { storeId, productId, quantity: 1 },
      displayMeta,
      tempId: `cart-${productId}-${Date.now()}`,
    },
  };
}

/** Build a "check this single item out after login, then go to checkout" intent. */
export function buyNowIntent(lang: string, buyNow: BuyNowItem): PendingIntent {
  return {
    kind: "buyNow",
    returnTo: `/${lang}/checkout?buyNow=1`,
    ts: Date.now(),
    buyNow,
  };
}
