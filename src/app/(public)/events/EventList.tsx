"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Clock, 
  DollarSign, 
  Users, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles, 
  Hourglass,
  ArrowUpDown
} from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";

function FormattedDate({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <span className="opacity-50">...</span>;

  return (
    <span>
      {new Date(date).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </span>
  );
}

export function EventList({ events }: { events: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<"ALL" | "AVAILABLE" | "FILLING_FAST" | "SOLD_OUT">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [sortBy, setSortBy] = useState<"TRENDING" | "DATE" | "PRICE_ASC" | "PRICE_DESC" | "SEATS">("TRENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveSeats, setLiveSeats] = useState<Record<string, { seatsAvailable: number; percentBooked: number; isSoldOut: boolean }>>({});

  useEffect(() => {
    let isSubscribed = true;

    const syncLiveSeats = async (forceFresh = false) => {
      if (typeof document !== "undefined" && document.hidden && !forceFresh) return;

      try {
        const res = await fetch(`/api/events/live-feed${forceFresh ? "?fresh=true" : ""}`, {
          cache: forceFresh ? "no-store" : "default",
        });
        if (res.ok && isSubscribed) {
          const data = await res.json();
          if (data.seats) {
            setLiveSeats(data.seats);
          }
        }
      } catch (err) {
        // Silent network retry
      }
    };

    // Immediate fresh sync
    syncLiveSeats(true);

    // Fast 8-second interval when active
    const interval = setInterval(() => syncLiveSeats(false), 8_000);

    const handleFocus = () => syncLiveSeats(true);
    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        syncLiveSeats(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const categories = ["ALL", ...Array.from(new Set(events.map((e) => e.category.toUpperCase()))).filter(cat => cat !== "ALL")];

  // Processed and sorted events
  const processedEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Category filter
        const matchesCategory = selectedCategory === "ALL" || event.category.toUpperCase() === selectedCategory;

        // Search query filter
        const matchesSearch =
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Price type filter
        const price = Number(event.price);
        const matchesType =
          typeFilter === "ALL" ||
          (typeFilter === "FREE" && price === 0) ||
          (typeFilter === "PAID" && price > 0);

        // Availability filter
        const seatInfo = liveSeats[event.id] || {
          seatsAvailable: Math.max(0, (event.capacity || 100) - (event.seatsBooked || 0)),
          percentBooked: Math.min(100, Math.round(((event.seatsBooked || 0) / (event.capacity || 100)) * 100)),
          isSoldOut: (event.capacity || 100) <= (event.seatsBooked || 0),
        };

        const matchesAvailability =
          availabilityFilter === "ALL" ||
          (availabilityFilter === "AVAILABLE" && !seatInfo.isSoldOut) ||
          (availabilityFilter === "FILLING_FAST" && !seatInfo.isSoldOut && seatInfo.percentBooked >= 70) ||
          (availabilityFilter === "SOLD_OUT" && seatInfo.isSoldOut);

        return matchesCategory && matchesSearch && matchesType && matchesAvailability;
      })
      .sort((a, b) => {
        const seatInfoA = liveSeats[a.id] || {
          seatsAvailable: Math.max(0, a.capacity - a.seatsBooked),
          percentBooked: Math.round((a.seatsBooked / a.capacity) * 100),
        };
        const seatInfoB = liveSeats[b.id] || {
          seatsAvailable: Math.max(0, b.capacity - b.seatsBooked),
          percentBooked: Math.round((b.seatsBooked / b.capacity) * 100),
        };

        if (sortBy === "TRENDING") {
          // Trending algorithm: occupancy rate + total seats booked
          const scoreA = (a.seatsBooked * 2) + seatInfoA.percentBooked;
          const scoreB = (b.seatsBooked * 2) + seatInfoB.percentBooked;
          return scoreB - scoreA;
        }

        if (sortBy === "DATE") {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }

        if (sortBy === "PRICE_ASC") {
          return Number(a.price) - Number(b.price);
        }

        if (sortBy === "PRICE_DESC") {
          return Number(b.price) - Number(a.price);
        }

        if (sortBy === "SEATS") {
          return seatInfoB.seatsAvailable - seatInfoA.seatsAvailable;
        }

        return 0;
      });
  }, [events, selectedCategory, searchQuery, typeFilter, availabilityFilter, sortBy, liveSeats]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Hub */}
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search events by title, venue, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card-bg/40 backdrop-blur-md border border-card-border/80 px-5 py-3.5 pl-12 rounded-2xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-foreground placeholder:text-foreground/40"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none select-none text-base">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-2 sm:justify-center pb-2 px-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border ${
                  isActive
                    ? "bg-primary text-black border-primary shadow-md shadow-primary/20 scale-105"
                    : "bg-card-bg/40 text-foreground/80 border-card-border/60 hover:bg-card-bg hover:text-foreground"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls: Status, Type, and Sorting */}
        <div className="p-4 rounded-2xl bg-card-bg/30 border border-card-border/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Availability Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="font-bold text-foreground/60 uppercase tracking-wider text-[10px] mr-1">
              Status:
            </span>
            {[
              { key: "ALL", label: "All" },
              { key: "AVAILABLE", label: "Available" },
              { key: "FILLING_FAST", label: "🔥 Filling Fast" },
              { key: "SOLD_OUT", label: "Sold Out" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setAvailabilityFilter(item.key as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  availabilityFilter === item.key
                    ? "bg-foreground text-background"
                    : "bg-card-bg/60 text-foreground/70 hover:text-foreground border border-card-border/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Pricing Type & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Price Type */}
            <div className="flex items-center gap-1 bg-card-bg/60 border border-card-border/60 rounded-xl p-1">
              {[
                { key: "ALL", label: "All Rates" },
                { key: "FREE", label: "Free" },
                { key: "PAID", label: "Paid" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setTypeFilter(p.key as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${
                    typeFilter === p.key ? "bg-primary text-black" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card-bg/80 border border-card-border/80 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary"
              >
                <option value="TRENDING">Sort: Trending Velocity 🔥</option>
                <option value="DATE">Sort: Upcoming First 📅</option>
                <option value="PRICE_ASC">Sort: Price (Low &rarr; High)</option>
                <option value="PRICE_DESC">Sort: Price (High &rarr; Low)</option>
                <option value="SEATS">Sort: Most Spots Left</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {processedEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-3 bg-card-bg/20 border border-dashed border-card-border/60 rounded-3xl max-w-xl mx-auto"
        >
          <div className="text-4xl animate-bounce">🔍</div>
          <p className="font-anton text-2xl uppercase tracking-wider text-foreground">No Events Match Your Filters</p>
          <p className="text-xs text-foreground/60 max-w-md mx-auto">
            Try resetting your availability or pricing filters to explore other scheduled workshops and conferences.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setAvailabilityFilter("ALL");
              setTypeFilter("ALL");
              setSearchQuery("");
            }}
            className="mt-2 px-5 py-2 rounded-xl bg-primary text-black font-anton text-xs uppercase tracking-wider hover:scale-105 transition-transform"
          >
            Reset Filters
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {processedEvents.map((event) => {
              const seatInfo = liveSeats[event.id] || {
                seatsAvailable: Math.max(0, (event.capacity || 100) - (event.seatsBooked || 0)),
                percentBooked: Math.min(100, Math.round(((event.seatsBooked || 0) / (event.capacity || 100)) * 100)),
                isSoldOut: (event.capacity || 100) <= (event.seatsBooked || 0),
              };

              const isTrending = event.seatsBooked >= 8 || seatInfo.percentBooked >= 65;
              const isFree = Number(event.price) === 0;

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                >
                  <SpotlightCard className="h-full bg-card-bg/40 backdrop-blur-sm p-0 border border-card-border/60 flex flex-col group cursor-pointer glass-card-hover transition-theme overflow-hidden">
                    <Link href={`/events/${event.id}`} className="group flex flex-col h-full">
                      {/* Banner Image Container */}
                      <div className="h-48 relative overflow-hidden bg-secondary/10">
                        {event.bannerUrl ? (
                          <Image
                            src={event.bannerUrl}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center font-anton text-secondary text-2xl opacity-20 uppercase group-hover:scale-[1.04] transition-transform duration-700">
                            EventFlow
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="bg-background/90 backdrop-blur border border-card-border/40 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider text-foreground/90">
                            {event.category}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isTrending && (
                              <span className="bg-amber-500/90 text-black px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-black" /> Trending
                              </span>
                            )}
                            {isFree && (
                              <span className="bg-primary/90 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Free
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sold Out / Waitlist Banner Overlay */}
                        {seatInfo.isSoldOut && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-500 text-white font-anton text-sm uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
                              <Hourglass className="w-4 h-4" /> Waitlist Open
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Card Body */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-anton text-2xl sm:text-3xl uppercase leading-tight mb-3 group-hover:text-primary transition-colors tracking-wide line-clamp-1">
                            {event.title}
                          </h3>

                          {/* Live Seat Progress Tracker */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              {seatInfo.isSoldOut ? (
                                <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                  ● Sold Out (Queue Active)
                                </span>
                              ) : seatInfo.seatsAvailable <= 10 ? (
                                <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                                  🔥 Only {seatInfo.seatsAvailable} seats left!
                                </span>
                              ) : (
                                <span className="text-secondary text-[11px] font-medium">
                                  {seatInfo.seatsAvailable} spots remaining
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-secondary">
                                {seatInfo.percentBooked}% booked
                              </span>
                            </div>
                            <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-700 ${
                                  seatInfo.isSoldOut
                                    ? "bg-red-500"
                                    : seatInfo.percentBooked > 80
                                    ? "bg-amber-500"
                                    : "bg-primary"
                                }`}
                                style={{ width: `${seatInfo.percentBooked}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Meta */}
                        <div className="border-t border-card-border/50 pt-4 mt-auto flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-0.5">
                              Starts
                            </p>
                            <p className="font-bold text-foreground text-xs sm:text-sm">
                              <FormattedDate date={event.startTime} />
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-anton text-2xl text-foreground tracking-tight">
                              {isFree ? "FREE" : `₹${Number(event.price).toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
