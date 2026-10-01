import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { SignInButton } from "@clerk/nextjs";
import { Calendar, Clock, MapPin, Sparkles, User, Ticket, ArrowLeft, ShieldCheck } from "lucide-react";
import { EventRealtimeViews } from "@/components/events/EventRealtimeViews";
import { EventShareButton } from "@/components/events/EventShareButton";

export default async function PublicEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id, status: "PUBLISHED" },
    include: {
      createdBy: {
        select: {
          name: true,
          avatarUrl: true,
          company: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const clerkUser = await currentUser();
  if (clerkUser) {
    await getOrCreateDbUser(clerkUser);
  }

  const seatsAvailable = Math.max(0, event.capacity - event.seatsBooked);
  const isSoldOut = seatsAvailable <= 0;
  const percentBooked = Math.min(100, Math.round((event.seatsBooked / event.capacity) * 100));

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 lg:pb-12 max-w-7xl mx-auto">
      {/* Top Header Bar: Back Nav & Share */}
      <div className="flex items-center justify-between gap-4">
        <Link 
          href="/events" 
          className="inline-flex items-center text-xs sm:text-sm font-bold text-secondary hover:text-foreground transition-all duration-300 group py-1.5"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1.5 transition-transform duration-300" />
          <span>Back to All Events</span>
        </Link>

        <EventShareButton title={event.title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image, Badges, Real-time View Metrics & Info */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Main Visual Banner */}
          <div className="w-full aspect-[16/10] sm:aspect-[21/9] md:h-[420px] bg-secondary/10 rounded-2xl sm:rounded-3xl overflow-hidden relative border border-card-border/80 shadow-xl group">
            {event.bannerUrl ? (
              <img 
                src={event.bannerUrl} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-anton text-secondary text-4xl sm:text-6xl opacity-20 uppercase tracking-wider select-none">
                EventFlow Experience
              </div>
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent pointer-events-none" />

            {/* Top floating badges */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
              <span className="bg-primary text-charcoal px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-lg uppercase tracking-wider">
                {event.category}
              </span>
              <span className="bg-card-bg/90 backdrop-blur-md border border-card-border/60 text-foreground px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-md flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Event
              </span>
            </div>

            {event.aiGeneratedDescription && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-background/90 backdrop-blur-md border border-card-border/60 text-foreground px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg flex items-center space-x-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>AI Enhanced</span>
              </div>
            )}
          </div>

          {/* Real-time Exact View Counter Bar */}
          <EventRealtimeViews 
            eventId={event.id} 
            initialViews={event.views || 0} 
            className="w-full"
          />

          {/* Event Title and Host Details */}
          <div className="space-y-4">
            <h1 className="font-anton text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-[1.05] text-foreground break-words">
              {event.title}
            </h1>

            {/* Event Host / Organizer row */}
            {event.createdBy && (
              <div className="flex items-center gap-3 py-2 border-b border-card-border/40">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-xs uppercase text-foreground shrink-0 overflow-hidden">
                  {event.createdBy.avatarUrl ? (
                    <img src={event.createdBy.avatarUrl} alt={event.createdBy.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{event.createdBy.name?.substring(0, 2) || "EF"}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium">Organized by</p>
                  <p className="text-sm font-bold text-foreground">
                    {event.createdBy.name} {event.createdBy.company ? `(${event.createdBy.company})` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Schedule & Location Cards (Windows & Mobile responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-card-bg/40 border border-card-border/60 backdrop-blur-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Date & Time</span>
                <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
                  {new Date(event.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-secondary font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" />
                  {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-card-bg/40 border border-card-border/60 backdrop-blur-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Location / Venue</span>
                <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
                  {event.venue}
                </p>
                <p className="text-xs text-secondary font-medium">In-person experience</p>
              </div>
            </div>
          </div>

          {/* Detailed Event Description */}
          <div className="space-y-4 pt-2">
            <h2 className="font-anton text-2xl uppercase tracking-wide text-foreground border-b border-card-border/40 pb-3">
              About This Experience
            </h2>
            <div className="prose prose-sm sm:prose-base max-w-none text-foreground/80 dark:text-foreground/90 whitespace-pre-wrap font-satoshi leading-relaxed font-medium">
              {event.description}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Dispenser Sidebar (Windows Desktop & Tablet) */}
        <div className="lg:col-span-1">
          <div className="w-full max-w-sm mx-auto overflow-hidden pt-4 relative lg:sticky lg:top-24">
            {/* Printer Slot Element with Realistic LED status */}
            <div className="absolute top-0 left-8 right-8 h-2.5 bg-charcoal dark:bg-white/20 rounded-full border border-card-border/60 z-20 shadow-inner flex items-center justify-between px-6 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
            </div>

            <div className="bg-card-bg/70 backdrop-blur-xl border border-card-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-ticket-dispense relative z-10 transition-all hover:border-primary/40">
              <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
                <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-wide text-foreground flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-primary" />
                  <span>Passes</span>
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-foreground/5 border border-card-border text-secondary">
                  Instant QR
                </span>
              </div>
              
              <div className="space-y-5">
                {/* Price Display */}
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 block">Ticket Admission</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-anton text-4xl sm:text-5xl text-foreground tracking-tight">
                      {Number(event.price) === 0 ? 'Free' : `₹${Number(event.price).toFixed(2)}`}
                    </span>
                    <span className="text-xs text-secondary font-medium">/ person</span>
                  </div>
                </div>

                {/* Capacity & Booking Velocity Tracker */}
                <div className="space-y-2 pt-1 border-t border-card-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold uppercase tracking-wider ${isSoldOut ? 'text-red-500' : seatsAvailable <= 10 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                      {isSoldOut ? 'Sold Out' : seatsAvailable <= 10 ? `🔥 Only ${seatsAvailable} seats left!` : `${seatsAvailable} seats remaining`}
                    </span>
                    <span className="text-[11px] font-mono text-secondary font-semibold">
                      {percentBooked}% booked
                    </span>
                  </div>
                  
                  {/* Real-time capacity bar */}
                  <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${isSoldOut ? 'bg-red-500' : percentBooked > 85 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${percentBooked}%` }}
                    />
                  </div>
                </div>

                {/* Compact Real-Time Active Viewer Counter in Card */}
                <div className="pt-1">
                  <EventRealtimeViews 
                    eventId={event.id} 
                    initialViews={event.views || 0} 
                    compact={true}
                    className="w-full py-1 text-secondary"
                  />
                </div>
              </div>

              {/* Action Button: Book Now / Waitlist / Login */}
              <div className="pt-2 space-y-2.5">
                {isSoldOut ? (
                  clerkUser ? (
                    <Link
                      href={`/events/${event.id}/book`}
                      className="block w-full text-center bg-amber-500/90 hover:bg-amber-500 text-charcoal py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg duration-300"
                    >
                      Join Waiting Queue
                    </Link>
                  ) : (
                    <SignInButton>
                      <button className="block w-full text-center bg-amber-500/90 text-charcoal py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg duration-300">
                        Login to Join Waitlist
                      </button>
                    </SignInButton>
                  )
                ) : (
                  clerkUser ? (
                    <Link 
                      href={`/events/${event.id}/book`} 
                      className="block w-full text-center bg-primary text-charcoal py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/25 duration-300 cursor-pointer"
                    >
                      Book Ticket Now
                    </Link>
                  ) : (
                    <SignInButton>
                      <button className="block w-full text-center bg-inverted-bg text-inverted-text py-4 rounded-xl font-anton text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg duration-300 cursor-pointer">
                        Login to Book
                      </button>
                    </SignInButton>
                  )
                )}

                {/* Direct Share with Friends Action */}
                <EventShareButton 
                  title={event.title} 
                  eventId={event.id} 
                  variant="full" 
                  label="Invite Friends via WhatsApp / Apps" 
                />
              </div>

              <div className="text-center">
                <p className="text-[11px] text-secondary/80 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Instant confirmation with QR ticket
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar (Optimized with Safe Area Insets for iOS & Android) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card-bg/95 backdrop-blur-2xl border-t border-card-border p-3 px-4 shadow-2xl pb-safe">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
              {isSoldOut ? "Queue Available" : "Admission"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-anton text-2xl text-foreground leading-none">
                {Number(event.price) === 0 ? "Free" : `₹${Number(event.price).toFixed(2)}`}
              </span>
            </div>
            <div className="mt-0.5">
              <EventRealtimeViews 
                eventId={event.id} 
                initialViews={event.views || 0} 
                compact={true}
                className="text-[10px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EventShareButton
              title={event.title}
              eventId={event.id}
              variant="icon"
            />
            {isSoldOut ? (
              clerkUser ? (
                <Link
                  href={`/events/${event.id}/book`}
                  className="inline-block bg-amber-500 text-charcoal px-5 py-3 rounded-xl font-anton text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                >
                  Join Queue
                </Link>
              ) : (
                <SignInButton>
                  <button className="bg-amber-500 text-charcoal px-4 py-3 rounded-xl font-anton text-xs uppercase tracking-wider active:scale-95 transition-transform">
                    Login / Queue
                  </button>
                </SignInButton>
              )
            ) : clerkUser ? (
              <Link
                href={`/events/${event.id}/book`}
                className="inline-block bg-primary text-charcoal px-6 py-3 rounded-xl font-anton text-sm uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                Book Now
              </Link>
            ) : (
              <SignInButton>
                <button className="bg-inverted-bg text-inverted-text px-5 py-3 rounded-xl font-anton text-sm uppercase tracking-wider active:scale-95 transition-transform">
                  Login to Book
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
