import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function RegisterRestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      {/* Return to Home link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-foreground/60 hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to EventFlow</span>
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          Create Account
        </span>
      </div>

      {/* Main Clerk Card Wrapper */}
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          routing="path"
          path="/auth/user/register"
          signInUrl="/auth/user/login"
          fallbackRedirectUrl="/events"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card-bg/95 backdrop-blur-xl border border-card-border shadow-2xl rounded-3xl p-6 sm:p-8 w-full",
              headerTitle: "font-anton text-2xl tracking-wide text-foreground uppercase",
              headerSubtitle: "text-foreground/60 text-sm font-medium",
              formButtonPrimary:
                "bg-primary text-charcoal hover:brightness-105 font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-md active:scale-[0.98]",
              socialButtonsBlockButton:
                "border border-card-border hover:bg-foreground/5 rounded-xl font-medium transition-all text-foreground",
              socialButtonsBlockButtonText: "text-foreground font-semibold text-xs",
              formFieldInput:
                "bg-background/80 border border-card-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
              formFieldLabel: "text-foreground/80 font-mono text-xs uppercase tracking-wider",
              footerActionLink: "text-primary hover:underline font-bold",
              footerActionText: "text-foreground/60 text-xs",
              identityPreviewText: "text-foreground font-semibold",
              identityPreviewEditButton: "text-primary hover:underline",
              dividerLine: "bg-card-border",
              dividerText: "text-foreground/40 text-xs font-mono uppercase tracking-widest",
            },
          }}
        />
      </div>
    </div>
  );
}
