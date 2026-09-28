"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";

export default function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [eventData, setEventData] = useState<any>(null);
  const [liveSeatsRemaining, setLiveSeatsRemaining] = useState<number | null>(null);
  const [reservationTime, setReservationTime] = useState(600); // 10 minute countdown timer

  const [verificationError, setVerificationError] = useState<{
    title: string;
    message: string;
    details?: string;
    code?: string;
    statusCode?: number;
  } | null>(null);
  const [gatewayNotice, setGatewayNotice] = useState<{ title: string; message: string } | null>(null);
  const [waitlistStatus, setWaitlistStatus] = useState<{
    isEnrolled: boolean;
    position: number | null;
    totalWaiting: number;
  }>({
    isEnrolled: false,
    position: null,
    totalWaiting: 0,
  });
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  // 10-minute ticket reservation countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setReservationTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    // Fetch event details
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEventData(data);
        if (data.capacity !== undefined && data.seatsBooked !== undefined) {
          setLiveSeatsRemaining(Math.max(0, data.capacity - data.seatsBooked));
        }
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        toast.error("Failed to load event details");
      });

    // Check waitlist status
    fetch(`/api/waitlist?eventId=${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setWaitlistStatus({
            isEnrolled: data.isEnrolled,
            position: data.entry?.position || null,
            totalWaiting: data.totalWaiting || 0,
          });
        }
      })
      .catch(() => {});
  }, [id]);

  // Real-time high-accuracy seat updates
  useEffect(() => {
    let isSubscribed = true;

    const checkLiveSeats = async (forceFresh = false) => {
      if (typeof document !== "undefined" && document.hidden && !forceFresh) return;

      try {
        const res = await fetch(`/api/events/live-feed?eventId=${id}${forceFresh ? "&fresh=true" : ""}`, {
          cache: forceFresh ? "no-store" : "default",
        });
        if (res.ok && isSubscribed) {
          const feed = await res.json();
          if (feed.seats && feed.seats[id]) {
            setLiveSeatsRemaining(feed.seats[id].seatsAvailable);
          }
        }
      } catch (err) {
        // Silently retry next cycle
      }
    };

    // Eager fresh sync
    checkLiveSeats(true);

    // 5-second polling interval during active checkout
    const interval = setInterval(() => checkLiveSeats(false), 5_000);

    const handleFocus = () => checkLiveSeats(true);
    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        checkLiveSeats(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [id]);

  const handleBooking = async () => {
    if (liveSeatsRemaining !== null && liveSeatsRemaining < quantity) {
      toast.error("Not enough seats available. Please reduce quantity or try another event.");
      return;
    }

    setGatewayNotice(null);
    setVerificationError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to book your tickets");
          router.push(`/auth/user/login?redirect_url=/events/${id}/book`);
          setLoading(false);
          return;
        }

        // Check if error is verification or gateway related
        if (data.isVerificationError || data.isGatewayError || res.status === 400 || res.status === 502) {
          setVerificationError({
            title: data.error || "Payment Gateway Verification Error",
            message: data.message || "The Razorpay Test API is currently not active or rejected credentials.",
            details: data.details || data.gatewayError || "Merchant credentials or account verification required.",
            code: data.gatewayCode,
            statusCode: data.statusCode || res.status,
          });
          toast.error(
            data.gatewayError
              ? `Verification Error: ${data.gatewayError}`
              : "Payment Gateway Verification Error"
          );
        } else {
          toast.error(data.error || "Booking request could not be processed");
        }

        setLoading(false);
        return;
      }

      if (data.type === "FREE") {
        toast.success("Free ticket confirmed! Directing to your pass...");
        router.push("/dashboard/bookings");
        return;
      }

      // Initialize Razorpay SDK with real user credentials
      const options = {
        key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TgYGsBQUXcyijC",
        amount: data.amount,
        currency: data.currency,
        name: "EventFlow",
        description: `${quantity} Ticket(s) for ${eventData?.title}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify cryptographic HMAC-SHA256 signature with backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: data.booking?.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment verified successfully! Your tickets are confirmed.");
              router.push("/dashboard/bookings");
            } else {
              setVerificationError({
                title: "Signature Verification Error",
                message: "Server failed to verify payment signature.",
                details: verifyData.error || "Cryptographic HMAC signature mismatch.",
                code: "SIGNATURE_MISMATCH",
              });
              toast.error(verifyData.error || "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            toast.error("Network error while verifying payment signature.");
            setLoading(false);
          }
        },
        prefill: {
          name: user?.fullName || user?.firstName || "Event Attendee",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#ffe17c",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment session was cancelled. Your tickets are not confirmed.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        const errorDesc = response?.error?.description || "Payment failed or cancelled";
        const errorCode = response?.error?.code || "PAYMENT_FAILED";
        toast.error(`Payment failed: ${errorDesc}`);
        setVerificationError({
          title: "Payment Gateway Verification Error",
          message: "Razorpay rejected the checkout transaction.",
          details: errorDesc,
          code: errorCode,
        });
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Network error while connecting to payment gateway");
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error("Please sign in to join the waiting queue");
      router.push(`/auth/user/login?redirect_url=/events/${id}/book`);
      return;
    }

    setJoiningWaitlist(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to join waiting queue");
        return;
      }

      toast.success(data.message || "You've been added to the waiting queue!");
      setWaitlistStatus({
        isEnrolled: true,
        position: data.position,
        totalWaiting: (waitlistStatus.totalWaiting || 0) + 1,
      });
    } catch {
      toast.error("Network error while joining queue.");
    } finally {
      setJoiningWaitlist(false);
    }
  };

  if (!eventData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-anton text-xl uppercase tracking-wider text-secondary">
          Preparing Your Checkout...
        </p>
      </div>
    );
  }

  const price = Number(eventData.price);
  const total = price * quantity;
  const maxAllowedQuantity = Math.min(10, liveSeatsRemaining !== null ? liveSeatsRemaining : 10);
  const isSoldOut = liveSeatsRemaining !== null && liveSeatsRemaining <= 0;

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6 px-3.5 sm:px-4 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center text-xs font-bold text-secondary hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Event
        </Link>

        {/* Real-time Reservation countdown badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card-bg/80 border border-card-border text-xs text-secondary font-mono shadow-sm">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Tickets Held: <strong className="text-foreground">{formatTimer(reservationTime)}</strong></span>
        </div>
      </div>

      <div className="text-center md:text-left space-y-1">
        <h1 className="font-anton text-3xl sm:text-4xl md:text-5xl uppercase text-foreground">
          Express Checkout
        </h1>
        <p className="text-secondary text-sm">
          Review your ticket selection and complete your reservation instantly.
        </p>
      </div>

      {/* Premium Ticket Stub Container */}
      <div className="w-full overflow-hidden pt-4 relative">
        {/* Printer Dispenser Slot Element */}
        <div className="absolute top-0 left-12 right-12 h-2 bg-charcoal dark:bg-white/20 rounded-full border border-card-border/60 z-20 shadow-inner flex items-center justify-between px-6 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        </div>

        <div className="relative bg-card-bg/50 backdrop-blur-xl border border-card-border rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-10 space-y-6">
          {/* Upper Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold bg-primary text-charcoal px-3 py-1 rounded-full uppercase tracking-wider">
                {eventData.category}
              </span>

              {/* Real-time Seat Counter */}
              {liveSeatsRemaining !== null && (
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    isSoldOut
                      ? "bg-red-500/20 text-red-500"
                      : liveSeatsRemaining <= 10
                      ? "bg-amber-500/20 text-amber-500 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {isSoldOut
                    ? "SOLD OUT"
                    : liveSeatsRemaining <= 10
                    ? `🔥 Only ${liveSeatsRemaining} left`
                    : `🟢 ${liveSeatsRemaining} seats remaining`}
                </span>
              )}
            </div>

            <h2 className="font-anton text-3xl md:text-4xl uppercase text-foreground leading-tight">
              {eventData.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-foreground/80 font-medium text-xs">
              <p className="flex items-center">
                <span className="text-primary mr-2">📍</span> {eventData.venue}
              </p>
              <p className="flex items-center">
                <span className="text-primary mr-2">📅</span>
                {new Date(eventData.startTime).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(eventData.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Ticket Tear line */}
          <div className="relative my-6">
            <div className="absolute left-[-37px] md:left-[-45px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r border-card-border z-10" />
            <div className="w-full border-t border-dashed border-card-border/80" />
            <div className="absolute right-[-37px] md:right-[-45px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l border-card-border z-10" />
          </div>

          {/* Lower Ticket Section */}
          <div className="space-y-5">
            {/* Quantity Selector */}
            <div className="flex justify-between items-center bg-card-bg/60 p-4 rounded-2xl border border-card-border/60">
              <div>
                <p className="font-bold text-sm text-foreground">Select Quantity</p>
                <p className="text-xs text-secondary">
                  {price === 0 ? "Free Access" : `₹${price.toFixed(2)} per ticket`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 rounded-xl border border-card-border flex items-center justify-center font-bold text-xl text-foreground hover:bg-primary hover:text-charcoal transition-all disabled:opacity-30 active:scale-90 touch-manipulation"
                >
                  -
                </button>
                <span className="font-anton text-2xl w-8 text-center text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAllowedQuantity, quantity + 1))}
                  disabled={quantity >= maxAllowedQuantity || isSoldOut}
                  aria-label="Increase quantity"
                  className="w-11 h-11 rounded-xl border border-card-border flex items-center justify-center font-bold text-xl text-foreground hover:bg-primary hover:text-charcoal transition-all disabled:opacity-30 active:scale-90 touch-manipulation"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs border-b border-card-border/40 pb-4">
              <div className="flex justify-between text-secondary">
                <span>Tickets ({quantity}x)</span>
                <span className="font-mono text-foreground font-semibold">
                  {price === 0 ? "FREE" : `₹${(price * quantity).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Platform Booking Fee</span>
                <span className="font-mono text-emerald-500 font-semibold">₹0.00 (Waived)</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Taxes & GST</span>
                <span className="font-mono text-foreground">Included</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="font-anton text-2xl uppercase tracking-wider text-foreground">
                  Total Payable
                </span>
                <p className="text-[10px] text-secondary flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Bank-grade 256-bit encrypted checkout
                </p>
              </div>
              <span className="font-anton text-4xl text-primary tracking-tight">
                {total === 0 ? "FREE" : `₹${total.toFixed(2)}`}
              </span>
            </div>

            {/* Dedicated Verification Error Banner/Card */}
            {verificationError && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 via-card-bg to-red-950/20 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-anton text-sm uppercase tracking-wider text-red-400">
                          {verificationError.title}
                        </span>
                        {verificationError.statusCode && (
                          <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                            HTTP {verificationError.statusCode}
                          </span>
                        )}
                        {verificationError.code && (
                          <span className="text-[10px] font-mono text-secondary bg-card-bg px-2 py-0.5 rounded-md border border-card-border">
                            {verificationError.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {verificationError.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationError(null)}
                    className="text-secondary hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label="Close error notice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Gateway Detail Box */}
                <div className="bg-background/60 border border-red-500/20 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                  <div className="flex items-start gap-2 text-red-300">
                    <span className="font-bold shrink-0">Gateway Response:</span>
                    <span className="break-all">
                      {verificationError.details || "Authentication failed with Razorpay API credentials."}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-secondary pt-1 border-t border-card-border/60">
                    Razorpay test mode requires an active merchant account in good standing. If onboarding KYC or category review is pending, orders are blocked.
                  </p>
                </div>

                {/* Quick Action Links */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-red-500/20 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-charcoal font-bold text-xs hover:opacity-90 transition-opacity"
                    >
                      <span>Contact Support</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/refund"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-bg border border-card-border text-foreground hover:bg-card-border/40 transition-colors font-medium text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-secondary" />
                      <span>Refund Policy</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-foreground transition-colors ml-auto cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>Retry Verification</span>
                  </button>
                </div>
              </div>
            )}

            {/* Gateway Notice if verification/error occurs */}
            {gatewayNotice && !verificationError && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-foreground space-y-2">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gatewayNotice.title}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {gatewayNotice.message}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href="/contact"
                    className="inline-flex items-center text-xs font-bold text-primary underline hover:text-primary/80"
                  >
                    Contact Support &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => setGatewayNotice(null)}
                    className="text-xs text-secondary hover:text-foreground transition-colors ml-auto"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Checkout CTA / Waiting Queue Action */}
            <div className="pt-2">
              {isSoldOut ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Live Waiting Queue Active</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {waitlistStatus.isEnrolled
                        ? `🎉 You are currently #${waitlistStatus.position} in line! When an attendee cancels their ticket, seats are offered in queue order.`
                        : `This event is fully booked, but tickets frequently open up from attendee cancellations. Join the waiting queue to secure the next available pass.`}
                    </p>
                  </div>

                  {waitlistStatus.isEnrolled ? (
                    <Link
                      href="/dashboard/bookings"
                      className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-xl font-anton text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      <span>Track in My Queues (Position #{waitlistStatus.position}) &rarr;</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleJoinWaitlist}
                      disabled={joiningWaitlist}
                      className="w-full bg-primary text-black py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 cursor-pointer"
                    >
                      {joiningWaitlist
                        ? "Entering Queue..."
                        : `Join Waiting Queue (Position #${waitlistStatus.totalWaiting + 1})`}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={loading}
                  className="w-full bg-primary text-charcoal py-4 rounded-xl font-anton text-lg tracking-wide uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer duration-300"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Ticket...</span>
                    </span>
                  ) : total === 0 ? (
                    "Confirm Free Ticket"
                  ) : (
                    `Pay ₹${total.toFixed(2)} • Secure Checkout`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
