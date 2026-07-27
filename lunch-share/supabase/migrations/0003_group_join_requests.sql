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

create index if not exists group_join_requests_group_status_idx
on public.group_join_requests(group_id, status, created_at desc);

create index if not exists group_join_requests_user_id_idx
on public.group_join_requests(user_id);

grant select, insert, update on public.group_join_requests to authenticated;

alter table public.group_join_requests enable row level security;

drop policy if exists "Users can read relevant join requests"
on public.group_join_requests;

drop policy if exists "Users can create own join requests"
on public.group_join_requests;

drop policy if exists "Group owners can review join requests"
on public.group_join_requests;

create policy "Users can read relevant join requests"
on public.group_join_requests
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.groups
    where groups.id = group_join_requests.group_id
      and groups.owner_user_id = (select auth.uid())
  )
);

create policy "Users can create own join requests"
on public.group_join_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
);

create policy "Group owners can review join requests"
on public.group_join_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.groups
    where groups.id = group_join_requests.group_id
      and groups.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.groups
    where groups.id = group_join_requests.group_id
      and groups.owner_user_id = (select auth.uid())
  )
);
