"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { 
  Calendar, 
  Ticket, 
  IndianRupee, 
  XCircle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Hourglass, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";

interface BookingItem {
  id: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: string;
  qrCodeUrl: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  refundStatus: string | null;
  refundAmount: number | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    venue: string;
    startTime: string;
    bannerUrl: string | null;
    price: number;
  };
}

interface WaitlistItem {
  id: string;
  eventId: string;
  position: number;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    venue: string;
    startTime: string;
    price: number;
    capacity: number;
    seatsBooked: number;
  };
}

export function BookingClientView({
  initialBookings,
  initialWaitlists,
}: {
  initialBookings: BookingItem[];
  initialWaitlists: WaitlistItem[];
}) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [waitlists, setWaitlists] = useState<WaitlistItem[]>(initialWaitlists);
  const [activeTab, setActiveTab] = useState<"bookings" | "waitlists">("bookings");
  
  // Cancel Modal State
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState("Schedule conflict");
  const [cancelling, setCancelling] = useState(false);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setCancelling(true);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          reason: cancelReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel ticket");
        setCancelling(false);
        return;
      }

      toast.success(data.message || "Booking cancelled successfully.");
      
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                status: "CANCELLED",
                cancellationReason: cancelReason,
                cancelledAt: new Date().toISOString(),
                refundStatus: data.refundStatus,
                refundAmount: b.totalAmount,
              }
            : b
        )
      );

      setSelectedBooking(null);
    } catch (error) {
      toast.error("Network error while cancelling booking.");
    } finally {
      setCancelling(false);
    }
  };

  const handleLeaveWaitlist = async (eventId: string) => {
    try {
      const res = await fetch(`/api/waitlist?eventId=${eventId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Removed from waiting queue.");
        setWaitlists((prev) => prev.filter((w) => w.eventId !== eventId));
      } else {
        toast.error("Failed to leave waiting queue.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-card-border pb-4">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-anton text-sm uppercase tracking-wider transition-all ${
            activeTab === "bookings"
              ? "bg-primary text-black shadow-md shadow-primary/20"
              : "text-foreground/70 hover:text-foreground hover:bg-card-bg"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My Tickets ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("waitlists")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-anton text-sm uppercase tracking-wider transition-all ${
            activeTab === "waitlists"
              ? "bg-primary text-black shadow-md shadow-primary/20"
              : "text-foreground/70 hover:text-foreground hover:bg-card-bg"
          }`}
        >
          <Hourglass className="w-4 h-4" />
          <span>Waiting Queues ({waitlists.length})</span>
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookings.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 bg-card-bg/20 border border-dashed border-card-border rounded-3xl">
              <Ticket className="w-12 h-12 mx-auto text-foreground/40 animate-bounce" />
              <p className="text-lg text-foreground/70 font-medium">You haven&apos;t booked any tickets yet.</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-xl font-anton text-sm uppercase tracking-wider hover:scale-105 transition-transform"
              >
                Browse Events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            bookings.map((booking) => {
              const isCancelled = booking.status === "CANCELLED";
              const isConfirmed = booking.status === "CONFIRMED";
              const isPaid = booking.totalAmount > 0;

              return (
                <SpotlightCard
                  key={booking.id}
                  className="h-full bg-card-bg/40 backdrop-blur-sm border border-card-border/60 flex flex-col justify-between p-6 glass-card-hover transition-theme relative overflow-hidden"
                  spotlightColor="rgba(255, 225, 124, 0.12)"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <h3 className="font-anton text-2xl uppercase tracking-wide text-foreground line-clamp-1">
                        {booking.event.title}
                      </h3>
                      <span
                        className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full shrink-0 ${
                          isConfirmed
                            ? "bg-primary/20 text-foreground border border-primary/30"
                            : isCancelled
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-secondary/20 text-foreground border border-secondary/20"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-foreground/80 font-medium text-sm mb-5">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(booking.event.startTime).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>{booking.quantity} Ticket(s)</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-primary" />
                        <span>{isPaid ? `₹${booking.totalAmount.toFixed(2)}` : "FREE"}</span>
                      </p>
                    </div>

                    {/* Refund Tracking Badge if Cancelled */}
                    {isCancelled && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1 mb-5">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Cancelled on {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString() : "Record"}</span>
                        </div>
                        {isPaid && (
                          <p className="text-foreground/70">
                            Refund Status:{" "}
                            <strong className="text-foreground capitalize font-mono">
                              {booking.refundStatus === "PENDING" ? "Processing (5-7 Days)" : booking.refundStatus}
                            </strong>
                          </p>
                        )}
                        {booking.cancellationReason && (
                          <p className="text-foreground/60 italic text-[11px]">
                            &quot;{booking.cancellationReason}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* QR Code Section or Actions */}
                  <div className="pt-4 border-t border-card-border/40 space-y-4">
                    {isConfirmed && (
                      <>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/95 rounded-2xl shadow-inner">
                          <QRCode
                            value={JSON.stringify({
                              bookingId: booking.id,
                              eventId: booking.eventId,
                              quantity: booking.quantity,
                            })}
                            size={110}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                          />
                          <span className="text-[10px] text-black font-mono font-bold mt-2 uppercase tracking-widest">
                            Scan at Check-In
                          </span>
                        </div>

                        {/* Cancel Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
                        </button>
                      </>
                    )}

                    {isCancelled && (
                      <div className="text-center py-2 text-xs text-foreground/50 font-mono">
                        Ticket Voided • Capacity Released
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              );
            })
          )}
        </div>
      )}

      {/* Waitlists Tab */}
      {activeTab === "waitlists" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {waitlists.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 bg-card-bg/20 border border-dashed border-card-border rounded-3xl">
              <Hourglass className="w-12 h-12 mx-auto text-primary animate-pulse" />
              <p className="text-lg text-foreground/70 font-medium">You are not in any waiting queues right now.</p>
              <p className="text-xs text-foreground/50 max-w-md mx-auto">
                When an event sells out, you can join the waiting queue. If someone cancels their ticket, seats are offered in queue order!
              </p>
            </div>
          ) : (
            waitlists.map((entry) => (
              <SpotlightCard
                key={entry.id}
                className="h-full bg-card-bg/40 backdrop-blur-sm border border-card-border/60 flex flex-col justify-between p-6 glass-card-hover transition-theme relative"
                spotlightColor="rgba(255, 225, 124, 0.15)"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <h3 className="font-anton text-2xl uppercase tracking-wide text-foreground line-clamp-1">
                      {entry.event.title}
                    </h3>
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-primary/20 text-foreground border border-primary/30 shrink-0">
                      Position #{entry.position}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Queue Status: {entry.status}</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {entry.status === "OFFERED"
                        ? "🎉 Great news! A seat opened up for you. Complete your reservation now."
                        : `You are #${entry.position} in line. If an attendee cancels or releases tickets, you will automatically move up.`}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-foreground/70 font-medium">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(entry.event.startTime).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-primary" />
                      <span>Capacity: {entry.event.capacity} Attendees</span>
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-card-border/40 flex items-center justify-between gap-3">
                  <Link
                    href={`/events/${entry.eventId}`}
                    className="text-xs font-bold text-primary underline hover:text-primary/80"
                  >
                    View Event Details
                  </Link>

                  <button
                    onClick={() => handleLeaveWaitlist(entry.eventId)}
                    className="px-3 py-1.5 rounded-lg border border-card-border text-foreground/60 hover:text-red-400 hover:border-red-500/30 text-xs font-bold transition-colors"
                  >
                    Leave Queue
                  </button>
                </div>
              </SpotlightCard>
            ))
          )}
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-card-bg border border-card-border shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-anton text-2xl uppercase tracking-wider text-foreground">
                Cancel Ticket
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-card-bg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-card-bg/60 border border-card-border space-y-2 text-xs text-foreground/80">
              <div className="font-bold text-sm text-foreground">{selectedBooking.event.title}</div>
              <p>Tickets: {selectedBooking.quantity} Pass(es)</p>
              <p>
                Amount Paid:{" "}
                <strong className="text-foreground font-mono">
                  {selectedBooking.totalAmount > 0 ? `₹${selectedBooking.totalAmount.toFixed(2)}` : "FREE"}
                </strong>
              </p>
            </div>

            {selectedBooking.totalAmount > 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs text-foreground/80">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Refund Notice (5-7 Days)</span>
                </div>
                <p>
                  As per our Cancellation &amp; Refund Policy, your refund of ₹{selectedBooking.totalAmount.toFixed(2)} will be initiated automatically to your original payment method within 5–7 business days.
                </p>
              </div>
            ) : (
              <p className="text-xs text-foreground/70">
                Your free pass will be released immediately so other attendees or waitlist members can book the seat.
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-background border border-card-border px-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:border-primary text-foreground"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Booked by mistake">Booked by mistake / duplicate</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Travel or venue constraints">Travel or venue constraints</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-3 rounded-xl border border-card-border text-xs font-bold uppercase tracking-wider hover:bg-card-bg transition-colors text-foreground"
              >
                Keep Ticket
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-anton uppercase tracking-wider hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
              >
                {cancelling ? "Processing..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
