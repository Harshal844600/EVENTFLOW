"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Share2, 
  Check, 
  Copy, 
  X, 
  MessageCircle, 
  Send, 
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

interface EventShareButtonProps {
  title: string;
  eventId?: string;
  className?: string;
  variant?: "pill" | "icon" | "full";
  label?: string;
}

export function EventShareButton({
  title,
  eventId,
  className = "",
  variant = "pill",
  label = "Share with Friends",
}: EventShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [eventUrl, setEventUrl] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const base = window.location.origin;
      const targetUrl = eventId ? `${base}/events/${eventId}` : window.location.href;
      setEventUrl(targetUrl);
    }
  }, [eventId]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    if (navigator.clipboard && eventUrl) {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success("Event link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Hey! Check out this event: "${title}" on EventFlow!`,
          url: eventUrl,
        });
        setIsOpen(false);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Sharing wasn't completed");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`Hey! Check out "${title}" on EventFlow: `);
  const encodedUrl = encodeURIComponent(eventUrl);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-emerald-500/15 hover:border-emerald-500/40 text-emerald-500",
      href: `https://api.whatsapp.com/send?text=${shareText}${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "hover:bg-sky-500/15 hover:border-sky-500/40 text-sky-500",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`,
    },
    {
      name: "X (Twitter)",
      icon: XTwitterIcon,
      color: "hover:bg-foreground/10 hover:border-foreground/30 text-foreground",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      color: "hover:bg-blue-600/15 hover:border-blue-600/40 text-blue-500",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      {variant === "icon" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`w-9 h-9 rounded-xl bg-background/80 hover:bg-background border border-card-border/60 text-secondary hover:text-foreground flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm ${className}`}
          title="Share event with friends"
          aria-label="Share event"
        >
          <Share2 className="w-4 h-4" />
        </button>
      ) : variant === "full" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-card-border/80 bg-card-bg/60 hover:bg-card-bg font-anton text-sm uppercase tracking-wider text-foreground hover:text-primary transition-all duration-200 active:scale-98 shadow-sm ${className}`}
        >
          <Users className="w-4 h-4 text-primary" />
          <span>{label}</span>
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card-bg/70 hover:bg-card-bg border border-card-border/70 text-secondary hover:text-foreground text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm ${className}`}
          title="Share this event with friends"
        >
          <Share2 className="w-3.5 h-3.5 text-primary" />
          <span>{label}</span>
        </button>
      )}

      {/* Share with Friends Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-md bg-card-bg/95 backdrop-blur-2xl border border-card-border/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-anton text-xl uppercase tracking-wide text-foreground">
                      Share with Friends
                    </h3>
                    <p className="text-[11px] text-secondary font-medium">
                      Invite your crew to this experience
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl border border-card-border/60 flex items-center justify-center text-secondary hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event Preview snippet */}
              <div className="p-3.5 rounded-2xl bg-foreground/5 border border-card-border/50">
                <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">
                  Event
                </p>
                <p className="font-anton text-base uppercase text-foreground leading-tight line-clamp-2">
                  {title}
                </p>
              </div>

              {/* Quick Social Share Buttons */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                  Quick Share
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {shareLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-card-border/60 bg-card-bg/50 transition-all duration-200 active:scale-95 group ${item.color}`}
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold tracking-tight">
                          {item.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Native App Share (Mobile / Supported Browsers) */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-charcoal font-anton text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-primary/20"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share via Any App</span>
                </button>
              )}

              {/* Copy URL input bar */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                  Or Copy Event Link
                </p>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-card-border/80 bg-foreground/5">
                  <input
                    type="text"
                    readOnly
                    value={eventUrl}
                    className="flex-1 bg-transparent px-2.5 text-xs text-foreground font-mono outline-none truncate select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
