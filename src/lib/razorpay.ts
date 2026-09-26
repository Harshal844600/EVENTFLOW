import Razorpay from "razorpay";

export function getRazorpayCredentials() {
  const fallbackKey = "rzp_test_TgYGsBQUXcyijC";
  const fallbackSecret = "VJGann14yEjMZCUQp4QIvvI3";

  const rawKeyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    fallbackKey;

  const rawSecret =
    process.env.RAZORPAY_KEY_SECRET ||
    fallbackSecret;

  // Clean surrounding quotes or whitespace commonly introduced when pasting into Vercel/cloud envs
  const key_id = (rawKeyId || "").replace(/^["']|["']$/g, "").trim();
  const key_secret = (rawSecret || "").replace(/^["']|["']$/g, "").trim();

  return { key_id, key_secret };
}

export function getRazorpayClient(): Razorpay {
  const { key_id, key_secret } = getRazorpayCredentials();
  return new Razorpay({ key_id, key_secret });
}

export const razorpay = getRazorpayClient();
