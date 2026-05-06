import { apiClient } from "@/shared/lib/apiClient";

export type CreditUsageStatus = "OUTSTANDING" | "PARTIAL" | "PAID" | "OVERDUE";

export interface CreditUsage {
  id: string;
  userId: string;
  membershipId: string;
  orderId: string;
  amount: number;
  currency: string;
  paidAmount: number;
  status: CreditUsageStatus;
  usedAt: string;
  dueAt: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaybackInitiation {
  usageId: string;
  amount: number;
  currency: string;
  intentionId: string;
  clientSecret: string;
  checkoutUrl: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const b2bAccountApi = {
  async listCreditUsages(): Promise<CreditUsage[]> {
    const res = await apiClient.get<ApiResponse<CreditUsage[]>>(
      "/api/membership/credit/usages",
    );
    return res.data.data ?? [];
  },

  async initiatePayback(
    usageId: string,
    payload?: { amount?: number; email?: string },
  ): Promise<PaybackInitiation> {
    const res = await apiClient.post<ApiResponse<PaybackInitiation>>(
      `/api/membership/credit/usages/${usageId}/pay`,
      payload ?? {},
    );
    return res.data.data;
  },

  async freezeMembership(): Promise<string> {
    const res = await apiClient.post<ApiResponse<string>>(`/api/membership/freeze`);
    return res.data.data;
  },

  async unfreezeMembership(): Promise<string> {
    const res = await apiClient.post<ApiResponse<string>>(`/api/membership/unfreeze`);
    return res.data.data;
  },

  async deleteMembership(): Promise<string> {
    const res = await apiClient.delete<ApiResponse<string>>(`/api/membership`);
    return res.data.data;
  },

  async payOrderWithCredit(orderId: string): Promise<{
    orderId: string;
    creditUsageId: string;
    amount: number;
    currency: string;
    dueAt: string;
  }> {
    const res = await apiClient.post<
      ApiResponse<{
        orderId: string;
        creditUsageId: string;
        amount: number;
        currency: string;
        dueAt: string;
      }>
    >(`/api/orders/${orderId}/pay-with-credit`);
    return res.data.data;
  },
};
