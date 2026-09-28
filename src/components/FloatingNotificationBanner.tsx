import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  BellRing,
  Volume2,
  X,
  ExternalLink,
  Eye,
  CheckCheck,
  Calendar,
  BookOpen,
  Megaphone,
  Video,
  FileText
} from 'lucide-react';
import { NotificationItem, User, AppSettings, NavTab } from '../types';
import { StorageManager } from '../utils/storage';
import { playNotificationChime, playWarningChime } from '../utils/soundHelper';

interface FloatingNotificationBannerProps {
  currentUser: User | null;
  settings: AppSettings;
  onNavigate: (tab: NavTab) => void;
}

export const FloatingNotificationBanner: React.FC<FloatingNotificationBannerProps> = ({
  currentUser,
  settings,
  onNavigate
}) => {
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() =>
    StorageManager.getNotifications()
  );
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [selectedNotifForDetail, setSelectedNotifForDetail] = useState<NotificationItem | null>(null);

  const prevKeysRef = useRef<string>('');
  const isAdmin = currentUser && currentUser.role !== 'JEMAAT';

  // Load and subscribe to notification updates
  const loadNotifications = React.useCallback(() => {
    const list = StorageManager.getNotifications();
    setNotificationsList((prev) =>
      prev.length !== list.length || JSON.stringify(prev) !== JSON.stringify(list) ? list : prev
    );
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleSync = () => {
      loadNotifications();
    };

    const unsubscribe = StorageManager.subscribe(handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const pollInterval = setInterval(loadNotifications, 2000);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(pollInterval);
    };
  }, [loadNotifications]);

  // Listen to open detail modal from anywhere (e.g. NavbarHeader)
  useEffect(() => {
    const handleOpenDetail = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      if (customEvent.detail) {
        setSelectedNotifForDetail(customEvent.detail);
      }
    };
    window.addEventListener('open_notification_detail', handleOpenDetail);
    return () => window.removeEventListener('open_notification_detail', handleOpenDetail);
  }, []);

  // Keyboard shortcut Esc to close detail modal
  useEffect(() => {
    if (!selectedNotifForDetail) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNotifForDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotifForDetail]);

  // Compute active notifications
  const activeNotifs = useMemo(() => {
    return notificationsList.filter((n) => {
      if (dismissedIds.includes(n.notif_id)) return false;
      if (n.status_baca === 'Sudah') return false;

      // Filter by audience
      if (!currentUser) {
        return n.user_id === 'ALL' || n.tujuan_role === 'ALL' || n.user_id === 'JEMAAT';
      }

      if (n.user_id === 'ALL' || n.tujuan_role === 'ALL') return true;
      if (currentUser.role === 'JEMAAT' && (n.user_id === 'JEMAAT' || n.tujuan_role === 'JEMAAT')) return true;
      if (n.user_id === currentUser.username || n.user_id === currentUser.jemaat_id) return true;
      if (n.user_id && currentUser.nama && n.user_id.toLowerCase().trim() === currentUser.nama.toLowerCase().trim()) return true;
      if (isAdmin) return true;

      return false;
    });
  }, [
    notificationsList,
    dismissedIds,
    currentUser?.user_id,
    currentUser?.username,
    currentUser?.nama,
    currentUser?.jemaat_id,
    currentUser?.role,
    isAdmin
  ]);

  // Sound chime when new unread notifications arrive
  useEffect(() => {
    const currentKeys = activeNotifs.map((n) => n.notif_id).join(',');
    if (currentKeys && currentKeys !== prevKeysRef.current) {
      const hasWarning = activeNotifs.some((n) => n.tipe === 'Peringatan' || n.tipe === 'Penting');
      try {
        if (hasWarning) {
          playWarningChime();
        } else {
          playNotificationChime();
        }
      } catch (e) {
        // audio might wait for first interaction
      }
      prevKeysRef.current = currentKeys;
    }
  }, [activeNotifs]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
    const updated = notificationsList.map((n) =>
      n.notif_id === id ? { ...n, status_baca: 'Sudah' as const } : n
    );
    setNotificationsList(updated);
    StorageManager.saveNotifications(updated);
  };

  const handleDismissAll = (ids: string[]) => {
    setDismissedIds((prev) => [...prev, ...ids]);
    const updated = notificationsList.map((n) =>
      ids.includes(n.notif_id) ? { ...n, status_baca: 'Sudah' as const } : n
    );
    setNotificationsList(updated);
    StorageManager.saveNotifications(updated);
  };

  const handleNavigateToSource = (notif: NotificationItem) => {
    // Mark as read and dismiss from floating view
    handleDismiss(notif.notif_id);
    setSelectedNotifForDetail(null);

    // Determine target tab
    let targetTab: NavTab | null = null;
    if (notif.target_view) {
      targetTab = notif.target_view as NavTab;
    } else if (notif.kategori_sumber) {
      const kat = notif.kategori_sumber.toLowerCase();
      if (kat === 'jadwal') targetTab = 'jadwal';
      else if (kat === 'renungan') targetTab = 'renungan';
      else if (kat === 'pengumuman') targetTab = 'pengumuman';
      else if (kat === 'video') targetTab = 'galeri';
    } else {
      // Fallback check from title
      const lowerJudul = notif.judul.toLowerCase();
      if (lowerJudul.includes('jadwal') || lowerJudul.includes('ibadah') || lowerJudul.includes('event')) {
        targetTab = 'jadwal';
      } else if (lowerJudul.includes('renungan')) {
        targetTab = 'renungan';
      } else if (lowerJudul.includes('pengumuman') || lowerJudul.includes('warta')) {
        targetTab = 'pengumuman';
      } else if (lowerJudul.includes('video') || lowerJudul.includes('tayangan')) {
        targetTab = 'galeri';
      }
    }

    if (targetTab) {
      onNavigate(targetTab);
      // Dispatch event with target id in case target view wants to scroll or highlight
      if (notif.target_id) {
        window.dispatchEvent(
          new CustomEvent('cms_target_item_selected', {
            detail: { tab: targetTab, targetId: notif.target_id }
          })
        );
      }
    }
  };

  // Helper for source category label & icon
  const getSourceMeta = (notif: NotificationItem) => {
    const isWarning = notif.tipe === 'Peringatan';
    const isImportant = notif.tipe === 'Penting';

    let catLabel = 'Pengumuman Gereja';
    let icon = <Megaphone className="w-4 h-4" />;
    let buttonLabel = 'Buka Pengumuman ↗';

    const lowerJudul = (notif.judul || '').toLowerCase();
    const lowerKat = (notif.kategori_sumber || '').toLowerCase();
    const target = (notif.target_view || '').toString().toLowerCase();

    if (lowerKat === 'jadwal' || target === 'jadwal' || target === 'agenda' || lowerJudul.includes('jadwal')) {
      catLabel = 'Jadwal Ibadah';
      icon = <Calendar className="w-4 h-4" />;
      buttonLabel = 'Lihat Jadwal Ibadah ↗';
    } else if (lowerKat === 'renungan' || target === 'renungan' || lowerJudul.includes('renungan')) {
      catLabel = 'Renungan Harian';
      icon = <BookOpen className="w-4 h-4" />;
      buttonLabel = 'Baca Renungan ↗';
    } else if (lowerKat === 'video' || target === 'galeri' || target === 'media' || lowerJudul.includes('video')) {
      catLabel = 'Video Terbaru';
      icon = <Video className="w-4 h-4" />;
      buttonLabel = 'Tonton Video ↗';
    } else if (isWarning) {
      catLabel = 'Peringatan Resmi';
      icon = <AlertTriangle className="w-4 h-4" />;
      buttonLabel = 'Buka Warta ↗';
    } else if (isImportant) {
      catLabel = 'Informasi Penting';
      icon = <ShieldAlert className="w-4 h-4" />;
      buttonLabel = 'Buka Pengumuman ↗';
    }

    return { catLabel, icon, buttonLabel };
  };

  if (settings.show_floating_notifications === false) {
    return null;
  }

  if (activeNotifs.length === 0 && !selectedNotifForDetail) {
    return null;
  }

  const visibleNotifs = activeNotifs.slice(0, 2);

  return (
    <>
      {/* FLOATING NOTIFICATION CARDS AT TOP */}
      {visibleNotifs.length > 0 && (
        <div
          id="floating-notification-container"
          className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[9990] w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-md pointer-events-auto space-y-2.5 animate-slide-down"
        >
          {/* Multi-notification Header Bar */}
          {activeNotifs.length > 1 && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/98 border border-teal-200/90 backdrop-blur-xl text-[11px] shadow-lg text-slate-800">
              <span className="text-slate-600 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>
                  <strong className="text-teal-900 font-bold">{activeNotifs.length}</strong> Notifikasi &amp; Pembaruan Baru
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleDismissAll(activeNotifs.map((n) => n.notif_id))}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Tutup Semua ({activeNotifs.length})</span>
              </button>
            </div>
          )}

          {visibleNotifs.map((notif) => {
            const isWarning = notif.tipe === 'Peringatan';
            const isImportant = notif.tipe === 'Penting';
            const { catLabel, icon, buttonLabel } = getSourceMeta(notif);

            return (
              <div
                key={notif.notif_id}
                onClick={() => handleNavigateToSource(notif)}
                className={`group relative overflow-hidden p-4 rounded-3xl border-2 shadow-[0_12px_36px_-6px_rgba(13,148,136,0.18),0_4px_16px_rgba(0,0,0,0.06)] bg-white/98 backdrop-blur-2xl transition-all cursor-pointer hover:border-teal-500 hover:shadow-xl active:scale-[0.99] ${
                  isWarning
                    ? 'border-rose-400 text-slate-800 ring-2 ring-rose-100 hover:border-rose-500'
                    : isImportant
                    ? 'border-amber-400 text-slate-800 ring-2 ring-amber-100 hover:border-amber-500'
                    : 'border-teal-300 text-slate-800 ring-2 ring-teal-50 hover:border-teal-500'
                }`}
                title="Klik untuk langsung membuka sumber informasi"
              >
                {/* Top Glowing Gradient Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isWarning
                      ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600'
                      : isImportant
                      ? 'bg-gradient-to-r from-amber-500 via-teal-400 to-amber-600'
                      : 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600'
                  }`}
                />

                {/* Header Row */}
                <div className="flex items-start justify-between gap-2.5 relative z-10 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        isWarning
                          ? 'bg-rose-600 text-white ring-2 ring-rose-200'
                          : isImportant
                          ? 'bg-amber-600 text-white ring-2 ring-amber-200'
                          : 'bg-teal-600 text-white ring-2 ring-teal-200'
                      }`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isWarning
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isImportant
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {catLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {notif.tanggal}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1 mt-0.5 group-hover:text-teal-700 transition-colors">
                        {notif.judul}
                      </h4>
                    </div>
                  </div>

                  {/* Actions Header (Audio Chime + Dismiss X) */}
                  <div className="flex items-center gap-1 shrink-0 relative z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isWarning) playWarningChime();
                        else playNotificationChime();
                      }}
                      className="p-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-all cursor-pointer"
                      title="Bunyikan Suara"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notif.notif_id);
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                      title="Tutup Notifikasi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Message Snippet */}
                <div className="mt-2.5 text-[11px] sm:text-xs text-slate-700 leading-relaxed bg-teal-50/50 px-3.5 py-2.5 rounded-2xl border border-teal-100 relative z-10 group-hover:bg-teal-50 transition-colors">
                  <p className="line-clamp-2">{notif.pesan}</p>

                  {/* Click to Source Action Button */}
                  <div className="mt-2.5 pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-teal-700 group-hover:text-teal-900 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                      <span>{buttonLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNotifForDetail(notif);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-slate-700 hover:text-teal-900 text-[10px] font-bold border border-teal-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Buka teks lengkap"
                    >
                      <Eye className="w-3 h-3 text-teal-600" />
                      <span>Rincian</span>
                    </button>
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 relative z-10 px-1">
                  <span className="truncate">
                    Oleh: <strong className="text-slate-700 font-semibold">{notif.pengirim || 'Admin Gereja'}</strong>
                  </span>
                  <span className="text-teal-700 font-bold group-hover:underline">
                    Klik untuk membuka &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETAIL NOTIFIKASI PENUH DENGAN TOMBOL NAVIGASI KE SUMBER */}
      {selectedNotifForDetail && (() => {
        const { catLabel, icon, buttonLabel } = getSourceMeta(selectedNotifForDetail);
        const isWarning = selectedNotifForDetail.tipe === 'Peringatan';
        const isImportant = selectedNotifForDetail.tipe === 'Penting';

        return (
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedNotifForDetail(null)}
          >
            <div
              className={`relative w-full max-w-lg sm:max-w-xl rounded-3xl bg-white border-2 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 ${
                isWarning
                  ? 'border-rose-400'
                  : isImportant
                  ? 'border-amber-400'
                  : 'border-teal-300'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Line */}
              <div
                className={`h-2 w-full shrink-0 ${
                  isWarning
                    ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600'
                    : isImportant
                    ? 'bg-gradient-to-r from-amber-500 via-teal-400 to-amber-600'
                    : 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600'
                }`}
              />

              {/* Header */}
              <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`p-3 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      isWarning
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                        : isImportant
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                        : 'bg-teal-600 text-white ring-4 ring-teal-100'
                    }`}
                  >
                    {icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isWarning
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isImportant
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {catLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedNotifForDetail.tanggal}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                      {selectedNotifForDetail.judul}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>
                        Pengirim: <strong className="text-slate-800 font-semibold">{selectedNotifForDetail.pengirim || 'Admin Gereja'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNotifForDetail(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer shrink-0"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Message Content */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[50vh] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Isi Notifikasi:</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    (Dapat digulir ke bawah)
                  </span>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line select-text font-normal shadow-2xs">
                  {selectedNotifForDetail.pesan}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (isWarning) playWarningChime();
                      else playNotificationChime();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto shadow-2xs"
                    title="Bunyikan Suara"
                  >
                    <Volume2 className="w-4 h-4 text-teal-600" />
                    <span>Bunyikan Suara</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedNotifForDetail(null)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm cursor-pointer transition-all flex-1 sm:flex-none text-center shadow-2xs"
                  >
                    Tutup
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigateToSource(selectedNotifForDetail)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/30 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{buttonLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
