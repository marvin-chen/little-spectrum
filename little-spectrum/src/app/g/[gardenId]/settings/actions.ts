"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { expandGarden, getGardenContext, rotateInvite } from "@/lib/data/gardens";
import { throttle } from "@/lib/ratelimit";

export type SettingsState = { error?: string };

export async function rotateInviteAction(gardenId: string, revokeOnly: boolean): Promise<SettingsState> {
  const user = await requireUser(`/g/${gardenId}/settings`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden || garden.role !== "creator") return { error: "Only the garden creator can change invite links." };
  if (!throttle(`invite:${user.id}`, 10, 60 * 1000)) return { error: "Too many link changes. Give it a minute." };
  try {
    await rotateInvite(user.id, gardenId, revokeOnly);
  } catch {
    return { error: "Could not update the invite link." };
  }
  revalidatePath(`/g/${gardenId}/settings`);
  return {};
}

export async function expandGardenAction(gardenId: string): Promise<SettingsState> {
  const user = await requireUser(`/g/${gardenId}/settings`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden || garden.role !== "creator") return { error: "Only the garden creator can make room." };
  try {
    await expandGarden(user.id, gardenId);
  } catch {
    return { error: "Could not expand the garden." };
  }
  revalidatePath(`/g/${gardenId}`);
  return {};
}
