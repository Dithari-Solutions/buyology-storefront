"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store";
import { addToCartThunk } from "@/features/cart/store/cartSlice";
import { setBuyNow } from "@/features/buyNow/store/buyNowSlice";
import { getPendingIntent, clearPendingIntent } from "@/shared/lib/pendingIntent";

/**
 * Replays a guest's stashed "add to cart" / "buy now" action the moment they
 * finish signing in, then forwards them to the cart / checkout. Mounted once
 * (above the page tree in Providers) so it survives the navigation to the auth
 * page and fires on any login path — sign-in, sign-up + OTP, or a session
 * restore that lands with the intent still in sessionStorage.
 */
export default function PendingIntentRunner() {
  const userId = useSelector((s: RootState) => s.auth.userId);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const intent = getPendingIntent();
    if (!intent) return;

    // Consume immediately so a re-render within the SAME login can't double-fire
    // it. We deliberately do NOT keep a permanent "already ran" latch: a later
    // guest action followed by another sign-in (e.g. buy-now, then log out, then
    // add-to-cart) must be able to replay again. clearPendingIntent() is the only
    // guard needed — a second run finds no intent and returns.
    clearPendingIntent();

    if (intent.kind === "buyNow") {
      // Stage the item BEFORE navigating — the checkout page reads the buyNow slice.
      dispatch(setBuyNow(intent.buyNow));
      router.replace(intent.returnTo);
      return;
    }

    // Cart: persist to the backend first so the cart page shows the item on load,
    // but cap the wait — a slow or failed request must never strand the user on
    // the auth page. Navigate regardless once the add settles or the cap elapses.
    void (async () => {
      try {
        await Promise.race([
          dispatch(
            addToCartThunk({
              userId,
              payload: intent.cart.payload,
              displayMeta: intent.cart.displayMeta,
              tempId: intent.cart.tempId,
            }),
          ),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);
      } finally {
        router.replace(intent.returnTo);
      }
    })();
  }, [userId, dispatch, router]);

  return null;
}
