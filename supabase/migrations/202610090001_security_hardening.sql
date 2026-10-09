-- Reproducible privacy boundaries and write quotas for public launch.
-- Apply with the Supabase CLI or SQL editor before enabling cloud writes.

create extension if not exists pgcrypto;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_chapter_length check (char_length(chapter) between 1 and 40),
  constraint memories_title_length check (char_length(title) between 1 and 160),
  constraint memories_body_length check (char_length(body) between 1 and 1200)
);

alter table public.memories add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.memories'::regclass and conname = 'memories_chapter_length') then
    alter table public.memories add constraint memories_chapter_length check (char_length(chapter) between 1 and 40) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.memories'::regclass and conname = 'memories_title_length') then
    alter table public.memories add constraint memories_title_length check (char_length(title) between 1 and 160) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.memories'::regclass and conname = 'memories_body_length') then
    alter table public.memories add constraint memories_body_length check (char_length(body) between 1 and 1200) not valid;
  end if;
end;
$$;

create index if not exists memories_user_created_idx on public.memories(user_id, created_at desc);
alter table public.memories enable row level security;
alter table public.memories force row level security;

revoke all on public.memories from anon, authenticated;
grant select, insert, update, delete on public.memories to authenticated;

drop policy if exists "users can read own memories" on public.memories;
create policy "users can read own memories" on public.memories
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "users can insert own memories" on public.memories;
create policy "users can insert own memories" on public.memories
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users can update own memories" on public.memories;
create policy "users can update own memories" on public.memories
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users can delete own memories" on public.memories;
create policy "users can delete own memories" on public.memories
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.guard_memory_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or new.user_id <> v_uid then
    raise exception 'not authorised';
  end if;
  if (select count(*) from public.memories where user_id = v_uid and created_at > now() - interval '1 minute') >= 12 then
    raise exception 'memory write limit exceeded';
  end if;
  if (select count(*) from public.memories where user_id = v_uid and created_at > now() - interval '1 day') >= 250 then
    raise exception 'daily memory write limit exceeded';
  end if;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.guard_memory_write() from public, anon, authenticated;
drop trigger if exists guard_memory_write_trigger on public.memories;
create trigger guard_memory_write_trigger before insert on public.memories
for each row execute function public.guard_memory_write();

create or replace function public.touch_memory_update()
returns trigger language plpgsql set search_path = public
as $$
begin
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_memory_update() from public, anon, authenticated;
drop trigger if exists touch_memory_update_trigger on public.memories;
create trigger touch_memory_update_trigger before update on public.memories
for each row execute function public.touch_memory_update();

create or replace function public.guard_room_invite_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or new.created_by <> v_uid then raise exception 'not authorised'; end if;
  if (select count(*) from public.room_invites where created_by = v_uid and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'invite rate limit exceeded';
  end if;
  if (select count(*) from public.room_invites where created_by = v_uid and created_at > now() - interval '1 day') >= 100 then
    raise exception 'daily invite rate limit exceeded';
  end if;
  return new;
end;
$$;

revoke all on function public.guard_room_invite_write() from public, anon, authenticated;
drop trigger if exists guard_room_invite_write_trigger on public.room_invites;
create trigger guard_room_invite_write_trigger before insert on public.room_invites
for each row execute function public.guard_room_invite_write();

create or replace function public.guard_room_message_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or new.user_id <> v_uid then raise exception 'not authorised'; end if;
  if (select count(*) from public.room_messages where user_id = v_uid and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'message rate limit exceeded';
  end if;
  if (select count(*) from public.room_messages where user_id = v_uid and created_at > now() - interval '1 day') >= 1500 then
    raise exception 'daily message rate limit exceeded';
  end if;
  new.created_at := now();
  return new;
end;
$$;

revoke all on function public.guard_room_message_write() from public, anon, authenticated;
drop trigger if exists guard_room_message_write_trigger on public.room_messages;
create trigger guard_room_message_write_trigger before insert on public.room_messages
for each row execute function public.guard_room_message_write();

create or replace function public.accept_room_invite(p_invite_token text)
returns uuid language plpgsql security definer set search_path = public, extensions
as $$
declare v_invite public.room_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_invite_token is null or p_invite_token !~ '^[0-9a-f]{64}$' then raise exception 'invalid invite token'; end if;
  select * into v_invite from public.room_invites where token_hash = digest(p_invite_token, 'sha256') for update;
  if not found then raise exception 'invite not found'; end if;
  if v_invite.revoked_at is not null then raise exception 'invite revoked'; end if;
  if v_invite.used_at is not null then raise exception 'invite already used'; end if;
  if v_invite.expires_at <= now() then raise exception 'invite expired'; end if;
  insert into public.room_participants(room_id, user_id, role, status) values (v_invite.room_id, auth.uid(), 'member', 'accepted')
  on conflict (room_id, user_id) do update set status = 'accepted', joined_at = now();
  update public.room_invites set used_by = auth.uid(), used_at = now() where id = v_invite.id;
  return v_invite.room_id;
end;
$$;

revoke all on function public.accept_room_invite(text) from public, anon;
grant execute on function public.accept_room_invite(text) to authenticated;
