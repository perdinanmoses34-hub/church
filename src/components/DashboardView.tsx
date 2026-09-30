import React, { useEffect, useState } from 'react';
import {
  User,
  AppSettings,
  Jemaat,
  Persembahan,
  EventSchedule,
  ActivityLog,
  Renungan,
  Pengumuman,
  PrayerRequest,
  NotificationItem,
  FeaturedVideo,
  GalleryItem,
  Doa,
  EventReservation,
  ChatMessage,
  KasPengeluaran
} from '../types';
import { StorageManager } from '../utils/storage';
import { parseSocialVideoUrl } from '../utils/videoHelper';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';
import { playNotificationChime, playWarningChime } from '../utils/soundHelper';
import { triggerStatusBarNotification } from '../utils/firebaseMessaging';
import { broadcastContentNotification } from '../utils/notificationBroadcast';
import { RenunganFullscreenModal } from './RenunganFullscreenModal';
import { FloatingApkDownloadButton } from './FloatingApkDownloadButton';
import { SuperAdminChatModal } from './SuperAdminChatModal';
import { DashboardVisibilityManager } from './dashboard/DashboardVisibilityManager';
import {
  Users,
  DollarSign,
  Calendar,
  Activity,
  PlusCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Megaphone,
  Download,
  Building2,
  HeartHandshake,
  Tv,
  Palette,
  Edit3,
  Settings2,
  Smartphone,
  Monitor,
  ShieldCheck,
  X,
  Check,
  ExternalLink,
  Link2,
  Sparkles,
  BookOpen,
  MessageCircle,
  Heart,
  Send,
  Video,
  Play,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCw,
  LogOut,
  AlertTriangle,
  Home,
  Wallet,
  Upload,
  Image as ImageIcon,
  BellRing,
  CheckCheck,
  Bell,
  Trash2,
  Volume2,
  Maximize2,
  CreditCard,
  Copy,
  CheckCircle2,
  XCircle,
  Ticket,
  Grid,
  FileText,
  BarChart3,
  UserCheck,
  Settings,
  LogIn,
  QrCode,
  HelpCircle,
  Info,
  FileJson,
  BookMarked,
  Eye
} from 'lucide-react';
import { broadcastChurchAnnouncement } from '../utils/pushNotificationService';
import { Website2ApkNotificationGuideModal } from './Website2ApkNotificationGuideModal';
import { AndroidStudioConverterModal } from './AndroidStudioConverterModal';
import { downloadGoogleServicesJsonFile } from '../utils/googleServicesHelper';
import { confirmDialog } from '../utils/confirmDialog';
import { isColorLight } from '../utils/themeHelper';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from './ChartWrapper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardViewProps {
  currentUser: User;
  settings: AppSettings;
  onNavigate: (tab: any) => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  settings,
  onNavigate,
  onUpdateSettings,
  onLogout,
  onOpenLogin
}) => {
  const isGuestMode = currentUser.user_id === 'guest' || currentUser.username === 'guest' || currentUser.role === 'GUEST';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = (currentUser.role === 'ADMIN' || isSuperAdmin) && !isGuestMode;
  const isJemaat = currentUser.role === 'JEMAAT' || isGuestMode;

  const activeTenantId = StorageManager.getActiveTenantId();
  const rawApkUrl = settings.apk_download_url?.trim();
  const churchApkUrl = (rawApkUrl && rawApkUrl !== 'https://drive.google.com/file/d/1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s/view?usp=sharing')
    ? rawApkUrl
    : (activeTenantId === 'CHURCH-001' ? 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing' : '');

  // Refresh & Toast State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState('');

  // Data state initialized lazily for instant flicker-free rendering
  const [jemaatList, setJemaatList] = useState<Jemaat[]>(() => StorageManager.getJemaat());
  const [persembahanList, setPersembahanList] = useState<Persembahan[]>(() => StorageManager.getPersembahan());
  const [eventsList, setEventsList] = useState<EventSchedule[]>(() => StorageManager.getEvents());
  const [renunganList, setRenunganList] = useState<Renungan[]>(() => StorageManager.getRenungan());
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(() => StorageManager.getPengumuman());
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => StorageManager.getPrayerRequests());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => StorageManager.getActivityLogs());
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>(() => StorageManager.getFeaturedVideos());
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(() => StorageManager.getGallery());
  const [reservationsList, setReservationsList] = useState<EventReservation[]>(() => StorageManager.getEventReservations());
  const [isAdminResModalOpen, setIsAdminResModalOpen] = useState<boolean>(false);
  const [isSuperAdminChatModalOpen, setIsSuperAdminChatModalOpen] = useState<boolean>(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');

  // Prayer Request Form State
  const [prayerText, setPrayerText] = useState('');
  const [prayerTopic, setPrayerTopic] = useState('Kesehatan');
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  // Transfer Persembahan Digital State & Handlers
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isQrisZoomModalOpen, setIsQrisZoomModalOpen] = useState(false);
  const [copiedBankNum, setCopiedBankNum] = useState(false);
  const [transferForm, setTransferForm] = useState({
    jenis: 'Persembahan Perpuluhan',
    jumlah: 500000,
    metode_pembayaran: 'Transfer Bank',
    nama_pengirim: currentUser.nama || '',
    keterangan: '',
    bukti_transfer: ''
  });
  const [transferMsg, setTransferMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [kasList, setKasList] = useState<KasPengeluaran[]>(() => StorageManager.getKasPengeluaran());
  const [previewReceiptItem, setPreviewReceiptItem] = useState<Persembahan | null>(null);

  const handleCopyBank = () => {
    const num = settings.rekening_bank_nomor || '527-089-1122';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedBankNum(true);
      setTimeout(() => setCopiedBankNum(false), 2000);
    }
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.jumlah || transferForm.jumlah <= 0) {
      setTransferMsg({ type: 'error', text: 'Jumlah nominal persembahan harus lebih dari Rp 0!' });
      return;
    }

    const allPersembahan = StorageManager.getPersembahan();
    const newTransfer: Persembahan = {
      persembahan_id: `TRS-2026-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().slice(0, 10),
      jenis: transferForm.jenis,
      kategori: transferForm.jenis,
      jumlah: Number(transferForm.jumlah),
      keterangan: transferForm.keterangan || `Transfer persembahan oleh ${transferForm.nama_pengirim}`,
      metode_pembayaran: transferForm.metode_pembayaran,
      nama_pengirim: transferForm.nama_pengirim || currentUser.nama,
      jemaat_id: currentUser.jemaat_id || currentUser.user_id,
      status: 'PENDING',
      bukti_transfer: transferForm.bukti_transfer
    };

    const updated = [newTransfer, ...allPersembahan];
    StorageManager.savePersembahan(updated);
    setPersembahanList(updated);
    StorageManager.logActivity(
      currentUser.username,
      `Mengirim Konfirmasi Transfer Persembahan Rp ${newTransfer.jumlah.toLocaleString('id-ID')}`,
      'Dashboard Home'
    );

    // Kirim notifikasi ke Admin agar muncul chime suara, alert badge, dan toast secara real-time
    const adminNotif: NotificationItem = {
      notif_id: `NTF-TRF-${Date.now()}`,
      user_id: 'ADMIN',
      tujuan_role: 'ADMIN',
      judul: 'Konfirmasi Transfer Persembahan Masuk Baru',
      pesan: `Jemaat ${newTransfer.nama_pengirim} telah mengirimkan konfirmasi transfer ${newTransfer.jenis} sebesar Rp ${newTransfer.jumlah.toLocaleString('id-ID')}. Mohon verifikasi bukti transfer di Dashboard / Keuangan.`,
      status_baca: 'Belum',
      tipe: 'Peringatan',
      tanggal: new Date().toLocaleString('id-ID'),
      pengirim: newTransfer.nama_pengirim
    };
    const currentNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([adminNotif, ...currentNotifs]);

    setTransferMsg({
      type: 'success',
      text: '✅ Konfirmasi transfer persembahan berhasil dikirim! Admin/Bendahara gereja akan segera memverifikasi transaksi Anda.'
    });

    setTimeout(() => {
      setIsTransferModalOpen(false);
      setTransferMsg(null);
      setTransferForm({
        jenis: 'Persembahan Perpuluhan',
        jumlah: 500000,
        metode_pembayaran: 'Transfer Bank',
        nama_pengirim: currentUser.nama || '',
        keterangan: '',
        bukti_transfer: ''
      });
    }, 2500);
  };

  // Handler Verifikasi Persembahan Transfer oleh Admin di Dashboard
  const handleVerifyPersembahan = (persembahanId: string) => {
    const all = StorageManager.getPersembahan();
    const target = all.find((p) => p.persembahan_id === persembahanId);
    if (!target) return;

    const updated = all.map((p) =>
      p.persembahan_id === persembahanId
        ? {
            ...p,
            status: 'TERVERIFIKASI' as const,
            catatan_admin: `Diverifikasi & Diterima oleh ${currentUser.nama} pada ${new Date().toLocaleString('id-ID')}`
          }
        : p
    );
    StorageManager.savePersembahan(updated);
    setPersembahanList(updated);

    // Notifikasi langsung ke Jemaat bersangkutan
    const jemaatNotif: NotificationItem = {
      notif_id: `NTF-JMT-${Date.now()}`,
      user_id: target.jemaat_id || target.nama_pengirim || 'JEMAAT',
      tujuan_role: 'JEMAAT',
      judul: 'Persembahan Transfer Berhasil Diverifikasi',
      pesan: `Puji Tuhan, transfer persembahan Anda (${target.jenis}) sebesar Rp ${target.jumlah.toLocaleString('id-ID')} telah diverifikasi dan resmi tercatat di kas gereja. Terima kasih, Tuhan memberkati persembahan kasih Anda!`,
      status_baca: 'Belum',
      tipe: 'Informasi',
      tanggal: new Date().toLocaleString('id-ID'),
      pengirim: 'Admin Keuangan Gereja'
    };
    const curNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([jemaatNotif, ...curNotifs]);

    StorageManager.logActivity(
      currentUser.username,
      `Verifikasi Persembahan ${target.persembahan_id} (${target.nama_pengirim}) Rp ${target.jumlah.toLocaleString('id-ID')}`,
      'Dashboard Verifikasi Transfer'
    );
    setRefreshToast(`✅ Persembahan ${target.nama_pengirim} Rp ${target.jumlah.toLocaleString('id-ID')} berhasil diverifikasi dan masuk kas!`);
    setTimeout(() => setRefreshToast(''), 3500);
  };

  // Handler Penolakan Persembahan Transfer oleh Admin di Dashboard
  const handleRejectPersembahan = (persembahanId: string) => {
    const all = StorageManager.getPersembahan();
    const target = all.find((p) => p.persembahan_id === persembahanId);
    if (!target) return;

    const alasan = prompt('Masukkan alasan penolakan transfer (akan dikirimkan ke jemaat):', 'Bukti transfer tidak terbaca atau nominal tidak sesuai.');
    if (alasan === null) return;

    const updated = all.map((p) =>
      p.persembahan_id === persembahanId
        ? {
            ...p,
            status: 'DITOLAK' as const,
            catatan_admin: `Ditolak: ${alasan}`
          }
        : p
    );
    StorageManager.savePersembahan(updated);
    setPersembahanList(updated);

    // Notifikasi alasan penolakan ke Jemaat
    const jemaatNotif: NotificationItem = {
      notif_id: `NTF-JMT-REJ-${Date.now()}`,
      user_id: target.jemaat_id || target.nama_pengirim || 'JEMAAT',
      tujuan_role: 'JEMAAT',
      judul: 'Konfirmasi Transfer Persembahan Belum Disetujui',
      pesan: `Transfer persembahan Anda (${target.jenis}) sebesar Rp ${target.jumlah.toLocaleString('id-ID')} belum dapat disetujui. Catatan: ${alasan}. Silakan unggah ulang bukti transfer yang valid.`,
      status_baca: 'Belum',
      tipe: 'Peringatan',
      tanggal: new Date().toLocaleString('id-ID'),
      pengirim: 'Admin Keuangan Gereja'
    };
    const curNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([jemaatNotif, ...curNotifs]);

    StorageManager.logActivity(
      currentUser.username,
      `Menolak Persembahan ${target.persembahan_id} (${target.nama_pengirim}): ${alasan}`,
      'Dashboard Verifikasi Transfer'
    );
    setRefreshToast(`ℹ️ Status transfer persembahan diubah menjadi Ditolak.`);
    setTimeout(() => setRefreshToast(''), 3500);
  };

  // Event Reservation State & Handler
  const [isEventResModalOpen, setIsEventResModalOpen] = useState(false);
  const [selectedEventForRes, setSelectedEventForRes] = useState<EventSchedule | null>(null);
  const [eventResForm, setEventResForm] = useState({
    nama_jemaat: currentUser.nama || '',
    nomor_wa: currentUser.no_hp || '0812-3456-7890',
    jumlah_kursi: 1,
    catatan: ''
  });
  const [eventResMsg, setEventResMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenReservationModal = (evt: EventSchedule | null) => {
    const targetEvt = evt || (eventsList.length > 0 ? eventsList[0] : {
      event_id: 'EVT-2026-001',
      nama: 'Ibadah Raya & Kehadiran Jemaat',
      tanggal: 'Setiap Minggu',
      jam: '07.00 & 10.00 WIB',
      lokasi: 'Gereja Utama',
      kategori: 'Ibadah',
      pembicara: 'Gembala Sidang',
      keterangan: 'Ibadah Tatap Muka & Online'
    });
    setSelectedEventForRes(targetEvt);
    setEventResForm({
      nama_jemaat: currentUser.nama || '',
      nomor_wa: currentUser.no_hp || '0812-3456-7890',
      jumlah_kursi: 1,
      catatan: ''
    });
    setEventResMsg(null);
    setIsEventResModalOpen(true);
  };

  const handleSaveEventReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForRes || !eventResForm.nama_jemaat || !eventResForm.nomor_wa) {
      setEventResMsg({ type: 'error', text: 'Lengkapi nama dan nomor WhatsApp Anda!' });
      return;
    }

    const existingRes = StorageManager.getEventReservations();
    const newRes: EventReservation = {
      reservation_id: `RES-2026-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`,
      event_id: selectedEventForRes.event_id,
      user_id: currentUser.user_id || currentUser.username,
      nama_jemaat: eventResForm.nama_jemaat,
      nomor_wa: eventResForm.nomor_wa,
      jumlah_kursi: Number(eventResForm.jumlah_kursi) || 1,
      catatan: eventResForm.catatan,
      tanggal_reservasi: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'MENUNGGU'
    };

    const updated = [newRes, ...existingRes];
    StorageManager.saveEventReservations(updated);
    setReservationsList(updated);

    // Create Admin notification for instant alert
    const notifForAdmin: NotificationItem = {
      notif_id: `NTF-RES-${Date.now().toString().slice(-4)}`,
      user_id: 'ALL',
      tujuan_role: 'ADMIN',
      judul: '🎟️ Reservasi Kursi Event Baru (Menunggu Konfirmasi)',
      pesan: `${eventResForm.nama_jemaat} mengajukan reservasi ${eventResForm.jumlah_kursi} kursi untuk "${selectedEventForRes.nama}". WA: ${eventResForm.nomor_wa}. Mohon verifikasi & konfirmasi.`,
      status_baca: 'Belum',
      tanggal: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      tipe: 'Penting',
      pengirim: eventResForm.nama_jemaat,
      is_pinned: true
    };
    const currentNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([notifForAdmin, ...currentNotifs]);
    setNotificationsList([notifForAdmin, ...currentNotifs]);

    StorageManager.logActivity(
      currentUser.username,
      `Mengajukan reservasi event "${selectedEventForRes.nama}" sebanyak ${eventResForm.jumlah_kursi} kursi`,
      'Events'
    );

    // Broadcast update event to all views & admin
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'reservation_updated' } }));

    setEventResMsg({
      type: 'success',
      text: `✅ Pengajuan reservasi berhasil! ${eventResForm.jumlah_kursi} kursi telah diajukan dan sedang menunggu konfirmasi admin.`
    });

    setTimeout(() => {
      setIsEventResModalOpen(false);
      setEventResMsg(null);
    }, 2500);
  };

  const [adminResToast, setAdminResToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleUpdateReservationStatus = (id: string, newStatus: 'TERKONFIRMASI' | 'MENUNGGU' | 'DIBATALKAN' | 'DITOLAK') => {
    const target = reservationsList.find((r) => r.reservation_id === id);
    if (!target) return;

    const matchedEvent = eventsList.find((e) => e.event_id === target.event_id);
    const eventName = matchedEvent?.nama || 'Kegiatan Gereja';

    const updated = reservationsList.map((r) => (r.reservation_id === id ? { ...r, status: newStatus } : r));
    setReservationsList(updated);
    StorageManager.saveEventReservations(updated);

    // Send Notification to User
    let notifTitle = '';
    let notifMessage = '';
    let notifType: 'Penting' | 'Peringatan' | 'Informasi' = 'Informasi';

    if (newStatus === 'TERKONFIRMASI') {
      notifTitle = '🎉 Reservasi Kursi Anda DITERIMA!';
      notifMessage = `Puji Tuhan! Reservasi ${target.jumlah_kursi} kursi atas nama ${target.nama_jemaat} untuk acara "${eventName}" telah DIKONFIRMASI & DITERIMA oleh Admin. Sampai jumpa di ibadah!`;
      notifType = 'Penting';
      setAdminResToast({
        type: 'success',
        message: `✅ Reservasi ${target.nama_jemaat} berhasil DIKONFIRMASI! Notifikasi telah dikirim ke jemaat.`
      });
    } else if (newStatus === 'DITOLAK') {
      notifTitle = '⚠️ Status Reservasi Kursi: DITOLAK';
      notifMessage = `Mohon maaf, permohonan reservasi ${target.jumlah_kursi} kursi atas nama ${target.nama_jemaat} untuk acara "${eventName}" DITOLAK oleh Admin karena penyesuaian kuota atau jadwal gereja.`;
      notifType = 'Peringatan';
      setAdminResToast({
        type: 'error',
        message: `⚠️ Reservasi ${target.nama_jemaat} telah DITOLAK. Notifikasi telah dikirim ke jemaat.`
      });
    } else if (newStatus === 'DIBATALKAN') {
      notifTitle = 'ℹ️ Reservasi Kursi Dibatalkan';
      notifMessage = `Reservasi kursi atas nama ${target.nama_jemaat} untuk acara "${eventName}" telah dibatalkan oleh Admin.`;
      notifType = 'Informasi';
      setAdminResToast({
        type: 'info',
        message: `ℹ️ Reservasi ${target.nama_jemaat} dibatalkan.`
      });
    }

    if (notifTitle) {
      const userNotif: NotificationItem = {
        notif_id: `NTF-RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: target.user_id || target.nama_jemaat,
        tujuan_role: 'JEMAAT',
        judul: notifTitle,
        pesan: notifMessage,
        status_baca: 'Belum',
        tanggal: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        tipe: notifType,
        pengirim: 'Admin Gereja',
        is_pinned: true
      };
      const cur = StorageManager.getNotifications();
      StorageManager.saveNotifications([userNotif, ...cur]);
      setNotificationsList([userNotif, ...cur]);
    }

    StorageManager.logActivity(
      currentUser.username,
      `Mengubah status reservasi "${target.nama_jemaat}" (${eventName}) menjadi ${newStatus}`,
      'Reservasi'
    );

    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'reservation_status_changed', status: newStatus } }));

    setTimeout(() => {
      setAdminResToast(null);
    }, 4000);
  };

  // Quick Customizer Modal State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'preview' | 'warta' | 'theme' | 'layout' | 'identity' | 'widgets' | 'media'>('preview');
  const [customizerPreviewDevice, setCustomizerPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [customForm, setCustomForm] = useState<AppSettings>(settings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Quick Warta (Icon Toa) Edit Modal State
  const [isEditWartaModalOpen, setIsEditWartaModalOpen] = useState(false);
  const [wartaText, setWartaText] = useState(settings.jemaat_announcement_text || '');
  const [wartaBannerActive, setWartaBannerActive] = useState(settings.show_pinned_notif_banner !== false);
  const [wartaSuccessMsg, setWartaSuccessMsg] = useState(false);
  const [sendPushOnSaveWarta, setSendPushOnSaveWarta] = useState(true);
  const [isWebsite2ApkGuideOpen, setIsWebsite2ApkGuideOpen] = useState(false);
  const [isAndroidStudioModalOpen, setIsAndroidStudioModalOpen] = useState(false);

  // Sinkronisasi form saat settings berubah
  useEffect(() => {
    setCustomForm(settings);
    setWartaText(settings.jemaat_announcement_text || '');
    setWartaBannerActive(settings.show_pinned_notif_banner !== false);
  }, [settings]);

  const handleSaveQuickWarta = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = {
      ...settings,
      jemaat_announcement_text: wartaText,
      show_pinned_notif_banner: wartaBannerActive
    };
    StorageManager.saveSettings(updated);
    if (onUpdateSettings) {
      onUpdateSettings(updated);
    }
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'settings_updated' } }));
    StorageManager.logActivity(currentUser.username, 'Mengubah teks warta pengumuman gereja (Icon Toa)', 'System Settings');
    
    // Broadcast push notification ke bar Android Website 2 APK jika diaktifkan
    if (sendPushOnSaveWarta && wartaText.trim()) {
      broadcastChurchAnnouncement(
        updated,
        '📢 ' + (updated.nama_gereja || 'Warta Jemaat GKFC'),
        wartaText.trim(),
        '/'
      ).then((res) => {
        if (res.success && res.method === 'onesignal') {
          setRefreshToast('📢 Warta disimpan & Push Notifikasi berhasil terkirim ke bar HP Android!');
        }
      }).catch((err) => console.warn('Push error:', err));
    }

    setWartaSuccessMsg(true);
    setRefreshToast('✅ Warta & Pengumuman Gereja Berhasil Disimpan!');

    if (wartaText.trim()) {
      broadcastContentNotification({
        category: 'Pengumuman',
        action: 'UPDATE',
        title: `Warta Jemaat: ${settings.nama_gereja || 'GKFC Pro'}`,
        summary: wartaText.trim().length > 110 ? `${wartaText.trim().slice(0, 110)}...` : wartaText.trim(),
        targetView: 'pengumuman',
        senderName: currentUser.nama || 'Sekretariat Gereja'
      });
    }

    setIsEditWartaModalOpen(false);
    setTimeout(() => {
      setWartaSuccessMsg(false);
      setRefreshToast('');
    }, 2500);
  };

  // Status sembunyikan Banner & Tombol Melayang APK dari Dashboard
  const [isApkBannerDismissed, setIsApkBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cms_apk_banner_hidden') === 'true';
    } catch {
      return false;
    }
  });
  const [isApkHiddenByX, setIsApkHiddenByX] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cms_apk_button_hidden') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleHiddenChange = (e: any) => {
      if (e?.detail?.hidden !== undefined) {
        setIsApkHiddenByX(Boolean(e.detail.hidden));
      } else {
        try {
          setIsApkHiddenByX(localStorage.getItem('cms_apk_button_hidden') === 'true');
        } catch {
          setIsApkHiddenByX(false);
        }
      }
    };
    window.addEventListener('cms_apk_hidden_changed', handleHiddenChange);
    return () => window.removeEventListener('cms_apk_hidden_changed', handleHiddenChange);
  }, []);

  // Fullscreen Renungan Modal State
  const [selectedRenunganForModal, setSelectedRenunganForModal] = useState<Renungan | null>(null);

  // Toggle limit display for Riwayat Transfer Persembahan Saya
  const [showAllMyTransfers, setShowAllMyTransfers] = useState(false);

  // Notifications State
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() => StorageManager.getNotifications());
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);
  const [selectedNotifForDetail, setSelectedNotifForDetail] = useState<NotificationItem | null>(null);
  const [isCreateNotifModalOpen, setIsCreateNotifModalOpen] = useState(false);
  const [newNotifForm, setNewNotifForm] = useState({
    judul: '',
    pesan: '',
    tipe: 'Peringatan' as 'Peringatan' | 'Informasi' | 'Penting',
    tujuan_role: 'ALL'
  });

  const prevNotifKeysRef = React.useRef<string>('');

  const loadDashboardData = React.useCallback(() => {
    const j = StorageManager.getJemaat();
    setJemaatList((prev) => (prev.length !== j.length || JSON.stringify(prev) !== JSON.stringify(j) ? j : prev));
    const p = StorageManager.getPersembahan();
    setPersembahanList((prev) => (prev.length !== p.length || JSON.stringify(prev) !== JSON.stringify(p) ? p : prev));
    const e = StorageManager.getEvents();
    setEventsList((prev) => (prev.length !== e.length || JSON.stringify(prev) !== JSON.stringify(e) ? e : prev));
    const r = StorageManager.getRenungan();
    setRenunganList((prev) => (prev.length !== r.length || JSON.stringify(prev) !== JSON.stringify(r) ? r : prev));
    const pg = StorageManager.getPengumuman();
    setPengumumanList((prev) => (prev.length !== pg.length || JSON.stringify(prev) !== JSON.stringify(pg) ? pg : prev));
    const pr = StorageManager.getPrayerRequests();
    setPrayerRequests((prev) => (prev.length !== pr.length || JSON.stringify(prev) !== JSON.stringify(pr) ? pr : prev));
    const al = StorageManager.getActivityLogs();
    setActivityLogs((prev) => (prev.length !== al.length || JSON.stringify(prev) !== JSON.stringify(al) ? al : prev));
    const n = StorageManager.getNotifications();
    setNotificationsList((prev) => (prev.length !== n.length || JSON.stringify(prev) !== JSON.stringify(n) ? n : prev));
    const fv = StorageManager.getFeaturedVideos();
    setFeaturedVideos((prev) => (prev.length !== fv.length || JSON.stringify(prev) !== JSON.stringify(fv) ? fv : prev));
    const g = StorageManager.getGallery();
    setGalleryList((prev) => (prev.length !== g.length || JSON.stringify(prev) !== JSON.stringify(g) ? g : prev));
    const res = StorageManager.getEventReservations();
    setReservationsList((prev) => (prev.length !== res.length || JSON.stringify(prev) !== JSON.stringify(res) ? res : prev));
    const k = StorageManager.getKasPengeluaran();
    setKasList((prev) => (prev.length !== k.length || JSON.stringify(prev) !== JSON.stringify(k) ? k : prev));
  }, []);

  // Keyboard shortcut (Escape) to close notification detail modal
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

  // Listen to open notification detail from any component (e.g. Navbar)
  useEffect(() => {
    const handleOpenNotifDetail = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      if (customEvent.detail) {
        setSelectedNotifForDetail(customEvent.detail);
      }
    };
    window.addEventListener('open_notification_detail', handleOpenNotifDetail);
    return () => window.removeEventListener('open_notification_detail', handleOpenNotifDetail);
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleSync = () => {
      loadDashboardData();
    };

    const unsubscribe = StorageManager.subscribe(handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const pollInterval = setInterval(loadDashboardData, 3000);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(pollInterval);
    };
  }, [loadDashboardData]);

  // Automatic Audio Chime trigger when new notifications or warning alerts arrive
  useEffect(() => {
    const activeNotifs = notificationsList.filter(
      (n) =>
        !dismissedNotifIds.includes(n.notif_id) &&
        (n.user_id === 'ALL' ||
          n.user_id === 'JEMAAT' ||
          n.user_id === currentUser.username ||
          n.user_id === currentUser.jemaat_id ||
          (n.user_id && currentUser.nama && n.user_id.toLowerCase().trim() === currentUser.nama.toLowerCase().trim()) ||
          n.tujuan_role === 'ALL' ||
          n.tujuan_role === 'JEMAAT' ||
          isAdmin)
    );

    const currentKeys = activeNotifs.map((n) => n.notif_id).join(',');
    if (currentKeys && currentKeys !== prevNotifKeysRef.current) {
      const hasWarning = activeNotifs.some((n) => n.tipe === 'Peringatan' || n.tipe === 'Penting');
      if (hasWarning) {
        playWarningChime();
      } else {
        playNotificationChime();
      }
      prevNotifKeysRef.current = currentKeys;
    }
  }, [notificationsList, dismissedNotifIds, currentUser.user_id, currentUser.nama, currentUser.username, isAdmin]);

  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifForm.judul.trim() || !newNotifForm.pesan.trim()) return;

    const newNotif: NotificationItem = {
      notif_id: `NTF-${Date.now().toString().slice(-4)}`,
      user_id: newNotifForm.tujuan_role === 'ALL' ? 'ALL' : newNotifForm.tujuan_role,
      judul: newNotifForm.judul,
      pesan: newNotifForm.pesan,
      status_baca: 'Belum',
      tanggal: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      tipe: newNotifForm.tipe,
      pengirim: currentUser.nama || (isSuperAdmin ? 'Super Admin' : 'Admin Sekretariat'),
      is_pinned: true,
      tujuan_role: newNotifForm.tujuan_role
    };

    const updated = [newNotif, ...notificationsList];
    setNotificationsList(updated);
    StorageManager.saveNotifications(updated);
    StorageManager.logActivity(
      currentUser.username,
      `Membuat notifikasi / peringatan: "${newNotif.judul}"`,
      'Notifikasi'
    );

    // Trigger local status bar notification immediately on HP/Desktop
    triggerStatusBarNotification(`🔔 ${newNotif.judul}`, newNotif.pesan);

    // Broadcast push notification to mobile devices via OneSignal & Service Worker
    broadcastChurchAnnouncement(settings, newNotif.judul, newNotif.pesan, '/').catch(() => {});

    try {
      playNotificationChime();
    } catch {}

    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'notification_created', notif: newNotif } }));
    window.dispatchEvent(new Event('storage'));

    setIsCreateNotifModalOpen(false);
    setNewNotifForm({
      judul: '',
      pesan: '',
      tipe: 'Peringatan',
      tujuan_role: 'ALL'
    });
    setRefreshToast('Notifikasi / Peringatan berhasil dibuat dan dikirim ke Dashboard Jemaat!');
    setTimeout(() => setRefreshToast(''), 4000);
  };

  const handleDismissNotification = (id: string) => {
    setDismissedNotifIds((prev) => [...prev, id]);
    const updated = notificationsList.map((n) => (n.notif_id === id ? { ...n, status_baca: 'Sudah' as const } : n));
    setNotificationsList(updated);
    StorageManager.saveNotifications(updated);
    window.dispatchEvent(new Event('cms_data_changed'));
  };

  const handleDismissAllNotifications = (ids: string[]) => {
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...ids])));
    const updated = notificationsList.map((n) => (ids.includes(n.notif_id) ? { ...n, status_baca: 'Sudah' as const } : n));
    setNotificationsList(updated);
    StorageManager.saveNotifications(updated);
    window.dispatchEvent(new Event('cms_data_changed'));
  };

  const handleDeleteNotification = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Notifikasi',
      message: 'Apakah Anda yakin ingin menghapus notifikasi ini dari sistem?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = notificationsList.filter((n) => n.notif_id !== id);
    setNotificationsList(updated);
    StorageManager.saveNotifications(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus notifikasi ID ${id}`, 'Notifikasi');
    window.dispatchEvent(new Event('cms_data_changed'));
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setRefreshToast('Memuat ulang seluruh data sistem & dashboard...');
    loadDashboardData();
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  const totalJemaat = jemaatList.length;
  const totalLaki = jemaatList.filter((j) => j.jenis_kelamin === 'Laki-laki').length;
  const totalPerempuan = jemaatList.filter((j) => j.jenis_kelamin === 'Perempuan').length;

  const verifiedPersembahanList = React.useMemo(() => {
    return persembahanList.filter((p) => p.status === 'TERVERIFIKASI' || !p.status);
  }, [persembahanList]);

  const totalPersembahan = React.useMemo(() => {
    return verifiedPersembahanList.reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  }, [verifiedPersembahanList]);

  const totalKasPenerimaan = React.useMemo(() => {
    return kasList.filter((k) => k.tipe === 'Penerimaan').reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  }, [kasList]);

  const totalPengeluaran = React.useMemo(() => {
    return kasList.filter((k) => k.tipe === 'Pengeluaran').reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  }, [kasList]);

  const saldoKasBersih = React.useMemo(() => {
    return totalPersembahan + totalKasPenerimaan - totalPengeluaran;
  }, [totalPersembahan, totalKasPenerimaan, totalPengeluaran]);

  const pendingPersembahanList = React.useMemo(() => {
    return persembahanList.filter((p) => p.status === 'PENDING');
  }, [persembahanList]);

  const totalKeluarga = React.useMemo(() => {
    return StorageManager.getKeluarga().length;
  }, [jemaatList]);

  // Single Latest Updates for Jemaat Focus Mode
  const latestRenungan = renunganList.length > 0 ? renunganList[0] : null;
  const latestPengumuman = pengumumanList.length > 0 ? pengumumanList[0] : null;
  const latestEvent = eventsList.length > 0 ? eventsList[0] : null;

  // Combined list of all available videos from Featured Videos, Galeri Videos, and Settings
  const allDashboardVideos = React.useMemo(() => {
    const combined: {
      id: string;
      judul: string;
      video_url: string;
      kategori: string;
      platform: string;
      is_active?: boolean;
    }[] = [];

    const addedUrls = new Set<string>();

    // 1. Featured Social Videos (Managed in Galeri -> Video Media Sosial / Stream)
    featuredVideos.forEach((v) => {
      const url = v.video_url ? v.video_url.trim() : '';
      if (url && parseSocialVideoUrl(url).isValid && !addedUrls.has(url)) {
        addedUrls.add(url);
        combined.push({
          id: v.video_id,
          judul: v.judul,
          video_url: url,
          kategori: v.kategori || 'Video Utama',
          platform: v.platform || 'YouTube',
          is_active: v.is_active
        });
      }
    });

    // 2. Videos uploaded in Galeri (where tipe === 'Video' or video_url exists)
    galleryList.forEach((g) => {
      const url = (g.video_url || (g.tipe === 'Video' ? g.foto : '')).trim();
      if (url && parseSocialVideoUrl(url).isValid && !addedUrls.has(url)) {
        addedUrls.add(url);
        combined.push({
          id: g.gallery_id,
          judul: g.judul,
          video_url: url,
          kategori: g.kategori || 'Galeri Video',
          platform: 'YouTube'
        });
      }
    });

    // 3. Fallback Settings Video URL
    if (settings.video_url && parseSocialVideoUrl(settings.video_url).isValid) {
      const sUrl = settings.video_url.trim();
      if (!addedUrls.has(sUrl)) {
        addedUrls.add(sUrl);
        combined.unshift({
          id: 'SETTING-VID',
          judul: settings.video_title || 'Tayangan Video Terbaru',
          video_url: sUrl,
          kategori: 'Ibadah Utama',
          platform: 'YouTube',
          is_active: true
        });
      }
    }

    return combined;
  }, [featuredVideos, galleryList, settings.video_url, settings.video_title]);

  // Determine current active video item & video title
  const activeSelectedVideo = allDashboardVideos.find((v) => v.video_url === activeVideoUrl);
  const activeFeatured = allDashboardVideos.find((v) => v.is_active) || allDashboardVideos[0];
  const currentVideoItem = activeSelectedVideo || activeFeatured;

  const rawVideoUrl = activeVideoUrl || currentVideoItem?.video_url || settings.video_url || '';
  const currentVideoUrl = rawVideoUrl && rawVideoUrl.includes('5qap5aO4i9A')
    ? 'https://www.youtube.com/watch?v=wX2S6AebnI8'
    : rawVideoUrl;
  const parsedVideo = parseSocialVideoUrl(currentVideoUrl);
  const currentVideoDisplayTitle = currentVideoItem?.judul || settings.video_title || 'Tayangan Ibadah Raya & Khotbah Terbaru';

  // Stable User Avatar Source to prevent flashing/kedipan
  const userAvatarSrc = React.useMemo(() => {
    if (currentUser.foto) return currentUser.foto;
    const jId = currentUser.jemaat_id;
    const jName = currentUser.nama?.toLowerCase();

    const foundInState = jemaatList.find(
      (j) => (jId && j.jemaat_id === jId) || (jName && j.nama_lengkap.toLowerCase() === jName)
    );
    if (foundInState?.foto) return foundInState.foto;

    const storedJemaat = StorageManager.getJemaat();
    const foundInStorage = storedJemaat.find(
      (j) => (jId && j.jemaat_id === jId) || (jName && j.nama_lengkap.toLowerCase() === jName)
    );
    if (foundInStorage?.foto) return foundInStorage.foto;

    return settings.logo || DEFAULT_CHURCH_LOGO;
  }, [currentUser.foto, currentUser.jemaat_id, currentUser.nama, jemaatList, settings.logo]);

  // Submit Jemaat Prayer Request
  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    const newPrayer: PrayerRequest = {
      prayer_id: `DOA-${Date.now()}`,
      jemaat_name: currentUser.nama,
      topik: prayerTopic,
      permohonan: prayerText,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Diterima',
      is_private: true
    };

    const updated = [newPrayer, ...prayerRequests];
    StorageManager.savePrayerRequests(updated);
    setPrayerRequests(updated);

    // Sync to Doa array so it appears in the Agenda / Permohonan Doa menu tab!
    const newDoa: Doa = {
      doa_id: `DOA-2026-${Date.now().toString().slice(-4)}`,
      nama_pemohon: currentUser.nama || 'Jemaat Mandiri',
      kategori: prayerTopic,
      isi_permohonan: prayerText,
      tanggal: new Date().toISOString().slice(0, 10),
      status: 'Proses Doa'
    };
    const currentDoaList = StorageManager.getDoa();
    StorageManager.saveDoa([newDoa, ...currentDoaList]);

    // Add activity log
    StorageManager.logActivity(
      currentUser.nama,
      `Mengirim permohonan doa (${prayerTopic})`,
      'Permohonan Doa'
    );

    // Kirim notifikasi yang muncul pada ADMIN
    const notifForAdmin: NotificationItem = {
      notif_id: `NTF-DOA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: 'ADMIN',
      tujuan_role: 'ADMIN',
      judul: '🙏 Permohonan Doa Baru Masuk',
      pesan: `Permohonan doa baru dari jemaat ${currentUser.nama || 'Jemaat'} (${prayerTopic}): "${prayerText}". Mohon didukung dalam doa bersama majelis.`,
      status_baca: 'Belum',
      tanggal: new Date().toISOString().slice(0, 10),
      tipe: 'Penting',
      pengirim: currentUser.nama || 'Jemaat'
    };
    const currentNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([notifForAdmin, ...currentNotifs]);
    setNotificationsList([notifForAdmin, ...currentNotifs]);
    playNotificationChime();

    window.dispatchEvent(new Event('cms_data_changed'));

    setPrayerText('');
    setPrayerSubmitted(true);
    setTimeout(() => setPrayerSubmitted(false), 4000);
  };

  // Tandai Permohonan Doa Selesai oleh Admin & Kirim Notifikasi ke Jemaat
  const handleAdminSelesaiDoa = (prayerId: string) => {
    const target = prayerRequests.find((p) => p.prayer_id === prayerId);
    const updated = prayerRequests.map((p) =>
      p.prayer_id === prayerId ? { ...p, status: 'Terjawab' as const } : p
    );
    setPrayerRequests(updated);
    StorageManager.savePrayerRequests(updated);

    // Sync to Doa list
    const doaList = StorageManager.getDoa();
    const updatedDoa = doaList.map((d) => {
      if (target && (d.nama_pemohon === target.jemaat_name || d.isi_permohonan === target.permohonan)) {
        return { ...d, status: 'Selesai Doa' as const };
      }
      return d;
    });
    StorageManager.saveDoa(updatedDoa);

    if (target) {
      const jemaatNotif: NotificationItem = {
        notif_id: `NTF-DOA-DONE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: target.jemaat_name,
        tujuan_role: 'JEMAAT',
        judul: '🕊️ Pokok Doa Anda Sudah Didoakan',
        pesan: `Puji Tuhan, Saudara/i ${target.jemaat_name}. Permohonan doa Anda mengenai "${target.topik}": "${target.permohonan}" telah selesai didoakan oleh Pelayan & Tim Pendoa Gereja. "Doa orang yang benar, bila dengan yakin didoakan, sangat besar kuasanya." (Yakobus 5:16)`,
        status_baca: 'Belum',
        tanggal: new Date().toISOString().slice(0, 10),
        tipe: 'Penting',
        pengirim: currentUser.nama || 'Pelayan & Tim Pendoa Gereja'
      };
      const curNotifs = StorageManager.getNotifications();
      StorageManager.saveNotifications([jemaatNotif, ...curNotifs]);
      setNotificationsList([jemaatNotif, ...curNotifs]);
      playNotificationChime();

      StorageManager.logActivity(
        currentUser.nama,
        `Mendoakan & menyelesaikan permohonan doa jemaat: ${target.jemaat_name}`,
        'Permohonan Doa'
      );
    }
    window.dispatchEvent(new Event('cms_data_changed'));
  };

  // Quick Save Customizer Settings
  const handleSaveCustomizer = (e: React.FormEvent) => {
    e.preventDefault();
    StorageManager.saveSettings(customForm);
    if (onUpdateSettings) {
      onUpdateSettings(customForm);
    }
    if (customForm.show_apk_download_button !== false) {
      try {
        localStorage.removeItem('cms_apk_button_hidden');
        localStorage.removeItem('cms_apk_banner_hidden');
        setIsApkHiddenByX(false);
        setIsApkBannerDismissed(false);
        window.dispatchEvent(new CustomEvent('cms_apk_hidden_changed', { detail: { hidden: false } }));
      } catch (err) {
        // ignore
      }
    }
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'settings_updated' } }));
    StorageManager.logActivity(currentUser.username, 'Mengubah kustomisasi portal & dashboard jemaat', 'System Settings');

    // Auto broadcast push notification jika warta pengumuman diubah
    if (customForm.onesignal_auto_push_announcement !== false && customForm.jemaat_announcement_text?.trim() && customForm.jemaat_announcement_text !== settings.jemaat_announcement_text) {
      broadcastChurchAnnouncement(
        customForm,
        '📢 ' + (customForm.nama_gereja || 'Warta Jemaat GKFC'),
        customForm.jemaat_announcement_text.trim(),
        '/'
      ).catch((err) => console.warn('Push broadcast error:', err));
    }

    setSaveSuccessMsg(true);
    setRefreshToast('✅ Perubahan Kustomisasi Dashboard & Portal Jemaat Berhasil Disimpan!');
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsCustomizerOpen(false);
      setTimeout(() => setRefreshToast(''), 3500);
    }, 1200);
  };

  // Dynamic Theme Preset Style Classes & Density
  const isLightSystem =
    settings.theme_preset !== 'DARK_SLATE' &&
    settings.theme_preset !== 'MIDNIGHT_BLUE' &&
    settings.theme_preset !== 'DEEP_PURPLE' &&
    settings.theme_preset !== 'FOREST_GREEN' &&
    settings.theme_preset !== 'WARM_GOLD';

  const getCardStyleClass = () => {
    const cardBg = settings.jemaat_cards_bg || 'DEFAULT_GLASS';
    const cardStyle = settings.card_style || 'GLASS';

    let base = isLightSystem
      ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-lg text-slate-800'
      : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white';

    if (cardBg && cardBg !== 'DEFAULT_GLASS') {
      switch (cardBg) {
        case 'GRADIENT_EMERALD':
          base = isLightSystem
            ? 'bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/70 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-950/90 border border-emerald-500/40 shadow-xl text-white';
          break;
        case 'GRADIENT_INDIGO':
          base = isLightSystem
            ? 'bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/40 shadow-xl text-white';
          break;
        case 'GRADIENT_PURPLE':
          base = isLightSystem
            ? 'bg-gradient-to-br from-purple-50/90 via-white to-slate-50 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-purple-950/90 border border-purple-500/40 shadow-xl text-white';
          break;
        case 'GRADIENT_GOLD':
          base = isLightSystem
            ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 shadow-xl text-white';
          break;
        case 'OCEAN_BLUE':
          base = isLightSystem
            ? 'bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/60 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-cyan-950/90 border border-cyan-500/40 shadow-xl text-white';
          break;
        case 'OBSIDIAN_NIGHT':
          base = isLightSystem
            ? 'bg-slate-900 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)] text-white'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 border border-slate-700/80 shadow-2xl text-white';
          break;
        case 'SOLID_SLATE':
          base = isLightSystem
            ? 'bg-slate-100 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)] text-slate-900'
            : 'bg-slate-900 border border-slate-800 shadow-xl text-white';
          break;
        case 'NEON_CYAN':
          base = isLightSystem
            ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.14),0_8px_20px_rgba(0,0,0,0.09)] text-slate-800'
            : 'bg-cyan-950/50 border border-cyan-400/50 shadow-lg text-white';
          break;
        default:
          base = isLightSystem
            ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white';
          break;
      }
    } else {
      switch (cardStyle) {
        case 'SOLID':
          base = isLightSystem
            ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-slate-900 border border-slate-800 shadow-xl text-white';
          break;
        case 'NEON':
          base = isLightSystem
            ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.14),0_8px_20px_rgba(0,0,0,0.09)] text-slate-800'
            : 'bg-slate-900/90 border border-slate-700 shadow-lg text-white';
          break;
        case 'FLAT':
          base = isLightSystem
            ? 'bg-slate-50 !border-0 shadow-none text-slate-800'
            : 'bg-slate-900/60 border border-slate-700/60 shadow-none text-white';
          break;
        case 'GLASS':
        default:
          base = isLightSystem
            ? 'bg-white/95 backdrop-blur-md !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)] text-slate-800'
            : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white';
          break;
      }
    }

    const borderAccent = settings.card_border_accent || 'NONE';
    let borderAccentClass = '';
    if (borderAccent === 'ACCENT_GLOW') borderAccentClass = 'shadow-lg shadow-black/15';

    const density = settings.card_size || 'NORMAL';
    let padding = 'p-3 sm:p-5 md:p-6';
    if (density === 'COMPACT') padding = 'p-2 sm:p-3.5 md:p-4';
    if (density === 'SPACIOUS') padding = 'p-3.5 sm:p-6 md:p-8';

    return `${base} ${borderAccentClass} ${padding}`;
  };

  const cardStyleClass = getCardStyleClass();

  // Chart Data: Financial trend
  const hasKeuanganData = persembahanList.length > 0;
  const financialChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Juli'],
    datasets: [
      {
        fill: true,
        label: 'Persembahan Minggu & Perpuluhan (Rp)',
        data: hasKeuanganData
          ? [42000000, 48500000, 51000000, 62000000, 58000000, 71000000, totalPersembahan]
          : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.4
      }
    ]
  };

  const financialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Rp ${context.raw.toLocaleString('id-ID')}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } }
    }
  };

  // Doughnut Chart Data: Wilayah Distribution
  const wilayahCount: { [key: string]: number } = {};
  jemaatList.forEach((j) => {
    const w = j.wilayah || 'Lainnya';
    wilayahCount[w] = (wilayahCount[w] || 0) + 1;
  });

  const wilayahChartData = {
    labels: Object.keys(wilayahCount),
    datasets: [
      {
        data: Object.values(wilayahCount),
        backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        borderWidth: 0
      }
    ]
  };

  let widthClass = 'w-full px-0 sm:px-1';
  if (settings.jemaat_card_width === 'FULL') widthClass = 'w-full px-0 sm:px-1';
  if (settings.jemaat_card_width === 'COMPACT' || settings.jemaat_card_width === 'MOBILE_COMPACT') widthClass = 'max-w-4xl mx-auto px-1 sm:px-3';
  if (settings.jemaat_card_width === 'CONTAINED') widthClass = 'max-w-7xl mx-auto px-1 sm:px-3';

  let bannerBgClass = 'bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 border-0';
  switch (settings.jemaat_banner_bg) {
    case 'GRADIENT_GOLD':
      bannerBgClass = 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-0';
      break;
    case 'GRADIENT_PURPLE':
      bannerBgClass = 'bg-gradient-to-r from-purple-950 via-fuchsia-900 to-purple-950 border-0';
      break;
    case 'OBSIDIAN_NIGHT':
      bannerBgClass = 'bg-gradient-to-r from-slate-950 via-neutral-900 to-slate-950 border-0';
      break;
    case 'OCEAN_BLUE':
      bannerBgClass = 'bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-950 border-0';
      break;
    case 'GRADIENT_EMERALD':
    case 'GRADIENT_INDIGO':
    default:
      bannerBgClass = 'bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 border-0';
      break;
  }

  return (
    <div className={`space-y-2 sm:space-y-4 md:space-y-6 pb-2 sm:pb-4 transition-all duration-300 ${widthClass}`}>
      {/* Welcome Card Banner with Dynamic Custom Header (Teal Theme) */}
      {settings.show_header_banner !== false ? (
        <div
          className={`relative rounded-2xl sm:rounded-3xl ${bannerBgClass} p-5 sm:p-7 md:p-8 overflow-hidden text-white transition-all duration-300 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.22),0_8px_24px_rgba(0,0,0,0.32)]`}
          style={{ border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.32)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={userAvatarSrc}
                  alt="Logo/Avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                  }}
                  className="w-16 h-16 rounded-2xl object-cover !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.4)] bg-slate-900"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-400 ring-2 ring-teal-950" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  {isGuestMode ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-300 shrink-0" />
                      Mode Tamu / Pengunjung
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/25 text-teal-100 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-300" />
                      Role: {currentUser.role}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
                  {isGuestMode ? 'Shalom, Tamu & Pengunjung!' : `Shalom, ${currentUser.nama}!`}
                </h2>
                <p className="text-teal-100/90 text-xs sm:text-sm mt-0.5">
                  {settings.header_title || settings.nama_gereja} &bull;{' '}
                  <span className="text-teal-200/80">{settings.header_subtitle || 'Portal Informasi Utama'}</span>
                </p>
              </div>
            </div>

            {/* Action & Customizer Buttons Header */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Tombol Login khusus Mode Tamu */}
              {isGuestMode && onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="col-span-2 sm:col-span-1 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-black shadow-lg shadow-teal-700/30 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto active:scale-95 shrink-0"
                  title="Masuk ke Akun Jemaat / Admin"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                  <span className="truncate">Masuk / Login Akun</span>
                </button>
              )}

              {/* Tombol Chat / Support SuperAdmin (Khusus Admin/SuperAdmin, disembunyikan untuk Jemaat) */}
              {!isJemaat && (
                <button
                  onClick={() => setIsSuperAdminChatModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black shadow-lg shadow-teal-700/30 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto active:scale-95"
                  title="Hubungi SuperAdmin / Support Billing Aplikasi"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-teal-200 fill-current shrink-0" />
                  <span className="truncate">Chat SuperAdmin</span>
                </button>
              )}

              {/* Tombol Refresh Data untuk Semua User */}
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="px-3 py-2 rounded-xl bg-teal-700/40 hover:bg-teal-700/60 text-teal-100 text-xs font-semibold !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
                title="Refresh Data Dashboard"
              >
                <RotateCw className={`w-3.5 h-3.5 text-teal-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="truncate">{isRefreshing ? 'Memuat...' : 'Refresh Data'}</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => setIsCreateNotifModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.2)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                    title="Buat Notifikasi atau Peringatan Resmi untuk Jemaat"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    <span className="truncate">Buat Notifikasi</span>
                  </button>

                  <button
                    onClick={() => setIsCustomizerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-teal-900/30 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <Palette className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Custom Tampilan</span>
                  </button>
                </>
              )}

              {settings.show_quick_actions !== false && !isJemaat && (
                <>
                  <button
                    onClick={() => onNavigate('jemaat')}
                    className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/30 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Tambah Jemaat</span>
                  </button>
                  <button
                    onClick={() => onNavigate('keuangan')}
                    className="px-3 py-2 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 text-teal-100 text-xs font-semibold !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span className="truncate">Persembahan</span>
                  </button>
                </>
              )}

              <button
                onClick={() => onNavigate('laporan')}
                className="px-3 py-2 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 text-teal-100 text-xs font-semibold !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span className="truncate">Cetak Laporan</span>
              </button>
            </div>
          </div>

          {/* Refresh Notification Toast Banner */}
          {refreshToast && (
            <div className="mt-4 p-3 bg-teal-500/20 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] text-teal-100 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-300" />
                <span>{refreshToast}</span>
              </div>
              <span className="text-[10px] text-teal-200 font-mono">Live Sync Done</span>
            </div>
          )}
        </div>
      ) : (
        /* Minimalist fallback toolbar when header banner is disabled by admin */
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-teal-950/90 border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.22),0_8px_24px_rgba(0,0,0,0.32)] text-white backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {settings.header_title || settings.nama_gereja}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isGuestMode ? 'Mode Tamu / Pengunjung' : `Shalom, ${currentUser.nama}`} &bull; Role: {currentUser.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh Data Dashboard"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Custom Tampilan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Banner Warta / Pengumuman Ticker Berjalan Tersemat (Icon Toa) */}
      {settings.show_pinned_notif_banner !== false && (settings.jemaat_announcement_text || isAdmin) && (
        <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl ${
          isLightSystem
            ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 text-amber-950 shadow-xs'
            : 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 text-amber-200 shadow-lg'
        } flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in backdrop-blur-md`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className={`p-2 sm:p-2.5 rounded-xl ${
              isLightSystem ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
            } shrink-0 shadow-inner`}>
              <Megaphone className={`w-4 h-4 sm:w-5 sm:h-5 animate-pulse ${isLightSystem ? 'text-amber-600' : 'text-amber-400'}`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-[10px] uppercase font-black tracking-wider ${isLightSystem ? 'text-amber-800' : 'text-amber-400'}`}>
                  Warta &amp; Pengumuman Gereja:
                </span>
                {isAdmin && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                    isLightSystem ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' : 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  }`}>
                    Banner Toa
                  </span>
                )}
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${isLightSystem ? 'text-slate-800' : 'text-slate-100'} break-words leading-snug block`}>
                {settings.jemaat_announcement_text || (isAdmin ? '(Teks warta belum diisi. Klik tombol "Edit Warta" untuk menulis pengumuman)' : '')}
              </span>
            </div>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setWartaText(settings.jemaat_announcement_text || '');
                setWartaBannerActive(settings.show_pinned_notif_banner !== false);
                setIsEditWartaModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
              title="Edit teks pengumuman toa ini langsung"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Warta (Toa)</span>
            </button>
          )}
        </div>
      )}

      {/* BANNER DEDIKASI KHUSUS TAMU / PENGUNJUNG UNTUK PROPORSI PROMINEN & RESPONSIF */}
      {isGuestMode && (
        <div className="p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-2 border-indigo-500/50 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0 shadow-inner">
              <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Akses Portal Gereja Mode Tamu / Pengunjung
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                  Belum Login
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Anda saat ini mengakses ringkasan publik dashboard. Silakan masuk / login dengan akun Jemaat atau Admin Anda untuk membuka seluruh fitur &amp; portal pelayanan secara penuh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="w-full md:w-auto py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 border border-indigo-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4 text-indigo-200" />
                <span className="whitespace-nowrap">Masuk / Login Sekarang</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MENU UTAMA & MODUL PELAYANAN (HANYA DITAMPILKAN UNTUK ADMIN DI DASHBOARD HOME, UNTUK JEMAAT DIALIKAN KE MENU LAINNYA) */}
      {isAdmin && settings.show_admin_quick_access !== false && (
        <div className={`p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl ${cardStyleClass} ${isLightSystem ? 'text-slate-800' : 'text-white'} space-y-2.5 sm:space-y-4`}>
          <div className={`flex items-center justify-between pb-2.5 sm:pb-3 border-b ${isLightSystem ? 'border-slate-100' : 'border-white/10'}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'} tracking-wide`}>
                  Panel Quick Access Admin
                </h3>
                <p className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>Akses cepat manajemen sistem &amp; modul pelayanan</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ${isLightSystem ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'} text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider`}>
              Admin Shortcuts
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
            {/* 1. Jemaat & KK */}
            <button
              onClick={() => onNavigate('jemaat')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 hover:from-indigo-900/90 hover:to-indigo-950 border border-indigo-500/30 hover:border-indigo-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-blue-950/70 text-blue-200 border border-blue-500/40'}`}>
                  {jemaatList.length} Jiwa
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-300'} transition-colors block`}>
                  Data Jemaat &amp; KK
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>Database, KK &amp; KTA</span>
              </div>
            </button>

            {/* 2. Keuangan & Kas */}
            <button
              onClick={() => onNavigate('keuangan')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 hover:from-emerald-900/90 hover:to-emerald-950 border border-emerald-500/30 hover:border-emerald-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-emerald-950/70 text-emerald-200 border border-emerald-500/40'}`}>
                  Kas &amp; Transfer
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-emerald-600' : 'text-white group-hover:text-emerald-300'} transition-colors block`}>
                  Keuangan &amp; Kas
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>Kas, Persembahan &amp; Bank</span>
              </div>
            </button>

            {/* 3. Administrasi & Sakramen */}
            <button
              onClick={() => onNavigate('administrasi')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-slate-950 hover:from-purple-900/90 hover:to-purple-950 border border-purple-500/30 hover:border-purple-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-purple-950/70 text-purple-200 border border-purple-500/40'}`}>
                  Surat Sakramen
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-purple-600' : 'text-white group-hover:text-purple-300'} transition-colors block`}>
                  Administrasi Surat
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>Baptis, Sidi &amp; Pernikahan</span>
              </div>
            </button>

            {/* 4. Agenda & Reservasi */}
            <button
              onClick={() => onNavigate('agenda')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 hover:from-amber-900/90 hover:to-amber-950 border border-amber-500/30 hover:border-amber-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-950/70 text-amber-200 border border-amber-500/40'}`}>
                  {eventsList.length} Event
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-amber-600' : 'text-white group-hover:text-amber-300'} transition-colors block`}>
                  Agenda &amp; Event
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>Jadwal &amp; Reservasi Kursi</span>
              </div>
            </button>

            {/* 5. Ruang Chat Jemaat */}
            <button
              onClick={() => onNavigate('chat')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 hover:from-indigo-900/90 hover:to-indigo-950 border border-indigo-500/30 hover:border-indigo-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-indigo-950/70 text-indigo-200 border border-indigo-500/40'}`}>
                  Live Chat
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'} transition-colors block`}>
                  Ruang Chat
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>Komunitas Jemaat</span>
              </div>
            </button>

            {/* 6. Alkitab & Pujian */}
            <button
              onClick={() => onNavigate('pustaka')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 hover:from-amber-900/90 hover:to-amber-950 border border-amber-500/30 hover:border-amber-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500 text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                  <BookMarked className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-amber-950/70 text-amber-200 border border-amber-500/40'}`}>
                  Alkitab &amp; Lagu
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-amber-600' : 'text-white group-hover:text-amber-300'} transition-colors block`}>
                  Alkitab &amp; Pujian
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>KJ, NKB, PKJ, Lagu</span>
              </div>
            </button>

            {/* 7. Menu Lainnya */}
            <button
              onClick={() => onNavigate('lainnya')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isLightSystem
                  ? 'bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md'
                  : 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-950 hover:from-cyan-900/90 hover:to-cyan-950 border border-cyan-500/30 hover:border-cyan-400 shadow-xl'
              } text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-cyan-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${isLightSystem ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/40'}`}>
                  All Modul
                </span>
              </div>
              <div>
                <span className={`font-extrabold text-xs sm:text-sm ${isLightSystem ? 'text-slate-900 group-hover:text-cyan-600' : 'text-white group-hover:text-cyan-300'} transition-colors block`}>
                  Menu Lainnya
                </span>
                <span className={`text-[10px] ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium block mt-0.5`}>Semua Modul &amp; Fitur</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating notifications are rendered globally across all pages by FloatingNotificationBanner in App.tsx */}

      {/* JEMAAT FOCUS MODE: Single Latest Update Panel & Statistics Cards */}
      {isJemaat && (
        <div className="space-y-2 sm:space-y-3 md:space-y-5">
          {/* STATISTIK INFORMASI JEMAAT (STRICTLY 2 BARIS x 2 KARTU KOTAK) */}
          {settings.show_stat_cards !== false && (
            <div className="space-y-1.5 sm:space-y-2.5 md:space-y-4">
            {/* Baris Pertama: Total Jemaat (Kotak 1) & Total KK (Kotak 2) */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 md:gap-4">
              {/* Kartu 1: Total Jemaat */}
              <div className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Total Jemaat</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-blue-50 text-blue-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'} shadow-xs shrink-0`}>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-xl sm:text-3xl font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{totalJemaat}</span>
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Jiwa</span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} flex items-center justify-between text-[9px] sm:text-[11px] gap-1`}>
                  <span>L: <strong className={isLightSystem ? 'text-blue-600 font-bold' : 'text-indigo-300 font-bold'}>{totalLaki}</strong></span>
                  <span>P: <strong className={isLightSystem ? 'text-pink-600 font-bold' : 'text-pink-300 font-bold'}>{totalPerempuan}</strong></span>
                </div>
              </div>

              {/* Kartu 2: Total Kepala Keluarga (KK) */}
              <div 
                className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}
                title="Total Kartu Keluarga unik. Jemaat dengan Nomor KK yang sama dihitung sebagai satu keluarga."
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Total KK</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-purple-50 text-purple-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'} shadow-xs shrink-0`}>
                    <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-xl sm:text-3xl font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{totalKeluarga}</span>
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Keluarga</span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} text-[9px] sm:text-[11px] truncate`}>
                  <span>Kartu Keluarga (Unik)</span>
                </div>
              </div>
            </div>

            {/* Baris Kedua: Kas Persembahan (Kotak 3) & Jadwal & Event (Kotak 4) */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 md:gap-4">
              {/* Kartu 3: Kas Persembahan */}
              <div
                className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Kas Persembahan</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-emerald-50 text-emerald-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} shadow-xs shrink-0`}>
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                    Rp {saldoKasBersih.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} text-[9px] sm:text-[11px] flex items-center justify-between`}>
                  <span>Saldo Kas Bersih</span>
                  <span className="text-emerald-600 dark:text-emerald-300 font-semibold">Realtime</span>
                </div>
              </div>

              {/* Kartu 4: Jadwal & Event */}
              <div
                className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Jadwal & Event</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-amber-50 text-amber-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} shadow-xs shrink-0`}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-xl sm:text-3xl font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{eventsList.length}</span>
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Agenda</span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} text-[9px] sm:text-[11px] truncate`}>
                  <span>Agenda Ibadah & Event</span>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Banner Download Aplikasi Mobile Android (.APK) Khusus HP Android (Hanya muncul jika sudah login ke gereja masing-masing) */}
          {!isGuestMode && (churchApkUrl || isAdmin) && settings.show_apk_banner !== false && settings.show_apk_download_button !== false && !isApkBannerDismissed && (
            <div
              className="relative p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-teal-950/90 border-0 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-white animate-fade-in"
              style={{ border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.32)' }}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner shrink-0 mt-0.5">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                        Khusus HP Android
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" /> File Aman &amp; Resmi {settings.nama_gereja}
                      </span>
                    </div>
                    {/* Tombol tutup banner mobile yang rapi dan sejajar */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsApkBannerDismissed(true);
                        try {
                          localStorage.setItem('cms_apk_banner_hidden', 'true');
                        } catch (e) {}
                      }}
                      className="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-md shrink-0 sm:hidden"
                      title="Sembunyikan Banner APK"
                      aria-label="Tutup banner"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white leading-snug">
                    Download Aplikasi Mobile Android (.APK)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {churchApkUrl
                      ? `Instal aplikasi resmi ${settings.nama_gereja} di ponsel Android untuk akses cepat renungan, warta & notifikasi ibadah.`
                      : 'Admin gereja dapat menempelkan link Google Drive APK di menu pengaturan agar jemaat dapat langsung mengunduhnya.'}
                  </p>
                </div>
              </div>

              {/* Tombol tutup banner desktop */}
              <button
                type="button"
                onClick={() => {
                  setIsApkBannerDismissed(true);
                  try {
                    localStorage.setItem('cms_apk_banner_hidden', 'true');
                  } catch (e) {}
                }}
                className="hidden sm:block absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-lg z-10"
                title="Sembunyikan Banner APK dari Dashboard (x)"
                aria-label="Tutup banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 sm:mr-8 pt-0.5 sm:pt-0">
                {churchApkUrl ? (
                  <a
                    href={churchApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
                  >
                    <Download className="w-4 h-4 animate-pulse shrink-0" />
                    <span>Unduh File .APK</span>
                  </a>
                ) : isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomizerOpen(true);
                      setCustomizerTab('media');
                    }}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg border border-amber-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    <Link2 className="w-4 h-4 shrink-0" />
                    <span>Tempelkan Link APK Drive</span>
                  </button>
                ) : null}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      downloadGoogleServicesJsonFile('com.gkfc', settings);
                      setRefreshToast('📥 File google-services.json berhasil didownload!');
                      setTimeout(() => setRefreshToast(''), 3500);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg border border-indigo-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                    title="Download google-services.json untuk Website 2 APK Builder Pro v5.0"
                  >
                    <FileJson className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Download google-services.json</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {settings.show_jemaat_quick_menu !== false && (
            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${
              isLightSystem
                ? 'bg-white border border-slate-200/90 shadow-sm text-slate-800'
                : 'bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 text-white shadow-xl'
            } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${isLightSystem ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'} shadow-inner shrink-0`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-sm sm:text-base ${isLightSystem ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                    Portal Informasi Terfokus Jemaat
                  </h3>
                  <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} mt-0.5`}>
                    Akses cepat renungan harian, pengumuman resmi &amp; tayangan ibadah gereja
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => onNavigate('renungan')}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] sm:text-xs border border-indigo-500/30 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap text-center"
                >
                  <BookOpen className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                  <span>Renungan</span>
                </button>
                <button
                  onClick={() => onNavigate('pengumuman')}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-xs border border-emerald-500/30 shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap text-center"
                >
                  <Megaphone className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                  <span>Pengumuman</span>
                </button>
                <button
                  onClick={() => onNavigate('media')}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] sm:text-xs border border-rose-500/30 shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap text-center"
                >
                  <Tv className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                  <span>Streaming</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* 1. Latest Renungan Utama */}
            {settings.show_renungan_widget !== false && (
              <div
                className={`p-5 rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border-0 text-slate-800'
                    : 'bg-slate-900/90 border border-indigo-500/30 text-white shadow-xl'
                } space-y-3 flex flex-col justify-between transition-all duration-300`}
                style={isLightSystem ? { border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)' } : undefined}
              >
                <div>
                  <div className={`flex items-center justify-between pb-3 border-b ${isLightSystem ? 'border-slate-100' : 'border-white/10'}`}>
                    <span className={`px-2.5 py-1 rounded-xl ${isLightSystem ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'} font-bold text-[10px] border flex items-center gap-1.5`}>
                      <BookOpen className={`w-3.5 h-3.5 ${isLightSystem ? 'text-teal-600' : 'text-teal-400'}`} />
                      <span>Renungan Utama Hari Ini</span>
                    </span>
                    {latestRenungan && (
                      <button
                        onClick={() => setSelectedRenunganForModal(latestRenungan)}
                        className={`px-2.5 py-1 rounded-lg ${isLightSystem ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200' : 'bg-teal-600/80 hover:bg-teal-500 text-white border-teal-400/30'} text-[10px] font-extrabold flex items-center gap-1 border shadow-xs transition-all cursor-pointer`}
                        title="Baca Layar Penuh"
                      >
                        <Maximize2 className={`w-3 h-3 ${isLightSystem ? 'text-teal-600' : 'text-amber-300'}`} />
                        <span>Layar Penuh</span>
                      </button>
                    )}
                  </div>

                  {latestRenungan ? (
                    <div className="mt-3 space-y-2">
                      <h3
                        onClick={() => setSelectedRenunganForModal(latestRenungan)}
                        className={`font-black text-base ${isLightSystem ? 'text-slate-900 hover:text-teal-700' : 'text-white hover:text-teal-300'} transition-colors cursor-pointer text-left leading-snug`}
                      >
                        {latestRenungan.judul}
                      </h3>
                      {(latestRenungan.ayat || latestRenungan.ayat_alkitab) && (
                        <p className={`text-xs ${isLightSystem ? 'text-amber-900 bg-amber-50/80 border-amber-200 font-semibold shadow-2xs' : 'text-amber-400 bg-amber-500/10 border-amber-500/20 font-semibold'} italic p-2.5 rounded-xl border`}>
                          &ldquo;{latestRenungan.ayat || latestRenungan.ayat_alkitab}&rdquo;
                        </p>
                      )}
                      <p
                        lang="id"
                        onClick={() => setSelectedRenunganForModal(latestRenungan)}
                        className={`text-xs ${isLightSystem ? 'text-slate-700 hover:text-slate-950' : 'text-slate-300 hover:text-slate-100'} line-clamp-3 leading-relaxed cursor-pointer text-justify break-words`}
                      >
                        {latestRenungan.isi.length > 180 ? `${latestRenungan.isi.slice(0, 180)}...` : latestRenungan.isi}
                      </p>
                    </div>
                  ) : (
                    <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} py-6 text-center`}>Belum ada data renungan terbaru.</p>
                  )}
                </div>

                <div className={`pt-3 border-t ${isLightSystem ? 'border-slate-100' : 'border-white/10'} space-y-2`}>
                  <div className={`flex items-center justify-between text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Oleh: <strong className={`${isLightSystem ? 'text-slate-800' : 'text-slate-200'} font-semibold`}>{latestRenungan?.penulis || 'Gembala Sidang'}</strong></span>
                    <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{latestRenungan?.tanggal || 'Hari Ini'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {latestRenungan ? (
                      <button
                        onClick={() => setSelectedRenunganForModal(latestRenungan)}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold flex items-center gap-1.5 cursor-pointer text-xs shadow-md shadow-teal-600/25 transition-all active:scale-95"
                        title="Baca Selengkapnya"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>Baca Selengkapnya</span>
                      </button>
                    ) : <div />}

                    <button
                      onClick={() => onNavigate('renungan')}
                      className={`px-3 py-1.5 rounded-xl ${isLightSystem ? 'bg-slate-50 hover:bg-teal-50 text-teal-800 border-teal-200 hover:border-teal-300' : 'bg-teal-600/90 hover:bg-teal-600 text-white border-teal-400/30'} font-extrabold flex items-center gap-1.5 cursor-pointer text-xs border transition-all shadow-xs`}
                    >
                      <span>Kumpulan Renungan &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Latest Pengumuman */}
            {settings.show_pengumuman_widget !== false && (
              <div
                className={`p-5 rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border-0 text-slate-800'
                    : 'bg-slate-900/90 border border-emerald-500/30 text-white shadow-xl'
                } space-y-3 flex flex-col justify-between transition-all duration-300`}
                style={isLightSystem ? { border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)' } : undefined}
              >
                <div>
                  <div className={`flex items-center justify-between pb-3 border-b ${isLightSystem ? 'border-slate-100' : 'border-white/10'}`}>
                    <span className={`px-2.5 py-1 rounded-xl ${isLightSystem ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} font-bold text-[10px] border flex items-center gap-1`}>
                      <Megaphone className="w-3.5 h-3.5 text-teal-600" />
                      Pengumuman Resmi Terbaru
                    </span>
                    <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{latestPengumuman?.tanggal || 'Terbaru'}</span>
                  </div>

                  {latestPengumuman ? (
                    <div className="mt-3 space-y-2">
                      <h3 className={`font-black text-base ${isLightSystem ? 'text-slate-900' : 'text-white'} text-left tracking-tight leading-snug`}>{latestPengumuman.judul}</h3>
                      <p
                        lang="id"
                        className={`text-xs ${isLightSystem ? 'text-slate-700' : 'text-slate-300'} line-clamp-4 leading-relaxed text-justify hyphens-auto [text-align-last:left] [text-justify:inter-word] break-words whitespace-pre-line`}
                        style={{
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          hyphens: 'auto',
                          WebkitHyphens: 'auto',
                          textAlignLast: 'left',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {latestPengumuman.isi}
                      </p>
                    </div>
                  ) : (
                    <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} py-6 text-center`}>Belum ada pengumuman terbaru.</p>
                  )}
                </div>

                <div className={`pt-3 border-t ${isLightSystem ? 'border-teal-100' : 'border-white/10'} flex items-center justify-between text-xs`}>
                  <span className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>Sekretariat Gereja</span>
                  <button
                    onClick={() => onNavigate('pengumuman')}
                    className={`${isLightSystem ? 'text-teal-700 hover:text-teal-900' : 'text-emerald-400 hover:text-emerald-300'} font-bold flex items-center gap-1 cursor-pointer`}
                  >
                    <span>Kumpulan Pengumuman &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Latest Upcoming Event */}
            {settings.show_event_widget !== false && (
              <div
                className={`p-5 rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border-0 text-slate-800'
                    : 'bg-slate-900/90 border border-amber-500/30 text-white shadow-xl'
                } space-y-3 flex flex-col justify-between transition-all duration-300`}
                style={isLightSystem ? { border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)' } : undefined}
              >
                <div>
                  <div className={`flex items-center justify-between pb-3 border-b ${isLightSystem ? 'border-slate-100' : 'border-white/10'}`}>
                    <span className={`px-2.5 py-1 rounded-xl ${isLightSystem ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} font-bold text-[10px] border flex items-center gap-1`}>
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Agenda / Event Terdekat
                    </span>
                    <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{latestEvent?.tanggal || 'Mendatang'}</span>
                  </div>

                  {latestEvent ? (
                    <div className="mt-3 space-y-2">
                      <h3 className={`font-black text-base ${isLightSystem ? 'text-slate-900' : 'text-white'} leading-snug`}>{latestEvent.nama}</h3>
                      <div className={`space-y-1.5 text-xs ${isLightSystem ? 'text-slate-700 bg-slate-50 border border-slate-200/80 shadow-2xs' : 'text-slate-300 bg-white/5 border-white/5'} p-3 rounded-2xl`}>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 ${isLightSystem ? 'text-amber-600' : 'text-amber-400'}`} />
                          <span className="font-medium">Pukul {latestEvent.jam} WIB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                          <span>{latestEvent.lokasi}</span>
                        </div>
                        {latestEvent.pembicara && (
                          <div className={`flex items-center gap-2 ${isLightSystem ? 'text-slate-600' : 'text-slate-400'}`}>
                            <span>Pembicara: {latestEvent.pembicara}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenReservationModal(latestEvent)}
                        className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Reservasi Kursi / Kehadiran</span>
                      </button>

                      {!isJemaat && (
                        <button
                          onClick={() => setIsAdminResModalOpen(true)}
                          className={`w-full mt-1.5 py-2 px-3 rounded-xl ${isLightSystem ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/30'} border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
                        >
                          <Ticket className={`w-3.5 h-3.5 ${isLightSystem ? 'text-teal-600' : 'text-amber-400'}`} />
                          <span>Daftar Reservasi Jemaat ({reservationsList.length} Pendaftar)</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} py-6 text-center`}>Belum ada agenda mendatang.</p>
                  )}
                </div>

                <div className={`pt-3 border-t ${isLightSystem ? 'border-slate-100' : 'border-white/10'} flex items-center justify-between text-xs`}>
                  <span className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>Jadwal Minggu Ini</span>
                  <button
                    onClick={() => onNavigate('agenda')}
                    className={`${isLightSystem ? 'text-teal-700 hover:text-teal-900' : 'text-amber-400 hover:text-amber-300'} font-bold flex items-center gap-1 cursor-pointer`}
                  >
                    <span>Lihat Kalender</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Prayer Request Form for Jemaat */}
          {settings.show_prayer_widget !== false && (
            <div
              className={`p-5 sm:p-6 rounded-3xl ${
                isLightSystem
                  ? 'bg-white border-0 text-slate-800'
                  : 'bg-slate-900/90 border border-rose-500/30 text-white shadow-xl'
              } space-y-3 sm:space-y-4 transition-all duration-300`}
              style={isLightSystem ? { border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)' } : undefined}
            >
              <div className={`flex items-center gap-3 pb-3 border-b ${isLightSystem ? 'border-slate-100' : 'border-white/10'}`}>
                <div className={`p-2.5 rounded-2xl ${isLightSystem ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-rose-500/20 text-rose-300'} shadow-2xs shrink-0`}>
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-base ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Kirim Permohonan Doa Mandiri</h3>
                  <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-400'}`}>Tim pendoa dan hamba Tuhan akan mendoakan beban permohonan Anda.</p>
                </div>
              </div>

              {prayerSubmitted && (
                <div className={`p-3.5 ${isLightSystem ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'} border rounded-2xl text-xs font-bold flex items-center gap-2`}>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Permohonan doa Anda telah berhasil dikirimkan ke Tim Pendoa Gereja!</span>
                </div>
              )}

              <form onSubmit={handleSubmitPrayer} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700 font-bold' : 'text-slate-400 font-semibold'} text-xs mb-1`}>Kategori Doa</label>
                    <select
                      value={prayerTopic}
                      onChange={(e) => setPrayerTopic(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl ${isLightSystem ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100' : 'bg-slate-950 border-slate-700 text-white'} border text-xs`}
                    >
                      <option value="Kesehatan">Kesehatan & Pemulihan</option>
                      <option value="Pekerjaan">Pekerjaan & Karir</option>
                      <option value="Keluarga">Keluarga & Rumah Tangga</option>
                      <option value="Keuangan">Keuangan & Usaha</option>
                      <option value="Pendidikan">Pendidikan & Sekolah</option>
                      <option value="Kerohanian">Pertumbuhan Kerohanian</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block ${isLightSystem ? 'text-slate-700 font-bold' : 'text-slate-400 font-semibold'} text-xs mb-1`}>Isi Permohonan Doa</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Tuliskan pokok permohonan doa Anda..."
                        value={prayerText}
                        onChange={(e) => setPrayerText(e.target.value)}
                        className={`flex-1 px-3.5 py-2.5 rounded-xl ${isLightSystem ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100' : 'bg-slate-950 border-slate-700 text-white'} border text-xs`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Status Permohonan Doa untuk Jemaat atau Tindakan Doa Cepat untuk Admin */}
              {prayerRequests.length > 0 && (
                <div className={`pt-3 border-t ${isLightSystem ? 'border-slate-100' : 'border-white/10'} space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLightSystem ? 'text-slate-700' : 'text-slate-300'} uppercase tracking-wider`}>
                      {isAdmin ? 'Permohonan Doa Jemaat Masuk' : 'Status Permohonan Doa Anda'}
                    </span>
                    <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isAdmin ? 'Admin & Majelis dapat menekan Selesai Doa' : 'Dipantau langsung oleh Tim Pendoa Gereja'}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(isAdmin
                      ? prayerRequests
                      : prayerRequests.filter(
                          (p) =>
                            p.jemaat_name?.toLowerCase().trim() === currentUser.nama?.toLowerCase().trim()
                        )
                    )
                      .slice(0, 5)
                      .map((pr) => {
                        const isDone = pr.status === 'Terjawab' || pr.status === 'Selesai Doa';
                        return (
                          <div
                            key={pr.prayer_id}
                            className={`p-3 rounded-2xl ${isLightSystem ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'} border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs`}
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} truncate`}>
                                  {isAdmin ? pr.jemaat_name : 'Permohonan Anda'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md ${isLightSystem ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/40'} border text-[10px]`}>
                                  {pr.topik}
                                </span>
                                <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-500'}`}>{pr.tanggal}</span>
                              </div>
                              <p className={`${isLightSystem ? 'text-slate-700' : 'text-slate-300'} text-[11px] italic truncate`}>
                                "{pr.permohonan}"
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isDone ? (
                                <span className={`px-2.5 py-1 rounded-xl ${isLightSystem ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'} border text-[11px] font-bold flex items-center gap-1.5`}>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Sudah Didoakan</span>
                                </span>
                              ) : (
                                <>
                                  <span className={`px-2.5 py-1 rounded-xl ${isLightSystem ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'} border text-[11px] font-bold flex items-center gap-1.5`}>
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Dalam Doa</span>
                                  </span>

                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdminSelesaiDoa(pr.prayer_id)}
                                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                                      title="Tandai Selesai Doa & Beritahu Jemaat"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Selesai Doa</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer Persembahan & Perpuluhan Digital Card for Jemaat & All Users */}
          {settings.show_digital_offering_widget !== false && (
            <div
              className={`p-5 sm:p-6 md:p-7 rounded-3xl ${
                isLightSystem
                  ? 'bg-white border-0 text-slate-800'
                  : 'bg-slate-900/90 border border-emerald-500/30 text-white shadow-xl'
              } space-y-4 sm:space-y-5 md:space-y-6 relative overflow-hidden transition-all duration-300`}
              style={isLightSystem ? { border: 'none', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)' } : undefined}
            >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b ${isLightSystem ? 'border-slate-100' : 'border-white/10'} pb-3.5 sm:pb-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 sm:p-3 rounded-2xl ${isLightSystem ? 'bg-teal-50 text-teal-600 border border-teal-200 shadow-2xs' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'}`}>
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className={`text-[10px] ${isLightSystem ? 'text-teal-700' : 'text-emerald-400'} font-bold uppercase tracking-widest block`}>
                    Transfer Digital &amp; QRIS Gereja
                  </span>
                  <h3 className={`text-base sm:text-lg font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Transfer Persembahan &amp; Perpuluhan</h3>
                </div>
              </div>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className={`px-4 py-2.5 rounded-xl sm:rounded-2xl ${
                  isLightSystem
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                } font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95`}
              >
                <Send className="w-4 h-4" />
                <span>Kirim / Konfirmasi Transfer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 items-stretch">
              {/* Bank Account Info Card */}
              <div className={`p-5 rounded-2xl ${
                isLightSystem
                  ? 'bg-white border border-slate-200/90 text-slate-800 shadow-sm'
                  : 'bg-slate-950/80 border border-slate-800 text-white'
              } flex flex-col justify-between space-y-4`}>
                <div className="space-y-3.5">
                  <div className={`flex items-center justify-between pb-2 border-b ${isLightSystem ? 'border-slate-100' : 'border-slate-800'}`}>
                    <span className={`text-xs font-black ${isLightSystem ? 'text-teal-800' : 'text-emerald-400'} uppercase tracking-wider`}>
                      Rekening Resmi Gereja
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full ${
                      isLightSystem
                        ? 'bg-slate-50 text-slate-800 border border-slate-200'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    } border text-[10px] font-bold`}>
                      {settings.rekening_bank_nama || 'Bank BCA'}
                    </span>
                  </div>

                  <div>
                    <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-semibold block`}>Nomor Rekening:</span>
                    <div className={`flex items-center justify-between mt-1.5 ${
                      isLightSystem ? 'bg-slate-50 border border-slate-200 shadow-2xs' : 'bg-slate-900 border border-slate-800'
                    } p-3 rounded-xl border`}>
                      <span className={`font-mono text-base sm:text-lg font-black ${isLightSystem ? 'text-slate-900' : 'text-white'} tracking-wider`}>
                        {settings.rekening_bank_nomor || '527-089-1122'}
                      </span>
                      <button
                        onClick={handleCopyBank}
                        className={`px-3 py-1.5 rounded-lg ${
                          isLightSystem
                            ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs'
                            : 'bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-300 border border-emerald-500/40'
                        } border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95`}
                      >
                        {copiedBankNum ? <Check className={`w-3.5 h-3.5 ${isLightSystem ? 'text-teal-700' : 'text-emerald-400'}`} /> : <Copy className="w-3.5 h-3.5 text-teal-600" />}
                        <span>{copiedBankNum ? 'Tersalin!' : 'Salin Rekening'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-semibold block`}>Atas Nama Rekening:</span>
                    <p className={`font-black ${isLightSystem ? 'text-slate-900' : 'text-slate-200'} text-sm mt-0.5`}>
                      {settings.rekening_bank_atas_nama || settings.nama_gereja || 'Jesus Kingdom Christ'}
                    </p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl ${isLightSystem ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-white/5 border border-white/10 text-slate-300'} text-xs leading-relaxed`}>
                  💡 <span className="font-bold">Petunjuk:</span> Cantumkan keterangan nama atau jenis persembahan pada berita transfer bank, lalu klik tombol konfirmasi di atas.
                </div>
              </div>

              {/* QRIS Code Large Display Card */}
              <div className={`p-5 md:p-6 rounded-2xl sm:rounded-3xl ${
                isLightSystem
                  ? 'bg-white border border-slate-200/90 text-slate-800 shadow-sm'
                  : 'bg-slate-950/90 border-2 border-emerald-500/40 shadow-xl'
              } flex flex-col items-center justify-center text-center gap-3 sm:gap-4`}>
                <div className={`flex items-center gap-2 ${isLightSystem ? 'text-slate-900' : 'text-emerald-400'} font-black text-sm tracking-wide uppercase`}>
                  <QrCode className={`w-5 h-5 ${isLightSystem ? 'text-teal-600' : 'text-emerald-400'} animate-pulse`} />
                  <span>Barcode QRIS Persembahan Digital</span>
                </div>

                <div 
                  onClick={() => setIsQrisZoomModalOpen(true)}
                  className="relative group cursor-pointer transition-transform hover:scale-105"
                >
                  {settings.qris_image_url ? (
                    <div className={`p-3.5 rounded-2xl ${
                      isLightSystem
                        ? 'bg-white border border-slate-200 shadow-md'
                        : 'bg-white border-4 border-emerald-500/50 shadow-2xl'
                    }`}>
                      <img
                        src={settings.qris_image_url}
                        alt="Barcode QRIS Gereja"
                        className="w-48 h-48 sm:w-60 sm:h-60 md:w-68 md:h-68 object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className={`w-48 h-48 sm:w-60 sm:h-60 md:w-68 md:h-68 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-4 text-slate-800 ${
                      isLightSystem
                        ? 'border border-slate-200 shadow-md'
                        : 'border-4 border-emerald-500/50 shadow-2xl'
                    }`}>
                      <QrCode className={`w-14 h-14 sm:w-16 sm:h-16 ${isLightSystem ? 'text-teal-600' : 'text-emerald-600'} mb-2`} />
                      <span className="font-extrabold text-sm text-slate-900">QRIS Standar Nasional (QRIS)</span>
                      <span className="text-xs text-slate-500 mt-1 font-medium">{settings.rekening_bank_atas_nama || settings.nama_gereja || 'Jesus Kingdom Christ'}</span>
                    </div>
                  )}

                  <div className={`absolute inset-0 ${isLightSystem ? 'bg-slate-900/60' : 'bg-slate-950/70'} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white font-extrabold text-xs sm:text-sm gap-2 backdrop-blur-xs`}>
                    <Maximize2 className="w-5 h-5 text-amber-300" />
                    <span>Klik Untuk Perbesar Layar Penuh</span>
                  </div>
                </div>

                <div className="max-w-md space-y-2">
                  <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-medium leading-relaxed`}>
                    Pindai QRIS di atas menggunakan <span className={`${isLightSystem ? 'text-teal-800 font-bold' : 'text-emerald-400 font-extrabold'}`}>GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile</span>, atau seluruh aplikasi e-Wallet &amp; M-Banking.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQrisZoomModalOpen(true)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                      isLightSystem
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-600/25'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                    } font-bold text-xs transition-all cursor-pointer`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Perbesar Layar Penuh (Zoom QRIS)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Riwayat Transfer Persembahan Saya */}
            <div className="space-y-3 pt-2">
              <h4 className={`text-xs font-bold ${isLightSystem ? 'text-slate-700' : 'text-slate-300'} uppercase tracking-wider flex items-center gap-2`}>
                <Clock className={`w-4 h-4 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                <span>Riwayat Persembahan Transfer Saya</span>
              </h4>

              {(() => {
                const myTransfers = persembahanList.filter((p) => {
                  const matchesId = p.jemaat_id && (p.jemaat_id === currentUser.jemaat_id || p.jemaat_id === currentUser.user_id);
                  const userNama = (currentUser.nama || currentUser.username || '').toLowerCase().trim();
                  const pengirimNama = (p.nama_pengirim || '').toLowerCase().trim();
                  const matchesName = userNama && pengirimNama && (
                    userNama === pengirimNama ||
                    pengirimNama.includes(userNama) ||
                    userNama.includes(pengirimNama)
                  );
                  return Boolean(matchesId || matchesName);
                });

                if (myTransfers.length === 0) {
                  return (
                    <div className={`p-4 rounded-xl ${
                      isLightSystem
                        ? 'bg-slate-50 border border-slate-200 text-slate-600'
                        : 'bg-slate-950/50 border border-slate-800 text-slate-400'
                    } text-center text-xs`}>
                      Belum ada riwayat persembahan transfer. Klik "Kirim / Konfirmasi Transfer" di atas untuk mengirim persembahan.
                    </div>
                  );
                }

                const displayedTransfers = showAllMyTransfers ? myTransfers : myTransfers.slice(0, 1);

                return (
                  <div className="space-y-2">
                    {displayedTransfers.map((p) => {
                      const isPending = p.status === 'PENDING';
                      const isVerified = p.status === 'TERVERIFIKASI' || !p.status;
                      const isRejected = p.status === 'DITOLAK';

                      return (
                        <div
                          key={p.persembahan_id}
                          className={`p-3.5 rounded-2xl ${
                            isLightSystem
                              ? 'bg-white border border-slate-200 shadow-sm text-slate-800'
                              : 'bg-slate-950/90 border border-slate-800 text-white shadow-md'
                          } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{p.jenis || 'Persembahan'}</span>
                              <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-mono`}>({p.tanggal})</span>
                            </div>
                            <p className={`text-[11px] ${isLightSystem ? 'text-slate-600' : 'text-slate-400'}`}>{p.keterangan || '-'}</p>
                            {p.catatan_admin && (
                              <p className={`text-[10px] ${isLightSystem ? 'text-amber-700 font-semibold' : 'text-amber-300/90 italic'}`}>
                                Catatan Admin: {p.catatan_admin}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            {p.bukti_transfer && (
                              <button
                                type="button"
                                onClick={() => setPreviewReceiptItem(p)}
                                className={`px-2.5 py-1 rounded-xl ${
                                  isLightSystem
                                    ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                                    : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700'
                                } text-[11px] font-semibold flex items-center gap-1 cursor-pointer`}
                              >
                                <Eye className={`w-3 h-3 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                                <span>Bukti</span>
                              </button>
                            )}

                            <span className={`font-bold text-sm ${isLightSystem ? 'text-teal-700' : 'text-emerald-400'}`}>
                              Rp {p.jumlah.toLocaleString('id-ID')}
                            </span>

                            {isPending && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                                isLightSystem ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              } text-[10px] font-bold`}>
                                <Clock className="w-3 h-3 text-amber-500" />
                                <span>Menunggu Verifikasi</span>
                              </span>
                            )}
                            {isVerified && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                                isLightSystem ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              } text-[10px] font-bold`}>
                                <CheckCircle2 className={`w-3 h-3 ${isLightSystem ? 'text-teal-600' : 'text-emerald-400'}`} />
                                <span>Terverifikasi / Diterima</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                                isLightSystem ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              } text-[10px] font-bold`}>
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {myTransfers.length > 1 && (
                      <button
                        onClick={() => setShowAllMyTransfers(!showAllMyTransfers)}
                        className={`w-full py-2.5 px-3 rounded-xl ${
                          isLightSystem
                            ? 'bg-teal-50/70 hover:bg-teal-100 border border-teal-200 text-teal-800'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-indigo-300 hover:text-indigo-200'
                        } text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs mt-1`}
                      >
                        {showAllMyTransfers ? (
                          <>
                            <ChevronUp className={`w-4 h-4 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                            <span>Sembunyikan (Tampilkan 1 Terbaru Saja)</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className={`w-4 h-4 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                            <span>Lihat Selengkapnya ({myTransfers.length - 1} riwayat lagi)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

          {/* Modal Submit Konfirmasi Transfer */}
          {isTransferModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <div className={`w-full max-w-lg rounded-3xl ${
                isLightSystem
                  ? 'bg-white border border-slate-200 text-slate-900 shadow-2xl'
                  : 'bg-slate-900 border border-slate-800 text-white shadow-2xl'
              } p-5 sm:p-6 space-y-4 my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isLightSystem ? 'border-slate-100' : 'border-slate-800'} shrink-0`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isLightSystem ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Konfirmasi Transfer Persembahan</h3>
                      <p className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>Kirim bukti transfer untuk dicatat ke kas jemaat</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsTransferModalOpen(false);
                      setTransferMsg(null);
                    }}
                    className={`p-1.5 rounded-lg ${isLightSystem ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'} cursor-pointer`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {transferMsg && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold border shrink-0 ${
                      transferMsg.type === 'success'
                        ? isLightSystem
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isLightSystem
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {transferMsg.text}
                  </div>
                )}

                <form onSubmit={handleSubmitTransfer} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700' : 'text-slate-400'} mb-1 font-semibold`}>Jenis / Kategori Persembahan *</label>
                    <select
                      value={transferForm.jenis}
                      onChange={(e) => setTransferForm({ ...transferForm, jenis: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        isLightSystem
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-500'
                          : 'bg-slate-950 border-slate-700 text-white'
                      } font-semibold`}
                    >
                      <option value="Persembahan Perpuluhan">Persembahan Perpuluhan (10%)</option>
                      <option value="Persembahan Minggu">Persembahan Minggu</option>
                      <option value="Persembahan Syukur">Persembahan Syukur</option>
                      <option value="Persembahan Kasih Diakonia">Diakonia / Pelayanan</option>
                      <option value="Persembahan Pembangunan">Donasi Pembangunan Gedung</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700' : 'text-slate-400'} mb-1 font-semibold`}>Nama Pengirim / Atas Nama Rekening *</label>
                    <input
                      type="text"
                      required
                      value={transferForm.nama_pengirim}
                      onChange={(e) => setTransferForm({ ...transferForm, nama_pengirim: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        isLightSystem
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-500'
                          : 'bg-slate-950 border-slate-700 text-white'
                      } font-semibold`}
                    />
                  </div>

                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700' : 'text-slate-400'} mb-1 font-semibold`}>Nominal Persembahan (Rp) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={transferForm.jumlah}
                      onChange={(e) => setTransferForm({ ...transferForm, jumlah: Number(e.target.value) })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        isLightSystem
                          ? 'bg-slate-50 border-slate-300 text-teal-700 focus:bg-white focus:border-teal-500'
                          : 'bg-slate-950 border-slate-700 text-emerald-400'
                      } font-mono font-extrabold text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700' : 'text-slate-400'} mb-1 font-semibold`}>Metode Pembayaran</label>
                    <select
                      value={transferForm.metode_pembayaran}
                      onChange={(e) => setTransferForm({ ...transferForm, metode_pembayaran: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        isLightSystem
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-500'
                          : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      <option value="Transfer Bank">Transfer Bank ({settings.rekening_bank_nama || 'BCA'})</option>
                      <option value="QRIS Digital">QRIS Digital Scan</option>
                    </select>
                  </div>

                  {/* Upload Bukti Transfer */}
                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700' : 'text-slate-400'} mb-1 font-semibold`}>Unggah / Upload Foto Bukti Transfer</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="URL bukti transfer atau upload file..."
                        value={transferForm.bukti_transfer}
                        onChange={(e) => setTransferForm({ ...transferForm, bukti_transfer: e.target.value })}
                        className={`flex-1 px-3 py-2 rounded-xl border ${
                          isLightSystem
                            ? 'bg-slate-50 border-slate-300 text-slate-900 text-[11px] font-mono focus:bg-white'
                            : 'bg-slate-950 border-slate-700 text-white text-[11px] font-mono'
                        }`}
                      />
                      <label className={`px-3.5 py-2 rounded-xl ${
                        isLightSystem
                          ? 'bg-teal-600 hover:bg-teal-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      } font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) {
                                  setTransferForm({ ...transferForm, bukti_transfer: evt.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={`block ${isLightSystem ? 'text-slate-700' : 'text-slate-400'} mb-1 font-semibold`}>Catatan / Pokok Doa (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ucapan syukur ulang tahun / perpuluhan bulan ini"
                      value={transferForm.keterangan}
                      onChange={(e) => setTransferForm({ ...transferForm, keterangan: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        isLightSystem
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-500'
                          : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isLightSystem ? 'border-teal-100' : 'border-slate-800'} shrink-0`}>
                    <button
                      type="button"
                      onClick={() => setIsTransferModalOpen(false)}
                      className={`px-4 py-2 rounded-xl ${
                        isLightSystem
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      } font-bold cursor-pointer`}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-5 py-2 rounded-xl ${
                        isLightSystem
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      } font-bold flex items-center gap-1.5 cursor-pointer`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim Konfirmasi Transfer</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Preview Bukti Transfer */}
          {previewReceiptItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <div className={`w-full max-w-xl rounded-3xl ${
                isLightSystem
                  ? 'bg-white border-2 border-teal-200 text-slate-900 shadow-2xl'
                  : 'bg-slate-900 border border-slate-700 text-white shadow-2xl'
              } p-5 sm:p-6 space-y-4 my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isLightSystem ? 'border-teal-100' : 'border-slate-800'} shrink-0`}>
                  <div className="flex items-center gap-2">
                    <Eye className={`w-5 h-5 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                    <h3 className="text-base font-bold">Bukti Transfer Persembahan</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewReceiptItem(null)}
                    className={`p-1.5 rounded-lg ${isLightSystem ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'} transition-all cursor-pointer`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                  <div className={`p-3.5 rounded-2xl ${
                    isLightSystem
                      ? 'bg-teal-50/70 border border-teal-200/80 text-slate-800'
                      : 'bg-slate-950/80 border border-slate-800 text-white'
                  } space-y-1.5 text-xs`}>
                    <div className="flex items-center justify-between">
                      <span className={isLightSystem ? 'text-slate-600' : 'text-slate-400'}>Pengirim:</span>
                      <strong className={isLightSystem ? 'text-slate-900' : 'text-white'}>{previewReceiptItem.nama_pengirim}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightSystem ? 'text-slate-600' : 'text-slate-400'}>Jenis Persembahan:</span>
                      <strong className={isLightSystem ? 'text-teal-800' : 'text-indigo-300'}>{previewReceiptItem.jenis}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightSystem ? 'text-slate-600' : 'text-slate-400'}>Nominal:</span>
                      <strong className={`${isLightSystem ? 'text-teal-700' : 'text-emerald-400'} text-sm font-mono font-black`}>Rp {previewReceiptItem.jumlah.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightSystem ? 'text-slate-600' : 'text-slate-400'}>Tanggal:</span>
                      <span className={`${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-mono`}>{previewReceiptItem.tanggal}</span>
                    </div>
                    {previewReceiptItem.keterangan && (
                      <div className={`pt-1 border-t ${isLightSystem ? 'border-teal-200/60 text-slate-600' : 'border-slate-800 text-slate-400'} text-[11px]`}>
                        Catatan: {previewReceiptItem.keterangan}
                      </div>
                    )}
                  </div>

                  <div className={`rounded-2xl overflow-hidden ${isLightSystem ? 'bg-slate-50 border border-teal-200' : 'bg-black border border-slate-800'} max-h-[50vh] flex items-center justify-center p-2`}>
                    {previewReceiptItem.bukti_transfer ? (
                      <img
                        src={previewReceiptItem.bukti_transfer}
                        alt="Bukti Transfer"
                        className="max-h-[45vh] w-auto max-w-full object-contain rounded-lg"
                      />
                    ) : (
                      <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} py-10`}>Tidak ada lampiran foto bukti transfer.</p>
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-between gap-3 pt-3 border-t ${isLightSystem ? 'border-teal-100' : 'border-slate-800'} shrink-0`}>
                  <button
                    type="button"
                    onClick={() => setPreviewReceiptItem(null)}
                    className={`px-4 py-2 rounded-xl ${
                      isLightSystem
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    } text-xs font-bold cursor-pointer`}
                  >
                    Tutup
                  </button>

                  {isAdmin && previewReceiptItem.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const id = previewReceiptItem.persembahan_id;
                          setPreviewReceiptItem(null);
                          handleRejectPersembahan(id);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-600 text-xs font-bold border border-rose-300 transition-all cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const id = previewReceiptItem.persembahan_id;
                          setPreviewReceiptItem(null);
                          handleVerifyPersembahan(id);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow transition-all cursor-pointer"
                      >
                        Verifikasi &amp; Terima (Masuk Kas)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {settings.show_video_widget !== false && settings.video_enabled !== false && (
            <div className={`rounded-2xl sm:rounded-3xl ${
              isLightSystem
                ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.06)] text-slate-800'
                : 'bg-slate-900/90 border border-slate-800 shadow-xl text-white'
            } p-3.5 sm:p-5 overflow-hidden space-y-3 sm:space-y-4 transition-all duration-300`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b ${
                isLightSystem ? 'border-slate-100' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${
                    isLightSystem
                      ? 'bg-rose-50 text-rose-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  } animate-pulse shrink-0`}>
                    <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${
                        isLightSystem
                          ? 'bg-rose-100 text-rose-700 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      } font-bold text-[10px] uppercase tracking-wider`}>
                        🔴 Live Media Stream
                      </span>
                      <span className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} capitalize`}>Media: {parsedVideo.type}</span>
                    </div>
                    <h3 className={`text-sm sm:text-base font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'} mt-0.5`}>
                      {currentVideoDisplayTitle}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('galeri')}
                  className={`px-3 py-1.5 rounded-xl ${
                    isLightSystem
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]'
                      : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
                  } text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0`}
                >
                  <Video className={`w-3.5 h-3.5 ${isLightSystem ? 'text-teal-600' : 'text-indigo-400'}`} />
                  <span>Galeri Video &amp; Foto</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {settings.video_description && (
                <p className={`text-xs ${
                  isLightSystem
                    ? 'text-slate-600 italic bg-slate-50 py-1.5 px-3 rounded-xl !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]'
                    : 'text-slate-300 italic bg-white/5 py-1.5 px-3 rounded-xl border border-white/5'
                }`}>
                  "{settings.video_description}"
                </p>
              )}

              {/* Embedded Video Display */}
              <div className={`relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden ${
                isLightSystem
                  ? 'bg-slate-900 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.2)]'
                  : 'bg-black/90 border border-white/10 shadow-2xl'
              } aspect-video max-h-[380px] sm:max-h-[460px]`}>
                {parsedVideo.isValid ? (
                  parsedVideo.type === 'mp4' ? (
                    <video
                      controls
                      className="w-full h-full object-contain"
                      src={parsedVideo.embedUrl}
                    />
                  ) : (
                    <iframe
                      src={parsedVideo.embedUrl}
                      title="Tayangan Media Sosial Gereja"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )
                ) : (
                  <div className={`w-full h-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center ${
                    isLightSystem ? 'bg-slate-50 text-slate-700' : 'bg-slate-950 text-slate-400'
                  }`}>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] flex items-center justify-center text-slate-700 mb-2">
                      <Tv className="w-6 h-6" />
                    </div>
                    <p className={`text-sm font-bold ${isLightSystem ? 'text-slate-900' : 'text-slate-200'}`}>Video Belum Diatur atau Tautan Tidak Sesuai</p>
                    <p className={`text-xs mt-1 max-w-md ${isLightSystem ? 'text-slate-600' : 'text-slate-400'}`}>
                      Video tayangan ibadah/khotbah YouTube dapat dikonfigurasi melalui Galeri Media atau Pengaturan.
                    </p>
                  </div>
                )}
              </div>

              {/* Gallery Video & Photo Stream Playlist Selector */}
              {allDashboardVideos.length > 0 && (
                <div className={`pt-2.5 border-t ${isLightSystem ? 'border-slate-100' : 'border-white/10'} space-y-2`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isLightSystem ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5 text-[11px]`}>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pilihan Tayangan &amp; Informasi Media Stream:
                    </span>
                    <button
                      onClick={() => onNavigate('galeri')}
                      className={`${isLightSystem ? 'text-teal-700 hover:text-teal-800' : 'text-indigo-400 hover:text-indigo-300'} font-semibold text-[11px] cursor-pointer flex items-center gap-1`}
                    >
                      <span>Buka Galeri Media</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {allDashboardVideos.map((v) => {
                      const isPlaying = currentVideoUrl === v.video_url;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setActiveVideoUrl(v.video_url)}
                          className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                            isPlaying
                              ? isLightSystem
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)]'
                                : 'bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/30'
                              : isLightSystem
                              ? 'bg-white text-slate-700 hover:bg-slate-50 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.05)]'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className={`flex items-center justify-between text-[10px] font-bold ${
                            isPlaying ? 'text-teal-100' : isLightSystem ? 'text-teal-700' : 'text-indigo-400'
                          } mb-0.5`}>
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3 fill-current" />
                              {v.platform || 'YouTube'} &bull; {v.kategori || 'Ibadah'}
                            </span>
                            {isPlaying && (
                              <span className={`px-1.5 py-0.2 rounded ${
                                isLightSystem ? 'bg-white/20 text-white font-extrabold' : 'bg-indigo-500/30 text-indigo-200'
                              } text-[9px]`}>
                                Sedang Diputar
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold ${isPlaying ? 'text-white' : isLightSystem ? 'text-slate-900' : 'text-white'} truncate`}>{v.judul}</p>
                        </button>
                      );
                    })}

                    {/* Fill empty grid slots proportionally with church streaming information */}
                    {allDashboardVideos.length < 2 && (
                      <div className={`p-2.5 rounded-2xl ${
                        isLightSystem ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.05)] text-slate-800' : 'bg-white/5 border-white/10 text-white border'
                      } text-left flex items-center gap-2.5`}>
                        <div className={`p-2 rounded-xl ${
                          isLightSystem ? 'bg-slate-100 text-slate-700 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        } shrink-0`}>
                          <Tv className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-[10px] font-extrabold ${isLightSystem ? 'text-slate-700' : 'text-red-300'} uppercase tracking-wider`}>
                            Jadwal Live Stream
                          </div>
                          <p className={`text-xs font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} truncate`}>Ibadah Minggu 07.00 &amp; 10.00 WIB</p>
                        </div>
                      </div>
                    )}

                    {allDashboardVideos.length < 3 && (
                      <div
                        onClick={() => onNavigate('galeri')}
                        className={`p-2.5 rounded-2xl ${
                          isLightSystem ? 'bg-white !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.05)] hover:bg-slate-50 text-slate-800' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white border'
                        } text-left flex items-center justify-between cursor-pointer transition-all`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-xl ${
                            isLightSystem ? 'bg-slate-100 text-slate-700 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          } shrink-0`}>
                            <Video className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className={`text-[10px] font-extrabold ${isLightSystem ? 'text-slate-700' : 'text-amber-300'} uppercase tracking-wider`}>
                              Koleksi Khotbah
                            </div>
                            <p className={`text-xs font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} truncate`}>Arsip Khotbah &amp; Pujian Lengkap</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUPERADMIN & ADMIN OPERATIONAL DASHBOARD */}
      {!isJemaat && (
        <div className="space-y-2 sm:space-y-3.5 md:space-y-6">
          {/* Quick Statistics Cards */}
          {settings.show_stat_cards !== false && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-4">
              {/* Total Jemaat Card */}
              <div className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Total Jemaat</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-blue-50 text-blue-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'} shadow-sm shrink-0`}>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className={`text-xl sm:text-3xl font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{totalJemaat}</span>
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Jiwa</span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} flex items-center justify-between text-[9px] sm:text-[11px] gap-1`}>
                  <span>L: <strong className={isLightSystem ? 'text-blue-600 font-bold' : 'text-indigo-300 font-bold'}>{totalLaki}</strong></span>
                  <span>P: <strong className={isLightSystem ? 'text-pink-600 font-bold' : 'text-pink-300 font-bold'}>{totalPerempuan}</strong></span>
                </div>
              </div>

              {/* Total Keluarga Card */}
              <div 
                className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}
                title="Total Kartu Keluarga unik. Jemaat dengan Nomor KK yang sama dihitung sebagai satu keluarga."
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Total KK</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-purple-50 text-purple-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'} shadow-sm shrink-0`}>
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-xl sm:text-3xl font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{totalKeluarga}</span>
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Keluarga</span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} text-[9px] sm:text-[11px] truncate`}>
                  <span>Kartu Keluarga (Unik)</span>
                </div>
              </div>

              {/* Total Persembahan Card */}
              <div className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Kas Persembahan</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-emerald-50 text-emerald-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} shadow-sm shrink-0`}>
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className={`text-base sm:text-2xl font-black ${isLightSystem ? 'text-emerald-600' : 'text-emerald-400'} leading-tight`}>
                    Rp {saldoKasBersih.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} text-[9px] sm:text-[11px] flex items-center justify-between`}>
                  <span>Saldo Kas Bersih</span>
                  <span className={isLightSystem ? 'text-emerald-600 font-semibold' : 'text-emerald-300 font-semibold'}>Realtime</span>
                </div>
              </div>

              {/* Event Mendatang Card */}
              <div className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl ${cardStyleClass} !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-1 sm:space-y-2`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} font-bold uppercase tracking-wider truncate`}>Jadwal & Event</span>
                  <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl ${isLightSystem ? 'bg-amber-50 text-amber-600 !border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} shadow-sm shrink-0`}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-xl sm:text-3xl font-black ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>{eventsList.length}</span>
                  <span className={`text-[10px] sm:text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Agenda</span>
                </div>
                <div className={`pt-1.5 sm:pt-2 border-t ${isLightSystem ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-300'} text-[9px] sm:text-[11px] truncate`}>
                  <span>Ibadah & Agenda</span>
                </div>
              </div>
            </div>
          )}

          {/* KONFIRMASI TRANSFER PERSEMBAHAN JEMAAT REALTIME (ADMIN WIDGET) */}
          {pendingPersembahanList.length > 0 ? (
            <div className={`p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl ${
              isLightSystem
                ? 'bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-2 border-amber-300 text-slate-800 shadow-lg'
                : 'bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-emerald-950/70 border-2 border-amber-500/50 shadow-2xl text-white'
            } space-y-3 sm:space-y-4 animate-fade-in`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isLightSystem ? 'border-amber-200/80' : 'border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 sm:p-3 rounded-2xl ${isLightSystem ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'} shadow-inner shrink-0`}>
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                        {pendingPersembahanList.length} Menunggu Konfirmasi
                      </span>
                      <span className={`text-xs ${isLightSystem ? 'text-amber-800' : 'text-amber-300'} font-semibold flex items-center gap-1`}>
                        <Sparkles className="w-3.5 h-3.5" /> Transfer Jemaat Masuk Real-Time
                      </span>
                    </div>
                    <h3 className={`text-base sm:text-lg font-black ${isLightSystem ? 'text-slate-900' : 'text-white'} mt-1`}>
                      Konfirmasi Transfer Persembahan Jemaat
                    </h3>
                    <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'}`}>
                      Jemaat telah mengunggah bukti transfer. Verifikasi sekarang agar resmi masuk dan tercatat di Kas Gereja.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('keuangan')}
                  className={`px-4 py-2 rounded-xl ${
                    isLightSystem
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700'
                  } text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shrink-0`}
                >
                  <span>Buka Menu Keuangan</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pendingPersembahanList.map((p) => (
                  <div
                    key={p.persembahan_id}
                    className={`p-4 rounded-2xl ${
                      isLightSystem
                        ? 'bg-white border border-slate-200/90 hover:border-amber-400 shadow-xs'
                        : 'bg-slate-950/80 border border-amber-500/30 hover:border-amber-400/60 shadow-lg'
                    } transition-all space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md ${isLightSystem ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'} text-[10px] font-bold`}>
                            {p.jenis || 'Persembahan'}
                          </span>
                          <span className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} font-mono`}>{p.tanggal}</span>
                        </div>
                        <h4 className={`font-extrabold text-sm ${isLightSystem ? 'text-slate-900' : 'text-white'} mt-1`}>
                          {p.nama_pengirim || 'Jemaat'}
                        </h4>
                        <p className={`text-[11px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} line-clamp-1`}>{p.keterangan || '-'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-base font-black ${isLightSystem ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          Rp {p.jumlah.toLocaleString('id-ID')}
                        </div>
                        <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{p.metode_pembayaran || 'Transfer Bank'}</span>
                      </div>
                    </div>

                    {/* Receipt thumbnail & Action buttons */}
                    <div className={`flex items-center justify-between gap-2 pt-2 border-t ${isLightSystem ? 'border-slate-100' : 'border-white/10'}`}>
                      {p.bukti_transfer ? (
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptItem(p)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isLightSystem ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700'} text-xs font-semibold transition-all cursor-pointer`}
                        >
                          <Eye className={`w-3.5 h-3.5 ${isLightSystem ? 'text-emerald-600' : 'text-indigo-400'}`} />
                          <span>Lihat Bukti Transfer</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Tanpa lampiran foto</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRejectPersembahan(p.persembahan_id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Tolak</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerifyPersembahan(p.persembahan_id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Verifikasi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-3.5 rounded-2xl ${
              isLightSystem
                ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900'
                : 'bg-slate-900/60 border border-slate-800/80 text-slate-400'
            } flex items-center justify-between gap-3 text-xs`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Seluruh konfirmasi transfer persembahan jemaat telah terverifikasi (0 transaksi menunggu).</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('keuangan')}
                className={`${isLightSystem ? 'text-emerald-700 hover:text-emerald-800' : 'text-indigo-400 hover:text-indigo-300'} font-semibold flex items-center gap-1 cursor-pointer`}
              >
                <span>Kelola Keuangan &amp; Kas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Charts Section: Line & Doughnut Charts */}
          {(settings.show_finance_chart !== false || settings.show_wilayah_chart !== false) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
              {/* Financial Growth Chart */}
              {settings.show_finance_chart !== false && (
                <div className={`${settings.show_wilayah_chart !== false ? 'lg:col-span-8' : 'lg:col-span-12'} rounded-2xl sm:rounded-3xl ${cardStyleClass} ${isLightSystem ? 'border border-slate-200/90 text-slate-800' : 'text-white'}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <h3 className={`text-base font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Grafik Tren Persembahan &amp; Kas</h3>
                      <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>Statistik akumulasi penerimaan per bulan tahun 2026</p>
                    </div>
                    <button
                      onClick={() => onNavigate('keuangan')}
                      className={`text-xs ${isLightSystem ? 'text-emerald-700 hover:text-emerald-800' : 'text-indigo-400 hover:text-indigo-300'} font-semibold flex items-center gap-1 cursor-pointer`}
                    >
                      <span>Lihat Detail Kas</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-56 sm:h-64 w-full">
                    <Line data={financialChartData} options={financialChartOptions} />
                  </div>
                </div>
              )}

              {/* Wilayah Distribution Chart */}
              {settings.show_wilayah_chart !== false && (
                <div className={`${settings.show_finance_chart !== false ? 'lg:col-span-4' : 'lg:col-span-12'} rounded-2xl sm:rounded-3xl ${cardStyleClass} ${isLightSystem ? 'border border-slate-200/90 text-slate-800' : 'text-white'} flex flex-col justify-between`}>
                  <div>
                    <h3 className={`text-base font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Demografi Per Wilayah</h3>
                    <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} mb-3 sm:mb-4`}>Sebaran lokasi tempat tinggal jemaat</p>
                    <div className="h-44 sm:h-48 w-full flex items-center justify-center">
                      <Doughnut
                        data={wilayahChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom', labels: { color: isLightSystem ? '#475569' : '#94a3b8', boxWidth: 12, font: { size: 10 } } } }
                        }}
                      />
                    </div>
                  </div>
                  <div className={`pt-3 sm:pt-4 border-t ${isLightSystem ? 'border-slate-100' : 'border-white/10'} text-center`}>
                    <button
                      onClick={() => onNavigate('wilayah')}
                      className={`text-xs ${isLightSystem ? 'text-emerald-700 hover:text-emerald-800' : 'text-indigo-400 hover:text-indigo-300'} font-semibold inline-flex items-center gap-1 cursor-pointer`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Kelola Data Wilayah</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Banner Download Aplikasi Mobile Android (.APK) Khusus Pengurus & Admin (Hanya muncul jika sudah login ke gereja masing-masing) */}
          {!isGuestMode && settings.show_apk_banner !== false && settings.show_apk_download_button !== false && !isApkBannerDismissed && (
            <div className="relative p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-teal-950/90 border-2 border-emerald-500/50 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 text-white animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setIsApkBannerDismissed(true);
                  try {
                    localStorage.setItem('cms_apk_banner_hidden', 'true');
                  } catch (e) {}
                }}
                className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 p-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-lg z-10"
                title="Sembunyikan Banner APK dari Dashboard (x)"
                aria-label="Tutup banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3 pr-8 sm:pr-0">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner shrink-0 mt-0.5">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      App Android (.APK)
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 whitespace-nowrap">
                      <ShieldCheck className="w-3 h-3" /> File Resmi {settings.nama_gereja}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white leading-snug">
                    Download Aplikasi Mobile Android {settings.nama_gereja} (.APK)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {churchApkUrl
                      ? `Unduh file APK resmi untuk instalasi di smartphone Android pengurus & jemaat ${settings.nama_gereja}.`
                      : 'Belum ada link APK yang dikonfigurasi untuk gereja ini. Silakan tempelkan link Google Drive APK Anda di bawah ini.'}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 sm:mr-8 pt-1 sm:pt-0">
                {churchApkUrl ? (
                  <a
                    href={churchApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
                  >
                    <Download className="w-4 h-4 animate-pulse shrink-0" />
                    <span>Download File .APK</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomizerOpen(true);
                      setCustomizerTab('media');
                    }}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg border border-amber-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    <Link2 className="w-4 h-4 shrink-0" />
                    <span>Tempelkan Link APK Drive</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      downloadGoogleServicesJsonFile('com.gkfc', settings);
                      setRefreshToast('📥 File google-services.json berhasil didownload!');
                      setTimeout(() => setRefreshToast(''), 3500);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg border border-indigo-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                    title="Download google-services.json untuk Website 2 APK Builder Pro v5.0"
                  >
                    <FileJson className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Download google-services.json</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bottom Section: Today's Schedule & System Logs */}
          {(settings.show_upcoming_events_table !== false || settings.show_system_logs_widget !== false) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
              {/* Today's Schedule */}
              {settings.show_upcoming_events_table !== false && (
                <div className={`${settings.show_system_logs_widget !== false ? 'lg:col-span-6' : 'lg:col-span-12'} p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl ${cardStyleClass} ${isLightSystem ? 'border-slate-200/90 text-slate-800' : 'text-white'}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${isLightSystem ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'} border`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <h3 className={`text-base font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Jadwal Ibadah & Agenda Terbaru</h3>
                    </div>
                    <button
                      onClick={() => onNavigate('agenda')}
                      className={`text-xs ${isLightSystem ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'} font-bold cursor-pointer`}
                    >
                      Semua Agenda &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {eventsList.slice(0, 3).map((evt) => (
                      <div
                        key={evt.event_id}
                        className={`p-3 sm:p-3.5 rounded-2xl ${isLightSystem ? 'bg-slate-50 border-slate-200 hover:border-emerald-300' : 'bg-white/5 border-white/10 hover:border-indigo-500/30'} border flex items-start justify-between gap-3 text-xs transition-all`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded ${isLightSystem ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'} font-bold text-[10px] border`}>
                              {evt.kategori || 'Ibadah'}
                            </span>
                            <span className={`${isLightSystem ? 'text-slate-500' : 'text-slate-400'} text-[11px]`}>{evt.jam}</span>
                          </div>
                          <h4 className={`font-bold ${isLightSystem ? 'text-slate-900' : 'text-slate-100'} text-sm mt-1`}>{evt.nama}</h4>
                          <p className={`${isLightSystem ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>{evt.lokasi} &bull; Pembicara: {evt.pembicara || '-'}</p>
                        </div>
                        <span className={`text-[11px] font-semibold ${isLightSystem ? 'text-slate-700 bg-white border-slate-200' : 'text-slate-300 bg-white/5 border-white/10'} border px-2.5 py-1 rounded-lg shrink-0`}>
                          {evt.tanggal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Logs & Audit Feed */}
              {settings.show_system_logs_widget !== false && (
                <div className={`${settings.show_upcoming_events_table !== false ? 'lg:col-span-6' : 'lg:col-span-12'} p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl ${cardStyleClass} ${isLightSystem ? 'border-slate-200/90 text-slate-800' : 'text-white'}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${isLightSystem ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'} border`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className={`text-base font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'}`}>Aktivitas System Terbaru</h3>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => onNavigate('settings')}
                        className={`text-xs ${isLightSystem ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'} font-bold cursor-pointer`}
                      >
                        Audit Log &rarr;
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {activityLogs.slice(0, 4).map((log) => (
                      <div
                        key={log.log_id}
                        className={`p-3 rounded-2xl ${isLightSystem ? 'bg-slate-50 border-slate-200 hover:border-emerald-300' : 'bg-white/5 border-white/10 hover:border-white/20'} border flex items-center justify-between text-xs transition-all`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isLightSystem ? 'text-emerald-800' : 'text-indigo-300'}`}>{log.user}</span>
                            <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-500'}`}>&bull; {log.module || 'System'}</span>
                          </div>
                          <p className={`${isLightSystem ? 'text-slate-700' : 'text-slate-300'} line-clamp-1`}>{log.aktivitas}</p>
                        </div>
                        <span className={`text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-500'} shrink-0`}>{log.tanggal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* QUICK MODAL EDIT WARTA & PENGUMUMAN DENGAN ICON TOA */}
      {isEditWartaModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-white space-y-4 animate-scale-up my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Megaphone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Edit Warta &amp; Pengumuman Gereja</h3>
                  <p className="text-xs text-slate-400">Pengaturan pesan ticker berjalan dengan icon Toa di Dashboard.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditWartaModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {wartaSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0">
                <Check className="w-4 h-4" />
                <span>Warta &amp; Pengumuman berhasil disimpan dan langsung tampil di Dashboard!</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickWarta} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Live Preview Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Pratinjau Langsung di Dashboard:
                </label>
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center gap-3 shadow-inner">
                  <span className="p-2 rounded-xl bg-amber-500/30 text-amber-300 border border-amber-400/40 shrink-0">
                    <Megaphone className="w-4 h-4 animate-pulse text-amber-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block sm:inline mr-2">
                      Warta &amp; Pengumuman Gereja:
                    </span>
                    <span className="text-xs font-semibold text-slate-100 break-words">
                      {wartaText.trim() || 'Teks warta pengumuman akan tampil di sini...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sakelar Tampilkan / Sembunyikan */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-xs">Status Banner Warta Toa</div>
                  <div className="text-[10px] text-slate-400">Aktifkan untuk menampilkan banner pengumuman ini di dashboard</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wartaBannerActive}
                    onChange={(e) => setWartaBannerActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Input Teks Warta */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold text-xs">
                  Isi Teks Pengumuman / Warta Jemaat:
                </label>
                <textarea
                  rows={3}
                  value={wartaText}
                  onChange={(e) => setWartaText(e.target.value)}
                  placeholder="Contoh: Ibadah Raya Minggu ini diadakan pukul 09.00 WIB di Gedung Utama. Dilanjutkan perjamuan kudus..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Template Cepat */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">Pilih Template Pengumuman Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Ibadah Raya Minggu ini dimulai pukul 09:00 WIB. Mohon hadir 15 menit sebelum ibadah.',
                    'Pekan Doa & Puasa bersama seluruh jemaat akan diadakan Rabu - Jumat pk. 19:00 WIB.',
                    'Aksi Sosial & Donor Darah Gereja hari Sabtu depan pk 08:30 WIB. Mari berpartisipasi!',
                    'Pendaftaran Baptisan Kudus & Kelas Katekisasi telah dibuka. Hubungi Sekretariat.'
                  ].map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWartaText(tpl)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] text-left transition-all cursor-pointer"
                    >
                      {tpl.substring(0, 36)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Kirim Push Notifikasi ke Status Bar HP Android (Website 2 APK Builder) */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>Kirim Push Notifikasi ke Status Bar HP Android</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Website 2 APK
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Notifikasi berdering dan muncul di bar atas HP jemaat meski aplikasi sedang ditutup.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPushOnSaveWarta}
                    onChange={(e) => setSendPushOnSaveWarta(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Bantuan Website 2 APK Builder & Status OneSignal */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAndroidStudioModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    title="Buka Pengaturan Tampilan Profesional & Push Notifikasi Firebase untuk Android Studio"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                    <span>📱 Konversi Android Studio &amp; FCM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWebsite2ApkGuideOpen(true)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Panduan Website 2 APK Builder</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    downloadGoogleServicesJsonFile('com.gkfc', settings);
                    setRefreshToast('📥 File google-services.json berhasil didownload!');
                    setTimeout(() => setRefreshToast(''), 3500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Download file konfigurasi google-services.json untuk Website 2 APK"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Download google-services.json</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditWartaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 text-xs cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Simpan Perubahan Warta Toa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CUSTOMIZER MODAL FOR SUPERADMIN & ADMIN */}
      {isCustomizerOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Palette className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">Custom Tampilan &amp; Layout Portal</h3>
                  <p className="text-xs text-slate-400">Atur warta toa, tema warna, layout kartu, logo gereja, dan visibilitas komponen dashboard.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2.5 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0 bg-slate-950/70">
              {[
                { id: 'preview', label: '📱💻 Model Preview HP & Desktop' },
                { id: 'warta', label: '📢 Warta Toa' },
                { id: 'theme', label: '🎨 Tema & Warna' },
                { id: 'layout', label: '📐 Lebar & Layout Kartu' },
                { id: 'identity', label: '🏛️ Logo & Header' },
                { id: 'widgets', label: '🎛️ Komponen (19 Widget)' },
                { id: 'media', label: '🎬 Video & APK' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCustomizerTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    customizerTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {saveSuccessMsg && (
              <div className="mx-5 sm:mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0">
                <Check className="w-4 h-4" />
                <span>Kustomisasi tampilan berhasil disimpan!</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomizer} className="flex-1 flex flex-col min-h-0">
              {/* Tab Contents Area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-5">
                {/* TAB 0: MODEL PREVIEW UNTUK TAMPILAN HANDPHONE & DESKTOP */}
                {customizerTab === 'preview' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Pratinjau Model Tampilan Realtime</span>
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Pilih model preview untuk melihat bagaimana header, warta, tema warna, dan kartu dashboard tampil di layar Handphone dan Desktop.
                        </p>
                      </div>

                      {/* Device Switcher Toggle Buttons */}
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => setCustomizerPreviewDevice('DESKTOP')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            customizerPreviewDevice === 'DESKTOP'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>💻 Layar Desktop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomizerPreviewDevice('MOBILE')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            customizerPreviewDevice === 'MOBILE'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>📱 Layar Handphone (HP)</span>
                        </button>
                      </div>
                    </div>

                    {/* DESKTOP MODEL PREVIEW */}
                    {customizerPreviewDevice === 'DESKTOP' && (
                      <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl animate-fade-in">
                        {/* Browser Chrome Header */}
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                          </div>
                          <div className="px-3 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 truncate max-w-sm">
                            <span className="text-emerald-400">🔒</span>
                            <span>https://{customForm.nama_gereja?.toLowerCase().replace(/\s+/g, '') || 'gereja'}.org/dashboard</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 hidden sm:inline">1920 × 1080 (Desktop)</span>
                        </div>

                        {/* Desktop Header Banner */}
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 border-b border-teal-500/30 text-white flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={customForm.logo || DEFAULT_CHURCH_LOGO}
                              alt="Logo"
                              className="w-10 h-10 rounded-xl object-cover border border-white/20"
                            />
                            <div>
                              <h3 className="text-base font-black text-white leading-tight">
                                {customForm.header_title || customForm.nama_gereja || 'Jesus Kingdom Christ'}
                              </h3>
                              <p className="text-xs text-teal-200/80">
                                {customForm.header_subtitle || 'Portal Informasi Utama Gereja'} &bull; Shalom, Administrator
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-teal-500/20 text-teal-200 border border-teal-500/30 text-[10px] font-mono font-bold">
                              10:30:15 WIB
                            </span>
                          </div>
                        </div>

                        {/* Desktop Body Content */}
                        <div className="p-4 space-y-3 bg-slate-900/50">
                          {/* Warta Toa Ticker */}
                          {customForm.show_pinned_notif_banner !== false && (
                            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span className="font-bold text-amber-300">WARTA GEREJA:</span>
                                <span className="text-slate-200 truncate">{customForm.jemaat_announcement_text || 'Ibadah Raya Minggu ini diadakan pukul 09:00 WIB di Gedung Utama.'}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-bold">Toa Banner</span>
                            </div>
                          )}

                          {/* Desktop Cards Grid */}
                          <div className="grid grid-cols-4 gap-3 text-slate-300">
                            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Jemaat</p>
                              <p className="text-lg font-black text-white">1.250 Jiwa</p>
                              <p className="text-[10px] text-emerald-400 font-medium">↑ 12 anggota baru</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Saldo Kas</p>
                              <p className="text-lg font-black text-emerald-400">Rp 85,4 Jt</p>
                              <p className="text-[10px] text-teal-300 font-medium">Buku Kas Terverifikasi</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Jadwal Minggu</p>
                              <p className="text-lg font-black text-amber-300">09.00 WIB</p>
                              <p className="text-[10px] text-slate-400 font-medium">Gedung Utama</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Renungan Harian</p>
                              <p className="text-xs font-bold text-white line-clamp-1">Kasih Yang Memulihkan</p>
                              <p className="text-[10px] text-indigo-300 font-medium">1 Korintus 13:4-8</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MOBILE / HANDPHONE MODEL PREVIEW */}
                    {customizerPreviewDevice === 'MOBILE' && (
                      <div className="w-72 sm:w-80 mx-auto rounded-[2.5rem] border-4 border-slate-700 bg-slate-950 p-2 shadow-2xl relative overflow-hidden animate-fade-in">
                        {/* Dynamic Island / Speaker Pill */}
                        <div className="flex items-center justify-center pt-1 pb-1.5">
                          <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-1.5 border border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-slate-950" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
                          </div>
                        </div>

                        {/* Mobile Status Bar */}
                        <div className="flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono pb-1">
                          <span>09:41</span>
                          <div className="flex items-center gap-1 text-[9px]">
                            <span>5G</span>
                            <span>📶 90%</span>
                          </div>
                        </div>

                        {/* Mobile Header (Tanpa Portal Jemaat & Tanpa Jam Numpuk) */}
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 border border-teal-500/30 text-white flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={customForm.logo || DEFAULT_CHURCH_LOGO}
                              alt="Logo"
                              className="w-7 h-7 rounded-lg object-cover border border-white/20 shrink-0"
                            />
                            <div className="truncate">
                              <h4 className="text-xs font-black truncate leading-tight">
                                {customForm.header_title || customForm.nama_gereja || 'Jesus Kingdom Christ'}
                              </h4>
                              <p className="text-[9px] text-teal-200/80 truncate">
                                {customForm.header_subtitle || 'Portal Gereja'}
                              </p>
                            </div>
                          </div>
                          <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            JM
                          </span>
                        </div>

                        {/* Mobile Body Content */}
                        <div className="py-2.5 px-1 space-y-2">
                          {/* Warta Toa Ticker */}
                          {customForm.show_pinned_notif_banner !== false && (
                            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[9px] text-amber-200 flex items-center gap-1.5">
                              <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate font-semibold">{customForm.jemaat_announcement_text || 'Ibadah Raya Minggu ini diadakan pukul 09:00 WIB di Gedung Utama.'}</span>
                            </div>
                          )}

                          {/* Quick Circular Action Buttons */}
                          <div className="grid grid-cols-4 gap-1.5 text-center text-[8px] font-bold text-slate-300">
                            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="text-xs mb-0.5">📖</div>
                              <span>Alkitab</span>
                            </div>
                            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="text-xs mb-0.5">🎵</div>
                              <span>Pujian</span>
                            </div>
                            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="text-xs mb-0.5">🙏</div>
                              <span>Doa</span>
                            </div>
                            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="text-xs mb-0.5">💰</div>
                              <span>Persembahan</span>
                            </div>
                          </div>

                          {/* Mobile 2x2 Mini Stats */}
                          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              <p className="text-slate-400 text-[8px]">Jadwal Ibadah</p>
                              <p className="font-bold text-amber-300">Minggu 09.00</p>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              <p className="text-slate-400 text-[8px]">Renungan Harian</p>
                              <p className="font-bold text-white truncate">Kasih Sejati</p>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Bottom Navigation Bar Preview */}
                        <div className="mt-1 rounded-2xl p-1.5 bg-slate-900 border border-slate-800 flex items-center justify-around text-[8px] text-slate-400">
                          <div className="flex flex-col items-center gap-0.5 text-teal-400 font-bold">
                            <span>🏠</span>
                            <span>Home</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span>📖</span>
                            <span>Renungan</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span>📅</span>
                            <span>Jadwal</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span>👤</span>
                            <span>Profil</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span>⋯</span>
                            <span>Lainnya</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* TAB 1: WARTA & PENGUMUMAN DENGAN ICON TOA */}
                {customizerTab === 'warta' && (
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-200 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                          <Megaphone className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>Warta &amp; Pengumuman Gereja di Dashboard (Icon Toa)</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-200 font-semibold bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 w-fit">
                          <input
                            type="checkbox"
                            checked={customForm.show_pinned_notif_banner !== false}
                            onChange={(e) => setCustomForm({ ...customForm, show_pinned_notif_banner: e.target.checked })}
                            className="rounded border-amber-500 text-amber-600 focus:ring-amber-500 w-4 h-4"
                          />
                          <span>Tampilkan Banner Toa</span>
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Teks pengumuman ini akan muncul di bagian paling atas halaman Dashboard dengan icon <strong>Toa (Megaphone)</strong> berkedip untuk seluruh jemaat dan pengunjung.
                      </p>

                      {/* Pratinjau Tampilan Dashboard */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          Pratinjau Langsung di Dashboard:
                        </span>
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-amber-500/30 text-amber-300 border border-amber-400/40 shrink-0">
                            <Megaphone className="w-4 h-4 animate-pulse text-amber-400" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block sm:inline mr-2">
                              Warta &amp; Pengumuman Gereja:
                            </span>
                            <span className="text-xs font-semibold text-slate-100 break-words">
                              {customForm.jemaat_announcement_text?.trim() || 'Teks pengumuman yang Anda ketik di bawah akan tampil di sini...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-200 font-semibold text-xs">
                          Isi Teks Pengumuman / Warta:
                        </label>
                        <textarea
                          rows={3}
                          value={customForm.jemaat_announcement_text || ''}
                          onChange={(e) => setCustomForm({ ...customForm, jemaat_announcement_text: e.target.value })}
                          placeholder="Contoh: Ibadah Raya Minggu ini diadakan pukul 09:00 WIB di Gedung Utama. Dilanjutkan perjamuan kudus..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Template Cepat */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">Template Pengumuman Rekomendasi:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Ibadah Raya Minggu ini dimulai pukul 09:00 WIB. Mohon hadir 15 menit sebelum ibadah.',
                            'Pekan Doa & Puasa bersama seluruh jemaat akan diadakan Rabu - Jumat pk. 19:00 WIB.',
                            'Aksi Sosial & Donor Darah Gereja hari Sabtu depan pk 08:30 WIB. Mari berpartisipasi!',
                            'Pendaftaran Baptisan Kudus & Kelas Katekisasi telah dibuka. Hubungi Sekretariat.'
                          ].map((tpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCustomForm({ ...customForm, jemaat_announcement_text: tpl })}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] text-left transition-all cursor-pointer"
                            >
                              {tpl.substring(0, 36)}...
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tombol Simpan Langsung Tab Warta */}
                      <div className="pt-3 border-t border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveCustomizer}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>Simpan Pengumuman Toa Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TEMA & WARNA */}
                {customizerTab === 'theme' && (
                  <div className="space-y-5">
                    {/* Preset Tema */}
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <label className="font-bold text-slate-300 block text-xs sm:text-sm">Preset Warna Tema Background</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'EMERALD_LIGHT', label: '🌿 Emerald Light (Universal)' },
                          { id: 'DARK_SLATE', label: '🌌 Dark Slate' },
                          { id: 'MIDNIGHT_BLUE', label: '💙 Sapphire Blue' },
                          { id: 'DEEP_PURPLE', label: '💜 Amethyst' },
                          { id: 'FOREST_GREEN', label: '🌲 Emerald Green' },
                          { id: 'WARM_GOLD', label: '⚜️ Warm Gold' },
                          { id: 'LUXE_LIGHT', label: '☀️ Soft Light' }
                        ].map((t) => {
                          const isSelected = (customForm.theme_preset || 'EMERALD_LIGHT') === t.id;
                          return (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() => setCustomForm({ ...customForm, theme_preset: t.id as any })}
                              className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer flex items-center justify-between px-3 ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-600/30 text-white font-bold ring-2 ring-indigo-500/50 shadow-md'
                                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <span className="truncate">{t.label}</span>
                              <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ml-1 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Style Kartu */}
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <label className="font-bold text-slate-300 block text-xs sm:text-sm">Style Kartu &amp; Border</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: 'GLASS', label: '✨ Glassmorphism (Blur Transparan)' },
                          { id: 'SOLID', label: '⬛ Solid Dark Glass' },
                          { id: 'NEON', label: '💡 Neon Glow Accent' },
                          { id: 'FLAT', label: '📄 Flat Border Minimal' }
                        ].map((c) => {
                          const isSelected = (customForm.card_style || 'GLASS') === c.id;
                          return (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setCustomForm({ ...customForm, card_style: c.id as any })}
                              className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between px-3 ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-600/30 text-white font-bold ring-2 ring-indigo-500/50 shadow-md'
                                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <span className="truncate">{c.label}</span>
                              <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ml-1 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background Kartu */}
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <label className="block text-indigo-300 font-bold text-xs sm:text-sm">
                        Style Warna Background Seluruh Kartu Dashboard (Statistik, Widget, dsb)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          { id: 'DEFAULT_GLASS', label: '✨ Transparan Glass' },
                          { id: 'GRADIENT_INDIGO', label: '🌌 Royal Twilight' },
                          { id: 'GRADIENT_PURPLE', label: '🔮 Amethyst Majesty' },
                          { id: 'GRADIENT_GOLD', label: '👑 Golden Grace' },
                          { id: 'GRADIENT_EMERALD', label: '🌿 Emerald Divine' },
                          { id: 'OCEAN_BLUE', label: '🌊 Ocean Waves' },
                          { id: 'OBSIDIAN_NIGHT', label: '🖤 Obsidian Night' },
                          { id: 'SOLID_SLATE', label: '⬛ Solid Dark' },
                          { id: 'NEON_CYAN', label: '💡 Neon Cyan' }
                        ].map((cb) => {
                          const isSelected = (customForm.jemaat_cards_bg || 'DEFAULT_GLASS') === cb.id;
                          return (
                            <button
                              type="button"
                              key={cb.id}
                              onClick={() => setCustomForm({ ...customForm, jemaat_cards_bg: cb.id as any })}
                              className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between px-3 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-950/80 ring-1 ring-indigo-500/50 text-white'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span className="truncate">{cb.label}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-1 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background Banner Jemaat */}
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <label className="block text-indigo-300 font-bold text-xs sm:text-sm">
                        Style Background Banner Utama Jemaat (Paling Atas)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          { id: 'GRADIENT_INDIGO', label: '🌌 Royal Twilight' },
                          { id: 'GRADIENT_GOLD', label: '👑 Golden Grace' },
                          { id: 'GRADIENT_EMERALD', label: '🌿 Emerald Divine' },
                          { id: 'GRADIENT_PURPLE', label: '🔮 Amethyst Majesty' },
                          { id: 'OBSIDIAN_NIGHT', label: '🖤 Obsidian Night' },
                          { id: 'OCEAN_BLUE', label: '🌊 Ocean Waves' }
                        ].map((gb) => {
                          const isSelected = (customForm.jemaat_banner_bg || 'GRADIENT_INDIGO') === gb.id;
                          return (
                            <button
                              type="button"
                              key={gb.id}
                              onClick={() => setCustomForm({ ...customForm, jemaat_banner_bg: gb.id as any })}
                              className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between px-3 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-950/80 ring-1 ring-indigo-500/50 text-white'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span className="truncate">{gb.label}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-1 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LEBAR & LAYOUT KARTU */}
                {customizerTab === 'layout' && (
                  <div className="space-y-5">
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-indigo-300 block text-xs sm:text-sm">
                          Pengaturan Lebar Kartu Dashboard Jemaat &amp; Mobile View
                        </label>
                        <span className="text-[10px] text-indigo-400 font-mono font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Pilih 1 Ukuran
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          { id: 'CONTAINED', label: '🛡️ Standard (Max 5XL)', desc: 'Rekomendasi Desktop & Tablet' },
                          { id: 'FULL', label: '🖥️ Full Width (100%)', desc: 'Memenuhi Seluruh Layar Penuh' },
                          { id: 'MOBILE_COMPACT', label: '📱 Compact Mobile', desc: 'Rapat Rapi Fokus Hape' }
                        ].map((cw) => {
                          const isSelected =
                            (customForm.jemaat_card_width || 'CONTAINED') === cw.id ||
                            (cw.id === 'MOBILE_COMPACT' && customForm.jemaat_card_width === 'COMPACT');
                          return (
                            <button
                              type="button"
                              key={cw.id}
                              onClick={() => setCustomForm({ ...customForm, jemaat_card_width: cw.id as any })}
                              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-1 ring-indigo-500/50 shadow-md'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="font-bold text-xs">{cw.label}</span>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-400">{cw.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-indigo-300 block text-xs sm:text-sm">
                          Ukuran Density / Padding Kartu
                        </label>
                        <span className="text-[10px] text-indigo-400 font-mono font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Pilih 1 Density
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          { id: 'COMPACT', label: '⚡ Ringkas (Hape)' },
                          { id: 'NORMAL', label: '⚖️ Normal Standar' },
                          { id: 'SPACIOUS', label: '✨ Lega & Mewah' }
                        ].map((cs) => {
                          const isSelected = (customForm.card_size || 'NORMAL') === cs.id;
                          return (
                            <button
                              type="button"
                              key={cs.id}
                              onClick={() => setCustomForm({ ...customForm, card_size: cs.id as any })}
                              className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer flex items-center justify-between px-3 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-1 ring-indigo-500/50 shadow-md'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className="font-semibold">{cs.label}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-1 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: IDENTITAS & LOGO GEREJA */}
                {customizerTab === 'identity' && (
                  <div className="space-y-4">
                    <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <label className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-indigo-400" />
                          <span>Logo &amp; Identitas Gereja (Tampil di Semua User &amp; Device)</span>
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                        <div className="shrink-0 relative group">
                          <img
                            src={customForm.logo || DEFAULT_CHURCH_LOGO}
                            alt="Logo Preview"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                            }}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md bg-slate-950"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-indigo-600 text-[9px] font-bold text-white rounded-full">
                            Preview
                          </span>
                        </div>

                        <div className="flex-1 space-y-2.5 w-full min-w-0">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={customForm.logo || ''}
                              placeholder="Paste URL Gambar Logo atau Upload File..."
                              onChange={(e) => setCustomForm({ ...customForm, logo: e.target.value })}
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px] min-w-0"
                            />
                            <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      if (evt.target?.result) {
                                        setCustomForm({ ...customForm, logo: evt.target.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">Preset Logo:</span>
                            <button
                              type="button"
                              onClick={() => setCustomForm({ ...customForm, logo: DEFAULT_CHURCH_LOGO })}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold hover:bg-indigo-900 transition-all cursor-pointer"
                            >
                              Default Gold Cross
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCustomForm({
                                  ...customForm,
                                  logo: 'https://images.unsplash.com/photo-1548625361-185966347898?w=300&auto=format&fit=crop&q=80'
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[10px] hover:bg-slate-700 transition-all cursor-pointer"
                            >
                              Cathedral Photo
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold text-xs">Judul Header Dashboard</label>
                          <input
                            type="text"
                            value={customForm.header_title || ''}
                            placeholder="Jesus Kingdom Christ"
                            onChange={(e) => setCustomForm({ ...customForm, header_title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold text-xs">Subtitle Header</label>
                          <input
                            type="text"
                            value={customForm.header_subtitle || ''}
                            placeholder="Sistem Informasi & Portal Layanan Jemaat"
                            onChange={(e) => setCustomForm({ ...customForm, header_subtitle: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: VISIBILITAS 19 WIDGET */}
                {customizerTab === 'widgets' && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <DashboardVisibilityManager
                      settings={customForm}
                      onChange={(newSettings) => setCustomForm(newSettings)}
                    />
                  </div>
                )}

                {/* TAB 6: VIDEO & MOBILE APK */}
                {customizerTab === 'media' && (
                  <div className="space-y-4">
                    {/* Video Social Media */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-indigo-400" />
                          <span>Link Video Media Sosial (YouTube / Shorts / Reels / TikTok)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={customForm.video_enabled !== false}
                            onChange={(e) => setCustomForm({ ...customForm, video_enabled: e.target.checked })}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span className="text-emerald-400 font-semibold">Aktifkan Video</span>
                        </label>
                      </div>

                      <p className="text-[11px] text-indigo-300/90 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                        💡 <strong>Info:</strong> Tayangan video ini tampil secara otomatis di <strong>dashboard Jemaat pada bagian paling bawah</strong>.
                      </p>

                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=5qap5aO4i9A atau Shorts / Reels"
                        value={customForm.video_url || ''}
                        onChange={(e) => setCustomForm({ ...customForm, video_url: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-white font-mono text-[11px]"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Judul Video</label>
                          <input
                            type="text"
                            placeholder="Tayangan Ibadah Raya Minggu Ini"
                            value={customForm.video_title || ''}
                            onChange={(e) => setCustomForm({ ...customForm, video_title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Deskripsi Video</label>
                          <input
                            type="text"
                            placeholder="Saksikan firman Tuhan dan puji-pujian..."
                            value={customForm.video_description || ''}
                            onChange={(e) => setCustomForm({ ...customForm, video_description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kontrol Mobile APK Android */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 shadow-inner">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>Kontrol Tombol Melayang Download APK Mobile Android</span>
                        </div>
                        <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Mobile APK Control
                        </span>
                      </div>

                      <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-all">
                        <div>
                          <div className="font-bold text-xs text-emerald-300">
                            Tampilkan Tombol Melayang Download APK Mobile Android
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Tombol melayang akan selalu tampil di sudut kanan bawah dashboard HP Android &amp; Desktop.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={customForm.show_apk_download_button !== false}
                          onChange={(e) => setCustomForm({ ...customForm, show_apk_download_button: e.target.checked })}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                        />
                      </label>

                      {/* Notifikasi jika saat ini disembunyikan oleh tombol (X) */}
                      {(isApkHiddenByX || isApkBannerDismissed) && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300 animate-fade-in">
                          <div className="text-[11px] leading-tight">
                            <span className="font-bold text-amber-200">Status Tombol / Banner:</span> Saat ini disembunyikan via tombol silang (x) di dashboard.
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                localStorage.removeItem('cms_apk_button_hidden');
                                localStorage.removeItem('cms_apk_banner_hidden');
                                setIsApkHiddenByX(false);
                                setIsApkBannerDismissed(false);
                                window.dispatchEvent(new CustomEvent('cms_apk_hidden_changed', { detail: { hidden: false } }));
                              } catch (err) {}
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shrink-0 transition-all shadow-md active:scale-95"
                          >
                            Tampilkan Kembali
                          </button>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-slate-300 font-semibold text-xs">
                            Link Tautan Google Drive File .APK Khusus {settings.nama_gereja}:
                          </label>
                          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            Terpisah Per-Gereja
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            value={customForm.apk_download_url || ''}
                            onChange={(e) => setCustomForm({ ...customForm, apk_download_url: e.target.value })}
                            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500 min-w-0"
                          />
                          {customForm.apk_download_url && (
                            <a
                              href={customForm.apk_download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 shrink-0 transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Tes Link</span>
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Setiap gereja dapat menempelkan link Google Drive miliknya sendiri di sini. Pastikan akses link Drive diatur ke "Siapa saja yang memiliki link".
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BUAT NOTIFIKASI / PERINGATAN (ADMIN & SUPERADMIN) */}
      {isCreateNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white border-2 border-teal-200/90 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden text-slate-800">
            <div className="flex items-center justify-between border-b border-teal-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 shadow-2xs">
                  <BellRing className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Buat Notifikasi & Peringatan Jemaat
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pesan akan langsung tampil sebagai kartu utama di Dashboard Jemaat.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateNotifModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotification} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Informasi / Peringatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: ⚠️ Peringatan Perubahan Jadwal Ibadah Minggu"
                  value={newNotifForm.judul}
                  onChange={(e) => setNewNotifForm({ ...newNotifForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori / Tipe Pesan
                  </label>
                  <select
                    value={newNotifForm.tipe}
                    onChange={(e) => setNewNotifForm({ ...newNotifForm, tipe: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="Peringatan">⚠️ Peringatan (Warning)</option>
                    <option value="Penting">🚨 Informasi Penting (Urgent)</option>
                    <option value="Informasi">📢 Pengumuman Biasa (Info)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Penerima
                  </label>
                  <select
                    value={newNotifForm.tujuan_role}
                    onChange={(e) => setNewNotifForm({ ...newNotifForm, tujuan_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="ALL">Semua Pengguna (Jemaat & Admin)</option>
                    <option value="JEMAAT">Khusus Jemaat</option>
                    <option value="ADMIN">Khusus Pengurus / Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pesan Notifikasi / Peringatan Detail *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan isi detail pengumuman atau instruksi peringatan untuk jemaat gereja..."
                  value={newNotifForm.pesan}
                  onChange={(e) => setNewNotifForm({ ...newNotifForm, pesan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950 flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span>
                  <strong>Realtime Bridge Aktif:</strong> Notifikasi otomatis disiarkan langsung ke seluruh HP dan akun jemaat secara real-time.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-teal-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateNotifModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-extrabold shadow-md shadow-teal-600/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Notifikasi Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REKAP RESERVASI KURSI JEMAAT UNTUK ADMIN */}
      {isAdminResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border-2 border-teal-200/90 rounded-3xl p-5 sm:p-6 text-slate-800 space-y-4 shadow-2xl relative my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 shadow-2xs">
                  <Ticket className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Daftar Reservasi Kursi Jemaat</h3>
                  <p className="text-[11px] text-teal-700 font-bold">
                    Total {reservationsList.length} Pemesanan ({reservationsList.reduce((acc, r) => acc + (Number(r.jumlah_kursi) || 1), 0)} Kursi)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminResModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminResToast && (
              <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 shrink-0 ${
                adminResToast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : adminResToast.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-teal-50 border-teal-300 text-teal-800'
              }`}>
                {adminResToast.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
                <span>{adminResToast.message}</span>
              </div>
            )}

            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {reservationsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum Ada Data Reservasi Kursi</p>
                  <p className="text-[11px]">Reservasi yang dilakukan jemaat dari halaman utama akan otomatis muncul di sini.</p>
                </div>
              ) : (
                reservationsList.map((res) => {
                  const evtInfo = eventsList.find((e) => e.event_id === res.event_id);
                  return (
                    <div
                      key={res.reservation_id}
                      className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-200 hover:border-teal-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">{res.nama_jemaat}</span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-extrabold text-[10px] border border-teal-200">
                            {res.jumlah_kursi} Kursi
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            res.status === 'TERKONFIRMASI'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : res.status === 'DITOLAK'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : res.status === 'DIBATALKAN'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          }`}>
                            {res.status === 'TERKONFIRMASI'
                              ? '✅ Diterima'
                              : res.status === 'DITOLAK'
                              ? '❌ Ditolak'
                              : res.status === 'DIBATALKAN'
                              ? 'Dibatalkan'
                              : '⏳ Menunggu'}
                          </span>
                        </div>
                        <p className="text-xs text-teal-800 font-semibold">
                          Event: {evtInfo ? evtInfo.nama : res.event_id}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>WA: <a href={`https://wa.me/${res.nomor_wa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline font-mono font-bold">{res.nomor_wa}</a></span>
                          <span>Waktu: {res.tanggal_reservasi}</span>
                          {res.catatan && <span className="italic text-slate-600">"{res.catatan}"</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                        {res.status !== 'TERKONFIRMASI' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(res.reservation_id, 'TERKONFIRMASI')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                            title="Konfirmasi & Terima reservasi jemaat"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Terima</span>
                          </button>
                        )}
                        {res.status !== 'DITOLAK' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(res.reservation_id, 'DITOLAK')}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                            title="Tolak permohonan reservasi"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            const ok = await confirmDialog({
                              title: 'Hapus Reservasi',
                              message: `Hapus reservasi atas nama ${res.nama_jemaat}?`,
                              confirmText: 'Ya, Hapus',
                              cancelText: 'Batal',
                              isDanger: true,
                            });
                            if (ok) {
                              const updated = reservationsList.filter((r) => r.reservation_id !== res.reservation_id);
                              StorageManager.saveEventReservations(updated);
                              setReservationsList(updated);
                              window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'reservation_deleted' } }));
                            }
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Hapus data reservasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setIsAdminResModalOpen(false);
                  onNavigate('agenda');
                }}
                className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1"
              >
                <span>Buka Kalender &amp; Agenda Lengkap &rarr;</span>
              </button>
              <button
                onClick={() => setIsAdminResModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESERVASI KURSI / EVENT UNTUK JEMAAT */}
      {isEventResModalOpen && selectedEventForRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-2xl relative my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Formulir Reservasi Kursi</h3>
                  <p className="text-[10px] text-amber-300 font-bold truncate max-w-[200px] sm:max-w-[280px]">
                    Event: {selectedEventForRes.nama}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEventResModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {eventResMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold border shrink-0 ${
                  eventResMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {eventResMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveEventReservation} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Lengkap Jemaat *</label>
                <input
                  type="text"
                  required
                  value={eventResForm.nama_jemaat}
                  onChange={(e) => setEventResForm({ ...eventResForm, nama_jemaat: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  placeholder="Nama pemesan kursi..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nomor WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={eventResForm.nomor_wa}
                  onChange={(e) => setEventResForm({ ...eventResForm, nomor_wa: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-semibold"
                  placeholder="0812xxxxxxx"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Jumlah Kursi Dipesan *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={eventResForm.jumlah_kursi}
                  onChange={(e) => setEventResForm({ ...eventResForm, jumlah_kursi: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Catatan Khusus (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Butuh kursi lansia / dengan anak-anak"
                  value={eventResForm.catatan}
                  onChange={(e) => setEventResForm({ ...eventResForm, catatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEventResModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Kirim Reservasi Ke Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SuperAdmin Support & Chat Modal */}
      <SuperAdminChatModal
        isOpen={isSuperAdminChatModalOpen}
        onClose={() => setIsSuperAdminChatModalOpen(false)}
        churchName={settings.nama_gereja}
      />

      {/* Floating APK Download Button for Android (Hanya muncul ketika sudah login pada gereja masing-masing) */}
      {!isGuestMode && (
        <FloatingApkDownloadButton
          settings={settings}
          currentUser={currentUser}
          onOpenSettings={() => {
            if (isAdmin) {
              setIsCustomizerOpen(true);
              setCustomizerTab('media');
            }
          }}
        />
      )}

      {/* Fullscreen Renungan Modal */}
      <RenunganFullscreenModal
        renungan={selectedRenunganForModal}
        onClose={() => setSelectedRenunganForModal(null)}
      />

      {/* Fullscreen QRIS Zoom Modal */}
      {isQrisZoomModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className={`w-full max-w-lg ${
            isLightSystem
              ? 'bg-white border-2 border-teal-300 text-slate-900 shadow-2xl'
              : 'bg-slate-900 border-2 border-emerald-500/50 text-white shadow-2xl'
          } rounded-3xl p-5 sm:p-8 space-y-5 text-center relative my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto`}>
            <button
              onClick={() => setIsQrisZoomModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-full ${
                isLightSystem
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              } transition-colors cursor-pointer`}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-1">
              <span className={`px-3 py-1 rounded-full ${
                isLightSystem
                  ? 'bg-teal-100 text-teal-800 border border-teal-200'
                  : 'bg-emerald-500/20 text-emerald-400'
              } text-xs font-black tracking-widest uppercase`}>
                QRIS RESMI GEREJA
              </span>
              <h3 className={`text-lg sm:text-xl font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'} mt-2`}>
                {settings.nama_gereja || 'Jesus Kingdom Christ'}
              </h3>
              <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-400'}`}>
                Pindai menggunakan aplikasi e-Wallet atau M-Banking apapun
              </p>
            </div>

            <div className={`p-4 rounded-2xl ${
              isLightSystem
                ? 'bg-teal-50/50 border-4 border-teal-400/80 shadow-xl ring-4 ring-teal-100/60'
                : 'bg-white border-4 border-emerald-500 shadow-2xl'
            } mx-auto inline-block`}>
              {settings.qris_image_url ? (
                <img
                  src={settings.qris_image_url}
                  alt="Barcode QRIS Fullscreen"
                  className="w-72 h-72 sm:w-96 sm:h-96 object-contain rounded-lg bg-white"
                />
              ) : (
                <div className="w-72 h-72 sm:w-96 sm:h-96 bg-white flex flex-col items-center justify-center text-slate-800 p-4 rounded-lg">
                  <QrCode className="w-24 h-24 text-teal-600 mb-2" />
                  <span className="font-extrabold text-base">QRIS DIGITAL GEREJA</span>
                  <span className="text-xs text-slate-500 mt-1">{settings.rekening_bank_atas_nama || settings.nama_gereja || 'Jesus Kingdom Christ'}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const num = settings.rekening_bank_nomor || '527-089-1122';
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(num);
                    setCopiedBankNum(true);
                    setTimeout(() => setCopiedBankNum(false), 2000);
                  }
                }}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${
                  isLightSystem
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                } font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer`}
              >
                {copiedBankNum ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBankNum ? 'No. Rekening Tersalin!' : 'Salin No. Rekening Bank'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQrisZoomModalOpen(false)}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${
                  isLightSystem
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                } font-bold text-xs cursor-pointer`}
              >
                Tutup Layar Penuh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan Notifikasi Website 2 APK Builder */}
      <Website2ApkNotificationGuideModal
        isOpen={isWebsite2ApkGuideOpen}
        onClose={() => setIsWebsite2ApkGuideOpen(false)}
        senderId={settings.onesignal_google_project_number || '250034601366'}
        appUrl={window.location.origin}
      />

      {/* Modal Konversi Android Studio & Firebase Push Notification */}
      <AndroidStudioConverterModal
        isOpen={isAndroidStudioModalOpen}
        onClose={() => setIsAndroidStudioModalOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* Universal notification modal is handled by FloatingNotificationBanner in App.tsx */}
    </div>
  );
};
