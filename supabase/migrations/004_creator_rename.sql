-- Run in Supabase SQL Editor

-- ── 1. Update existing casting_director rows → creator ──────────────────────
update public.profiles
  set account_type = 'creator'
  where account_type = 'casting_director';

-- ── 2. Swap check constraint on profiles.account_type ───────────────────────
alter table public.profiles
  drop constraint if exists profiles_account_type_check;

alter table public.profiles
  add constraint profiles_account_type_check
  check (account_type in ('actor', 'creator'));

-- ── 3. Expand project_type values on roles ───────────────────────────────────
alter table public.roles
  drop constraint if exists roles_project_type_check;

alter table public.roles
  add constraint roles_project_type_check
  check (project_type in (
    'short_film', 'feature', 'commercial', 'tv', 'web_series',
    'theatre', 'youtube', 'music_video', 'podcast',
    'brand', 'photography', 'gaming', 'other'
  ));
