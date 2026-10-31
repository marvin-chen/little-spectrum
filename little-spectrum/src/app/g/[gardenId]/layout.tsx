import { redirect } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/auth";
import { getGardenContext, listGardens } from "@/lib/data/gardens";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { themeFor } from "@/lib/themes";
import { GardenSwitcher } from "./GardenSwitcher";

export const dynamic = "force-dynamic";

export default async function GardenLayout({ children, params }: { children: ReactNode; params: Promise<{ gardenId: string }> }) {
  const { gardenId } = await params;
  if (!isSupabaseConfigured()) redirect("/");
  const user = await requireUser(`/g/${gardenId}`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) redirect("/start?missing=1");
  const gardens = await listGardens(user.id);
  const theme = themeFor(garden.theme);

  return (
    <div style={{ "--color-tint": theme.tint, "--color-tint-soft": theme.tintSoft, "--color-tint-ink": theme.tintInk } as React.CSSProperties}>
    <AppShell
      base={`/g/${gardenId}`}
      action={{ href: `/g/${gardenId}/games`, label: "Start a game", icon: <Plus className="size-6" strokeWidth={2.5} aria-hidden /> }}
      sidebarExtra={<GardenSwitcher gardens={gardens} currentId={gardenId} variant="sidebar" />}
    >
      <ViewTransition
        enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "tab-fade" }}
        exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "tab-fade" }}
        default="none"
      >
        {children}
      </ViewTransition>
    </AppShell>
    </div>
  );
}
