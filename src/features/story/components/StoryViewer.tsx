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
    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [progress, setProgress] = useState(0);

    // Entrance / exit animation state
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    const story = stories[currentStoryIndex];
    const mediaItems = [...story.media].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentMedia = mediaItems[currentMediaIndex];

    // Trigger entrance animation after first paint
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 16);
        return () => clearTimeout(t);
    }, []);

    const handleClose = useCallback(() => {
        setClosing(true);
        setTimeout(onClose, 260);
    }, [onClose]);

    const goNext = useCallback(() => {
        if (currentMediaIndex < mediaItems.length - 1) {
            setCurrentMediaIndex((p) => p + 1);
            setImageLoaded(false);
            setProgress(0);
        } else if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex((p) => p + 1);
            setCurrentMediaIndex(0);
            setLiked(false);
            setImageLoaded(false);
            setProgress(0);
        } else {
            handleClose();
        }
    }, [currentMediaIndex, mediaItems.length, currentStoryIndex, stories.length, handleClose]);

    const goPrev = useCallback(() => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex((p) => p - 1);
            setImageLoaded(false);
            setProgress(0);
        } else if (currentStoryIndex > 0) {
            const prevMediaLength = stories[currentStoryIndex - 1].media.length;
            setCurrentStoryIndex((p) => p - 1);
            setCurrentMediaIndex(prevMediaLength - 1);
            setLiked(false);
            setImageLoaded(false);
            setProgress(0);
        }
    }, [currentMediaIndex, currentStoryIndex, stories]);

    // Auto-advance timer
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
    }, [imageLoaded, currentStoryIndex, currentMediaIndex, goNext]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [handleClose, goNext, goPrev]);

    const handleShare = async () => {
        const shareData = { title: story.title, url: window.location.href };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(window.location.href);
        }
    };

    const isEntered = visible && !closing;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
                transition: "opacity 0.26s ease-out",
                opacity: isEntered ? 1 : 0,
            }}
        >
            {/* Blurred dark backdrop — click to close */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
                onClick={handleClose}
            />

            {/* Story panel — phone-frame on desktop, full-screen on mobile */}
            <div
                className="relative w-full h-full md:w-[420px] md:h-[88vh] md:max-h-[860px] md:rounded-[32px] overflow-hidden shadow-2xl"
                style={{
                    transform: isEntered ? "scale(1) translateY(0)" : "scale(0.88) translateY(24px)",
                    transition: "transform 0.3s cubic-bezier(0.34,1.2,0.64,1)",
                    backgroundColor: "#000",
                }}
            >
                {/* ── Media ── */}
                <div className="absolute inset-0">
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div
                                className="w-10 h-10 rounded-full animate-spin"
                                style={{ border: "3px solid rgba(255,255,255,0.25)", borderTopColor: "#fff" }}
                            />
                        </div>
                    )}
                    <Image
                        key={`${currentStoryIndex}-${currentMediaIndex}`}
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${currentMedia.url}`}
                        alt={story.title}
                        fill
                        className="object-cover"
                        style={{
                            opacity: imageLoaded ? 1 : 0,
                            transition: "opacity 0.35s ease",
                        }}
                        unoptimized
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Bottom gradient overlay */}
                    <div
                        className="absolute inset-x-0 bottom-0 h-[45%] z-10"
                        style={{
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                        }}
                    />
                    {/* Top gradient overlay */}
                    <div
                        className="absolute inset-x-0 top-0 h-[28%] z-10"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
                        }}
                    />
                </div>

                {/* ── Progress bars ── */}
                <div className="absolute top-3 inset-x-3 flex gap-[3px] z-20">
                    {mediaItems.map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 h-[2.5px] rounded-full overflow-hidden"
                            style={{ backgroundColor: "rgba(255,255,255,0.28)" }}
                        >
                            <div
                                className="h-full rounded-full"
                                style={{
                                    backgroundColor: "#fff",
                                    width:
                                        i < currentMediaIndex
                                            ? "100%"
                                            : i === currentMediaIndex
                                            ? `${progress}%`
                                            : "0%",
                                    transition: "width 0.07s linear",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* ── Header ── */}
                <div className="absolute top-7 inset-x-3 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2.5">
                        {/* Mini avatar with gradient ring */}
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: "conic-gradient(from 0deg, #FBBB14, #9D95B8, #402F75, #FBBB14)",
                                    animation: "spin 5s linear infinite",
                                }}
                            />
                            <div
                                className="absolute rounded-full overflow-hidden z-10"
                                style={{ inset: "2px" }}
                            >
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${story.thumbnailUrl}`}
                                    alt={story.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-[13px] leading-tight">
                                {story.title}
                            </p>
                            <p className="text-white/50 text-[11px] leading-tight">
                                {currentMediaIndex + 1} / {mediaItems.length}
                            </p>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ── Navigation tap zones ── */}
                <div className="absolute inset-0 flex z-[15] pointer-events-none">
                    <div
                        className="w-1/3 h-full cursor-pointer pointer-events-auto"
                        onClick={goPrev}
                    />
                    <div className="w-1/3 h-full" />
                    <div
                        className="w-1/3 h-full cursor-pointer pointer-events-auto"
                        onClick={goNext}
                    />
                </div>

                {/* ── Bottom actions ── */}
                <div className="absolute bottom-6 inset-x-4 flex items-center justify-center z-20">
                    <div
                        className="flex items-center gap-6 px-8 py-3 rounded-full"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.12)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255,255,255,0.18)",
                        }}
                    >
                        {/* Like */}
                        <button
                            onClick={() => setLiked((p) => !p)}
                            className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                            style={{ color: liked ? "#ef4444" : "white" }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill={liked ? "#ef4444" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    transform: liked ? "scale(1.25)" : "scale(1)",
                                    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                                }}
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-[10px] font-medium text-white/80">
                                {liked ? "Liked" : "Like"}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-7" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span className="text-[10px] font-medium text-white/80">Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
