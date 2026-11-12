-- UFILAG v9: reliable public media delivery and video upload limits. Safe to rerun.
-- Run after SUPABASE_SETUP.sql and the v7/v8 migrations.

create table if not exists public.game_settings (
  game_slug text primary key,
  banner_url text,
  updated_at timestamptz not null default now()
);
alter table public.game_settings enable row level security;
grant select on public.game_settings to anon, authenticated;
grant insert, update, delete on public.game_settings to authenticated;
drop policy if exists "Public can read game settings" on public.game_settings;
create policy "Public can read game settings" on public.game_settings for select to anon, authenticated using (true);
drop policy if exists "Admins manage game settings" on public.game_settings;
create policy "Admins manage game settings" on public.game_settings for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ufilag-media',
  'ufilag-media',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

drop policy if exists "Public read UFILAG media" on storage.objects;
create policy "Public read UFILAG media"
  on storage.objects for select to public
  using (bucket_id = 'ufilag-media');

drop policy if exists "Admins upload UFILAG media" on storage.objects;
create policy "Admins upload UFILAG media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'ufilag-media' and public.is_ufilag_admin());

drop policy if exists "Admins update UFILAG media" on storage.objects;
create policy "Admins update UFILAG media"
  on storage.objects for update to authenticated
  using (bucket_id = 'ufilag-media' and public.is_ufilag_admin())
  with check (bucket_id = 'ufilag-media' and public.is_ufilag_admin());

drop policy if exists "Admins delete UFILAG media" on storage.objects;
create policy "Admins delete UFILAG media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'ufilag-media' and public.is_ufilag_admin());

-- Ensure public pages can read the content and game media rows.
grant select on public.content, public.game_media, public.game_settings to anon, authenticated;
