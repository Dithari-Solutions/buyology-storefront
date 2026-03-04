"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectFavouriteItems, clearFavourites } from "../store/favouritesSlice";
import { FAVOURITE_CATEGORIES, type FavouriteCategory } from "../constants";
import FavouriteCard from "./FavouriteCard";
import FavouritesEmptyItems from "./FavouritesEmptyItems";
import type { FavouriteItemMeta } from "../types";

export default function FavouritesGrid() {
    const { t } = useTranslation("favourites");
    const dispatch = useDispatch();
    const items = useSelector(selectFavouriteItems);
    const [activeCategory, setActiveCategory] = useState<FavouriteCategory>("all");

    const filteredItems: FavouriteItemMeta[] =
        activeCategory === "all"
            ? items
            : items.filter((i) => i.category === activeCategory);

    const inStockCount = items.filter((i) => i.inStock).length;
    const potentialSavings = items.reduce(
        (acc, i) => acc + (i.originalPrice - i.price),
        0
    );

    if (items.length === 0) {
        return <FavouritesEmptyItems />;
    }

    return (
        <div className="flex flex-col gap-[20px]">
            {/* Stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
                <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[16px] flex items-center gap-[14px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#F6F4FF] flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75" stroke="#402F75" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[22px] font-bold text-[#402F75]">{items.length}</p>
                        <p className="text-[12px] text-gray-500">{t("stats.savedItems")}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[16px] flex items-center gap-[14px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[22px] font-bold text-green-600">{inStockCount}</p>
                        <p className="text-[12px] text-gray-500">{t("stats.inStock")}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[16px] flex items-center gap-[14px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#FFFBEA] flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#FBBB14" stroke="#FBBB14" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[22px] font-bold text-[#FBBB14]">${potentialSavings}</p>
                        <p className="text-[12px] text-gray-500">{t("stats.potentialSavings")}</p>
                    </div>
                </div>
            </div>

            {/* Filters + Actions toolbar */}
            <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[14px] flex flex-wrap items-center justify-between gap-[12px]">
                {/* Category tabs */}
                <div className="flex items-center gap-[8px] flex-wrap">
                    {FAVOURITE_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-[14px] py-[6px] rounded-[20px] text-[13px] font-semibold transition-colors cursor-pointer ${
                                activeCategory === cat
                                    ? "bg-[#402F75] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {t(`filters.${cat}`)}
                        </button>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-[10px]">
                    <button
                        onClick={() => {}}
                        className="flex items-center gap-[7px] bg-[#FBBB14] text-white rounded-[30px] px-[16px] py-[8px] text-[13px] font-bold hover:bg-[#f0b000] transition-colors cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {t("actions.addAllToCart")}
                    </button>
                    <button
                        onClick={() => dispatch(clearFavourites())}
                        className="flex items-center gap-[7px] border border-red-200 text-red-500 rounded-[30px] px-[16px] py-[8px] text-[13px] font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                        </svg>
                        {t("actions.clearAll")}
                    </button>
                </div>
            </div>

            {/* Product grid */}
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-[60px] text-center gap-[12px]">
                    <p className="text-[16px] font-semibold text-gray-700">{t("empty.title")}</p>
                    <p className="text-[13px] text-gray-400">{t("empty.subtitle")}</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px]">
                    {filteredItems.map((item) => (
                        <FavouriteCard key={item.id} item={item} />
                    ))}
                </section>
            )}
        </div>
    );
}
