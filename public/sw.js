  // Assuming Supabase client is imported or initialized elsewhere
  importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');

  // Supabase configuration
  const supabaseUrl = 'YOUR_SUPABASE_URL';
  const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Subscription maintenance mechanism
  const MAINTENANCE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  const MAINTENANCE_TABLE = 'push_subscriptions';

  // Get current timestamp in Indian time
  function getIndianTimestamp() {
    return new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  }

  // Get ISO timestamp in Indian time
  function getIndianISOTimestamp() {
    return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }

  async function updateSubscriptionStatus(endpoint) {
    try {
      const { data, error } = await supabase
        .from(MAINTENANCE_TABLE)
        .update({ 
          last_active: getIndianISOTimestamp(),
          active: true 
        })
        .eq('endpoint', endpoint);

      if (error) {
        console.error('Subscription status update error:', error);
      }
    } catch (err) {
      console.error('Subscription status update exception:', err);
    }
  }

  // Periodic status maintenance to keep subscription active
  function setupSubscriptionMaintenance(endpoint) {
    // Clear any existing interval
    if (self.subscriptionMaintenanceInterval) {
      clearInterval(self.subscriptionMaintenanceInterval);
    }

    // Set new interval
    self.subscriptionMaintenanceInterval = setInterval(() => {
      updateSubscriptionStatus(endpoint);
    }, MAINTENANCE_INTERVAL);
  }

  self.addEventListener('push', async (event) => {
    try {
      const data = event.data.json();
      
      const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          ...data.data,
          timestamp: getIndianTimestamp()
        },
        vibrate: [200, 100, 200],
        actions: [
          {
            action: 'open',
            title: 'Read More'
          }
        ],
        tag: data.tag || 'elampillai-notification',
        renotify: true,
        requireInteraction: true,
        silent: false,
        timestamp: Date.now()
      };

      // Trigger notification
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );

      // Update last active timestamp in Supabase
      const subscription = await self.registration.pushManager.getSubscription();
      if (subscription) {
        await updateSubscriptionStatus(subscription.endpoint);
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  });

  self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
      const urlToOpen = event.notification.data?.url || '/';
      
      event.waitUntil(
        clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        }).then(windowClients => {
          for (const client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          return clients.openWindow(urlToOpen);
        })
      );
    }
  });

  // Handle subscription changes
  self.addEventListener('pushsubscriptionchange', async (event) => {
    try {
      // Re-subscribe and update in Supabase
      const subscription = await self.registration.pushManager.subscribe(
        event.oldSubscription.options
      );

      // Update subscription in Supabase
      const { error } = await supabase
        .from(MAINTENANCE_TABLE)
        .upsert({
          endpoint: subscription.endpoint,
          raw_subscription: JSON.stringify(subscription),
          active: true,
          last_active: getIndianISOTimestamp()
        }, {
          onConflict: 'endpoint'
        });

      if (error) {
        console.error('Subscription update error:', error);
      }

      // Setup new maintenance
      setupSubscriptionMaintenance(subscription.endpoint);
    } catch (error) {
      console.error('Subscription change error:', error);
    }
  });

  // Initial setup when service worker is installed
  self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
  });

  // Activation handler
  self.addEventListener('activate', async (event) => {
    event.waitUntil(
      Promise.all([
        self.clients.claim(),
        // Check and update existing subscription
        (async () => {
          const subscription = await self.registration.pushManager.getSubscription();
          if (subscription) {
            // Update subscription in Supabase to ensure it's active
            await supabase
              .from(MAINTENANCE_TABLE)
              .update({ 
                active: true, 
                last_active: getIndianISOTimestamp() 
              })
              .eq('endpoint', subscription.endpoint);

            // Setup maintenance
            setupSubscriptionMaintenance(subscription.endpoint);
          }
        })()
      ])
    );
  });