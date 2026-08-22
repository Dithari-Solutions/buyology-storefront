import type { CartItemMeta, PromoState } from "../types";

/**
 * Everything the backend's validateAndCalculate looks at, collapsed into one string.
 *
 * PromoCodeService reads: the code, the order amount, and the product ids (for
 * applicableProductIds and excludedCategoryIds). Currency is included because the amount is
 * currency-relative. When the signature changes, the discount on screen describes a cart that no
 * longer exists — that is precisely when to re-ask.
 */
export function promoBasisSignature(items: CartItemMeta[], currency: string | null): string {
    const lines = items
        .filter((i) => i.selected !== false && !i.savedForLater)
        .map((i) => `${i.productId}:${i.quantity}:${i.price}`)
        .sort();
    return `${currency ?? ""}|${lines.join(",")}`;
}

/** A recheck is due only when a code is on screen and the basis moved under it. */
export function shouldRevalidate(promo: PromoState, signature: string): boolean {
    if (!promo.code) return false;
    if (promo.status !== "applied" && promo.status !== "invalidated") return false;
    return promo.validatedFor !== signature;
}
