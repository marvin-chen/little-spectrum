"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { joinGarden } from "@/lib/data/gardens";
import { throttle } from "@/lib/ratelimit";

export type JoinState = { error?: string; full?: boolean };

export async function joinAction(token: string): Promise<JoinState> {
  const user = await requireUser(`/join/${token}`);
  if (!throttle(`join:${user.id}`, 20, 60 * 1000)) return { error: "Too many attempts. Give it a minute." };
  let result;
  try {
    result = await joinGarden(user.id, token);
  } catch {
    return { error: "Could not join right now. Please try again." };
  }
  if (result.status === "invalid") return { error: "This invite link is no longer valid." };
  if (result.status === "full") return { full: true };
  redirect(`/g/${result.gardenId}${result.status === "joined" ? "?joined=1" : ""}`);
}
