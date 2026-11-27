import "server-only";
import { cache } from "react";
import { raiseIfUnavailable } from "@/lib/backend";
import type { GardenRow, MembershipRow, ProfileRow } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { newInviteToken } from "@/lib/tokens";
import { parseInviteCard, type InviteCard } from "@/lib/inviteCard";

export type GardenMember = {
  userId: string;
  name: string;
  avatar: string;
  role: "creator" | "member";
  joinedAt: string;
};

export type GardenContext = {
  id: string;
  name: string;
  capacity: number;
  theme: string;
  timezone: string;
  createdAt: string;
  role: "creator" | "member";
  members: GardenMember[];
  inviteToken: string | null;
  inviteCard: InviteCard;
  inviteCardUpdatedAt: string;
};

export type GardenSummary = {
  id: string;
  name: string;
  capacity: number;
  theme: string;
  memberCount: number;
  role: "creator" | "member";
};

export const GARDEN_THEMES = ["meadow", "sunset", "lagoon", "orchard", "dusk", "citrus"] as const;
export type GardenTheme = (typeof GARDEN_THEMES)[number];

export function isGardenTheme(value: string): value is GardenTheme {
  return (GARDEN_THEMES as readonly string[]).includes(value);
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listGardens = cache(async (userId: string): Promise<GardenSummary[]> => {
  const db = createServiceClient();
  const { data: memberships, error } = await db
    .from("memberships")
    .select("garden_id, role, joined_at")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true });
  raiseIfUnavailable(error);
  const ids = (memberships ?? []).map((m) => m.garden_id as string);
  if (ids.length === 0) return [];
  const [{ data: gardens }, { data: counts }] = await Promise.all([
    db.from("gardens").select("id, name, capacity, theme").in("id", ids),
    db.from("memberships").select("garden_id").in("garden_id", ids),
  ]);
  const countBy = new Map<string, number>();
  for (const row of counts ?? []) countBy.set(row.garden_id, (countBy.get(row.garden_id) ?? 0) + 1);
  const byId = new Map((gardens ?? []).map((g) => [g.id as string, g]));
  return ids
    .map((id) => {
      const g = byId.get(id);
      const m = memberships!.find((x) => x.garden_id === id)!;
      if (!g) return null;
      return {
        id,
        name: g.name as string,
        capacity: g.capacity as number,
        theme: g.theme as string,
        memberCount: countBy.get(id) ?? 0,
        role: m.role as "creator" | "member",
      };
    })
    .filter((g): g is GardenSummary => g !== null);
});

export const getGardenContext = cache(async (gardenId: string, userId: string): Promise<GardenContext | null> => {
  if (!UUID_RE.test(gardenId)) return null;
  const db = createServiceClient();
  const { data: membership, error } = await db
    .from("memberships")
    .select("role")
    .eq("garden_id", gardenId)
    .eq("user_id", userId)
    .maybeSingle();
  raiseIfUnavailable(error);
  if (!membership) return null;
  const [{ data: garden }, { data: memberships }, { data: invitation }] = await Promise.all([
    db.from("gardens").select("*").eq("id", gardenId).single<GardenRow>(),
    db.from("memberships").select("*").eq("garden_id", gardenId).order("joined_at", { ascending: true }),
    db
      .from("invitations")
      .select("token")
      .eq("garden_id", gardenId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!garden) return null;
  const rows = (memberships ?? []) as MembershipRow[];
  const { data: profiles } = await db
    .from("profiles")
    .select("id, display_name, avatar")
    .in(
      "id",
      rows.map((m) => m.user_id),
    );
  const profileBy = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));
  return {
    id: garden.id,
    name: garden.name,
    capacity: garden.capacity,
    theme: garden.theme,
    timezone: garden.timezone,
    createdAt: garden.created_at,
    role: membership.role as "creator" | "member",
    members: rows.map((m) => ({
      userId: m.user_id,
      name: profileBy.get(m.user_id)?.display_name ?? "Friend",
      avatar: profileBy.get(m.user_id)?.avatar ?? "sun:amber",
      role: m.role,
      joinedAt: m.joined_at,
    })),
    inviteToken: (invitation?.token as string | undefined) ?? null,
    inviteCard: parseInviteCard((garden as unknown as { invite_card?: unknown }).invite_card),
    inviteCardUpdatedAt:
      (garden as unknown as { invite_card_updated_at?: string }).invite_card_updated_at ?? garden.created_at,
  };
});

export async function createGarden(
  userId: string,
  input: { name: string; capacity: 2 | 8; theme: GardenTheme; timezone: string },
): Promise<string> {
  const db = createServiceClient();
  const { data, error } = await db.rpc("create_garden", {
    p_user: userId,
    p_name: input.name,
    p_capacity: input.capacity,
    p_theme: input.theme,
    p_timezone: input.timezone,
    p_token: newInviteToken(),
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export type JoinResult = { status: "joined" | "member" | "full"; gardenId: string } | { status: "invalid" };

export async function joinGarden(userId: string, token: string): Promise<JoinResult> {
  const db = createServiceClient();
  const { data, error } = await db.rpc("join_garden", { p_user: userId, p_token: token });
  if (error) throw new Error(error.message);
  const result = data as { status: JoinResult["status"]; garden_id?: string };
  if (result.status === "invalid") return { status: "invalid" };
  return { status: result.status, gardenId: result.garden_id as string };
}

export type InviteInfo =
  | { status: "invalid" }
  | {
      status: "open" | "full";
      gardenId: string;
      gardenName: string;
      theme: string;
      capacity: number;
      memberCount: number;
      members: Array<{ id: string; name: string; avatar: string }>;
      creatorName: string;
      timezone: string;
      card: InviteCard;
      cardVersion: string;
    };

export async function getInviteInfo(token: string): Promise<InviteInfo> {
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return { status: "invalid" };
  const db = createServiceClient();
  const { data: invitation } = await db
    .from("invitations")
    .select("garden_id, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (!invitation || invitation.revoked_at) return { status: "invalid" };
  const [{ data: garden }, { data: memberships }] = await Promise.all([
    db
      .from("gardens")
      .select("id, name, theme, capacity, timezone, created_by, invite_card, invite_card_updated_at")
      .eq("id", invitation.garden_id)
      .single(),
    db
      .from("memberships")
      .select("user_id")
      .eq("garden_id", invitation.garden_id)
      .order("joined_at", { ascending: true }),
  ]);
  if (!garden) return { status: "invalid" };
  const ids = (memberships ?? []).map((m) => m.user_id as string);
  const { data: profiles } = await db.from("profiles").select("id, display_name, avatar").in("id", ids);
  const rows = (profiles ?? []) as ProfileRow[];
  const byId = new Map(rows.map((p) => [p.id, p]));
  return {
    status: ids.length >= garden.capacity ? "full" : "open",
    gardenId: garden.id,
    gardenName: garden.name,
    theme: garden.theme,
    capacity: garden.capacity,
    memberCount: ids.length,
    members: ids.map((id) => ({
      id,
      name: byId.get(id)?.display_name ?? "Friend",
      avatar: byId.get(id)?.avatar ?? "sun:amber",
    })),
    creatorName: byId.get(garden.created_by as string)?.display_name ?? "A friend",
    timezone: garden.timezone as string,
    card: parseInviteCard(garden.invite_card),
    cardVersion: String(new Date((garden.invite_card_updated_at as string) ?? 0).getTime()),
  };
}

export async function rotateInvite(userId: string, gardenId: string, revokeOnly: boolean): Promise<void> {
  const db = createServiceClient();
  const { error } = await db.rpc("rotate_invitation", {
    p_user: userId,
    p_garden: gardenId,
    p_token: revokeOnly ? null : newInviteToken(),
  });
  if (error) throw new Error(error.message);
}

export async function expandGarden(userId: string, gardenId: string): Promise<void> {
  const db = createServiceClient();
  const { error } = await db.rpc("expand_garden", { p_user: userId, p_garden: gardenId });
  if (error) throw new Error(error.message);
}

export async function updateProfile(userId: string, displayName: string, avatar: string): Promise<void> {
  const db = createServiceClient();
  const { error } = await db
    .from("profiles")
    .upsert({ id: userId, display_name: displayName, avatar, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function updateGardenTheme(userId: string, gardenId: string, theme: GardenTheme): Promise<void> {
  const db = createServiceClient();
  const { data: membership } = await db
    .from("memberships")
    .select("role")
    .eq("garden_id", gardenId)
    .eq("user_id", userId)
    .maybeSingle();
  if (membership?.role !== "creator") throw new Error("not_creator");
  const { error } = await db.from("gardens").update({ theme }).eq("id", gardenId);
  if (error) throw new Error(error.message);
}

export async function updateInviteCard(userId: string, gardenId: string, card: InviteCard): Promise<void> {
  const db = createServiceClient();
  const { data: membership } = await db
    .from("memberships")
    .select("role")
    .eq("garden_id", gardenId)
    .eq("user_id", userId)
    .maybeSingle();
  if (membership?.role !== "creator") throw new Error("not_creator");
  const { error } = await db
    .from("gardens")
    .update({ invite_card: card, invite_card_updated_at: new Date().toISOString() })
    .eq("id", gardenId);
  if (error) throw new Error(error.message);
}
