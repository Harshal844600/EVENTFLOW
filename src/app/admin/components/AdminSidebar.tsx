"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, Ticket, Users, FileText } from "lucide-react";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminSidebar({
  userName,
  avatarLetter,
}: {
  userName: string;
  avatarLetter: string;
}) {
  const pathname = usePathname();

  const links: SidebarLink[] = [
    { name: "Analytics", href: "/admin", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { name: "Events", href: "/admin/events", icon: <Calendar className="w-4.5 h-4.5" /> },
    { name: "Bookings", href: "/admin/bookings", icon: <Ticket className="w-4.5 h-4.5" /> },
    { name: "Users", href: "/admin/users", icon: <Users className="w-4.5 h-4.5" /> },
    { name: "Audit Logs", href: "/admin/logs", icon: <FileText className="w-4.5 h-4.5" /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-card-border bg-card-bg flex flex-col relative z-20 transition-theme">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-card-border">
        <Link href="/" className="font-anton text-2xl uppercase tracking-wider text-primary flex items-center">
          Admin<span className="text-foreground animate-pulse-glow">.</span>
        </Link>
        <Link 
          href="/dashboard" 
          className="text-xs text-foreground/50 hover:text-foreground hover:border-foreground/35 transition-colors flex items-center border border-card-border px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider"
        >
          Exit
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 relative">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative group ${
                isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {/* Sliding Capsule Highlight */}
              {isActive && (
                <motion.div
                  layoutId="active-admin-nav"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
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

      {/* Footer Profile Pill */}
      <div className="p-4 border-t border-card-border">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-foreground/5 border border-card-border/30 hover:bg-foreground/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary text-foreground flex items-center justify-center font-anton text-lg shadow-md select-none">
            {avatarLetter}
          </div>
          <div className="text-sm overflow-hidden flex-1 select-none">
            <p className="font-bold text-foreground truncate leading-tight">{userName}</p>
            <p className="text-secondary text-xs truncate">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
