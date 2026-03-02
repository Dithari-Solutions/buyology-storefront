"use client";

import { useState } from "react";
import Image from "next/image";
import { useStories } from "../hooks/useStories";
import StoryViewer from "./StoryViewer";
import type { StorySummaryResponse } from "../services/story.api";

function StoryItem({
    story,
    onClick,
}: {
    story: StorySummaryResponse;
    onClick: () => void;
}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <div
            className="flex flex-col items-center flex-shrink-0 cursor-pointer select-none"
            style={{
                transform: pressed
                    ? "scale(0.88)"
                    : hovered
                    ? "scale(1.08)"
                    : "scale(1)",
                transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
        >
            {/* Ring + image container */}
            <div className="relative w-[70px] h-[70px] md:w-[88px] md:h-[88px]">

                {/* Conic gradient ring — always softly spinning, faster on hover */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background:
                            "conic-gradient(from 0deg, #FBBB14 0%, #FDE39F 18%, #d4ccff 40%, #9D95B8 62%, #402F75 82%, #FBBB14 100%)",
                        animation: hovered
                            ? "spin 2.5s linear infinite"
                            : "spin 8s linear infinite",
                        opacity: hovered ? 1 : 0.82,
                        transition: "opacity 0.3s, animation-duration 0.3s",
                    }}
                />

                {/* White separator gap (does NOT rotate) */}
                <div
                    className="absolute rounded-full z-10"
                    style={{ inset: "3px", backgroundColor: "#F7F7F7" }}
                />

                {/* Thumbnail (does NOT rotate) */}
                <div
                    className="absolute rounded-full overflow-hidden z-20 bg-gray-100"
                    style={{ inset: "5px" }}
                >
                    {!imageLoaded && (
                        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
                    )}
                    <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${story.thumbnailUrl}`}
                        alt={story.title}
                        fill
                        className={`object-cover transition-opacity duration-300 ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        unoptimized
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            </div>

            {/* Title */}
            <p className="mt-2 text-[11px] md:text-[12px] text-center font-semibold text-gray-600 w-[70px] md:w-[88px] truncate">
                {story.title}
            </p>
        </div>
    );
}

function SkeletonItem() {
    return (
        <div className="flex flex-col items-center flex-shrink-0 animate-pulse gap-2">
            <div className="w-[70px] h-[70px] md:w-[88px] md:h-[88px] rounded-full bg-gray-200" />
            <div className="w-[44px] h-[9px] rounded-full bg-gray-200" />
        </div>
    );
}

export default function Stories() {
    const { stories, loading } = useStories("EN");
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    if (loading) {
        return (
            <section
                className="w-[95%] md:w-[90%] flex items-center gap-5 overflow-x-auto py-5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonItem key={i} />
                ))}
            </section>
        );
    }

    if (!stories.length) return null;

    return (
        <>
            <section
                className="w-[95%] md:w-[90%] flex items-center gap-5 overflow-x-auto py-5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {stories.map((story, i) => (
                    <StoryItem
                        key={story.id}
                        story={story}
                        onClick={() => setViewerIndex(i)}
                    />
                ))}
            </section>

            {viewerIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                />
            )}
        </>
    );
}
