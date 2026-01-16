self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.warn('Push data is not JSON');
      return;
    }
  }

  const title = data.title || 'Elampillai News';
  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: data.image || null, // Supports hero images
    vibrate: [200, 100, 200],
    tag: data.tag || 'elampillai-news',
    renotify: true,
    data: {
      url: data.url || '/' // Store the URL to open on click
    },
    actions: [
      { action: 'open', title: 'Read Now' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Get the URL from the notification data, default to root
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a window is already open with this URL, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Simple installation/activation
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});