import React from 'react';
import { Smartphone, Download, X, HelpCircle, Sparkles } from 'lucide-react';

interface PWABannerProps {
  onInstall: () => void;
  onDismiss: () => void;
  onShowGuide?: () => void;
}

export const PWABanner: React.FC<PWABannerProps> = ({ onInstall, onDismiss, onShowGuide }) => {
  return (
    <div
      id="pwa-install-banner"
      className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-b-2 border-indigo-500/40 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl relative z-30 animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src="/pwa-192x192.png"
            alt="PWA Icon"
            className="w-10 h-10 rounded-2xl shadow-lg border border-amber-400/40 object-cover"
          />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-black text-white tracking-wide">
              Pasang Aplikasi CMS Gereja (Android PWA)
            </h4>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5" /> Standalone Fullscreen
            </span>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-1 sm:line-clamp-none mt-0.5">
            Bisa diinstal langsung dari menu titik tiga (⋮) Google Chrome tanpa perlu Google Play Store.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onShowGuide && (
          <button
            onClick={onShowGuide}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lihat petunjuk instal lewat Titik Tiga Chrome"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cara Pasang (⋮)</span>
          </button>
        )}
        <button
          onClick={onInstall}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instal Sekarang</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Tutup banner"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
