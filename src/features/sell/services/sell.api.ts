import { apiClient } from "@/shared/lib/apiClient";
import type {
  DeviceCondition,
  SellDeliveryMethod,
  SellPayoutMethod,
  SellRequest,
  SellStoreOption,
} from "../types";

// ── Customer sell (trade-in) API ────────────────────────────────────────────
// Any logged-in customer with complete contact details can open a sell request
// under `/api/sell-requests` (auth required). All responses are wrapped in the
// standard ApiResponse envelope — unwrap `.data.data`.

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

export interface SubmitSellPayload {
  productName: string;
  brand: string;
  model: string;
  /** ISO date (yyyy-mm-dd) — optional. */
  purchaseDate?: string;
  deviceCondition: DeviceCondition;
  description: string;
  /** Up to 4 device images — sent as multipart/form-data. */
  images?: File[];
}

/**
 * Whether the caller may open a sell request at all. False when their profile is missing an email
 * or phone number — the form is not shown in that case, since a trade-in ends with us handing over
 * money and we must be able to reach the seller.
 */
export async function getSellEligibility(): Promise<boolean> {
  const data = await unwrap(
    await apiClient.get<ApiResponse<{ eligible: boolean }>>("/api/sell-requests/eligibility"),
  );
  return Boolean(data?.eligible);
}

/**
 * Open a sell request. Builds multipart/form-data appending each scalar field
 * individually plus the repeated `images` field (mirrors the repair service).
 */
export async function submitSellRequest(payload: SubmitSellPayload): Promise<SellRequest> {
  const formData = new FormData();
  formData.append("productName", payload.productName);
  formData.append("brand", payload.brand);
  formData.append("model", payload.model);
  if (payload.purchaseDate) formData.append("purchaseDate", payload.purchaseDate);
  formData.append("deviceCondition", payload.deviceCondition);
  formData.append("description", payload.description);
  (payload.images ?? []).slice(0, 4).forEach((file) => formData.append("images", file));

  return unwrap(
    await apiClient.post<ApiResponse<SellRequest>>("/api/sell-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
}

/**
 * The customer's own sell requests, newest first. `currency` is optional — when given, the backend
 * also returns the AED AI valuation converted into it.
 */
export async function listMySellRequests(currency?: string): Promise<SellRequest[]> {
  return unwrap(
    await apiClient.get<ApiResponse<SellRequest[]>>("/api/sell-requests", {
      params: currency ? { currency } : undefined,
    }),
  );
}

/**
 * A single owned sell request (also clears the customer's "new update" flag server-side).
 * `currency` is optional — when given, the backend also returns the AED AI valuation converted
 * into it.
 */
export async function getSellRequest(id: string, currency?: string): Promise<SellRequest> {
  return unwrap(
    await apiClient.get<ApiResponse<SellRequest>>(`/api/sell-requests/${id}`, {
      params: currency ? { currency } : undefined,
    }),
  );
}

/** Active store branches in a country (alpha-3) for the drop-off / pickup / payout picker. */
export async function listSellStores(country: string): Promise<SellStoreOption[]> {
  return unwrap(
    await apiClient.get<ApiResponse<SellStoreOption[]>>("/api/sell-requests/stores", {
      params: { country },
    }),
  );
}

/** Paymob checkout session returned when a courier fee must be paid (mirrors PaymentInitiatedResponse). */
export interface SellPayment {
  transactionId: string;
  methodType: string;
  amount: number;
  currency: string;
  clientSecret: string | null;
  checkoutUrl: string | null;
}

/**
 * Result of choosing a delivery / return method. For free options `payment` is null and
 * `sellRequest` is already advanced. For the courier options `payment.checkoutUrl` is where the
 * browser must be sent to pay the 20 AED fee — the request only advances once that payment
 * succeeds.
 */
export interface SellDeliveryResult {
  sellRequest: SellRequest;
  payment: SellPayment | null;
}

export interface ChooseSellDeliveryPayload {
  method: Extract<SellDeliveryMethod, "COURIER_PICKUP" | "STORE_DROPOFF">;
  storeLocationId?: string;
  /** Customer currency the 20 AED courier fee should be converted into for display. */
  currency?: string;
  /** Where Paymob returns the browser after the courier-fee checkout (courier pickup only). */
  redirectionUrl?: string;
}

/** Choose how the device reaches the store. Store drop-off advances immediately; courier returns a checkout session. */
export async function chooseSellDelivery(
  id: string,
  payload: ChooseSellDeliveryPayload,
): Promise<SellDeliveryResult> {
  return unwrap(
    await apiClient.post<ApiResponse<SellDeliveryResult>>(`/api/sell-requests/${id}/delivery`, payload),
  );
}

/**
 * Accept (→ ACCEPTED, payout awaiting collection) or decline (→ DECLINED) the offer.
 * `payoutMethod` is required when accepting and must be STORE_CASH today.
 */
export async function respondToOffer(
  id: string,
  accept: boolean,
  payoutMethod?: SellPayoutMethod,
): Promise<SellRequest> {
  return unwrap(
    await apiClient.post<ApiResponse<SellRequest>>(`/api/sell-requests/${id}/offer-response`, {
      accept,
      payoutMethod,
    }),
  );
}

export interface ChooseSellReturnPayload {
  method: Extract<SellDeliveryMethod, "COURIER_RETURN" | "STORE_PICKUP">;
  currency?: string;
  /** Where Paymob returns the browser after the courier-fee checkout (courier return only). */
  redirectionUrl?: string;
}

/** After a decline, choose how the device is returned. Store pickup is free; courier returns a checkout session. */
export async function chooseSellReturn(
  id: string,
  payload: ChooseSellReturnPayload,
): Promise<SellDeliveryResult> {
  return unwrap(
    await apiClient.post<ApiResponse<SellDeliveryResult>>(`/api/sell-requests/${id}/return`, payload),
  );
}
