import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | EventFlow",
  description: "Privacy policy detailing data collection, processing, and protection standards on EventFlow.",
};

export default function PrivacyPolicyPage() {
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
          <Lock className="w-4 h-4" /> Data Protection
        </div>
        <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-foreground">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-sm text-foreground/60 font-mono">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Highlights */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card-bg/50 border border-card-border space-y-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Never Sold</h3>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Your personal information is never sold to third-party data brokers or marketing agencies.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-card-bg/50 border border-card-border space-y-2">
          <Lock className="w-6 h-6 text-primary" />
          <h3 className="font-bold text-sm text-foreground">End-to-End Encryption</h3>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Sensitive user data and authentication tokens are secured with TLS 1.3 and modern hashing.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-card-bg/50 border border-card-border space-y-2">
          <Database className="w-6 h-6 text-primary" />
          <h3 className="font-bold text-sm text-foreground">PCI-DSS Gateway</h3>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Payment card details are tokenized and processed directly by certified payment gateways.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10 text-foreground/80 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">01.</span> Information We Collect
          </h2>
          <p>When you use EventFlow, we may collect the following categories of information:</p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li><strong className="text-foreground">Account Identification:</strong> Full name, verified email address, and profile picture provided through our authentication system.</li>
            <li><strong className="text-foreground">Booking &amp; Registration Details:</strong> Selected ticket tiers, booking timestamps, quantity, and attendee names.</li>
            <li><strong className="text-foreground">Payment Records:</strong> Payment transaction references, order IDs, and status. We never store raw credit card numbers, CVVs, or bank netbanking passwords on our servers.</li>
            <li><strong className="text-foreground">Usage Telemetry:</strong> Anonymized analytical data, browser user-agent, and IP address for security audits and anti-fraud monitoring.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">02.</span> How We Use Your Information
          </h2>
          <p>We use your information exclusively to:</p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li>Process registrations, generate unique QR-enabled event tickets, and deliver booking confirmations.</li>
            <li>Provide event updates, venue advisories, and reschedule notifications from event organizers.</li>
            <li>Prevent ticket scalping, fraudulent transactions, and unauthorized access attempts.</li>
            <li>Comply with applicable legal requirements and Indian digital commerce regulations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">03.</span> Third-Party Service Providers
          </h2>
          <p>
            We partner with trusted third-party providers to deliver our core services:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li><strong className="text-foreground">Payment Aggregators:</strong> RBI-licensed payment gateways (Razorpay, Cashfree, or UPI partners) for encrypted checkout.</li>
            <li><strong className="text-foreground">Authentication &amp; Cloud:</strong> Secure cloud infrastructure providers with ISO 27001 and SOC 2 Type II compliance.</li>
            <li><strong className="text-foreground">Transactional Communications:</strong> Automated email delivery services for dispatching tickets and receipts.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">04.</span> Cookies &amp; Local Storage
          </h2>
          <p>
            EventFlow utilizes essential session cookies and local storage to retain your user session, theme preferences, and ticket holding reservations during checkout. You can adjust your browser settings to decline non-essential cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">05.</span> Your Rights &amp; Data Deletion
          </h2>
          <p>
            You have the right to request a copy of your personal data or request deletion of your account. To submit a data inquiry or deletion request, please reach out to our privacy desk at{" "}
            <span className="text-foreground font-mono">privacy@eventflow.app</span>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">06.</span> Contacting Privacy Team
          </h2>
          <p>
            If you have any questions or concerns regarding our privacy practices, please contact us via our{" "}
            <Link href="/contact" className="text-primary underline hover:text-primary/80">
              Contact Us page
            </Link>{" "}
            or write to <span className="text-foreground font-mono">privacy@eventflow.app</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
