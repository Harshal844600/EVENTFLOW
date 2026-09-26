"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Magnetic } from "@/components/Magnetic";
import { EventFlowLogo } from "@/components/EventFlowLogo";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Framer Motion variants for stagger
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const titleWordVariants = {
    hidden: { opacity: 0, y: 60, filter: "blur(5px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
      },
    },
  };

  return (
    <motion.section 
      style={{ y: y1, opacity }} 
      className="text-center max-w-5xl mx-auto space-y-10 px-4 relative z-10 min-h-[75vh] flex flex-col justify-center items-center py-16"
    >
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[100px] -z-10 animate-float pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-[120px] -z-10 animate-float pointer-events-none delay-500" />

      {/* AI Intelligence Brandmark Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-card-border bg-card-bg/70 backdrop-blur-md shadow-lg hover:border-primary/40 transition-colors group cursor-default"
      >
        <EventFlowLogo size={22} animated={true} />
        <span className="text-xs uppercase tracking-widest font-bold text-foreground/80 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          AI-Powered Event Intelligence
        </span>
      </motion.div>

      {/* Main Title Heading */}
      <motion.h1
        variants={titleContainerVariants}
        initial="hidden"
        animate="visible"
        className="font-anton text-7xl md:text-9xl uppercase tracking-tighter leading-[0.85] text-foreground flex flex-col items-center select-none"
      >
        <motion.span variants={titleWordVariants} className="block">
          The <span className="text-primary relative inline-block px-1">
            Future
            {/* Hand-drawn double SVG underline highlight */}
            <svg className="absolute -bottom-2 left-0 w-full h-4 overflow-visible pointer-events-none" viewBox="0 0 100 10" preserveAspectRatio="none">
              <motion.path
                d="M0,7 Q50,2 100,7"
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.8, ease: "easeOut" }}
              />
              <motion.path
                d="M5,9 Q55,4 95,9"
                fill="transparent"
                stroke="var(--secondary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
              />
            </svg>
          </span>
        </motion.span>
        <motion.span variants={titleWordVariants} className="block mt-2">
          of Live Events.
        </motion.span>
      </motion.h1>

      {/* Description paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 30, filter: "blur(3px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-lg md:text-2xl text-foreground/70 max-w-2xl mx-auto font-medium leading-relaxed font-satoshi"
      >
        EventFlow is an AI-powered, serverless event management platform designed for speed, scale, and stunning aesthetics.
      </motion.p>

      {/* Interactive Magnet CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, type: "spring", stiffness: 180, damping: 15 }}
        className="pt-6"
      >
        <Magnetic strength={20}>
          <Link
            href="/events"
            className="relative inline-flex items-center space-x-3 bg-inverted-bg text-inverted-text px-10 py-5 text-lg font-bold uppercase tracking-wider shadow-2xl transition-all duration-300 rounded-xl overflow-hidden group border border-card-border/40 hover:border-primary/50"
          >
            <span className="relative z-10 group-hover:text-inverted-bg transition-colors duration-300 flex items-center">
              Explore Events
              <span className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </span>
            <div className="absolute inset-0 h-full w-full bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0" />
          </Link>
        </Magnetic>
      </motion.div>
    </motion.section>
  );
}
