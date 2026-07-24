# 毎朝10時の通知（Web Push）セットアップ手順

タブを閉じていても毎朝10時に通知を届ける仕組みです。
構成は **Push API + Service Worker + Vercel Cron**。
ブラウザ内の `setTimeout` ではタブを閉じると動かないため、サーバー（Vercel Cron）が
毎朝push を送り、Service Worker（`public/sw.js`）が受け取って通知を表示します。

## 1. 依存をインストール

```bash
npm install
```

（`web-push` と `@types/web-push` を package.json に追加済み）

## 2. VAPID キーを生成

Web Push の送信に必要な公開鍵／秘密鍵のペアを作ります。

```bash
npx web-push generate-vapid-keys
```

出力された `Public Key` と `Private Key` を控えておきます。

## 3. 環境変数を設定

`.env.local`（ローカル）と Vercel のプロジェクト設定（本番）に以下を登録します。

```bash
# VAPID（手順2で生成したもの）
NEXT_PUBLIC_VAPID_PUBLIC_KEY=＜Public Key＞
VAPID_PRIVATE_KEY=＜Private Key＞
VAPID_SUBJECT=mailto:あなたのメール@example.com

# Cron エンドポイント保護用（任意の長いランダム文字列）
CRON_SECRET=＜ランダムな文字列＞

# Supabase（cron が全購読を読むため service_role キーが必須）
SUPABASE_URL=＜https://xxxx.supabase.co＞
SUPABASE_SERVICE_ROLE_KEY=＜service_role key＞
```

> `NEXT_PUBLIC_VAPID_PUBLIC_KEY` だけはクライアントに公開されます（公開鍵なので問題なし）。
> 秘密鍵 `VAPID_PRIVATE_KEY` と `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しないこと。

## 4. DB テーブルを作成

`supabase/migrations/0001_push_subscriptions.sql` を Supabase の SQL Editor に貼って実行します。

## 5. デプロイ

```bash
git add . && git commit -m "Add daily push notifications"
git push
```

Vercel にデプロイすると `vercel.json` の cron 設定が自動で登録されます。

```json
{ "path": "/api/push/send", "schedule": "0 1 * * *" }
```

> **時刻について**: Vercel Cron は **UTC** で動きます。`0 1 * * *`（毎日 01:00 UTC）= **日本時間 朝10時** です。
> 時刻を変えたい場合はこの cron 式を変更してください（例: 朝7時JST → `0 22 * * *`）。

## 6. 動作確認

1. デプロイ後のサイトを **HTTPS** で開く（Push は localhost か HTTPS のみ動作）。
2. `/main` 画面の「🔔 毎朝10時の通知をオンにする」を押し、通知を許可。
3. 送信を即テスト（CRON_SECRET を付けて手動で叩く）:

   ```bash
   curl -X POST https://＜あなたのドメイン＞/api/push/send \
     -H "Authorization: Bearer ＜CRON_SECRET＞"
   ```

   レスポンス例: `{"ok":true,"total":1,"sent":1,"removed":0}`
   端末に通知が出れば成功です。

## 仕組みのファイル一覧

| ファイル | 役割 |
| --- | --- |
| `public/sw.js` | Service Worker。push受信→通知表示、通知タップ→アプリを開く |
| `public/manifest.json` | PWA マニフェスト（ホーム画面追加・standalone表示） |
| `app/components/PushNotificationManager.tsx` | 通知許可リクエスト＆push購読、サーバーへ登録 |
| `app/api/push/subscribe/route.ts` | 購読情報を Supabase に保存 |
| `app/api/push/send/route.ts` | 全購読へ通知送信（cron が叩く） |
| `vercel.json` | 毎朝10時(JST)に send を実行する cron |
| `supabase/migrations/0001_push_subscriptions.sql` | 購読保存テーブル |

## よくある注意点

- **iOS (iPhone) の場合**: Safari で「ホーム画面に追加」してアプリとして起動したときだけ Web Push が使えます（iOS 16.4+）。通常のSafariタブでは通知不可。
- **HTTPS 必須**: 本番は必ず HTTPS。`http://`（localhost以外）では Service Worker / Push が動きません。
- **アイコン**: 通知アイコンに `public/meating_icon.png` を使用。別画像にしたい場合は `sw.js` と `manifest.json` の参照を差し替えてください。
