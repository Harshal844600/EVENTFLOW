"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [eventData, setEventData] = useState<any>(null);
  const [liveSeatsRemaining, setLiveSeatsRemaining] = useState<number | null>(null);
  const [reservationTime, setReservationTime] = useState(600); // 10 minute countdown timer

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
  }, [id]);

  // Real-time seat updates
  useEffect(() => {
    const checkLiveSeats = async () => {
      try {
        const res = await fetch(`/api/events/live-feed?eventId=${id}`);
        if (res.ok) {
          const feed = await res.json();
          if (feed.seats && feed.seats[id]) {
            setLiveSeatsRemaining(feed.seats[id].seatsAvailable);
          }
        }
      } catch (err) {
        // Silently retry next cycle
      }
    };

    const interval = setInterval(checkLiveSeats, 10_000);
    return () => clearInterval(interval);
  }, [id]);

  const handleBooking = async () => {
    if (liveSeatsRemaining !== null && liveSeatsRemaining < quantity) {
      toast.error("Not enough seats available. Please reduce quantity or try another event.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Booking request could not be processed");
        setLoading(false);
        return;
      }

      if (data.type === "FREE") {
        toast.success("Free ticket confirmed! Directing to your pass...");
        router.push("/dashboard/bookings");
        return;
      }

      // Initialize Razorpay with real user credentials
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TDro9gl7EIyj1h",
        amount: data.amount,
        currency: data.currency,
        name: "EventFlow",
        description: `${quantity} Ticket(s) for ${eventData?.title}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          toast.success("Payment successful! Your tickets are confirmed.");
          router.push("/dashboard/bookings");
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
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Network error while connecting to payment gateway");
      setLoading(false);
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
    <div className="max-w-2xl mx-auto py-10 space-y-6 px-4">
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
        <h1 className="font-anton text-4xl md:text-5xl uppercase text-foreground">
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
                  className="w-9 h-9 rounded-xl border border-card-border flex items-center justify-center font-bold text-lg text-foreground hover:bg-primary hover:text-charcoal transition-all disabled:opacity-30 active:scale-90"
                >
                  -
                </button>
                <span className="font-anton text-2xl w-6 text-center text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAllowedQuantity, quantity + 1))}
                  disabled={quantity >= maxAllowedQuantity || isSoldOut}
                  className="w-9 h-9 rounded-xl border border-card-border flex items-center justify-center font-bold text-lg text-foreground hover:bg-primary hover:text-charcoal transition-all disabled:opacity-30 active:scale-90"
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

            {/* Checkout CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBooking}
                disabled={loading || isSoldOut}
                className="w-full bg-primary text-charcoal py-4 rounded-xl font-anton text-lg tracking-wide uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Ticket...</span>
                  </span>
                ) : isSoldOut ? (
                  "Event Sold Out"
                ) : total === 0 ? (
                  "Confirm Free Ticket"
                ) : (
                  `Pay ₹${total.toFixed(2)} with Razorpay`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
