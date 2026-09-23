"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, User } from "lucide-react";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardSidebar({
  userName,
  avatarLetter,
  email,
}: {
  userName: string;
  avatarLetter: string;
  email: string;
}) {
  const pathname = usePathname();

  const links: SidebarLink[] = [
    { name: "My Bookings", href: "/dashboard/bookings", icon: <Ticket className="w-4.5 h-4.5" /> },
    { name: "My Profile", href: "/dashboard/profile", icon: <User className="w-4.5 h-4.5" /> },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-card-bg/40 backdrop-blur-sm border border-card-border/60 rounded-3xl p-6 flex flex-col relative z-20 transition-theme min-h-[auto] md:min-h-[400px] shadow-lg">
      {/* Header Profile Pill */}
      <div className="mb-6 pb-6 border-b border-card-border/30">
        <div className="flex items-center space-x-3 p-2 rounded-2xl bg-foreground/5 border border-card-border/20">
          <div className="w-10 h-10 rounded-full bg-primary text-foreground flex items-center justify-center font-anton text-lg shadow-md select-none shrink-0">
            {avatarLetter}
          </div>
          <div className="text-sm overflow-hidden flex-1 select-none">
            <p className="font-bold text-foreground truncate leading-tight">{userName}</p>
            <p className="text-foreground/60 text-xs truncate mt-0.5">{email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative group ${
                isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {/* Sliding Capsule Highlight */}
              {isActive && (
                <motion.div
                  layoutId="active-dashboard-nav"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              
              {/* Icon */}
              <span className={`transition-transform duration-300 ${isActive ? "text-primary scale-110" : "text-foreground/40 group-hover:scale-110 group-hover:text-foreground/60"}`}>
                {link.icon}
              </span>
              
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
