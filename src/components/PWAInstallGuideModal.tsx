import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, Zap, X, MoreVertical, Chrome, Apple, Sparkles, Copy, Check, ExternalLink, Lock, AlertCircle } from 'lucide-react';
import { APK_DOWNLOAD_URL } from './FloatingApkDownloadButton';
import { StorageManager } from '../utils/storage';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectInstall?: () => void;
  canDirectInstall?: boolean;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
  onDirectInstall,
  canDirectInstall
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadApk = () => {
    const settings = StorageManager.getSettings();
    const activeTenantId = StorageManager.getActiveTenantId();
    const raw = settings?.apk_download_url?.trim();
    let downloadUrl = (raw && raw !== 'https://drive.google.com/file/d/1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s/view?usp=sharing') ? raw : '';
    if (!downloadUrl && activeTenantId === 'CHURCH-001') {
      downloadUrl = APK_DOWNLOAD_URL;
    }
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="pwa-install-guide-modal"
        className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-950/80 text-white overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <Smartphone className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Solusi Lengkap Android / POCO
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5 leading-tight">
                Pemasangan Aplikasi di HP POCO / Android
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs sm:text-sm">
          
          {/* SOLUSI UTAMA PALING CEPAT: DOWNLOAD FILE APK */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border-2 border-emerald-500 text-emerald-100 shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Solusi Instan: Pasang File APK Resmi</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold">TERUJI</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Jika menu titik tiga Chrome di HP POCO Anda tidak menampilkan opsi, langsung unduh file <strong>.APK resmi</strong> gereja. Aplikasi akan terpasang 100% normal seperti aplikasi dari Play Store.
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDownloadApk}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File APK Android Sekarang (.apk)</span>
              </button>
            </div>
          </div>

          {/* KENAPA TIDAK MUNCUL DI POCO C71? PENJELASAN & CARA MENGATASINYA */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mengapa Tidak Muncul di Titik Tiga Chrome POCO C71?</span>
            </div>

            <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
              {/* Point 1: Halaman di dalam Preview / Frame / In-App */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-[11px]">1</span>
                  <span>Website Terbuka di dalam Frame / Pratinjau / In-App Browser</span>
                </div>
                <p className="text-slate-300 pl-6">
                  Jika tautan dibuka dari pratinjau AI Studio atau obrolan chat, Chrome mendeteksi halaman berada di dalam <em>frame</em> sehingga menyembunyikan tombol instalasi.
                </p>
                <div className="pl-6 pt-1 flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tautan Tersalin!' : 'Salin URL & Buka di Tab Baru Chrome'}</span>
                  </button>
                </div>
              </div>

              {/* Point 2: Fitur "Kunci Susunan Layar Utama" di HP POCO */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-[11px]">2</span>
                  <span>Fitur "Kunci Susunan Layar Utama" (Lock Home Screen Layout) Menyala</span>
                </div>
                <p className="text-slate-300 pl-6">
                  Pada sistem bawaan POCO (POCO Launcher), jika susunan layar dikunci, sistem melarang aplikasi apa pun membuat ikon baru di beranda.
                </p>
                <div className="pl-6 text-[11px] text-amber-300/90 font-medium">
                  👉 Solusi: Buka <strong>Setelan HP &gt; Layar Utama &gt; Matikan "Kunci susunan Layar Utama"</strong>.
                </div>
              </div>

              {/* Point 3: Izin Pintasan Layar Utama di POCO / HyperOS */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-[11px]">3</span>
                  <span>Izin Pintasan Layar Utama di Pengaturan Aplikasi Chrome</span>
                </div>
                <div className="pl-6 text-[11px] text-slate-300 space-y-1">
                  <div>1. Buka <strong>Setelan &gt; Aplikasi &gt; Kelola Aplikasi &gt; Chrome</strong>.</div>
                  <div>2. Pilih <strong>Perizinan Lainnya</strong> (Other permissions).</div>
                  <div>3. Cari <strong>"Pintasan layar utama"</strong> &gt; pilih <strong>"Selalu izinkan"</strong>.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Direct Install CTA if supported by browser */}
          {canDirectInstall && onDirectInstall && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-blue-950/80 border border-indigo-500/60 text-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Browser Ini Mendukung Tombol Instal Langsung!</span>
                </div>
                <p className="text-xs text-indigo-300/90 leading-snug">
                  Browser mendeteksi paket PWA siap pasang.
                </p>
              </div>
              <button
                onClick={() => {
                  onDirectInstall();
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Instal Otomatis</span>
              </button>
            </div>
          )}

          {/* Edukasi & Solusi Peringatan Play Protect / "File Mungkin Berbahaya" */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Muncul Pesan &quot;Aplikasi Diblokir / Play Protect&quot; atau &quot;File Berbahaya&quot;?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Jangan khawatir, aplikasi ini 100% aman dan bebas virus.</strong> Pesan tersebut adalah peringatan otomatis Android untuk semua aplikasi resmi yang didistribusikan langsung tanpa melalui Google Play Store komersial.
            </p>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/20 text-[11px] space-y-1 text-slate-200">
              <div className="font-semibold text-amber-200">👉 Cara Memasang dengan Aman &amp; Cepat:</div>
              <div>1. Saat muncul jendela Play Protect, ketuk <strong>&quot;Detail Selengkapnya&quot; (More details)</strong> di bagian bawah.</div>
              <div>2. Ketuk <strong>&quot;Tetap Instal (Tidak Aman)&quot; (Install anyway)</strong>. Aplikasi langsung terpasang!</div>
              <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                💡 Tips: Anda juga bisa memasang aplikasi lewat tombol <strong>&quot;Instal Otomatis / Tambahkan ke Layar Utama&quot;</strong> di atas untuk bebas 100% dari peringatan!
              </div>
            </div>
          </div>

          {/* Fitur Keunggulan Aplikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">Akses Offline</div>
                <div className="text-[11px] text-slate-400 leading-tight">Buka Alkitab dan lagu tanpa kuota internet.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">Layar Penuh</div>
                <div className="text-[11px] text-slate-400 leading-tight">Tampilan bersih layaknya aplikasi Play Store.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">Aman & Terverifikasi</div>
                <div className="text-[11px] text-slate-400 leading-tight">Koneksi HTTPS terenkripsi penuh.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadApk}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK (.apk)</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
