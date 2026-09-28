importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const defaultConfig = {
  apiKey: "AIzaSyDemoKeyCMSPro2026_Enterprise",
  projectId: "ai-studio-jesuschrist-56fc42ac-e1e9-4226-ad25-7bb3662874c0",
  messagingSenderId: "250034601366",
  appId: "1:250034601366:web:gkfc-cms-pro"
};

try {
  firebase.initializeApp(defaultConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message:', payload);
    
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Kingdom of Christ CMS Pro';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Ada pengumuman atau warta terbaru dari Gereja.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200, 100, 200, 100, 400],
      tag: payload.data?.tag || 'gkfc-fcm-notification',
      renotify: true,
      requireInteraction: true,
      data: {
        url: payload.data?.url || '/'
      }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('[firebase-messaging-sw.js] Init error:', e);
}

// Fallback listener for standard Web Push events
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || data.notification?.title || 'Kingdom of Christ CMS Pro';
  const options = {
    body: data.body || data.notification?.body || 'Pesan warta jemaat diterima.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'gkfc-push-tag',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Fetch event listener so Chrome recognizes PWA criteria even if this SW is registered
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
