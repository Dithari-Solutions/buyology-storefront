"use client";

import { useState } from "react";
import Image from "next/image";
import { Review, ReviewReply } from "../types";

// ── Star display ───────────────────────────────────────────────────────────────

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={rating >= s ? "#FBBB14" : "#E5E7EB"} stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
            ))}
        </div>
    );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "sm" }) {
    const dim = size === "md" ? "w-9 h-9" : "w-7 h-7";
    const textSize = size === "md" ? "text-sm" : "text-xs";
    const initial = name.charAt(0).toUpperCase();
    const colors = ["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-orange-100 text-orange-700"];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div className={`${dim} rounded-full ${color} flex items-center justify-center flex-shrink-0 font-bold ${textSize}`}>
            {initial}
        </div>
    );
}

// ── Like button ────────────────────────────────────────────────────────────────

function LikeButton({ id, likes, likedIds, onToggle }: {
    id: string;
    likes: number;
    likedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    const liked = likedIds.has(id);
    return (
        <button
            onClick={() => onToggle(id)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? "text-[#402F75]" : "text-gray-400 hover:text-gray-600"}`}
        >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "#402F75" : "none"} stroke={liked ? "#402F75" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
            </svg>
            {likes + (liked ? 1 : 0)}
        </button>
    );
}

// ── Reply item ─────────────────────────────────────────────────────────────────

function ReplyItem({ reply, likedIds, onToggle }: {
    reply: ReviewReply;
    likedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="flex gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <Avatar name={reply.author} size="sm" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-gray-900">{reply.author}</span>
                    <span className="text-[11px] text-gray-400">{reply.timeAgo}</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">{reply.content}</p>
                <div className="mt-2">
                    <LikeButton id={reply.id} likes={reply.likes} likedIds={likedIds} onToggle={onToggle} />
                </div>
            </div>
        </div>
    );
}

// ── Review item ────────────────────────────────────────────────────────────────

function ReviewItem({ review, likedIds, onToggle }: {
    review: Review;
    likedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-5">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Avatar name={review.author} size="md" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-900">{review.author}</span>
                        <span className="text-[11px] text-gray-400">{review.timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={5} />
                        <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified Purchase</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <p className="text-[14px] text-gray-600 leading-relaxed">{review.content}</p>

            {review.imageUrl && (
                <div className="w-[140px] h-[90px] rounded-xl overflow-hidden border border-gray-100">
                    <Image
                        src={review.imageUrl}
                        alt="Review attachment"
                        width={140}
                        height={90}
                        className="object-cover w-full h-full"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
                <LikeButton id={review.id} likes={review.likes} likedIds={likedIds} onToggle={onToggle} />
                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4" />
                        <path d="M20 20v-7a4 4 0 00-4-4H4" />
                    </svg>
                    Reply
                </button>
            </div>

            {/* Replies */}
            {review.replies && review.replies.length > 0 && (
                <div className="flex flex-col gap-2 pl-1">
                    {review.replies.map((reply) => (
                        <ReplyItem key={reply.id} reply={reply} likedIds={likedIds} onToggle={onToggle} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Rating summary ─────────────────────────────────────────────────────────────

function RatingSummary({ total }: { total: number }) {
    const avg = 4.8;
    const bars = [
        { stars: 5, pct: 72 },
        { stars: 4, pct: 18 },
        { stars: 3, pct: 6 },
        { stars: 2, pct: 2 },
        { stars: 1, pct: 2 },
    ];
    return (
        <div className="flex items-center gap-8 bg-[#F8F7FF] rounded-2xl p-5 border border-[#EDE9FF]">
            {/* Score */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <span className="text-5xl font-extrabold text-gray-900 leading-none">{avg}</span>
                <Stars rating={avg} size={14} />
                <span className="text-[12px] text-gray-400 mt-0.5">{total} reviews</span>
            </div>
            {/* Bars */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                {bars.map(({ stars, pct }) => (
                    <div key={stars} className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-500 w-3 flex-shrink-0">{stars}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#FBBB14" stroke="none" className="flex-shrink-0">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#FBBB14] rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-gray-400 w-7 text-right flex-shrink-0">{pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface ProductReviewsProps {
    reviews: Review[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
    const [comment, setComment] = useState("");
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    const toggleLike = (id: string) => {
        setLikedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const totalCount = reviews.reduce(
        (sum, r) => sum + 1 + (r.replies?.length ?? 0),
        0
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                <span className="w-7 h-7 rounded-full bg-[#402F75] text-white text-xs font-bold flex items-center justify-center">
                    {totalCount}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Rating summary */}
            <RatingSummary total={totalCount} />

            {/* Comment input */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    rows={3}
                    className="w-full px-5 pt-4 pb-2 text-sm text-gray-700 placeholder-gray-400 resize-none outline-none bg-transparent"
                />
                <div className="flex items-center justify-between px-4 pb-3.5 border-t border-gray-100 pt-2.5">
                    <button className="flex items-center gap-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Add Photo
                    </button>
                    <button
                        disabled={!comment.trim()}
                        className="flex items-center gap-2 bg-[#402F75] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#362867] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Post Review
                    </button>
                </div>
            </div>

            {/* Reviews list */}
            <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} likedIds={likedIds} onToggle={toggleLike} />
                ))}
            </div>

            {/* See more */}
            <div className="flex justify-center">
                <button className="text-sm font-semibold text-[#402F75] border border-[#402F75]/20 bg-[#F3F0FF] hover:bg-[#EDE9FF] px-6 py-2.5 rounded-full transition-colors">
                    Load more reviews
                </button>
            </div>
        </div>
    );
}
