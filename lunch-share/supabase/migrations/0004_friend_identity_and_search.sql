create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_user_id uuid not null references auth.users(id) on delete cascade,
  friend_name text,
  friend_avatar_url text,
  created_at timestamptz not null default now(),
  unique (user_id, friend_user_id),
  check (user_id <> friend_user_id)
);

insert into public.profiles (id, name)
select
  auth_users.id,
  coalesce(
    nullif(trim(auth_users.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(auth_users.email, ''), '@', 1), ''),
    '名前未設定'
  )
from auth.users auth_users
on conflict (id) do nothing;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      '名前未設定'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

alter table public.friends
add column if not exists friend_name text;

alter table public.friends
add column if not exists friend_avatar_url text;

alter table public.friends
add column if not exists created_at timestamptz not null default now();

create index if not exists friends_user_id_idx
on public.friends(user_id);

create unique index if not exists friends_user_friend_uidx
on public.friends(user_id, friend_user_id);

grant select, insert, update, delete on public.friends to authenticated;

alter table public.friends enable row level security;

drop policy if exists "Users can read own friends" on public.friends;
drop policy if exists "Users can add own friends" on public.friends;
drop policy if exists "Users can update own friends" on public.friends;
drop policy if exists "Users can delete own friends" on public.friends;

create policy "Users can read own friends"
on public.friends
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add own friends"
on public.friends
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and user_id <> friend_user_id
);

create policy "Users can update own friends"
on public.friends
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and user_id <> friend_user_id
);

create policy "Users can delete own friends"
on public.friends
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.find_profile_by_id(target_user_id uuid)
returns table (
  id uuid,
  name text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select profiles.id, profiles.name, profiles.avatar_url
  from public.profiles
  where profiles.id = target_user_id
  limit 1;
$$;

revoke all on function public.find_profile_by_id(uuid) from public;
grant execute on function public.find_profile_by_id(uuid) to authenticated;

alter table if exists public.push_subscriptions
drop constraint if exists push_subscriptions_user_id_fkey;

alter table if exists public.push_subscriptions
add constraint push_subscriptions_user_id_fkey
foreign key (user_id) references auth.users(id) on delete cascade;

notify pgrst, 'reload schema';
