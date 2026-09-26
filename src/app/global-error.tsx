"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#171e19", color: "#ffffff", fontFamily: "sans-serif", margin: 0, padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "20px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Critical Error</h1>
          <p style={{ color: "#b7c6c2", marginBottom: "2rem" }}>A system error occurred. Please refresh the page to restore service.</p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#ffe17c",
              color: "#171e19",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
