"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export function AmbientBackground() {
  const mouseX = useSpring(0, { stiffness: 40, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 40, damping: 25 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Throttle mouse movement to screen refresh rate via requestAnimationFrame
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        mouseX.set((e.clientX - window.innerWidth / 2) * 0.4);
        mouseY.set((e.clientY - window.innerHeight / 2) * 0.4);
        rafId.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
      
      {/* Floating Ambient Orbs (GPU accelerated) */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/10 blur-[60px] mix-blend-screen dark:mix-blend-lighten will-change-transform transform-gpu"
      />
      
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[70px] mix-blend-screen dark:mix-blend-lighten will-change-transform transform-gpu"
      />
      
      {/* Interactive Mouse Orb */}
      <motion.div
        style={{ x: mouseX, y: mouseY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full bg-white/5 dark:bg-white/5 blur-[70px] mix-blend-screen pointer-events-none will-change-transform transform-gpu"
      />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(23,30,25,0.1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(23,30,25,0.7)_100%)]"></div>
    </div>
  );
}
