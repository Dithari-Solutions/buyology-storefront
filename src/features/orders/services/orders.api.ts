import { apiClient } from "@/shared/lib/apiClient";
import type { PaginatedOrders, OrderDetail } from "../types";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export async function getOrders(page = 0, size = 20): Promise<PaginatedOrders> {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedOrders>>(
        `/api/orders?page=${page}&size=${size}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
    const { data } = await apiClient.get<ApiEnvelope<OrderDetail>>(
        `/api/orders/${orderId}`
    );
    if (!data.data) throw new Error(data.message ?? "Order not found.");
    return data.data;
}
