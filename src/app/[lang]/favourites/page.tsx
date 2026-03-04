"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import { selectFavouriteItems } from "@/features/favourites/store/favouritesSlice";
import FavouritesGuest from "@/features/favourites/components/FavouritesGuest";
import FavouritesGrid from "@/features/favourites/components/FavouritesGrid";

export default function FavouritesPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    const items = useSelector(selectFavouriteItems);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("accessToken"));
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-[40px] flex flex-col gap-[24px] min-h-[60vh]">
                {!isLoggedIn ? (
                    <FavouritesGuest />
                ) : (
                    <FavouritesGrid />
                )}
            </main>
            <Footer />
        </>
    );
}
