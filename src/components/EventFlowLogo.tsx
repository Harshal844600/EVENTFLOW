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
 * EventFlow AI Hyper-Spark Prism Vector Brandmark
 * Option 3: Architectural 8-point geometric crystal spark with multi-faceted metallic bevels
 * mounted on an obsidian hexagonal shield substrate.
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
          className="w-full h-full drop-shadow-[0_2px_14px_rgba(255,225,124,0.4)]"
          aria-label="EventFlow AI Hyper-Spark Prism"
        >
          <defs>
            <linearGradient id="opt3GoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFE17C" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <linearGradient id="opt3GoldDark" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE17C" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            <linearGradient id="opt3CyanFacet" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="opt3HexBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A382F" />
              <stop offset="60%" stopColor="#171E19" />
              <stop offset="100%" stopColor="#0A0E0C" />
            </linearGradient>

            <radialGradient id="opt3CoreFlare" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFE17C" stopOpacity="0.65" />
              <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#171E19" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hexagonal Shield Crest */}
          <polygon
            points="50,6 88,27 88,73 50,94 12,73 12,27"
            fill="url(#opt3HexBg)"
            stroke="url(#opt3GoldLight)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Core Radial Flare */}
          {animated ? (
            <motion.circle
              cx="50"
              cy="50"
              r="32"
              fill="url(#opt3CoreFlare)"
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <circle cx="50" cy="50" r="32" fill="url(#opt3CoreFlare)" />
          )}

          {/* 8-Point Faceted Refractive Prism Spark */}
          {/* Top Vertex Facets */}
          <polygon points="50,18 50,50 42,42" fill="url(#opt3GoldLight)" />
          <polygon points="50,18 58,42 50,50" fill="url(#opt3GoldDark)" />

          {/* Right Vertex Facets */}
          <polygon points="82,50 50,50 58,42" fill="url(#opt3GoldLight)" />
          <polygon points="82,50 58,58 50,50" fill="url(#opt3CyanFacet)" />

          {/* Bottom Vertex Facets */}
          <polygon points="50,82 50,50 58,58" fill="url(#opt3GoldDark)" />
          <polygon points="50,82 42,58 50,50" fill="url(#opt3CyanFacet)" />

          {/* Left Vertex Facets */}
          <polygon points="18,50 50,50 42,58" fill="url(#opt3GoldDark)" />
          <polygon points="18,50 42,42 50,50" fill="url(#opt3GoldLight)" />

          {/* Diagonal Sub-Sparks with Refractive Highlights */}
          <polygon points="28,28 50,50 42,42" fill="url(#opt3CyanFacet)" opacity="0.9" />
          <polygon points="72,28 50,50 58,42" fill="#FFE17C" opacity="0.9" />
          <polygon points="72,72 50,50 58,58" fill="url(#opt3CyanFacet)" opacity="0.9" />
          <polygon points="28,72 50,50 42,58" fill="#FFE17C" opacity="0.9" />

          {/* Center Diamond Quantum Core */}
          <polygon points="50,44 56,50 50,56 44,50" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="1.6" fill="#171E19" />
          <circle cx="50" cy="50" r="0.8" fill="#FFE17C" />
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
