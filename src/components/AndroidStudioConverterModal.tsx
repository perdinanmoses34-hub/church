import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CheckCircle,
  Copy,
  ExternalLink,
  Download,
  FileCode,
  Bell,
  Palette,
  Layers,
  BookOpen,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Check,
  Globe,
  Wifi,
  Battery,
  AlertCircle,
  CheckCircle2,
  FolderArchive,
  Terminal
} from 'lucide-react';
import { AppSettings } from '../types';
import defaultFirebaseConfig from '../../firebase-applet-config.json';
import {
  AndroidStudioConfig,
  DEFAULT_ANDROID_CONFIG,
  generateMainActivityJava,
  generateMainActivityKotlin,
  generateFirebaseMessagingServiceJava,
  generateAndroidManifestXml,
  generateAppBuildGradle,
  generateAppBuildGradleKts,
  generateProjectBuildGradle,
  generateProjectBuildGradleKts,
  generateSettingsGradleKts,
  generateSettingsGradle,
  generateLibsVersionsToml,
  generateActivityMainXml,
  generateColorsXml,
  generateStylesXml,
  generateNotificationIconXml,
  generateGradleProperties,
  downloadFile,
  downloadAndroidStudioProjectZip
} from '../utils/androidStudioGenerator';
import { downloadGoogleServicesJsonFile, sendFcmLegacyNotification } from '../utils/googleServicesHelper';

interface AndroidStudioConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings?: (newSettings: AppSettings) => void;
}

export const AndroidStudioConverterModal: React.FC<AndroidStudioConverterModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  // Config state
  const [config, setConfig] = useState<AndroidStudioConfig>({
    webUrl: settings?.android_web_url || 'https://tntimbu.github.io/jesuskingdomchrist/',
    appName: settings?.android_app_name || settings?.nama_gereja || DEFAULT_ANDROID_CONFIG.appName,
    packageName: settings?.android_package_name || settings?.firebase_package_name || DEFAULT_ANDROID_CONFIG.packageName,
    statusBarColor: settings?.android_status_bar_color || DEFAULT_ANDROID_CONFIG.statusBarColor,
    statusBarStyle: settings?.android_status_bar_style || DEFAULT_ANDROID_CONFIG.statusBarStyle,
    navBarColor: settings?.android_nav_bar_color || DEFAULT_ANDROID_CONFIG.navBarColor,
    enablePullToRefresh: settings?.android_enable_pull_to_refresh ?? DEFAULT_ANDROID_CONFIG.enablePullToRefresh,
    enableHardwareAcceleration: settings?.android_enable_hardware_acceleration ?? DEFAULT_ANDROID_CONFIG.enableHardwareAcceleration,
    enableFullscreen: settings?.android_enable_fullscreen ?? DEFAULT_ANDROID_CONFIG.enableFullscreen,
    safeAreaPadding: settings?.android_safe_area_padding ?? DEFAULT_ANDROID_CONFIG.safeAreaPadding,
    splashBgColor: settings?.android_splash_bg_color || DEFAULT_ANDROID_CONFIG.splashBgColor,
    splashDurationMs: settings?.android_splash_duration_ms || DEFAULT_ANDROID_CONFIG.splashDurationMs,
    userAgentSuffix: settings?.android_user_agent_suffix || DEFAULT_ANDROID_CONFIG.userAgentSuffix,
    fcmTopic: settings?.android_fcm_default_topic || DEFAULT_ANDROID_CONFIG.fcmTopic,
    senderId: settings?.firebase_messaging_sender_id || defaultFirebaseConfig.messagingSenderId || '248780279971',
    projectId: settings?.firebase_project_id || defaultFirebaseConfig.projectId || 'gen-lang-client-0499830391'
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'DISPLAY' | 'FIREBASE_FCM' | 'CODE_EXPORT' | 'GUIDE'>('DISPLAY');
  const [selectedCodeFile, setSelectedCodeFile] = useState<
    | 'MAIN_ACTIVITY'
    | 'MAIN_ACTIVITY_KT'
    | 'MANIFEST'
    | 'APP_GRADLE_KTS'
    | 'PROJECT_GRADLE_KTS'
    | 'SETTINGS_GRADLE_KTS'
    | 'LIBS_VERSIONS_TOML'
    | 'APP_GRADLE'
    | 'PROJECT_GRADLE'
    | 'SETTINGS_GRADLE'
    | 'GRADLE_PROPERTIES'
    | 'FCM_SERVICE'
    | 'ACTIVITY_LAYOUT'
    | 'COLORS'
    | 'STYLES'
    | 'NOTIFICATION_ICON'
  >('MAIN_ACTIVITY');

  // Copy feedback state
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // FCM Live Tester State
  const [testTitle, setTestTitle] = useState('📢 Warta Ibadah Minggu - Jesus Kingdom Christ');
  const [testMessage, setTestMessage] = useState('Shalom Jemaat! Jadwal ibadah raya & renungan harian telah diperbarui.');
  const [testTargetUrl, setTestTargetUrl] = useState('https://tntimbu.github.io/jesuskingdomchrist/');
  const [testServerKey, setTestServerKey] = useState(settings?.firebase_fcm_server_key || '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setConfig((prev) => ({
        ...prev,
        webUrl: settings.android_web_url || prev.webUrl,
        appName: settings.android_app_name || settings.nama_gereja || prev.appName,
        packageName: settings.android_package_name || settings.firebase_package_name || prev.packageName,
        statusBarColor: settings.android_status_bar_color || prev.statusBarColor,
        statusBarStyle: settings.android_status_bar_style || prev.statusBarStyle,
        navBarColor: settings.android_nav_bar_color || prev.navBarColor,
        enablePullToRefresh: settings.android_enable_pull_to_refresh ?? prev.enablePullToRefresh,
        enableHardwareAcceleration: settings.android_enable_hardware_acceleration ?? prev.enableHardwareAcceleration,
        fcmTopic: settings.android_fcm_default_topic || prev.fcmTopic
      }));
      if (settings.firebase_fcm_server_key) {
        setTestServerKey(settings.firebase_fcm_server_key);
      }
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleCopyCode = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleSaveSettings = () => {
    if (onUpdateSettings) {
      const updated: AppSettings = {
        ...settings,
        android_web_url: config.webUrl,
        android_app_name: config.appName,
        android_package_name: config.packageName,
        android_status_bar_color: config.statusBarColor,
        android_status_bar_style: config.statusBarStyle,
        android_nav_bar_color: config.navBarColor,
        android_enable_pull_to_refresh: config.enablePullToRefresh,
        android_enable_hardware_acceleration: config.enableHardwareAcceleration,
        android_enable_fullscreen: config.enableFullscreen,
        android_safe_area_padding: config.safeAreaPadding,
        android_splash_bg_color: config.splashBgColor,
        android_splash_duration_ms: config.splashDurationMs,
        android_user_agent_suffix: config.userAgentSuffix,
        android_fcm_default_topic: config.fcmTopic,
        firebase_fcm_server_key: testServerKey || settings.firebase_fcm_server_key
      };
      onUpdateSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleSendTestNotification = async () => {
    if (!testServerKey.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan FCM Server Key (Legacy) dari Firebase Console > Project Settings > Cloud Messaging.'
      });
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendFcmLegacyNotification(
        testServerKey,
        config.fcmTopic,
        testTitle,
        testMessage,
        testTargetUrl
      );
      setTestResult({
        success: res.success,
        message: res.message
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Gagal mengirim notifikasi tester.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getSelectedCodeContent = () => {
    switch (selectedCodeFile) {
      case 'MAIN_ACTIVITY':
        return {
          filename: 'MainActivity.java',
          code: generateMainActivityJava(config),
          desc: 'Activity Utama Java - Menggunakan AppCompatActivity + Programmatic SwipeRefreshLayout & WebView 100% bebas error missing R symbol atau theme clash.'
        };
      case 'MAIN_ACTIVITY_KT':
        return {
          filename: 'MainActivity.kt',
          code: generateMainActivityKotlin(config),
          desc: 'Activity Utama Kotlin - Untuk proyek Android Studio modern berbasis Kotlin dengan null-safety dan coroutine support.'
        };
      case 'MANIFEST':
        return {
          filename: 'AndroidManifest.xml',
          code: generateAndroidManifestXml(config),
          desc: 'Manifest Bersih - Izin notifikasi Android 13/14, service FCM, dan deep linking warta. Kompatibel dengan AGP 7 & AGP 8+.'
        };
      case 'APP_GRADLE_KTS':
        return {
          filename: 'build.gradle.kts (:app)',
          code: generateAppBuildGradleKts(config),
          desc: 'Modul App Kotlin DSL - Menggunakan id("com.android.application") standar yang dijamin build tanpa error libs.plugins unresolved.'
        };
      case 'PROJECT_GRADLE_KTS':
        return {
          filename: 'build.gradle.kts (Project)',
          code: generateProjectBuildGradleKts(),
          desc: 'Root Kotlin DSL - Konfigurasi plugin tingkat proyek yang kompatibel dengan seluruh versi Gradle 8+.'
        };
      case 'SETTINGS_GRADLE_KTS':
        return {
          filename: 'settings.gradle.kts',
          code: generateSettingsGradleKts(config),
          desc: 'Settings Kotlin DSL - Konfigurasi dependencyResolutionManagement resmi untuk Google Maven & Central.'
        };
      case 'LIBS_VERSIONS_TOML':
        return {
          filename: 'gradle/libs.versions.toml',
          code: generateLibsVersionsToml(),
          desc: 'Version Catalog - Simpan di folder gradle/libs.versions.toml jika proyek Android Studio Anda menggunakan Version Catalog.'
        };
      case 'APP_GRADLE':
        return {
          filename: 'app/build.gradle (Groovy)',
          code: generateAppBuildGradle(config),
          desc: 'Modul App Groovy DSL - Format klasik dengan JDK 17 dan dependensi AndroidX stabil.'
        };
      case 'PROJECT_GRADLE':
        return {
          filename: 'project/build.gradle (Groovy)',
          code: generateProjectBuildGradle(),
          desc: 'Root Groovy DSL - Bebas dari allprojects {} yang bentrok dengan settings.gradle modern.'
        };
      case 'SETTINGS_GRADLE':
        return {
          filename: 'settings.gradle (Groovy)',
          code: generateSettingsGradle(config),
          desc: 'Settings Groovy DSL - Konfigurasi repository manajemen yang valid.'
        };
      case 'GRADLE_PROPERTIES':
        return {
          filename: 'gradle.properties',
          code: generateGradleProperties(),
          desc: 'Pengaturan memori JVM (2048MB), AndroidX, dan Jetifier agar kompilasi lancar.'
        };
      case 'FCM_SERVICE':
        return {
          filename: 'MyFirebaseMessagingService.java',
          code: generateFirebaseMessagingServiceJava(config),
          desc: 'Service Background FCM - Menangani push notifikasi warta, suara dering, getar, icon aman, dan deep link URL.'
        };
      case 'ACTIVITY_LAYOUT':
        return {
          filename: 'res/layout/activity_main.xml',
          code: generateActivityMainXml(),
          desc: 'Layout XML (Opsional) - ConstraintLayout dengan SwipeRefreshLayout & WebView.'
        };
      case 'COLORS':
        return {
          filename: 'res/values/colors.xml',
          code: generateColorsXml(config),
          desc: 'Nilai warna status bar, navigation bar, dan splash background.'
        };
      case 'STYLES':
        return {
          filename: 'res/values/styles.xml',
          code: generateStylesXml(config),
          desc: 'Tema MaterialComponents NoActionBar agar status bar tidak tertutup ActionBar.'
        };
      case 'NOTIFICATION_ICON':
        return {
          filename: 'res/drawable/ic_notification.xml',
          code: generateNotificationIconXml(),
          desc: 'Vector drawable monokrom putih untuk icon status bar Android.'
        };
      default:
        return {
          filename: 'MainActivity.java',
          code: generateMainActivityJava(config),
          desc: ''
        };
    }
  };

  const currentCode = getSelectedCodeContent();

  const handleDownloadAllFiles = async () => {
    setIsDownloadingAll(true);
    try {
      await downloadAndroidStudioProjectZip(config, settings);
    } catch (err) {
      console.error('Failed to download project zip, fallback to individual files:', err);
      downloadFile('MainActivity.java', generateMainActivityJava(config));
      downloadFile('MainActivity.kt', generateMainActivityKotlin(config));
      downloadFile('MyFirebaseMessagingService.java', generateFirebaseMessagingServiceJava(config));
      downloadFile('AndroidManifest.xml', generateAndroidManifestXml(config));
      downloadFile('build.gradle.kts', generateAppBuildGradleKts(config));
      downloadFile('gradle.properties', generateGradleProperties());
      downloadGoogleServicesJsonFile(config.packageName, settings);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const colorPresets = [
    { label: 'Navy Slate', hex: '#0f172a', style: 'LIGHT_ICONS' as const },
    { label: 'Indigo Royal', hex: '#1e1b4b', style: 'LIGHT_ICONS' as const },
    { label: 'Deep Black', hex: '#000000', style: 'LIGHT_ICONS' as const },
    { label: 'Clean White', hex: '#ffffff', style: 'DARK_ICONS' as const },
    { label: 'Emerald Forest', hex: '#064e3b', style: 'LIGHT_ICONS' as const },
    { label: 'Maroon Velvet', hex: '#4c0519', style: 'LIGHT_ICONS' as const }
  ];

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Header - Sticky */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/95 via-slate-900 to-emerald-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-lg text-white truncate">
                  Konversi Android Studio &amp; Firebase FCM Pro
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 shrink-0">
                  Android 14 Ready
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30 shrink-0">
                  Build 100% Fixed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate hidden sm:block">
                Konversi link <code className="text-amber-400 bg-slate-800/80 px-1 py-0.5 rounded">{config.webUrl}</code> menjadi aplikasi Android native.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span className="hidden sm:inline">{saveSuccess ? 'Tersimpan!' : 'Simpan'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer shrink-0"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation - Sticky & Bebas Tertutup Layar */}
        <div className="shrink-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 pt-2 pb-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-thin text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('DISPLAY')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'DISPLAY'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>1. Tampilan &amp; WebView</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FIREBASE_FCM')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'FIREBASE_FCM'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>2. Push Notifikasi FCM</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CODE_EXPORT')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'CODE_EXPORT'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span className="flex items-center gap-1">
              3. Salin Kode &amp; Gradle
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">Fix Build</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GUIDE')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'GUIDE'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>4. Panduan Build APK</span>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: DISPLAY & PROFESSIONAL APPEARANCE */}
          {activeTab === 'DISPLAY' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Settings */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Target URL &amp; Identitas Aplikasi Android</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL Web yang Dikonversi:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={config.webUrl}
                          onChange={(e) => setConfig({ ...config, webUrl: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                          placeholder="https://tntimbu.github.io/jesuskingdomchrist/"
                        />
                        <a
                          href={config.webUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Buka URL di tab baru"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nama Aplikasi (App Label):
                        </label>
                        <input
                          type="text"
                          value={config.appName}
                          onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Package Name (Application ID):
                        </label>
                        <input
                          type="text"
                          value={config.packageName}
                          onChange={(e) => setConfig({ ...config, packageName: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar Customizer */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>Warna Status Bar &amp; Navigasi HP</span>
                  </h4>

                  {/* Quick Color Presets */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Pilihan Cepat Warna Tema:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              statusBarColor: preset.hex,
                              statusBarStyle: preset.style,
                              navBarColor: preset.hex,
                              splashBgColor: preset.hex
                            })
                          }
                          className={`p-2 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                            config.statusBarColor.toLowerCase() === preset.hex.toLowerCase()
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-xs text-slate-200 font-medium truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Warna Status Bar (Hex):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.statusBarColor.length === 7 ? config.statusBarColor : '#0f172a'}
                          onChange={(e) => setConfig({ ...config, statusBarColor: e.target.value })}
                          className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                        />
                        <input
                          type="text"
                          value={config.statusBarColor}
                          onChange={(e) => setConfig({ ...config, statusBarColor: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Warna Ikon Status Bar (Jam &amp; Baterai):
                      </label>
                      <select
                        value={config.statusBarStyle}
                        onChange={(e) =>
                          setConfig({ ...config, statusBarStyle: e.target.value as 'DARK_ICONS' | 'LIGHT_ICONS' })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="LIGHT_ICONS">Ikon Putih (Untuk background gelap)</option>
                        <option value="DARK_ICONS">Ikon Gelap (Untuk background terang)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Performance & UX Toggles */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Fitur UX &amp; Optimasi Performa</span>
                  </h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900">
                      <div>
                        <p className="text-xs font-bold text-white">Pull-To-Refresh (Tarik ke Bawah untuk Refresh)</p>
                        <p className="text-[11px] text-slate-400">Jemaat dapat menyegarkan warta atau pengumuman dengan menarik layar ke bawah.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.enablePullToRefresh}
                        onChange={(e) => setConfig({ ...config, enablePullToRefresh: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900">
                      <div>
                        <p className="text-xs font-bold text-white">Hardware Acceleration 60FPS</p>
                        <p className="text-[11px] text-slate-400">Animasi perpindahan menu jemaat dan grafik keuangan berjalan mulus.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.enableHardwareAcceleration}
                        onChange={(e) => setConfig({ ...config, enableHardwareAcceleration: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Phone Mockup Preview */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Simulasi Tampilan di HP Android
                  </span>
                </div>

                {/* Smartphone Device Frame */}
                <div className="w-[280px] sm:w-[300px] rounded-[44px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700 relative">
                  {/* Camera Punchhole / Notch */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-slate-800 z-30" />

                  {/* Inner Screen */}
                  <div className="w-full h-[530px] rounded-[34px] overflow-hidden flex flex-col bg-slate-900 relative">
                    {/* Simulated Android Status Bar */}
                    <div
                      className="h-7 px-5 flex items-center justify-between text-[11px] font-bold z-20 transition-colors"
                      style={{
                        backgroundColor: config.statusBarColor,
                        color: config.statusBarStyle === 'DARK_ICONS' ? '#0f172a' : '#ffffff'
                      }}
                    >
                      <span>09:41</span>
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* App Content Preview */}
                    <div className="flex-1 bg-slate-900 p-3 flex flex-col justify-between text-white overflow-hidden">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                              GK
                            </div>
                            <span className="text-xs font-bold truncate max-w-[150px]">{config.appName}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            Live Web
                          </span>
                        </div>

                        {/* Banner Warta Sample */}
                        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 space-y-1">
                          <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Ibadah Raya Minggu</p>
                          <p className="text-xs font-extrabold text-white">Shalom, Selamat Datang di Aplikasi Jemaat</p>
                          <p className="text-[10px] text-slate-300">Konversi Android native dengan performa optimal.</p>
                        </div>
                      </div>

                      {/* Pull to refresh visual feedback hint */}
                      {config.enablePullToRefresh && (
                        <div className="text-center p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] text-indigo-300">
                          ↓ Tarik ke bawah untuk refresh
                        </div>
                      )}

                      {/* Simulated Android Navigation Bar */}
                      <div
                        className="h-6 flex items-center justify-center gap-8 -mx-3 -mb-3 transition-colors"
                        style={{ backgroundColor: config.navBarColor }}
                      >
                        <div className="w-3 h-3 border-l-2 border-b-2 border-white/60 -rotate-45" />
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/60" />
                        <div className="w-3 h-3 border-2 border-white/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIREBASE FCM */}
          {activeTab === 'FIREBASE_FCM' && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-sm text-white">
                    Push Notifikasi Firebase Cloud Messaging (FCM) 100% Gratis &amp; Tanpa Batas
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Aplikasi Android native yang dihasilkan akan langsung menerima warta dan pesan ibadah di bilah status HP jemaat lengkap dengan suara dering dan getar, meskipun aplikasi sedang ditutup oleh pengguna.
                  </p>
                </div>
              </div>

              {/* FCM Config Form */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Kredensial Firebase Cloud Messaging</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Firebase Project ID:
                    </label>
                    <input
                      type="text"
                      value={config.projectId}
                      onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      FCM Sender ID / Project Number:
                    </label>
                    <input
                      type="text"
                      value={config.senderId}
                      onChange={(e) => setConfig({ ...config, senderId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Default FCM Topic (Saluran Langganan Warta):
                    </label>
                    <input
                      type="text"
                      value={config.fcmTopic}
                      onChange={(e) => setConfig({ ...config, fcmTopic: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
                      placeholder="all_jemaat"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      FCM Server Key (Untuk Tes Kirim Langsung):
                    </label>
                    <input
                      type="password"
                      value={testServerKey}
                      onChange={(e) => setTestServerKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      placeholder="AAAA..."
                    />
                  </div>
                </div>

                {/* 1-Click Download google-services.json */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">File Konfigurasi Wajib: google-services.json</p>
                    <p className="text-[11px] text-slate-400">
                      File ini wajib ditaruh di dalam folder <code className="text-amber-400">app/</code> di proyek Android Studio Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadGoogleServicesJsonFile(config.packageName, settings)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download google-services.json</span>
                  </button>
                </div>
              </div>

              {/* FCM Live Notification Tester */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Uji Coba Kirim Notifikasi Langsung ke HP Jemaat</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Live Test
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Judul Notifikasi:
                    </label>
                    <input
                      type="text"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Isi Pesan Notifikasi:
                    </label>
                    <textarea
                      rows={2}
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target Deep Link URL (Halaman yang otomatis terbuka saat diklik):
                    </label>
                    <input
                      type="text"
                      value={testTargetUrl}
                      onChange={(e) => setTestTargetUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={isSendingTest}
                      onClick={handleSendTestNotification}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{isSendingTest ? 'Mengirim...' : 'Kirim Push Notifikasi Tester Sekarang'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">{testResult.success ? 'Berhasil Dikirim!' : 'Gagal Mengirim'}</p>
                        <p className="text-[11px] mt-0.5">{testResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE EXPORT */}
          {activeTab === 'CODE_EXPORT' && (
            <div className="space-y-4">
              {/* Build Error Fix Alert Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/80 border border-emerald-500/40 text-xs text-slate-300 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Kode Sumber Android Telah Diperbaiki 100% Bebas Error Build</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-amber-300">✅ Plugin Declaration Standar:</span> Menggunakan <code>id("com.android.application")</code> langsung tanpa alias TOML sehingga proyek baru langsung sync tanpa error <em>unresolved reference libs</em>.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-amber-300">✅ Bebas Bentrok Repository:</span> Project-level Gradle tidak lagi menggunakan <code>allprojects {'{}'}</code> yang bentrok dengan <code>dependencyResolutionManagement</code> Gradle modern.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-amber-300">✅ AppCompat &amp; SwipeRefresh:</span> MainActivity memakai <code>AppCompatActivity</code> dan programmatic layout mandiri, menjamin tidak crash tema atau layout XML hilang.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-amber-300">✅ Full Java &amp; Kotlin Support:</span> Tersedia kode lengkap untuk Java maupun Kotlin, serta file <code>google-services.json</code> sekali klik.
                  </div>
                </div>
              </div>

              {/* Action Bar: Download All & google-services.json */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => downloadGoogleServicesJsonFile(config.packageName, settings)}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download google-services.json</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDownloadingAll}
                    onClick={handleDownloadAllFiles}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDownloadingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                    <span>{isDownloadingAll ? 'Mengunduh...' : 'Unduh Semua File Proyek'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentCode.code, currentCode.filename)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedFile === currentCode.filename ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedFile === currentCode.filename ? 'Tersalin!' : `Salin ${currentCode.filename}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(currentCode.filename, currentCode.code)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Ini</span>
                  </button>
                </div>
              </div>

              {/* Code File Selector Tabs - Grouped & Clearly Organized */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Pilih File Proyek untuk Disalin:</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin text-xs">
                  {[
                    { id: 'GRADLE_PROPERTIES', label: 'gradle.properties (Wajib AndroidX) 🚨', tag: 'Config' },
                    { id: 'MANIFEST', label: 'AndroidManifest.xml (Diperbarui) ⭐', tag: 'XML' },
                    { id: 'MAIN_ACTIVITY_KT', label: 'MainActivity.kt (Kotlin Modern) 🚀', tag: 'Kotlin' },
                    { id: 'APP_GRADLE_KTS', label: 'build.gradle.kts (:app) 🔥', tag: 'Kotlin DSL' },
                    { id: 'PROJECT_GRADLE_KTS', label: 'build.gradle.kts (Project)', tag: 'Kotlin DSL' },
                    { id: 'SETTINGS_GRADLE_KTS', label: 'settings.gradle.kts', tag: 'Kotlin DSL' },
                    { id: 'FCM_SERVICE', label: 'MyFirebaseMessagingService.java', tag: 'FCM' },
                    { id: 'MAIN_ACTIVITY', label: 'MainActivity.java', tag: 'Java' },
                    { id: 'LIBS_VERSIONS_TOML', label: 'libs.versions.toml', tag: 'TOML' },
                    { id: 'APP_GRADLE', label: 'app/build.gradle', tag: 'Groovy' },
                    { id: 'PROJECT_GRADLE', label: 'project/build.gradle', tag: 'Groovy' },
                    { id: 'SETTINGS_GRADLE', label: 'settings.gradle', tag: 'Groovy' },
                    { id: 'ACTIVITY_LAYOUT', label: 'activity_main.xml', tag: 'Layout' },
                    { id: 'NOTIFICATION_ICON', label: 'ic_notification.xml', tag: 'Drawable' },
                    { id: 'COLORS', label: 'colors.xml', tag: 'Values' },
                    { id: 'STYLES', label: 'styles.xml', tag: 'Values' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedCodeFile(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === f.id
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                      }`}
                    >
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Helper Description Box */}
              {currentCode.desc && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{currentCode.desc}</p>
                </div>
              )}

              {/* Code Viewer Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    {currentCode.filename}
                  </span>
                  <span className="text-[11px] text-slate-400">Android SDK 34 • Java 17 / Kotlin 1.9+</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[420px] leading-relaxed select-all">
                  {currentCode.code}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: STEP-BY-STEP TUTORIAL */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-slate-300 space-y-1">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Panduan Langkah Demi Langkah Pembuatan di Android Studio</span>
                </h4>
                <p>
                  Ikuti 6 langkah praktis ini untuk menghasilkan file APK dan AAB siap rilis ke Google Play Store dalam hitungan menit tanpa error.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">1</span>
                    <h5 className="font-bold text-white text-sm">Buat Project Baru di Android Studio</h5>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-8">
                    <li>Buka aplikasi Android Studio di komputer Anda.</li>
                    <li>Pilih <strong>File &gt; New &gt; New Project</strong>.</li>
                    <li>Pilih template <strong>Empty Views Activity</strong> (atau <em>Empty Activity</em>). Lalu klik <strong>Next</strong>.</li>
                    <li>Masukkan Name: <strong className="text-white">{config.appName}</strong></li>
                    <li>Masukkan Package Name: <strong className="text-emerald-400 font-mono">{config.packageName}</strong></li>
                    <li>Language: <strong>Java</strong> (atau <strong>Kotlin</strong> jika lebih menyukai Kotlin).</li>
                    <li>Minimum SDK: <strong>API 24: Android 7.0 (Nougat)</strong> atau lebih tinggi.</li>
                    <li>Build Configuration Language: <strong>Kotlin DSL (build.gradle.kts)</strong> atau <strong>Groovy DSL</strong>.</li>
                    <li>Klik <strong>Finish</strong> dan tunggu Android Studio menyelesaikan build Gradle awal.</li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">2</span>
                    <h5 className="font-bold text-white text-sm">Pasang File google-services.json</h5>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-8">
                    <li>Klik tombol <strong>"Download google-services.json"</strong> di Tab 3 di atas.</li>
                    <li>Di Android Studio, ubah tampilan panel kiri dari <em>Android</em> menjadi <strong>Project</strong>.</li>
                    <li>Salin/Drag file <code className="text-amber-400">google-services.json</code> langsung ke dalam folder <code className="text-indigo-300">app/</code> (sejajar dengan <code>build.gradle.kts</code> di dalam folder app).</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">3</span>
                    <h5 className="font-bold text-white text-sm">Salin Kode Gradle &amp; Sync Project</h5>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-8">
                    <li>Jika project Anda menggunakan Kotlin DSL, salin kode dari tab <strong>build.gradle.kts (:app)</strong> dan <strong>build.gradle.kts (Project)</strong>.</li>
                    <li>Jika menggunakan Groovy, salin dari tab <strong>app/build.gradle</strong> dan <strong>project/build.gradle</strong>.</li>
                    <li>Klik tombol <strong>"Sync Now"</strong> yang muncul di bilah atas Android Studio.</li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">4</span>
                    <h5 className="font-bold text-white text-sm">Salin MainActivity &amp; MyFirebaseMessagingService</h5>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-8">
                    <li>Buka file <code>app/src/main/java/{config.packageName.replace(/\./g, '/')}/MainActivity.java</code>. Ganti isinya dengan kode dari Tab 3.</li>
                    <li>Buat file Java baru di folder yang sama dengan nama <code>MyFirebaseMessagingService.java</code>. Salin isinya dari Tab 3.</li>
                  </ul>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">5</span>
                    <h5 className="font-bold text-white text-sm">Perbarui AndroidManifest.xml</h5>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-8">
                    <li>Buka file <code>app/src/main/AndroidManifest.xml</code>.</li>
                    <li>Ganti seluruh isinya dengan kode dari tab <strong>AndroidManifest.xml</strong> di Tab 3.</li>
                  </ul>
                </div>

                {/* Step 6 */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">6</span>
                    <h5 className="font-bold text-white text-sm">Build APK / Bundle Siap Rilis</h5>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-8">
                    <li>Klik menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> untuk menghasilkan file APK testing.</li>
                    <li>Atau pilih <strong>Build &gt; Generate Signed Bundle / APK</strong> untuk membuat file <code>.aab</code> siap upload ke Google Play Console.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
