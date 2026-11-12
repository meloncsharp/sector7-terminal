-- UFILAG v10: dynamic game catalogue and release calendar
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
create table if not exists public.game_releases (
 id uuid primary key default gen_random_uuid(),
 game_id uuid not null references public.games(id) on delete cascade,
 title text not null default '',
 release_date date not null,
 status text not null default 'planned' check (status in ('planned','released','delayed','cancelled')),
 platforms text not null default '',
 note text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists games_visible_created_idx on public.games(is_visible,created_at desc);
create index if not exists game_releases_date_idx on public.game_releases(release_date asc);
alter table public.games enable row level security;
alter table public.game_releases enable row level security;
drop policy if exists "Public read visible games" on public.games;
create policy "Public read visible games" on public.games for select using (is_visible = true);
drop policy if exists "Admins manage games" on public.games;
create policy "Admins manage games" on public.games for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());
drop policy if exists "Public read releases for visible games" on public.game_releases;
create policy "Public read releases for visible games" on public.game_releases for select using (exists(select 1 from public.games g where g.id=game_id and g.is_visible=true));
drop policy if exists "Admins manage releases" on public.game_releases;
create policy "Admins manage releases" on public.game_releases for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());
grant select on public.games, public.game_releases to anon, authenticated;
grant insert, update, delete on public.games, public.game_releases to authenticated;
-- Seed the existing flagship title if it is not already present.
insert into public.games(title,slug,genre,description,status,is_visible)
values ('SECTOR 7','sector-7','Survival Horror','A psychological survival horror story about memory, guilt and the people who refuse to let go.','in_development',true)
on conflict (slug) do nothing;
-- Extend publication types so the studio can post dev diaries, articles and studio updates.
alter table public.content drop constraint if exists content_type_check;
alter table public.content add constraint content_type_check check (type in ('news','announcement','trailer','devlog','article','update'));
