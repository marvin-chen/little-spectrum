"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

type Options = {
  channel: string;
  table: "sessions";
  filter: string;
  presence?: { userId: string; name: string };
  fallbackMs?: number;
};

// Subscribes to row changes and presence on one channel. Falls back to polling until the socket is live.
export function useLiveChannel({ channel, table, filter, presence, fallbackMs = 4000 }: Options) {
  const router = useRouter();
  const [online, setOnline] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const refreshAt = useRef(0);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    const refresh = () => {
      const now = Date.now();
      if (now - refreshAt.current < 400) return;
      refreshAt.current = now;
      router.refresh();
    };
    let cancelled = false;
    let live: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      // Row changes are filtered by row level security, so the socket needs the user's token first.
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      const ch = supabase
        .channel(channel, { config: { presence: { key: presence?.userId ?? "" } } })
        .on("postgres_changes", { event: "*", schema: "public", table, filter }, refresh)
        .on("presence", { event: "sync" }, () => {
          const state = ch.presenceState<{ userId: string }>();
          setOnline(
            new Set(
              Object.values(state)
                .flat()
                .map((p) => p.userId),
            ),
          );
        })
        .subscribe(async (status) => {
          setConnected(status === "SUBSCRIBED");
          if (status === "SUBSCRIBED" && presence)
            await ch.track({ userId: presence.userId, name: presence.name, at: Date.now() });
        });
      live = ch;
    })();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", refresh);
      cancelled = true;
      if (live) supabase.removeChannel(live);
    };
    // The presence identity and filter are stable for the life of a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, table, filter, presence?.userId]);

  // Polling fallback: quick while the socket is down, slow once live.
  useEffect(() => {
    const interval = connected ? Math.max(fallbackMs * 4, 15000) : fallbackMs;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) router.refresh();
    }, interval);
    return () => clearInterval(timer);
  }, [connected, fallbackMs, router]);

  return { online, connected };
}
