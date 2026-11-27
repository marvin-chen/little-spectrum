// Hand-written row shapes for the tables the app reads directly.

export type ProfileRow = { id: string; display_name: string; avatar: string };

export type GardenRow = {
  id: string;
  name: string;
  capacity: number;
  theme: string;
  timezone: string;
  created_by: string;
  created_at: string;
};

export type MembershipRow = { garden_id: string; user_id: string; role: "creator" | "member"; joined_at: string };

export type SessionRow = {
  id: string;
  garden_id: string;
  game: string;
  status: "active" | "revealed";
  created_by: string;
  clue_giver_id: string | null;
  prompt: unknown;
  round: number;
  result: unknown;
  early_reveal: boolean;
  created_at: string;
  updated_at: string;
  revealed_at: string | null;
};

export type ParticipantRow = { session_id: string; user_id: string; predicts_user_id: string | null };

export type SubmissionRow = {
  id: string;
  session_id: string;
  user_id: string;
  round: number;
  kind: "clue" | "answer";
  payload: unknown;
  created_at: string;
};

export type GrowthEventRow = {
  id: string;
  garden_id: string;
  session_id: string;
  week_start: string;
  created_at: string;
};

export type WeeklyRewardRow = {
  id: string;
  garden_id: string;
  week_start: string;
  ordinal: number;
  item_key: string;
  variant: number;
  session_id: string | null;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  session_id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  status: "pending" | "ready";
  created_at: string;
};
