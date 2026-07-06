"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { getUidFromAccessToken } from "@/shared/lib/tokenManager";
import { getMembershipCard } from "@/features/membership/services/membership.api";
import type { MembershipCard, MembershipStatus } from "@/features/membership/types";

// ── B2B membership check ────────────────────────────────────────────────────
// There is no dedicated "am I a B2B member" endpoint; the closest source of
// truth is the membership card (`GET /api/membership/card?userId=<uid>`), which
// only exists for approved members and carries `status: ACTIVE|SUSPENDED|EXPIRED`.
// A member is treated as an ACTIVE B2B member iff the card resolves with
// status === "ACTIVE". Non-members / unauthenticated users 404 (or have no
// token) and are reported as not-a-member. Use `isActiveMember` to gate
// add-to-B2B-cart / RFQ actions and prompt others to apply for membership.
//
// Note: /api/membership/* endpoints key by users.id (uid claim), NOT
// auth_credentials.id (sub). Redux `auth.userId` is the JWT sub, so we prefer
// getUidFromAccessToken() and fall back to it — mirrors MembershipDashboard.

export interface B2bMembershipState {
  /** Still resolving the membership card. */
  loading: boolean;
  /** true iff a membership card resolved with status === "ACTIVE". */
  isActiveMember: boolean;
  /** Card status if a card exists, else null (not a member / not signed in). */
  status: MembershipStatus | null;
  /** The resolved membership card, or null. */
  card: MembershipCard | null;
}

/**
 * React hook: resolves whether the current user is an ACTIVE B2B member.
 * Returns `{ loading, isActiveMember, status, card }`.
 */
export function useB2bMembership(): B2bMembershipState {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const userId = useSelector((s: RootState) => s.auth.userId);

  const [state, setState] = useState<B2bMembershipState>({
    loading: true,
    isActiveMember: false,
    status: null,
    card: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ loading: false, isActiveMember: false, status: null, card: null });
      return;
    }

    const uid = getUidFromAccessToken() ?? userId;
    if (!uid) {
      setState({ loading: false, isActiveMember: false, status: null, card: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    getMembershipCard(uid)
      .then((card) => {
        if (cancelled) return;
        setState({
          loading: false,
          isActiveMember: card?.status === "ACTIVE",
          status: card?.status ?? null,
          card: card ?? null,
        });
      })
      .catch(() => {
        // 404 (no card / not a member) or any error → not an active member.
        if (cancelled) return;
        setState({ loading: false, isActiveMember: false, status: null, card: null });
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId]);

  return state;
}

/**
 * Imperative variant for non-React callers (e.g. route loaders / event handlers).
 * Resolves the current user's membership card and reports whether they are an
 * ACTIVE B2B member. Returns `false` when unauthenticated or no card exists.
 */
export async function checkActiveB2bMembership(): Promise<{
  isActiveMember: boolean;
  status: MembershipStatus | null;
  card: MembershipCard | null;
}> {
  const uid = getUidFromAccessToken();
  if (!uid) return { isActiveMember: false, status: null, card: null };
  try {
    const card = await getMembershipCard(uid);
    return {
      isActiveMember: card?.status === "ACTIVE",
      status: card?.status ?? null,
      card: card ?? null,
    };
  } catch {
    return { isActiveMember: false, status: null, card: null };
  }
}
