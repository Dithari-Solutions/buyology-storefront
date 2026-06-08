"use client";

// Root error boundary. Catches errors thrown in the root layout itself (where a
// route-segment error.tsx cannot help). It REPLACES the root layout, so it must
// render its own <html>/<body>. Kept minimal and self-contained on purpose.
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#F7F7F7", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "28rem", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "#402F75",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error?.digest ? (
            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "32px" }}>Reference: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
