'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

type Friend = {
  id: string;
  friend_user_id: string;
  friend_name: string;
  friend_avatar_url: string | null;
};

export default function FriendListPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [message, setMessage] = useState('読み込み中...');

  useEffect(() => {
    const loadFriends = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const currentUser = authData.user;

      if (authError || !currentUser) {
        setMessage('ログイン中のユーザー情報を取得できませんでした。');
        return;
      }

      const { data, error } = await supabase
        .from('friends')
        .select('id, friend_user_id, friend_name, friend_avatar_url')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(`フレンド一覧の取得に失敗しました: ${error.message}`);
        return;
      }

      setFriends((data as Friend[]) ?? []);
      setMessage(data?.length ? '' : 'フレンドはまだいません。');
    };

    loadFriends();
  }, []);

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.backRow}>
          <button
            onClick={() => router.push('/profile')}
            style={styles.backButton}
          >
            {'<'}
          </button>
        </div>

        <div style={styles.titleWrap}>
          <span style={styles.titleText}>フレンド一覧</span>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.friendList}>
          {friends.map((friend) => (
            <div key={friend.id} style={styles.friendRow}>
              {friend.friend_avatar_url ? (
                <div
                  style={{
                    ...styles.friendAvatar,
                    backgroundImage: `url(${friend.friend_avatar_url})`,
                  }}
                />
              ) : (
                <div style={styles.friendAvatar} />
              )}

              <div style={styles.friendInfo}>
                <span style={styles.friendId}>ID: {friend.friend_user_id}</span>
                <span style={styles.friendName}>名前: {friend.friend_name}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    paddingTop: 72,
    paddingBottom: 72,
  },
  main: {
    flex: 1,
    padding: '12px 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
  backRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    fontSize: 16,
    fontWeight: 700,
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    background: '#FFF6C9',
    border: '3px solid #F5B042',
    padding: '10px 32px',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#4a4a4a',
  },
  friendList: {
    width: '100%',
    maxWidth: 280,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  friendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#d4d4d4',
    flexShrink: 0,
  },
  friendName: {
    fontSize: 15,
    color: '#333',
    fontWeight: 500,
  },
  friendInfo: {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
},
};