-- UFILAG v6 migration: editable SECTOR 7 page banner
-- Run this once in Supabase SQL Editor after deploying v6.
create table if not exists public.game_settings (
  game_slug text primary key,
  banner_url text,
  updated_at timestamptz not null default now()
);

alter table public.game_settings enable row level security;

drop policy if exists "Public can read game settings" on public.game_settings;
create policy "Public can read game settings"
  on public.game_settings for select
  using (true);

drop policy if exists "Admins manage game settings" on public.game_settings;
create policy "Admins manage game settings"
  on public.game_settings for all
  using (public.is_ufilag_admin())
  with check (public.is_ufilag_admin());
