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

export async function submitApplication(
    req: MembershipApplicationRequest,
    userId?: string
): Promise<MembershipApplicationResponse> {
    const url = userId
        ? `/api/membership/apply?userId=${userId}`
        : "/api/membership/apply";
    return unwrap(await apiClient.post(url, req));
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
