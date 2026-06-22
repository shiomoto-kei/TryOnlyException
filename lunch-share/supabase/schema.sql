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
