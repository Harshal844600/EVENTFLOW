"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

export default function RazorpayStandardCheckoutPage() {
  const [amount, setAmount] = useState<number>(500); // INR
  const [loading, setLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handlePayNow = async () => {
    if (!amount || amount < 1) {
      toast.error("Minimum amount must be at least ₹1 (100 paise)");
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      // =========================================================================
      // STEP 1: BACKEND - Create Order
      // =========================================================================
      const amountInPaise = Math.round(amount * 100);

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            source: "EventFlow Standard Checkout",
          },
        }),
      });

      const orderJson = await orderRes.json();

      if (!orderRes.ok || !orderJson.order_id) {
        throw new Error(orderJson.error || "Failed to create Razorpay order");
      }

      setOrderData(orderJson);
      toast.success(`Order created: ${orderJson.order_id}`);

      // =========================================================================
      // STEP 2: FRONTEND - Open Razorpay Standard Checkout Modal
      // =========================================================================
      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TgYGsBQUXcyijC";

      const options = {
        key: keyId,
        amount: orderJson.amount,
        currency: orderJson.currency,
        name: "EventFlow",
        description: `Standard Web Checkout (₹${amount})`,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=128&q=80",
        order_id: orderJson.order_id,
        prefill: {
          name: "Test Customer",
          email: "customer@eventflow.dev",
          contact: "9999999999",
        },
        theme: {
          color: "#ffe17c",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Checkout dismissed by user. Payment not completed.");
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // =====================================================================
          // STEP 3: BACKEND - Verify Payment Signature
          // =====================================================================
          toast.loading("Verifying cryptographic signature on backend...");

          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setVerificationResult({
                status: "VERIFIED",
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              toast.dismiss();
              toast.success("Payment signature verified successfully!");
            } else {
              setVerificationResult({
                status: "FAILED",
                error: verifyData.error || "Signature mismatch",
              });
              toast.dismiss();
              toast.error(`Verification Failed: ${verifyData.error}`);
            }
          } catch (verifyErr: any) {
            toast.dismiss();
            toast.error(`Verification network error: ${verifyErr.message}`);
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: any) {
        setLoading(false);
        toast.error(`Payment Failed: ${response.error?.description || "Transaction declined"}`);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Checkout error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-foreground">
      {/* Razorpay Standard Web Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="space-y-2 border-b border-card-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Razorpay Standard Web Checkout</span>
        </div>
        <h1 className="font-anton text-4xl sm:text-5xl uppercase tracking-wide">
          Payment Gateway <span className="text-primary">Integration</span>
        </h1>
        <p className="text-secondary text-sm">
          Complete implementation of Razorpay Standard Checkout featuring backend order creation,
          modal integration, and cryptographic HMAC-SHA256 signature verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="font-anton text-xl uppercase tracking-wider flex items-center justify-between">
            <span>Checkout Form</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Test Mode
            </span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Amount (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-anton text-lg text-secondary">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-background border border-card-border rounded-xl pl-9 pr-4 py-3 font-mono text-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[11px] text-secondary mt-1.5 font-mono">
                = {Math.round(amount * 100)} paise (minimum 100 paise)
              </p>
            </div>

            <div className="bg-background/60 border border-card-border/80 rounded-xl p-3.5 space-y-1.5 text-xs text-secondary font-mono">
              <div className="flex justify-between">
                <span>Currency:</span>
                <span className="text-foreground font-bold">INR</span>
              </div>
              <div className="flex justify-between">
                <span>Gateway Key ID:</span>
                <span className="text-primary truncate max-w-[160px]">
                  {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TgYGsBQUXcyijC"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-emerald-400">HMAC-SHA256</span>
              </div>
            </div>

            <button
              id="pay-button"
              type="button"
              onClick={handlePayNow}
              disabled={loading}
              className="w-full bg-primary text-charcoal py-4 rounded-xl font-anton text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{amount.toFixed(2)} with Razorpay</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-secondary flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secured with Standard Razorpay Checkout.js
            </p>
          </div>
        </div>

        {/* Integration Architecture Overview */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4">
            <h3 className="font-anton text-lg uppercase tracking-wider">
              Integration Flow
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-background border border-card-border">
                <span className="font-anton text-primary text-sm">1</span>
                <div>
                  <p className="font-bold text-foreground">Backend Order Creation</p>
                  <p className="text-secondary font-mono text-[11px]">POST /api/create-order</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-background border border-card-border">
                <span className="font-anton text-primary text-sm">2</span>
                <div>
                  <p className="font-bold text-foreground">Standard Checkout Modal</p>
                  <p className="text-secondary font-mono text-[11px]">new Razorpay(options).open()</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-background border border-card-border">
                <span className="font-anton text-primary text-sm">3</span>
                <div>
                  <p className="font-bold text-foreground">Backend Signature Verification</p>
                  <p className="text-secondary font-mono text-[11px]">POST /api/verify-payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          {verificationResult && (
            <div
              className={`p-5 rounded-2xl border ${
                verificationResult.status === "VERIFIED"
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-red-950/20 border-red-500/40 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-anton uppercase tracking-wide">
                {verificationResult.status === "VERIFIED" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Payment Verified & Confirmed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>Verification Failed</span>
                  </>
                )}
              </div>
              {verificationResult.status === "VERIFIED" ? (
                <div className="font-mono text-[11px] space-y-1 text-secondary">
                  <p>
                    <span className="text-foreground font-bold">Order ID:</span>{" "}
                    {verificationResult.order_id}
                  </p>
                  <p>
                    <span className="text-foreground font-bold">Payment ID:</span>{" "}
                    {verificationResult.payment_id}
                  </p>
                  <p className="truncate">
                    <span className="text-foreground font-bold">Signature:</span>{" "}
                    {verificationResult.signature}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-300 font-mono">
                  {verificationResult.error}
                </p>
              )}
            </div>
          )}

          {/* Quick link to event booking */}
          <div className="p-4 rounded-xl bg-card-bg/60 border border-card-border flex items-center justify-between text-xs">
            <span className="text-secondary">Ready to test live ticketing?</span>
            <Link
              href="/events"
              className="font-anton uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
