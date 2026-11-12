-- UFILAG v14: editable hero CTA and game-linked content. Safe to run once after v10/v11 tables exist.
alter table public.content add column if not exists game_id uuid references public.games(id) on delete set null;
alter table public.content add column if not exists button_label text;
alter table public.content add column if not exists button_url text;
alter table public.hero_media add column if not exists title text;
alter table public.hero_media add column if not exists summary text;
alter table public.hero_media add column if not exists button_label text;
alter table public.hero_media add column if not exists button_url text;
grant select on public.content, public.hero_media to anon, authenticated;
grant insert, update, delete on public.content, public.hero_media to authenticated;
