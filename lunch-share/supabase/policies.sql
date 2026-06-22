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
