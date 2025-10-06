// Service Worker สำหรับ SSKratomYMT
const CACHE_NAME = 'sskratomymt-v2.1.0';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// ทรัพยากรที่ต้องการ cache ไว้ล่วงหน้า
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap',
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png'
];

// ฟังก์ชันติดตั้ง Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching Static Assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install Completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation Failed', error);
      })
  );
});

// ฟังก์ชันเปิดใช้งาน Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== CACHE_NAME) {
              console.log('Service Worker: Clearing Old Cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activate Completed');
        return self.clients.claim();
      })
  );
});

// ฟังก์ชันดักจับการขอทรัพยากร
self.addEventListener('fetch', (event) => {
  // ข้ามการดักจับสำหรับ requests ไปยัง Google Apps Script
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // ข้ามการดักจับสำหรับ non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // ถ้ามีใน cache ให้ส่งคืนจาก cache
        if (cachedResponse) {
          return cachedResponse;
        }

        // ถ้าไม่มีใน cache ให้ดึงจาก network
        return fetch(event.request)
          .then((networkResponse) => {
            // ตรวจสอบว่าการตอบกลับถูกต้องหรือไม่
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // คัดลอก response และเก็บใน cache
            const responseToCache = networkResponse.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                // เก็บเฉพาะทรัพยากรจาก origin เดียวกัน
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          })
          .catch(() => {
            // กรณี offline และไม่มีใน cache
            // สำหรับหน้า HTML ให้ส่งคืนหน้า index.html
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // สำหรับรูปภาพ ให้ส่งคืนรูปภาพ placeholder
            if (event.request.destination === 'image') {
              return caches.match('/images/icons/icon-192x192.png');
            }
            
            // สำหรับ CSS และ Fonts
            if (event.request.destination === 'style' || event.request.destination === 'font') {
              // สามารถเพิ่ม fallback ได้ที่นี่
            }
          });
      })
  );
});

// ฟังก์ชันจัดการการซิงค์ข้อมูลในพื้นหลัง
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// ฟังก์ชันซิงค์ข้อมูลออฟไลน์
async function syncOfflineData() {
  try {
    console.log('Service Worker: Syncing offline data...');
    
    // เปิดฐานข้อมูล IndexedDB
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('salesDB', 3);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // ดึงข้อมูลที่รอซิงค์
    const offlineData = await new Promise((resolve) => {
      const transaction = db.transaction(['sales'], 'readonly');
      const store = transaction.objectStore('sales');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });

    if (offlineData.length === 0) {
      console.log('Service Worker: No offline data to sync');
      return;
    }

    console.log(`Service Worker: Syncing ${offlineData.length} records`);

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์
    const response = await fetch('https://script.google.com/macros/s/AKfycbxcz209lJDCwls20sDnXMG8V2uP5rUowZ5JWCjG8JEhSfCCyAAWJBBv4sBUrnofuYJH/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(offlineData)
    });

    const result = await response.json();

    if (result.status === 'success') {
      // ลบข้อมูลที่ซิงค์สำเร็จแล้วออกจากฐานข้อมูล
      await new Promise((resolve) => {
        const transaction = db.transaction(['sales'], 'readwrite');
        const store = transaction.objectStore('sales');
        store.clear();
        transaction.oncomplete = () => resolve();
      });

      console.log('Service Worker: Offline data synced successfully');
      
      // แสดงการแจ้งเตือน
      self.registration.showNotification('SSKratomYMT', {
        body: `ซิงค์ข้อมูลสำเร็จ ${result.records_count || offlineData.length} รายการ`,
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/icon-72x72.png',
        tag: 'sync-success'
      });
    } else {
      throw new Error(result.message || 'Sync failed');
    }

  } catch (error) {
    console.error('Service Worker: Sync failed', error);
    
    // แสดงการแจ้งเตือนข้อผิดพลาด
    self.registration.showNotification('SSKratomYMT', {
      body: 'การซิงค์ข้อมูลล้มเหลว จะลองอีกครั้งเมื่อออนไลน์',
      icon: '/images/icons/icon-192x192.png',
      badge: '/images/icons/icon-72x72.png',
      tag: 'sync-error'
    });
  }
}

// ฟังก์ชันจัดการการแจ้งเตือน
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received');
  
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'มีการอัปเดตใหม่จาก SSKratomYMT',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-72x72.png',
    image: data.image || '/images/icons/icon-512x512.png',
    tag: data.tag || 'general-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'open',
        title: 'เปิดแอป'
      },
      {
        action: 'close',
        title: 'ปิด'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SSKratomYMT', options)
  );
});

// ฟังก์ชันจัดการเมื่อมีการคลิกการแจ้งเตือน
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Clicked');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // ถ้ามีหน้าต่างที่เปิดอยู่แล้ว ให้โฟกัสที่หน้านั้น
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        
        // ถ้าไม่มีหน้าต่างที่เปิดอยู่ ให้เปิดหน้าใหม่
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

// ฟังก์ชันจัดการเมื่อการแจ้งเตือนถูกปิด
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification Closed', event.notification.tag);
});

// ฟังก์ชันจัดการข้อความจาก main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message Received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_DATA') {
    event.waitUntil(syncOfflineData());
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: '2.1.0',
      cacheName: CACHE_NAME
    });
  }
});

// ฟังก์ชันตรวจสอบสถานะออนไลน์/ออฟไลน์
function updateOnlineStatus() {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NETWORK_STATUS',
        isOnline: navigator.onLine
      });
    });
  });
}

// ฟังก์ชันตรวจสอบและอัปเดตแคช
async function updateCache() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const requests = STATIC_ASSETS.map(url => new Request(url));
    
    for (const request of requests) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          await cache.put(request, networkResponse);
          console.log('Service Worker: Updated cache for', request.url);
        }
      } catch (error) {
        console.warn('Service Worker: Failed to update cache for', request.url, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Cache update failed', error);
  }
}

// อัปเดตแคชทุกๆ 24 ชั่วโมง
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});