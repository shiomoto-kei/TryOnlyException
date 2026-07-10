'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabaseClient';

type FriendPayload = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

function parseFriendPayload(rawValue: string): FriendPayload | null {
  try {
    const payload = JSON.parse(rawValue) as Partial<{
      type: string;
      userId: string;
      name: string;
      avatarUrl: string | null;
    }>;

    if (payload.type !== 'lunch-share-friend' || !payload.userId) {
      return null;
    }

    return {
      userId: payload.userId,
      name: payload.name?.trim() || '名前未設定',
      avatarUrl: payload.avatarUrl ?? null,
    };
  } catch {
    if (!rawValue.trim()) return null;

    return {
      userId: rawValue.trim(),
      name: '名前未設定',
      avatarUrl: null,
    };
  }
}

function FriendAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const [message, setMessage] = useState('カメラを起動しています...');
  const [friend, setFriend] = useState<FriendPayload | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stopScanner = async () => {
      const scanner = scannerRef.current;

      if (!scanner) return;

      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        await scanner.clear();
      } catch {
        // stop済みなら無視
      }

      scannerRef.current = null;
    };

    const useScannedValue = async (rawValue: string) => {
      if (hasScannedRef.current) return;

      const payload = parseFriendPayload(rawValue);

      if (!payload) {
        setMessage('QRコードの情報が正しくありません。');
        return;
      }

      hasScannedRef.current = true;
      await stopScanner();
      setFriend(payload);
      setMessage('');
    };

    const userIdFromUrl = searchParams.get('userId');

    if (userIdFromUrl) {
      useScannedValue(userIdFromUrl);
      return;
    }

    const startScanner = async () => {
      const scanner = new Html5Qrcode('friend-qr-reader');
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          (decodedText) => {
            useScannedValue(decodedText);
          },
          () => {
            // 読み取り失敗フレームは無視
          },
        );

        setMessage('QRコードをカメラにかざしてください。');
      } catch (error) {
        setMessage(
          error instanceof Error
            ? `カメラを起動できませんでした: ${error.message}`
            : 'カメラを起動できませんでした。',
        );
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [searchParams]);

  const handleAddFriend = async () => {
    if (!friend || isSaving) return;

    setIsSaving(true);
    setMessage('フレンドに追加しています...');

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const currentUser = authData.user;

    if (authError || !currentUser) {
      setMessage('ログイン中のユーザー情報を取得できませんでした。');
      setIsSaving(false);
      return;
    }

    if (currentUser.id === friend.userId) {
      setMessage('自分自身はフレンドに追加できません。');
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from('friends').upsert({
      user_id: currentUser.id,
      friend_user_id: friend.userId,
      friend_name: friend.name,
      friend_avatar_url: friend.avatarUrl,
    });

    if (error) {
      setMessage(`登録に失敗しました: ${error.message}`);
      setIsSaving(false);
      return;
    }

    setMessage(`${friend.name}さんをフレンドに追加しました。`);

    window.setTimeout(() => {
      router.push('/friendlist');
    }, 900);
  };

  return (
    <main style={styles.page}>
      {!friend && <div id="friend-qr-reader" style={styles.reader} />}

      {friend ? (
        <section style={styles.card}>
          <p style={styles.title}>このフレンドを追加しますか？</p>

          {friend.avatarUrl ? (
            <div
              style={{
                ...styles.avatar,
                backgroundImage: `url(${friend.avatarUrl})`,
              }}
            />
          ) : (
            <div style={styles.avatar} />
          )}

          <p style={styles.friendName}>{friend.name}</p>
          <p style={styles.friendId}>{friend.userId}</p>

          {message && <p style={styles.message}>{message}</p>}

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              style={styles.cancelButton}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleAddFriend}
              style={styles.okButton}
              disabled={isSaving}
            >
              追加する
            </button>
          </div>
        </section>
      ) : (
        <p style={styles.message}>{message}</p>
      )}
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    background: '#fff',
  },
  reader: {
    width: 'min(88vw, 360px)',
    overflow: 'hidden',
    borderRadius: 12,
    background: '#222',
  },
  card: {
    width: 'min(88vw, 320px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    border: '1px solid #ddd',
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
  title: {
    color: '#333',
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#d4d4d4',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  friendName: {
    color: '#333',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  friendId: {
    maxWidth: '100%',
    color: '#777',
    fontSize: 12,
    margin: 0,
    overflowWrap: 'anywhere',
    textAlign: 'center',
  },
  message: {
    color: '#333',
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    minWidth: 96,
    height: 36,
    border: '1px solid #ccc',
    borderRadius: 20,
    background: '#e0e0e0',
    color: '#333',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  okButton: {
    minWidth: 96,
    height: 36,
    border: 'none',
    borderRadius: 20,
    background: '#FF6B6B',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};