import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingClientView } from "./BookingClientView";

export default async function UserBookingsPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);
  if (!dbUser) {
    return <div className="p-8 text-center">No profile record found.</div>;
  }

  const [bookings, waitlists] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: dbUser.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.waitlist.findMany({
      where: { userId: dbUser.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedBookings = bookings.map((b) => ({
    ...b,
    totalAmount: Number(b.totalAmount),
    refundAmount: b.refundAmount ? Number(b.refundAmount) : null,
    createdAt: b.createdAt.toISOString(),
    cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
    event: {
      ...b.event,
      price: Number(b.event.price),
      startTime: b.event.startTime.toISOString(),
    },
  }));

  const serializedWaitlists = waitlists.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    event: {
      ...w.event,
      price: Number(w.event.price),
      startTime: w.event.startTime.toISOString(),
    },
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl uppercase tracking-wide text-foreground">
            My Passes &amp; Queues
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1">
            Access your verified QR tickets, review refund statuses, or track your waiting queue spots.
          </p>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center text-secondary font-bold hover:text-foreground transition-colors uppercase tracking-wider text-xs sm:text-sm"
        >
          Browse Events &rarr;
        </Link>
      </div>

      <BookingClientView
        initialBookings={serializedBookings}
        initialWaitlists={serializedWaitlists}
      />
    </div>
  );
}
