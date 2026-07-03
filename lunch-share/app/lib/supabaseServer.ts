import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ビルド時(モジュール読み込み時)にはエラーを投げず、
// 実際に使われる瞬間に初めてクライアントを作る(遅延初期化)。
// こうしないと環境変数が無い環境で `next build` 自体が失敗する。
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabaseの環境変数が設定されていません。.env.local に SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY、または NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。',
    );
  }

  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}

// 既存の `supabaseServer.from(...)` という使い方をそのまま使えるように
// Proxy で遅延初期化をラップする
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getClient();
    const value = instance[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
