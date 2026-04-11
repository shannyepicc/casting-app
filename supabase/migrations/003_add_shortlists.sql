-- Run in Supabase SQL Editor

create table public.shortlists (
  id         uuid default gen_random_uuid() primary key,
  cd_id      uuid references public.profiles(id) on delete cascade not null,
  actor_id   uuid references public.profiles(id) on delete cascade not null,
  note       text,
  created_at timestamptz default now(),
  unique (cd_id, actor_id)
);

alter table public.shortlists enable row level security;

-- Casting directors can read their own shortlist
create policy "shortlists_select" on public.shortlists
  for select using (auth.uid() = cd_id);

-- Casting directors can add to their shortlist
create policy "shortlists_insert" on public.shortlists
  for insert with check (auth.uid() = cd_id);

-- Casting directors can remove from their shortlist
create policy "shortlists_delete" on public.shortlists
  for delete using (auth.uid() = cd_id);

-- Casting directors can update notes
create policy "shortlists_update" on public.shortlists
  for update using (auth.uid() = cd_id);
