import type { RepairStatus } from "../types";

/** Badge tone (Tailwind) per status. */
export const REPAIR_STATUS_TONE: Record<RepairStatus, string> = {
  SUBMITTED: "bg-[#EDE9FF] text-[#402F75]",
  AWAITING_DEVICE: "bg-indigo-50 text-indigo-700",
  UNDER_REVIEW: "bg-blue-50 text-blue-700",
  PRICE_ESTIMATED: "bg-[#FDF0D5] text-[#9a6b00]",
  IN_REPAIR: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

/** English default label per status (components pass these as i18n defaultValue). */
export const REPAIR_STATUS_LABEL: Record<RepairStatus, string> = {
  SUBMITTED: "Submitted",
  AWAITING_DEVICE: "Awaiting device",
  UNDER_REVIEW: "Under review",
  PRICE_ESTIMATED: "Waiting for your approval",
  IN_REPAIR: "In repair",
  COMPLETED: "Completed",
  DECLINED: "Estimate declined",
  CANCELLED: "Cancelled",
};

/** The five milestones shown on the repair timeline (matches the design). */
export const REPAIR_TIMELINE_STEPS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "PRICE_ESTIMATED",
  "IN_REPAIR",
  "COMPLETED",
] as const;

/** How many timeline milestones are complete for a given status (1–5). */
export function timelineReachedCount(status: RepairStatus): number {
  switch (status) {
    case "SUBMITTED":
    case "AWAITING_DEVICE":
      return 1;
    case "UNDER_REVIEW":
      return 2;
    case "PRICE_ESTIMATED":
    case "DECLINED":
      return 3;
    case "IN_REPAIR":
      return 4;
    case "COMPLETED":
      return 5;
    case "CANCELLED":
      return 1;
  }
}

/** True while the request is finished and should live in history. */
export function isRepairClosed(status: RepairStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED";
}

/**
 * The one thing the customer has to do next, if anything. Returned as an i18n key + English
 * default (plus interpolation values) so the caller owns the `t` call.
 *
 * This is what a list of requests is actually for: "In repair" tells you the state, but not
 * whether the ball is in your court. Statuses where we're the ones working return null.
 */
export type RepairNextAction = {
  key: string;
  defaultValue: string;
  values?: Record<string, string>;
} | null;

export function repairNextAction(r: {
  status: RepairStatus;
  inboundDeliveryMethod: string | null;
  returnDeliveryMethod: string | null;
  courierFeePaid: boolean;
  storeBranchName: string | null;
}): RepairNextAction {
  switch (r.status) {
    case "SUBMITTED":
      if (!r.inboundDeliveryMethod) {
        return { key: "card.chooseDelivery", defaultValue: "Choose how to get your device to us" };
      }
      if (r.inboundDeliveryMethod === "COURIER_PICKUP" && !r.courierFeePaid) {
        return { key: "card.payCourier", defaultValue: "Pay the courier fee to book your pickup" };
      }
      return null;
    case "AWAITING_DEVICE":
      return r.inboundDeliveryMethod === "STORE_DROPOFF"
        ? {
            key: "card.dropOff",
            defaultValue: "Drop your device at {{store}}",
            values: { store: r.storeBranchName ?? "the selected store" },
          }
        : null;
    case "PRICE_ESTIMATED":
      return { key: "card.respondPrice", defaultValue: "Accept or decline your estimate" };
    case "DECLINED":
      if (!r.returnDeliveryMethod) {
        return { key: "card.chooseReturn", defaultValue: "Choose how to get your device back" };
      }
      if (r.returnDeliveryMethod === "COURIER_RETURN" && !r.courierFeePaid) {
        return { key: "card.payReturn", defaultValue: "Pay the courier fee for the return" };
      }
      return null;
    default:
      return null;
  }
}
