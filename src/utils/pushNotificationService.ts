import { triggerStatusBarNotification, playNotificationChimeSound } from './firebaseMessaging';
import { AppSettings } from '../types';

export interface PushNotificationPayload {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
}

export interface PushNotificationResult {
  success: boolean;
  recipients?: number;
  id?: string;
  error?: string;
  method?: 'onesignal' | 'local_sw' | 'none';
}

/**
 * Sends a Push Notification via OneSignal REST API to all subscribed devices
 * (including Android APK / PWA / Mobile Browser when the app is completely CLOSED)
 */
export async function sendOneSignalPushNotification(
  appId: string,
  restApiKey: string,
  payload: PushNotificationPayload
): Promise<PushNotificationResult> {
  if (!appId || !appId.trim()) {
    return {
      success: false,
      error: 'OneSignal App ID belum dikonfigurasi. Silakan masukkan di menu Pengaturan > Notifikasi HP.'
    };
  }

  const cleanAppId = appId.trim();
  const cleanKey = restApiKey ? restApiKey.trim().replace(/^Basic\s+/i, '') : '';

  if (!cleanKey) {
    return {
      success: false,
      error: 'OneSignal REST API Key belum diisi. Kunci ini diperlukan untuk otorisasi pengiriman notifikasi dari aplikasi ke server OneSignal. Buka OneSignal Dashboard > Settings > Keys & IDs untuk menyalin REST API Key Anda.'
    };
  }

  try {
    const bodyPayload: Record<string, any> = {
      app_id: cleanAppId,
      // Target all registered subscribers across Android, iOS, and Web
      included_segments: ['Total Subscriptions', 'Subscribed Users'],
      headings: {
        en: payload.title,
        id: payload.title
      },
      contents: {
        en: payload.message,
        id: payload.message
      },
      url: payload.url || window.location.origin,
      web_url: payload.url || window.location.origin,
      small_icon: 'ic_stat_onesignal_default',
      android_accent_color: 'FF4F46E5', // Indigo-600
      android_visibility: 1,
      priority: 10,
      data: {
        ...(payload.data || {}),
        timestamp: new Date().toISOString(),
        source: 'gkfc_cms_pro'
      }
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${cleanKey}`
    };

    // Try modern OneSignal API first, fallback to standard
    let response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload)
    }).catch(() => null);

    if (!response || !response.ok) {
      // Fallback to classic endpoint
      response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload)
      });
    }

    const resJson = await response.json();

    if (response.ok && !resJson.errors) {
      console.log('[OneSignal] Push sent successfully:', resJson);
      return {
        success: true,
        recipients: resJson.recipients ?? 1,
        id: resJson.id,
        method: 'onesignal'
      };
    } else {
      console.warn('[OneSignal] Push response error:', resJson);
      let errMsg = 'Gagal mengirim notifikasi via OneSignal';
      if (Array.isArray(resJson.errors)) {
        errMsg = resJson.errors.join(', ');
      } else if (typeof resJson.errors === 'string') {
        errMsg = resJson.errors;
      } else if (resJson.message) {
        errMsg = resJson.message;
      }
      return {
        success: false,
        error: errMsg,
        method: 'onesignal'
      };
    }
  } catch (err: any) {
    console.error('[OneSignal] Network or execution error:', err);
    return {
      success: false,
      error: err.message || 'Gagal menghubungi server OneSignal API. Pastikan jaringan internet aktif dan REST API Key valid.',
      method: 'onesignal'
    };
  }
}

/**
 * Prompts user for Push Notification permission via OneSignal Web SDK
 */
export async function promptOneSignalPermission(): Promise<{ granted: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { granted: false, message: 'Window tidak tersedia' };
  }

  const OneSignal = (window as any).OneSignal;
  if (!OneSignal) {
    // Fallback to native browser Notification API
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          return { granted: true, message: 'Izin notifikasi browser berhasil diaktifkan!' };
        } else {
          return { granted: false, message: `Izin notifikasi: ${perm}` };
        }
      } catch (e: any) {
        return { granted: false, message: `Gagal meminta izin: ${e?.message || e}` };
      }
    }
    return { granted: false, message: 'SDK OneSignal belum siap atau App ID belum diisi.' };
  }

  try {
    if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
      await OneSignal.Notifications.requestPermission();
      const isPushEnabled = OneSignal.Notifications.permission;
      return {
        granted: !!isPushEnabled,
        message: isPushEnabled ? 'Izin notifikasi OneSignal berhasil diaktifkan pada perangkat ini!' : 'Izin belum diizinkan oleh pengguna.'
      };
    } else if (OneSignal.Slidedown && typeof OneSignal.Slidedown.promptPush === 'function') {
      await OneSignal.Slidedown.promptPush();
      return { granted: true, message: 'Permintaan izin notifikasi telah ditampilkan di layar!' };
    }
    return { granted: true, message: 'Perangkat berhasil terdaftar di OneSignal!' };
  } catch (err: any) {
    return { granted: false, message: err?.message || 'Gagal meminta izin OneSignal' };
  }
}

/**
 * Initializes OneSignal Web SDK in browser if configured
 */
export function initOneSignalWebSDK(appId?: string): void {
  if (typeof window === 'undefined' || !appId || !appId.trim()) return;

  try {
    const existing = document.getElementById('onesignal-sdk-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'onesignal-sdk-script';
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);

      (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
      (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
        try {
          await OneSignal.init({
            appId: appId.trim(),
            serviceWorkerPath: 'OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/' },
            notifyButton: {
              enable: false
            },
            allowLocalhostAsSecureOrigin: true
          });
          console.log('[OneSignal] Web SDK initialized successfully with App ID:', appId.trim());
        } catch (initErr) {
          console.warn('[OneSignal] Init warning:', initErr);
        }
      });
    }
  } catch (err) {
    console.warn('[OneSignal] Web SDK setup error:', err);
  }
}

/**
 * Broadcasts an Announcement to all church members:
 * 1. Pushes to Android APK / PWA / Web status bar via OneSignal (works even when app is closed)
 * 2. Triggers active browser/webview Service Worker notification & double chime bell sound
 */
export async function broadcastChurchAnnouncement(
  settings: AppSettings,
  title: string,
  message: string,
  targetUrl: string = '/'
): Promise<PushNotificationResult> {
  // Always trigger sound chime immediately
  playNotificationChimeSound();

  // Local status bar notification for active browser/devices
  try {
    await triggerStatusBarNotification(title, message, targetUrl);
  } catch (e) {
    console.warn('[Push] Local status bar notification error:', e);
  }

  // Check if OneSignal is enabled and configured
  const appId = settings.onesignal_app_id;
  const restApiKey = settings.onesignal_rest_api_key;

  if (settings.onesignal_enabled !== false && appId && appId.trim()) {
    const result = await sendOneSignalPushNotification(appId, restApiKey || '', {
      title,
      message,
      url: targetUrl
    });
    return result;
  }

  return {
    success: true,
    method: 'local_sw',
    recipients: 1
  };
}
