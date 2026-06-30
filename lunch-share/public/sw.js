/* Service Worker — タブを閉じていても push を受け取り通知を表示する */

// push 受信。サーバー(/api/push/send)が送ったペイロードを表示する。
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'お知らせ', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'ランチ、どうする？';
  const options = {
    body: data.body || '今日のランチを登録しよう🍱',
    icon: data.icon || '/meating_icon.png',
    badge: data.badge || '/meating_icon.png',
    tag: data.tag || 'daily-lunch',
    data: { url: data.url || '/main' },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 通知タップ時。既に開いているタブがあればフォーカス、なければ開く。
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/main';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});

// 新しい SW を即座に有効化する
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
