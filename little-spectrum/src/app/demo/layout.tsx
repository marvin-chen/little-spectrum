import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default function DemoLayout({ children }: { children: ReactNode }) {
  // Demo mode must never shadow a real backend.
  if (isSupabaseConfigured()) redirect("/");
  return (
    <AppShell
      base="/demo"
      action={{
        href: "/demo/games",
        label: "Browse games",
        icon: <Plus className="size-6" strokeWidth={2.5} aria-hidden />,
      }}
    >
      <div
        role="note"
        className="mt-1 mb-4 flex flex-col gap-2 rounded-card bg-amber-soft px-4 py-3 ring-1 ring-amber/40 sm:flex-row sm:items-center sm:gap-3"
      >
        <Badge tone="ink" className="shrink-0 self-start">
          Demo mode
        </Badge>
        <p className="min-w-0 flex-1 text-footnote text-amber-ink">
          This is a sample garden with made-up friends. Nothing here is saved.
        </p>
        <Link
          href="/demo/setup"
          className="pressable inline-flex shrink-0 items-center gap-1 self-start text-footnote font-semibold text-amber-ink underline decoration-amber-ink/40 underline-offset-2 hover:decoration-amber-ink"
        >
          Enable real multiplayer <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {children}
    </AppShell>
  );
}
