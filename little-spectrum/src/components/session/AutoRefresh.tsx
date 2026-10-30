"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Refreshes server data while the tab is visible. Only mounted when something is pending.
export function AutoRefresh({ intervalMs = 4000, enabled = true }: { intervalMs?: number; enabled?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        if (document.visibilityState === "visible" && navigator.onLine) router.refresh();
      }, intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    };
    const onOnline = () => router.refresh();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onOnline);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("focus", onOnline);
    };
  }, [router, intervalMs, enabled]);
  return null;
}
