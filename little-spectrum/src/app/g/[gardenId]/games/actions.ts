"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { createSession } from "@/lib/data/sessions";
import { throttle } from "@/lib/ratelimit";

export type StartSessionState = { error?: string };

export async function startSessionAction(
  gardenId: string,
  game: string,
  participantIds: string[],
): Promise<StartSessionState> {
  const user = await requireUser(`/g/${gardenId}/games`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) return { error: "You are not in this garden." };
  if (garden.members.length < 2) return { error: "Invite a friend first. Games need at least two people." };
  if (!throttle(`start:${user.id}`, 30, 60 * 60 * 1000)) return { error: "Slow down a little. Try again in a bit." };
  const result = await createSession(user.id, gardenId, game, participantIds);
  if (!result.ok) return { error: result.error };
  redirect(`/g/${gardenId}/play/${result.value}`);
}
