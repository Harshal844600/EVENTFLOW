import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "crypto";

describe("Razorpay Standard Web Checkout Logic", () => {
  const secret = "VJGann14yEjMZCUQp4QIvvI3";

  function verifyStandardPaymentSignature(
    orderId: string,
    paymentId: string,
    receivedSignature: string,
    keySecret: string
  ): boolean {
    if (!orderId || !paymentId || !receivedSignature || !keySecret) {
      return false;
    }
    const dataToSign = `${orderId}|${paymentId}`;
    const generated = crypto.createHmac("sha256", keySecret).update(dataToSign).digest("hex");

    const genBuf = Buffer.from(generated, "utf-8");
    const recBuf = Buffer.from(receivedSignature, "utf-8");

    if (genBuf.length !== recBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(genBuf, recBuf);
  }

  test("generates and verifies authentic payment signature", () => {
    const orderId = "order_Q1w2e3r4t5y6u7";
    const paymentId = "pay_P9o8i7u6y5t4r3";
    const authenticSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyStandardPaymentSignature(orderId, paymentId, authenticSignature, secret);
    assert.strictEqual(isValid, true);
  });

  test("rejects tampered payment_id or order_id", () => {
    const orderId = "order_Q1w2e3r4t5y6u7";
    const paymentId = "pay_P9o8i7u6y5t4r3";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isTamperedOrder = verifyStandardPaymentSignature("order_TAMPERED", paymentId, signature, secret);
    const isTamperedPayment = verifyStandardPaymentSignature(orderId, "pay_TAMPERED", signature, secret);

    assert.strictEqual(isTamperedOrder, false);
    assert.strictEqual(isTamperedPayment, false);
  });

  test("rejects signature signed with different secret key", () => {
    const orderId = "order_1122334455";
    const paymentId = "pay_9988776655";
    const wrongSignature = crypto
      .createHmac("sha256", "wrong_attacker_secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyStandardPaymentSignature(orderId, paymentId, wrongSignature, secret);
    assert.strictEqual(isValid, false);
  });

  test("validates minimum order amount rule (>= 100 paise)", () => {
    function validateAmount(amountPaise: number): boolean {
      return typeof amountPaise === "number" && !isNaN(amountPaise) && amountPaise >= 100;
    }

    assert.strictEqual(validateAmount(99), false);
    assert.strictEqual(validateAmount(0), false);
    assert.strictEqual(validateAmount(-500), false);
    assert.strictEqual(validateAmount(100), true);
    assert.strictEqual(validateAmount(50000), true);
  });
});
