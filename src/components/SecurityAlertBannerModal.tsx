import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, BellRing, Volume2, VolumeX, ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { SecurityAlert, User } from '../types';
import { StorageManager } from '../utils/storage';
import { playSecurityAlarmSiren, stopSecurityAlarmSiren } from '../utils/soundHelper';

interface SecurityAlertBannerModalProps {
  currentUser: User | null;
}

export const SecurityAlertBannerModal: React.FC<SecurityAlertBannerModalProps> = ({
  currentUser
}) => {
  const [alert, setAlert] = useState<SecurityAlert | null>(() => StorageManager.getSecurityAlert());
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [dismissedAlertId, setDismissedAlertId] = useState<string>('');
  const stopAlarmRef = useRef<(() => void) | null>(null);

  // Sync security alert on storage and custom events
  useEffect(() => {
    const handleCheckAlert = () => {
      const activeAlert = StorageManager.getSecurityAlert();
      if (!activeAlert || !activeAlert.active || activeAlert.revoked) {
        stopSecurityAlarmSiren();
        if (stopAlarmRef.current) {
          stopAlarmRef.current();
          stopAlarmRef.current = null;
        }
        setAlert(null);
        return;
      }
      setAlert(activeAlert);
    };

    const handleCustomEvent = (e: any) => {
      const newAlert = e.detail;
      if (!newAlert || !newAlert.active || newAlert.revoked) {
        stopSecurityAlarmSiren();
        if (stopAlarmRef.current) {
          stopAlarmRef.current();
          stopAlarmRef.current = null;
        }
        setAlert(null);
      } else {
        setAlert(newAlert);
      }
    };

    window.addEventListener('cms_security_alert_changed', handleCustomEvent);
    window.addEventListener('cms_data_changed', handleCheckAlert);
    window.addEventListener('storage', handleCheckAlert);

    // Fast 2.5s poll for real-time alert awareness
    const interval = setInterval(handleCheckAlert, 2500);

    return () => {
      window.removeEventListener('cms_security_alert_changed', handleCustomEvent);
      window.removeEventListener('cms_data_changed', handleCheckAlert);
      window.removeEventListener('storage', handleCheckAlert);
      clearInterval(interval);
    };
  }, []);

  // Check if current user is the sender (SuperAdmin who sent the alert should not get attacked by their own alert)
  const isSender = Boolean(
    currentUser &&
      alert &&
      ((alert.sender_user_id && currentUser.user_id === alert.sender_user_id) ||
        (alert.sender_username &&
          currentUser.username &&
          currentUser.username.toLowerCase() === alert.sender_username.toLowerCase()) ||
        (alert.sender &&
          currentUser.username &&
          currentUser.username.toLowerCase() === alert.sender.toLowerCase()) ||
        (alert.sender &&
          currentUser.nama &&
          currentUser.nama.toLowerCase() === alert.sender.toLowerCase()))
  );

  // Determine if this alert applies to current user
  const isTargetMatch = Boolean(
    alert &&
      alert.active &&
      !alert.revoked &&
      !isSender &&
      (!alert.target_user_id ||
        alert.target_user_id === 'ALL' ||
        (currentUser && currentUser.user_id === alert.target_user_id) ||
        (currentUser &&
          alert.target_username &&
          currentUser.username &&
          alert.target_username.toLowerCase() === currentUser.username.toLowerCase()))
  );

  const isSessionDismissed = Boolean(
    alert &&
      ((typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`cms_dismissed_alert_${alert.id}`) === 'true') ||
       (typeof localStorage !== 'undefined' && localStorage.getItem(`cms_dismissed_alert_${alert.id}`) === 'true'))
  );

  const isVisible = Boolean(
    alert &&
    alert.active &&
    !alert.revoked &&
    isTargetMatch &&
    alert.id !== dismissedAlertId &&
    !isSessionDismissed
  );

  // Alarm sound effect trigger whenever a new active alert arrives
  useEffect(() => {
    if (isVisible && !isSoundMuted) {
      // Play 4-second emergency siren with flashing
      stopAlarmRef.current = playSecurityAlarmSiren(4000);
    } else {
      stopSecurityAlarmSiren();
      if (stopAlarmRef.current) {
        stopAlarmRef.current();
        stopAlarmRef.current = null;
      }
    }

    return () => {
      stopSecurityAlarmSiren();
      if (stopAlarmRef.current) {
        stopAlarmRef.current();
        stopAlarmRef.current = null;
      }
    };
  }, [isVisible, alert?.id, isSoundMuted]);

  if (!isVisible || !alert || !alert.active || alert.revoked) {
    return null;
  }

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleDismissForNow = () => {
    stopSecurityAlarmSiren();
    if (stopAlarmRef.current) {
      stopAlarmRef.current();
      stopAlarmRef.current = null;
    }
    if (alert) {
      setDismissedAlertId(alert.id);
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(`cms_dismissed_alert_${alert.id}`, 'true');
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`cms_dismissed_alert_${alert.id}`, 'true');
        }
      } catch {
        // ignore
      }
    }
  };

  const handleDeactivatePermanently = () => {
    stopSecurityAlarmSiren();
    if (stopAlarmRef.current) {
      stopAlarmRef.current();
      stopAlarmRef.current = null;
    }
    StorageManager.revokeSecurityAlert(currentUser?.username || currentUser?.nama || 'SuperAdmin');
    setAlert(null);
  };

  const toggleSound = () => {
    if (!isSoundMuted) {
      stopSecurityAlarmSiren();
      setIsSoundMuted(true);
    } else {
      setIsSoundMuted(false);
      playSecurityAlarmSiren(3000);
    }
  };

  return (
    <div
      id="security-warning-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      {/* Flashing Red Alarm Perimeter Halo */}
      <div className="absolute inset-0 border-4 sm:border-8 border-rose-600/70 pointer-events-none animate-pulse" />

      {/* Red Warning Card */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950 border-2 border-rose-600 rounded-3xl shadow-2xl shadow-rose-600/40 p-5 sm:p-7 text-white overflow-hidden">
        {/* Pulsing Light Bar on Top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 animate-pulse" />

        {/* Header with Blinking Red Warning Triangle and Alarm sound indicator */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Blinking Red Triangle Container */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-rose-500 shadow-lg shadow-rose-600/30 shrink-0">
              {/* Animated ping ring */}
              <span className="absolute inline-flex h-full w-full rounded-2xl bg-rose-500 opacity-40 animate-ping" />
              <AlertTriangle className="w-8 h-8 text-rose-500 animate-bounce" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase shadow-sm">
                  PERINGATAN KEAMANAN SISTEM
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                  <BellRing className="w-3.5 h-3.5 animate-pulse" />
                  <span>Alarm Aktif</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-snug">
                {alert.title || 'Peringatan Pelanggaran Aturan Keamanan!'}
              </h2>
            </div>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={isSoundMuted ? 'Bunyikan Alarm' : 'Matikan Bunyi Alarm'}
            className="p-2 rounded-xl bg-slate-900 border border-rose-700/60 text-rose-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />}
          </button>
        </div>

        {/* Warning Body Message with Red highlight frame */}
        <div className="my-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-600/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Pesan Resmi Keamanan dari Super Admin:</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-rose-100 whitespace-pre-line leading-relaxed">
            {alert.message}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-rose-900/40">
          <div>
            <span>Diterbitkan oleh: </span>
            <strong className="text-slate-200">{alert.sender || 'SuperAdmin'}</strong>
            <span className="mx-2">•</span>
            <span>{alert.created_at}</span>
          </div>

          {alert.target_username && alert.target_username !== 'ALL' && (
            <div className="text-amber-300 font-semibold">
              Ditujukan untuk: @{alert.target_username}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {isSuperAdmin && (
            <button
              onClick={handleDeactivatePermanently}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hentikan & Cabut Peringatan (SuperAdmin)</span>
            </button>
          )}

          <button
            onClick={handleDismissForNow}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Saya Memahami & Tutup Peringatan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
