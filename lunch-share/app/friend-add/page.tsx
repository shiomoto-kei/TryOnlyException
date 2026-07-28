'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type FriendProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
};

function FriendAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('フレンド情報を確認しています...');

  useEffect(() => {
    const addFriend = async () => {
      try {
        const friendUserId = searchParams.get('userId')?.trim();

        if (!friendUserId) {
          setMessage('QRコードの情報が正しくありません。');
          return;
        }

        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !currentUser) {
          setMessage('ログインが必要です。');
          return;
        }

        if (currentUser.id === friendUserId) {
          setMessage('自分自身はフレンドに追加できません。');
          return;
        }

        const { data: friendUser, error: profileError } = await supabase
          .rpc('find_profile_by_id', {
            target_user_id: friendUserId,
          })
          .maybeSingle();

        const friendProfile = friendUser as FriendProfile | null;

        if (profileError || !friendProfile) {
          setMessage('フレンド情報が見つかりません。');
          return;
        }

        const { error } = await supabase.from('friends').upsert(
          {
            user_id: currentUser.id,
            friend_user_id: friendProfile.id,
            friend_name: friendProfile.name,
            friend_avatar_url: friendProfile.avatar_url,
          },
          {
            onConflict: 'user_id,friend_user_id',
          },
        );

        if (error) {
          setMessage(`登録に失敗しました: ${error.message}`);
          return;
        }

        setMessage(`${friendProfile.name || '名前未設定'}さんをフレンドに追加しました。`);

        window.setTimeout(() => {
          router.push('/friendlist');
        }, 1200);
      } catch {
        setMessage('フレンドの追加中にエラーが発生しました。');
      }
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
