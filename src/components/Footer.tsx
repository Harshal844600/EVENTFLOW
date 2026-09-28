"use client";

import Link from "next/link";
import { Magnetic } from "./Magnetic";
import { EventFlowLogo } from "./EventFlowLogo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-card-border bg-background/50 backdrop-blur-sm mt-32 relative z-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Slogan */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="font-anton text-3xl sm:text-4xl uppercase tracking-wide flex items-center gap-3 group">
              <EventFlowLogo size={42} className="transition-transform duration-300 group-hover:scale-105" />
              <span>EventFlow<span className="text-primary animate-pulse-glow">.</span></span>
            </Link>
            <p className="text-foreground/70 max-w-sm text-base leading-relaxed">
              EventFlow is the next generation event management platform. Discover curated experiences, handle ticketing, and host events at scale with modern speed.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4">
              <Magnetic strength={15}>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-card-border flex items-center justify-center text-foreground/80 hover:bg-primary hover:text-foreground transition-colors hover:border-transparent font-bold text-sm"
                >
                  X
                </a>
              </Magnetic>
              <Magnetic strength={15}>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-card-border flex items-center justify-center text-foreground/80 hover:bg-primary hover:text-foreground transition-colors hover:border-transparent font-bold text-sm"
                >
                  GH
                </a>
              </Magnetic>
              <Magnetic strength={15}>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-card-border flex items-center justify-center text-foreground/80 hover:bg-primary hover:text-foreground transition-colors hover:border-transparent font-bold text-sm"
                >
                  IG
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-anton text-lg uppercase tracking-wider mb-6 text-foreground">Explore</h4>
            <ul className="space-y-3 font-bold text-sm">
              <li>
                <Link href="/events" className="text-foreground/70 hover:text-primary transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/70 hover:text-primary transition-colors">
                  About Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance (Required for Payment Gateway) */}
          <div>
            <h4 className="font-anton text-lg uppercase tracking-wider mb-6 text-foreground">Policies</h4>
            <ul className="space-y-3 font-bold text-sm">
              <li>
                <Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-foreground/70 hover:text-primary transition-colors">
                  Refund &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors">
                  Grievance Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div className="border-t border-card-border pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-foreground/60 space-y-4 md:space-y-0">
          <p>© {currentYear} EventFlow Platform. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 font-bold">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-primary transition-colors">Cancellation &amp; Refund</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
