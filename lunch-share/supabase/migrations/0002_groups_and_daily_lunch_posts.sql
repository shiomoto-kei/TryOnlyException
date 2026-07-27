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

create index if not exists lunch_posts_group_id_created_at_idx
on public.lunch_posts(group_id, created_at desc);

grant select, insert, update on public.groups to authenticated;
grant select, insert, update on public.group_members to authenticated;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

drop policy if exists "Users can create groups" on public.groups;
drop policy if exists "Users can read joined groups" on public.groups;
drop policy if exists "Group owners can update groups" on public.groups;

create policy "Users can create groups"
on public.groups
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "Users can read joined groups"
on public.groups
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or exists (
    select 1
    from public.group_members
    where group_members.group_id = groups.id
      and group_members.user_id = (select auth.uid())
  )
);

create policy "Group owners can update groups"
on public.groups
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists "Users can read joined group members" on public.group_members;
drop policy if exists "Users can add group members" on public.group_members;
drop policy if exists "Group owners can update group members" on public.group_members;

create policy "Users can read joined group members"
on public.group_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.group_members own_membership
    where own_membership.group_id = group_members.group_id
      and own_membership.user_id = (select auth.uid())
  )
);

create policy "Users can add group members"
on public.group_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.groups
    where groups.id = group_members.group_id
      and groups.owner_user_id = (select auth.uid())
  )
);

create policy "Group owners can update group members"
on public.group_members
for update
to authenticated
using (
  exists (
    select 1
    from public.groups
    where groups.id = group_members.group_id
      and groups.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.groups
    where groups.id = group_members.group_id
      and groups.owner_user_id = (select auth.uid())
  )
);
