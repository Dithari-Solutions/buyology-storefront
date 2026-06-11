"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import type { AppDispatch, RootState } from "@/store";
import { fetchFavouritesThunk } from "@/features/favourites/store/favouritesSlice";
import { selectSelectedCountryCode, selectPreferredCurrency } from "@/features/country/store/countrySlice";
import FavouritesGuest from "@/features/favourites/components/FavouritesGuest";
import FavouritesGrid from "@/features/favourites/components/FavouritesGrid";

export default function FavouritesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.auth.userId);
    const countryCode = useSelector(selectSelectedCountryCode);
    const currency = useSelector(selectPreferredCurrency);

    // Re-fetch when the detected country/currency resolves or changes, so favourites
    // (prices + savings) are always loaded in that currency.
    useEffect(() => {
        if (userId) {
            dispatch(fetchFavouritesThunk(userId));
        }
    }, [userId, dispatch, countryCode, currency]);

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-[40px] flex flex-col gap-[24px] min-h-[60vh]">
                {!userId ? (
                    <FavouritesGuest />
                ) : (
                    <FavouritesGrid />
                )}
            </main>
            <Footer />
        </>
    );
}
