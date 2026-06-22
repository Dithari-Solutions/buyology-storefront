"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { getAccessToken } from "@/shared/lib/tokenManager";
import { setPendingIntent, type PendingIntent } from "@/shared/lib/pendingIntent";
import LoginPromptModal from "@/features/auth/components/LoginPromptModal";

/**
 * Shared "you must be signed in" gate for guarded actions
 * (add to cart, buy now, add to favourites…).
 *
 * Returns:
 *  - `requireAuth()`  → `true` if the user is signed in with a live token;
 *    otherwise opens the login popup and returns `false`. Use at the start of
 *    a guarded handler: `if (!requireAuth()) return;`
 *  - `openLoginPrompt()` → force-open the popup, e.g. from a `catch` block when
 *    an expired/invalid token makes the backend request fail.
 *  - `loginGate` → the `<LoginPromptModal>` element to render in the component
 *    tree (it portals to `document.body`, so placement doesn't matter).
 */
export function useLoginGate() {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Signed in only when Redux has a userId AND a live access token exists.
  // (A dead/cleared token leaves userId null after the 401-refresh fails.)
  const isAuthed = (): boolean => !!userId && !!getAccessToken();

  const openLoginPrompt = () => setOpen(true);

  // Pass an `intent` (built via cartIntent/buyNowIntent) so that, after the user
  // signs in, PendingIntentRunner replays the action and redirects to the cart /
  // checkout instead of dropping them on the home page.
  const requireAuth = (intent?: PendingIntent): boolean => {
    if (isAuthed()) return true;
    if (intent) setPendingIntent(intent);
    setOpen(true);
    return false;
  };

  const goToAuth = (mode: "signin" | "register") => {
    setOpen(false);
    router.push(`/${lang}/${PATH_SLUGS.auth[lang]}?mode=${mode}`);
  };

  const loginGate =
    mounted && open ? (
      <LoginPromptModal
        onSignIn={() => goToAuth("signin")}
        onCreateAccount={() => goToAuth("register")}
        onClose={() => setOpen(false)}
      />
    ) : null;

  return { requireAuth, openLoginPrompt, loginGate, isAuthed };
}
