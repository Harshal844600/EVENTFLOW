"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
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

export function FeaturedEvents({ events }: { events: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax translation for the whole section
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420; // Card width + margin
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!events || events.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center relative z-20">
        <div className="max-w-md mx-auto p-12 bg-card-bg/40 backdrop-blur-md border border-card-border rounded-3xl space-y-6">
          <div className="text-5xl animate-float">📅</div>
          <h3 className="font-anton text-2xl uppercase tracking-wider">No Featured Events</h3>
          <p className="text-foreground/70 text-sm font-medium">
            There are no featured experiences at the moment. Keep checking back or view our full catalog.
          </p>
          <Link 
            href="/events" 
            className="inline-block bg-primary text-foreground font-bold px-8 py-3.5 rounded-xl hover:scale-105 transition-transform text-sm uppercase tracking-wider shadow-md"
          >
            Browse All Events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      ref={containerRef}
      style={{ y }}
      className="max-w-7xl mx-auto px-4 relative z-20 py-20"
    >
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="font-anton text-5xl uppercase tracking-tight text-foreground">Featured Events</h2>
          <p className="text-foreground/70 font-medium mt-2">Don't miss out on these upcoming experiences.</p>
        </div>
        <div className="flex items-center space-x-6">
          {/* Custom Desktop scroll arrows */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-card-border/60 flex items-center justify-center text-foreground hover:bg-primary hover:text-foreground transition-all duration-300 hover:border-transparent hover:scale-105 active:scale-95 cursor-pointer font-bold text-lg shadow-sm"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border border-card-border/60 flex items-center justify-center text-foreground hover:bg-primary hover:text-foreground transition-all duration-300 hover:border-transparent hover:scale-105 active:scale-95 cursor-pointer font-bold text-lg shadow-sm"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
          <Link href="/events" className="font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-sm">
            View All
          </Link>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-12 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar space-x-6 scroll-smooth"
      >
        {events.map((event, i) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            className="snap-center shrink-0 w-[85vw] md:w-[400px]"
          >
            <SpotlightCard 
              className="h-full bg-card-bg/40 backdrop-blur-sm p-0 border border-card-border/60 flex flex-col group cursor-pointer glass-card-hover transition-theme" 
              spotlightColor="rgba(255, 225, 124, 0.12)"
            >
              <Link href={`/events/${event.id}`} className="flex flex-col h-full">
                <div className="h-56 relative overflow-hidden bg-secondary/10">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-anton text-secondary text-2xl opacity-20 uppercase group-hover:scale-[1.04] transition-transform duration-700">
                      EventFlow
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur border border-card-border/40 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider text-foreground/90">
                    {event.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-anton text-3xl uppercase leading-tight mb-2 group-hover:text-primary transition-colors tracking-wide">
                    {event.title}
                  </h3>
                  <p className="text-foreground/70 text-sm mb-5 line-clamp-2 font-satoshi flex-1 leading-relaxed">
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
                        {Number(event.price) === 0
                          ? "FREE"
                          : `₹${Number(event.price).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 md:hidden text-center">
        <Link href="/events" className="font-bold text-primary hover:underline uppercase tracking-widest text-sm">
          View All Events
        </Link>
      </div>
    </motion.section>
  );
}
