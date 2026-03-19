"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import type { RootState } from "@/store";
import {
  getProductReviews,
  getReviewStats,
  submitReview,
  voteReview,
  type ReviewResponse,
  type ReviewStats,
} from "../services/reviewService";
import { validateReviewBody, getHighlightedSegments, type BodyValidationResult } from "../validation";

const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-rose-100 text-rose-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "sm" }) {
  const dim = size === "md" ? "w-9 h-9" : "w-7 h-7";
  const textSize = size === "md" ? "text-sm" : "text-xs";
  return (
    <div className={`${dim} rounded-full ${getAvatarColor(name)} flex items-center justify-center flex-shrink-0 font-bold ${textSize}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = rating >= s;
        const partial = !filled && rating > s - 1;
        const pct = partial ? Math.round((rating - (s - 1)) * 100) : 0;
        return (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={`rev-star-${s}-${rating}`} x1="0" x2="1" y2="0">
                <stop offset={`${filled ? 100 : pct}%`} stopColor="#FBBB14" />
                <stop offset={`${filled ? 100 : pct}%`} stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={`url(#rev-star-${s}-${rating})`}
            />
          </svg>
        );
      })}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill={active >= s ? "#FBBB14" : "#E5E7EB"} stroke="none">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Login Gate Modal ────────────────────────────────────────────────────────────

function LoginGateModal({
  title,
  desc,
  signInLabel,
  createAccountLabel,
  onSignIn,
  onCreateAccount,
  onClose,
}: {
  title: string;
  desc: string;
  signInLabel: string;
  createAccountLabel: string;
  onSignIn: () => void;
  onCreateAccount: () => void;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] py-10 px-8 w-full max-w-sm shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-[#F3F0FF] flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="font-bold text-[22px] text-gray-900 mb-3 text-center leading-snug">{title}</h2>
        <p className="text-gray-500 text-[13px] text-center mb-7 max-w-[260px] leading-relaxed">{desc}</p>
        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="w-full py-[13px] rounded-[30px] bg-[#402F75] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#352566] active:scale-[0.98] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {signInLabel}
          </button>
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full py-[13px] rounded-[30px] bg-[#FBBB14] text-gray-900 font-bold text-[15px] hover:brightness-95 active:scale-[0.98] transition-all"
          >
            {createAccountLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Rating Summary ──────────────────────────────────────────────────────────────

function RatingSummary({ stats }: { stats: ReviewStats }) {
  const avg = parseFloat(stats.averageRating);
  const total = stats.totalReviews;
  const bars = [5, 4, 3, 2, 1].map((n) => {
    const count = stats[`rating${n}Count` as keyof ReviewStats] as number;
    return { stars: n, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
  });

  return (
    <div className="flex items-center gap-8 bg-[#F8F7FF] rounded-2xl p-5 border border-[#EDE9FF]">
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-5xl font-extrabold text-gray-900 leading-none">
          {isNaN(avg) ? "0.0" : avg.toFixed(1)}
        </span>
        <Stars rating={isNaN(avg) ? 0 : avg} size={14} />
        <span className="text-[12px] text-gray-400 mt-0.5">{total} reviews</span>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {bars.map(({ stars, pct, count }) => (
          <div key={stars} className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 w-3 flex-shrink-0">{stars}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FBBB14" className="flex-shrink-0">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#FBBB14] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-400 w-7 text-right flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Item ─────────────────────────────────────────────────────────────────

function ReviewItem({
  review,
  authCredentialId,
  isAuthenticated,
  onVote,
  onLoginRequired,
  t,
}: {
  review: ReviewResponse;
  authCredentialId: string | null;
  isAuthenticated: boolean;
  onVote: (reviewId: string, isHelpful: boolean) => void;
  onLoginRequired: () => void;
  t: (key: string) => string;
}) {
  const fullName = `${review.userFirstName} ${review.userLastName}`.trim();

  function handleVote(isHelpful: boolean) {
    if (!isAuthenticated) { onLoginRequired(); return; }
    onVote(review.id, isHelpful);
  }

  return (
    <div className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar name={fullName || "?"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-gray-900">{fullName}</span>
            <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Stars rating={review.rating} />
            {review.isVerifiedPurchase && (
              <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {t("reviews.verifiedPurchase")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      {review.body && (
        <p className="text-[14px] text-gray-600 leading-relaxed">{review.body}</p>
      )}

      {/* Media */}
      {review.media.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.media.map((m) => (
            <div key={m.id} className="w-[100px] h-[75px] rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
              {m.mediaType === "IMAGE" ? (
                <Image src={m.url} alt="Review image" width={100} height={75} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helpful/Not helpful */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <button
          onClick={() => handleVote(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#402F75] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
          {t("reviews.helpful")} ({review.helpfulCount})
        </button>
        <button
          onClick={() => handleVote(false)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
          {t("reviews.notHelpful")} ({review.notHelpfulCount})
        </button>
      </div>

      {/* Admin reply */}
      {review.reply && (
        <div className="bg-[#F8F7FF] border border-[#EDE9FF] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-[#402F75] flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[12px] font-bold text-[#402F75]">{t("reviews.adminReply")}</span>
            <span className="text-[11px] text-gray-400 ms-auto">{formatDate(review.reply.createdAt)}</span>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">{review.reply.body}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useTranslation("product");
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // state.auth.userId holds the JWT sub claim, which equals authCredentialId for the API
  const authCredentialId = useSelector((state: RootState) => state.auth.userId);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<BodyValidationResult | null>(null);

  // Login gate
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [reviewData, statsData] = await Promise.all([
          getProductReviews(productId, 0, PAGE_SIZE),
          getReviewStats(productId),
        ]);
        if (!cancelled) {
          setReviews(reviewData);
          setStats(statsData);
          setHasMore(reviewData.length === PAGE_SIZE);
          setPage(0);
        }
      } catch {
        // silently handle — show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [productId]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const more = await getProductReviews(productId, nextPage, PAGE_SIZE);
      setReviews((prev) => [...prev, ...more]);
      setPage(nextPage);
      setHasMore(more.length === PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [productId, page, hasMore, loadingMore]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const combined = [...selectedFiles, ...files].slice(0, 2); // API max: 2 images
    setSelectedFiles(combined);
    const urls = combined.map((f) => URL.createObjectURL(f));
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(urls);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePreview(index: number) {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function requireLogin() {
    setShowLoginModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) { requireLogin(); return; }
    if (!authCredentialId || rating === 0) return;

    // Client-side validation of the review body
    const validation = validateReviewBody(body);
    if (!validation.valid) {
      setBodyError(validation);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setBodyError(null);
    try {
      await submitReview({
        productId,
        authCredentialId,
        rating,
        body: body.trim() || undefined,
        images: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      setSubmitSuccess(true);
      setRating(0);
      setBody("");
      setSelectedFiles([]);
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls([]);
    } catch (err: unknown) {
      // Server-side 400 mirrors client validation — show the same inline error
      const status = (err as { status?: number })?.status;
      if (status === 400) {
        setBodyError({ valid: false, type: "invalid" });
      } else {
        setSubmitError(t("reviews.errorMsg"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(reviewId: string, isHelpful: boolean) {
    if (!authCredentialId) return;
    try {
      await voteReview(reviewId, authCredentialId, isHelpful);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpfulCount: isHelpful ? r.helpfulCount + 1 : r.helpfulCount,
                notHelpfulCount: !isHelpful ? r.notHelpfulCount + 1 : r.notHelpfulCount,
              }
            : r
        )
      );
    } catch {
      // 409 = already voted; ignore
    }
  }

  const navigateToAuth = () => {
    setShowLoginModal(false);
    router.push(`/${lang}/auth`);
  };

  const totalCount = stats?.totalReviews ?? reviews.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">{t("reviews.title")}</h2>
        <span className="w-7 h-7 rounded-full bg-[#402F75] text-white text-xs font-bold flex items-center justify-center">
          {totalCount}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Rating summary */}
      {stats && !loading && <RatingSummary stats={stats} />}

      {/* Write review form */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">{t("reviews.writeReview")}</h3>

          {submitSuccess ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{t("reviews.successMsg")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Star selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{t("reviews.ratingLabel")}</span>
                <StarInput value={rating} onChange={setRating} />
              </div>

              {/* Body with real-time bad-word highlight overlay */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  {/* Backdrop: same geometry as textarea; renders highlighted text behind it */}
                  <div
                    ref={backdropRef}
                    aria-hidden="true"
                    className="absolute inset-0 px-4 py-3 rounded-xl overflow-hidden pointer-events-none whitespace-pre-wrap break-words"
                    style={{
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                      color: "transparent",
                    }}
                  >
                    {getHighlightedSegments(body).map((seg, i) =>
                      seg.highlight ? (
                        <mark key={i} style={{ background: "#fecaca", color: "transparent", borderRadius: "2px" }}>
                          {seg.text}
                        </mark>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      )
                    )}
                    {/* trailing space keeps last-line height intact */}
                    {" "}
                  </div>

                  {/* Actual textarea — bg-transparent so backdrop shows through */}
                  <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={(e) => { setBody(e.target.value); if (bodyError) setBodyError(null); }}
                    onFocus={() => { if (!isAuthenticated) requireLogin(); }}
                    onScroll={() => {
                      if (backdropRef.current && textareaRef.current) {
                        backdropRef.current.scrollTop = textareaRef.current.scrollTop;
                      }
                    }}
                    placeholder={t("reviews.bodyPlaceholder")}
                    rows={3}
                    style={{ lineHeight: "1.5" }}
                    className={`relative w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 border rounded-xl outline-none focus:ring-2 transition-all resize-none bg-transparent ${
                      bodyError && !bodyError.valid
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-[#402F75]/40 focus:ring-[#402F75]/10"
                    }`}
                  />
                </div>

                {/* Inline body validation error */}
                {bodyError && !bodyError.valid && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-red-600 font-medium">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {bodyError.type === "profanity" ? (
                      <>
                        <span>{t("reviews.errorProfanity")}</span>
                        {bodyError.words.map((w) => (
                          <span key={w} className="inline-block bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                            {w}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span>{t("reviews.errorInvalid")}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Image previews */}
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative w-[72px] h-[54px] rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image src={url} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute top-0.5 end-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] leading-none hover:bg-black/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    disabled={selectedFiles.length >= 2}
                    onClick={() => {
                      if (!isAuthenticated) { requireLogin(); return; }
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {t("reviews.addPhoto")} ({selectedFiles.length}/2)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting || rating === 0 || !body.trim()}
                  className="flex items-center gap-2 bg-[#402F75] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-[#362867] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      {t("reviews.submitting")}
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      {t("reviews.submitReview")}
                    </>
                  )}
                </button>
              </div>

              {submitError && (
                <p className="text-xs text-red-500 font-medium">{submitError}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">{t("reviews.noReviews")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              authCredentialId={authCredentialId}
              isAuthenticated={isAuthenticated}
              onVote={handleVote}
              onLoginRequired={requireLogin}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && reviews.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 text-sm font-semibold text-[#402F75] border border-[#402F75]/20 bg-[#F3F0FF] hover:bg-[#EDE9FF] px-6 py-2.5 rounded-full transition-colors disabled:opacity-60"
          >
            {loadingMore && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            )}
            {t("reviews.loadMore")}
          </button>
        </div>
      )}

      {/* Login gate modal */}
      {showLoginModal && (
        <LoginGateModal
          title={t("reviews.loginTitle")}
          desc={t("reviews.loginDesc")}
          signInLabel={t("reviews.signIn")}
          createAccountLabel={t("reviews.createAccount")}
          onSignIn={navigateToAuth}
          onCreateAccount={navigateToAuth}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
