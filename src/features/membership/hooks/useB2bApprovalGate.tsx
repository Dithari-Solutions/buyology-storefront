"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import B2bApprovalPendingModal from "../components/B2bApprovalPendingModal";

/**
 * Gate for accounts created through the B2B sign-up whose application has not been
 * approved yet. They can sign in and browse, but every action is blocked until an
 * admin approves.
 *
 * Usage — at the top of a guarded handler:
 *   `if (!requireApproved()) return;`
 * and render `{approvalGate}` in the component tree (it portals to document.body).
 *
 * Note: an existing customer who applies to UPGRADE to B2B is not affected — the
 * backend only sets `b2bPendingApproval` for accounts the application itself created.
 */
export function useB2bApprovalGate() {
    const pendingApproval = useSelector((s: RootState) => s.auth.b2bPendingApproval);
    const status = useSelector((s: RootState) => s.auth.b2bApplicationStatus);
    const [open, setOpen] = useState(false);

    /** Returns true when the action may proceed; otherwise opens the notice. */
    const requireApproved = (): boolean => {
        if (!pendingApproval) return true;
        setOpen(true);
        return false;
    };

    const approvalGate = open ? (
        <B2bApprovalPendingModal status={status} onClose={() => setOpen(false)} />
    ) : null;

    return { pendingApproval, requireApproved, approvalGate };
}
