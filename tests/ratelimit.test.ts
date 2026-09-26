import { test, describe } from "node:test";
import assert from "node:assert";
import { rateLimit } from "../src/lib/ratelimit";

describe("Sliding Window Rate Limiter", () => {
  test("allows requests under the limit", () => {
    const ip = `test-ip-${Date.now()}`;
    const result1 = rateLimit(ip, { limit: 5, windowMs: 10_000 });
    assert.strictEqual(result1.success, true);
    assert.strictEqual(result1.remaining, 4);

    const result2 = rateLimit(ip, { limit: 5, windowMs: 10_000 });
    assert.strictEqual(result2.success, true);
    assert.strictEqual(result2.remaining, 3);
  });

  test("blocks requests that exceed the limit", () => {
    const ip = `test-ip-blocked-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const res = rateLimit(ip, { limit: 3, windowMs: 10_000 });
      assert.strictEqual(res.success, true);
    }

    // 4th request must fail
    const blockedRes = rateLimit(ip, { limit: 3, windowMs: 10_000 });
    assert.strictEqual(blockedRes.success, false);
    assert.strictEqual(blockedRes.remaining, 0);
    assert.ok(blockedRes.reset > 0);
  });

  test("isolates rate limits by IP identifier", () => {
    const ipA = `test-ip-a-${Date.now()}`;
    const ipB = `test-ip-b-${Date.now()}`;

    // Exhaust IP A
    for (let i = 0; i < 2; i++) {
      rateLimit(ipA, { limit: 2, windowMs: 10_000 });
    }
    const blockedA = rateLimit(ipA, { limit: 2, windowMs: 10_000 });
    assert.strictEqual(blockedA.success, false);

    // IP B should still be allowed
    const resB = rateLimit(ipB, { limit: 2, windowMs: 10_000 });
    assert.strictEqual(resB.success, true);
  });
});
