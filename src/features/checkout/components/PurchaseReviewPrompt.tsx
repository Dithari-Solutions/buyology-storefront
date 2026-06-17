"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { getOrderDetail } from "@/features/orders/services/orders.api";
import { getProductById, type ApiProduct } from "@/features/product/services/productService";
import { submitReview } from "@/features/product/services/reviewService";
import { getCredentialIdFromAccessToken } from "@/shared/lib/tokenManager";

interface ReviewableProduct {
    productId: string;
    title: string;
    image: string | null;
}

/**
 * Post-purchase review prompt shown on the payment-success screen. Resolves the
 * order's products (order items only carry productId, so we fetch each product for
 * its name/image) and renders an inline 1–5 star widget per product that submits
 * straight to POST /api/reviews. Best-effort: renders nothing if it can't resolve.
 */
export default function PurchaseReviewPrompt({ orderId }: { orderId: string }) {
    const { t } = useTranslation();
    const [products, setProducts] = useState<ReviewableProduct[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const order = await getOrderDetail(orderId);
                const ids = Array.from(new Set(order.items.map((i) => i.productId))).filter(Boolean);
                const fetched = await Promise.all(ids.map((id) => getProductById(id).catch(() => null)));
                if (cancelled) return;
                const list: ReviewableProduct[] = fetched
                    .filter((p): p is ApiProduct => !!p)
                    .map((p) => ({
                        productId: p.id,
                        title: p.title,
                        image:
                            p.media?.find((m) => m.isPrimary)?.thumbnailUrl ??
                            p.media?.find((m) => m.isPrimary)?.url ??
                            p.media?.[0]?.url ??
                            null,
                    }));
                setProducts(list);
            } catch {
                // best-effort — leave the prompt hidden if we can't resolve the order/products
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (!products.length) return null;

    return (
        <div className="w-full max-w-xl mx-auto mt-10 text-left">
            <h2 className="text-[18px] font-bold text-gray-900 mb-1 text-center">
                {t("payment.review.heading", { defaultValue: "Rate your purchase" })}
            </h2>
            <p className="text-[13px] text-gray-500 mb-5 text-center">
                {t("payment.review.subheading", {
                    defaultValue: "Your feedback helps other shoppers — it only takes a moment.",
                })}
            </p>
            <div className="flex flex-col gap-3">
                {products.map((p) => (
                    <ReviewCard key={p.productId} product={p} />
                ))}
            </div>
        </div>
    );
}

function ReviewCard({ product }: { product: ReviewableProduct }) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [body, setBody] = useState("");
    const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

    async function handleSubmit() {
        if (rating < 1) return;
        const authCredentialId = getCredentialIdFromAccessToken();
        if (!authCredentialId) {
            setState("error");
            return;
        }
        setState("saving");
        try {
            await submitReview({
                productId: product.productId,
                authCredentialId,
                rating,
                body: body.trim() || undefined,
            });
            setState("done");
        } catch {
            setState("error");
        }
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 relative">
                {product.image && (
                    <Image src={product.image} alt={product.title} fill className="object-contain" sizes="64px" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-gray-800 line-clamp-1">{product.title}</p>

                {state === "done" ? (
                    <p className="text-[13px] text-green-600 font-medium mt-2">
                        {t("payment.review.thanks", { defaultValue: "Thanks for your review!" })}
                    </p>
                ) : (
                    <>
                        <div className="flex items-center gap-1 mt-1.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setRating(n)}
                                    onMouseEnter={() => setHover(n)}
                                    onMouseLeave={() => setHover(0)}
                                    className="cursor-pointer"
                                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                                >
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill={(hover || rating) >= n ? "#FBBB14" : "none"}
                                        stroke={(hover || rating) >= n ? "#FBBB14" : "#cbd5e1"}
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={2}
                            placeholder={t("payment.review.placeholder", {
                                defaultValue: "Share a few words (optional)",
                            })}
                            className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#402F75] resize-none"
                        />
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={rating < 1 || state === "saving"}
                                className="bg-[#402F75] text-white text-[13px] font-bold px-4 py-2 rounded-full disabled:opacity-50 cursor-pointer hover:bg-[#34265f] transition-colors"
                            >
                                {state === "saving"
                                    ? "..."
                                    : t("payment.review.submit", { defaultValue: "Submit review" })}
                            </button>
                            {state === "error" && (
                                <span className="text-[12px] text-red-500">
                                    {t("payment.review.error", { defaultValue: "Couldn't submit. Please try again." })}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
