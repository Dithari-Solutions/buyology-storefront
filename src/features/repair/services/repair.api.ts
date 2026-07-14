import { apiClient } from "@/shared/lib/apiClient";
import type { Repair, RepairDeliveryMethod, RepairStoreOption } from "../types";

// ── Customer device-repair API ──────────────────────────────────────────────
// Any logged-in customer can open a repair request under `/api/repairs`
// (auth required). All responses are wrapped in the standard ApiResponse
// envelope — unwrap `.data.data`.

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

export interface SubmitRepairPayload {
  productName: string;
  brand: string;
  model: string;
  /** ISO date (yyyy-mm-dd) — optional. */
  purchaseDate?: string;
  description: string;
  /** Up to 4 problem images — sent as multipart/form-data. */
  images?: File[];
}

/**
 * Open a repair request. Builds multipart/form-data appending each scalar field
 * individually plus the repeated `images` field (mirrors the reviews service).
 */
export async function submitRepairRequest(payload: SubmitRepairPayload): Promise<Repair> {
  const formData = new FormData();
  formData.append("productName", payload.productName);
  formData.append("brand", payload.brand);
  formData.append("model", payload.model);
  if (payload.purchaseDate) formData.append("purchaseDate", payload.purchaseDate);
  formData.append("description", payload.description);
  (payload.images ?? []).slice(0, 4).forEach((file) => formData.append("images", file));

  return unwrap(
    await apiClient.post<ApiResponse<Repair>>("/api/repairs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
}

/** The customer's own repairs, newest first. */
export async function listMyRepairs(): Promise<Repair[]> {
  return unwrap(await apiClient.get<ApiResponse<Repair[]>>("/api/repairs"));
}

/** A single owned repair (also clears the customer's "new update" flag server-side). */
export async function getRepair(id: string): Promise<Repair> {
  return unwrap(await apiClient.get<ApiResponse<Repair>>(`/api/repairs/${id}`));
}

/** Active store branches in a country (alpha-3) for the drop-off / pickup picker. */
export async function listRepairStores(country: string): Promise<RepairStoreOption[]> {
  return unwrap(
    await apiClient.get<ApiResponse<RepairStoreOption[]>>("/api/repairs/stores", {
      params: { country },
    }),
  );
}

/** Paymob checkout session returned when a courier fee must be paid (mirrors PaymentInitiatedResponse). */
export interface RepairPayment {
  transactionId: string;
  methodType: string;
  amount: number;
  currency: string;
  clientSecret: string | null;
  checkoutUrl: string | null;
}

/**
 * Result of choosing a delivery / return method. For free options `payment` is null and `repair`
 * is already advanced. For the courier options `payment.checkoutUrl` is where the browser must be
 * sent to pay the 20 AED fee — the repair only advances once that payment succeeds.
 */
export interface RepairDeliveryResult {
  repair: Repair;
  payment: RepairPayment | null;
}

export interface ChooseDeliveryPayload {
  method: Extract<RepairDeliveryMethod, "COURIER_PICKUP" | "STORE_DROPOFF">;
  storeLocationId?: string;
  /** Customer currency the 20 AED courier fee should be converted into for display. */
  currency?: string;
  /** Where Paymob returns the browser after the courier-fee checkout (courier pickup only). */
  redirectionUrl?: string;
}

/** Choose how the device reaches the store. Store drop-off advances immediately; courier returns a checkout session. */
export async function chooseDelivery(id: string, payload: ChooseDeliveryPayload): Promise<RepairDeliveryResult> {
  return unwrap(await apiClient.post<ApiResponse<RepairDeliveryResult>>(`/api/repairs/${id}/delivery`, payload));
}

/** Accept (→ IN_REPAIR) or decline (→ DECLINED) the quoted fixing price. */
export async function respondToPrice(id: string, accept: boolean): Promise<Repair> {
  return unwrap(
    await apiClient.post<ApiResponse<Repair>>(`/api/repairs/${id}/price-response`, { accept }),
  );
}

export interface ChooseReturnPayload {
  method: Extract<RepairDeliveryMethod, "COURIER_RETURN" | "STORE_PICKUP">;
  currency?: string;
  /** Where Paymob returns the browser after the courier-fee checkout (courier return only). */
  redirectionUrl?: string;
}

/** After a decline, choose how the device is returned. Store pickup is free; courier returns a checkout session. */
export async function chooseReturn(id: string, payload: ChooseReturnPayload): Promise<RepairDeliveryResult> {
  return unwrap(await apiClient.post<ApiResponse<RepairDeliveryResult>>(`/api/repairs/${id}/return`, payload));
}
