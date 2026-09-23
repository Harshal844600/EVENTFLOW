"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({
  value,
  prefix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1500; // 1.5 seconds smooth count up
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo (starts fast, slows down at the end)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
