-- Let browsers subscribe to session changes. Row level security still decides who receives what.
alter publication supabase_realtime add table public.sessions;
