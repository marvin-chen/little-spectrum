import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "./Brand";
import { SideNav, TabBar } from "./TabBar";

type AppShellProps = {
  base: string;
  children: ReactNode;
  sidebarExtra?: ReactNode;
  wide?: boolean;
};

export function AppShell({ base, children, sidebarExtra, wide }: AppShellProps) {
  return (
    <div className="min-h-dvh md:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-capsule focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-line bg-ivory-deep/60 px-4 py-6 md:flex">
        <Link href="/" className="px-2">
          <Wordmark />
        </Link>
        <SideNav base={base} />
        {sidebarExtra ? <div className="mt-auto">{sidebarExtra}</div> : null}
      </aside>
      <main
        id="main"
        tabIndex={-1}
        className={
          wide
            ? "mx-auto w-full min-w-0 max-w-5xl px-4 pt-[max(0.75rem,var(--safe-top))] pb-[calc(var(--tabbar-height)+2rem+var(--safe-bottom))] md:px-8 md:pb-12"
            : "mx-auto w-full min-w-0 max-w-[var(--content-max)] px-4 pt-[max(0.75rem,var(--safe-top))] pb-[calc(var(--tabbar-height)+2rem+var(--safe-bottom))] md:px-8 md:pb-12"
        }
      >
        {children}
      </main>
      <TabBar base={base} />
    </div>
  );
}

export function PlainShell({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return (
    <main
      className={
        narrow
          ? "mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1rem,var(--safe-top))] pb-[max(1.5rem,var(--safe-bottom))]"
          : "mx-auto flex min-h-dvh w-full max-w-[var(--content-max)] flex-col px-4 pt-[max(1rem,var(--safe-top))] pb-[max(1.5rem,var(--safe-bottom))]"
      }
    >
      {children}
    </main>
  );
}
