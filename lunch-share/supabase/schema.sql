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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set public = true;
