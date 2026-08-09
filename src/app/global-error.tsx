"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global fatal error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "420px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1.5rem", lineHeight: "1.5" }}>
            An unexpected application error occurred. You can attempt to reload the application.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                border: "none",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                backgroundColor: "#1e293b",
                color: "#cbd5e1",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
                fontSize: "0.875rem",
                textDecoration: "none",
                border: "1px solid #334155",
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
