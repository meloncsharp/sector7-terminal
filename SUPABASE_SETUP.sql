-- UFILAG production schema for Supabase
-- Run in Supabase SQL Editor. Create a Supabase Storage bucket named `ufilag-media` and set it public.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.game_media (
  id uuid primary key default gen_random_uuid(),
  game_slug text not null default 'sector-7',
  title text not null default '',
  image_url text not null,
  created_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null
);
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('news','announcement','trailer')),
  title text not null,
  summary text not null default '',
  body text not null default '',
  category text not null default '',
  image_url text,
  video_url text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null
);
create index if not exists content_published_created_idx on public.content (published, created_at desc);
alter table public.profiles enable row level security;
alter table public.content enable row level security;
alter table public.game_media enable row level security;
create or replace function public.is_ufilag_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create policy "Public can read published content" on public.content for select using (published = true);
create policy "Admins can manage content" on public.content for all using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id or public.is_ufilag_admin());
drop policy if exists "Users update own display name" on public.profiles;
create policy "Public can read game media" on public.game_media for select using (true);
create policy "Admins manage game media" on public.game_media for all using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());
-- Storage bucket: create `ufilag-media` as PUBLIC in Dashboard > Storage.
-- Public can view media; only admins can upload/delete.
drop policy if exists "Public read UFILAG media" on storage.objects;
create policy "Public read UFILAG media" on storage.objects for select using (bucket_id = 'ufilag-media');
drop policy if exists "Admins upload UFILAG media" on storage.objects;
create policy "Admins upload UFILAG media" on storage.objects for insert to authenticated with check (bucket_id = 'ufilag-media' and public.is_ufilag_admin());
drop policy if exists "Admins update UFILAG media" on storage.objects;
create policy "Admins update UFILAG media" on storage.objects for update to authenticated using (bucket_id = 'ufilag-media' and public.is_ufilag_admin()) with check (bucket_id = 'ufilag-media' and public.is_ufilag_admin());
drop policy if exists "Admins delete UFILAG media" on storage.objects;
create policy "Admins delete UFILAG media" on storage.objects for delete to authenticated using (bucket_id = 'ufilag-media' and public.is_ufilag_admin());
-- After creating your first account, promote it to admin:
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
-- Create a trigger to automatically create member profiles on sign-up:
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''));
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
-- Storage bucket setup is easiest in Dashboard > Storage:
-- bucket: ufilag-media; public: ON
