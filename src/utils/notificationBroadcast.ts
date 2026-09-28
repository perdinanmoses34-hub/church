import { NotificationItem, NavTab } from '../types';
import { StorageManager } from './storage';
import { playNotificationChime, playWarningChime } from './soundHelper';

export interface BroadcastParams {
  category: 'Jadwal' | 'Renungan' | 'Pengumuman' | 'Video';
  action: 'TAMBAH' | 'UPDATE';
  title: string;
  summary?: string;
  targetView: NavTab;
  targetId?: string;
  senderName?: string;
}

/**
 * Broadcasts a floating notification when an Admin publishes or updates
 * Jadwal Ibadah, Renungan Harian, Pengumuman, or Video Terbaru.
 */
export function broadcastContentNotification({
  category,
  action,
  title,
  summary,
  targetView,
  targetId,
  senderName = 'Admin Gereja'
}: BroadcastParams): NotificationItem {
  let notifJudul = '';
  let defaultPesan = '';
  let tipe: 'Peringatan' | 'Informasi' | 'Penting' = 'Informasi';

  if (category === 'Jadwal') {
    tipe = 'Penting';
    notifJudul = action === 'TAMBAH' ? `📅 Jadwal Ibadah Baru: ${title}` : `📅 Jadwal Ibadah Diperbarui: ${title}`;
    defaultPesan = `Informasi jadwal ibadah "${title}" telah ${action === 'TAMBAH' ? 'diterbitkan' : 'diperbarui'} oleh Admin. Klik di sini untuk membuka jadwal & reservasi.`;
  } else if (category === 'Renungan') {
    tipe = 'Informasi';
    notifJudul = action === 'TAMBAH' ? `📖 Renungan Harian Baru: ${title}` : `📖 Renungan Harian Diperbarui: ${title}`;
    defaultPesan = `Renungan firman Tuhan: "${title}" telah dipublikasikan. Klik di sini untuk membaca naskah renungan selengkapnya.`;
  } else if (category === 'Pengumuman') {
    tipe = 'Peringatan';
    notifJudul = action === 'TAMBAH' ? `📢 Pengumuman Baru: ${title}` : `📢 Pengumuman Diperbarui: ${title}`;
    defaultPesan = `Warta jemaat terbaru: "${title}". Klik untuk membaca rincian pengumuman lengkap.`;
  } else if (category === 'Video') {
    tipe = 'Informasi';
    notifJudul = action === 'TAMBAH' ? `🎬 Video Terbaru: ${title}` : `🎬 Tayangan Video Diperbarui: ${title}`;
    defaultPesan = `Video terbaru "${title}" telah ditambahkan ke galeri gereja. Klik untuk menonton video langsung!`;
  }

  const notifId = `NTF-${category.toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const newNotif: NotificationItem = {
    notif_id: notifId,
    user_id: 'ALL',
    tujuan_role: 'ALL',
    judul: notifJudul,
    pesan: summary ? `${summary} (Klik untuk membuka langsung sumbernya)` : defaultPesan,
    status_baca: 'Belum',
    tanggal: dateStr,
    tipe,
    pengirim: senderName,
    is_pinned: true,
    target_view: targetView,
    target_id: targetId,
    kategori_sumber: category
  };

  const currentNotifs = StorageManager.getNotifications();
  // Filter out older notification pointing to the same target if recently published
  const filtered = currentNotifs.filter(
    (n) => !(targetId && n.target_id === targetId && n.target_view === targetView)
  );
  const updated = [newNotif, ...filtered];

  StorageManager.saveNotifications(updated);

  // Play audio chime
  try {
    if (tipe === 'Peringatan' || tipe === 'Penting') {
      playWarningChime();
    } else {
      playNotificationChime();
    }
  } catch (e) {
    // Audio might be constrained until user interacts
  }

  // Trigger system notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(newNotif.judul, {
        body: newNotif.pesan,
        icon: '/favicon.ico'
      });
    } catch (e) {
      // ignore
    }
  }

  // Dispatch global custom events so floating banner and all views react instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cms_content_updated', { detail: newNotif }));
    window.dispatchEvent(
      new CustomEvent('cms_data_changed', { detail: { type: 'notification_added', notif: newNotif } })
    );
  }

  return newNotif;
}
