"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Magnetic } from "./Magnetic";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Menu, X, Calendar, Info, Shield, ArrowRight } from "lucide-react";
import React from "react";

interface NavbarClientProps {
  isAdmin: boolean;
  hasUser: boolean;
  userMenuNode?: React.ReactNode;
}

export function NavbarClient({ isAdmin, hasUser, userMenuNode }: NavbarClientProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Dynamic header properties based on scroll
  const headerHeight = useTransform(scrollY, [0, 100], [76, 64]);
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(var(--background-rgb), 0)", "rgba(var(--background-rgb), 0.9)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <>
      <motion.header
        style={{ height: headerHeight }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 transition-theme"
      >
        <motion.div 
          className="absolute inset-0 -z-10 backdrop-blur-md border-b border-card-border/80"
          style={{
            opacity: borderOpacity,
            backgroundColor: headerBackground
          }}
        />

        {/* Brand Logo */}
        <Magnetic strength={15}>
          <Link href="/" className="font-anton text-2xl sm:text-3xl uppercase tracking-wide flex items-center">
            EventFlow<span className="text-primary animate-pulse-glow">.</span>
          </Link>
        </Magnetic>

        {/* Desktop Navigation */}
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

        {/* Desktop CTA & Actions */}
        <div className="hidden md:flex items-center space-x-4">
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
            <div className="flex items-center space-x-3">
              <Magnetic strength={15}>
                <SignInButton>
                  <button className="font-bold hover:text-primary transition-colors px-3 py-2 text-foreground/80 text-sm">
                    Login
                  </button>
                </SignInButton>
              </Magnetic>
              <Magnetic strength={20}>
                <SignUpButton>
                  <button className="bg-inverted-bg text-inverted-text px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:scale-[1.03] active:scale-[0.97] transition-all shadow-md">
                    Sign Up
                  </button>
                </SignUpButton>
              </Magnetic>
            </div>
          )}
        </div>

        {/* Mobile Action Row: Theme, User / Login, Hamburger */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          
          {hasUser && userMenuNode}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="w-10 h-10 rounded-xl bg-card-bg/80 border border-card-border flex items-center justify-center text-foreground hover:bg-card-border/40 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Slide-Out Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 right-0 z-50 bg-card-bg/95 backdrop-blur-2xl border-b border-card-border shadow-2xl p-6 pt-20 md:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-card-border/60 pb-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-anton text-2xl uppercase tracking-wide"
                >
                  EventFlow<span className="text-primary">.</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl border border-card-border flex items-center justify-center text-secondary hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2 mb-6">
                <Link
                  href="/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-xl font-anton text-lg uppercase tracking-wider transition-colors ${
                    pathname.startsWith("/events")
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "hover:bg-foreground/5 text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Explore Events</span>
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-xl font-anton text-lg uppercase tracking-wider transition-colors ${
                    pathname === "/about"
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "hover:bg-foreground/5 text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-secondary" />
                    <span>About EventFlow</span>
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl font-anton text-lg uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 transition-colors`}
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="w-5 h-5" />
                      <span>Admin Suite</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Mobile Auth Actions */}
              {!hasUser && (
                <div className="pt-4 border-t border-card-border/60 space-y-3">
                  <SignInButton>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 rounded-xl border border-card-border font-anton text-base uppercase tracking-wider text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      Login to Account
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 rounded-xl bg-primary text-charcoal font-anton text-base uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      Create Account
                    </button>
                  </SignUpButton>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
