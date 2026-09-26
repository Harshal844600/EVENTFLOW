"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Sparkles, Download, ArrowRight, ShieldCheck } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import Link from "next/link";

interface IconConcept {
  id: string;
  name: string;
  badge: string;
  subtitle: string;
  description: string;
  fileName: string;
  tags: string[];
}

const ICON_CONCEPTS: IconConcept[] = [
  {
    id: "1",
    name: "The Quantum Ticket",
    badge: "Current Active Icon",
    subtitle: "Cybernetic Stadium Ticket & Neural Spark",
    description:
      "A precision chamfered smart ticket silhouette fused with dual orbital quantum flux rings and an intense radiant 4-point AI spark star core.",
    fileName: "option-1-quantum-ticket.svg",
    tags: ["Smart Ticketing", "Quantum Rings", "Neural Core", "Gold & Obsidian"],
  },
  {
    id: "2",
    name: "The Neural Flux",
    badge: "Alternative Concept A",
    subtitle: "Intertwined Infinity Waves & AI Synapse",
    description:
      "An interlocking Mobius infinity ribbon forming dynamic 'E' and 'F' flow curves with electric teal-to-gold gradients and pulsing neural synapse nodes.",
    fileName: "option-2-infinity-flow.svg",
    tags: ["Continuous Flow", "Mobius Ribbon", "Synapse Nodes", "Electric Teal"],
  },
  {
    id: "3",
    name: "The AI Hyper-Spark Prism",
    badge: "Alternative Concept B",
    subtitle: "Faceted 8-Point Crystal & Hexagonal Crest",
    description:
      "An architectural 8-point geometric crystal spark with multi-faceted metallic bevels set upon an obsidian hexagonal substrate. Elite luxury tech aura.",
    fileName: "option-3-prism-spark.svg",
    tags: ["Luxury Tech", "Faceted Crystal", "Hexagonal Crest", "Architectural"],
  },
  {
    id: "4",
    name: "The Sonic Stage",
    badge: "Alternative Concept C",
    subtitle: "Concert Amphitheater & AI Horizon Supernova",
    description:
      "Concentric live soundwave amphitheater arcs converging into a glowing central AI beacon and crowd energy particle field.",
    fileName: "option-4-sonic-stage.svg",
    tags: ["Live Concerts", "Soundwaves", "Supernova Beacon", "Festival Energy"],
  },
];

export default function IconShowcasePage() {
  const [activeId, setActiveId] = useState<string>("1");
  const [applying, setApplying] = useState<string | null>(null);

  const handleSelectIcon = async (id: string, name: string) => {
    setApplying(id);
    try {
      const res = await fetch("/api/set-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update icon");
      }

      setActiveId(id);
      toast.success(`Active icon switched to "${name}"!`, {
        description: "Your browser tab icon, favicon, and public logo have been updated.",
      });
    } catch (err: any) {
      toast.error(err.message || "Could not switch icon");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-card-border bg-card-bg/60 backdrop-blur-md shadow-sm">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-bold text-foreground/80 font-mono">
            EventFlow Icon Studio
          </span>
        </div>

        <h1 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-foreground">
          Choose Your <span className="text-primary">AI Brand Icon</span>
        </h1>

        <p className="text-foreground/70 text-base sm:text-lg leading-relaxed font-satoshi">
          Compare 4 bespoke vector emblems crafted specifically for EventFlow. Click any option to preview and instantly activate it as the primary browser favicon and logo.
        </p>
      </div>

      {/* Grid of 4 Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {ICON_CONCEPTS.map((concept) => {
          const isActive = activeId === concept.id;
          const isBusy = applying === concept.id;

          return (
            <div
              key={concept.id}
              className={`rounded-3xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md ${
                isActive
                  ? "bg-card-bg/90 border-primary shadow-[0_0_40px_rgba(255,225,124,0.15)] ring-1 ring-primary"
                  : "bg-card-bg/50 border-card-border hover:border-card-border/80 hover:bg-card-bg/70 shadow-lg"
              }`}
            >
              {/* Top Row: Badge & Option Number */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${
                    isActive
                      ? "bg-primary/20 text-primary border-primary/40 font-mono"
                      : "bg-foreground/5 text-foreground/60 border-card-border font-mono"
                  }`}
                >
                  Option {concept.id} • {concept.badge}
                </span>

                {isActive && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Active
                  </span>
                )}
              </div>

              {/* Main Visual Display & Multi-Scale Sandbox */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-2xl bg-background/50 border border-card-border/50 items-center">
                {/* Large Preview */}
                <div className="sm:col-span-2 flex flex-col items-center justify-center p-6 rounded-xl bg-background/90 border border-card-border relative group">
                  <div className="w-28 h-28 relative transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_24px_rgba(255,225,124,0.25)]">
                    <img
                      src={`/icons/${concept.fileName}`}
                      alt={concept.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-foreground/50 mt-3 uppercase tracking-wider">
                    High-Res Vector (100% Scalable)
                  </span>
                </div>

                {/* Scaled Render Mockups (32px tab & 16px micro) */}
                <div className="flex flex-col items-center justify-around gap-4 p-4 rounded-xl bg-card-bg/80 border border-card-border/60">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-card-bg border border-card-border p-1.5 flex items-center justify-center shadow-md">
                      <img
                        src={`/icons/${concept.fileName}`}
                        alt="32px Tab"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground/60 mt-1 block">32px Tab</span>
                  </div>

                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto rounded bg-card-bg border border-card-border p-0.5 flex items-center justify-center shadow-sm">
                      <img
                        src={`/icons/${concept.fileName}`}
                        alt="16px Favicon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground/60 mt-1 block">16px Favicon</span>
                  </div>
                </div>
              </div>

              {/* Text Description */}
              <div className="space-y-3 mb-6">
                <h3 className="font-anton text-2xl uppercase tracking-wide text-foreground">
                  {concept.name}
                </h3>
                <p className="text-sm font-bold text-primary/90">{concept.subtitle}</p>
                <p className="text-sm text-foreground/70 leading-relaxed font-satoshi">
                  {concept.description}
                </p>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {concept.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-card-border/30 text-foreground/70 border border-card-border/40 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-card-border/60">
                <button
                  onClick={() => handleSelectIcon(concept.id, concept.name)}
                  disabled={isBusy || isActive}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/50 cursor-default"
                      : "bg-inverted-bg text-inverted-text hover:bg-primary hover:text-foreground active:scale-[0.98] shadow-md"
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active Selection
                    </>
                  ) : isBusy ? (
                    "Activating..."
                  ) : (
                    <>
                      Activate Option {concept.id}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <a
                  href={`/icons/${concept.fileName}`}
                  download={concept.fileName}
                  title="Download SVG file"
                  className="p-3 rounded-xl border border-card-border hover:bg-card-border/40 text-foreground transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Back to Home CTA */}
      <div className="text-center pt-8 border-t border-card-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors"
        >
          ← Return to EventFlow Homepage
        </Link>
      </div>
    </div>
  );
}
