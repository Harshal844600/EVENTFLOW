import { test, describe } from "node:test";
import assert from "node:assert";

describe("Real-Time Live Feed & Privacy Masking", () => {
  function maskAttendeeName(fullName?: string): string {
    const raw = fullName?.trim();
    if (!raw || raw === "Event Attendee") return "Event Attendee";
    const parts = raw.split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return parts[0];
  }

  function calculateSeatMetrics(capacity: number, seatsBooked: number) {
    const seatsAvailable = Math.max(0, capacity - seatsBooked);
    const percentBooked = Math.min(100, Math.round((seatsBooked / capacity) * 100));
    const isSoldOut = seatsAvailable <= 0;
    return { seatsAvailable, percentBooked, isSoldOut };
  }

  test("masks attendee full names for privacy", () => {
    assert.strictEqual(maskAttendeeName("Harshal Vidhate"), "Harshal V.");
    assert.strictEqual(maskAttendeeName("Priya Patel"), "Priya P.");
    assert.strictEqual(maskAttendeeName("Alice"), "Alice");
    assert.strictEqual(maskAttendeeName(""), "Event Attendee");
  });

  test("calculates capacity and sold-out states accurately", () => {
    const normal = calculateSeatMetrics(100, 45);
    assert.strictEqual(normal.seatsAvailable, 55);
    assert.strictEqual(normal.percentBooked, 45);
    assert.strictEqual(normal.isSoldOut, false);

    const soldOut = calculateSeatMetrics(50, 50);
    assert.strictEqual(soldOut.seatsAvailable, 0);
    assert.strictEqual(soldOut.percentBooked, 100);
    assert.strictEqual(soldOut.isSoldOut, true);

    const overBookedSafeguard = calculateSeatMetrics(50, 55);
    assert.strictEqual(overBookedSafeguard.seatsAvailable, 0);
    assert.strictEqual(overBookedSafeguard.isSoldOut, true);
  });
});
