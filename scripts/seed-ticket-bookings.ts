import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";

function randomAlphanumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  console.log("Starting ticket bookings seed...");

  // 1. Ensure sample attendees exist
  const sampleAttendees = [
    { name: "Aarav Sharma", email: "aarav.sharma@example.com" },
    { name: "Priya Patel", email: "priya.patel@example.com" },
    { name: "Rohan Mehta", email: "rohan.mehta@example.com" },
    { name: "Neha Singh", email: "neha.singh@example.com" },
    { name: "Vikram Malhotra", email: "vikram.m@example.com" },
  ];

  for (const attendee of sampleAttendees) {
    await prisma.user.upsert({
      where: { email: attendee.email },
      update: {},
      create: {
        name: attendee.name,
        email: attendee.email,
        role: "USER",
      },
    });
  }

  // Fetch all users and published events
  const users = await prisma.user.findMany();
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
  });

  if (events.length === 0) {
    console.error("No published events found. Please create or publish events first.");
    return;
  }

  console.log(`Found ${users.length} users and ${events.length} published events.`);

  // Find user's specific account(s) if any
  const userAccounts = users.filter((u) =>
    u.email.includes("harshal") || u.email.includes("admin@")
  );

  console.log(
    `Identified ${userAccounts.length} primary/admin user accounts to ensure they have rich bookings.`
  );

  // Define booking plans
  // 1. Ensure primary user accounts have confirmed tickets across key flagship events
  const now = Date.now();
  let createdBookingsCount = 0;

  for (const user of userAccounts) {
    for (let i = 0; i < Math.min(events.length, 4); i++) {
      const event = events[i];
      // Check if user already booked this event
      const existing = await prisma.booking.findFirst({
        where: { userId: user.id, eventId: event.id },
      });

      if (!existing) {
        const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2
        const unitPrice = Number(event.price);
        const totalAmount = unitPrice * quantity;
        const daysAgo = Math.floor(Math.random() * 10) + 1;
        const bookingDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

        const booking = await prisma.booking.create({
          data: {
            userId: user.id,
            eventId: event.id,
            quantity,
            totalAmount,
            status: BookingStatus.CONFIRMED,
            createdAt: bookingDate,
          },
        });

        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            razorpayOrderId: `order_${randomAlphanumeric(14)}`,
            razorpayPaymentId: `pay_${randomAlphanumeric(14)}`,
            razorpaySignature: `sig_${randomAlphanumeric(24)}`,
            amount: totalAmount,
            status: PaymentStatus.PAID,
            createdAt: bookingDate,
          },
        });

        createdBookingsCount++;
      }
    }
  }

  // 2. Add bookings for general attendees spread over the last 28 days for realistic chart metrics
  for (const user of users) {
    // Pick 2 to 4 random events for each user
    const shuffledEvents = [...events].sort(() => 0.5 - Math.random());
    const eventsToBook = shuffledEvents.slice(0, Math.floor(Math.random() * 3) + 2);

    for (const event of eventsToBook) {
      const existing = await prisma.booking.findFirst({
        where: { userId: user.id, eventId: event.id },
      });

      if (!existing) {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 tickets
        const unitPrice = Number(event.price);
        const totalAmount = unitPrice * quantity;

        // Spread bookings across the last 28 days
        const daysAgo = Math.floor(Math.random() * 28);
        const hoursAgo = Math.floor(Math.random() * 24);
        const bookingDate = new Date(now - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);

        // 85% CONFIRMED, 10% PENDING, 5% CANCELLED
        const rand = Math.random();
        let status: BookingStatus = BookingStatus.CONFIRMED;
        let paymentStatus: PaymentStatus = PaymentStatus.PAID;

        if (rand > 0.95) {
          status = BookingStatus.CANCELLED;
          paymentStatus = PaymentStatus.FAILED;
        } else if (rand > 0.85) {
          status = BookingStatus.PENDING;
          paymentStatus = PaymentStatus.CREATED;
        }

        const booking = await prisma.booking.create({
          data: {
            userId: user.id,
            eventId: event.id,
            quantity,
            totalAmount,
            status,
            createdAt: bookingDate,
          },
        });

        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            razorpayOrderId: `order_${randomAlphanumeric(14)}`,
            razorpayPaymentId: paymentStatus === PaymentStatus.PAID ? `pay_${randomAlphanumeric(14)}` : null,
            razorpaySignature: paymentStatus === PaymentStatus.PAID ? `sig_${randomAlphanumeric(24)}` : null,
            amount: totalAmount,
            status: paymentStatus,
            createdAt: bookingDate,
          },
        });

        createdBookingsCount++;
      }
    }
  }

  // 3. Recompute and synchronize seatsBooked for all events
  console.log("Synchronizing seatsBooked for all events...");
  for (const event of events) {
    const aggregate = await prisma.booking.aggregate({
      where: {
        eventId: event.id,
        status: BookingStatus.CONFIRMED,
      },
      _sum: {
        quantity: true,
      },
    });

    const totalSeatsBooked = aggregate._sum.quantity || 0;

    await prisma.event.update({
      where: { id: event.id },
      data: {
        seatsBooked: totalSeatsBooked,
      },
    });

    console.log(
      `Event "${event.title}": ${totalSeatsBooked} seats booked / ${event.capacity} capacity.`
    );
  }

  const finalTotalBookings = await prisma.booking.count();
  const confirmedCount = await prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } });
  const pendingCount = await prisma.booking.count({ where: { status: BookingStatus.PENDING } });
  const cancelledCount = await prisma.booking.count({ where: { status: BookingStatus.CANCELLED } });

  console.log(`\n Successfully added ${createdBookingsCount} new bookings!`);
  console.log(`Total Bookings in Database: ${finalTotalBookings}`);
  console.log(`- Confirmed: ${confirmedCount}`);
  console.log(`- Pending: ${pendingCount}`);
  console.log(`- Cancelled: ${cancelledCount}`);
}

main()
  .catch((e) => {
    console.error("Error seeding bookings:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
