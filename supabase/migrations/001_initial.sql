-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/zrrsshqrrexvetqdrxfh/sql

-- ============================================================
-- Profiles
-- ============================================================
create table public.profiles (
  id             uuid references auth.users(id) on delete cascade primary key,
  account_type   text not null check (account_type in ('actor', 'casting_director')),
  full_name      text,
  bio            text,
  location       text,
  headshot_url   text,
  -- Actor-specific
  age            integer,
  gender         text,
  union_status   text,
  languages      text[] default '{}',
  skills         text[] default '{}',
  tags           text[] default '{}',
  availability   text,
  -- Casting director specific
  company        text,
  job_title      text,
  -- Metadata
  onboarding_complete boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- Media (headshots + videos)
-- ============================================================
create table public.media (
  id               uuid default gen_random_uuid() primary key,
  owner_id         uuid references public.profiles(id) on delete cascade not null,
  media_type       text not null check (media_type in ('headshot', 'video')),
  title            text,
  -- Mux fields (videos)
  mux_upload_id    text unique,
  mux_asset_id     text unique,
  mux_playback_id  text,
  status           text default 'pending' check (status in ('pending', 'processing', 'ready', 'failed')),
  duration         numeric,
  thumbnail_url    text,
  -- Supabase Storage fields (headshots)
  storage_path     text,
  storage_url      text,
  -- Display settings
  is_public        boolean default true,
  is_featured      boolean default false,
  sort_order       integer default 0,
  -- Metadata
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.media enable row level security;

-- Profiles: public read, own write
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- Media: public-or-owner read, own write/delete
create policy "media_select" on public.media
  for select using (is_public = true or auth.uid() = owner_id);

create policy "media_insert" on public.media
  for insert with check (auth.uid() = owner_id);

create policy "media_update" on public.media
  for update using (auth.uid() = owner_id);

create policy "media_delete" on public.media
  for delete using (auth.uid() = owner_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger media_updated_at
  before update on public.media
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Storage bucket for headshots
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('headshots', 'headshots', true)
  on conflict (id) do nothing;

create policy "headshots_select" on storage.objects
  for select using (bucket_id = 'headshots');

create policy "headshots_insert" on storage.objects
  for insert with check (bucket_id = 'headshots' and auth.uid() is not null);

create policy "headshots_update" on storage.objects
  for update using (bucket_id = 'headshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "headshots_delete" on storage.objects
  for delete using (bucket_id = 'headshots' and auth.uid()::text = (storage.foldername(name))[1]);
