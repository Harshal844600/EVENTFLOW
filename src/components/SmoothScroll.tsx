"use client";
import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.15, duration: 0.8, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
