"use client";

import { useState } from "react";
// import Image from "next/image";
// import Story from "@/assets/story/story.svg";
import { useStories } from "../hooks/useStories";
import StoryViewer from "./StoryViewer";

function StoryItem({ story, onClick }: { story: { thumbnailUrl: string; title: string }; onClick: () => void }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={onClick}>
            <div className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] p-1 rounded-full bg-[linear-gradient(135deg,#FBBB14,#FDE39F,#DFDFDF,#9D95B8,#402F75)] flex items-center justify-center">
                <div className="w-[62px] h-[62px] md:w-[90px] md:h-[90px] p-1 rounded-full bg-white flex items-center justify-center relative">
                    {!imageLoaded && (
                        <div className="absolute inset-1 rounded-full bg-gray-200 animate-pulse" />
                    )}
                    <img
                        src={`http://5.189.132.250:8080${story.thumbnailUrl}`}
                        alt={story.title}
                        width={90}
                        height={90}
                        className={`w-[55px] h-[55px] md:w-[82px] md:h-[82px] rounded-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                        // unoptimized
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            </div>
            <p className="text-[12px] md:text-[16px] mt-1 text-center font-bold">{story.title}</p>
        </div>
    );
}

export default function Stories() {
    const { stories, loading, error } = useStories("EN");
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    if (loading) {
        return (
            <section className="w-[95%] md:w-[80%] flex items-center gap-4 md:justify-between overflow-x-auto py-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                        <div className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-full bg-gray-200" />
                        <div className="w-[40px] md:w-[60px] h-3 md:h-4 mt-1 rounded bg-gray-200" />
                    </div>
                ))}
            </section>
        );
    }

    return (
        <>
            <section className="w-[95%] md:w-[80%] flex items-center gap-4 md:justify-between overflow-x-auto py-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {stories.map((story, i) => (
                    <StoryItem key={i} story={story} onClick={() => setViewerIndex(i)} />
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
