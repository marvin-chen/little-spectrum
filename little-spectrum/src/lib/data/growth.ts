import "server-only";
import { cache } from "react";
import type { WeeklyRewardRow } from "@/lib/db";
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

export const getGrowthSummary = cache(async (gardenId: string, timezone: string): Promise<GrowthSummary> => {
  const db = createServiceClient();
  const [counts, { data: rewards, error: rewardsError }] = await Promise.all([
    db.rpc("garden_week_counts", { p_garden: gardenId }),
    db.from("weekly_rewards").select("*").eq("garden_id", gardenId).order("ordinal", { ascending: true }),
  ]);
  const failure = counts.error ?? rewardsError;
  if (failure) throw new Error(failure.message);
  const weekCounts = (counts.data ?? []) as Array<{ week_start: string; completions: number }>;
  const rewardRows = (rewards ?? []) as WeeklyRewardRow[];
  const weekStart = weekStartFor(new Date(), timezone);
  return {
    weekStart,
    weekResetLabel: formatWeekReset(weekStart, timezone),
    completionsThisWeek: weekCounts.find((w) => w.week_start === weekStart)?.completions ?? 0,
    goal: WEEKLY_GOAL,
    rewardedThisWeek: rewardRows.some((r) => r.week_start === weekStart),
    totalCompletions: weekCounts.reduce((total, w) => total + w.completions, 0),
    streak: streakWeeks(new Set(weekCounts.map((w) => w.week_start)), weekStart),
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
  const growth = await getGrowthSummary(gardenId, timezone);
  const weeks = [...new Set([growth.weekStart, ...growth.rewards.map((r) => r.weekStart)])];
  // One embedded query, so the request does not grow with every round. Newest first, so the 1000 row
  // API limit can only drop the rounds behind the oldest keepsakes.
  const { data, error } = await db
    .from("growth_events")
    .select("session_id, week_start, sessions!inner(game, revealed_at, session_participants(user_id))")
    .eq("garden_id", gardenId)
    .in("week_start", weeks)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  const events = (
    (data ?? []) as unknown as Array<{
      session_id: string;
      week_start: string;
      sessions: { game: GameKey; revealed_at: string | null; session_participants: Array<{ user_id: string }> };
    }>
  ).map((e) => ({
    id: e.session_id,
    weekStart: e.week_start,
    game: e.sessions.game,
    revealedAt: e.sessions.revealed_at,
    people: e.sessions.session_participants.map((p) => p.user_id),
  }));

  const mine = new Set(events.filter((e) => e.people.includes(userId)).map((e) => e.id));
  const peopleIds = [...new Set(events.filter((e) => mine.has(e.id)).flatMap((e) => e.people))];
  const { data: profiles } = peopleIds.length
    ? await db.from("profiles").select("id, display_name").in("id", peopleIds)
    : { data: [] };
  const nameBy = new Map(
    ((profiles ?? []) as Array<{ id: string; display_name: string }>).map((p) => [p.id, p.display_name]),
  );

  const items = growth.rewards.map((reward) => ({
    ...reward,
    activities: events
      .filter((e) => e.weekStart === reward.weekStart)
      .map((e): WeekActivity => ({
        id: e.id,
        game: e.game,
        revealedAt: e.revealedAt,
        participantCount: e.people.length,
        isParticipant: mine.has(e.id),
        participantNames: mine.has(e.id) ? e.people.map((id) => nameBy.get(id) ?? "Friend") : [],
      }))
      .sort((a, b) => (a.revealedAt ?? "").localeCompare(b.revealedAt ?? "")),
  }));
  const contributors = new Set(events.filter((e) => e.weekStart === growth.weekStart).flatMap((e) => e.people));
  return { items, contributorsThisWeek: contributors.size };
}
