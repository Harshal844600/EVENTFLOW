"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isUtility = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  if (isUtility) {
    // Snappy and clean entry for dashboards to maintain a responsive app feel
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <>
      {/* Wipe Reveal Effect (Public Pages) */}
      <motion.div
        className="fixed inset-0 z-50 bg-background pointer-events-none origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
      />
      {/* Content Slide & Fade (Public Pages) */}
      <motion.div
        initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1], delay: 0.05 }}
      >
        {children}
      </motion.div>
    </>
  );
}
