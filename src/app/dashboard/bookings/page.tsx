import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "react-qr-code";
import { SpotlightCard } from "@/components/SpotlightCard";

export default async function UserBookingsPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);
  if (!dbUser) {
    // If no dbUser, they have no bookings anyway
    return <div className="p-8 text-center">No bookings found.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: dbUser.id },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-anton text-4xl uppercase tracking-wide text-foreground">My Bookings</h1>
        <Link href="/events" className="text-secondary font-bold hover:text-foreground transition-colors uppercase tracking-wider text-sm">
          Browse More Events →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-foreground/60 bg-card-bg/20 border border-dashed border-card-border rounded-3xl">
            You haven't booked any events yet.
          </div>
        ) : (
          bookings.map(booking => (
            <SpotlightCard key={booking.id} className="h-full bg-card-bg/40 backdrop-blur-sm border border-card-border/60 flex flex-col min-h-[380px] p-6 glass-card-hover transition-theme" spotlightColor="rgba(255, 225, 124, 0.12)">
              
              {/* Header Info */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-anton text-2xl uppercase tracking-wide text-foreground line-clamp-1 pr-2">{booking.event.title}</h3>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${
                  booking.status === 'CONFIRMED' ? 'bg-primary/20 text-foreground border border-primary/20' :
                  booking.status === 'PENDING' ? 'bg-secondary/20 text-foreground border border-secondary/20' :
                  'bg-red-500/10 text-red-500 border border-red-500/10'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              {/* Event details */}
              <div className="space-y-2 mb-4 text-foreground/80 font-medium">
                <p className="text-sm flex items-center">
                  <span className="text-primary mr-2.5 text-base">📅</span>
                  {new Date(booking.event.startTime).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
                <p className="text-sm flex items-center">
                  <span className="text-primary mr-2.5 text-base">🎫</span>
                  {booking.quantity} Ticket(s)
                </p>
                <p className="text-sm flex items-center">
                  <span className="text-primary mr-2.5 text-base">💵</span>
                  ₹{Number(booking.totalAmount).toFixed(2)}
                </p>
              </div>
              
              {/* Ticket Notches & Dashed Tear line */}
              <div className="relative my-4">
                {/* Left Notch */}
                <div className="absolute left-[-37px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-r border-card-border/60 z-10"></div>
                {/* Dashed Line */}
                <div className="w-full border-t border-dashed border-card-border/60"></div>
                {/* Right Notch */}
                <div className="absolute right-[-37px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-l border-card-border/60 z-10"></div>
              </div>

              {/* QR Code section (Tear-off Stub) */}
              <div className="flex flex-col items-center justify-center py-4 flex-1">
                <div className="bg-white p-3 rounded-2xl border border-card-border shadow-md mx-auto">
                  <QRCode value={booking.id} size={110} level="H" fgColor="#171e19" />
                </div>
              </div>
              
              {/* Footer Booking ID */}
              <div className="border-t border-card-border/30 pt-4 mt-auto flex justify-between items-center text-xs text-foreground/60">
                <span className="font-bold uppercase tracking-wider text-[10px]">Booking ID</span>
                <span className="font-mono">{booking.id.split('-')[0]}</span>
              </div>
            </SpotlightCard>
          ))
        )}
      </div>
    </div>
  );
}
