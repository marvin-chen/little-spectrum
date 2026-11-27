"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { GamesIcon, GardenIcon, HomeIcon, MemoriesIcon } from "@/components/icons/TabIcons";
import { cn } from "@/lib/cn";

export type TabAction = { href: string; label: string; icon: ReactNode };

export function tabsFor(base: string) {
  return [
    { key: "home", href: base, label: "Home", Icon: HomeIcon },
    { key: "games", href: `${base}/games`, label: "Games", Icon: GamesIcon },
    { key: "garden", href: `${base}/garden`, label: "Garden", Icon: GardenIcon },
    { key: "memories", href: `${base}/memories`, label: "Memories", Icon: MemoriesIcon },
  ];
}

export function isTabActive(pathname: string, href: string, base: string) {
  if (href === base) return pathname === base || pathname === `${base}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function activeTabKey(pathname: string, base: string): string | null {
  return tabsFor(base).find((t) => isTabActive(pathname, t.href, base))?.key ?? null;
}

// Floating liquid glass tab bar with a gliding highlight and an optional prominent action.
// Tracks scroll direction so the bar can compact on the way down and expand on the way up.
function useCompactOnScroll(): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 8;
        if (y < 48 || delta < -6 || nearBottom) setCompact(false);
        else if (delta > 6) setCompact(true);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return compact;
}

export function TabBar({ base, action, hidden }: { base: string; action?: TabAction; hidden?: boolean }) {
  const pathname = usePathname();
  const tabs = tabsFor(base);
  const active = activeTabKey(pathname, base);
  const compact = useCompactOnScroll();

  if (hidden) return null;

  return (
    <nav
      aria-label="Primary"
      data-compact={compact || undefined}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex justify-center gap-2.5 px-4 pb-[max(0.875rem,var(--safe-bottom))] transition-transform duration-250 ease-[var(--ease-out-soft)] md:hidden",
        compact && "translate-y-1",
      )}
    >
      <ul
        className={cn(
          "glass relative flex w-full max-w-sm items-stretch rounded-capsule p-1.5 transition-transform duration-250 ease-[var(--ease-out-soft)]",
          compact ? "h-11 max-w-[15rem]" : "h-[var(--tabbar-height)]",
        )}
      >
        {tabs.map(({ key, href, label, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} className="relative z-10 flex-1" data-key={key}>
              {isActive ? (
                <motion.span
                  layoutId="mobile-tab-pill"
                  aria-hidden
                  transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                  className="pointer-events-none absolute inset-0 rounded-capsule bg-ink/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                />
              ) : null}
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "pressable relative z-10 flex h-full flex-col items-center justify-center gap-0.5 rounded-capsule text-[11px] font-semibold transition-colors",
                  isActive ? "text-ink" : "text-ink-2",
                )}
              >
                <Icon
                  active={isActive}
                  className={cn(
                    "transition-transform duration-200 ease-[var(--ease-out-soft)] text-[22px]",
                    compact && "scale-90",
                  )}
                />
                {!compact ? <span className="leading-none">{label}</span> : <span className="sr-only">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      {action ? (
        <Link
          href={action.href}
          aria-label={action.label}
          className={cn(
            "pressable lit flex shrink-0 items-center justify-center rounded-capsule bg-tint text-white shadow-float transition-transform duration-250 ease-[var(--ease-out-soft)]",
            compact ? "size-11" : "size-[var(--tabbar-height)]",
          )}
        >
          {action.icon}
        </Link>
      ) : null}
    </nav>
  );
}

export function SideNav({ base }: { base: string }) {
  const pathname = usePathname();
  const tabs = tabsFor(base);
  const active = activeTabKey(pathname, base);
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="relative flex flex-col gap-1">
        {tabs.map(({ key, href, label, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} data-key={key} className="relative z-10">
              {isActive ? (
                <motion.span
                  layoutId="desktop-nav-pill"
                  aria-hidden
                  transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                  className="pointer-events-none absolute inset-0 rounded-row bg-ink/[0.07]"
                />
              ) : null}
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "pressable relative z-10 flex h-11 items-center gap-3 rounded-row px-3 text-callout font-semibold",
                  isActive ? "text-ink" : "text-ink-2 hover:bg-fill",
                )}
              >
                <Icon active={isActive} className="text-[20px]" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
