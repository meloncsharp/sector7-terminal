-- UFILAG V15: idempotent repair for public content updates and comments.
-- Run in Supabase SQL Editor. This script does NOT delete existing data.

create extension if not exists pgcrypto;

-- Core tables (create only if missing).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  genre text not null default '',
  description text not null default '',
  status text not null default 'in_development',
  release_date date,
  platforms text[] not null default '{}',
  cover_url text,
  is_visible boolean not null default true,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'news',
  title text not null,
  summary text not null default '',
  body text not null default '',
  category text not null default '',
  image_url text,
  video_url text,
  featured boolean not null default false,
  published boolean not null default true,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.content add column if not exists game_id uuid references public.games(id) on delete set null;
alter table public.content add column if not exists button_label text;
alter table public.content add column if not exists button_url text;
alter table public.content add column if not exists image_url text;
alter table public.content add column if not exists video_url text;
alter table public.content add column if not exists featured boolean not null default false;
alter table public.content add column if not exists published boolean not null default true;
alter table public.content add column if not exists summary text not null default '';
alter table public.content add column if not exists body text not null default '';
alter table public.content add column if not exists category text not null default '';
alter table public.content add column if not exists type text not null default 'news';
alter table public.content drop constraint if exists content_type_check;
alter table public.content add constraint content_type_check check (type in ('news','announcement','trailer','devlog','article','update'));

create table if not exists public.game_media (
  id uuid primary key default gen_random_uuid(),
  game_slug text not null default 'sector-7',
  title text not null default '',
  image_url text not null,
  created_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null
);

create table if not exists public.game_releases (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  title text not null default '',
  release_date date not null,
  status text not null default 'planned',
  platforms text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hero_media (
  id integer primary key check (id = 1),
  image_url text not null,
  photo_only boolean not null default true,
  updated_at timestamptz not null default now(),
  title text,
  summary text,
  button_label text,
  button_url text
);

create table if not exists public.content_comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists content_comments_content_idx on public.content_comments(content_id, created_at);
create index if not exists content_comments_user_idx on public.content_comments(user_id, created_at desc);
create index if not exists content_published_created_idx on public.content(published, created_at desc);

-- Keep profile creation working for new and existing accounts.
create or replace function public.is_ufilag_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
insert into public.profiles(id, display_name)
select u.id, coalesce(u.raw_user_meta_data->>'display_name','') from auth.users u
on conflict (id) do nothing;

-- Explicit grants + predictable RLS policies.
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.content enable row level security;
alter table public.game_media enable row level security;
alter table public.game_releases enable row level security;
alter table public.hero_media enable row level security;
alter table public.content_comments enable row level security;

grant select on public.games, public.content, public.game_media, public.game_releases, public.hero_media, public.content_comments to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.games, public.content, public.game_media, public.game_releases, public.hero_media to authenticated;
grant insert, delete on public.content_comments to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id or public.is_ufilag_admin());
drop policy if exists "Users update own display name" on public.profiles;
create policy "Users update own display name" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Public read visible games" on public.games;
create policy "Public read visible games" on public.games for select using (is_visible = true);
drop policy if exists "Admins manage games" on public.games;
create policy "Admins manage games" on public.games for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

drop policy if exists "Public can read published content" on public.content;
drop policy if exists "Public read published content" on public.content;
create policy "Public read published content" on public.content for select using (published = true);
drop policy if exists "Admins can manage content" on public.content;
drop policy if exists "Admins manage content" on public.content;
create policy "Admins manage content" on public.content for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

drop policy if exists "Public can read game media" on public.game_media;
drop policy if exists "Public read game media" on public.game_media;
create policy "Public read game media" on public.game_media for select using (true);
drop policy if exists "Admins manage game media" on public.game_media;
create policy "Admins manage game media" on public.game_media for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

drop policy if exists "Public read releases for visible games" on public.game_releases;
create policy "Public read releases for visible games" on public.game_releases for select using (exists(select 1 from public.games g where g.id = game_id and g.is_visible = true));
drop policy if exists "Admins manage releases" on public.game_releases;
create policy "Admins manage releases" on public.game_releases for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

drop policy if exists "Public read homepage hero" on public.hero_media;
create policy "Public read homepage hero" on public.hero_media for select using (true);
drop policy if exists "Admins manage homepage hero" on public.hero_media;
create policy "Admins manage homepage hero" on public.hero_media for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());

drop policy if exists "Public read comments on published content" on public.content_comments;
drop policy if exists "Public read comments" on public.content_comments;
create policy "Public read comments on published content" on public.content_comments for select using (
  exists(select 1 from public.content c where c.id = content_id and c.published = true)
);
drop policy if exists "Authenticated users add own comments" on public.content_comments;
create policy "Authenticated users add own comments" on public.content_comments for insert to authenticated with check (
  auth.uid() = user_id and char_length(trim(body)) between 1 and 2000 and
  exists(select 1 from public.content c where c.id = content_id and c.published = true)
);
drop policy if exists "Users delete own comments" on public.content_comments;
create policy "Users delete own comments" on public.content_comments for delete to authenticated using (auth.uid() = user_id or public.is_ufilag_admin());
grant delete on public.content_comments to authenticated;

-- Ensure the flagship game exists without overwriting an existing record.
insert into public.games(title, slug, genre, description, status, is_visible)
values ('SECTOR 7', 'sector-7', 'Survival Horror', 'Психологический survival horror о памяти, вине и людях, которые не отпускают прошлое.', 'in_development', true)
on conflict (slug) do nothing;

-- Storage bucket is expected to exist and be PUBLIC in Supabase Dashboard.
-- These policies only grant access inside the UFILAG bucket.
drop policy if exists "Public read UFILAG media" on storage.objects;
create policy "Public read UFILAG media" on storage.objects for select using (bucket_id = 'ufilag-media');
drop policy if exists "Admins upload UFILAG media" on storage.objects;
create policy "Admins upload UFILAG media" on storage.objects for insert to authenticated with check (bucket_id = 'ufilag-media' and public.is_ufilag_admin());
drop policy if exists "Admins update UFILAG media" on storage.objects;
create policy "Admins update UFILAG media" on storage.objects for update to authenticated using (bucket_id = 'ufilag-media' and public.is_ufilag_admin()) with check (bucket_id = 'ufilag-media' and public.is_ufilag_admin());
drop policy if exists "Admins delete UFILAG media" on storage.objects;
create policy "Admins delete UFILAG media" on storage.objects for delete to authenticated using (bucket_id = 'ufilag-media' and public.is_ufilag_admin());

-- After running, promote your own account if needed:
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
