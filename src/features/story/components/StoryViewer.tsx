"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { StorySummaryResponse } from "../services/story.api";

interface StoryViewerProps {
    stories: StorySummaryResponse[];
    initialIndex: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [liked, setLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [progress, setProgress] = useState(0);

    const story = stories[currentIndex];

    const goNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setLiked(false);
            setImageLoaded(false);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setLiked(false);
            setImageLoaded(false);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        if (!imageLoaded) return;

        const duration = 5000;
        const interval = 50;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            setProgress((elapsed / duration) * 100);
            if (elapsed >= duration) {
                clearInterval(timer);
                goNext();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [imageLoaded, currentIndex, goNext]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, goNext, goPrev]);

    const handleShare = async () => {
        const shareData = {
            title: story.title,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled share
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                {stories.map((_, i) => (
                    <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                            style={{
                                width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${story.thumbnailUrl}`}
                            alt={story.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                        />
                    </div>
                    <span className="text-white font-semibold text-sm">{story.title}</span>
                </div>
                <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Navigation areas */}
            <div className="absolute inset-0 flex z-[5]">
                <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
                <div className="w-1/3 h-full" />
                <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
            </div>

            {/* Story media */}
            <div className="w-full h-full flex items-center justify-center">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <Image
                    src={`http://5.189.132.250:8080${story.thumbnailUrl}`}
                    alt={story.title}
                    fill
                    className={`object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    unoptimized
                    onLoad={() => setImageLoaded(true)}
                />
            </div>

            {/* Bottom actions */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 z-10">
                <button
                    onClick={() => setLiked(!liked)}
                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill={liked ? "#ef4444" : "none"}
                        stroke={liked ? "#ef4444" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-xs">{liked ? "Liked" : "Like"}</span>
                </button>

                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span className="text-xs">Share</span>
                </button>
            </div>
        </div>
    );
}
