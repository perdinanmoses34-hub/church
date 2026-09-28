import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { getActiveFirebaseConfig, getFirestoreInstance, pushToCloud } from './firebaseSync';

let messagingInstance: Messaging | null = null;

/**
 * Plays a pleasant double-chime bell notification sound using Web Audio API
 */
export function playNotificationChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Chime 1 (High bell pitch E6 - 1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Chime 2 (Lower bell pitch G5 - 783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.warn('[FirebaseMessaging] Sound play error:', e);
  }
}

/**
 * Registers Service Worker for Firebase Messaging
 */
export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[FirebaseMessaging] Service Worker not supported');
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[FirebaseMessaging] Service worker registered successfully:', reg);
    return reg;
  } catch (err) {
    console.warn('[FirebaseMessaging] SW registration failed, falling back to /sw.js:', err);
    try {
      return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (e) {
      return null;
    }
  }
}

/**
 * Request Push Notification Permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    alert('Browser ini tidak mendukung Notifikasi HP');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playNotificationChimeSound();
    }
    return permission;
  } catch (e) {
    console.warn('[FirebaseMessaging] Permission request error:', e);
    return 'denied';
  }
}

/**
 * Get or Initialize Firebase Messaging instance
 */
export function getFirebaseMessaging(): Messaging | null {
  if (messagingInstance) return messagingInstance;
  if (typeof window === 'undefined') return null;

  try {
    const config = getActiveFirebaseConfig();
    const existingApps = getApps();
    let app = existingApps.find((a) => a.name === `app_${config.projectId}`);
    if (!app) {
      if (existingApps.length > 0) {
        app = existingApps[0];
      } else {
        app = initializeApp(config, `app_${config.projectId}`);
      }
    }

    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (e) {
    console.warn('[FirebaseMessaging] Messaging initialization failed:', e);
    return null;
  }
}

/**
 * Obtains FCM Device Token and saves it to Cloud Firestore for Push Notifications
 */
export async function requestAndSaveFCMToken(vapidKey?: string): Promise<string | null> {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    return null;
  }

  try {
    const swReg = await registerMessagingServiceWorker();
    const messaging = getFirebaseMessaging();

    if (!messaging || !swReg) {
      console.warn('[FirebaseMessaging] Cannot get messaging or SW registration');
      return null;
    }

    // Attempt to get token (optional VAPID key)
    const options: { serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey?: string } = {
      serviceWorkerRegistration: swReg
    };

    if (vapidKey && vapidKey.trim()) {
      options.vapidKey = vapidKey.trim();
    }

    const token = await getToken(messaging, options);

    if (token) {
      console.log('[FirebaseMessaging] FCM Token obtained:', token);
      
      // Save device token to localStorage and Firestore push queue
      localStorage.setItem('cms_pro_fcm_my_token', token);

      const existingTokensStr = localStorage.getItem('cms_pro_fcm_tokens');
      let tokensList: string[] = existingTokensStr ? JSON.parse(existingTokensStr) : [];
      if (!tokensList.includes(token)) {
        tokensList.push(token);
        localStorage.setItem('cms_pro_fcm_tokens', JSON.stringify(tokensList));
        await pushToCloud('cms_pro_fcm_tokens', tokensList);
      }

      return token;
    } else {
      console.warn('[FirebaseMessaging] No registration token available.');
      return null;
    }
  } catch (err: any) {
    console.warn('[FirebaseMessaging] Error getting FCM Token:', err);
    return null;
  }
}

/**
 * Triggers status-bar notification + vibration + sound on HP / Desktop
 */
export async function triggerStatusBarNotification(
  title: string,
  body: string,
  dataUrl: string = '/'
): Promise<boolean> {
  // Always play sound chime
  playNotificationChimeSound();

  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  // 1. Try ServiceWorker showNotification (Applies to status bar on mobile even if closed/background)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1548625361-185966347898?w=192&auto=format&fit=crop&q=80',
          badge: 'https://images.unsplash.com/photo-1548625361-185966347898?w=192&auto=format&fit=crop&q=80',
          vibrate: [200, 100, 200, 100, 200, 100, 400],
          tag: 'gkfc-status-bar-notif',
          renotify: true,
          requireInteraction: true,
          data: { url: dataUrl }
        } as any);
        return true;
      }
    } catch (e) {
      console.warn('[FirebaseMessaging] SW showNotification failed, trying fallback:', e);
    }
  }

  // 2. Standard Web Notification fallback
  try {
    const notif = new Notification(title, {
      body,
      icon: 'https://images.unsplash.com/photo-1548625361-185966347898?w=192&auto=format&fit=crop&q=80',
      vibrate: [200, 100, 200, 100, 200]
    } as any);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (e) {
    console.warn('[FirebaseMessaging] Native Notification failed:', e);
    return false;
  }
}

/**
 * Listens for foreground Firebase messages
 */
export function listenToForegroundMessages(onMessageCallback: (payload: any) => void): () => void {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[FirebaseMessaging] Foreground message received:', payload);
    const title = payload.notification?.title || payload.data?.title || 'Notifikasi GKFC';
    const body = payload.notification?.body || payload.data?.body || 'Ada pesan baru dari gereja.';
    
    triggerStatusBarNotification(title, body);
    onMessageCallback(payload);
  });
}
