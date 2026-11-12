-- UFILAG v18: editable studio logo and detailed game page fields
-- Safe to run after the base setup and games table migrations.

create table if not exists public.studio_settings (
  id integer primary key check (id = 1),
  logo_url text,
  updated_at timestamptz not null default now()
);

alter table public.studio_settings enable row level security;
grant select on public.studio_settings to anon, authenticated;
grant insert, update, delete on public.studio_settings to authenticated;
drop policy if exists "Public can read studio settings" on public.studio_settings;
create policy "Public can read studio settings" on public.studio_settings
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage studio settings" on public.studio_settings;
create policy "Admins manage studio settings" on public.studio_settings
  for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

alter table public.games add column if not exists detail_title text;
alter table public.games add column if not exists long_description text;
alter table public.games add column if not exists detail_sections jsonb not null default '[]'::jsonb;

-- Public game pages can read game detail fields; existing games policies remain in place.
grant select on public.games to anon, authenticated;
