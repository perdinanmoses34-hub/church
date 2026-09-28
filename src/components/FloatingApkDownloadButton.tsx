import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, ShieldCheck, Link2 } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { AppSettings, User } from '../types';

export const APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing';
export const OLD_APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s/view?usp=sharing';

interface FloatingApkDownloadButtonProps {
  settings?: AppSettings;
  currentUser?: User;
  onOpenSettings?: () => void;
}

export const FloatingApkDownloadButton: React.FC<FloatingApkDownloadButtonProps> = ({
  settings,
  currentUser,
  onOpenSettings
}) => {
  const [appSettings, setAppSettings] = useState<AppSettings>(() => settings || StorageManager.getSettings());
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => currentUser || StorageManager.getCurrentUser());
  const [isOpenTooltip, setIsOpenTooltip] = useState(false);
  const [isHidden, setIsHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cms_apk_button_hidden') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (currentUser !== undefined) {
      setLoggedInUser(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleHiddenChange = (e: any) => {
      if (e?.detail?.hidden !== undefined) {
        setIsHidden(Boolean(e.detail.hidden));
      } else {
        try {
          setIsHidden(localStorage.getItem('cms_apk_button_hidden') === 'true');
        } catch {
          setIsHidden(false);
        }
      }
    };

    window.addEventListener('cms_apk_hidden_changed', handleHiddenChange);
    return () => {
      window.removeEventListener('cms_apk_hidden_changed', handleHiddenChange);
    };
  }, []);

  useEffect(() => {
    if (settings) {
      setAppSettings(settings);
    }
    const handleSync = () => {
      setAppSettings(StorageManager.getSettings());
      setLoggedInUser(StorageManager.getCurrentUser());
    };
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [settings]);

  // Syarat Kritis: HANYA MUNCUL KETIKA SUDAH LOGIN KE GEREJA MASING-MASING
  const isGuestOrUnauthenticated =
    !loggedInUser ||
    loggedInUser.role === 'GUEST' ||
    loggedInUser.user_id === 'guest' ||
    loggedInUser.username === 'guest';

  if (isGuestOrUnauthenticated) {
    return null;
  }

  // Hidden if disabled by Admin in Settings OR hidden by user clicking (x)
  if (appSettings.show_apk_download_button === false || isHidden) {
    return null;
  }

  const activeTenantId = StorageManager.getActiveTenantId();
  const rawUrl = appSettings.apk_download_url?.trim();
  let downloadUrl = (rawUrl && rawUrl !== OLD_APK_DOWNLOAD_URL) ? rawUrl : '';
  if (!downloadUrl && activeTenantId === 'CHURCH-001') {
    downloadUrl = APK_DOWNLOAD_URL;
  }

  const isAdmin = loggedInUser.role === 'ADMIN' || loggedInUser.role === 'SUPER_ADMIN';

  // Jika jemaat gereja membuka tapi admin gereja ini belum menempelkan link Google Drive APK
  if (!downloadUrl && !isAdmin) {
    return null;
  }

  const handleDownload = () => {
    if (!downloadUrl) {
      if (isAdmin) {
        if (onOpenSettings) {
          onOpenSettings();
        } else {
          window.dispatchEvent(new CustomEvent('cms_navigate_tab', { detail: { tab: 'settings' } }));
        }
      }
      return;
    }
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleHideFromDashboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(true);
    try {
      localStorage.setItem('cms_apk_button_hidden', 'true');
      window.dispatchEvent(new CustomEvent('cms_apk_hidden_changed', { detail: { hidden: true } }));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div
      id="floating-apk-container"
      className="fixed bottom-20 sm:bottom-24 lg:bottom-8 right-3 sm:right-6 z-[95] flex flex-col items-end gap-2 pointer-events-auto"
    >
      {/* Tooltip / Popup Info (Hanya jika dibuka) */}
      {isOpenTooltip && (
        <div className="relative p-3 max-w-[calc(100vw-2rem)] sm:max-w-xs rounded-2xl bg-slate-900/98 border-2 border-emerald-500 shadow-2xl text-white text-xs space-y-1.5 backdrop-blur-xl animate-fade-in ring-4 ring-emerald-500/20">
          <button
            onClick={() => setIsOpenTooltip(false)}
            className="absolute top-1.5 right-1.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Tutup Info"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 pr-5">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>APK {appSettings.nama_gereja || 'Gereja'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {downloadUrl
              ? `Unduh aplikasi resmi ${appSettings.nama_gereja} langsung dari Google Drive gereja Anda.`
              : 'Admin gereja dapat menempelkan link Google Drive APK di menu Pengaturan Sistem.'}
          </p>
          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-emerald-300 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" /> Link Resmi Gereja
            </span>
            <button
              onClick={handleHideFromDashboard}
              className="text-slate-400 hover:text-rose-400 underline cursor-pointer text-[10px]"
              title="Sembunyikan dari dashboard"
            >
              Sembunyikan (x)
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Download Button with Tombol (X) untuk Menyembunyikan dari Dashboard */}
      <div className="relative flex items-center gap-1.5 animate-fade-in group">
        <button
          id="btn-floating-apk-download"
          onClick={handleDownload}
          className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl ${
            downloadUrl
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.6)] border-emerald-400/60 ring-emerald-500/20'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.6)] border-amber-400/60 ring-amber-500/20'
          } font-extrabold text-xs border-2 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4`}
          title={downloadUrl ? `Download File APK ${appSettings.nama_gereja}` : 'Klik untuk Mengatur Link Google Drive APK Gereja'}
        >
          <div className="p-1.5 rounded-xl bg-white/20 text-white shrink-0 shadow-inner group-hover:rotate-12 transition-transform">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          
          {/* Teks terlihat jelas di HP Android maupun Desktop */}
          <div className="text-left leading-tight">
            <div className="text-[9px] sm:text-[10px] text-emerald-100 uppercase font-black tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
              <span className="truncate max-w-[120px]">{appSettings.nama_gereja || 'Aplikasi Gereja'}</span>
            </div>
            <div className="text-[11px] sm:text-xs font-black text-white flex items-center gap-1">
              <span>{downloadUrl ? 'Download APK' : 'Atur Link APK Drive'}</span>
            </div>
          </div>

          <div className="p-1 sm:p-1.5 rounded-xl bg-white text-slate-900 shrink-0 shadow-md">
            {downloadUrl ? (
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 animate-pulse" />
            ) : (
              <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
            )}
          </div>
        </button>

        {/* Tombol (X) Khusus untuk Menyembunyikan dari Dashboard */}
        <button
          id="btn-hide-floating-apk"
          onClick={handleHideFromDashboard}
          className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/95 hover:bg-rose-600 text-slate-300 hover:text-white border-2 border-slate-700/90 hover:border-rose-500 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center group/close"
          title="Sembunyikan Tombol Download APK dari Dashboard (x)"
          aria-label="Sembunyikan dari dashboard"
        >
          <X className="w-4 h-4 group-hover/close:rotate-90 transition-transform duration-200 text-slate-300 group-hover/close:text-white" />
        </button>
      </div>
    </div>
  );
};
