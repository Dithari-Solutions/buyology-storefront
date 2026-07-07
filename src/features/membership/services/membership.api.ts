import { apiClient } from "@/shared/lib/apiClient";
import type {
    MembershipApplicationRequest,
    MembershipApplicationResponse,
    MembershipCard,
    WalletInfo,
    WalletTransaction,
} from "../types";

function unwrap<T>(res: { data: { data: T } }): T {
    return res.data.data;
}

/** Extra fields the public business sign-up sends alongside the application. */
export interface BusinessSignupPayload extends MembershipApplicationRequest {
    /** Password the applicant chooses; becomes their login once an admin approves. */
    password: string;
    confirmedPassword: string;
}

/**
 * Public (no-login) B2B membership sign-up. Sent as multipart/form-data with an
 * `application` JSON part plus the required `tradeLicense` document. The account is
 * created and usable only after an admin approves the application.
 */
export async function submitBusinessSignup(
    payload: BusinessSignupPayload,
    tradeLicense: File
): Promise<MembershipApplicationResponse> {
    const form = new FormData();
    form.append(
        "application",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    form.append("tradeLicense", tradeLicense);
    return unwrap(
        await apiClient.post("/api/membership/apply", form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
    );
}

export async function getMyApplication(userId: string): Promise<MembershipApplicationResponse> {
    return unwrap(await apiClient.get(`/api/membership/application?userId=${userId}`));
}

export async function getMembershipCard(userId: string): Promise<MembershipCard> {
    return unwrap(await apiClient.get(`/api/membership/card?userId=${userId}`));
}

export async function getWallet(userId: string): Promise<WalletInfo> {
    return unwrap(await apiClient.get(`/api/membership/wallet?userId=${userId}`));
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    return unwrap(await apiClient.get(`/api/membership/wallet/transactions?userId=${userId}`));
}
