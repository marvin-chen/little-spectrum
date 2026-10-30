import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/auth";
import { getGardenContext, listGardens } from "@/lib/data/gardens";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { GardenSwitcher } from "./GardenSwitcher";

export const dynamic = "force-dynamic";

export default async function GardenLayout({ children, params }: { children: ReactNode; params: Promise<{ gardenId: string }> }) {
  const { gardenId } = await params;
  if (!isSupabaseConfigured()) redirect("/");
  const user = await requireUser(`/g/${gardenId}`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) redirect("/start?missing=1");
  const gardens = await listGardens(user.id);

  return (
    <AppShell base={`/g/${gardenId}`} sidebarExtra={<GardenSwitcher gardens={gardens} currentId={gardenId} variant="sidebar" />}>
      {children}
    </AppShell>
  );
}
