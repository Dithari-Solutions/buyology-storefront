"use client";

import { useState } from "react";
import Image from "next/image";
import { Review, ReviewReply } from "../types";

// ── Sub-components ─────────────────────────────────────────────────────────────

function Avatar({ size = "md" }: { size?: "md" | "sm" }) {
    const dim = size === "md" ? "w-10 h-10" : "w-8 h-8";
    const icon = size === "md" ? 20 : 16;
    return (
        <div className={`${dim} rounded-full bg-[#EDE9FF] border border-purple-100 flex items-center justify-center flex-shrink-0`}>
            <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        </div>
    );
}

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
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "#402F75" : "none"} stroke={liked ? "#402F75" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
            </svg>
            {likes + (liked ? 1 : 0)}
        </button>
    );
}

function ReplyItem({ reply, likedIds, onToggle }: {
    reply: ReviewReply;
    likedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="flex gap-3">
            <Avatar size="sm" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{reply.author}</span>
                    <span className="text-xs text-gray-400">{reply.timeAgo}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{reply.content}</p>
                <div className="mt-2">
                    <LikeButton id={reply.id} likes={reply.likes} likedIds={likedIds} onToggle={onToggle} />
                </div>
            </div>
        </div>
    );
}

function ReviewItem({ review, likedIds, onToggle }: {
    review: Review;
    likedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            {/* Main comment */}
            <div className="flex gap-3">
                <Avatar size="md" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">{review.author}</span>
                        <span className="text-xs text-gray-400">{review.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>

                    {review.imageUrl && (
                        <div className="mt-3 w-[155px] h-[100px] rounded-xl overflow-hidden border border-gray-100">
                            <Image
                                src={review.imageUrl}
                                alt="Review attachment"
                                width={155}
                                height={100}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-2.5">
                        <LikeButton id={review.id} likes={review.likes} likedIds={likedIds} onToggle={onToggle} />
                        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 14 4 9 9 4" />
                                <path d="M20 20v-7a4 4 0 00-4-4H4" />
                            </svg>
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested replies */}
            {review.replies && review.replies.length > 0 && (
                <div className="ml-13 pl-0 flex flex-col gap-4" style={{ marginLeft: "52px" }}>
                    {review.replies.map((reply) => (
                        <ReplyItem key={reply.id} reply={reply} likedIds={likedIds} onToggle={onToggle} />
                    ))}
                </div>
            )}
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
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Customer Reviews & Questions</h2>
                <span className="w-6 h-6 rounded-full bg-[#402F75] text-white text-xs font-bold flex items-center justify-center">
                    {totalCount}
                </span>
            </div>

            {/* Comment input */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    rows={3}
                    className="w-full px-4 pt-4 pb-2 text-sm text-gray-700 placeholder-gray-400 resize-none outline-none bg-white"
                />
                <div className="flex items-center justify-between px-4 pb-3">
                    <button className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Add Photos
                    </button>
                    <button
                        disabled={!comment.trim()}
                        className="flex items-center gap-2 bg-[#FBBB14] text-gray-900 text-sm font-bold px-4 py-2 rounded-full hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Post Comment
                    </button>
                </div>
            </div>

            {/* Reviews list */}
            <div className="flex flex-col divide-y divide-gray-50 gap-0">
                {reviews.map((review, i) => (
                    <div key={review.id} className={i > 0 ? "pt-5" : ""} style={i > 0 ? { marginTop: 0 } : {}}>
                        {i > 0 && <div className="mb-5" />}
                        <ReviewItem review={review} likedIds={likedIds} onToggle={toggleLike} />
                    </div>
                ))}
            </div>

            {/* See more */}
            <div className="flex justify-end pt-1">
                <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    See more comments
                </button>
            </div>
        </div>
    );
}
