create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null check (relationship in ('partner', 'friend', 'sibling', 'parent')),
  created_at timestamptz not null default now()
);

create table if not exists public.room_participants (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  status text not null default 'accepted' check (status in ('accepted', 'left')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.room_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists room_participants_user_idx on public.room_participants(user_id);
create index if not exists room_messages_room_created_idx on public.room_messages(room_id, created_at);
create index if not exists room_invites_room_idx on public.room_invites(room_id);

alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.room_invites enable row level security;
alter table public.room_messages enable row level security;

create or replace function public.is_room_participant(p_room_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.room_participants where room_id = p_room_id and user_id = auth.uid() and status = 'accepted'); $$;

create or replace function public.is_room_owner(p_room_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.rooms where id = p_room_id and owner_user_id = auth.uid()); $$;

revoke all on function public.is_room_participant(uuid) from public;
revoke all on function public.is_room_owner(uuid) from public;
grant execute on function public.is_room_participant(uuid) to authenticated;
grant execute on function public.is_room_owner(uuid) to authenticated;

drop policy if exists "participants can read rooms" on public.rooms;
create policy "participants can read rooms" on public.rooms for select to authenticated using (public.is_room_participant(id));
drop policy if exists "owners can update rooms" on public.rooms;
create policy "owners can update rooms" on public.rooms for update to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "owners can delete rooms" on public.rooms;
create policy "owners can delete rooms" on public.rooms for delete to authenticated using (owner_user_id = auth.uid());
drop policy if exists "participants can read participants" on public.room_participants;
create policy "participants can read participants" on public.room_participants for select to authenticated using (public.is_room_participant(room_id));
drop policy if exists "participants can read messages" on public.room_messages;
create policy "participants can read messages" on public.room_messages for select to authenticated using (public.is_room_participant(room_id));
drop policy if exists "participants can send messages" on public.room_messages;
create policy "participants can send messages" on public.room_messages for insert to authenticated with check (user_id = auth.uid() and public.is_room_participant(room_id));
drop policy if exists "authors can delete messages" on public.room_messages;
create policy "authors can delete messages" on public.room_messages for delete to authenticated using (user_id = auth.uid());

create or replace function public.create_room_invite(p_relationship text, p_room_id uuid default null, p_expires_in_hours integer default 168)
returns table (room_id uuid, invite_token text, expires_at timestamptz)
language plpgsql security definer set search_path = public, extensions
as $$
declare v_room_id uuid; v_token text; v_expires timestamptz;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_relationship not in ('partner', 'friend', 'sibling', 'parent') then raise exception 'invalid relationship'; end if;
  if p_expires_in_hours < 1 or p_expires_in_hours > 720 then raise exception 'invalid expiry'; end if;
  if p_room_id is null then
    insert into public.rooms(owner_user_id, relationship) values (auth.uid(), p_relationship) returning id into v_room_id;
    insert into public.room_participants(room_id, user_id, role) values (v_room_id, auth.uid(), 'owner');
  else
    v_room_id := p_room_id;
    if not public.is_room_owner(v_room_id) then raise exception 'room owner required'; end if;
  end if;
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires := now() + make_interval(hours => p_expires_in_hours);
  insert into public.room_invites(room_id, created_by, token_hash, expires_at) values (v_room_id, auth.uid(), digest(v_token, 'sha256'), v_expires);
  return query select v_room_id, v_token, v_expires;
end;
$$;

create or replace function public.accept_room_invite(p_invite_token text)
returns uuid language plpgsql security definer set search_path = public, extensions
as $$
declare v_invite public.room_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
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

create or replace function public.revoke_room_invite(p_invite_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.room_invites i set revoked_at = now() where i.id = p_invite_id and public.is_room_owner(i.room_id) and i.used_at is null;
  if not found then raise exception 'active invitation not found or not authorised'; end if;
end;
$$;

revoke all on function public.create_room_invite(text, uuid, integer) from public;
revoke all on function public.accept_room_invite(text) from public;
revoke all on function public.revoke_room_invite(uuid) from public;
grant execute on function public.create_room_invite(text, uuid, integer) to authenticated;
grant execute on function public.accept_room_invite(text) to authenticated;
grant execute on function public.revoke_room_invite(uuid) to authenticated;
revoke all on public.room_invites from anon, authenticated;
grant select, update, delete on public.rooms to authenticated;
grant select on public.room_participants to authenticated;
grant select, insert, delete on public.room_messages to authenticated;
