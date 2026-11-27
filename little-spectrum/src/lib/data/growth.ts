import "server-only";
import { cache } from "react";
import type { GrowthEventRow, WeeklyRewardRow } from "@/lib/db";
import type { GameKey } from "@/lib/games";
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

const getGrowthEvents = cache(async (gardenId: string): Promise<GrowthEventRow[]> => {
  const { data } = await createServiceClient().from("growth_events").select("*").eq("garden_id", gardenId);
  return (data ?? []) as GrowthEventRow[];
});

export const getGrowthSummary = cache(async (gardenId: string, timezone: string): Promise<GrowthSummary> => {
  const db = createServiceClient();
  const [eventRows, { data: rewards }] = await Promise.all([
    getGrowthEvents(gardenId),
    db.from("weekly_rewards").select("*").eq("garden_id", gardenId).order("ordinal", { ascending: true }),
  ]);
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

export type WeekActivity = {
  id: string;
  game: GameKey;
  revealedAt: string | null;
  participantCount: number;
  isParticipant: boolean;
  participantNames: string[];
};

export type GardenItemDetail = RewardSummary & { activities: WeekActivity[] };

export type GardenDetails = {
  items: GardenItemDetail[];
  contributorsThisWeek: number;
};

// Rewards with the completed rounds of their week. Only participants get names and links.
export async function getGardenDetails(gardenId: string, userId: string, timezone: string): Promise<GardenDetails> {
  const db = createServiceClient();
  const [growth, eventRows] = await Promise.all([getGrowthSummary(gardenId, timezone), getGrowthEvents(gardenId)]);
  const sessionIds = eventRows.map((e) => e.session_id);
  const [{ data: sessions }, { data: participants }] = sessionIds.length
    ? await Promise.all([
        db.from("sessions").select("id, game, revealed_at").in("id", sessionIds),
        db.from("session_participants").select("session_id, user_id").in("session_id", sessionIds),
      ])
    : [{ data: [] }, { data: [] }];
  const participantRows = (participants ?? []) as Array<{ session_id: string; user_id: string }>;
  const myIds = new Set(participantRows.filter((p) => p.user_id === userId).map((p) => p.session_id));
  const peopleIds = [...new Set(participantRows.filter((p) => myIds.has(p.session_id)).map((p) => p.user_id))];
  const { data: profiles } = peopleIds.length
    ? await db.from("profiles").select("id, display_name").in("id", peopleIds)
    : { data: [] };
  const nameBy = new Map(((profiles ?? []) as Array<{ id: string; display_name: string }>).map((p) => [p.id, p.display_name]));
  const sessionBy = new Map(((sessions ?? []) as Array<{ id: string; game: GameKey; revealed_at: string | null }>).map((s) => [s.id, s]));

  const activityFor = (sessionId: string): WeekActivity | null => {
    const s = sessionBy.get(sessionId);
    if (!s) return null;
    const people = participantRows.filter((p) => p.session_id === sessionId);
    const mine = myIds.has(sessionId);
    return {
      id: sessionId,
      game: s.game,
      revealedAt: s.revealed_at,
      participantCount: people.length,
      isParticipant: mine,
      participantNames: mine ? people.map((p) => nameBy.get(p.user_id) ?? "Friend") : [],
    };
  };

  const items = growth.rewards.map((reward) => ({
    ...reward,
    activities: eventRows
      .filter((e) => e.week_start === reward.weekStart)
      .map((e) => activityFor(e.session_id))
      .filter((a): a is WeekActivity => a !== null)
      .sort((a, b) => (a.revealedAt ?? "").localeCompare(b.revealedAt ?? "")),
  }));
  const thisWeekSessions = new Set(eventRows.filter((e) => e.week_start === growth.weekStart).map((e) => e.session_id));
  const contributors = new Set(participantRows.filter((p) => thisWeekSessions.has(p.session_id)).map((p) => p.user_id));
  return { items, contributorsThisWeek: contributors.size };
}
