"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GamesIcon, GardenIcon, HomeIcon, MemoriesIcon } from "@/components/icons/TabIcons";
import { useSlidingIndicator } from "@/components/ui/useSlidingIndicator";
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
export function TabBar({ base, action, hidden }: { base: string; action?: TabAction; hidden?: boolean }) {
  const pathname = usePathname();
  const tabs = tabsFor(base);
  const active = activeTabKey(pathname, base);
  const { containerRef, rect } = useSlidingIndicator<HTMLUListElement>(active);

  if (hidden) return null;

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 flex justify-center gap-2.5 px-4 pb-[max(0.875rem,var(--safe-bottom))] md:hidden">
      <ul ref={containerRef} className="glass relative flex h-[var(--tabbar-height)] w-full max-w-sm items-stretch rounded-capsule p-1.5">
        <span
          aria-hidden
          className={cn(
            "absolute top-1.5 bottom-1.5 rounded-capsule bg-ink/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
            rect.ready && "transition-[transform,width] duration-[420ms] ease-[var(--ease-spring)]",
          )}
          style={{ transform: `translateX(${rect.left}px)`, width: rect.width, opacity: rect.width ? 1 : 0 }}
        />
        {tabs.map(({ key, href, label, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} className="relative z-10 flex-1" data-key={key}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "pressable flex h-full flex-col items-center justify-center gap-0.5 rounded-capsule text-[11px] font-semibold transition-colors",
                  isActive ? "text-ink" : "text-ink-2",
                )}
              >
                <Icon active={isActive} className="text-[22px]" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {action ? (
        <Link
          href={action.href}
          aria-label={action.label}
          className="pressable lit flex size-[var(--tabbar-height)] shrink-0 items-center justify-center rounded-capsule bg-ink text-canvas shadow-float"
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
  const { containerRef, rect } = useSlidingIndicator<HTMLUListElement>(active);
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul ref={containerRef} className="relative flex flex-col gap-1">
        <span
          aria-hidden
          className={cn("absolute left-0 h-11 w-full rounded-row bg-ink/[0.07]", rect.ready && "transition-transform duration-[380ms] ease-[var(--ease-spring)]")}
          style={{ transform: `translateY(${rect.top ?? 0}px)`, opacity: rect.width ? 1 : 0 }}
        />
        {tabs.map(({ key, href, label, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} data-key={key} className="relative z-10">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn("pressable flex h-11 items-center gap-3 rounded-row px-3 text-callout font-semibold", isActive ? "text-ink" : "text-ink-2 hover:bg-fill")}
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
