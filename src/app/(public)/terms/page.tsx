import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | EventFlow",
  description: "Terms and conditions governing the use of the EventFlow event management and registration platform.",
};

export default function TermsPage() {
  const lastUpdated = "September 28, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-secondary hover:text-foreground transition-colors group mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest">
          <FileText className="w-4 h-4" /> Legal Agreement
        </div>
        <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-foreground">
          Terms of <span className="text-primary">Service</span>
        </h1>
        <p className="text-sm text-foreground/60 font-mono">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-card-bg/60 border border-card-border backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Service Agreement</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Welcome to EventFlow (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). EventFlow provides SaaS-based event management, scheduling, digital attendee registration, and ticketing workflow software for corporate conferences, tech summits, educational seminars, and community workshops.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-foreground/80 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">01.</span> Acceptance of Terms
          </h2>
          <p>
            By accessing our website, creating an account, or registering for any event hosted via EventFlow, you agree to be bound by these Terms of Service, our Privacy Policy, and our Cancellation & Refund Policy. If you do not agree to these terms, you must discontinue using our services immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">02.</span> Scope of Services
          </h2>
          <p>
            EventFlow operates as a technological service provider and registration management platform. We provide software tools allowing verified event organizers to publish event details, manage attendee capacities, issue digital passes, and facilitate secure payment processing via RBI-compliant licensed payment aggregators.
          </p>
          <ul className="space-y-2 mt-2 pl-4 list-disc text-foreground/75 text-sm">
            <li>Event organizers are independent third parties responsible for their event venue, schedule, and content.</li>
            <li>EventFlow is not an open secondary ticket resale marketplace. Unauthorised scalping or fraudulent ticket transfers are strictly prohibited.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">03.</span> User Accounts & Verification
          </h2>
          <p>
            To book tickets or create events, users must maintain an accurate and authenticated account. You are solely responsible for safeguarding your login credentials and for any activity initiated under your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">04.</span> Pricing & Payment Terms
          </h2>
          <p>
            All ticket prices are set directly by respective event organizers and clearly displayed in Indian Rupees (INR) or designated local currencies prior to checkout, inclusive of applicable taxes unless specified otherwise.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <div className="p-4 rounded-xl bg-card-bg/40 border border-card-border space-y-1">
              <div className="font-bold text-xs uppercase text-primary">Secure Processing</div>
              <p className="text-xs text-foreground/70">Transactions are encrypted and processed through PCI-DSS Level 1 certified payment gateways.</p>
            </div>
            <div className="p-4 rounded-xl bg-card-bg/40 border border-card-border space-y-1">
              <div className="font-bold text-xs uppercase text-primary">Instant Pass Issuance</div>
              <p className="text-xs text-foreground/70">Upon successful transaction verification, digital tickets with unique QR verification codes are issued immediately.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">05.</span> Cancellations & Refunds
          </h2>
          <p>
            All cancellations, refunds, and chargebacks are governed by our dedicated{" "}
            <Link href="/refund" className="text-primary underline hover:text-primary/80">
              Cancellation &amp; Refund Policy
            </Link>
            . In the event of an organizer-initiated cancellation, eligible ticket amounts will be refunded to the original payment source within 5 to 7 business days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">06.</span> Intellectual Property & Prohibited Use
          </h2>
          <p>
            All software code, graphics, user interface elements, trademarks, and logos associated with EventFlow are proprietary property. Users may not copy, reverse engineer, or exploit the platform for unlawful purposes or spam.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">07.</span> Governing Law & Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">08.</span> Contact & Grievance Officer
          </h2>
          <p>
            If you have questions, feedback, or grievances regarding our Terms of Service, please contact our support desk via our{" "}
            <Link href="/contact" className="text-primary underline hover:text-primary/80">
              Contact Us page
            </Link>{" "}
            or write directly to <span className="text-foreground font-mono">support@eventflow.app</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
