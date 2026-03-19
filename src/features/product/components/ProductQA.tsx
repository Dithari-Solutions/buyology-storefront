"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import type { RootState } from "@/store";
import {
  getProductQuestions,
  askQuestion,
  voteQuestion,
  type QuestionResponse,
} from "../services/qaService";

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

function Avatar({ name }: { name: string }) {
  return (
    <div className={`w-9 h-9 rounded-full ${getAvatarColor(name)} flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
      {name.charAt(0).toUpperCase()}
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
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

// ── Question Item ───────────────────────────────────────────────────────────────

function QuestionItem({
  question,
  isAuthenticated,
  hasVoted,
  onVote,
  onLoginRequired,
  t,
}: {
  question: QuestionResponse;
  isAuthenticated: boolean;
  hasVoted: boolean;
  onVote: (questionId: string) => void;
  onLoginRequired: () => void;
  t: (key: string) => string;
}) {
  const fullName = `${question.userFirstName} ${question.userLastName}`.trim();

  function handleVote() {
    if (!isAuthenticated) { onLoginRequired(); return; }
    onVote(question.id);
  }

  return (
    <div className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-5">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <Avatar name={fullName || "?"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-gray-900">{fullName}</span>
            <span className="text-[11px] text-gray-400">{formatDate(question.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-[11px] text-gray-400">Question</span>
          </div>
        </div>
      </div>

      {/* Question body */}
      <p className="text-[14px] text-gray-800 font-medium leading-relaxed">{question.body}</p>

      {/* Admin answer */}
      {question.answer ? (
        <div className="bg-[#F8F7FF] border border-[#EDE9FF] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-[#402F75] flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[12px] font-bold text-[#402F75]">{t("qa.adminAnswer")}</span>
            <span className="text-[11px] text-gray-400 ms-auto">{formatDate(question.answer.createdAt)}</span>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">{question.answer.body}</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[12px] text-gray-400 italic">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t("qa.pendingAnswer")}
        </div>
      )}

      {/* Helpful vote */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <button
          onClick={handleVote}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            hasVoted
              ? "text-[#402F75] cursor-default"
              : "text-gray-400 hover:text-[#402F75]"
          }`}
          disabled={hasVoted}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={hasVoted ? "#402F75" : "none"}
            stroke={hasVoted ? "#402F75" : "currentColor"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
          {t("qa.helpful")} ({question.helpfulCount + (hasVoted ? 1 : 0)})
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

interface ProductQAProps {
  productId: string;
}

export default function ProductQA({ productId }: ProductQAProps) {
  const { t } = useTranslation("product");
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = useSelector((state: RootState) => state.auth.userId);

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Voted question IDs (local tracking)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Login gate
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch initial data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getProductQuestions(productId, 0, PAGE_SIZE);
        if (!cancelled) {
          setQuestions(data);
          setHasMore(data.length === PAGE_SIZE);
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
      const more = await getProductQuestions(productId, nextPage, PAGE_SIZE);
      setQuestions((prev) => [...prev, ...more]);
      setPage(nextPage);
      setHasMore(more.length === PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [productId, page, hasMore, loadingMore]);

  function requireLogin() {
    setShowLoginModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) { requireLogin(); return; }
    if (!userId || !questionText.trim()) return;
    setSubmitting(true);
    try {
      await askQuestion({ productId, userId, body: questionText.trim() });
      setSubmitSuccess(true);
      setQuestionText("");
    } catch {
      // ignore — user can retry
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(questionId: string) {
    if (!userId || votedIds.has(questionId)) return;
    try {
      await voteQuestion(questionId, userId);
      setVotedIds((prev) => new Set([...prev, questionId]));
    } catch {
      // 409 = already voted; ignore
    }
  }

  const navigateToAuth = () => {
    setShowLoginModal(false);
    router.push(`/${lang}/auth`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">{t("qa.title")}</h2>
        <span className="w-7 h-7 rounded-full bg-[#FBBB14] text-gray-900 text-xs font-bold flex items-center justify-center">
          {questions.length}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Ask a question form */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">{t("qa.askQuestion")}</h3>

          {submitSuccess ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{t("qa.successMsg")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onFocus={() => { if (!isAuthenticated) requireLogin(); }}
                placeholder={t("qa.questionPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl outline-none focus:border-[#402F75]/40 focus:ring-2 focus:ring-[#402F75]/10 transition-all resize-none bg-transparent"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !questionText.trim()}
                  className="flex items-center gap-2 bg-[#402F75] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-[#362867] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      {t("qa.submitting")}
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {t("qa.submitQuestion")}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/5" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">{t("qa.noQuestions")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              isAuthenticated={isAuthenticated}
              hasVoted={votedIds.has(q.id)}
              onVote={handleVote}
              onLoginRequired={requireLogin}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && questions.length > 0 && (
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
            {t("qa.loadMore")}
          </button>
        </div>
      )}

      {/* Login gate modal */}
      {showLoginModal && (
        <LoginGateModal
          title={t("qa.loginTitle")}
          desc={t("qa.loginDesc")}
          signInLabel={t("qa.signIn")}
          createAccountLabel={t("qa.createAccount")}
          onSignIn={navigateToAuth}
          onCreateAccount={navigateToAuth}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
