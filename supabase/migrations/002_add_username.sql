-- Run in Supabase SQL Editor

-- Add username column (unique, URL-safe handle used for /actors/[username])
alter table public.profiles
  add column if not exists username text;

create unique index if not exists profiles_username_idx
  on public.profiles (username);
