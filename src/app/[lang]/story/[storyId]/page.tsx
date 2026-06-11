"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { getStories, type StorySummaryResponse, type AppLanguage } from "@/features/story/services/story.api";
import StoryViewer from "@/features/story/components/StoryViewer";

export default function StoryDeepLinkPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation("home");
    const lang = (params?.lang as string) || "en";
    const storyId = params?.storyId as string;

    const [stories, setStories] = useState<StorySummaryResponse[] | null>(null);
    const [index, setIndex] = useState(-1);

    useEffect(() => {
        const upper = lang.toUpperCase();
        const apiLang: AppLanguage = upper === "AZ" || upper === "AR" ? (upper as AppLanguage) : "EN";
        getStories(apiLang)
            .then((data) => {
                setStories(data);
                setIndex(data.findIndex((s) => s.id === storyId));
            })
            .catch(() => {
                setStories([]);
                setIndex(-1);
            });
    }, [lang, storyId]);

    // Loading
    if (stories === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
        );
    }

    // Found → open the viewer on that story
    if (index >= 0 && stories[index]) {
        return (
            <StoryViewer
                stories={stories}
                initialIndex={index}
                onClose={() => router.push(`/${lang}`)}
            />
        );
    }

    // Not found / expired / deleted → "story is gone" (translated)
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#1a0f3c]">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
            </div>
            <h1 className="text-white text-2xl font-bold mb-2">
                {t("storyUnavailable.title", { defaultValue: "This story is no longer available" })}
            </h1>
            <p className="text-white/60 text-sm max-w-sm mb-8">
                {t("storyUnavailable.desc", { defaultValue: "It may have expired or been removed. Check out what's new instead." })}
            </p>
            <Link
                href={`/${lang}`}
                className="px-6 py-3 rounded-full text-sm font-bold text-[#1a0f40] bg-[#FBBB14] hover:bg-[#e5a800] transition-colors"
            >
                {t("storyUnavailable.cta", { defaultValue: "Go to homepage" })}
            </Link>
        </main>
    );
}
