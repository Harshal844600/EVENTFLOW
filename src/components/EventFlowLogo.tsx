"use client";

import React from "react";
import { motion } from "framer-motion";

interface EventFlowLogoProps {
  size?: number | string;
  className?: string;
  animated?: boolean;
  showText?: boolean;
  textClassName?: string;
}

/**
 * EventFlow AI-Generated Vector Brandmark & Emblem
 * Represents an isometric AI smart event ticket infused with quantum neural orbital flux.
 */
export function EventFlowLogo({
  size = 36,
  className = "",
  animated = true,
  showText = false,
  textClassName = "",
}: EventFlowLogoProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        style={{ width: pixelSize, height: pixelSize }}
        className="relative shrink-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(255,225,124,0.35)]"
          aria-label="EventFlow AI Emblem"
        >
          <defs>
            {/* Radiant Brand Gold Gradient */}
            <linearGradient id="efGradGold" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#FFF9D2" />
              <stop offset="35%" stopColor="#FFE17C" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* AI Neural Flow Gradient */}
            <linearGradient id="efGradCyan" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            {/* Obsidian Metallic Ticket Surface */}
            <linearGradient id="efGradShield" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#253229" />
              <stop offset="60%" stopColor="#171E19" />
              <stop offset="100%" stopColor="#0C110E" />
            </linearGradient>

            {/* Deep Core Glow */}
            <radialGradient id="efGradCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#FFE17C" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#171E19" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Outer Halo */}
          <circle cx="50" cy="50" r="46" fill="url(#efGradCoreGlow)" opacity="0.4" />

          {/* Chamfered AI Smart-Ticket Contour */}
          <path
            d="M 22 18
               C 22 11 27 6 34 6
               L 66 6
               C 73 6 78 11 78 18
               L 78 39
               C 72 39 68 44 68 50
               C 68 56 72 61 78 61
               L 78 82
               C 78 89 73 94 66 94
               L 34 94
               C 27 94 22 89 22 82
               L 22 61
               C 28 61 32 56 32 50
               C 32 44 28 39 22 39
               Z"
            fill="url(#efGradShield)"
            stroke="url(#efGradGold)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Perforated Inner High-Speed Flow Track */}
          <path
            d="M 27 21
               C 27 16 31 12 36 12
               L 64 12
               C 69 12 73 16 73 21
               L 73 37
               C 67 39 63 44 63 50
               C 63 56 67 61 73 63
               L 73 79
               C 73 84 69 88 64 88
               L 36 88
               C 31 88 27 84 27 79
               L 27 63
               C 33 61 37 56 37 50
               C 37 44 33 39 27 37
               Z"
            fill="none"
            stroke="url(#efGradCyan)"
            strokeWidth="1.2"
            strokeDasharray="3 2.5"
            opacity="0.75"
          />

          {/* Dynamic AI Neural Orbital Rings */}
          <g transform="rotate(-30 50 50)">
            <ellipse
              cx="50"
              cy="50"
              rx="31"
              ry="11"
              fill="none"
              stroke="url(#efGradGold)"
              strokeWidth="1.4"
              strokeDasharray="6 3 2 3"
              opacity="0.8"
            />
            {animated ? (
              <motion.circle
                cx="81"
                cy="50"
                r="2.2"
                fill="#FFE17C"
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <circle cx="81" cy="50" r="2.2" fill="#FFE17C" />
            )}
          </g>

          <g transform="rotate(30 50 50)">
            <ellipse
              cx="50"
              cy="50"
              rx="31"
              ry="11"
              fill="none"
              stroke="url(#efGradCyan)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              opacity="0.75"
            />
            {animated ? (
              <motion.circle
                cx="50"
                cy="39"
                r="2.2"
                fill="#10B981"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            ) : (
              <circle cx="50" cy="39" r="2.2" fill="#10B981" />
            )}
          </g>

          {/* Central AI Quantum Spark (Primary 4-point Star) */}
          <path
            d="M 50 31
               C 50 41 41 50 31 50
               C 41 50 50 59 50 69
               C 50 59 59 50 69 50
               C 59 50 50 41 50 31
               Z"
            fill="url(#efGradGold)"
          />

          {/* High-Luminance Micro Star Flare */}
          <path
            d="M 50 41
               C 50 46 46 50 41 50
               C 46 50 50 54 50 59
               C 50 54 54 50 59 50
               C 54 50 50 46 50 41
               Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* Quantum Node Core */}
          <circle cx="50" cy="50" r="2.5" fill="#171E19" />
          <circle cx="50" cy="50" r="1.3" fill="#FFE17C" />
        </svg>
      </div>

      {showText && (
        <span className={`font-anton uppercase tracking-wide flex items-center ${textClassName}`}>
          EventFlow<span className="text-primary">.</span>
        </span>
      )}
    </div>
  );
}
