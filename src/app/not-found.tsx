import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-card-bg border border-card-border shadow-xl mb-2">
          <Compass className="w-12 h-12 text-primary animate-pulse" />
        </div>

        <h1 className="font-anton text-7xl md:text-8xl tracking-tight text-foreground">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="font-anton text-2xl uppercase tracking-wider text-foreground">
            Lost In The Flow?
          </h2>
          <p className="text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            The event or page you are looking for has concluded, moved, or never existed in this dimension.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-charcoal font-bold text-sm tracking-wide transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-card-bg border border-card-border text-foreground text-sm font-semibold hover:bg-foreground/5 transition-colors"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
}
