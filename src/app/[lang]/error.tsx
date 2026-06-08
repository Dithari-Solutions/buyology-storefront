"use client";

// Route-segment error boundary for the [lang] tree. Catches render/data errors
// in any page below it and shows a recoverable fallback instead of Next's raw
// error screen. Kept dependency-light (no i18n/redux) so it renders even when
// app providers themselves are what failed.
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the browser console / any error-tracking hook.
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F7F7F7" }}
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "#EDE9FF" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Something went wrong</h1>
      <p className="text-gray-500 max-w-md text-sm md:text-base mb-8 leading-relaxed">
        An unexpected error occurred while loading this page. You can try again, or head back to the homepage.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#402F75" }}
        >
          Try again
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FBBB14", color: "#402F75" }}
        >
          Go home
        </a>
      </div>
      {error?.digest ? (
        <p className="text-[11px] text-gray-400 mt-8">Reference: {error.digest}</p>
      ) : null}
    </main>
  );
}
