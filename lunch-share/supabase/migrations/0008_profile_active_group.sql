alter table public.profiles
add column if not exists active_group_id uuid references public.groups(id) on delete set null;

create index if not exists profiles_active_group_id_idx
on public.profiles(active_group_id);
