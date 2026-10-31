-- Creator-designed invite card, rendered on the join page and as the link preview image.
alter table public.gardens add column if not exists invite_card jsonb not null default '{}'::jsonb;
alter table public.gardens add column if not exists invite_card_updated_at timestamptz not null default now();
