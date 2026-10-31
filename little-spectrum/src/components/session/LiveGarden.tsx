"use client";

import { useLiveChannel } from "./useLiveChannel";

// Refreshes Home as soon as any session you are part of changes.
export function LiveGarden({ gardenId, fallbackMs }: { gardenId: string; fallbackMs: number }) {
  useLiveChannel({ channel: `garden:${gardenId}`, table: "sessions", filter: `garden_id=eq.${gardenId}`, fallbackMs });
  return null;
}
