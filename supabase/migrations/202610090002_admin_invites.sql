create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  invited_email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint admin_invites_email_length check (char_length(invited_email) between 3 and 254)
);

create index if not exists admin_invites_inviter_created_idx
  on public.admin_invites(invited_by, created_at desc);

alter table public.admin_invites enable row level security;
alter table public.admin_invites force row level security;
revoke all on public.admin_invites from public, anon, authenticated;

comment on table public.admin_invites is
  'Service-role-only audit log and rate-limit source for administrator invitations.';
