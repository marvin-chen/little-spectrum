"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateInviteCard } from "@/lib/data/gardens";
import { inviteCardFromForm } from "@/lib/inviteCard";
import { throttle } from "@/lib/ratelimit";

export type InviteCardState = { saved?: boolean; error?: string };

export async function saveInviteCardAction(
  gardenId: string,
  _prev: InviteCardState,
  formData: FormData,
): Promise<InviteCardState> {
  const user = await requireUser(`/g/${gardenId}/settings`);
  if (!throttle(`invite-card:${user.id}`, 30, 60 * 1000)) return { error: "Too many saves. Give it a minute." };
  try {
    await updateInviteCard(user.id, gardenId, inviteCardFromForm(formData));
  } catch {
    return { error: "Only the garden creator can change the invite card." };
  }
  revalidatePath(`/g/${gardenId}/settings`);
  return { saved: true };
}
