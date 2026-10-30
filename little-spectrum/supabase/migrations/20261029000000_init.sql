-- Little Spectrum schema, policies, and atomic game functions.
-- Reads from the browser or the user-scoped server client go through RLS.
-- All writes go through SECURITY DEFINER functions that only the service role may execute.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  avatar text not null check (avatar ~ '^[a-z]+:[a-z]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gardens (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  capacity int not null check (capacity in (2, 8)),
  theme text not null default 'meadow' check (theme in ('meadow', 'sunset', 'lagoon', 'orchard')),
  timezone text not null default 'UTC',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.memberships (
  garden_id uuid not null references public.gardens (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('creator', 'member')),
  joined_at timestamptz not null default now(),
  primary key (garden_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens (id) on delete cascade,
  token text not null unique check (char_length(token) >= 32),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index invitations_garden_idx on public.invitations (garden_id);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens (id) on delete cascade,
  game text not null check (
    game in ('hue-knew', 'true-colors', 'hue-clue', 'same-wavelength', 'palette-picks', 'color-quest')
  ),
  status text not null default 'active' check (status in ('active', 'revealed')),
  created_by uuid not null references public.profiles (id),
  clue_giver_id uuid references public.profiles (id),
  prompt jsonb not null,
  round int not null default 1 check (round between 1 and 3),
  result jsonb,
  early_reveal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revealed_at timestamptz
);
create index sessions_garden_status_idx on public.sessions (garden_id, status, created_at desc);

create table public.session_participants (
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  predicts_user_id uuid references public.profiles (id),
  primary key (session_id, user_id)
);
create index session_participants_user_idx on public.session_participants (user_id);

create table public.session_secrets (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  payload jsonb not null
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  round int not null default 1,
  kind text not null default 'answer' check (kind in ('clue', 'answer')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (session_id, user_id, round, kind)
);

create table public.growth_events (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens (id) on delete cascade,
  session_id uuid not null unique references public.sessions (id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now()
);
create index growth_events_garden_week_idx on public.growth_events (garden_id, week_start);

create table public.weekly_rewards (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens (id) on delete cascade,
  week_start date not null,
  ordinal int not null,
  item_key text not null,
  variant int not null default 0,
  session_id uuid references public.sessions (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (garden_id, week_start),
  unique (garden_id, ordinal)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  caption text check (caption is null or char_length(caption) <= 200),
  width int,
  height int,
  bytes int,
  status text not null default 'pending' check (status in ('pending', 'ready')),
  created_at timestamptz not null default now()
);
create index photos_session_idx on public.photos (session_id);

create table public.reactions (
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (emoji in ('heart', 'laugh', 'wow', 'clap', 'sparkle')),
  created_at timestamptz not null default now(),
  primary key (session_id, user_id, emoji)
);

create table public.comments (
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Row level security helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_member(p_garden uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m where m.garden_id = p_garden and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_participant(p_session uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.session_participants p where p.session_id = p_session and p.user_id = auth.uid()
  );
$$;

create or replace function public.shares_garden_with(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.memberships a
    join public.memberships b on a.garden_id = b.garden_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

revoke all on function public.is_member(uuid) from public, anon, authenticated;
revoke all on function public.is_participant(uuid) from public, anon, authenticated;
revoke all on function public.shares_garden_with(uuid) from public, anon, authenticated;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.is_participant(uuid) to authenticated;
grant execute on function public.shares_garden_with(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security policies (read only, writes happen through functions)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.gardens enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.session_secrets enable row level security;
alter table public.submissions enable row level security;
alter table public.growth_events enable row level security;
alter table public.weekly_rewards enable row level security;
alter table public.photos enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;

create policy "profiles: self or garden mates" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.shares_garden_with(id));

create policy "gardens: members" on public.gardens
  for select to authenticated using (public.is_member(id));

create policy "memberships: members" on public.memberships
  for select to authenticated using (public.is_member(garden_id));

create policy "invitations: members" on public.invitations
  for select to authenticated using (public.is_member(garden_id));

create policy "sessions: participants" on public.sessions
  for select to authenticated using (public.is_participant(id));

create policy "participants: participants" on public.session_participants
  for select to authenticated using (public.is_participant(session_id));

create policy "secrets: clue giver or revealed participants" on public.session_secrets
  for select to authenticated using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and (s.clue_giver_id = auth.uid() or (s.status = 'revealed' and public.is_participant(s.id)))
    )
  );

create policy "submissions: own or revealed rounds" on public.submissions
  for select to authenticated using (
    user_id = auth.uid()
    or (
      public.is_participant(session_id)
      and exists (
        select 1 from public.sessions s
        where s.id = session_id and (s.status = 'revealed' or s.round > submissions.round)
      )
    )
  );

create policy "growth: members" on public.growth_events
  for select to authenticated using (public.is_member(garden_id));

create policy "rewards: members" on public.weekly_rewards
  for select to authenticated using (public.is_member(garden_id));

create policy "photos: own or revealed participants" on public.photos
  for select to authenticated using (
    user_id = auth.uid()
    or (
      public.is_participant(session_id)
      and exists (select 1 from public.sessions s where s.id = session_id and s.status = 'revealed')
    )
  );

create policy "reactions: participants" on public.reactions
  for select to authenticated using (public.is_participant(session_id));

create policy "comments: participants" on public.comments
  for select to authenticated using (public.is_participant(session_id));

-- Generic activity visible to every garden member, without session content.
create view public.garden_activity with (security_invoker = false) as
  select s.id, s.garden_id, s.game, s.status, s.created_at, s.revealed_at,
         (select count(*) from public.session_participants p where p.session_id = s.id)::int as participant_count,
         public.is_participant(s.id) as is_participant
  from public.sessions s
  where public.is_member(s.garden_id);

grant select on public.garden_activity to authenticated;

-- ---------------------------------------------------------------------------
-- Private photo bucket. No storage policies: only the service role touches it.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Atomic write functions (service role only)
-- ---------------------------------------------------------------------------

create or replace function public.week_start_for(p_garden uuid, p_at timestamptz default now())
returns date language sql stable security definer set search_path = public as $$
  select ((p_at at time zone g.timezone)::date
          - (extract(isodow from (p_at at time zone g.timezone))::int - 1))
  from public.gardens g where g.id = p_garden;
$$;

create or replace function public.create_garden(
  p_user uuid, p_name text, p_capacity int, p_theme text, p_timezone text, p_token text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_garden uuid;
begin
  insert into public.gardens (name, capacity, theme, timezone, created_by)
  values (p_name, p_capacity, p_theme, p_timezone, p_user)
  returning id into v_garden;
  insert into public.memberships (garden_id, user_id, role) values (v_garden, p_user, 'creator');
  insert into public.invitations (garden_id, token, created_by) values (v_garden, p_token, p_user);
  return v_garden;
end;
$$;

-- Joins through an invitation. Locks the garden row so simultaneous joins cannot exceed capacity.
create or replace function public.join_garden(p_user uuid, p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_inv public.invitations%rowtype;
  v_garden public.gardens%rowtype;
  v_count int;
begin
  select * into v_inv from public.invitations where token = p_token;
  if not found or v_inv.revoked_at is not null then
    return jsonb_build_object('status', 'invalid');
  end if;
  select * into v_garden from public.gardens where id = v_inv.garden_id for update;
  if exists (select 1 from public.memberships where garden_id = v_garden.id and user_id = p_user) then
    return jsonb_build_object('status', 'member', 'garden_id', v_garden.id);
  end if;
  select count(*) into v_count from public.memberships where garden_id = v_garden.id;
  if v_count >= v_garden.capacity then
    return jsonb_build_object('status', 'full', 'garden_id', v_garden.id);
  end if;
  insert into public.memberships (garden_id, user_id, role) values (v_garden.id, p_user, 'member');
  return jsonb_build_object('status', 'joined', 'garden_id', v_garden.id);
end;
$$;

create or replace function public.rotate_invitation(p_user uuid, p_garden uuid, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.memberships where garden_id = p_garden and user_id = p_user and role = 'creator') then
    raise exception 'not_creator';
  end if;
  update public.invitations set revoked_at = now() where garden_id = p_garden and revoked_at is null;
  if p_token is not null then
    insert into public.invitations (garden_id, token, created_by) values (p_garden, p_token, p_user);
  end if;
end;
$$;

create or replace function public.create_session(
  p_user uuid, p_garden uuid, p_game text, p_participants uuid[], p_prompt jsonb,
  p_secret jsonb, p_clue_giver uuid, p_predictions jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_session uuid;
  v_member_count int;
  v_participant uuid;
begin
  if not exists (select 1 from public.memberships where garden_id = p_garden and user_id = p_user) then
    raise exception 'not_member';
  end if;
  if array_length(p_participants, 1) is null or array_length(p_participants, 1) < 2 then
    raise exception 'too_few_participants';
  end if;
  if not (p_user = any (p_participants)) then
    raise exception 'creator_not_participant';
  end if;
  select count(*) into v_member_count
  from public.memberships where garden_id = p_garden and user_id = any (p_participants);
  if v_member_count <> array_length(p_participants, 1)
     or v_member_count <> (select count(distinct u) from unnest(p_participants) u) then
    raise exception 'participants_not_members';
  end if;
  insert into public.sessions (garden_id, game, created_by, clue_giver_id, prompt)
  values (p_garden, p_game, p_user, p_clue_giver, p_prompt)
  returning id into v_session;
  foreach v_participant in array p_participants loop
    insert into public.session_participants (session_id, user_id, predicts_user_id)
    values (v_session, v_participant, nullif(p_predictions ->> v_participant::text, '')::uuid);
  end loop;
  if p_secret is not null then
    insert into public.session_secrets (session_id, payload) values (v_session, p_secret);
  end if;
  return v_session;
end;
$$;

-- Records one committed submission. Locks the session so a concurrent reveal sees a consistent count.
create or replace function public.submit_answer(
  p_user uuid, p_session uuid, p_round int, p_kind text, p_payload jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_session public.sessions%rowtype;
  v_inserted boolean := false;
  v_count int;
begin
  select * into v_session from public.sessions where id = p_session for update;
  if not found then
    raise exception 'not_found';
  end if;
  if not exists (select 1 from public.session_participants where session_id = p_session and user_id = p_user) then
    raise exception 'not_participant';
  end if;
  if v_session.status <> 'active' then
    return jsonb_build_object('status', 'closed');
  end if;
  if v_session.round <> p_round then
    return jsonb_build_object('status', 'stale_round');
  end if;
  if p_kind = 'clue' and v_session.clue_giver_id is distinct from p_user then
    raise exception 'not_clue_giver';
  end if;
  insert into public.submissions (session_id, user_id, round, kind, payload)
  values (p_session, p_user, p_round, p_kind, p_payload)
  on conflict (session_id, user_id, round, kind) do nothing;
  v_inserted := found;
  update public.sessions set updated_at = now() where id = p_session;
  select count(*) into v_count from public.submissions where session_id = p_session and round = p_round;
  return jsonb_build_object('status', case when v_inserted then 'inserted' else 'duplicate' end, 'count', v_count);
end;
$$;

-- Reveals a round. When final, closes the session and awards growth and the weekly reward exactly once.
create or replace function public.reveal_round(
  p_session uuid, p_round int, p_result jsonb, p_final boolean, p_early boolean, p_expected_submissions int
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_session public.sessions%rowtype;
  v_garden public.gardens%rowtype;
  v_count int;
  v_week date;
  v_events int;
  v_ordinal int;
  v_items text[] := array['sprout','tulips','sunflower','fern','mushrooms','berry-bush',
                          'little-tree','lantern','birdbath','watering-can','stepping-stones','butterfly'];
  v_offset int;
  v_item text;
  v_variant int;
  v_reward jsonb := null;
  v_growth boolean := false;
begin
  select * into v_session from public.sessions where id = p_session for update;
  if not found then
    raise exception 'not_found';
  end if;
  if v_session.status <> 'active' or v_session.round <> p_round then
    return jsonb_build_object('status', 'already_revealed');
  end if;
  select count(*) into v_count from public.submissions where session_id = p_session and round = p_round;
  if v_count <> p_expected_submissions then
    return jsonb_build_object('status', 'retry');
  end if;

  if p_final then
    update public.sessions
    set status = 'revealed', result = p_result, early_reveal = p_early, revealed_at = now(), updated_at = now()
    where id = p_session;

    select * into v_garden from public.gardens where id = v_session.garden_id for update;
    v_week := public.week_start_for(v_garden.id);
    insert into public.growth_events (garden_id, session_id, week_start)
    values (v_garden.id, p_session, v_week)
    on conflict (session_id) do nothing;
    v_growth := found;

    select count(*) into v_events from public.growth_events where garden_id = v_garden.id and week_start = v_week;
    if v_events >= 3 and not exists (
      select 1 from public.weekly_rewards where garden_id = v_garden.id and week_start = v_week
    ) then
      select coalesce(max(ordinal), 0) + 1 into v_ordinal from public.weekly_rewards where garden_id = v_garden.id;
      v_offset := (('x' || substr(md5(v_garden.id::text), 1, 8))::bit(32)::int & 2147483647) % 12;
      v_item := v_items[((v_offset + v_ordinal - 1) % 12) + 1];
      v_variant := ((v_offset / 12) + ((v_ordinal - 1) / 12)) % 3;
      insert into public.weekly_rewards (garden_id, week_start, ordinal, item_key, variant, session_id)
      values (v_garden.id, v_week, v_ordinal, v_item, v_variant, p_session);
      v_reward := jsonb_build_object('item_key', v_item, 'variant', v_variant, 'ordinal', v_ordinal);
    end if;
  else
    update public.sessions
    set result = p_result, round = round + 1, updated_at = now()
    where id = p_session;
  end if;

  return jsonb_build_object('status', 'revealed', 'growth', v_growth, 'reward', v_reward);
end;
$$;

create or replace function public.expand_garden(p_user uuid, p_garden uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.memberships where garden_id = p_garden and user_id = p_user and role = 'creator') then
    raise exception 'not_creator';
  end if;
  update public.gardens set capacity = 8 where id = p_garden;
end;
$$;

-- Only the service role may call write functions. Supabase grants execute on new functions to
-- anon and authenticated by default, so those grants are revoked explicitly.
revoke all on function public.week_start_for(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.create_garden(uuid, text, int, text, text, text) from public, anon, authenticated;
revoke all on function public.join_garden(uuid, text) from public, anon, authenticated;
revoke all on function public.rotate_invitation(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.create_session(uuid, uuid, text, uuid[], jsonb, jsonb, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.submit_answer(uuid, uuid, int, text, jsonb) from public, anon, authenticated;
revoke all on function public.reveal_round(uuid, int, jsonb, boolean, boolean, int) from public, anon, authenticated;
revoke all on function public.expand_garden(uuid, uuid) from public, anon, authenticated;
grant execute on function public.week_start_for(uuid, timestamptz) to service_role;
grant execute on function public.create_garden(uuid, text, int, text, text, text) to service_role;
grant execute on function public.join_garden(uuid, text) to service_role;
grant execute on function public.rotate_invitation(uuid, uuid, text) to service_role;
grant execute on function public.create_session(uuid, uuid, text, uuid[], jsonb, jsonb, uuid, jsonb) to service_role;
grant execute on function public.submit_answer(uuid, uuid, int, text, jsonb) to service_role;
grant execute on function public.reveal_round(uuid, int, jsonb, boolean, boolean, int) to service_role;
grant execute on function public.expand_garden(uuid, uuid) to service_role;
