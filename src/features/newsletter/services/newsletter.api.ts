import { apiClient } from "@/shared/lib/apiClient";

interface ApiEnvelope<T> {
    status: number;
    message: string;
    data: T | null;
}

export async function subscribeToNewsletter(email: string): Promise<string> {
    const { data } = await apiClient.post<ApiEnvelope<string>>("/api/newsletter/subscribe", { email });
    return data.data || data.message;
}

export async function unsubscribeFromNewsletter(token: string): Promise<string> {
    const { data } = await apiClient.get<ApiEnvelope<string>>(`/api/newsletter/unsubscribe?token=${token}`);
    return data.data || data.message;
}
