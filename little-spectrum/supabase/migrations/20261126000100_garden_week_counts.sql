-- Finished rounds per week, so totals and streaks do not read every growth event.
create or replace function public.garden_week_counts(p_garden uuid)
returns table (week_start date, completions int)
language sql stable security definer set search_path = public as $$
  select e.week_start, count(*)::int
  from public.growth_events e
  where e.garden_id = p_garden
  group by e.week_start
  order by e.week_start desc;
$$;

revoke all on function public.garden_week_counts(uuid) from public, anon, authenticated;
grant execute on function public.garden_week_counts(uuid) to service_role;
