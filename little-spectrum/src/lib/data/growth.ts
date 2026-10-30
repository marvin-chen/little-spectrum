import "server-only";
import { cache } from "react";
import type { GrowthEventRow, WeeklyRewardRow } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { formatWeekReset, streakWeeks, weekStartFor } from "@/lib/week";

export type RewardSummary = {
  id: string;
  itemKey: string;
  variant: number;
  ordinal: number;
  weekStart: string;
  sessionId: string | null;
  createdAt: string;
};

export type GrowthSummary = {
  weekStart: string;
  weekResetLabel: string;
  completionsThisWeek: number;
  goal: number;
  rewardedThisWeek: boolean;
  totalCompletions: number;
  streak: number;
  rewards: RewardSummary[];
};

export const WEEKLY_GOAL = 3;

export const getGrowthSummary = cache(async (gardenId: string, timezone: string): Promise<GrowthSummary> => {
  const db = createServiceClient();
  const [{ data: events }, { data: rewards }] = await Promise.all([
    db.from("growth_events").select("*").eq("garden_id", gardenId),
    db.from("weekly_rewards").select("*").eq("garden_id", gardenId).order("ordinal", { ascending: true }),
  ]);
  const eventRows = (events ?? []) as GrowthEventRow[];
  const rewardRows = (rewards ?? []) as WeeklyRewardRow[];
  const weekStart = weekStartFor(new Date(), timezone);
  const weeks = new Set(eventRows.map((e) => e.week_start));
  return {
    weekStart,
    weekResetLabel: formatWeekReset(weekStart, timezone),
    completionsThisWeek: eventRows.filter((e) => e.week_start === weekStart).length,
    goal: WEEKLY_GOAL,
    rewardedThisWeek: rewardRows.some((r) => r.week_start === weekStart),
    totalCompletions: eventRows.length,
    streak: streakWeeks(weeks, weekStart),
    rewards: rewardRows.map((r) => ({
      id: r.id,
      itemKey: r.item_key,
      variant: r.variant,
      ordinal: r.ordinal,
      weekStart: r.week_start,
      sessionId: r.session_id,
      createdAt: r.created_at,
    })),
  };
});
