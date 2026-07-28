create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  postal_code text default '',
  address text default '',
  category text default '',
  comment text default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.lunch_posts (
  id uuid primary key default gen_random_uuid(),
  shop text not null,
  menu text not null,
  comment text default '',
  created_at timestamptz not null default now()
);

alter table public.lunch_posts
add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.lunch_posts
add column if not exists group_id uuid;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'lunch_posts'
      and column_name = 'group_id'
      and udt_name <> 'uuid'
  ) then
    alter table public.lunch_posts
    alter column group_id type uuid
    using (
      case
        when group_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then group_id::text::uuid
        else null
      end
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

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

create index if not exists friends_user_id_idx
on public.friends(user_id);

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

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_color text not null default '#e0e0e0',
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.group_join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, user_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lunch_posts_group_id_fkey'
  ) then
    alter table public.lunch_posts
    add constraint lunch_posts_group_id_fkey
    foreign key (group_id) references public.groups(id) on delete set null
    not valid;
  end if;
end $$;

create index if not exists groups_owner_user_id_idx
on public.groups(owner_user_id);

create index if not exists group_members_group_id_idx
on public.group_members(group_id);

create index if not exists group_members_user_id_idx
on public.group_members(user_id);

create index if not exists group_join_requests_group_status_idx
on public.group_join_requests(group_id, status, created_at desc);

create index if not exists group_join_requests_user_id_idx
on public.group_join_requests(user_id);

create index if not exists lunch_posts_group_id_created_at_idx
on public.lunch_posts(group_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set public = true;
