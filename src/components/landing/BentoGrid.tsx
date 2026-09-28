"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { LayoutDashboard, Sparkles, CreditCard, CloudUpload } from "lucide-react";

export function BentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Different parallax speeds for grid items
  const y1 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto px-4 relative z-10 pb-32">
      <div className="text-center mb-16">
        <h2 className="font-anton text-5xl uppercase tracking-tight text-foreground">
          Why <span className="text-primary">EventFlow?</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
        {/* Main Abstract UI Feature */}
        <motion.div style={{ y: y1 }} className="md:col-span-2 h-full">
          <SpotlightCard className="h-full bg-inverted-bg p-8 border-none flex flex-col relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <LayoutDashboard className="w-10 h-10 mb-4 text-primary animate-float" />
                <h3 className="font-anton text-4xl uppercase text-inverted-text mb-2 tracking-wide">
                  Powerful Dashboard
                </h3>
                <p className="text-secondary text-base max-w-sm leading-relaxed">
                  Manage events, track revenue, and monitor bookings in real-time with an intuitive, unified interface.
                </p>
              </div>
            </div>

            {/* Abstract UI Mockup with animated elements */}
            <div className="absolute right-[-10%] bottom-[-20%] w-[80%] h-[90%] bg-background border-t-8 border-l-8 border-white/5 rounded-tl-2xl shadow-2xl transition-transform duration-700 ease-out group-hover:-translate-y-5 group-hover:-translate-x-5">
              <div className="h-8 bg-inverted-bg/80 border-b border-white/5 flex items-center px-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                <div className="w-3 h-3 rounded-full bg-secondary/80"></div>
              </div>
              <div className="flex h-full bg-background/50 backdrop-blur">
                {/* Mock Sidebar */}
                <div className="w-1/4 border-r border-card-border/60 p-4 space-y-3">
                  <div className="h-3 bg-foreground/10 rounded w-full"></div>
                  <div className="h-3 bg-foreground/10 rounded w-5/6"></div>
                  <div className="h-3 bg-foreground/10 rounded w-4/6"></div>
                </div>
                {/* Mock Main Canvas with animated micro charts */}
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex space-x-4">
                    {/* Mini Bar Chart */}
                    <div className="bg-card-bg/40 border border-card-border/80 rounded-lg p-3 flex-1 flex flex-col justify-between h-24">
                      <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-wider">Sales</span>
                      <div className="flex items-end justify-between space-x-1.5 h-10 mt-1">
                        <div className="w-full bg-primary/50 h-[30%] rounded-sm group-hover:h-[80%] transition-all duration-700 delay-75"></div>
                        <div className="w-full bg-primary h-[60%] rounded-sm group-hover:h-[100%] transition-all duration-700 delay-100"></div>
                        <div className="w-full bg-primary/30 h-[20%] rounded-sm group-hover:h-[50%] transition-all duration-700 delay-150"></div>
                        <div className="w-full bg-primary/80 h-[80%] rounded-sm group-hover:h-[90%] transition-all duration-700 delay-200"></div>
                      </div>
                    </div>
                    {/* Mini Line Chart */}
                    <div className="bg-card-bg/40 border border-card-border/80 rounded-lg p-3 flex-1 flex flex-col justify-between h-24">
                      <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-wider">Views</span>
                      <div className="flex items-end justify-between space-x-1.5 h-10 mt-1">
                        <div className="w-full bg-secondary/50 h-[45%] rounded-sm group-hover:h-[60%] transition-all duration-700 delay-75"></div>
                        <div className="w-full bg-secondary h-[20%] rounded-sm group-hover:h-[80%] transition-all duration-700 delay-100"></div>
                        <div className="w-full bg-secondary/70 h-[75%] rounded-sm group-hover:h-[40%] transition-all duration-700 delay-150"></div>
                        <div className="w-full bg-secondary/35 h-[30%] rounded-sm group-hover:h-[70%] transition-all duration-700 delay-200"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-20 bg-foreground/5 rounded-lg border border-card-border/50 w-full p-3 flex flex-col justify-center space-y-2">
                    <div className="h-2 bg-foreground/10 rounded w-1/3"></div>
                    <div className="h-2 bg-foreground/5 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* AI Feature */}
        <motion.div style={{ y: y2 }} className="h-full">
          <SpotlightCard
            className="h-full bg-gradient-to-br from-primary to-yellow-400 p-8 border-none flex flex-col justify-between group overflow-hidden relative"
            spotlightColor="rgba(255,255,255,0.4)"
          >
            <div className="z-10 text-charcoal">
              <Sparkles className="w-10 h-10 mb-4 animate-float text-charcoal" />
              <h3 className="font-anton text-4xl uppercase leading-none mb-2 tracking-wide text-charcoal">
                AI<br />Powered
              </h3>
              <p className="text-charcoal/80 font-bold">
                Llama 3 instantly enhances your event copy.
              </p>
            </div>
            {/* Animated floating particles */}
            <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute bottom-6 right-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
              <Sparkles className="w-24 h-24 text-charcoal animate-pulse-glow" />
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Payment Feature */}
        <motion.div style={{ y: y1 }} className="h-full">
          <SpotlightCard className="h-full bg-card-bg/40 backdrop-blur-sm p-8 flex flex-col justify-between group overflow-hidden relative border border-card-border/60 transition-theme glass-card-hover" spotlightColor="rgba(255, 225, 124, 0.15)">
            <div className="z-10">
              <CreditCard className="w-10 h-10 mb-4 text-primary animate-float" />
              <h3 className="font-anton text-4xl uppercase text-foreground leading-none mb-2 tracking-wide">
                Secure<br />Payments
              </h3>
              <p className="text-foreground/70 font-medium">
                Instant UPI, Card &amp; Netbanking checkout with bank-grade encryption.
              </p>
            </div>
            <div className="absolute -bottom-12 -right-4 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all duration-500 delay-200"></div>
            {/* Mini visual credit card mockup */}
            <div className="absolute bottom-6 right-6 w-24 h-16 bg-inverted-bg/5 border border-foreground/10 rounded-lg p-2.5 flex flex-col justify-between group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-500">
              <div className="w-6 h-4 bg-primary/45 rounded-sm"></div>
              <div className="h-1.5 bg-foreground/10 rounded w-full"></div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* S3 Feature */}
        <motion.div style={{ y: y3 }} className="md:col-span-2 h-full">
          <SpotlightCard className="h-full bg-secondary/80 backdrop-blur-sm p-8 border border-card-border/60 flex flex-col relative overflow-hidden group transition-theme glass-card-hover" spotlightColor="rgba(255, 255, 255, 0.2)">
            <div className="z-10 w-1/2 flex flex-col h-full justify-between">
              <div>
                <CloudUpload className="w-10 h-10 mb-4 text-foreground/80 animate-float" />
                <h3 className="font-anton text-4xl uppercase text-foreground mb-2 tracking-wide">
                  Direct S3 Uploads
                </h3>
                <p className="text-foreground/80 font-bold text-base leading-relaxed">
                  Serverless, frictionless image hosting. Bypass standard API limits with secure presigned URLs.
                </p>
              </div>
            </div>
            {/* Abstract S3 Illustration */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-8">
              <div className="w-full h-full border-2 border-dashed border-foreground/20 rounded-2xl flex flex-col items-center justify-center group-hover:border-primary/50 group-hover:bg-background/20 transition-all duration-500">
                <CloudUpload className="w-10 h-10 text-foreground/30 group-hover:text-primary group-hover:scale-110 transition-all duration-500 mb-2" />
                <div className="text-foreground/40 group-hover:text-foreground/80 font-anton uppercase tracking-wider text-xs transition-colors duration-500">
                  Drop Banner Image Here
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
