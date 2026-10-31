alter table public.gardens drop constraint if exists gardens_theme_check;
alter table public.gardens add constraint gardens_theme_check check (theme in ('meadow', 'sunset', 'lagoon', 'orchard', 'dusk', 'citrus'));
