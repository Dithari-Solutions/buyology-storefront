"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import {
    removeItem,
    updateQuantity,
    toggleSelectItem,
    saveForLater,
    moveToCart,
    removeItemThunk,
    updateQuantityThunk,
    selectSelectedIds,
    selectCartCurrency,
} from "../store/cartSlice";
import type { CartItemMeta } from "../types";
import { BoltIcon } from "@/shared/icons";

interface CartItemProps {
    item: CartItemMeta;
    showSaveForLater?: boolean;
}

export default function CartItem({ item, showSaveForLater = true }: CartItemProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation("cart");
    const selectedIds = useSelector(selectSelectedIds);
    const userId = useSelector((state: RootState) => state.auth.userId);
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;
    const currency = useSelector(selectCartCurrency) ?? "AED";
    const isSelected = selectedIds.includes(item.id);

    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const productHref = item.slug ? `/${lang}/${shopSlug}/${item.slug}` : null;

    const subtotal = (item.price * item.quantity).toFixed(2);

    // Debounce the server sync: a burst of +/- clicks sends ONE PATCH with the
    // final quantity. Firing a PATCH per click let responses arrive out of order
    // and bounce the displayed number (e.g. 8 → back to 7). The optimistic Redux
    // value updates instantly so the stepper stays snappy.
    const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const baselineRef = useRef(item.quantity);   // quantity before the current click-burst
    const optimisticRef = useRef(item.quantity); // latest intended qty (survives rapid clicks)
    const pendingRef = useRef<{ cartItemId: string; localId: string; quantity: number; previousQuantity: number } | null>(null);
    const flushRef = useRef<() => void>(() => {});

    useEffect(() => { optimisticRef.current = item.quantity; }, [item.quantity]);

    // Keep flushRef pointing at a fresh closure (current userId/dispatch). It sends
    // the debounced quantity sync if one is pending — called when the timer fires AND
    // on unmount, so navigating away within the debounce window never drops the change.
    useEffect(() => {
        flushRef.current = () => {
            if (syncTimer.current) { clearTimeout(syncTimer.current); syncTimer.current = null; }
            const p = pendingRef.current;
            pendingRef.current = null;
            if (p && userId) {
                dispatch(updateQuantityThunk({ userId, cartItemId: p.cartItemId, localId: p.localId, quantity: p.quantity, previousQuantity: p.previousQuantity }));
            }
        };
    });
    useEffect(() => () => flushRef.current(), []);

    function step(delta: number) {
        const newQty = optimisticRef.current + delta;
        if (newQty < 1) return;
        // Capture the pre-burst quantity once, so a failed sync reverts to it.
        if (syncTimer.current === null) baselineRef.current = item.quantity;
        optimisticRef.current = newQty;
        dispatch(updateQuantity({ id: item.id, quantity: newQty }));
        if (!userId || !item.cartItemId) return;
        pendingRef.current = { cartItemId: item.cartItemId, localId: item.id, quantity: newQty, previousQuantity: baselineRef.current };
        if (syncTimer.current) clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => flushRef.current(), 450);
    }

    function handleDecrement() { step(-1); }
    function handleIncrement() { step(1); }

    function handleRemove() {
        dispatch(removeItem(item.id));
        if (userId && item.cartItemId) {
            dispatch(removeItemThunk({ userId, cartItemId: item.cartItemId }));
        }
    }

    return (
        <div
            className={`group relative w-full h-full flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 md:p-5 bg-white rounded-[22px] border transition-all duration-300 overflow-hidden min-h-[200px] sm:min-h-[178px] md:min-h-[168px] ${
                isSelected
                    ? "border-[#402F75]/25 ring-1 ring-[#402F75]/10 shadow-[0_14px_34px_-18px_rgba(64,47,117,0.4)]"
                    : "border-gray-100 shadow-[0_2px_10px_-4px_rgba(16,12,40,0.06)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(64,47,117,0.3)] hover:border-gray-200"
            }`}
        >
            {/* selected accent: soft gradient sheen */}
            {isSelected && (
                <div className="pointer-events-none absolute -top-16 -end-16 w-44 h-44 rounded-full bg-[#402F75]/10 blur-3xl" />
            )}

            {/* ── Checkbox ── */}
            <label className="relative z-10 pt-0.5 flex-shrink-0 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => dispatch(toggleSelectItem(item.id))}
                    className="peer sr-only"
                    aria-label={`Select ${item.title}`}
                />
                <span className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-gray-300 bg-white peer-checked:bg-[#402F75] peer-checked:border-[#402F75] peer-focus-visible:ring-2 peer-focus-visible:ring-[#402F75]/40 peer-focus-visible:ring-offset-1 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </span>
            </label>

            {/* ── Quick Delivery badge ── */}
            {item.quickDelivery && (
                <span className="absolute top-3 end-3 z-20 inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full leading-none shadow-[0_4px_12px_-4px_rgba(16,185,129,0.6)]">
                    <BoltIcon className="w-3 h-3" /> {t("cartItems.quickDelivery")}
                </span>
            )}

            {/* ── Image with discount badge ── */}
            <div className="relative w-[84px] h-[84px] sm:w-[104px] sm:h-[104px] md:w-[116px] md:h-[116px] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F1EEFB] to-[#FBFAFF] ring-1 ring-black/[0.04]">
                {/* Skeleton until the real product image resolves — no mock placeholder. */}
                {!item.imageUrl ? (
                    <div className="w-full h-full bg-gray-100 animate-pulse" />
                ) : productHref ? (
                    <Link href={productHref} className="w-full h-full block">
                        <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105" sizes="116px" />
                    </Link>
                ) : (
                    <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105" sizes="116px" />
                )}
                {item.discountPercent > 0 && (
                    <span className="absolute top-1.5 start-1.5 bg-gradient-to-r from-[#402F75] to-[#5d44a8] text-white text-[10px] font-bold px-2 py-[3px] rounded-full leading-none z-10 shadow-sm">
                        -{item.discountPercent}%
                    </span>
                )}
            </div>

            {/* ── Info Block ── */}
            <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-2.5 justify-between">

                {/* Title + Price */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 min-w-0">
                    {productHref ? (
                        <Link href={productHref} className="font-bold text-[15px] sm:text-[17px] md:text-[19px] text-gray-900 leading-snug hover:text-[#402F75] transition-colors line-clamp-2 pe-16 sm:pe-0 min-w-0 break-words">
                            {item.title}
                        </Link>
                    ) : (
                        <h3 className="font-bold text-[15px] sm:text-[17px] md:text-[19px] text-gray-900 leading-snug line-clamp-2 pe-16 sm:pe-0 min-w-0 break-words">{item.title}</h3>
                    )}
                    <div className={`flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5 flex-shrink-0 ${item.quickDelivery ? "sm:mt-7" : ""}`}>
                        <span className="text-[#402F75] font-extrabold text-[16px] sm:text-[18px] md:text-[20px] whitespace-nowrap tracking-tight">
                            {currency} {(item.price ?? 0).toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-gray-400 line-through text-[12px] sm:text-[14px] whitespace-nowrap">
                                {currency} {(item.originalPrice ?? 0).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Selected specs — full set from the cart API (RAM, storage, color, …) */}
                {item.selectedSpecs && item.selectedSpecs.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 text-[11px] sm:text-[12px]">
                        {item.selectedSpecs.map((s) => (
                            <span key={s.specOptionId} className="inline-flex items-center gap-1.5 bg-[#F6F4FB] border border-[#402F75]/[0.07] rounded-lg px-2.5 py-1 text-gray-500">
                                {s.colorCode && (
                                    <span className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: s.colorCode }} />
                                )}
                                {s.groupName ? `${s.groupName}: ` : ""}
                                <strong className="text-gray-700 font-semibold">{s.unit ? `${s.value} ${s.unit}` : s.value}</strong>
                            </span>
                        ))}
                    </div>
                ) : (item.variant.color || item.variant.storage) ? (
                    <div className="flex gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] overflow-hidden">
                        {item.variant.color && (
                            <span className="bg-[#F6F4FB] border border-[#402F75]/[0.07] rounded-lg px-2.5 py-1 text-gray-500 truncate max-w-[50%]">
                                {t("cartItems.color")}: <strong className="text-gray-700 font-semibold">{item.variant.color}</strong>
                            </span>
                        )}
                        {item.variant.storage && (
                            <span className="bg-[#F6F4FB] border border-[#402F75]/[0.07] rounded-lg px-2.5 py-1 text-gray-500 truncate max-w-[50%]">
                                {t("cartItems.storage")}: <strong className="text-gray-700 font-semibold">{item.variant.storage}</strong>
                            </span>
                        )}
                    </div>
                ) : null}

                {/* Qty + Subtotal + Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-auto pt-1">

                    {/* Qty + Subtotal */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <div className="inline-flex items-center gap-0.5 bg-[#F4F2FB] rounded-full p-1">
                            <button
                                onClick={handleDecrement}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#402F75] hover:bg-[#402F75] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#402F75] disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                            <span className="w-7 text-center font-extrabold text-[14px] text-[#402F75] tabular-nums">
                                {item.quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#402F75] hover:bg-[#402F75] hover:text-white transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                        {/* Subtotal */}
                        <div className="flex flex-col">
                            <span className="text-[11px] text-gray-400 leading-tight">{t("cartItems.subtotal")}</span>
                            <span className="text-[#402F75] font-extrabold text-[15px] sm:text-[17px] leading-tight tracking-tight">{currency} {subtotal}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {showSaveForLater && !item.savedForLater && (
                            <button
                                onClick={() => dispatch(saveForLater(item.id))}
                                className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-gray-500 hover:text-[#402F75] px-3 py-2 rounded-full hover:bg-[#F4F2FB] transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                                {t("cartItems.saveForLater")}
                            </button>
                        )}
                        {item.savedForLater && (
                            <button
                                onClick={() => dispatch(moveToCart(item.id))}
                                className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-[#402F75] hover:text-white hover:bg-[#402F75] px-3 py-2 rounded-full bg-[#F4F2FB] transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {t("cartItems.moveToCart")}
                            </button>
                        )}
                        <button
                            onClick={handleRemove}
                            className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-gray-400 hover:text-[#FB2C36] px-3 py-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                            aria-label={`Remove ${item.title}`}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                            <span className="hidden sm:inline">{t("cartItems.remove")}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
