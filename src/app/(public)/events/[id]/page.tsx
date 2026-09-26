import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { SignInButton } from "@clerk/nextjs";

export default async function PublicEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id, status: "PUBLISHED" },
  });

  if (!event) {
    notFound();
  }

  const clerkUser = await currentUser();
  if (clerkUser) {
    await getOrCreateDbUser(clerkUser);
  }
  const seatsAvailable = event.capacity - event.seatsBooked;
  const isSoldOut = seatsAvailable <= 0;

  return (
    <div className="space-y-8 py-4 sm:py-6 pb-28 lg:pb-6">
      <Link 
        href="/events" 
        className="inline-flex items-center text-xs sm:text-sm font-bold text-secondary hover:text-foreground transition-all duration-300 group"
      >
        <span className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300">←</span> 
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Image & Info */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="w-full h-56 sm:h-72 md:h-96 bg-secondary/10 rounded-2xl sm:rounded-3xl overflow-hidden relative border border-card-border/60 shadow-lg group">
            {event.bannerUrl ? (
              <img 
                src={event.bannerUrl} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-anton text-secondary text-4xl sm:text-5xl opacity-20 uppercase tracking-wider">
                EventFlow Experience
              </div>
            )}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-primary text-charcoal px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-lg uppercase tracking-wider">
              {event.category}
            </div>
            {event.aiGeneratedDescription && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-background/80 backdrop-blur border border-card-border/40 text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] font-bold shadow-lg flex items-center space-x-1.5 uppercase tracking-wider">
                <span>✨</span>
                <span>AI Enhanced</span>
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h1 className="font-anton text-3xl sm:text-5xl md:text-7xl uppercase tracking-tight leading-tight text-foreground break-words">
              {event.title}
            </h1>
            <div className="prose prose-sm sm:prose-lg max-w-none text-foreground/80 dark:text-foreground/90 whitespace-pre-wrap font-satoshi leading-relaxed font-medium">
              {event.description}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Sidebar (Desktop & Tablet) */}
        <div className="lg:col-span-1">
          {/* Printer Slot dispenser wrapper */}
          <div className="w-full max-w-sm mx-auto overflow-hidden pt-4 relative lg:sticky lg:top-28">
            {/* Printer Slot Element */}
            <div className="absolute top-0 left-8 right-8 h-2 bg-charcoal dark:bg-white/20 rounded-full border border-card-border/60 z-20 shadow-inner flex items-center justify-between px-6 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
            </div>

            <div className="bg-card-bg/40 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8 animate-ticket-dispense relative z-10">
              <h3 className="font-anton text-2xl sm:text-3xl uppercase border-b border-card-border/50 pb-4 tracking-wide text-foreground">Details</h3>
              
              <div className="space-y-5 sm:space-y-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">Date & Time</span>
                  <span className="font-bold text-sm sm:text-base text-foreground leading-tight">
                    {new Date(event.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="text-foreground/70 text-xs sm:text-sm mt-1">
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">Venue</span>
                  <span className="font-bold text-sm sm:text-base text-foreground leading-tight">{event.venue}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">Tickets</span>
                  <span className="font-anton text-3xl sm:text-4xl text-foreground tracking-tight mb-1">
                    {Number(event.price) === 0 ? 'Free' : `₹${Number(event.price).toFixed(2)}`}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSoldOut ? 'text-red-500' : seatsAvailable <= 10 ? 'text-amber-500 animate-pulse' : 'text-primary'}`}>
                      {isSoldOut ? 'Sold Out' : seatsAvailable <= 10 ? `🔥 Only ${seatsAvailable} seats left!` : `${seatsAvailable} seats remaining`}
                    </span>
                    <span className="text-[10px] font-mono text-secondary">
                      {Math.min(100, Math.round((event.seatsBooked / event.capacity) * 100))}% booked
                    </span>
                  </div>
                  
                  {/* Real-time capacity bar */}
                  <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full transition-all duration-700 ${isSoldOut ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, Math.round((event.seatsBooked / event.capacity) * 100))}%` }}
                    />
                  </div>

                  {/* Real-time viewer social proof */}
                  <div className="flex items-center gap-1.5 pt-2 text-[11px] text-secondary">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>8 people viewing this event right now</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {isSoldOut ? (
                  <button 
                    disabled 
                    className="w-full bg-foreground/10 text-foreground/40 py-4 rounded-xl font-bold uppercase tracking-wider cursor-not-allowed text-sm border border-card-border/40"
                  >
                    Sold Out
                  </button>
                ) : (
                  clerkUser ? (
                    <Link 
                      href={`/events/${event.id}/book`} 
                      className="block w-full text-center bg-primary text-charcoal py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/25 duration-300"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <SignInButton>
                      <button className="block w-full text-center bg-inverted-bg text-inverted-text py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg duration-300">
                        Login to Book
                      </button>
                    </SignInButton>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card-bg/95 backdrop-blur-xl border-t border-card-border p-3 px-4 flex items-center justify-between shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">Price</span>
          <span className="font-anton text-2xl text-foreground leading-none">
            {Number(event.price) === 0 ? "Free" : `₹${Number(event.price).toFixed(2)}`}
          </span>
          <span className="text-[10px] text-primary font-semibold">
            {isSoldOut ? "Sold Out" : `${seatsAvailable} seats left`}
          </span>
        </div>

        <div>
          {isSoldOut ? (
            <button
              disabled
              className="bg-foreground/10 text-foreground/40 px-6 py-3 rounded-xl font-anton text-sm uppercase tracking-wider"
            >
              Sold Out
            </button>
          ) : clerkUser ? (
            <Link
              href={`/events/${event.id}/book`}
              className="inline-block bg-primary text-charcoal px-7 py-3 rounded-xl font-anton text-sm uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
              Book Now
            </Link>
          ) : (
            <SignInButton>
              <button className="bg-inverted-bg text-inverted-text px-6 py-3 rounded-xl font-anton text-sm uppercase tracking-wider active:scale-95 transition-transform">
                Login to Book
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
}
