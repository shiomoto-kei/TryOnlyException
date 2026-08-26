alter table public.shops
add column if not exists user_id uuid references auth.users(id) on delete set null;

insert into storage.buckets (id, name, public)
values ('shop-images', 'shop-images', true)
on conflict (id) do update set public = true;

grant select, insert, update, delete on public.shops to authenticated;

drop policy if exists "Allow public shop reads" on public.shops;
drop policy if exists "Allow public shop inserts" on public.shops;
drop policy if exists "Allow anon shop inserts" on public.shops;
drop policy if exists "Users can read shops" on public.shops;
drop policy if exists "Users can add own shops" on public.shops;
drop policy if exists "Users can update own shops" on public.shops;
drop policy if exists "Users can delete own shops" on public.shops;

create policy "Users can read shops"
on public.shops
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add own shops"
on public.shops
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own shops"
on public.shops
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own shops"
on public.shops
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Public shop image reads" on storage.objects;
drop policy if exists "Users can upload own shop images" on storage.objects;
drop policy if exists "Users can update own shop images" on storage.objects;
drop policy if exists "Users can delete own shop images" on storage.objects;

create policy "Public shop image reads"
on storage.objects
for select
to public
using (bucket_id = 'shop-images');

create policy "Users can upload own shop images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'shop-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can update own shop images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'shop-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'shop-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can delete own shop images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'shop-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
