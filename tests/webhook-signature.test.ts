import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "crypto";

describe("Webhook Cryptographic Verification", () => {
  const secret = "test_webhook_secret_key_12345";

  function verifyRazorpaySignature(payload: string, signature: string, secretKey: string): boolean {
    if (!signature || !secretKey) return false;
    const expected = crypto.createHmac("sha256", secretKey).update(payload).digest("hex");
    return expected === signature;
  }

  test("verifies authentic Razorpay webhook signature", () => {
    const payload = JSON.stringify({ event: "order.paid", payload: { payment: { entity: { id: "pay_123" } } } });
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = verifyRazorpaySignature(payload, signature, secret);
    assert.strictEqual(isValid, true);
  });

  test("rejects tampered webhook payload", () => {
    const payload = JSON.stringify({ event: "order.paid", amount: 1000 });
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const tamperedPayload = JSON.stringify({ event: "order.paid", amount: 0 });
    const isValid = verifyRazorpaySignature(tamperedPayload, signature, secret);
    assert.strictEqual(isValid, false);
  });

  test("rejects incorrect secret or missing signature", () => {
    const payload = JSON.stringify({ event: "order.paid" });
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    assert.strictEqual(verifyRazorpaySignature(payload, signature, "wrong_secret"), false);
    assert.strictEqual(verifyRazorpaySignature(payload, "", secret), false);
  });
});
