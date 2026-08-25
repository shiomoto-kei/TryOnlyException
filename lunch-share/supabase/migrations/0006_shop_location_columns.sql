alter table public.shops
add column if not exists latitude double precision;

alter table public.shops
add column if not exists longitude double precision;

create index if not exists shops_location_idx
on public.shops(latitude, longitude)
where latitude is not null and longitude is not null;
