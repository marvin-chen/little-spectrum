-- Removes one of the caller's photos. Locks the session first, like submit_answer and reveal_round,
-- so the submission is only withdrawn while the round is still active. Returns the storage path to delete.
create or replace function public.delete_photo(p_user uuid, p_session uuid, p_photo uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_session public.sessions%rowtype;
  v_path text;
begin
  select * into v_session from public.sessions where id = p_session for update;
  if not found then
    raise exception 'session_not_found';
  end if;
  delete from public.photos
  where id = p_photo and session_id = p_session and user_id = p_user
  returning storage_path into v_path;
  if v_path is null then
    raise exception 'photo_not_found';
  end if;
  if v_session.status = 'active' then
    delete from public.submissions
    where session_id = p_session and user_id = p_user and round = v_session.round;
  end if;
  return v_path;
end;
$$;

revoke all on function public.delete_photo(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.delete_photo(uuid, uuid, uuid) to service_role;
