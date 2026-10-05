import React, { useState, useEffect, useRef } from 'react';
import { User, AppSettings, ChatMessage } from './types';
import { StorageManager } from './utils/storage';
import { LoginPage } from './components/LoginPage';
import { NavbarHeader } from './components/NavbarHeader';
import { Sidebar, NavTab } from './components/Sidebar';
import { CardMenuModal } from './components/CardMenuModal';
import { BottomNav } from './components/BottomNav';
import { APK_DOWNLOAD_URL } from './components/FloatingApkDownloadButton';
import { AlertTriangle, ArrowLeft, Grid, Home, MessageCircle, X } from 'lucide-react';
import { menuModules } from './data/navigationMenu';
import { playNotificationChime } from './utils/soundHelper';

import { getThemeClasses, isColorLight } from './utils/themeHelper';
import { registerMessagingServiceWorker, listenToForegroundMessages } from './utils/firebaseMessaging';
import { initOneSignalWebSDK } from './utils/pushNotificationService';
import { pullAllFromCloud } from './utils/firebaseSync';

import { DashboardView } from './components/DashboardView';
import { JemaatView } from './components/views/JemaatView';
import { WilayahView } from './components/views/WilayahView';
import { AdministrasiView } from './components/views/AdministrasiView';
import { KeuanganView } from './components/views/KeuanganView';
import { AgendaView } from './components/views/AgendaView';
import { MediaView } from './components/views/MediaView';
import { GaleriView } from './components/views/GaleriView';
import { LaporanView } from './components/views/LaporanView';
import { JemaatPortalView } from './components/views/JemaatPortalView';
import { ChatView } from './components/views/ChatView';
import { PustakaRohaniView } from './components/views/PustakaRohaniView';
import { SystemSettingsView } from './components/views/SystemSettingsView';
import { LainnyaView } from './components/views/LainnyaView';
import { SplashScreen } from './components/SplashScreen';
import { SuperAdminSaaSPanel } from './components/SuperAdminSaaSPanel';
import { TenantLockedScreen } from './components/TenantLockedScreen';
import { NavbarCustomizerModal } from './components/NavbarCustomizerModal';
import { AndroidStudioConverterModal } from './components/AndroidStudioConverterModal';
import { FloatingNotificationBanner } from './components/FloatingNotificationBanner';
import { ConfirmModal } from './components/ConfirmModal';
import { SecurityAlertBannerModal } from './components/SecurityAlertBannerModal';

// Default Guest user for public browsing when not logged in
const GUEST_USER: User = {
  user_id: 'guest',
  username: 'pengunjung',
  nama: 'Jemaat / Pengunjung',
  role: 'JEMAAT',
  email: 'jemaat@gkfc-cms.org',
  status: 'Aktif'
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginPageOpen, setIsLoginPageOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(StorageManager.getSettings());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaaSPanelOpen, setIsSaaSPanelOpen] = useState(false);
  const [isNavbarCustomizerOpen, setIsNavbarCustomizerOpen] = useState(false);
  const [isAndroidStudioModalOpen, setIsAndroidStudioModalOpen] = useState(false);
  const [tenantStatus, setTenantStatus] = useState(() => StorageManager.checkTenantStatus());

  const effectiveUser = currentUser || GUEST_USER;
  const isEffectiveAdmin = effectiveUser.role === 'ADMIN' || effectiveUser.role === 'SUPER_ADMIN';

  useEffect(() => {
    // Check local storage logged-in user session
    const savedUser = StorageManager.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoginPageOpen(false);
      // Restore tab from sessionStorage or default to 'dashboard'
      const savedTab = (sessionStorage.getItem('cms_active_tab') as NavTab) || 'dashboard';
      setActiveTab(savedTab);
    }

    // Pull from cloud immediately on app startup so visitor / guest / login screen has real admin data
    pullAllFromCloud(() => {
      const freshSettings = StorageManager.getSettings();
      setSettings(freshSettings);
      setTenantStatus(StorageManager.checkTenantStatus());
    }).catch(() => {});

    // Register Service Worker for PWA & Offline Support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration note:', err);
        });

      // Also register Firebase Messaging SW if supported
      registerMessagingServiceWorker().catch(() => {});
    }

    const unsubscribeFCM = listenToForegroundMessages((payload) => {
      console.log('FCM Foreground message received:', payload);
    });

    return () => {
      unsubscribeFCM();
    };
  }, []);

  useEffect(() => {
    // Sync custom theme hex color & dark mode to CSS variables globally
    const customHex = (settings?.warna_tema || '#0d9488').trim();
    if (/^#[0-9A-F]{6}$/i.test(customHex) || /^#[0-9A-F]{3}$/i.test(customHex)) {
      document.documentElement.style.setProperty('--theme-custom-primary', customHex);
      document.documentElement.style.setProperty('--theme-custom-border', `${customHex}90`);
      document.documentElement.style.setProperty('--theme-custom-bg-alpha', `${customHex}18`);
    }

    const isDark =
      settings?.theme_preset === 'DARK_SLATE' ||
      settings?.theme_preset === 'MIDNIGHT_BLUE' ||
      settings?.theme_preset === 'DEEP_PURPLE' ||
      settings?.theme_preset === 'FOREST_GREEN' ||
      settings?.theme_preset === 'WARM_GOLD';

    if (isDark) {
      document.documentElement.classList.add('theme-dark');
      let darkBg = '#020617';
      if (settings?.theme_preset === 'MIDNIGHT_BLUE') darkBg = '#030712';
      else if (settings?.theme_preset === 'DEEP_PURPLE') darkBg = '#090514';
      else if (settings?.theme_preset === 'FOREST_GREEN') darkBg = '#04120a';
      else if (settings?.theme_preset === 'WARM_GOLD') darkBg = '#140c03';
      else if (settings?.theme_preset === 'DARK_SLATE') darkBg = '#020617';
      document.body.style.backgroundColor = darkBg;
      document.documentElement.style.backgroundColor = darkBg;
    } else {
      document.documentElement.classList.remove('theme-dark');
      document.body.style.backgroundColor = '#f4fbf9';
      document.documentElement.style.backgroundColor = '#f4fbf9';
    }
  }, [settings?.warna_tema, settings?.theme_preset]);

  useEffect(() => {
    // Inisialisasi OneSignal Push Notification jika disetel & aktif
    if (settings && settings.onesignal_enabled !== false && settings.onesignal_app_id) {
      try {
        initOneSignalWebSDK(settings.onesignal_app_id);
      } catch (err) {
        console.warn('OneSignal init error:', err);
      }
    }
  }, [settings?.onesignal_app_id, settings?.onesignal_enabled]);

  // Current Active Tenant Scope
  const [activeTenantId, setActiveTenantId] = useState<string>(() => StorageManager.getActiveTenantId());

  // Detect URL tenant/church query parameter (e.g. ?tenant=CHURCH-002 or ?church=GBI-01)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tParam = params.get('tenant') || params.get('church');
        if (tParam) {
          const clean = tParam.trim();
          const allTenants = StorageManager.getTenants();
          const matched = allTenants.find(
            (t) =>
              t.tenant_id.toLowerCase() === clean.toLowerCase() ||
              t.kode_unik?.toLowerCase() === clean.toLowerCase() ||
              t.nama_gereja?.toLowerCase() === clean.toLowerCase()
          );
          if (matched) {
            StorageManager.setActiveTenantId(matched.tenant_id);
            setActiveTenantId(matched.tenant_id);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Listen for setting changes across components & tabs
    const handleSettingsSync = (e?: any) => {
      const currentTenantId = StorageManager.getActiveTenantId();
      setActiveTenantId((prev) => (prev !== currentTenantId ? currentTenantId : prev));
      const freshSettings = (e?.detail?.settings && typeof e.detail.settings === 'object') ? e.detail.settings : StorageManager.getSettings();
      setSettings((prev) => (JSON.stringify(prev) !== JSON.stringify(freshSettings) ? freshSettings : prev));
      const freshTenant = StorageManager.checkTenantStatus();
      setTenantStatus((prev) => (prev.isLocked === freshTenant.isLocked && prev.tenant?.tenant_id === freshTenant.tenant?.tenant_id ? prev : freshTenant));
      const savedUser = StorageManager.getCurrentUser();
      setCurrentUser((prev) => {
        if (!savedUser) return null;
        if (!prev) return savedUser;
        return JSON.stringify(prev) !== JSON.stringify(savedUser) ? savedUser : prev;
      });
    };

    const unsubscribe = StorageManager.subscribe(handleSettingsSync);
    window.addEventListener('cms_data_changed', handleSettingsSync);
    window.addEventListener('storage', handleSettingsSync);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', handleSettingsSync);
      window.removeEventListener('storage', handleSettingsSync);
    };
  }, []);

  // Floating Live Chat Notification State (Ditampilkan saat pengguna sedang TIDAK di ruang chat)
  const [incomingChatNotif, setIncomingChatNotif] = useState<ChatMessage | null>(null);
  const [lastDismissedChatId, setLastDismissedChatId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('cms_last_seen_chat_id') || '';
    } catch (e) {
      return '';
    }
  });
  const prevChatCountRef = useRef<number>(-1);

  // Jika pengguna sedang berada di ruang chat, sembunyikan notifikasi mengambang & tandai semua pesan saat ini sebagai sudah dibaca
  useEffect(() => {
    if (activeTab === 'chat') {
      const allMsgs = StorageManager.getChatMessages();
      if (allMsgs.length > 0) {
        const latest = allMsgs[allMsgs.length - 1];
        if (latest && latest.id) {
          try {
            sessionStorage.setItem('cms_last_seen_chat_id', latest.id);
          } catch (e) {
            // ignore
          }
          setLastDismissedChatId(latest.id);
        }
      }
      setIncomingChatNotif(null);
    }
  }, [activeTab]);

  // Pantau pesan chat masuk secara berkala dan realtime ketika pengguna TIDAK berada di ruang chat
  useEffect(() => {
    if (activeTab === 'chat') {
      setIncomingChatNotif(null);
      return;
    }

    const checkIncomingChat = () => {
      if (activeTab === 'chat') {
        setIncomingChatNotif(null);
        return;
      }

      const allMsgs = StorageManager.getChatMessages();
      if (allMsgs.length === 0) return;

      const latest = allMsgs[allMsgs.length - 1];
      if (!latest || !latest.id) return;

      const myName = (effectiveUser.nama || effectiveUser.username || '').toLowerCase().trim();
      const senderName = (latest.sender_name || '').toLowerCase().trim();
      const isFromMe =
        (effectiveUser.user_id && latest.sender_id === effectiveUser.user_id) ||
        (senderName && myName && senderName === myName);

      // Keamanan & Privasi: Jika pesan bersifat pribadi, hanya penerima yang berhak menerima notifikasi!
      if (latest.is_private) {
        const myActiveId =
          effectiveUser.user_id && effectiveUser.user_id !== 'guest'
            ? effectiveUser.user_id
            : StorageManager.getOrCreateDeviceId();

        const isForMe = latest.recipient_id === myActiveId;
        if (!isForMe) {
          return;
        }
      }

      // Multi-Tenant Isolation: Never show chat notifications from other churches
      if (latest.tenant_id && latest.tenant_id !== activeTenantId) {
        return;
      }
      const isMonapa = activeTenantId === 'CHURCH-004' || (settings?.nama_gereja && settings.nama_gereja.toLowerCase().includes('monapa'));
      if (isMonapa) {
        const sLower = (latest.sender_name || '').toLowerCase();
        if (sLower.includes('gbi rock') || sLower.includes('juanda') || sLower.includes('ingelin')) {
          return;
        }
      }

      let seenId = '';
      try {
        seenId = sessionStorage.getItem('cms_last_seen_chat_id') || lastDismissedChatId;
      } catch (e) {
        seenId = lastDismissedChatId;
      }

      if (!isFromMe && latest.id !== seenId) {
        setIncomingChatNotif((prev) => (prev?.id === latest.id ? prev : latest));
        if (prevChatCountRef.current !== -1 && allMsgs.length > prevChatCountRef.current) {
          try {
            playNotificationChime();
          } catch (e) {
            // ignore
          }
        }
      }

      prevChatCountRef.current = allMsgs.length;
    };

    checkIncomingChat();

    window.addEventListener('cms_data_changed', checkIncomingChat);
    window.addEventListener('storage', checkIncomingChat);

    const interval = setInterval(checkIncomingChat, 2500);

    return () => {
      window.removeEventListener('cms_data_changed', checkIncomingChat);
      window.removeEventListener('storage', checkIncomingChat);
      clearInterval(interval);
    };
  }, [activeTab, effectiveUser.user_id, effectiveUser.nama, effectiveUser.username, lastDismissedChatId]);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('cms_active_tab', tab);
    } catch (e) {
      // ignore
    }
  };

  // Global listener for tab navigation events triggered by notifications or quick links
  useEffect(() => {
    const handleNavigateTab = (e: Event) => {
      const ce = e as CustomEvent<{ tab: NavTab }>;
      if (ce.detail && ce.detail.tab) {
        handleSelectTab(ce.detail.tab);
      }
    };
    const handleOpenAndroidStudio = () => {
      setIsAndroidStudioModalOpen(true);
    };

    window.addEventListener('navigate_to_tab', handleNavigateTab);
    window.addEventListener('open_android_studio_modal', handleOpenAndroidStudio);
    return () => {
      window.removeEventListener('navigate_to_tab', handleNavigateTab);
      window.removeEventListener('open_android_studio_modal', handleOpenAndroidStudio);
    };
  }, []);

  // Handle Android Back Button / Navigation when logged in
  useEffect(() => {
    if (!currentUser || isLoginPageOpen) return;

    const handlePopState = () => {
      setActiveTab((prev) => (prev !== 'dashboard' ? 'dashboard' : prev));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser, isLoginPageOpen]);

  const handleDownloadAPK = () => {
    const activeTenantId = StorageManager.getActiveTenantId();
    const raw = settings?.apk_download_url?.trim();
    let downloadUrl = (raw && raw !== 'https://drive.google.com/file/d/1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s/view?usp=sharing') ? raw : '';
    if (!downloadUrl && activeTenantId === 'CHURCH-001') {
      downloadUrl = APK_DOWNLOAD_URL;
    }
    if (!downloadUrl) {
      if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
        setActiveTab('settings');
      }
      return;
    }
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLoginSuccess = (user: User, passedSettings?: AppSettings) => {
    const rawTenant = (user.tenant_id && user.tenant_id !== 'ALL') ? user.tenant_id : 'CHURCH-001';
    const targetTenant = rawTenant === 'CHURCH-004' ? 'CHURCH-001' : rawTenant;
    user.tenant_id = targetTenant;

    StorageManager.setActiveTenantId(targetTenant);
    setActiveTenantId(targetTenant);

    // Refresh settings and tenant status in state IMMEDIATELY with the real cloud-synced settings!
    const freshSettings = passedSettings || StorageManager.getSettings();
    setSettings(freshSettings);
    setTenantStatus(StorageManager.checkTenantStatus());

    // Sync custom theme hex color & dark mode to CSS variables immediately
    const customHex = (freshSettings?.warna_tema || '#0d9488').trim();
    if (/^#[0-9A-F]{6}$/i.test(customHex) || /^#[0-9A-F]{3}$/i.test(customHex)) {
      document.documentElement.style.setProperty('--theme-custom-primary', customHex);
      document.documentElement.style.setProperty('--theme-custom-border', `${customHex}90`);
      document.documentElement.style.setProperty('--theme-custom-bg-alpha', `${customHex}18`);
    }

    const isDark =
      freshSettings?.theme_preset === 'DARK_SLATE' ||
      freshSettings?.theme_preset === 'MIDNIGHT_BLUE' ||
      freshSettings?.theme_preset === 'DEEP_PURPLE' ||
      freshSettings?.theme_preset === 'FOREST_GREEN' ||
      freshSettings?.theme_preset === 'WARM_GOLD';

    if (isDark) {
      document.documentElement.classList.add('theme-dark');
      let darkBg = '#020617';
      if (freshSettings?.theme_preset === 'MIDNIGHT_BLUE') darkBg = '#030712';
      else if (freshSettings?.theme_preset === 'DEEP_PURPLE') darkBg = '#090514';
      else if (freshSettings?.theme_preset === 'FOREST_GREEN') darkBg = '#04120a';
      else if (freshSettings?.theme_preset === 'WARM_GOLD') darkBg = '#140c03';
      else if (freshSettings?.theme_preset === 'DARK_SLATE') darkBg = '#020617';
      document.body.style.backgroundColor = darkBg;
      document.documentElement.style.backgroundColor = darkBg;
    } else {
      document.documentElement.classList.remove('theme-dark');
      document.body.style.backgroundColor = '#f4fbf9';
      document.documentElement.style.backgroundColor = '#f4fbf9';
    }

    if (freshSettings?.nama_gereja && typeof document !== 'undefined') {
      document.title = `${freshSettings.nama_gereja} - Portal & Sistem Manajemen Gereja`;
    }

    setCurrentUser(user);
    setIsLoginPageOpen(false);

    // Direct user to the primary Dashboard
    setActiveTab('dashboard');
    try {
      sessionStorage.setItem('cms_active_tab', 'dashboard');
    } catch (e) {}

    // Dispatch sync events so all child components update immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cms_data_changed', {
          detail: { action: 'user_login', user, tenantId: targetTenant, settings: freshSettings }
        })
      );
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleCloseLoginPage = () => {
    setIsLoginPageOpen(false);
    const currentTenantId = StorageManager.getActiveTenantId();
    setActiveTenantId(currentTenantId);
    setSettings(StorageManager.getSettings());
    setTenantStatus(StorageManager.checkTenantStatus());
    // Set active tab back to main church dashboard (Mode Publik)
    setActiveTab('dashboard');
    try {
      sessionStorage.setItem('cms_active_tab', 'dashboard');
    } catch (e) {}
  };

  // Logout confirmation modal state
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    if (currentUser) {
      const historyId = (window as any).__cms_history_id;
      if (historyId) {
        StorageManager.recordLogout(historyId);
      }
      StorageManager.logActivity(currentUser.username, 'Logout dari sistem CMS Pro', 'Auth');
    }
    StorageManager.clearCurrentUser();
    StorageManager.setActiveTenantId('CHURCH-001');
    setActiveTenantId('CHURCH-001');
    setCurrentUser(null);
    setSettings(StorageManager.getSettings());
    setTenantStatus(StorageManager.checkTenantStatus());
    setIsLogoutConfirmOpen(false);
    setActiveTab('dashboard');
    try {
      sessionStorage.setItem('cms_active_tab', 'dashboard');
    } catch (e) {}

    // Cleanly replace history state
    try {
      window.history.replaceState({ page: 'cms' }, '', window.location.href);
    } catch (e) {}

    setIsLoginPageOpen(false);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageManager.saveSettings(newSettings);
  };

  // Show initial splash screen with loading animation
  if (showSplash) {
    return <SplashScreen settings={settings} onFinish={() => setShowSplash(false)} />;
  }

  // If login view is explicitly open
  if (isLoginPageOpen) {
    return (
      <LoginPage
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
        onClose={handleCloseLoginPage}
        onInstallPWA={handleDownloadAPK}
        canInstallPWA={true}
      />
    );
  }

  // Check if tenant is locked (NONAKTIF / KADALUARSA / DIBLOKIR)
  // SuperAdmin always bypasses lock screen for full management access
  if (tenantStatus.isLocked && effectiveUser.role !== 'SUPER_ADMIN' && !isLoginPageOpen) {
    return (
      <TenantLockedScreen
        tenant={tenantStatus.tenant}
        reason={tenantStatus.reason}
        message={tenantStatus.message}
        onOpenLogin={() => setIsLoginPageOpen(true)}
      />
    );
  }

  const theme = getThemeClasses(settings);

  return (
    <div id="app-container" className={`min-h-screen ${theme.rootBg} flex flex-col selection:bg-teal-500/30 selection:text-teal-900 relative transition-colors duration-200`}>
      {/* 1. Top Window Bar (Teks Berjalan / Marquee Berkesinambungan) */}
      {settings.show_topbar !== false && (() => {
        const topbarTextContent = settings.topbar_text && settings.topbar_text.trim()
          ? settings.topbar_text.trim()
          : `${settings.nama_gereja || 'Monapa Puriala'} — ${settings.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`;

        return (
          <div className="h-7 sm:h-8 bg-teal-950 text-white/90 text-xs px-3 sm:px-4 flex items-center overflow-hidden font-medium select-none shrink-0 z-40 border-b border-teal-900/60 shadow-xs">
            <div className="flex items-center gap-2 shrink-0 pr-2.5 sm:pr-3 z-10 bg-teal-950">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] text-teal-300 shrink-0">
                CMS GEREJA
              </span>
              <span className="text-teal-700/80 select-none hidden xs:inline">|</span>
            </div>

            <div className="flex-1 overflow-hidden relative flex items-center min-w-0">
              {settings.topbar_marquee_enabled !== false ? (
                <div
                  className={`flex w-max shrink-0 cursor-default select-none ${
                    settings.topbar_speed === 'slow'
                      ? 'animate-marquee-slow'
                      : settings.topbar_speed === 'fast'
                      ? 'animate-marquee-fast'
                      : 'animate-marquee-normal'
                  }`}
                  title="Sentuh atau arahkan kursor untuk menjeda teks berjalan"
                >
                  {/* Segment 1 */}
                  <div className="flex items-center shrink-0">
                    <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                      {topbarTextContent}
                    </span>
                    <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                    <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                      {topbarTextContent}
                    </span>
                    <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                  </div>

                  {/* Segment 2 (Clone untuk loop berkesinambungan tanpa jeda kosong) */}
                  <div className="flex items-center shrink-0" aria-hidden="true">
                    <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                      {topbarTextContent}
                    </span>
                    <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                    <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                      {topbarTextContent}
                    </span>
                    <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                  </div>
                </div>
              ) : (
                <span className="font-semibold tracking-wide truncate text-[11px] sm:text-xs text-white/95">
                  {topbarTextContent}
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* 2. Main Top Header (NavbarHeader) */}
      <NavbarHeader
        currentUser={effectiveUser}
        isGuest={!currentUser}
        onOpenLogin={() => setIsLoginPageOpen(true)}
        settings={settings}
        onLogout={requestLogout}
        onUpdateCurrentUser={(updatedUser) => setCurrentUser(updatedUser)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onInstallPWA={handleDownloadAPK}
        canInstallPWA={true}
        onOpenSuperAdminSaaSPanel={() => setIsSaaSPanelOpen(true)}
        activeTab={activeTab}
        onNavigateToDashboard={() => handleSelectTab('dashboard')}
        onUpdateSettings={handleUpdateSettings}
        onNavigateToSettings={() => handleSelectTab('settings')}
        onOpenNavbarCustomizer={isEffectiveAdmin ? () => setIsNavbarCustomizerOpen(true) : undefined}
        onOpenAndroidStudioModal={isEffectiveAdmin ? () => setIsAndroidStudioModalOpen(true) : undefined}
      />

      {/* 3. Main Body: Left Sidebar + Content */}
      <div className="flex flex-1 w-full min-h-[calc(100vh-6.5rem)]">
        {/* Left Persistent Sidebar (docked on desktop, drawer on mobile) */}
        <Sidebar
          currentUser={effectiveUser}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          settings={settings}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          {/* Top Breadcrumb & Quick Back Bar when in Sub-Modules */}
          {activeTab !== 'dashboard' && (
            <div className={`mb-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3 animate-fade-in transition-colors ${
              theme.isLight
                ? 'bg-white border-slate-200/90 text-slate-800 shadow-xs'
                : 'bg-slate-900 border-slate-800 text-white shadow-md'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => handleSelectTab('dashboard')}
                  style={{
                    backgroundColor: settings.warna_tema || '#0d9488',
                    color: isColorLight(settings.warna_tema || '#0d9488') ? '#0f172a' : '#ffffff'
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <ArrowLeft
                    className="w-4 h-4"
                    style={{ color: isColorLight(settings.warna_tema || '#0d9488') ? '#0f172a' : '#ffffff' }}
                  />
                  <span>Kembali ke Dashboard Utama</span>
                </button>

                <span className={`${theme.isLight ? 'text-slate-400' : 'text-slate-500'} font-bold hidden sm:inline`}>/</span>

                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-bold uppercase tracking-wider truncate ${theme.isLight ? 'text-teal-800' : 'text-teal-300'}`}>
                    Modul: {menuModules.find((m) => m.id === activeTab)?.title || activeTab}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer lg:hidden ${
                  theme.isLight
                    ? 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
                    : 'bg-slate-800 border-slate-700 text-teal-300 hover:bg-slate-700'
                }`}
              >
                <Grid className="w-4 h-4 text-teal-600" />
                <span>Menu</span>
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              key={`${activeTenantId}_${effectiveUser.user_id || 'guest'}_${settings.nama_gereja || ''}_${settings.warna_tema || ''}_dashboard`}
              currentUser={effectiveUser}
              settings={settings}
              onNavigate={handleSelectTab}
              onUpdateSettings={handleUpdateSettings}
              onLogout={requestLogout}
              onOpenLogin={() => setIsLoginPageOpen(true)}
            />
          )}

          {activeTab === 'jemaat' && <JemaatView key={`${activeTenantId}_jemaat`} currentUser={effectiveUser} />}

          {activeTab === 'wilayah' && <WilayahView key={`${activeTenantId}_wilayah`} currentUser={effectiveUser} />}

          {activeTab === 'administrasi' && <AdministrasiView key={`${activeTenantId}_administrasi`} currentUser={effectiveUser} />}

          {activeTab === 'keuangan' && <KeuanganView key={`${activeTenantId}_keuangan`} currentUser={effectiveUser} />}

          {activeTab === 'jadwal' && (
            <AgendaView key={`${activeTenantId}_jadwal`} currentUser={effectiveUser} mode="JADWAL" />
          )}

          {activeTab === 'agenda' && (
            <AgendaView key={`${activeTenantId}_agenda`} currentUser={effectiveUser} mode="AGENDA" />
          )}

          {activeTab === 'doa' && (
            <AgendaView key={`${activeTenantId}_doa`} currentUser={effectiveUser} mode="DOA" />
          )}

          {activeTab === 'pengumuman' && (
            <MediaView key={`${activeTenantId}_pengumuman`} currentUser={effectiveUser} mode="PENGUMUMAN" />
          )}

          {activeTab === 'renungan' && (
            <MediaView key={`${activeTenantId}_renungan`} currentUser={effectiveUser} mode="RENUNGAN" />
          )}

          {activeTab === 'galeri' && (
            <GaleriView key={`${activeTenantId}_galeri`} currentUser={effectiveUser} initialTab="GALLERY" />
          )}

          {activeTab === 'media' && (
            <GaleriView key={`${activeTenantId}_media`} currentUser={effectiveUser} initialTab="SOCIAL_VIDEOS" />
          )}

          {activeTab === 'laporan' && <LaporanView key={`${activeTenantId}_laporan`} currentUser={effectiveUser} />}

          {activeTab === 'jemaat_portal' && <JemaatPortalView key={`${activeTenantId}_portal`} currentUser={effectiveUser} settings={settings} />}

          {activeTab === 'chat' && (
            <ChatView
              key={`${activeTenantId}_${effectiveUser.user_id || 'guest'}_chat`}
              currentUser={effectiveUser}
              settings={settings}
              onOpenLogin={() => setIsLoginPageOpen(true)}
            />
          )}

          {activeTab === 'pustaka' && (
            <PustakaRohaniView
              key={`${activeTenantId}_pustaka`}
              currentUser={effectiveUser}
              settings={settings}
              onNavigateToChat={() => handleSelectTab('chat')}
            />
          )}

          {activeTab === 'settings' && (
            isEffectiveAdmin ? (
              <SystemSettingsView
                key={`${activeTenantId}_settings`}
                currentUser={effectiveUser}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            ) : (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-300">
                <p className="font-bold text-lg mb-2 text-rose-400">Akses Khusus Administrator</p>
                <p className="text-sm text-slate-400">Menu Pengaturan Sistem dan Kustomisasi Warna Tema Navbar hanya dapat diakses oleh Admin & SuperAdmin.</p>
              </div>
            )
          )}

          {activeTab === 'lainnya' && (
            <LainnyaView
              key={`${activeTenantId}_lainnya`}
              currentUser={effectiveUser}
              onNavigate={handleSelectTab}
              settings={settings}
            />
          )}
        </main>
      </div>

      {/* NOTIFIKASI KARTU KECIL MENGAMBANG LIVE CHAT - SELALU MUNCUL SAAT TIDAK BERADA DI RUANG CHAT */}
      {activeTab !== 'chat' && incomingChatNotif && (
        <div
          role="alert"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9990] max-w-sm w-[calc(100vw-2rem)] sm:w-84 p-4 rounded-3xl bg-white/98 border-2 border-teal-300 shadow-xl backdrop-blur-xl text-slate-800 transition-all ring-4 ring-teal-50 animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-inner">
                <MessageCircle className="w-5 h-5 text-teal-600" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-teal-500 rounded-full border-2 border-white animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-teal-900 truncate">
                  {incomingChatNotif.sender_name}
                </span>
                <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-full font-bold shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                  Chat Masuk
                </span>
              </div>

              <p className="text-xs text-slate-700 line-clamp-2 mt-1 font-normal leading-relaxed">
                {incomingChatNotif.message}
              </p>

              <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (incomingChatNotif && incomingChatNotif.id) {
                      try {
                        sessionStorage.setItem('cms_last_seen_chat_id', incomingChatNotif.id);
                      } catch (e) {
                        // ignore
                      }
                      setLastDismissedChatId(incomingChatNotif.id);
                    }
                    setIncomingChatNotif(null);
                    handleSelectTab('chat');
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/30 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Buka Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (incomingChatNotif && incomingChatNotif.id) {
                      try {
                        sessionStorage.setItem('cms_last_seen_chat_id', incomingChatNotif.id);
                      } catch (e) {
                        // ignore
                      }
                      setLastDismissedChatId(incomingChatNotif.id);
                    }
                    setIncomingChatNotif(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (incomingChatNotif && incomingChatNotif.id) {
                  try {
                    sessionStorage.setItem('cms_last_seen_chat_id', incomingChatNotif.id);
                  } catch (e) {
                    // ignore
                  }
                  setLastDismissedChatId(incomingChatNotif.id);
                }
                setIncomingChatNotif(null);
              }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Interactive Notification Banner for Content Updates & Announcements */}
      <FloatingNotificationBanner
        currentUser={effectiveUser}
        settings={settings}
        onNavigate={handleSelectTab}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentUser={effectiveUser}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        settings={settings}
      />

      {/* SuperAdmin SaaS Multi-Church Master Control Panel */}
      <SuperAdminSaaSPanel
        isOpen={isSaaSPanelOpen}
        onClose={() => setIsSaaSPanelOpen(false)}
        onSelectTenant={(tenantId) => {
          setActiveTenantId(tenantId);
          setSettings(StorageManager.getSettings());
          setTenantStatus(StorageManager.checkTenantStatus());
        }}
      />

      {/* KARTU PERINGATAN KONFIRMASI KELUAR APLIKASI */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#090d16]/90 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-white space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-white">Konfirmasi Keluar Aplikasi</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Apakah Anda yakin ingin keluar dari aplikasi? Anda akan keluar dari sesi ini.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all border border-slate-700 cursor-pointer"
              >
                Tidak
              </button>
              <button
                onClick={confirmLogout}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kustomisasi Warna & Tema Navbar Global (Hanya untuk Admin & SuperAdmin) */}
      {isEffectiveAdmin && (
        <NavbarCustomizerModal
          isOpen={isNavbarCustomizerOpen}
          onClose={() => setIsNavbarCustomizerOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onNavigateToSettings={() => handleSelectTab('settings')}
        />
      )}

      {/* Modal Generator Android Studio & Firebase (FCM) & Download google-services.json */}
      <AndroidStudioConverterModal
        isOpen={isAndroidStudioModalOpen}
        onClose={() => setIsAndroidStudioModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Global Custom Confirmation Dialog (Replaces native window.confirm) */}
      <ConfirmModal />

      {/* Global Security Warning Alarm & Red Card Overlay */}
      <SecurityAlertBannerModal currentUser={currentUser} />
    </div>
  );
}
