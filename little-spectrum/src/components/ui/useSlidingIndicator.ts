"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Measures the active child so a highlight pill can glide between options.
export function useSlidingIndicator<T extends HTMLElement>(activeKey: string | null) {
  const containerRef = useRef<T>(null);
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number; ready: boolean }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>(`[data-key="${CSS.escape(activeKey ?? "")}"]`);
      if (!active) {
        setRect((prev) => ({ ...prev, width: 0 }));
        return;
      }
      const containerBox = container.getBoundingClientRect();
      const box = active.getBoundingClientRect();
      setRect((prev) => ({
        left: box.left - containerBox.left,
        top: box.top - containerBox.top,
        width: box.width,
        height: box.height,
        ready: prev.ready || true,
      }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  return { containerRef, rect };
}
