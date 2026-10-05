import React, { useState, useEffect, useRef } from 'react';
import { User, AppSettings, NotificationItem } from '../types';
import { StorageManager } from '../utils/storage';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';
import { getThemeClasses } from '../utils/themeHelper';
import { alertDialog } from '../utils/confirmDialog';
import {
  triggerStatusBarNotification,
  requestAndSaveFCMToken,
  playNotificationChimeSound
} from '../utils/firebaseMessaging';
import {
  Bell,
  Clock,
  Calendar,
  Smartphone,
  LogOut,
  ChevronDown,
  CheckCheck,
  Menu,
  KeyRound,
  UserCheck,
  Eye,
  EyeOff,
  Wand2,
  AlertCircle,
  Check,
  Volume2,
  LogIn,
  Building2,
  ShieldCheck,
  Grid,
  ArrowLeft,
  Home,
  Download,
  Palette,
  Search
} from 'lucide-react';
import { NavbarCustomizerModal } from './NavbarCustomizerModal';

interface NavbarHeaderProps {
  currentUser: User;
  settings: AppSettings;
  onLogout: () => void;
  onOpenLogin?: () => void;
  isGuest?: boolean;
  onUpdateCurrentUser?: (updatedUser: User) => void;
  onOpenMobileMenu?: () => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
  onOpenSuperAdminSaaSPanel?: () => void;
  activeTab?: string;
  onNavigateToDashboard?: () => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  onNavigateToSettings?: () => void;
  onOpenNavbarCustomizer?: () => void;
  onOpenAndroidStudioModal?: () => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  currentUser,
  settings,
  onLogout,
  onOpenLogin,
  isGuest,
  onUpdateCurrentUser,
  onOpenMobileMenu,
  onInstallPWA,
  canInstallPWA,
  onOpenSuperAdminSaaSPanel,
  activeTab,
  onNavigateToDashboard,
  onUpdateSettings,
  onNavigateToSettings,
  onOpenNavbarCustomizer,
  onOpenAndroidStudioModal
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [timeHourMinute, setTimeHourMinute] = useState('');
  const [timeSeconds, setTimeSeconds] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isNavbarCustomizerOpen, setIsNavbarCustomizerOpen] = useState(false);

  // Admin access check - color settings are strictly restricted to Admin & SuperAdmin
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Self Profile Modal State
  const [isSelfModalOpen, setIsSelfModalOpen] = useState(false);
  const [showSelfPass, setShowSelfPass] = useState(false);
  const [selfForm, setSelfForm] = useState({
    username: currentUser.username,
    nama: currentUser.nama,
    email: currentUser.email || '',
    no_hp: currentUser.no_hp || '',
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [selfError, setSelfError] = useState('');
  const [selfSuccess, setSelfSuccess] = useState('');

  useEffect(() => {
    const fresh = {
      username: currentUser.username,
      nama: currentUser.nama,
      email: currentUser.email || '',
      no_hp: currentUser.no_hp || '',
      old_password: '',
      new_password: '',
      confirm_password: ''
    };
    setSelfForm((prev) =>
      prev.username === fresh.username &&
      prev.nama === fresh.nama &&
      prev.email === fresh.email &&
      prev.no_hp === fresh.no_hp
        ? prev
        : fresh
    );
  }, [currentUser.username, currentUser.nama, currentUser.email, currentUser.no_hp]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // WITA (Waktu Indonesia Tengah - UTC+8) for Sulawesi Tenggara (Monapa Puriala)
      const timeFormatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = timeFormatter.formatToParts(now);
      const hours = parts.find((p) => p.type === 'hour')?.value || '00';
      const minutes = parts.find((p) => p.type === 'minute')?.value || '00';
      const seconds = parts.find((p) => p.type === 'second')?.value || '00';

      const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      setTimeHourMinute(`${hours}:${minutes}`);
      setTimeSeconds(`${seconds} WITA`);
      setTimeStr(`${hours}:${minutes}:${seconds} WITA`);
      setDateStr(dateFormatter.format(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const prevNotifsRef = useRef<NotificationItem[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      if (prevNotifsRef.current.length > 0) {
        const prevIds = new Set(prevNotifsRef.current.map((n) => n.notif_id));
        const newlyAdded = notifications.filter((n) => !prevIds.has(n.notif_id));
        if (newlyAdded.length > 0) {
          const newest = newlyAdded[0];
          triggerStatusBarNotification(`🔔 ${newest.judul}`, newest.pesan);
        }
      }
      prevNotifsRef.current = notifications;
    }
  }, [notifications]);

  useEffect(() => {
    const syncNotifs = () => {
      const fresh = StorageManager.getNotifications();
      setNotifications((prev) =>
        prev.length !== fresh.length || JSON.stringify(prev) !== JSON.stringify(fresh) ? fresh : prev
      );
    };
    syncNotifs();

    const unsubscribe = StorageManager.subscribe(syncNotifs);
    window.addEventListener('cms_data_changed', syncNotifs);
    window.addEventListener('storage', syncNotifs);
    window.addEventListener('focus', syncNotifs);

    const intervalId = setInterval(syncNotifs, 3000);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', syncNotifs);
      window.removeEventListener('storage', syncNotifs);
      window.removeEventListener('focus', syncNotifs);
      clearInterval(intervalId);
    };
  }, []);

  const relevantNotifications = notifications.filter((n) => {
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') return true;
    
    // Check if notification is specifically for this user
    const isTargetUser =
      n.user_id === currentUser.username ||
      n.user_id === currentUser.user_id ||
      n.user_id === currentUser.jemaat_id ||
      (n.user_id && currentUser.nama && n.user_id.toLowerCase().trim() === currentUser.nama.toLowerCase().trim());
    
    if (isTargetUser) return true;

    // Check broadcast notifications
    const isBroadcast =
      (n.user_id === 'ALL' || n.user_id === 'JEMAAT' || !n.user_id) &&
      (n.tujuan_role === 'ALL' || n.tujuan_role === 'JEMAAT' || !n.tujuan_role);

    return isBroadcast;
  });

  const unreadCount = relevantNotifications.filter((n) => n.status_baca === 'Belum').length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, status_baca: 'Sudah' as const }));
    setNotifications(updated);
    StorageManager.saveNotifications(updated);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700 font-extrabold';
      case 'ADMIN':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-400 dark:border-blue-600 font-black';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold';
    }
  };

  const handleSaveSelfProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSelfError('');
    setSelfSuccess('');

    const trimmedUsername = selfForm.username.trim().toLowerCase();
    if (!trimmedUsername) {
      setSelfError('Username tidak boleh kosong');
      return;
    }

    const allUsers = StorageManager.getUsers();
    // Check if new username is already taken by another user
    const existing = allUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername && u.user_id !== currentUser.user_id
    );
    if (existing) {
      setSelfError(`Username "${trimmedUsername}" sudah digunakan oleh pengguna lain.`);
      return;
    }

    let finalPasswordHash = currentUser.password_hash || (currentUser.role === 'JEMAAT' ? 'jemaat123' : 'admin123');

    // If changing password
    if (selfForm.new_password) {
      if (selfForm.new_password.length < 4) {
        setSelfError('Password baru minimal 4 karakter');
        return;
      }
      if (selfForm.new_password !== selfForm.confirm_password) {
        setSelfError('Konfirmasi password baru tidak cocok');
        return;
      }
      finalPasswordHash = selfForm.new_password;
    }

    const updatedUser: User = {
      ...currentUser,
      username: trimmedUsername,
      nama: selfForm.nama.trim(),
      email: selfForm.email.trim(),
      no_hp: selfForm.no_hp.trim(),
      password_hash: finalPasswordHash
    };

    // Save to allUsers array in localStorage
    const updatedUserList = allUsers.map((u) => (u.user_id === currentUser.user_id ? updatedUser : u));
    StorageManager.saveUsers(updatedUserList);
    StorageManager.saveCurrentUser(updatedUser);

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(updatedUser);
    }

    StorageManager.logActivity(
      updatedUser.username,
      `Mengubah kredensial profil & password mandiri (${updatedUser.user_id})`,
      'SystemSettings'
    );

    setSelfSuccess('Profil & Kredensial Login berhasil diperbarui!');
    setTimeout(() => {
      setIsSelfModalOpen(false);
      setSelfSuccess('');
    }, 1200);
  };

  const theme = getThemeClasses(settings);

  const churchName = settings?.nama_gereja || 'Monapa Puriala';
  const shortCode = churchName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 4)
    .toUpperCase() || 'GMP';

  return (
    <header
      className={`sticky top-0 z-30 h-16 w-full px-3 sm:px-6 flex items-center justify-between transition-all duration-200 select-none ${theme.navbar.containerClass} ${theme.navbar.borderBottomClass}`}
      style={{
        ...theme.navbar.containerStyle,
        ...theme.navbar.borderBottomStyle
      }}
    >
      {/* Left section: Hamburger for Mobile & School/Church Branding */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className={`lg:hidden p-2 rounded-xl transition-all cursor-pointer shrink-0 ${theme.navbar.iconBtnClass}`}
          style={theme.navbar.iconBtnStyle}
          title="Buka Navigasi"
        >
          <Grid className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden bg-white/10 border border-white/20"
            style={theme.navbar.menuBtnStyle}
          >
            <img
              src={settings?.logo || DEFAULT_CHURCH_LOGO}
              alt={settings?.nama_gereja || 'Logo Gereja'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
              }}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-2 min-w-0">
              <h1
                className={`text-xs sm:text-base font-black tracking-tight truncate leading-snug ${theme.navbar.titleClass}`}
                style={theme.navbar.titleStyle}
              >
                {settings?.nama_gereja || 'Monapa Puriala'}
              </h1>
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border whitespace-nowrap ${theme.navbar.pillClass}`}>
                {isAdmin ? 'Panel Admin' : 'Portal Jemaat'}
              </span>
            </div>
            <p
              className={`text-[10px] sm:text-[11px] font-medium leading-tight truncate mt-0.5 ${theme.navbar.subtextClass}`}
              style={theme.navbar.subtextStyle}
            >
              Sistem Informasi Manajemen Gereja
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: Real-time Live Clock (Menggantikan Cari Cepat) */}
      <div
        className={`hidden sm:flex items-center gap-2.5 px-3 sm:px-4 py-1.5 rounded-full border shadow-inner backdrop-blur-md transition-all ${
          theme.navbar.isLight
            ? 'bg-slate-900/5 hover:bg-slate-900/10 border-slate-300/80 shadow-xs'
            : 'bg-black/25 hover:bg-black/35 border-white/20'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                theme.navbar.isLight ? 'bg-emerald-600' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                theme.navbar.isLight ? 'bg-emerald-600' : 'bg-emerald-400'
              }`}
            />
          </span>
          <Clock
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
              theme.navbar.isLight ? 'text-emerald-700' : 'text-emerald-300'
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs sm:text-sm font-black font-mono tracking-wider ${
              theme.navbar.isLight ? 'text-slate-900' : 'text-white'
            }`}
            style={theme.navbar.titleStyle}
          >
            {timeStr}
          </span>
          <span
            className={`hidden lg:inline text-[11px] font-medium border-l pl-2 ${
              theme.navbar.isLight
                ? 'text-slate-600 border-slate-300/80'
                : 'text-white/80 border-white/25'
            }`}
            style={theme.navbar.subtextStyle}
          >
            {dateStr}
          </span>
        </div>
      </div>

      {/* Right section: Mobile Digital Clock Box, Firebase Live Pill, Admin Pill, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Kotak Jam Digital Khusus Mobile Handphone (Bentuk Kotak Kompak, Sangat Jelas & Otomatis Adaptif) */}
        <div
          className={`sm:hidden flex flex-col items-center justify-center min-w-[48px] h-9 px-1.5 py-0.5 rounded-xl border-2 shadow-md shrink-0 text-center select-none transition-colors ${
            theme.navbar.isLight
              ? 'bg-white/95 border-emerald-600/40 text-slate-900'
              : 'bg-slate-900/95 border-emerald-400/50 text-white'
          }`}
          title="Waktu Real-time Saat Ini"
        >
          <span
            className={`text-[11px] font-black font-mono tracking-wider leading-none ${
              theme.navbar.isLight ? 'text-slate-900' : 'text-white'
            }`}
            style={theme.navbar.titleStyle}
          >
            {timeHourMinute}
          </span>
          <div className="flex items-center justify-center gap-1 mt-0.5 leading-none">
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
                theme.navbar.isLight ? 'bg-emerald-600' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-[8px] font-extrabold font-mono tracking-tight leading-none ${
                theme.navbar.isLight ? 'text-emerald-700' : 'text-emerald-300'
              }`}
            >
              {timeSeconds}
            </span>
          </div>
        </div>

        {/* 1. Firebase Live Pill */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${theme.navbar.pillClass}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firebase Live</span>
        </div>

        {/* 2. Admin Pill */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${theme.navbar.pillClass}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{isAdmin ? 'Admin Gereja' : 'Jemaat Gereja'}</span>
        </div>
        {currentUser.role === 'SUPER_ADMIN' && onOpenSuperAdminSaaSPanel && (
          <button
            onClick={onOpenSuperAdminSaaSPanel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-amber-500/20 border border-amber-400/40 cursor-pointer active:scale-95 transition-all"
            title="Kelola & Beralih Akses Akun Gereja SaaS"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Panel SuperAdmin SaaS</span>
            <span className="sm:hidden">SaaS</span>
          </button>
        )}

        {/* Quick Navbar Customizer Palette Button - ONLY FOR ADMIN */}
        {isAdmin && (
          <button
            onClick={() => {
              if (onOpenNavbarCustomizer) {
                onOpenNavbarCustomizer();
              } else {
                setIsNavbarCustomizerOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-black shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95 transition-all shrink-0"
            title="Klik untuk Kustomisasi Warna & Tema Navbar (Khusus Admin)"
          >
            <Palette className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden xs:inline">Warna Navbar</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
            }}
            className={`relative p-2.5 rounded-xl ${theme.navbar.iconBtnClass} transition-all cursor-pointer`}
            style={theme.navbar.iconBtnStyle}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0f172a] animate-pulse" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="fixed top-16 right-3 sm:top-auto sm:right-0 sm:absolute mt-3 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-3xl bg-white/98 backdrop-blur-2xl border-2 border-teal-200/90 shadow-2xl p-4 z-50 text-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Pemberitahuan System</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tandai Semua</span>
                  </button>
                )}
              </div>

              {/* Push Notification HP Controls */}
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-950 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    Notifikasi Status Bar HP &amp; Suara
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playNotificationChimeSound();
                      triggerStatusBarNotification(
                        `🔔 Notifikasi ${settings.nama_gereja}`,
                        'Suara lonceng & notifikasi di status bar HP aktif! Notifikasi tetap muncul saat aplikasi ditutup.'
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-3 h-3" />
                    Tes Suara
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const token = await requestAndSaveFCMToken();
                    if (token) {
                      alertDialog({
                        title: 'Notifikasi Push HP (FCM)',
                        message: `Notifikasi Push HP (FCM) BERHASIL DIAKTIFKAN!\nToken Perangkat HP Anda telah terdaftar untuk ${settings.nama_gereja}. Notifikasi warta dan jadwal ibadah akan muncul di status bar HP dengan suara lonceng & getar.`,
                        type: 'success',
                        confirmText: 'OKE'
                      });
                    } else {
                      triggerStatusBarNotification(`${settings.nama_gereja} - Notifikasi`, 'Izin Notifikasi HP Aktif! Suara lonceng dan getar siap digunakan.');
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] text-center transition-all cursor-pointer shadow-xs"
                >
                  ⚡ Aktifkan / Izinkan Notifikasi Bar HP (FCM)
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {relevantNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Belum ada notifikasi.</p>
                ) : (
                  relevantNotifications.map((n) => (
                    <div
                      key={n.notif_id}
                      onClick={() => {
                        const updated = notifications.map((item) =>
                          item.notif_id === n.notif_id ? { ...item, status_baca: 'Sudah' as const } : item
                        );
                        setNotifications(updated);
                        StorageManager.saveNotifications(updated);
                        setShowNotifDropdown(false);
                        window.dispatchEvent(new CustomEvent('open_notification_detail', { detail: n }));
                      }}
                      className={`p-3 rounded-2xl border text-xs space-y-1 transition-all cursor-pointer hover:border-teal-400 active:scale-[0.99] ${
                        n.status_baca === 'Belum'
                          ? 'bg-teal-50/70 border-teal-200 text-slate-900 hover:bg-teal-100/70'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="truncate max-w-[200px]">{n.judul}</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">{n.tanggal}</span>
                      </div>
                      <p className="text-slate-600 leading-normal text-[11px] line-clamp-2">{n.pesan}</p>
                      <div className="text-[10px] text-teal-700 font-bold pt-0.5 flex items-center gap-1">
                        <span>Baca selengkapnya &rarr;</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown or Login Button for Guest */}
        <div className="relative shrink-0">
          {isGuest || currentUser.user_id === 'guest' ? (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black shadow-md shadow-teal-600/25 transition-all cursor-pointer border border-teal-400/40 active:scale-95 shrink-0 whitespace-nowrap"
              title="Masuk ke Akun Jemaat / Admin Gereja"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span>Masuk / Login</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                className={`flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full transition-all cursor-pointer border ${
                  theme.navbar.isLight
                    ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-300/80 shadow-2xs'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-2xs'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#00a859] flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
                  {currentUser.nama.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p className={`text-xs font-bold leading-tight truncate max-w-[130px] ${theme.navbar.isLight ? 'text-slate-900' : 'text-white'}`}>
                    {currentUser.nama}
                  </p>
                  <p className={`text-[10px] font-black leading-none mt-0.5 truncate ${theme.navbar.isLight ? 'text-teal-800' : 'text-teal-200'}`}>
                    {currentUser.role === 'ADMIN' ? 'Admin Gereja' : currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser.role}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 hidden lg:block ${theme.navbar.isLight ? 'text-slate-600' : 'text-slate-200'}`} />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-68 rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-2xl border-2 border-teal-200/90 dark:border-slate-700 shadow-2xl p-2.5 z-50 text-slate-800 dark:text-slate-100 space-y-1">
                  <div className="p-3 bg-teal-50/80 dark:bg-slate-800/90 rounded-2xl mb-1.5 border border-teal-200/80 dark:border-slate-700">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{currentUser.nama}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">{currentUser.email || 'Akun Administrator'}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black shadow-2xs ${getRoleBadge(currentUser.role)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90" />
                        Role: {currentUser.role === 'ADMIN' ? 'ADMIN GEREJA' : currentUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : currentUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Kustom Warna Navbar (Khusus Admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onOpenNavbarCustomizer) {
                          onOpenNavbarCustomizer();
                        } else {
                          setIsNavbarCustomizerOpen(true);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-teal-900 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-slate-800 text-xs font-bold transition-all text-left cursor-pointer border border-transparent hover:border-teal-200 dark:hover:border-slate-700"
                    >
                      <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Kustom Warna &amp; Tema Navbar</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onOpenAndroidStudioModal) {
                          onOpenAndroidStudioModal();
                        } else {
                          window.dispatchEvent(new CustomEvent('open_android_studio_modal'));
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-teal-900 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-slate-800 text-xs font-bold transition-all text-left cursor-pointer border border-transparent hover:border-teal-200 dark:hover:border-slate-700"
                    >
                      <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>📱 Android Studio &amp; FCM Pro</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setSelfError('');
                      setSelfSuccess('');
                      setSelfForm({
                        username: currentUser.username,
                        nama: currentUser.nama,
                        email: currentUser.email || '',
                        no_hp: currentUser.no_hp || '',
                        old_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                      setIsSelfModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Ubah Username &amp; Password</span>
                  </button>

                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all text-left cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Self Profile & Password Update */}
      {isSelfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-700 p-6 text-slate-800 dark:text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <KeyRound className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Pengaturan Kredensial Saya</span>
              </h3>
              <button
                onClick={() => setIsSelfModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selfError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{selfError}</span>
              </div>
            )}

            {selfSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{selfSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSelfProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={selfForm.username}
                  onChange={(e) => setSelfForm({ ...selfForm, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={selfForm.nama}
                  onChange={(e) => setSelfForm({ ...selfForm, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                />
              </div>

              {/* Password change box */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-slate-800/80 border border-teal-200/90 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Ubah Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
                      let pass = '';
                      for (let i = 0; i < 10; i++) {
                        pass += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setSelfForm({ ...selfForm, new_password: pass, confirm_password: pass });
                      setShowSelfPass(true);
                    }}
                    className="text-[11px] text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-100 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Acak Password</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showSelfPass ? 'text' : 'password'}
                      placeholder="Password Baru (Kosongkan jika tidak diubah)"
                      value={selfForm.new_password}
                      onChange={(e) => setSelfForm({ ...selfForm, new_password: e.target.value })}
                      className="w-full pr-8 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSelfPass(!showSelfPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showSelfPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type={showSelfPass ? 'text' : 'password'}
                      placeholder="Konfirmasi Password Baru"
                      value={selfForm.confirm_password}
                      onChange={(e) => setSelfForm({ ...selfForm, confirm_password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={selfForm.email}
                  onChange={(e) => setSelfForm({ ...selfForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Nomor Handphone</label>
                <input
                  type="text"
                  value={selfForm.no_hp}
                  onChange={(e) => setSelfForm({ ...selfForm, no_hp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSelfModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl font-bold text-white shadow-md shadow-teal-600/30 cursor-pointer transition-all"
                >
                  Simpan Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Kustomisasi Warna & Tema Navbar */}
      <NavbarCustomizerModal
        isOpen={isNavbarCustomizerOpen}
        onClose={() => setIsNavbarCustomizerOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings || (() => {})}
        onNavigateToSettings={onNavigateToSettings}
      />
    </header>
  );
};
