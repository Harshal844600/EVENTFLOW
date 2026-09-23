"use client";

import { useRef, useState, ReactNode } from "react";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  disableTilt?: boolean;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 225, 124, 0.15)", // Default to a soft yellow glow
  disableTilt = false,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useSpring(0, { stiffness: 800, damping: 60 });
  const mouseY = useSpring(0, { stiffness: 800, damping: 60 });
  const rotateX = useSpring(0, { stiffness: 800, damping: 40 });
  const rotateY = useSpring(0, { stiffness: 800, damping: 40 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    mouseX.set(x);
    mouseY.set(y);

    if (!disableTilt) {
      const rX = -((y - height / 2) / height) * 10;
      const rY = ((x - width / 2) / width) * 10;
      rotateX.set(rX);
      rotateY.set(rY);
    }
  }

  function handleMouseLeave() {
    setIsHovered(false);
    if (!disableTilt) {
      rotateX.set(0);
      rotateY.set(0);
    }
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={disableTilt ? {} : { scale: 1.02, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      style={{
        rotateX: disableTilt ? 0 : rotateX,
        rotateY: disableTilt ? 0 : rotateY,
        transformPerspective: 1000,
      }}
      className={cn(
        "relative rounded-3xl overflow-hidden bg-background border border-card-border shadow-sm group",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}
