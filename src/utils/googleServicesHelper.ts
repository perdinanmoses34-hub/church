import defaultFirebaseConfig from '../../firebase-applet-config.json';
import { AppSettings } from '../types';

/**
 * Generates official Google Services JSON configuration format required by Website 2 APK Builder Pro
 * specifically for native Firebase Cloud Messaging (FCM) background push notifications.
 */
export function generateGoogleServicesJson(
  packageName: string = 'com.jesuskingdomchrist.app',
  settings?: AppSettings
): any {
  const cleanPackage = (packageName || 'com.jesuskingdomchrist.app').trim().toLowerCase();
  const projectId = settings?.firebase_project_id || defaultFirebaseConfig.projectId || 'gen-lang-client-0499830391';
  const projectNumber = settings?.firebase_messaging_sender_id || defaultFirebaseConfig.messagingSenderId || '248780279971';
  const apiKey = settings?.firebase_api_key || defaultFirebaseConfig.apiKey || 'AIzaSyARxHT9QiZMBGMG0lF4AHLF1ZiQqLl_bHM';
  const storageBucket = settings?.firebase_storage_bucket || defaultFirebaseConfig.storageBucket || `${projectId}.firebasestorage.app`;
  const oauthClientId = defaultFirebaseConfig.oAuthClientId || `${projectNumber}-8teokfdp2sdlqqceu6bca0m0o9rledj1.apps.googleusercontent.com`;

  // Generate synthetic but compliant mobile SDK app id for Android
  const packageHash = cleanPackage.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || 'gkfcapp12345';
  const mobileSdkAppId = `1:${projectNumber}:android:${packageHash}`;

  return {
    project_info: {
      project_number: projectNumber,
      project_id: projectId,
      storage_bucket: storageBucket
    },
    client: [
      {
        client_info: {
          mobilesdk_app_id: mobileSdkAppId,
          android_client_info: {
            package_name: cleanPackage
          }
        },
        oauth_client: [
          {
            client_id: oauthClientId,
            client_type: 3
          }
        ],
        api_key: [
          {
            current_key: apiKey
          }
        ],
        services: {
          analytics_service: {
            status: 1
          },
          appinvite_service: {
            status: 1,
            other_platform_oauth_client: []
          },
          ads_service: {
            status: 1
          }
        }
      }
    ],
    configuration_version: '1'
  };
}

/**
 * Initiates direct browser download of `google-services.json`
 */
export function downloadGoogleServicesJsonFile(
  packageName: string = 'com.gkfc',
  settings?: AppSettings
): void {
  try {
    const jsonObj = generateGoogleServicesJson(packageName, settings);
    const jsonString = JSON.stringify(jsonObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'google-services.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download google-services.json:', err);
    alert('Gagal mendownload file google-services.json. Silakan coba lagi.');
  }
}

/**
 * Broadcast FCM notification to Android App devices (via FCM Legacy API if server key provided)
 */
export async function sendFcmLegacyNotification(
  serverKey: string,
  packageName: string,
  title: string,
  body: string,
  dataUrl: string = '/'
): Promise<{ success: boolean; message: string }> {
  if (!serverKey || !serverKey.trim()) {
    return {
      success: false,
      message: 'Server Key FCM belum diisi. Anda dapat mengirim notifikasi langsung dari Firebase Console.'
    };
  }

  try {
    const payload = {
      to: `/topics/${packageName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      notification: {
        title: title,
        body: body,
        sound: 'default',
        icon: 'ic_launcher',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      data: {
        url: dataUrl,
        title: title,
        message: body
      },
      priority: 'high'
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${serverKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true, message: 'Notifikasi berhasil dikirim via Firebase Cloud Messaging!' };
    } else {
      const errText = await response.text();
      return { success: false, message: `Gagal mengirim ke FCM: ${errText}` };
    }
  } catch (e: any) {
    return { success: false, message: `Koneksi FCM gagal: ${e?.message || e}` };
  }
}
