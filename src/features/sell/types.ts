// Customer sell (trade-in) feature types. Mirror the backend SellRequestResponse / enums.

export type SellStatus =
  | "SUBMITTED"
  | "AWAITING_DEVICE"
  | "UNDER_REVIEW"
  | "OFFER_MADE"
  | "ACCEPTED"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export type SellDeliveryMethod =
  | "COURIER_PICKUP"
  | "STORE_DROPOFF"
  | "COURIER_RETURN"
  | "STORE_PICKUP";

/** How the customer grades their device (and how our team re-grades it on arrival). */
export type DeviceCondition = "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";

/**
 * How the customer takes the money. Only STORE_CASH is accepted today — WALLET_CREDIT is shown in
 * the UI as "coming soon" and rejected by the backend until there is a wallet ledger to credit.
 */
export type SellPayoutMethod = "STORE_CASH" | "WALLET_CREDIT";

export interface SellRequest {
  id: string;
  reference: string | null;
  productName: string;
  brand: string;
  model: string;
  purchaseDate: string | null;
  deviceCondition: DeviceCondition;
  description: string;
  /** Presigned GET urls — the backend converts stored image keys on read. */
  imageUrls: string[] | null;
  status: SellStatus;
  inboundDeliveryMethod: SellDeliveryMethod | null;
  storeLocationId: string | null;
  storeBranchName: string | null;
  storeAddress: string | null;
  returnDeliveryMethod: SellDeliveryMethod | null;
  courierFeeAmount: number | null;
  courierFeeCurrency: string | null;
  courierFeePaid: boolean;
  /** True when we charged for a courier pickup the customer then swapped for a store drop-off. */
  courierFeeRefundDue: boolean;
  /** What the inbound method was before the customer's last change (null if never changed). */
  previousInboundDeliveryMethod: SellDeliveryMethod | null;
  inboundDeliveryChangedAt: string | null;
  /** What Buyology will pay — the binding offer, sent by our procurement team. */
  offerPrice: number | null;
  offerPriceCurrency: string | null;
  offerValidFor: string | null;
  inspectedCondition: DeviceCondition | null;
  payoutMethod: SellPayoutMethod | null;
  paidOutAt: string | null;
  /**
   * Preliminary AI valuation from the submitted photos, description and declared condition, priced
   * for the UAE second-hand market in AED. Advisory only — the binding number is `offerPrice`. The
   * `converted*` trio is the same range converted server-side into the currency passed on the
   * request (absent when none was asked for or FX was unavailable).
   */
  aiEstimateMinPrice: number | null;
  aiEstimateMaxPrice: number | null;
  aiEstimateCurrency: string | null;
  aiEstimateConfidence: "LOW" | "MEDIUM" | "HIGH" | null;
  aiEstimateSummary: string | null;
  aiEstimateCondition: DeviceCondition | null;
  aiEstimatedAt: string | null;
  aiEstimateConvertedMinPrice: number | null;
  aiEstimateConvertedMaxPrice: number | null;
  aiEstimateConvertedCurrency: string | null;
  adminNote: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  adminUnread: boolean;
  customerUnread: boolean;
  deviceReceivedAt: string | null;
  offeredAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A store branch the customer can drop the device at / collect it from / get paid at. */
export interface SellStoreOption {
  id: string;
  branchName: string;
  address: string;
  city: string;
  country: string;
}

/** Base courier fee for a pickup/return, before region currency conversion. */
export const SELL_COURIER_FEE_AED = 20;
/** Max device photos per request. */
export const SELL_MAX_IMAGES = 4;

export const DEVICE_CONDITIONS: DeviceCondition[] = ["LIKE_NEW", "GOOD", "FAIR", "POOR"];
