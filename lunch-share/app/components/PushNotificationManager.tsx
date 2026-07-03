'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const GUEST_USER_ID_KEY = 'lunch-share-guest-user-id';

// VAPID 公開鍵 (base64url) を Uint8Array へ変換する
// (new ArrayBuffer を明示すると TS 5.7+ で BufferSource 型と互換になる)
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

type Status = 'unsupported' | 'default' | 'granted' | 'denied' | 'working';

export default function PushNotificationManager() {
  const [status, setStatus] = useState<Status>('default');

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setStatus('unsupported');
      return;
    }

    // SW を登録しておく（既に登録済みなら使い回される）
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service Worker の登録に失敗:', err);
    });

    setStatus(Notification.permission as Status);
  }, []);

  const enableNotifications = async () => {
    setStatus('working');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission as Status);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY が未設定です');
        setStatus('default');
        return;
      }

      // 既存の購読があれば再利用、なければ新規購読
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const userId =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(GUEST_USER_ID_KEY)
          : null;

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId }),
      });

      setStatus('granted');
    } catch (err) {
      console.error('通知の有効化に失敗:', err);
      setStatus('default');
    }
  };

  if (status === 'unsupported' || status === 'granted') {
    // 対応外、または既に許可済みなら何も出さない
    return null;
  }

  if (status === 'denied') {
    return (
      <p style={styles.note}>
        通知がブロックされています。ブラウザの設定から許可すると毎朝10時にお知らせが届きます。
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={enableNotifications}
      disabled={status === 'working'}
      style={styles.button}
    >
      {status === 'working' ? '設定中…' : '🔔 毎朝10時の通知をオンにする'}
    </button>
  );
}

const styles: { [key: string]: CSSProperties } = {
  button: {
    display: 'block',
    margin: '12px auto',
    padding: '10px 18px',
    border: 'none',
    borderRadius: 8,
    background: '#FF5757',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(255,87,87,0.4)',
  },
  note: {
    margin: '12px 16px',
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
};
