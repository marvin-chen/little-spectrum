"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isGardenTheme, updateGardenTheme } from "@/lib/data/gardens";

export async function updateThemeAction(gardenId: string, theme: string): Promise<{ error?: string }> {
  const user = await requireUser(`/g/${gardenId}/garden`);
  if (!isGardenTheme(theme)) return { error: "Pick a theme." };
  try {
    await updateGardenTheme(user.id, gardenId, theme);
  } catch {
    return { error: "Only the garden creator can change the theme." };
  }
  revalidatePath(`/g/${gardenId}`, "layout");
  return {};
}
