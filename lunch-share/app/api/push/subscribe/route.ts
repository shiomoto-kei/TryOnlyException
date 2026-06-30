import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

export const runtime = 'nodejs';

type SubscribeBody = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  userId?: string | null;
};

// クライアントの push 購読情報を Supabase に保存する
export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'JSONが不正です' }, { status: 400 });
  }

  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json(
      { ok: false, message: '購読情報が不足しています' },
      { status: 400 },
    );
  }

  const { error } = await supabaseServer.from('push_subscriptions').upsert(
    {
      user_id: body.userId ?? null,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  if (error) {
    console.error('購読の保存に失敗:', error);
    return NextResponse.json({ ok: false, message: '保存に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
