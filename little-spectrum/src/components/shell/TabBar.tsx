"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, Flower2, House, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function tabsFor(base: string) {
  return [
    { href: base, label: "Home", Icon: House },
    { href: `${base}/games`, label: "Games", Icon: Sparkles },
    { href: `${base}/garden`, label: "Garden", Icon: Flower2 },
    { href: `${base}/memories`, label: "Memories", Icon: BookHeart },
  ];
}

export function isTabActive(pathname: string, href: string, base: string) {
  if (href === base) return pathname === base || pathname === `${base}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TabBar({ base }: { base: string }) {
  const pathname = usePathname();
  const tabs = tabsFor(base);
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,var(--safe-bottom))] md:hidden"
    >
      <ul className="glass flex h-[var(--tabbar-height)] w-full max-w-md items-stretch rounded-capsule p-1.5 shadow-float ring-1 ring-line">
        {tabs.map(({ href, label, Icon }) => {
          const active = isTabActive(pathname, href, base);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pressable flex h-full flex-col items-center justify-center gap-0.5 rounded-capsule text-caption font-semibold",
                  active ? "bg-ink text-ivory" : "text-ink-2 hover:bg-fill",
                )}
              >
                <Icon className="size-[22px]" aria-hidden strokeWidth={active ? 2.4 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav({ base }: { base: string }) {
  const pathname = usePathname();
  const tabs = tabsFor(base);
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex flex-col gap-1">
        {tabs.map(({ href, label, Icon }) => {
          const active = isTabActive(pathname, href, base);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pressable flex h-11 items-center gap-3 rounded-row px-3 text-callout font-semibold",
                  active ? "bg-ink text-ivory" : "text-ink-2 hover:bg-fill",
                )}
              >
                <Icon className="size-5" aria-hidden strokeWidth={active ? 2.4 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
