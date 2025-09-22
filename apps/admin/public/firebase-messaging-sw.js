// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: You'll need to replace this with your actual Firebase config
const firebaseConfig = {
  // This will be populated by the application when it registers the service worker
  // or you can hardcode your config here
};

// Initialize Firebase only if config is available
if (typeof firebaseConfig.apiKey !== 'undefined') {
  firebase.initializeApp(firebaseConfig);

  // Retrieve an instance of Firebase Messaging so that it can handle background messages
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customize notification here
    const notificationTitle = payload.notification?.title || 'New notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: payload.data || {},
      tag: payload.data?.tag || 'default-tag',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/icons/open.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close.png'
        }
      ]
    };

    // Show the notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification click events
  self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');

    event.notification.close();

    if (event.action === 'close') {
      return;
    }

    // Handle notification click
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });

  // Handle push events (for when the app is closed)
  self.addEventListener('push', (event) => {
    console.log('[firebase-messaging-sw.js] Push event received.');

    if (event.data) {
      const payload = event.data.json();
      console.log('[firebase-messaging-sw.js] Push payload: ', payload);

      const notificationTitle = payload.notification?.title || 'New notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {},
        tag: payload.data?.tag || 'default-tag',
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  });
}