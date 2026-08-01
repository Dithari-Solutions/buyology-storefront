// Customer device-repair feature types. Mirror the backend RepairRequestResponse / enums.

export type RepairStatus =
  | "SUBMITTED"
  | "AWAITING_DEVICE"
  | "UNDER_REVIEW"
  | "PRICE_ESTIMATED"
  | "IN_REPAIR"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export type RepairDeliveryMethod =
  | "COURIER_PICKUP"
  | "STORE_DROPOFF"
  | "COURIER_RETURN"
  | "STORE_PICKUP";

export interface Repair {
  id: string;
  reference: string | null;
  productName: string;
  brand: string;
  model: string;
  purchaseDate: string | null;
  description: string;
  /** Presigned GET urls — the backend converts stored image keys on read. */
  imageUrls: string[] | null;
  status: RepairStatus;
  inboundDeliveryMethod: RepairDeliveryMethod | null;
  storeLocationId: string | null;
  storeBranchName: string | null;
  storeAddress: string | null;
  returnDeliveryMethod: RepairDeliveryMethod | null;
  courierFeeAmount: number | null;
  courierFeeCurrency: string | null;
  courierFeePaid: boolean;
  /** True when we charged for a courier pickup the customer then swapped for a store drop-off. */
  courierFeeRefundDue: boolean;
  /** What the inbound method was before the customer's last change (null if never changed). */
  previousInboundDeliveryMethod: RepairDeliveryMethod | null;
  inboundDeliveryChangedAt: string | null;
  estimatedPrice: number | null;
  estimatedPriceCurrency: string | null;
  estimatedTime: string | null;
  /**
   * Preliminary AI estimate from the submitted photos + description, priced for the UAE
   * market in AED. Advisory only — the binding quote is still `estimatedPrice`, sent by the
   * repair team. The `converted*` pair is the same range converted server-side into the
   * currency passed on the request (absent when none was asked for or FX was unavailable).
   */
  aiEstimateMinPrice: number | null;
  aiEstimateMaxPrice: number | null;
  aiEstimateCurrency: string | null;
  aiEstimateConfidence: "LOW" | "MEDIUM" | "HIGH" | null;
  aiEstimateSummary: string | null;
  aiEstimateTime: string | null;
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
  pricedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A store branch the customer can drop the device at / collect it from. */
export interface RepairStoreOption {
  id: string;
  branchName: string;
  address: string;
  city: string;
  country: string;
}

/** Base courier fee for a pickup/return, before region currency conversion. */
export const REPAIR_COURIER_FEE_AED = 20;
/** Max problem images per request. */
export const REPAIR_MAX_IMAGES = 4;
