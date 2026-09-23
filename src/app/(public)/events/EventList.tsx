"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["ALL", ...Array.from(new Set(events.map((e) => e.category.toUpperCase()))).filter(cat => cat !== "ALL")];

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "ALL" || event.category.toUpperCase() === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search events by name or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card-bg/30 backdrop-blur-md border border-card-border/70 px-5 py-4 pl-12 rounded-2xl text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all shadow-sm text-foreground placeholder:text-foreground/40"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none select-none text-base">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 font-bold text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${
                  isActive
                    ? "bg-primary text-foreground border-transparent shadow-md shadow-primary/20"
                    : "bg-card-bg/20 text-foreground/85 border-card-border/50 hover:bg-card-bg/50 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Display */}
      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 text-secondary font-bold text-lg bg-card-bg/20 border border-dashed border-card-border/60 rounded-3xl max-w-xl mx-auto"
        >
          <div className="text-4xl mb-4 animate-float">🔍</div>
          No matching events found. Try a different search!
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              >
                <SpotlightCard className="h-full bg-card-bg/40 backdrop-blur-sm p-0 border border-card-border/60 flex flex-col group cursor-pointer glass-card-hover transition-theme">
                  <Link href={`/events/${event.id}`} className="group flex flex-col h-full">
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
                      <div className="absolute top-4 left-4 bg-background/85 backdrop-blur border border-card-border/40 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider text-foreground/90">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-anton text-3xl uppercase leading-tight mb-2 group-hover:text-primary transition-colors tracking-wide">
                        {event.title}
                      </h3>
                      <p className="text-foreground/70 text-sm mb-4 line-clamp-2 font-satoshi flex-1 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="border-t border-card-border/50 pt-4 mt-auto flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">
                            Starts
                          </p>
                          <p className="font-bold text-foreground text-sm">
                            <FormattedDate date={event.startTime} />
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-anton text-2xl text-foreground tracking-tight">
                            {Number(event.price) === 0 ? "FREE" : `₹${Number(event.price).toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SpotlightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
