import { apiClient } from "@/shared/lib/apiClient";
import type {
    RefundRequestDetail,
    RefundReturnMethod,
    SpringPage,
} from "../types";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface PublicRefundSettings {
    returnWindowDays: number;
    enabled: boolean;
}

/**
 * Public storefront read of the return/refund policy. The product page uses
 * `returnWindowDays` to show "{n}-Day Returns" (return window == refund window).
 */
export async function getRefundSettings(): Promise<PublicRefundSettings> {
    const { data } = await apiClient.get<ApiEnvelope<PublicRefundSettings>>(
        "/api/refund-settings",
    );
    return data.data;
}

export async function listMyRefunds(
    page = 0,
    size = 50,
): Promise<SpringPage<RefundRequestDetail>> {
    const { data } = await apiClient.get<ApiEnvelope<SpringPage<RefundRequestDetail>>>(
        "/api/refunds",
        { params: { page, size } },
    );
    return data.data;
}

export interface CreateRefundPayload {
    orderId: string;
    description: string;
    images: File[];
}

// Backend expects flat @RequestParam fields, NOT a `request` JSON wrapper.
export async function createRefund(payload: CreateRefundPayload): Promise<RefundRequestDetail> {
    const fd = new FormData();
    fd.append("orderId", payload.orderId);
    fd.append("description", payload.description);
    payload.images.forEach((f) => fd.append("images", f));

    const { data } = await apiClient.post<ApiEnvelope<RefundRequestDetail>>(
        "/api/refunds",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
}

export async function setReturnMethod(
    refundId: string,
    method: RefundReturnMethod,
    currency: string,
): Promise<RefundRequestDetail> {
    const { data } = await apiClient.post<ApiEnvelope<RefundRequestDetail>>(
        `/api/refunds/${refundId}/return-method`,
        { method, currency },
    );
    return data.data;
}
