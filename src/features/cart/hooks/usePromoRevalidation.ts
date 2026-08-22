"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { revalidatePromoThunk } from "../store/cartSlice";
import { promoBasisSignature, shouldRevalidate } from "../store/promoBasis";

/**
 * Re-checks an applied promo whenever the cart basis moves under it.
 *
 * Debounced at 800ms — longer than the quantity spinner's own debounce, so a burst of taps costs
 * one request, not one per tap. Paused while a pending order exists: the order is created and its
 * discount is settled; rechecking against a cart mid-payment would only produce noise.
 */
export function usePromoRevalidation({ paused = false }: { paused?: boolean } = {}) {
    const dispatch = useDispatch<AppDispatch>();
    const items = useSelector((state: RootState) => state.cart.items);
    const currency = useSelector((state: RootState) => state.cart.currency);
    const promo = useSelector((state: RootState) => state.cart.promo);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const signature = promoBasisSignature(items, currency);
    const due = !paused && shouldRevalidate(promo, signature);

    useEffect(() => {
        if (!due) return;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            dispatch(revalidatePromoThunk());
        }, 800);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [due, signature, dispatch]);
}
