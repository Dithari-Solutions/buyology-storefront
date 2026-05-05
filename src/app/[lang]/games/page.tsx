import React from "react";
import GamesPage from "@/features/games/components/GamesPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("games", { canonical: "games" });

export default function Page() {
    return <GamesPage />;
}
