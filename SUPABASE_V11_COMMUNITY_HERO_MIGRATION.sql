-- UFILAG v11: community features + photo-only homepage hero
-- Run after SUPABASE_SETUP.sql and migrations v6-v10.

create table if not exists public.hero_media (
  id integer primary key check (id = 1),
  image_url text not null,
  photo_only boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.hero_media enable row level security;
drop policy if exists "Public read homepage hero" on public.hero_media;
create policy "Public read homepage hero" on public.hero_media for select using (true);
drop policy if exists "Admins manage homepage hero" on public.hero_media;
create policy "Admins manage homepage hero" on public.hero_media for all to authenticated using (public.is_ufilag_admin()) with check (public.is_ufilag_admin());
grant select on public.hero_media to anon, authenticated;
grant insert, update, delete on public.hero_media to authenticated;

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, game_id)
);
alter table public.user_favorites enable row level security;
drop policy if exists "Users read own favorites" on public.user_favorites;
create policy "Users read own favorites" on public.user_favorites for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users add own favorites" on public.user_favorites;
create policy "Users add own favorites" on public.user_favorites for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users remove own favorites" on public.user_favorites;
create policy "Users remove own favorites" on public.user_favorites for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.user_favorites to authenticated;

create table if not exists public.content_comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists content_comments_content_idx on public.content_comments(content_id, created_at);
create index if not exists content_comments_user_idx on public.content_comments(user_id, created_at desc);
alter table public.content_comments enable row level security;
drop policy if exists "Public read comments on published content" on public.content_comments;
create policy "Public read comments on published content" on public.content_comments for select using (exists(select 1 from public.content c where c.id=content_id and c.published=true));
drop policy if exists "Authenticated users add own comments" on public.content_comments;
create policy "Authenticated users add own comments" on public.content_comments for insert to authenticated with check (auth.uid() = user_id and exists(select 1 from public.content c where c.id=content_id and c.published=true));
drop policy if exists "Users delete own comments" on public.content_comments;
create policy "Users delete own comments" on public.content_comments for delete to authenticated using (auth.uid() = user_id or public.is_ufilag_admin());
grant select on public.content_comments to anon, authenticated;
grant insert, delete on public.content_comments to authenticated;

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists user_notifications_user_idx on public.user_notifications(user_id, created_at desc);
alter table public.user_notifications enable row level security;
drop policy if exists "Users read own notifications" on public.user_notifications;
create policy "Users read own notifications" on public.user_notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users mark own notifications read" on public.user_notifications;
create policy "Users mark own notifications read" on public.user_notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, update on public.user_notifications to authenticated;

-- Notify existing registered accounts when a new public post is published.
create or replace function public.uf_add_content_notifications()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.published = true and (tg_op = 'INSERT' or old.published = false) then
    insert into public.user_notifications(user_id,title,message)
    select u.id, 'Новая публикация UFILAG', coalesce(new.title,'На сайте появилась новая публикация')
    from auth.users u
    where u.id <> coalesce(new.author_id, '00000000-0000-0000-0000-000000000000'::uuid);
  end if;
  return new;
end; $$;
drop trigger if exists uf_content_notifications on public.content;
create trigger uf_content_notifications after insert or update of published on public.content
for each row execute function public.uf_add_content_notifications();
