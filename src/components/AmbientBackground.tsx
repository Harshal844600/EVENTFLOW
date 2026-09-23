"use client";

import { useEffect } from "react";
import { motion, useSpring } from "framer-motion";

export function AmbientBackground() {
  const mouseX = useSpring(0, { stiffness: 30, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
      
      {/* Floating Ambient Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px] mix-blend-screen dark:mix-blend-lighten"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[120px] mix-blend-screen dark:mix-blend-lighten"
      />
      
      {/* Interactive Mouse Orb */}
      <motion.div
        style={{ x: mouseX, y: mouseY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-white/5 dark:bg-white/5 blur-[120px] mix-blend-screen pointer-events-none"
      />
      
      {/* Vignette effect to darken edges slightly in dark mode */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(23,30,25,0.1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(23,30,25,0.8)_100%)]"></div>
    </div>
  );
}
