import React, { useState } from 'react';
import { Renungan } from '../types';
import { X, BookOpen, Sparkles, Share2, Copy, Check, Type, Sun, Moon, ArrowLeft } from 'lucide-react';

interface RenunganFullscreenModalProps {
  renungan: Renungan | null;
  onClose: () => void;
}

export const RenunganFullscreenModal: React.FC<RenunganFullscreenModalProps> = ({ renungan, onClose }) => {
  const [fontSize, setFontSize] = useState<number>(16); // font size in px
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!renungan) return null;

  const handleCopy = () => {
    const fullText = `${renungan.judul}\nBacaan: ${renungan.ayat || renungan.ayat_alkitab || '-'}\nPenulis: ${renungan.penulis || 'Gembala Sidang'}\n\n${renungan.isi}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-fade-in">
      <div
        className={`w-full max-w-4xl rounded-3xl shadow-2xl transition-all duration-300 my-auto flex flex-col max-h-[95vh] border overflow-hidden ${
          isLightMode
            ? 'bg-amber-50/95 text-slate-900 border-amber-200'
            : 'bg-slate-900/95 text-white border-indigo-500/30'
        }`}
      >
        {/* Top Sticky Header bar */}
        <div
          className={`px-3 sm:px-6 py-3.5 flex items-center justify-between gap-2 sm:gap-4 border-b shrink-0 overflow-hidden ${
            isLightMode ? 'border-amber-200/80 bg-amber-100/60' : 'border-white/10 bg-slate-950/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={onClose}
              className={`p-2 rounded-2xl transition-all cursor-pointer shrink-0 ${
                isLightMode ? 'bg-amber-200/70 text-slate-800 hover:bg-amber-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Tutup Mode Layar Penuh"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-400 block truncate">
                Mode Membaca Layar Penuh
              </span>
              <h3 className="text-xs sm:text-base font-extrabold truncate text-white dark:text-white">
                {renungan.judul}
              </h3>
            </div>
          </div>

          {/* Controls: Font Size, Theme, Copy, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font size adjustment */}
            <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl border text-xs font-bold ${
              isLightMode ? 'bg-amber-200/50 border-amber-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}>
              <Type className="w-3.5 h-3.5 opacity-70 hidden sm:inline" />
              <button
                onClick={() => setFontSize((prev) => Math.max(13, prev - 1))}
                className="px-1 py-0.5 hover:bg-white/20 rounded cursor-pointer text-[10px] sm:text-xs"
                title="Kecilkan Teks"
              >
                A-
              </button>
              <span className="text-[10px] px-0.5">{fontSize}px</span>
              <button
                onClick={() => setFontSize((prev) => Math.min(26, prev + 1))}
                className="px-1 py-0.5 hover:bg-white/20 rounded cursor-pointer text-[10px] sm:text-xs"
                title="Besarkan Teks"
              >
                A+
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                isLightMode ? 'bg-amber-200 border-amber-300 text-amber-900' : 'bg-slate-800 border-slate-700 text-amber-400'
              }`}
              title={isLightMode ? 'Ubah Mode Gelap' : 'Ubah Mode Terang'}
            >
              {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : isLightMode
                  ? 'bg-amber-200 hover:bg-amber-300 text-slate-800'
                  : 'bg-indigo-600/80 hover:bg-indigo-600 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>

            {/* Close Cross */}
            <button
              onClick={onClose}
              className={`p-2 rounded-2xl transition-all cursor-pointer ${
                isLightMode ? 'bg-amber-200/70 text-slate-800 hover:bg-amber-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1 break-words">
          {/* Devotional Header details */}
          <div className="space-y-3 pb-4 border-b border-indigo-500/20">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                isLightMode ? 'bg-amber-200 text-amber-900' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Renungan Harian Gereja</span>
              </span>
              <span className="font-mono opacity-70 text-xs">{renungan.tanggal || 'Hari Ini'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight break-words">
              {renungan.judul}
            </h1>

            {(renungan.ayat || renungan.ayat_alkitab) && (
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 break-words ${
                isLightMode
                  ? 'bg-amber-100/80 border-amber-300/80 text-amber-950'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-80">
                    Nats Alkitab Utama:
                  </span>
                  <p className="font-serif font-bold text-sm sm:text-base md:text-lg italic mt-0.5 break-words">
                    &ldquo;{renungan.ayat || renungan.ayat_alkitab}&rdquo;
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs opacity-75 pt-1">
              <span>Ditulis oleh: <strong className="font-bold">{renungan.penulis || 'Gembala Sidang'}</strong></span>
            </div>
          </div>

          {/* Main Content Text */}
          <div
            lang="id"
            style={{
              fontSize: `${fontSize}px`,
              textAlign: 'justify',
              textJustify: 'inter-word',
              hyphens: 'auto',
              WebkitHyphens: 'auto',
              textAlignLast: 'left',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            className={`font-sans leading-relaxed sm:leading-loose whitespace-pre-line tracking-normal space-y-4 break-words text-justify hyphens-auto [text-align-last:left] [text-justify:inter-word] ${
              isLightMode ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            {renungan.isi}
          </div>

          {/* Footer inside Modal */}
          <div className="pt-6 border-t border-indigo-500/20 flex items-center justify-end gap-4 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
              <button
                onClick={onClose}
                className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                  isLightMode ? 'bg-amber-200 hover:bg-amber-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
