"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { selectCartItems, selectSelectedIds, selectCartTotals } from "@/features/cart/store/cartSlice";

export default function CheckoutSummary() {
    const allItems = useSelector(selectCartItems);
    const selectedIds = useSelector(selectSelectedIds);
    const totals = useSelector(selectCartTotals);

    const items = allItems.filter((i) => selectedIds.includes(i.id));

    return (
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-6 self-start">
            <h2 className="text-[17px] font-bold text-gray-900 mb-5">Order Summary</h2>

            {/* Product list */}
            <div className="flex flex-col gap-4 mb-5">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        {/* Thumbnail with quantity badge */}
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                            {item.imageUrl ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                </div>
                            )}
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#402F75] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                {item.quantity}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-800 leading-snug truncate">{item.title}</p>
                            {(item.variant.color || item.variant.storage) && (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {[item.variant.color, item.variant.storage].filter(Boolean).join(" · ")}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <span className="text-[13px] font-bold text-gray-800 flex-shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}

                {items.length === 0 && (
                    <p className="text-[13px] text-gray-400 text-center py-3">No items selected</p>
                )}
            </div>

            <div className="h-px bg-gray-100 mb-4" />

            {/* Totals */}
            <div className="flex flex-col gap-2.5 text-[13px]">
                <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-800">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    {totals.shipping === 0 ? (
                        <span className="text-green-500 font-bold">Free</span>
                    ) : (
                        <span className="font-semibold text-gray-800">${totals.shipping.toFixed(2)}</span>
                    )}
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Tax (5%)</span>
                    <span className="font-semibold text-gray-800">${totals.tax.toFixed(2)}</span>
                </div>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            {/* Total */}
            <div className="flex items-end justify-between mb-5">
                <span className="text-[16px] font-bold text-gray-900">Total</span>
                <span className="text-[26px] font-bold text-[#402F75] leading-none">${totals.total.toFixed(2)}</span>
            </div>

            {/* Info notes */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Free shipping on orders over $199
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Estimated delivery 3-5 business days
                </div>
            </div>
        </aside>
    );
}
