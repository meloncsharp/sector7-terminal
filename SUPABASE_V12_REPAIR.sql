-- UFILAG v12 repair: run this FIRST if v11 failed with "public.games does not exist".
-- Then re-run SUPABASE_V11_COMMUNITY_HERO_MIGRATION.sql.

-- Ensure the game table exists before the v11 favorites foreign key is created.
create table if not exists public.games (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text not null unique,
 genre text not null default '',
 description text not null default '',
 status text not null default 'in_development' check (status in ('in_development','coming_soon','released','paused','cancelled')),
 release_date date,
 platforms text[] not null default '{}',
 cover_url text,
 is_visible boolean not null default true,
 author_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

-- Ensure the profile table and automatic profile creation are present.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 role text not null default 'member' check (role in ('member','admin')),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id or public.is_ufilag_admin());
drop policy if exists "Users update own display name" on public.profiles;
create policy "Users update own display name" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','')) on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.profiles(id,display_name)
select id,coalesce(raw_user_meta_data->>'display_name','') from auth.users on conflict(id) do nothing;

-- Ensure the photo-only hero table exists independently of community features.
create table if not exists public.hero_media (
 id integer primary key check(id=1),
 image_url text not null,
 photo_only boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.hero_media enable row level security;
drop policy if exists "Public read homepage hero" on public.hero_media;
create policy "Public read homepage hero" on public.hero_media for select using(true);
drop policy if exists "Admins manage homepage hero" on public.hero_media;
create policy "Admins manage homepage hero" on public.hero_media for all to authenticated using(public.is_ufilag_admin()) with check(public.is_ufilag_admin());
grant select on public.hero_media to anon, authenticated;
grant insert,update,delete on public.hero_media to authenticated;
