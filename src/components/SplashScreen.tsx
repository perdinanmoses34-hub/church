import React, { useEffect, useState, useRef } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';

interface SplashScreenProps {
  settings: AppSettings;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ settings, onFinish }) => {
  const [progress, setProgress] = useState(1);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const totalDuration = 1200; // 1.2 seconds smooth loading delay
    const intervalTime = 25; // update every 25ms
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (onFinishRef.current) {
              onFinishRef.current();
            }
          }, 150); // slight smooth fade
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const churchLogo = settings.logo || (settings as any).logo_url || DEFAULT_CHURCH_LOGO;
  const displayedChurchName =
    settings?.nama_gereja && !settings.nama_gereja.includes('Kemenangan Faith')
      ? settings.nama_gereja
      : 'Jesus Kingdom Christ';

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f0f5f2] flex flex-col items-center justify-center p-6 text-slate-800 font-sans overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6 text-center animate-fade-in">
        {/* Church Registered Logo */}
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 blur opacity-60 animate-pulse" />
          <img
            src={churchLogo}
            alt={displayedChurchName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
            }}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-emerald-500/40 shadow-xl bg-white p-1.5"
          />
        </div>

        {/* Church Name & Description */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {displayedChurchName}
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-[#00a859] font-bold">
            Sistem Informasi Manajemen Terpadu
          </p>
        </div>

        {/* Animated Loading Bar & Counter (1 to 100) */}
        <div className="w-full space-y-2.5 pt-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span className="text-emerald-700">Memuat Sistem...</span>
            <span className="font-mono text-[#00a859] text-sm font-extrabold">
              {Math.min(100, Math.floor(progress))}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200/90 rounded-full border border-slate-300/80 p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full transition-all duration-75 ease-out shadow-md shadow-emerald-500/30"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium pt-2">
          Enterprise CMS Pro • Ready Offline &amp; Realtime
        </p>
      </div>
    </div>
  );
};
