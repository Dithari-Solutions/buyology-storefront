"use client";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { clearCart } from "../store/cartSlice";
import { selectCartItems, selectSavedItems } from "../store/cartSlice";
import CartItem from "./CartItem";

export default function CartItems() {
    const dispatch = useDispatch();
    const { t } = useTranslation("cart");

    const cartItems = useSelector(selectCartItems);
    const savedItems = useSelector(selectSavedItems);

    return (
        <div className="flex flex-col gap-6">

            {/* ── Active Cart Section ── */}
            <section className="bg-white p-[20px] rounded-[20px]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[18px] font-bold text-gray-900">
                        {t("cartItems.heading")}{" "}
                        <span className="text-gray-400 font-normal">({cartItems.length})</span>
                    </h2>
                    {cartItems.length > 0 && (
                        <button
                            onClick={() => dispatch(clearCart())}
                            className="text-[13px] text-gray-500 hover:text-red-500 transition-colors font-medium cursor-pointer"
                        >
                            {t("cartItems.clearCart")}
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                        {t("empty.description")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {cartItems.map((item) => (
                            <CartItem key={item.id} item={item} showSaveForLater />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Saved for Later Section ── */}
            {savedItems.length > 0 && (
                <section className="bg-white p-[20px] rounded-[20px]">
                    <h2 className="text-[18px] font-bold text-gray-900 mb-4">
                        {t("savedForLater.heading")}{" "}
                        <span className="text-gray-400 font-normal">({savedItems.length})</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {savedItems.map((item) => (
                            <CartItem key={item.id} item={item} showSaveForLater={false} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
