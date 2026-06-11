"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import {
    StorySummaryResponse,
    recordStoryView,
    likeStory,
    unlikeStory,
} from "../services/story.api";

interface StoryViewerProps {
    stories: StorySummaryResponse[];
    initialIndex: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
    const router = useRouter();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;

    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [liked, setLiked] = useState(stories[initialIndex]?.likedByMe ?? false);
    const [likeBusy, setLikeBusy] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [muted, setMuted] = useState(false);
    const viewedRef = useRef<Set<string>>(new Set());
    const videoRef = useRef<HTMLVideoElement>(null);

    // Press-and-hold to pause. `pausedRef` lets the running interval read the
    // latest value without re-creating (which would reset elapsed progress).
    const pausedRef = useRef(false);
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didHoldRef = useRef(false);

    // Entrance / exit animation state
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    const story = stories[currentStoryIndex];
    const mediaItems = [...story.media].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentMedia = mediaItems[currentMediaIndex];
    const isVideo = currentMedia?.mediaType === "VIDEO";

    // Trigger entrance animation after first paint
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 16);
        return () => clearTimeout(t);
    }, []);

    // Safety net for video: if the element already has data buffered by the time
    // this runs (events can fire before React attaches their listeners), reveal it
    // so it doesn't stay invisible behind the loading spinner.
    useEffect(() => {
        if (!isVideo) return;
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
            setImageLoaded(true);
        }
    }, [isVideo, currentStoryIndex, currentMediaIndex]);

    // Play with sound. The viewer opens from a tap (user gesture), so unmuted
    // playback is normally allowed; if the browser still blocks it, fall back to
    // muted so the video plays anyway — the user can unmute with the button.
    useEffect(() => {
        if (!isVideo) return;
        const v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.play().catch(() => {
            v.muted = true;
            setMuted(true);
            v.play().catch(() => {});
        });
    }, [isVideo, currentStoryIndex, currentMediaIndex]);

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
            const nextIndex = currentStoryIndex + 1;
            setCurrentStoryIndex(nextIndex);
            setCurrentMediaIndex(0);
            setLiked(stories[nextIndex]?.likedByMe ?? false);
            setImageLoaded(false);
            setProgress(0);
        } else {
            handleClose();
        }
    }, [currentMediaIndex, mediaItems.length, currentStoryIndex, stories, handleClose]);

    const goPrev = useCallback(() => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex((p) => p - 1);
            setImageLoaded(false);
            setProgress(0);
        } else if (currentStoryIndex > 0) {
            const prevIndex = currentStoryIndex - 1;
            const prevMediaLength = stories[prevIndex].media.length;
            setCurrentStoryIndex(prevIndex);
            setCurrentMediaIndex(prevMediaLength - 1);
            setLiked(stories[prevIndex]?.likedByMe ?? false);
            setImageLoaded(false);
            setProgress(0);
        }
    }, [currentMediaIndex, currentStoryIndex, stories]);

    // Record a view once per story per session
    useEffect(() => {
        const id = story?.id;
        if (!id || viewedRef.current.has(id)) return;
        viewedRef.current.add(id);
        recordStoryView(id)
            .catch(() => {
                // best-effort; allow retry next mount
                viewedRef.current.delete(id);
            });
    }, [story?.id]);

    const handleLike = useCallback(async () => {
        if (!isAuthenticated) {
            router.push(`/${lang}/${PATH_SLUGS.auth[lang]}?mode=signin`);
            return;
        }
        if (likeBusy || !story) return;
        setLikeBusy(true);
        const nextLiked = !liked;
        // optimistic
        setLiked(nextLiked);
        try {
            const res = nextLiked ? await likeStory(story.id) : await unlikeStory(story.id);
            setLiked(res.liked);
        } catch {
            // revert
            setLiked(!nextLiked);
        } finally {
            setLikeBusy(false);
        }
    }, [isAuthenticated, likeBusy, liked, story, router, lang]);

    // Auto-advance timer (images only — videos advance via onEnded and
    // report their own progress through onTimeUpdate)
    useEffect(() => {
        if (!imageLoaded || isVideo) return;
        const duration = 5000;
        const interval = 50;
        let elapsed = 0;
        const timer = setInterval(() => {
            if (pausedRef.current) return;
            elapsed += interval;
            setProgress((elapsed / duration) * 100);
            if (elapsed >= duration) {
                clearInterval(timer);
                goNext();
            }
        }, interval);
        return () => clearInterval(timer);
    }, [imageLoaded, isVideo, currentStoryIndex, currentMediaIndex, goNext]);

    // Press-and-hold handlers: holding pauses (image timer + video playback),
    // releasing resumes. A short tap doesn't trigger a hold so navigation works.
    const startHold = useCallback(() => {
        didHoldRef.current = false;
        holdTimerRef.current = setTimeout(() => {
            didHoldRef.current = true;
            pausedRef.current = true;
            videoRef.current?.pause();
        }, 200);
    }, []);

    const endHold = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (pausedRef.current) {
            pausedRef.current = false;
            videoRef.current?.play().catch(() => {});
        }
    }, []);

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
        // Share a deep link to THIS story, not the current page URL.
        const shareLang = window.location.pathname.split("/")[1] || "en";
        const url = `${window.location.origin}/${shareLang}/story/${story.id}`;
        const shareData = { title: story.title, url };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
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
                    {isVideo ? (
                        <video
                            key={`${currentStoryIndex}-${currentMediaIndex}`}
                            ref={videoRef}
                            src={currentMedia.url}
                            poster={currentMedia.thumbnailUrl ?? undefined}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                                opacity: imageLoaded ? 1 : 0,
                                transition: "opacity 0.35s ease",
                            }}
                            autoPlay
                            muted={muted}
                            playsInline
                            preload="auto"
                            // Reveal the video as soon as any of these fire. Relying on a
                            // single loadeddata event is fragile: with autoplay it can be
                            // missed (or fire before React attaches the listener), leaving
                            // the video stuck at opacity 0 behind the spinner forever.
                            onLoadedMetadata={() => setImageLoaded(true)}
                            onLoadedData={() => setImageLoaded(true)}
                            onCanPlay={() => setImageLoaded(true)}
                            onPlaying={() => setImageLoaded(true)}
                            // If the video can't load, don't spin forever — reveal/skip it.
                            onError={() => setImageLoaded(true)}
                            onTimeUpdate={() => {
                                const v = videoRef.current;
                                if (!v || !v.duration) return;
                                setProgress((v.currentTime / v.duration) * 100);
                            }}
                            onEnded={goNext}
                        />
                    ) : (
                        <Image
                            key={`${currentStoryIndex}-${currentMediaIndex}`}
                            src={currentMedia.url}
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
                    )}

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
                                    src={story.thumbnailUrl}
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

                    {/* Mute toggle (videos only) + Close button */}
                    <div className="flex items-center gap-2">
                        {isVideo && (
                            <button
                                onClick={() => {
                                    const next = !muted;
                                    setMuted(next);
                                    const v = videoRef.current;
                                    if (v) { v.muted = next; if (!next) v.play().catch(() => {}); }
                                }}
                                className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                                style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                                aria-label={muted ? "Unmute" : "Mute"}
                            >
                                {muted ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <line x1="23" y1="9" x2="17" y2="15" />
                                        <line x1="17" y1="9" x2="23" y2="15" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    </svg>
                                )}
                            </button>
                        )}
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
                </div>

                {/* ── Navigation tap zones (tap = navigate, hold = pause) ── */}
                <div className="absolute inset-0 flex z-[15]">
                    <div
                        className="w-1/3 h-full cursor-pointer"
                        onPointerDown={startHold}
                        onPointerUp={endHold}
                        onPointerLeave={endHold}
                        onPointerCancel={endHold}
                        onClick={() => { if (!didHoldRef.current) goPrev(); }}
                    />
                    <div
                        className="w-1/3 h-full"
                        onPointerDown={startHold}
                        onPointerUp={endHold}
                        onPointerLeave={endHold}
                        onPointerCancel={endHold}
                    />
                    <div
                        className="w-1/3 h-full cursor-pointer"
                        onPointerDown={startHold}
                        onPointerUp={endHold}
                        onPointerLeave={endHold}
                        onPointerCancel={endHold}
                        onClick={() => { if (!didHoldRef.current) goNext(); }}
                    />
                </div>

                {/* ── Bottom actions ── */}
                <div className="absolute bottom-6 inset-x-4 flex items-center justify-center z-20">
                    <div
                        className="flex items-center gap-4 px-4 py-1.5 rounded-full"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.12)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255,255,255,0.18)",
                        }}
                    >
                        {/* Like */}
                        <button
                            onClick={handleLike}
                            disabled={likeBusy}
                            className="flex items-center gap-1.5 hover:scale-110 transition-transform disabled:opacity-70"
                            style={{ color: liked ? "#FBBB14" : "white" }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill={liked ? "#FBBB14" : "none"}
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
                            <span className="text-[11px] font-medium text-white/80">
                                {liked ? "Liked" : "Like"}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 text-white hover:scale-110 transition-transform"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span className="text-[11px] font-medium text-white/80">Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
