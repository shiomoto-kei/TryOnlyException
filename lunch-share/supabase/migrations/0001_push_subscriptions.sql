-- Web Push の購読情報を保存するテーブル
-- 1ユーザーが複数端末(ブラウザ)で購読しうるので endpoint をユニークキーにする
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users (id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

-- サーバー(service_role)からのみ読み書きする想定なので RLS は有効化しつつ
-- 一般クライアントには触らせない。subscribe/送信はすべて API ルート経由。
alter table public.push_subscriptions enable row level security;
