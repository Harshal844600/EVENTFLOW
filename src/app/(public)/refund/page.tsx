import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Clock, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | EventFlow",
  description: "Clear and transparent refund and ticket cancellation policies for EventFlow users and organizers.",
};

export default function RefundPolicyPage() {
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
          <RefreshCw className="w-4 h-4" /> Consumer Protection
        </div>
        <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-foreground">
          Cancellation &amp; <span className="text-primary">Refund Policy</span>
        </h1>
        <p className="text-sm text-foreground/60 font-mono">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Summary Highlight Box (Crucial for PG compliance) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-card-bg/70 border border-card-border space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Clock className="w-5 h-5" />
            <span>Refund Processing Timeline</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Approved refunds are credited back to the original payment source (UPI account, Credit/Debit card, or Netbanking) within <strong className="text-foreground">5 to 7 business days</strong>.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card-bg/70 border border-card-border space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>100% Refund for Cancelled Events</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            If an event is cancelled by the organizer without rescheduling, attendees receive a full 100% automatic refund of the ticket face value.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-10 text-foreground/80 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">01.</span> Overview
          </h2>
          <p>
            At EventFlow, we are dedicated to maintaining trust and transparency between event organizers and attendees. This Cancellation &amp; Refund Policy sets out the terms under which ticket purchases may be cancelled and refunded.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">02.</span> Event Cancellation by Organizer
          </h2>
          <p>
            If an organizer cancels an event entirely and no alternative date is provided:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li>An immediate email notification will be dispatched to all registered attendees.</li>
            <li>Automatic refund processing will be initiated to the original payment method.</li>
            <li>Funds will reflect in your account within 5 to 7 business days depending on your bank&apos;s clearing cycle.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">03.</span> Event Rescheduling or Venue Change
          </h2>
          <p>
            If an event is rescheduled to a new date, time, or substantially different venue:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li>Existing tickets remain valid for the newly announced date.</li>
            <li>Attendees who cannot attend the rescheduled session may request a cancellation and full refund within 48 hours of the reschedule notification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">04.</span> Attendee-Initiated Ticket Cancellations
          </h2>
          <p>
            Because venues, seating, and speaker workshops require advance capacity planning, attendee-requested cancellations are subject to organizer guidelines:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li><strong className="text-foreground">Standard Window:</strong> Requests submitted at least 48 hours before event commencement are eligible for full or partial refund as specified on the individual event page.</li>
            <li><strong className="text-foreground">Within 48 Hours:</strong> Tickets cancelled less than 48 hours before an event start time are non-refundable.</li>
            <li><strong className="text-foreground">Free Registration:</strong> Free passes can be cancelled anytime with zero fees to release capacity for other attendees.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">05.</span> Failed Transactions &amp; Double Debits
          </h2>
          <p>
            If your account was debited during checkout but your ticket was not generated due to an intermittent network failure:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-foreground/75 text-sm">
            <li>The payment aggregator automatically performs a reconciliation check within 24 hours.</li>
            <li>If unverified, the debited amount is reversed automatically to your bank/card within 3 to 5 business days.</li>
            <li>You can also contact our support team at <span className="text-foreground font-mono">billing@eventflow.app</span> with your bank transaction reference ID for immediate reconciliation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-anton text-xl sm:text-2xl uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-base">06.</span> How to Request a Refund
          </h2>
          <p>
            To initiate a cancellation or refund request:
          </p>
          <ol className="space-y-2 pl-4 list-decimal text-foreground/75 text-sm">
            <li>Visit your <Link href="/dashboard/bookings" className="text-primary underline">Bookings Dashboard</Link> while logged in.</li>
            <li>Locate your event booking and click on &quot;Booking Details&quot; &rarr; &quot;Request Cancellation&quot;.</li>
            <li>Alternatively, email our billing team at <span className="text-foreground font-mono">billing@eventflow.app</span> with your Booking ID and registered email.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
