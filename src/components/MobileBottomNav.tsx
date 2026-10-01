"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Calendar, Ticket, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Smart auto-hide on focused screens like checkout or event detail where bottom booking bar sits
  const isEventDetailOrCheckout = pathname.match(/^\/events\/[^/]+(\/book)?$/);
  if (isEventDetailOrCheckout) {
    return null;
  }

  const navItems = [
    {
      name: "Explore",
      href: "/",
      icon: Compass,
      isActive: pathname === "/",
    },
    {
      name: "Events",
      href: "/events",
      icon: Calendar,
      isActive: pathname.startsWith("/events"),
    },
    {
      name: "My Tickets",
      href: "/dashboard/bookings",
      icon: Ticket,
      isActive: pathname.startsWith("/dashboard/bookings"),
    },
    {
      name: "Account",
      href: "/dashboard/profile",
      icon: User,
      isActive: pathname.startsWith("/dashboard/profile") || pathname.startsWith("/dashboard"),
    },
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden pointer-events-none pb-safe">
      <nav className="pointer-events-auto max-w-md mx-auto bg-card-bg/85 backdrop-blur-2xl border border-card-border/80 rounded-2xl shadow-2xl px-2 py-1.5 flex items-center justify-around relative overflow-hidden transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-90 select-none ${
                active ? "text-foreground font-bold" : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-primary/15 border border-primary/30 rounded-xl -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "text-primary scale-110" : ""}`} />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary" />
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${active ? "font-bold text-foreground" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
