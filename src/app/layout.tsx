import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventFlow",
  description: "Modern Event Booking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased relative`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AmbientBackground />
            <SmoothScroll>
              {children}
            </SmoothScroll>
            <Toaster position="bottom-right" theme="system" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
