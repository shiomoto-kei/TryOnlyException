import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseServer } from '../../../lib/supabaseServer';

export const runtime = 'nodejs';
// 毎日決まった時刻に動かすため結果をキャッシュしない
export const dynamic = 'force-dynamic';

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    throw new Error('VAPIDキー(NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)が未設定です');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

async function sendDailyNotifications() {
  configureWebPush();

  const { data: subscriptions, error } = await supabaseServer
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth');

  if (error) {
    console.error('購読の取得に失敗:', error);
    return NextResponse.json({ ok: false, message: 'DB読み込み失敗' }, { status: 500 });
  }

  const payload = JSON.stringify({
    title: 'ランチ、どうする？🍱',
    body: '今日のランチを登録して、みんなとシェアしよう！',
    url: '/main',
  });

  const staleEndpoints: string[] = [];
  let sent = 0;

  await Promise.all(
    (subscriptions ?? []).map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          payload,
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // 404/410 は購読が無効になった端末なので掃除する
        if (statusCode === 404 || statusCode === 410) {
          staleEndpoints.push(row.endpoint);
        } else {
          console.error('送信失敗:', row.endpoint, statusCode);
        }
      }
    }),
  );

  if (staleEndpoints.length > 0) {
    await supabaseServer
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);
  }

  return NextResponse.json({
    ok: true,
    total: subscriptions?.length ?? 0,
    sent,
    removed: staleEndpoints.length,
  });
}

// Vercel Cron は GET でこのエンドポイントを叩く。
// CRON_SECRET を設定しておくと Vercel が Authorization ヘッダーを付けてくれる。
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 未設定なら（開発用に）素通り
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: '未認証' }, { status: 401 });
  }
  return sendDailyNotifications();
}

// 手動テスト用に POST も同じ動作にしておく
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: '未認証' }, { status: 401 });
  }
  return sendDailyNotifications();
}
