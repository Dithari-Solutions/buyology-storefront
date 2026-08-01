import type { DeviceCondition, SellStatus } from "../types";

/** Badge tone (Tailwind) per status. */
export const SELL_STATUS_TONE: Record<SellStatus, string> = {
  SUBMITTED: "bg-[#EDE9FF] text-[#402F75]",
  AWAITING_DEVICE: "bg-indigo-50 text-indigo-700",
  UNDER_REVIEW: "bg-blue-50 text-blue-700",
  OFFER_MADE: "bg-[#FDF0D5] text-[#9a6b00]",
  ACCEPTED: "bg-teal-50 text-teal-700",
  COMPLETED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

/** English default label per status (components pass these as i18n defaultValue). */
export const SELL_STATUS_LABEL: Record<SellStatus, string> = {
  SUBMITTED: "Submitted",
  AWAITING_DEVICE: "Awaiting device",
  UNDER_REVIEW: "Under inspection",
  OFFER_MADE: "Waiting for your approval",
  ACCEPTED: "Collect your payment",
  COMPLETED: "Paid",
  DECLINED: "Offer declined",
  CANCELLED: "Cancelled",
};

/** English default label per declared/inspected device condition. */
export const CONDITION_LABEL: Record<DeviceCondition, string> = {
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

/** Short helper copy shown under each condition option on the form. */
export const CONDITION_HINT: Record<DeviceCondition, string> = {
  LIKE_NEW: "Barely used, no marks, everything works",
  GOOD: "Normal signs of use, fully working",
  FAIR: "Visible wear or a minor fault, still usable",
  POOR: "Heavy damage, or doesn't power on reliably",
};

/** The five milestones shown on the sell timeline. */
export const SELL_TIMELINE_STEPS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "OFFER_MADE",
  "ACCEPTED",
  "COMPLETED",
] as const;

/** How many timeline milestones are complete for a given status (1–5). */
export function timelineReachedCount(status: SellStatus): number {
  switch (status) {
    case "SUBMITTED":
    case "AWAITING_DEVICE":
      return 1;
    case "UNDER_REVIEW":
      return 2;
    case "OFFER_MADE":
    case "DECLINED":
      return 3;
    case "ACCEPTED":
      return 4;
    case "COMPLETED":
      return 5;
    case "CANCELLED":
      return 1;
  }
}

/** True while the request is finished and should live in history. */
export function isSellClosed(status: SellStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED";
}

/**
 * The one thing the customer has to do next, if anything. Returned as an i18n key + English
 * default (plus interpolation values) so the caller owns the `t` call.
 *
 * This is what a list of requests is actually for: "Under inspection" tells you the state, but
 * not whether the ball is in your court. Statuses where we're the ones working return null.
 */
export type SellNextAction = {
  key: string;
  defaultValue: string;
  values?: Record<string, string>;
} | null;

export function sellNextAction(r: {
  status: SellStatus;
  inboundDeliveryMethod: string | null;
  returnDeliveryMethod: string | null;
  courierFeePaid: boolean;
  storeBranchName: string | null;
}): SellNextAction {
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
    case "OFFER_MADE":
      return { key: "card.respondOffer", defaultValue: "Accept or decline our offer" };
    case "ACCEPTED":
      return { key: "card.collectPayment", defaultValue: "Collect your payment at our store" };
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
