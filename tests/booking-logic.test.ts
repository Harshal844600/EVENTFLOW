import { test, describe } from "node:test";
import assert from "node:assert";

describe("Booking Business Rules & Concurrency Calculations", () => {
  function validateBookingRequest(params: {
    quantity: any;
    capacity: number;
    seatsBooked: number;
    status: string;
  }) {
    const { quantity, capacity, seatsBooked, status } = params;

    if (!quantity || typeof quantity !== "number" || quantity < 1 || quantity > 10) {
      return { valid: false, error: "INVALID_QUANTITY" };
    }

    if (status !== "PUBLISHED") {
      return { valid: false, error: "EVENT_NOT_PUBLISHED" };
    }

    const availableSeats = capacity - seatsBooked;
    if (availableSeats < quantity) {
      return { valid: false, error: "INSUFFICIENT_SEATS" };
    }

    return { valid: true };
  }

  test("rejects invalid quantities", () => {
    assert.strictEqual(
      validateBookingRequest({ quantity: 0, capacity: 100, seatsBooked: 10, status: "PUBLISHED" }).valid,
      false
    );
    assert.strictEqual(
      validateBookingRequest({ quantity: 15, capacity: 100, seatsBooked: 10, status: "PUBLISHED" }).valid,
      false
    );
    assert.strictEqual(
      validateBookingRequest({ quantity: "two", capacity: 100, seatsBooked: 10, status: "PUBLISHED" }).valid,
      false
    );
  });

  test("rejects booking when capacity is exhausted", () => {
    const result = validateBookingRequest({
      quantity: 3,
      capacity: 50,
      seatsBooked: 49,
      status: "PUBLISHED",
    });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, "INSUFFICIENT_SEATS");
  });

  test("rejects booking when event is in DRAFT or CANCELLED status", () => {
    const draftRes = validateBookingRequest({
      quantity: 1,
      capacity: 100,
      seatsBooked: 0,
      status: "DRAFT",
    });
    assert.strictEqual(draftRes.valid, false);
    assert.strictEqual(draftRes.error, "EVENT_NOT_PUBLISHED");

    const cancelledRes = validateBookingRequest({
      quantity: 1,
      capacity: 100,
      seatsBooked: 0,
      status: "CANCELLED",
    });
    assert.strictEqual(cancelledRes.valid, false);
    assert.strictEqual(cancelledRes.error, "EVENT_NOT_PUBLISHED");
  });

  test("accepts valid booking within available capacity", () => {
    const res = validateBookingRequest({
      quantity: 2,
      capacity: 100,
      seatsBooked: 20,
      status: "PUBLISHED",
    });
    assert.strictEqual(res.valid, true);
  });
});
