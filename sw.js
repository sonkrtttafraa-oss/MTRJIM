/* sw.js - الخادم الخفي
   هذا الملف يشتغل في الخلفية على هاتف الأم
   مهمته: استقبال الإشعارات وعرضها حتى لو التطبيق مغلق */

// اسم الكاش - نحفظ فيه الملفات عشان يشتغل بدون إنترنت
const CACHE_NAME = 'mutarjim-v1';

// لما يتثبت التطبيق لأول مرة
self.addEventListener('install', event => {
  self.skipWaiting(); // تثبيت فوري بدون انتظار
});

// لما يتفعل التطبيق
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // يسيطر على كل النوافذ فوراً
});

// ===== استقبال الإشعارات من الموقع =====
self.addEventListener('push', event => {
  // البيانات اللي وصلت من الموقع
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || '🧠 مترجم الأحاسيس';
  const options = {
    body: data.body || 'تنبيه جديد',
    icon: '/icon-192.png',      // أيقونة التطبيق
    badge: '/icon-96.png',      // أيقونة صغيرة في شريط الهاتف
    vibrate: [200, 100, 200],   // اهتزاز الهاتف
    tag: data.tag || 'emotion', // لو وصل إشعار جديد يحل محل القديم
    requireInteraction: data.urgent || false, // الإشعارات الطارئة تبقى حتى تضغطي عليها
    data: { url: data.url || '/' }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// لما تضغطي على الإشعار - يفتح التطبيق
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// استقبال رسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, urgent } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      vibrate: urgent ? [300, 100, 300, 100, 300] : [200, 100, 200],
      requireInteraction: urgent || false,
      tag: 'emotion-alert'
    });
  }
});
