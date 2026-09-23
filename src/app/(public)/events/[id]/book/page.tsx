"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    // Fetch event details
    fetch(`/api/events/${id}`)
      .then(res => res.json())
      .then(data => setEventData(data));
  }, [id]);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Booking failed");
        setLoading(false);
        return;
      }

      if (data.type === "FREE") {
        alert("Booking confirmed successfully!");
        router.push("/dashboard/bookings");
        return;
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "mock_key_id",
        amount: data.amount,
        currency: data.currency,
        name: "EventFlow",
        description: `Booking for ${eventData?.title}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // Typically we would also hit a verification endpoint here if we don't solely rely on webhooks,
          // but for this project we'll rely on the webhook or just show success for UX.
          alert("Payment successful! Your booking is confirmed.");
          router.push("/dashboard/bookings");
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
        },
        theme: {
          color: "#ffe17c",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!eventData) return <div className="text-center py-20 text-secondary font-bold">Loading...</div>;

  const price = Number(eventData.price);
  const total = price * quantity;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <h1 className="font-anton text-5xl uppercase text-foreground mb-8 text-center md:text-left">Checkout</h1>
      
      {/* Premium Ticket Stub Container with Printer Slot animation */}
      <div className="w-full overflow-hidden pt-4 relative">
        {/* Printer Slot Element */}
        <div className="absolute top-0 left-12 right-12 h-2 bg-charcoal dark:bg-white/20 rounded-full border border-card-border/60 z-20 shadow-inner flex items-center justify-between px-6 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
        </div>

        <div className="relative bg-card-bg/40 backdrop-blur-md border border-card-border/60 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden animate-ticket-dispense z-10">
          
          {/* Upper Ticket Section */}
          <div className="space-y-4">
          <span className="text-[10px] font-bold bg-primary text-foreground px-3.5 py-1 rounded-full uppercase tracking-wider">
            {eventData.category}
          </span>
          <h2 className="font-anton text-3xl md:text-4xl uppercase text-foreground leading-tight mt-2">{eventData.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-foreground/80 font-medium">
            <p className="flex items-center text-sm">
              <span className="text-primary mr-2.5 text-base">📍</span> {eventData.venue}
            </p>
            <p className="flex items-center text-sm">
              <span className="text-primary mr-2.5 text-base">📅</span> 
              {new Date(eventData.startTime).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric"
              })} at {new Date(eventData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Ticket Tear line & Edge Notches */}
        <div className="relative my-8">
          {/* Left Notch */}
          <div className="absolute left-[-41px] md:left-[-49px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r border-card-border/60 z-10"></div>
          {/* Dashed Line */}
          <div className="w-full border-t border-dashed border-card-border/75"></div>
          {/* Right Notch */}
          <div className="absolute right-[-41px] md:right-[-49px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l border-card-border/60 z-10"></div>
        </div>

        {/* Lower Ticket Section (Tear-off Stub) */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-foreground/70">Price per ticket</span>
              <span className="font-bold text-foreground text-base">
                {price === 0 ? 'Free' : `₹${price.toFixed(2)}`}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-foreground/70">Quantity</span>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center font-bold text-foreground hover:bg-primary hover:text-foreground transition-all duration-300 hover:border-transparent active:scale-90 cursor-pointer"
                >-</button>
                <span className="font-bold w-4 text-center text-foreground">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(eventData.capacity - eventData.seatsBooked, quantity + 1))}
                  className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center font-bold text-foreground hover:bg-primary hover:text-foreground transition-all duration-300 hover:border-transparent active:scale-90 cursor-pointer"
                >+</button>
              </div>
            </div>
          </div>

          <div className="border-t border-card-border/30 pt-6 flex justify-between items-center">
            <span className="font-anton text-2xl uppercase tracking-wider text-foreground">Total</span>
            <span className="font-anton text-4xl text-primary tracking-tight">
              {total === 0 ? 'Free' : `₹${total.toFixed(2)}`}
            </span>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-primary text-foreground py-4.5 rounded-xl font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer duration-300 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </span>
              ) : (
                total === 0 ? "Confirm Booking" : "Pay with Razorpay"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
