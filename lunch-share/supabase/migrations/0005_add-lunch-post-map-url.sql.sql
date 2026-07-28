-- lunch-share: 投稿した店の Google Maps リンクを保存するための変更
--
-- 目的:
--   「行きたい店」の投稿時に選択した Google Maps の場所を保存し、
--   メンバーが投稿された店名を押すと、その場所を地図で開けるようにします。
--
-- 影響:
--   - 既存の投稿（店名・メニュー・コメント）は変更しません。
--   - 既存の投稿には地図リンクがないため、店名の地図リンクは新規投稿から付きます。
--
-- Supabase Dashboard の SQL Editor で、このファイル全体を実行してください。

alter table public.lunch_posts
add column if not exists map_url text;

comment on column public.lunch_posts.map_url is
  'Google Mapsで選択した店舗のリンク。投稿した店名を押すとこの地図を開く。';