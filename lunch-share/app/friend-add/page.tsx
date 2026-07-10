'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { getOrCreateCurrentUser } from '../lib/currentUser';

function FriendAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('フレンド情報を確認しています...');

  useEffect(() => {
    const addFriend = async () => {
      const friendUserId = searchParams.get('userId');

      if (!friendUserId) {
        setMessage('QRコードの情報が正しくありません。');
        return;
      }

      const currentUser = await getOrCreateCurrentUser();

      if (currentUser.id === friendUserId) {
        setMessage('自分自身はフレンドに追加できません。');
        return;
      }

      const { data: friendUser } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', friendUserId)
        .maybeSingle();

      if (!friendUser) {
        setMessage('フレンド情報が見つかりません。');
        return;
      }

      const { error } = await supabase.from('friends').upsert({
        user_id: currentUser.id,
        friend_user_id: friendUser.id,
      });

      if (error) {
        setMessage(`登録に失敗しました: ${error.message}`);
        return;
      }

      setMessage(`${friendUser.name}さんをフレンドに追加しました。`);

      window.setTimeout(() => {
        router.push('/friendlist');
      }, 1200);
    };

    addFriend();
  }, [router, searchParams]);

  return (
    <main style={styles.page}>
      <p style={styles.message}>{message}</p>
    </main>
  );
}

export default function FriendAddPage() {
  return (
    <Suspense fallback={<main style={styles.page}>読み込み中...</main>}>
      <FriendAddContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: '#fff',
  },
  message: {
    color: '#333',
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
  },
};