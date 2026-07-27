grant usage on schema public to anon, authenticated, public;

grant select, insert on public.shops to anon, authenticated;
grant select, insert on public.lunch_posts to anon, authenticated;
grant select, insert on public.shops to public;
grant select, insert on public.lunch_posts to public;

alter table public.shops enable row level security;
alter table public.lunch_posts enable row level security;

drop policy if exists "Allow public shop reads" on public.shops;
drop policy if exists "Allow public shop inserts" on public.shops;
drop policy if exists "Allow anon shop inserts" on public.shops;

create policy "Allow public shop reads"
on public.shops
for select
to public
using (true);

create policy "Allow public shop inserts"
on public.shops
for insert
to public
with check (true);

drop policy if exists "Allow public lunch post reads" on public.lunch_posts;
drop policy if exists "Allow public lunch post inserts" on public.lunch_posts;
drop policy if exists "Allow anon lunch post inserts" on public.lunch_posts;

create policy "Allow public lunch post reads"
on public.lunch_posts
for select
to public
using (true);

create policy "Allow public lunch post inserts"
on public.lunch_posts
for insert
to public
with check (true);

grant select, insert, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Public profile avatar reads" on storage.objects;
drop policy if exists "Users can upload own profile avatars" on storage.objects;
drop policy if exists "Users can update own profile avatars" on storage.objects;

create policy "Public profile avatar reads"
on storage.objects
for select
to public
using (bucket_id = 'profile-avatars');

create policy "Users can upload own profile avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can update own profile avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

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
