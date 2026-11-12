-- UFILAG v8: member profile permissions and automatic profile creation.
-- Run after SUPABASE_SETUP.sql (and the v7/v6 migrations already included in your package).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_ufilag_admin());

drop policy if exists "Users update own display name" on public.profiles;
create policy "Users update own display name" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for accounts created before this migration.
insert into public.profiles(id, display_name)
select id, coalesce(raw_user_meta_data->>'display_name', '')
from auth.users
on conflict (id) do nothing;
