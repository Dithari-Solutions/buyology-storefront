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
  estimatedPrice: number | null;
  estimatedPriceCurrency: string | null;
  estimatedTime: string | null;
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
