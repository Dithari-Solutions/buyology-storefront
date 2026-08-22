/**
 * The delivery fee this order will actually be charged, given the chosen method.
 *
 * Pure and shared, because the same arithmetic used to live inline in CheckoutPage and quoting the
 * STANDARD rate for an EXPRESS order is exactly how the reviewed total and the charged total
 * diverged. The backend recomputes the fee from the method server-side and ignores whatever the
 * client sends — this function exists so what the customer reviews matches that.
 */
export interface DeliveryFeeInput {
    method: "EXPRESS" | "REGULAR" | "PICKUP";
    /** The 30-minute rate (0 above the free-shipping threshold); null when unknown. */
    expressFee: number | null;
    /** The standard rate the cart quotes. */
    standardFee: number;
}

export function effectiveDeliveryFee({ method, expressFee, standardFee }: DeliveryFeeInput): number {
    if (method === "PICKUP") return 0;
    if (method === "EXPRESS" && expressFee != null) return expressFee;
    return standardFee;
}
