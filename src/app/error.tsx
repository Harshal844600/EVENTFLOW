"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console / telemetry
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="max-w-md w-full text-center space-y-6 bg-card-bg/60 backdrop-blur-md p-8 rounded-2xl border border-card-border shadow-2xl relative z-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-anton text-3xl uppercase tracking-wider text-foreground">
            Something Went Wrong
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            We encountered an unexpected error while processing your request. Our team has been alerted.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-secondary/60">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-charcoal font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card-bg border border-card-border text-foreground text-sm font-semibold hover:bg-foreground/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
