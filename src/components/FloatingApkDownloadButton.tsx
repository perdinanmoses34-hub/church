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
  Link2
} from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { AppSettings, User } from '../types';

export const APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing';
export const OLD_APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s/view?usp=sharing';
export const WINDOWS_PACKAGE_URL = '/downloads/CMS_Gereja_Windows_Desktop.zip';

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

  const [isHidden, setIsHidden] = useState<boolean>(() => {
    try {
      // Clear legacy permanent hide so button is restored for all jemaat on handphone
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

      const batContent = `@echo off
title ${churchName} - Windows Desktop
cls
echo ======================================================================
echo           APLIKASI SISTEM INFORMASI MANAJEMEN GEREJA (CMS PRO)
echo                    ${churchName} - WINDOWS DESKTOP
echo ======================================================================
echo.
echo Sedang membuka aplikasi dalam mode layar penuh (Native Desktop Window)...
echo.

:: 1. Buka dengan Microsoft Edge dalam mode aplikasi desktop
start msedge --app="${targetUrl}" --start-maximized --window-size=1366,768
if %errorlevel% equ 0 goto selesai

:: 2. Buka dengan Google Chrome jika Edge tidak tersedia
start chrome --app="${targetUrl}" --start-maximized --window-size=1366,768
if %errorlevel% equ 0 goto selesai

:: 3. Fallback buka dengan browser default Windows
start "" "${targetUrl}"

:selesai
exit
`;

      const cmdContent = `@echo off
title Pasang Shortcut ${churchName} Desktop
cls
echo ======================================================================
echo          PEMASANGAN SHORTCUT DESKTOP WINDOWS - ${churchName}
echo ======================================================================
echo.
echo Sedang membuat shortcut di Layar Desktop Windows...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desktop = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), '${churchName} Desktop.lnk');" ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$s = $ws.CreateShortcut($desktop);" ^
  "$s.TargetPath = 'msedge.exe';" ^
  "$s.Arguments = '--app=${targetUrl} --start-maximized';" ^
  "$s.Description = 'Aplikasi Sistem Informasi ${churchName}';" ^
  "$s.Save();" ^
  "Write-Host 'Shortcut berhasil dibuat di Desktop Anda!' -ForegroundColor Green;"

echo.
echo ======================================================================
echo  SUKSES! Icon '${churchName} Desktop' telah terpasang di Desktop Windows.
echo  Klik ganda icon tersebut kapan saja untuk membuka aplikasi langsung!
echo ======================================================================
echo.
pause
exit
`;

      const offlineHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${churchName} - Windows Desktop</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 2px solid #0d9488; border-radius: 24px; padding: 32px; max-width: 520px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h1 { color: #5eead4; margin-top: 0; font-size: 22px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    a.btn { display: inline-block; margin-top: 16px; padding: 14px 28px; background: linear-gradient(135deg, #0d9488, #10b981); color: white; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${churchName} Desktop</h1>
    <p>Aplikasi resmi sistem manajemen jemaat, persembahan, warta ibadah, dan administrasi gereja.</p>
    <a class="btn" href="${targetUrl}" target="_blank">Buka Aplikasi Online</a>
  </div>
</body>
</html>
`;

      const readmeContent = `======================================================================
     PETUNJUK INSTALASI APLIKASI ${churchName} UNTUK WINDOWS
======================================================================

Selamat datang! Ini adalah paket resmi Aplikasi Gereja untuk sistem
operasi Windows 10, Windows 11, dan Windows 8.

LANGKAH PENGGUNAAN:
----------------------------------------------------------------------
1. EKSTRAK FILE ZIP INI:
   - Klik kanan pada file ZIP ini, pilih "Extract All..." (Ekstrak Semua).

2. CARA MEMBUKA LANGSUNG:
   - Klik ganda file:
     "1_Buka_Aplikasi_${cleanName}_Windows.bat"
   - Aplikasi akan otomatis terbuka dalam jendela aplikasi Windows mandiri
     (tanpa bilah URL / address bar), layar penuh dan nyaman digunakan.

3. CARA MEMBUAT SHORTCUT DI DESKTOP:
   - Klik ganda file:
     "2_Pasang_Shortcut_Desktop.cmd"
   - Shortcut "${churchName} Desktop" akan otomatis muncul di layar utama (Desktop)
     komputer Anda.

KEUNGGULAN VERSI WINDOWS:
----------------------------------------------------------------------
* Tampilan layar penuh khusus kasir/sekretariat & administrasi gereja
* Mendukung cetak langsung struk persembahan & slip kartu jemaat
* Mendukung ekspor laporan ke Excel (XLSX) dan PDF
* Pembukuan kas keuangan transparan & akurat

Sekretariat Gereja & Tim Pengembang
======================================================================
`;

      zip.file(`1_Buka_Aplikasi_${cleanName}_Windows.bat`, batContent);
      zip.file(`2_Pasang_Shortcut_Desktop.cmd`, cmdContent);
      zip.file(`3_Aplikasi_Offline_Cadangan.html`, offlineHtml);
      zip.file(`PETUNJUK_INSTALASI_WINDOWS.txt`, readmeContent);

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
  const handleInstallPwaWindows = () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then(() => {
        (window as any).deferredPrompt = null;
        setWindowsInstallNotice('Permintaan instalasi dikirim ke Windows.');
      });
    } else {
      setWindowsInstallNotice(
        'Untuk memasang langsung: Klik ikon instalasi (+) di bilah alamat (address bar) browser Anda, atau unduh Paket ZIP Windows di atas.'
      );
    }
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
            className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-teal-500/30 text-slate-800 space-y-5 relative my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Unduh Aplikasi Resmi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pilih Versi Aplikasi Gereja
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {appSettings.nama_gereja} – Tersedia untuk smartphone Android &amp; komputer Windows.
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

              {/* OPSI 2: APLIKASI WINDOWS (.EXE / DESKTOP PACKAGE) */}
              <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-50/80 to-blue-50/60 border-2 border-cyan-300 shadow-sm hover:border-cyan-500 hover:shadow-md transition-all space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-cyan-700 text-white shadow-md shadow-cyan-700/30">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-200/80 text-cyan-900 font-bold text-[10px]">
                      Windows 10 &amp; 11
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Aplikasi Windows Desktop
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Untuk laptop &amp; komputer PC. Layar penuh, shortcut desktop, &amp; siap cetak.
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>Jendela mandiri tanpa address bar browser</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>Shortcut otomatis di Desktop &amp; Taskbar</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>Cetak struk persembahan &amp; ekspor Excel</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleDownloadWindowsZip}
                    disabled={isGeneratingWindowsZip}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700 hover:from-cyan-600 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    {isGeneratingWindowsZip ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyiapkan Paket Windows...</span>
                      </>
                    ) : (
                      <>
                        <FolderDown className="w-4 h-4" />
                        <span>Unduh Paket Windows (.ZIP)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleInstallPwaWindows}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-300 hover:border-cyan-500 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Laptop className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Pasang Langsung ke Desktop (PWA)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Notice jika ada petunjuk Windows */}
            {windowsInstallNotice && (
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <HelpCircle className="w-4 h-4 text-cyan-700 shrink-0" />
                <p>{windowsInstallNotice}</p>
              </div>
            )}

            {/* Petunjuk Penggunaan & Keamanan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Keamanan &amp; Integritas Terjamin</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Paket instalasi resmi diverifikasi bebas virus. Untuk Windows, ekstrak file <strong>.ZIP</strong> lalu klik ganda <em>"1_Buka_Aplikasi_Windows.bat"</em> atau pasang shortcut melalui <em>"2_Pasang_Shortcut_Desktop.cmd"</em>.
              </p>
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
