"use client";

import { useEffect, useRef } from "react";
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
  const ran = useRef(false);

  useEffect(() => {
    if (!userId || ran.current) return;
    const intent = getPendingIntent();
    if (!intent) return;

    // Consume immediately so a re-render or a second login can't double-fire it.
    ran.current = true;
    clearPendingIntent();

    (async () => {
      try {
        if (intent.kind === "cart") {
          await dispatch(
            addToCartThunk({
              userId,
              payload: intent.cart.payload,
              displayMeta: intent.cart.displayMeta,
              tempId: intent.cart.tempId,
            }),
          );
        } else if (intent.kind === "buyNow") {
          dispatch(setBuyNow(intent.buyNow));
        }
      } finally {
        // Land them where the action was headed (cart / single-item checkout),
        // even if the cart-add failed — they can retry from there.
        router.replace(intent.returnTo);
      }
    })();
  }, [userId, dispatch, router]);

  return null;
}
