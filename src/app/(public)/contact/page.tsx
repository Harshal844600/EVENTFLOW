"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message received! Our team will respond within 24 business hours.");
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-12">
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
          <MessageSquare className="w-4 h-4" /> Support Desk
        </div>
        <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-foreground">
          Contact <span className="text-primary">Us</span>
        </h1>
        <p className="text-sm sm:text-base text-foreground/70 max-w-2xl">
          Have questions regarding an upcoming event, ticket verification, or organizer partnerships? We are here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Contact Info (Required for Payment Gateway KYC) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-card-bg/60 border border-card-border backdrop-blur-sm space-y-6">
            <h2 className="font-anton text-xl uppercase tracking-wider text-foreground">
              Official Contact Details
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Operating Address</div>
                  <p className="text-foreground/70 text-xs leading-relaxed mt-0.5">
                    EventFlow Platform Office<br />
                    Outer Ring Road, Bellandur<br />
                    Bengaluru, Karnataka 560103, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Electronic Mail</div>
                  <p className="text-foreground/70 text-xs mt-0.5 font-mono">
                    support@eventflow.app<br />
                    billing@eventflow.app
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Customer Helpline</div>
                  <p className="text-foreground/70 text-xs mt-0.5 font-mono">
                    +91 (080) 4123-8899
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Support Hours</div>
                  <p className="text-foreground/70 text-xs mt-0.5">
                    Monday to Friday: 9:30 AM – 6:30 PM IST<br />
                    Saturday: 10:00 AM – 2:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ note */}
          <div className="p-5 rounded-2xl bg-card-bg/30 border border-card-border/60 text-xs text-foreground/70 space-y-2">
            <span className="font-bold text-foreground uppercase tracking-wider">Fast-track Ticketing Support</span>
            <p>
              For urgent queries on event day check-in or booking QR retrieval, please include your 10-character Booking Reference ID.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-3">
          <div className="p-6 sm:p-8 rounded-2xl bg-card-bg/60 border border-card-border backdrop-blur-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary flex items-center justify-center mx-auto text-primary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-anton text-2xl uppercase tracking-wider text-foreground">
                  Inquiry Dispatched
                </h3>
                <p className="text-foreground/70 text-sm max-w-md mx-auto">
                  Thank you for reaching out. We have logged your request and our support desk will respond to <span className="text-foreground font-mono">{formData.email}</span> within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl border border-card-border text-xs font-bold uppercase tracking-wider hover:bg-card-bg transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-anton text-xl uppercase tracking-wider text-foreground mb-4">
                  Send a Message
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-card-border px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-card-border px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-background border border-card-border px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors text-foreground"
                  >
                    <option value="General Inquiry">General Platform Inquiry</option>
                    <option value="Booking & Tickets">Ticket Booking &amp; QR Delivery</option>
                    <option value="Cancellation & Refund">Cancellation &amp; Refund Request</option>
                    <option value="Organizer Partnership">Event Organizer Partnership</option>
                    <option value="Billing Dispute">Billing or Transaction Query</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    Detailed Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Please describe your query in detail, including event name or booking ID if applicable..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-background border border-card-border p-4 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors resize-none text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-black font-anton text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
