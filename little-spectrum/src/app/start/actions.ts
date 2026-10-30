"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createGarden, isGardenTheme } from "@/lib/data/gardens";
import { cleanText } from "@/lib/games/engine";
import { throttle } from "@/lib/ratelimit";
import { isValidTimeZone } from "@/lib/week";

export type CreateGardenState = { error?: string };

export async function createGardenAction(_prev: CreateGardenState, formData: FormData): Promise<CreateGardenState> {
  const user = await requireUser("/start");
  const name = cleanText(formData.get("name"), 40);
  if (!name) return { error: "Give your garden a name up to 40 characters." };
  const capacity = formData.get("capacity") === "8" ? 8 : 2;
  const theme = String(formData.get("theme") ?? "meadow");
  if (!isGardenTheme(theme)) return { error: "Pick a theme." };
  const rawTimezone = String(formData.get("timezone") ?? "UTC");
  const timezone = isValidTimeZone(rawTimezone) ? rawTimezone : "UTC";
  if (!throttle(`create-garden:${user.id}`, 5, 60 * 60 * 1000)) {
    return { error: "That is a lot of gardens for one hour. Try again later." };
  }
  let gardenId: string;
  try {
    gardenId = await createGarden(user.id, { name, capacity, theme, timezone });
  } catch {
    return { error: "Could not create the garden. Please try again." };
  }
  redirect(`/g/${gardenId}?new=1`);
}
