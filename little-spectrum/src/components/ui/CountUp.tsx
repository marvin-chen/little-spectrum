"use client";

import { useEffect, useState } from "react";

// Counts from zero to the value once on mount. Honors reduced motion by jumping straight to the end.
export function CountUp({ value, duration = 800, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return (
    <span className={className} aria-label={String(value)}>
      {shown}
    </span>
  );
}
