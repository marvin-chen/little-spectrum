"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

// Counts from zero to the value on mount using NumberFlow's rolling digits. Honors reduced motion automatically.
export function CountUp({
  value,
  duration = 800,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span className={className} aria-label={String(value)}>
      <span className="sr-only">{value}</span>
      <NumberFlow
        value={shown}
        aria-hidden
        transformTiming={{ duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
        spinTiming={{ duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </span>
  );
}
