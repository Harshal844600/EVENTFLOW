"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Magnetic } from "./Magnetic";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";

interface NavbarClientProps {
  isAdmin: boolean;
  hasUser: boolean;
  userMenuNode?: React.ReactNode;
}

export function NavbarClient({ isAdmin, hasUser, userMenuNode }: NavbarClientProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  
  // Dynamic header properties based on scroll
  const headerHeight = useTransform(scrollY, [0, 100], [80, 64]);
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(var(--background-rgb), 0)", "rgba(var(--background-rgb), 0.85)"]
  );
  
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.header
      style={{
        height: headerHeight,
      }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 transition-theme"
    >
      <motion.div 
        className="absolute inset-0 -z-10 backdrop-blur-md border-b border-card-border"
        style={{
          opacity: borderOpacity,
          backgroundColor: headerBackground
        }}
      />
      <Magnetic strength={15}>
        <Link href="/" className="font-anton text-3xl uppercase tracking-wide flex items-center">
          EventFlow<span className="text-primary animate-pulse-glow">.</span>
        </Link>
      </Magnetic>

      <nav className="hidden md:flex items-center space-x-8 font-bold">
        <Magnetic strength={15}>
          <Link 
            href="/events" 
            className={`hover:text-primary transition-colors block py-2 px-3 relative ${
              pathname.startsWith("/events") ? "text-primary" : "text-foreground/80"
            }`}
          >
            Events
            {pathname.startsWith("/events") && (
              <motion.span
                layoutId="active-nav-line"
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </Link>
        </Magnetic>
        <Magnetic strength={15}>
          <Link 
            href="/about" 
            className={`hover:text-primary transition-colors block py-2 px-3 relative ${
              pathname === "/about" ? "text-primary" : "text-foreground/80"
            }`}
          >
            About
            {pathname === "/about" && (
              <motion.span
                layoutId="active-nav-line"
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </Link>
        </Magnetic>
      </nav>

      <div className="flex items-center space-x-4">
        <Magnetic strength={15}>
          <div>
            <ThemeToggle />
          </div>
        </Magnetic>
        
        {isAdmin && (
          <Magnetic strength={20}>
            <Link 
              href="/admin" 
              className="font-bold text-sm bg-primary text-foreground px-5 py-2.5 rounded-full shadow-lg hover:shadow-primary/20 transition-all block duration-300 border border-primary/25"
            >
              Admin Panel
            </Link>
          </Magnetic>
        )}

        {hasUser ? (
          userMenuNode
        ) : (
          <div className="flex items-center space-x-4">
            <Magnetic strength={15}>
              <SignInButton>
                <button className="font-bold hover:text-primary transition-colors p-2 text-foreground/80">Login</button>
              </SignInButton>
            </Magnetic>
            <Magnetic strength={20}>
              <SignUpButton>
                <button className="bg-inverted-bg text-inverted-text px-6 py-2.5 rounded-full font-bold text-sm hover:scale-[1.03] active:scale-[0.97] transition-all shadow-md">
                  Sign Up
                </button>
              </SignUpButton>
            </Magnetic>
          </div>
        )}
      </div>
    </motion.header>
  );
}
