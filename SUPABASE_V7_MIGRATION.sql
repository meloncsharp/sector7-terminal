-- UFILAG v7: SECTOR 7 editable banner settings
-- Run once in Supabase SQL Editor. Safe to run again.
create table if not exists public.game_settings (
  game_slug text primary key,
  banner_url text,
  updated_at timestamptz not null default now()
);

alter table public.game_settings enable row level security;

grant select on public.game_settings to anon, authenticated;
grant insert, update, delete on public.game_settings to authenticated;

drop policy if exists "Public can read game settings" on public.game_settings;
create policy "Public can read game settings"
  on public.game_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage game settings" on public.game_settings;
create policy "Admins manage game settings"
  on public.game_settings for all
  to authenticated
  using (public.is_ufilag_admin())
  with check (public.is_ufilag_admin());
