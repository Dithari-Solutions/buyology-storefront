/**
 * Whether THIS checkout can be delivered in 30 minutes — the storefront's one transcription of the
 * backend rule, kept pure so it can be tested and so no component re-derives it by hand.
 *
 * The authority is OrderService.resolveDeliveryMethod: EXPRESS only when EVERY item's store is
 * inside the radius of the DELIVERY ADDRESS, else a silent downgrade to REGULAR. The storefront
 * used to offer express on an ANY-item test against the DEVICE's GPS — two mistakes in one line,
 * and each of them quoted a 20 AED express delivery the backend then charged as a downgraded
 * regular one.
 */

export type ExpressBlocker =
    | "NO_ITEMS"
    | "NO_COORDS"        // the address has no map pin, so eligibility cannot be checked
    | "UNKNOWN"          // the express-stores lookup has not answered (or failed)
    | "NONE_NEARBY"      // no item's store is within the radius of the address
    | "SOME_NOT_NEARBY"; // a strict subset qualifies — the all-items rule fails

export interface ExpressDecision {
    available: boolean;
    blocker: ExpressBlocker | null;
    /** How many items fail the radius test — drives the "N items too far" message. */
    blockingCount: number;
}

export interface ExpressItemRef {
    storeId: string | null | undefined;
}

export function decideExpress(
    items: ExpressItemRef[],
    hasCoords: boolean,
    expressStoreIds: string[] | null,
): ExpressDecision {
    if (items.length === 0) {
        return { available: false, blocker: "NO_ITEMS", blockingCount: 0 };
    }
    if (!hasCoords) {
        return { available: false, blocker: "NO_COORDS", blockingCount: items.length };
    }
    if (expressStoreIds === null) {
        return { available: false, blocker: "UNKNOWN", blockingCount: items.length };
    }
    const nearby = new Set(expressStoreIds);
    const blocking = items.filter((i) => !i.storeId || !nearby.has(i.storeId)).length;
    if (blocking === 0) {
        return { available: true, blocker: null, blockingCount: 0 };
    }
    return {
        available: false,
        blocker: blocking === items.length ? "NONE_NEARBY" : "SOME_NOT_NEARBY",
        blockingCount: blocking,
    };
}
