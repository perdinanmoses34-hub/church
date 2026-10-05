import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Laptop,
  FolderDown,
  RefreshCw,
  HelpCircle,
  Link2,
  Pin,
  Check,
  PlaySquare
} from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { AppSettings, User } from '../types';

export const APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing';
export const OLD_APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s/view?usp=sharing';
export const WINDOWS_PACKAGE_URL = '/downloads/CMS_Gereja_Windows_Desktop.zip';
export const WINDOWS_INSTALLER_CMD_URL = '/downloads/Pasang_Ke_Desktop_Dan_Taskbar.cmd';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingWindowsZip, setIsGeneratingWindowsZip] = useState(false);
  const [windowsInstallNotice, setWindowsInstallNotice] = useState<string | null>(null);
  const [canPromptPwa, setCanPromptPwa] = useState(false);

  const [isHidden, setIsHidden] = useState<boolean>(() => {
    try {
      localStorage.removeItem('cms_apk_button_hidden');
      return sessionStorage.getItem('cms_apk_button_hidden_session') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.removeItem('cms_apk_button_hidden');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setCanPromptPwa(true);
    }
    const handlePwaReady = () => setCanPromptPwa(true);
    const handlePwaInstalled = () => setCanPromptPwa(false);

    window.addEventListener('cms_pwa_prompt_ready', handlePwaReady);
    window.addEventListener('cms_pwa_installed', handlePwaInstalled);
    return () => {
      window.removeEventListener('cms_pwa_prompt_ready', handlePwaReady);
      window.removeEventListener('cms_pwa_installed', handlePwaInstalled);
    };
  }, []);

  useEffect(() => {
    if (currentUser !== undefined) {
      setLoggedInUser((prev) => (JSON.stringify(prev) !== JSON.stringify(currentUser) ? currentUser : prev));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleHiddenChange = (e: any) => {
      if (e?.detail?.hidden !== undefined) {
        setIsHidden(Boolean(e.detail.hidden));
      } else {
        try {
          setIsHidden(sessionStorage.getItem('cms_apk_button_hidden_session') === 'true');
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

  // Hidden only if explicitly disabled by Admin in Settings OR dismissed in current session
  if (appSettings.show_apk_download_button === false || isHidden) {
    return null;
  }

  const rawApkUrl = appSettings.apk_download_url?.trim();
  const apkDownloadUrl = (rawApkUrl && rawApkUrl !== OLD_APK_DOWNLOAD_URL)
    ? rawApkUrl
    : APK_DOWNLOAD_URL;

  const rawWindowsUrl = appSettings.windows_download_url?.trim();
  const customWindowsUrl = rawWindowsUrl || '';

  const isAdmin = loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'SUPER_ADMIN';

  // Handle Download APK Android
  const handleDownloadApk = () => {
    try {
      const link = document.createElement('a');
      link.href = apkDownloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('download', `${(appSettings.nama_gereja || 'Gereja').replace(/\s+/g, '_')}_Pro.apk`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(apkDownloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle Download Direct Installer .CMD for Windows Desktop & Taskbar
  const handleDownloadInstallerCmd = () => {
    const link = document.createElement('a');
    link.href = WINDOWS_INSTALLER_CMD_URL;
    link.download = 'Pasang_Ke_Desktop_Dan_Taskbar.cmd';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setWindowsInstallNotice(
      '📥 File "Pasang_Ke_Desktop_Dan_Taskbar.cmd" berhasil diunduh! Klik ganda file tersebut di komputer Anda untuk langsung membuat icon di Layar Desktop & Taskbar Windows.'
    );
  };

  // Handle Download Windows Desktop Package (.ZIP)
  const handleDownloadWindowsZip = async () => {
    if (customWindowsUrl) {
      window.open(customWindowsUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsGeneratingWindowsZip(true);
    setWindowsInstallNotice(null);

    try {
      const JSZipModule = await import('jszip');
      const JSZip = (JSZipModule as any).default || JSZipModule;
      const zip = new JSZip();

      const churchName = appSettings.nama_gereja || 'Gereja Monapa Puriala';
      const cleanName = churchName.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const targetUrl = 'https://perdinanmoses34-hub.github.io/church/';

      const cmdContent = `@echo off
title Memasang ${churchName} di Desktop & Taskbar Windows
cls
echo ======================================================================
echo    MEMASANG APLIKASI ${churchName} DI DESKTOP & TASKBAR WINDOWS
echo ======================================================================
echo.
echo Sedang membuat shortcut di Layar Utama (Desktop) dan Menu Windows...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$churchName = '${churchName}'; " ^
  "$appUrl = '${targetUrl}'; " ^
  "$desktop = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), ($churchName + '.lnk')); " ^
  "$startMenu = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs', ($churchName + '.lnk')); " ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "function CreateLnk($path) { " ^
  "  $s = $ws.CreateShortcut($path); " ^
  "  $s.TargetPath = 'msedge.exe'; " ^
  "  $s.Arguments = ('--app=' + $appUrl + ' --start-maximized'); " ^
  "  $s.Description = 'Aplikasi Resmi ${churchName}'; " ^
  "  $s.WindowStyle = 3; " ^
  "  $s.Save(); " ^
  "} " ^
  "CreateLnk $desktop; " ^
  "CreateLnk $startMenu; " ^
  "Write-Host '1. Shortcut berhasil dipasang di Halaman Utama Desktop!' -ForegroundColor Green; " ^
  "Write-Host '2. Shortcut berhasil dipasang di Start Menu Windows!' -ForegroundColor Green; "

echo.
echo Sedang membuka Aplikasi Gereja di Layar dan Taskbar...
start msedge --app="${targetUrl}" --start-maximized
if %errorlevel% neq 0 (
  start chrome --app="${targetUrl}" --start-maximized
)

echo.
echo ======================================================================
echo  SUKSES! Aplikasi Gereja telah terpasang di:
echo   - Layar Utama Desktop Komputer/Laptop
echo   - Start Menu Windows
echo   - Taskbar Windows
echo ======================================================================
echo.
timeout /t 5
exit
`;

      const batContent = `@echo off
title ${churchName} - Windows Desktop
cls
echo Sedang membuka aplikasi dalam mode layar penuh (Native Desktop Window)...
start msedge --app="${targetUrl}" --start-maximized --window-size=1366,768
if %errorlevel% neq 0 (
  start chrome --app="${targetUrl}" --start-maximized --window-size=1366,768
)
exit
`;

      const readmeContent = `======================================================================
  CARA MEMASANG APLIKASI ${churchName} DI DESKTOP & TASKBAR WINDOWS
======================================================================

1. CARA PASANG OTOMATIS KE DESKTOP & TASKBAR:
   - Klik ganda file:
     "Pasang_Ke_Desktop_Dan_Taskbar.cmd"
   - Script akan otomatis membuat icon shortcut di:
     * Layar Utama Desktop komputer/laptop Anda
     * Start Menu Windows
     * Membuka aplikasi langsung di Taskbar Windows.

2. UNTUK MENYEMATKAN TETAP DI TASKBAR:
   - Saat aplikasi terbuka di layar, klik kanan pada icon aplikasi
     di Taskbar bawah layar Windows, lalu pilih:
     "Pin to taskbar" (Sematkan ke taskbar).

3. JIKA INGIN MEMBUKA LANGSUNG:
   - Klik ganda "Buka_Aplikasi_Gereja.bat" atau icon shortcut di Desktop.

Sekretariat Gereja & Tim Pengembang
======================================================================
`;

      zip.file('Pasang_Ke_Desktop_Dan_Taskbar.cmd', cmdContent);
      zip.file(`Buka_Aplikasi_${cleanName}.bat`, batContent);
      zip.file('PETUNJUK_INSTALASI_DESKTOP_TASKBAR.txt', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanName}_Windows_Desktop.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback to static download
      const link = document.createElement('a');
      link.href = WINDOWS_PACKAGE_URL;
      link.download = 'CMS_Gereja_Windows_Desktop.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsGeneratingWindowsZip(false);
    }
  };

  // Handle Install via Windows PWA Prompt (Direct Desktop Install in Edge/Chrome)
  const handleInstallPwaWindows = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setCanPromptPwa(false);
          setWindowsInstallNotice(
            '✅ Sukses! Aplikasi sedang dipasang ke Windows. Pada jendela yang muncul di layar, pastikan mencentang "Sematkan ke taskbar" dan "Buat pintasan desktop", lalu klik Izinkan.'
          );
          return;
        }
      } catch (err) {
        console.warn('PWA prompt execution note:', err);
      }
    }

    // Jika prompt browser belum siap atau diblokir iframe, jalankan installer otomatis .CMD
    handleDownloadInstallerCmd();
  };

  const handleHideFromDashboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(true);
    try {
      sessionStorage.setItem('cms_apk_button_hidden_session', 'true');
      window.dispatchEvent(new CustomEvent('cms_apk_hidden_changed', { detail: { hidden: true } }));
    } catch (err) {
      // ignore
    }
  };

  return (
    <>
      {/* Floating Action Button (Tersedia untuk Android & Windows) */}
      <div
        id="floating-apk-container"
        className="fixed bottom-20 sm:bottom-24 lg:bottom-8 right-3 sm:right-6 z-[999] flex flex-col items-end gap-2 pointer-events-auto select-none"
      >
        <div className="relative flex items-center gap-1.5 animate-fade-in group">
          <button
            id="btn-floating-apk-download"
            onClick={() => setIsModalOpen(true)}
            className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white shadow-[0_8px_25px_-4px_rgba(16,185,129,0.7)] border-2 border-emerald-400/80 ring-4 ring-emerald-500/25 font-extrabold text-xs flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title={`Download Aplikasi ${appSettings.nama_gereja || 'Gereja'} (Android & Windows)`}
          >
            {/* Platform Icons (Smartphone & Windows/PC) */}
            <div className="flex items-center -space-x-1.5 p-1 rounded-xl bg-white/20 text-white shrink-0 shadow-inner">
              <Smartphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
              <Monitor className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-200" />
            </div>

            {/* Label Teks Adaptif */}
            <div className="text-left leading-tight">
              <div className="text-[9px] sm:text-[10px] text-emerald-100 uppercase font-black tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                <span className="truncate max-w-[110px] sm:max-w-[140px]">{appSettings.nama_gereja || 'Aplikasi Gereja'}</span>
              </div>
              <div className="text-[11px] sm:text-xs font-black text-white flex items-center gap-1">
                <span>Download APK / Windows</span>
              </div>
            </div>

            {/* Animated Download Badge */}
            <div className="p-1 sm:p-1.5 rounded-xl bg-white text-slate-900 shrink-0 shadow-md">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 animate-pulse" />
            </div>
          </button>

          {/* Tombol (X) untuk Menyembunyikan dari Sesi Saat Ini */}
          <button
            id="btn-hide-floating-apk"
            onClick={handleHideFromDashboard}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/95 hover:bg-rose-600 text-slate-300 hover:text-white border-2 border-slate-700/90 hover:border-rose-500 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center group/close"
            title="Sembunyikan Tombol Download dari Dashboard (x)"
            aria-label="Sembunyikan dari dashboard"
          >
            <X className="w-4 h-4 group-hover/close:rotate-90 transition-transform duration-200 text-slate-300 group-hover/close:text-white" />
          </button>
        </div>
      </div>

      {/* Modal Dialog Pilihan Download: Android (.APK) vs Windows (.EXE/Package) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-teal-500/30 text-slate-800 space-y-5 relative my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Unduh &amp; Pasang Aplikasi Resmi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pilih Versi Aplikasi Gereja
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {appSettings.nama_gereja} – Tersedia untuk smartphone Android &amp; komputer/laptop Windows.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                title="Tutup Pilihan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pilihan Platform: Grid 2 Kolom (Android & Windows) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OPSI 1: APLIKASI ANDROID (.APK) */}
              <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-teal-50/60 border-2 border-emerald-300 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-[10px]">
                      Android 8.0+
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Aplikasi Android (.APK)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Khusus smartphone &amp; tablet Android. Mudah dipasang langsung ke HP.
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Notifikasi warta &amp; jadwal ibadah</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Renungan audio harian &amp; Alkitab</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>KTA Digital jemaat &amp; kas persembahan</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadApk}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK Android</span>
                  </button>
                </div>
              </div>

              {/* OPSI 2: APLIKASI WINDOWS (DESKTOP & TASKBAR) */}
              <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-50/80 to-blue-50/60 border-2 border-cyan-400 shadow-sm hover:border-cyan-600 hover:shadow-md transition-all space-y-3.5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-cyan-700 text-white shadow-md shadow-cyan-700/30">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-200/90 text-cyan-900 font-black text-[10px] tracking-wide">
                      Windows 10 &amp; 11
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      <span>Aplikasi Windows</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">Desktop &amp; Taskbar</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Langsung terpasang di <strong>Layar Utama Desktop</strong> dan <strong>Taskbar</strong> laptop / PC Anda.
                    </p>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>Icon shortcut otomatis di Layar Desktop &amp; Start Menu</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>Siap disematkan ke Taskbar (Pin to taskbar)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>Layar penuh mandiri tanpa address bar peramban</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-1 space-y-2">
                  {/* Tombol Utama: Pasang Langsung PWA (Browser Edge/Chrome) */}
                  <button
                    onClick={handleInstallPwaWindows}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold text-xs shadow-md shadow-cyan-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Laptop className="w-4 h-4" />
                    <span>Pasang Langsung ke Windows (PWA)</span>
                  </button>

                  {/* Tombol Cadangan Pasti: Installer Otomatis CMD Sekali Klik */}
                  <button
                    onClick={handleDownloadInstallerCmd}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Sekali klik otomatis pasang shortcut di Desktop dan Taskbar"
                  >
                    <Pin className="w-4 h-4" />
                    <span>Pasang Otomatis Desktop &amp; Taskbar (.cmd)</span>
                  </button>

                  {/* Tombol Download Paket ZIP Komplit */}
                  <button
                    onClick={handleDownloadWindowsZip}
                    disabled={isGeneratingWindowsZip}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isGeneratingWindowsZip ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                        <span>Menyiapkan ZIP...</span>
                      </>
                    ) : (
                      <>
                        <FolderDown className="w-3.5 h-3.5 text-slate-500" />
                        <span>Unduh Paket Arsip Lengkap (.ZIP)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Notice jika ada status instalasi */}
            {windowsInstallNotice && (
              <div className="p-3 rounded-2xl bg-cyan-50 border-2 border-cyan-300 text-cyan-950 text-xs font-semibold flex items-start gap-2.5 animate-fade-in shadow-xs">
                <HelpCircle className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{windowsInstallNotice}</p>
                </div>
              </div>
            )}

            {/* Petunjuk Praktis Pemasangan ke Taskbar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Pin className="w-4 h-4 text-cyan-700" />
                <span>Petunjuk Mudah: Pasang di Layar Utama Desktop &amp; Taskbar Windows</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                  <p className="font-bold text-slate-800">1. Lewat File Pasang Otomatis (.cmd)</p>
                  <p>Klik tombol hijau <strong>"Pasang Otomatis (.cmd)"</strong> di atas, lalu klik file tersebut. Icon aplikasi langsung muncul di Desktop &amp; Taskbar Anda.</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                  <p className="font-bold text-slate-800">2. Menyematkan ke Taskbar (Pin)</p>
                  <p>Saat aplikasi terbuka di layar, klik kanan ikon aplikasi di Taskbar (bilah bawah laptop), lalu pilih <strong>"Pin to taskbar"</strong>.</p>
                </div>
              </div>
            </div>

            {/* Opsi Pengaturan Admin */}
            {isAdmin && (
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span>Mode Administrator Aktif</span>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Atur Tautan Download di Pengaturan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
