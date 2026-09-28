import React, { useState, useEffect } from 'react';
import { EventSchedule, EventReservation, Doa, User, NotificationItem } from '../../types';
import { StorageManager } from '../../utils/storage';
import { playNotificationChime } from '../../utils/soundHelper';
import { broadcastContentNotification } from '../../utils/notificationBroadcast';
import { confirmDialog } from '../../utils/confirmDialog';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Heart,
  CheckCircle2,
  MessageSquare,
  X,
  Trash2,
  Edit2,
  Sparkles,
  Ticket,
  Users,
  Check,
  Search,
  Phone,
  Send,
  AlertCircle,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';

interface AgendaViewProps {
  currentUser: User;
  mode?: 'JADWAL' | 'AGENDA' | 'DOA' | 'BOTH';
}

export const AgendaView: React.FC<AgendaViewProps> = ({ currentUser, mode = 'BOTH' }) => {
  const [settings, setSettings] = useState(() => StorageManager.getSettings());
  const isLightSystem = settings.theme_preset === 'EMERALD_LIGHT' || settings.theme_preset === 'LUXE_LIGHT';

  const [activeTab, setActiveTab] = useState<'JADWAL' | 'UPCOMING_EVENTS' | 'DOA'>(
    mode === 'DOA' ? 'DOA' : mode === 'AGENDA' ? 'UPCOMING_EVENTS' : 'JADWAL'
  );

  const [eventsList, setEventsList] = useState<EventSchedule[]>([]);
  const [reservationsList, setReservationsList] = useState<EventReservation[]>([]);
  const [doaList, setDoaList] = useState<Doa[]>([]);

  useEffect(() => {
    if (mode === 'DOA') setActiveTab('DOA');
    else if (mode === 'AGENDA') setActiveTab('UPCOMING_EVENTS');
    else if (mode === 'JADWAL') setActiveTab('JADWAL');
  }, [mode]);

  // Modals State
  const [isEventModal, setIsEventModal] = useState(false);
  const [isDoaModal, setIsDoaModal] = useState(false);

  // Reservation Modal for Jemaat
  const [selectedEventForReservation, setSelectedEventForReservation] = useState<EventSchedule | null>(null);
  const [resName, setResName] = useState(currentUser.nama || '');
  const [resWa, setResWa] = useState(currentUser.no_hp || '');
  const [resSeats, setResSeats] = useState(1);
  const [resNotes, setResNotes] = useState('');
  const [resSuccess, setResSuccess] = useState('');
  const [adminToast, setAdminToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Admin View Reservations Modal
  const [selectedEventForAdmin, setSelectedEventForAdmin] = useState<EventSchedule | null>(null);
  const [isAllAdminReservationsModal, setIsAllAdminReservationsModal] = useState(false);
  const [reservationSearch, setReservationSearch] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const isMatchingEvent = (rEventId?: string, targetEventId?: string) => {
    if (!rEventId || !targetEventId) return false;
    const r = rEventId.trim().toLowerCase();
    const t = targetEventId.trim().toLowerCase();
    if (r === t) return true;
    const rClean = r.replace(/^evt-2026-|^evt-/, '');
    const tClean = t.replace(/^evt-2026-|^evt-/, '');
    return rClean === tClean || (rClean.length >= 3 && tClean.length >= 3 && (rClean.includes(tClean) || tClean.includes(rClean)));
  };

  // Forms
  const [eventForm, setEventForm] = useState({
    nama: '',
    kategori: 'Upcoming Special Event',
    tanggal: new Date().toISOString().slice(0, 10),
    jam: '09:00 - 12:00 WIB',
    lokasi: 'Sanctuary Main Hall GKFC Pro',
    pembicara: 'Pdt. Dr. Herman Setyawan, M.Th',
    keterangan: 'Kebaktian KKR & Persekutuan Spesial',
    kuota_kursi: 150
  });

  const [doaForm, setDoaForm] = useState({
    nama_pemohon: currentUser.nama || '',
    kategori: 'Kesehatan & Kesembuhan',
    isi_permohonan: ''
  });

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    const unsubscribe = StorageManager.subscribe(handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const intervalId = setInterval(loadData, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(intervalId);
    };
  }, []);

  const loadData = () => {
    setSettings(StorageManager.getSettings());
    setEventsList(StorageManager.getEvents());
    setReservationsList(StorageManager.getEventReservations());
    setDoaList(StorageManager.getDoa());
  };

  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setEventForm({
      nama: '',
      kategori: 'Upcoming Special Event',
      tanggal: new Date().toISOString().slice(0, 10),
      jam: '09:00 - 12:00 WIB',
      lokasi: 'Sanctuary Main Hall GKFC Pro',
      pembicara: 'Pdt. Dr. Herman Setyawan, M.Th',
      keterangan: 'Kebaktian KKR & Persekutuan Spesial',
      kuota_kursi: 150
    });
    setIsEventModal(true);
  };

  const handleOpenEditEvent = (e: EventSchedule) => {
    setEditingEventId(e.event_id);
    setEventForm({
      nama: e.nama,
      kategori: e.kategori || 'Ibadah Raya',
      tanggal: e.tanggal,
      jam: e.jam,
      lokasi: e.lokasi,
      pembicara: e.pembicara || '',
      keterangan: e.keterangan || '',
      kuota_kursi: e.kuota_kursi || 150
    });
    setIsEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.nama) return;

    let updated: EventSchedule[];
    let targetEventId = '';
    const isEdit = !!editingEventId;

    if (editingEventId) {
      updated = eventsList.map((item) =>
        item.event_id === editingEventId
          ? {
              ...item,
              nama: eventForm.nama,
              kategori: eventForm.kategori,
              tanggal: eventForm.tanggal,
              jam: eventForm.jam,
              lokasi: eventForm.lokasi,
              pembicara: eventForm.pembicara,
              keterangan: eventForm.keterangan,
              kuota_kursi: Number(eventForm.kuota_kursi) || 150
            }
          : item
      );
      targetEventId = editingEventId;
      StorageManager.logActivity(currentUser.username, `Mengedit jadwal event: ${eventForm.nama}`, 'Jadwal & Event');
      setAdminToast({ type: 'success', message: `Jadwal "${eventForm.nama}" berhasil diperbarui!` });
    } else {
      const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 5)}`;
      const newE: EventSchedule = {
        event_id: `EVT-2026-${uniqueSuffix}`,
        nama: eventForm.nama,
        kategori: eventForm.kategori,
        tanggal: eventForm.tanggal,
        jam: eventForm.jam,
        lokasi: eventForm.lokasi,
        pembicara: eventForm.pembicara,
        keterangan: eventForm.keterangan,
        kuota_kursi: Number(eventForm.kuota_kursi) || 150
      };
      updated = [newE, ...eventsList];
      targetEventId = newE.event_id;
      StorageManager.logActivity(currentUser.username, `Membuat event baru: ${newE.nama}`, 'Jadwal & Event');
      setAdminToast({ type: 'success', message: `Jadwal "${newE.nama}" berhasil diterbitkan!` });
    }

    setEventsList(updated);
    StorageManager.saveEvents(updated);

    // Broadcast Floating Notification to all users
    broadcastContentNotification({
      category: 'Jadwal',
      action: isEdit ? 'UPDATE' : 'TAMBAH',
      title: eventForm.nama,
      summary: `Informasi ${eventForm.kategori} "${eventForm.nama}" (${eventForm.tanggal}, ${eventForm.jam}) di ${eventForm.lokasi}`,
      targetView: 'jadwal',
      targetId: targetEventId,
      senderName: currentUser.nama || 'Admin Jadwal & Acara'
    });

    setIsEventModal(false);
    setEditingEventId(null);
  };

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReservation || !resName || !resWa) return;

    const newRes: EventReservation = {
      reservation_id: `RES-2026-${Date.now().toString().slice(-4)}`,
      event_id: selectedEventForReservation.event_id,
      user_id: currentUser.user_id || currentUser.username,
      nama_jemaat: resName,
      nomor_wa: resWa,
      jumlah_kursi: Number(resSeats) || 1,
      catatan: resNotes,
      tanggal_reservasi: new Date().toLocaleString('id-ID'),
      status: 'MENUNGGU'
    };

    const updated = [newRes, ...reservationsList];
    setReservationsList(updated);
    StorageManager.saveEventReservations(updated);

    // Notify Admin about new reservation request
    const notifForAdmin: NotificationItem = {
      notif_id: `NTF-RES-NEW-${Date.now()}`,
      user_id: 'ALL',
      tujuan_role: 'ADMIN',
      judul: '🎟️ Reservasi Kursi Baru (Menunggu Konfirmasi)',
      pesan: `${resName} mengajukan reservasi ${resSeats} kursi untuk acara "${selectedEventForReservation.nama}". WA: ${resWa}. Mohon verifikasi & konfirmasi.`,
      status_baca: 'Belum',
      tanggal: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      tipe: 'Penting',
      pengirim: resName,
      is_pinned: true
    };
    const currentNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([notifForAdmin, ...currentNotifs]);

    StorageManager.logActivity(currentUser.username, `Mengajukan reservasi event "${selectedEventForReservation.nama}" sebanyak ${resSeats} kursi`, 'Events');
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'reservation_added' } }));

    setResSuccess(`✅ Pengajuan reservasi berhasil dikirim! Status saat ini: Menunggu Konfirmasi Admin.`);
    setTimeout(() => {
      setResSuccess('');
      setSelectedEventForReservation(null);
    }, 2500);
  };

  const handleUpdateReservationStatus = (id: string, newStatus: 'TERKONFIRMASI' | 'MENUNGGU' | 'DIBATALKAN' | 'DITOLAK') => {
    const target = reservationsList.find((r) => r.reservation_id === id);
    if (!target) return;

    const matchedEvent = eventsList.find((e) => isMatchingEvent(e.event_id, target.event_id));
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
      setAdminToast({
        type: 'success',
        message: `✅ Reservasi ${target.nama_jemaat} berhasil DIKONFIRMASI! Notifikasi penerimaan telah dikirim ke jemaat.`
      });
    } else if (newStatus === 'DITOLAK') {
      notifTitle = '⚠️ Status Reservasi Kursi: DITOLAK';
      notifMessage = `Mohon maaf, permohonan reservasi ${target.jumlah_kursi} kursi atas nama ${target.nama_jemaat} untuk acara "${eventName}" DITOLAK oleh Admin karena penyesuaian kuota atau jadwal gereja. Silakan hubungi admin untuk informasi lebih lanjut.`;
      notifType = 'Peringatan';
      setAdminToast({
        type: 'error',
        message: `⚠️ Reservasi ${target.nama_jemaat} telah DITOLAK. Notifikasi penolakan telah dikirim ke jemaat.`
      });
    } else if (newStatus === 'DIBATALKAN') {
      notifTitle = 'ℹ️ Reservasi Kursi Dibatalkan';
      notifMessage = `Reservasi kursi atas nama ${target.nama_jemaat} untuk acara "${eventName}" telah dibatalkan oleh Admin.`;
      notifType = 'Informasi';
      setAdminToast({
        type: 'info',
        message: `ℹ️ Reservasi ${target.nama_jemaat} telah dibatalkan.`
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
    }

    StorageManager.logActivity(
      currentUser.username,
      `Mengubah status reservasi "${target.nama_jemaat}" (${eventName}) menjadi ${newStatus}`,
      'Reservasi'
    );

    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'reservation_status_changed', status: newStatus } }));

    setTimeout(() => {
      setAdminToast(null);
    }, 4000);
  };

  const handleDeleteReservation = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Reservasi',
      message: 'Apakah Anda yakin akan menghapus data reservasi ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = reservationsList.filter((r) => r.reservation_id !== id);
    setReservationsList(updated);
    StorageManager.saveEventReservations(updated);
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'reservation_deleted' } }));
    setAdminToast({
      type: 'info',
      message: 'Data reservasi berhasil dihapus.'
    });
    setTimeout(() => setAdminToast(null), 3000);
  };

  const handleSaveDoa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doaForm.isi_permohonan) return;

    const newD: Doa = {
      doa_id: `DOA-2026-${(doaList.length + 1).toString().padStart(3, '0')}`,
      nama_pemohon: doaForm.nama_pemohon,
      kategori: doaForm.kategori,
      isi_permohonan: doaForm.isi_permohonan,
      tanggal: new Date().toISOString().slice(0, 10),
      status: 'Proses Doa'
    };

    const updated = [newD, ...doaList];
    setDoaList(updated);
    StorageManager.saveDoa(updated);
    StorageManager.logActivity(currentUser.username, `Mengirimkan permohonan doa: ${newD.kategori}`, 'Permohonan Doa');

    // Kirim notifikasi yang muncul pada ADMIN
    const notifForAdmin: NotificationItem = {
      notif_id: `NTF-DOA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: 'ADMIN',
      tujuan_role: 'ADMIN',
      judul: '🙏 Permohonan Doa Baru Masuk',
      pesan: `Permohonan doa baru dari ${doaForm.nama_pemohon} (${doaForm.kategori}): "${doaForm.isi_permohonan}". Mohon didukung dalam doa bersama majelis.`,
      status_baca: 'Belum',
      tanggal: new Date().toISOString().slice(0, 10),
      tipe: 'Penting',
      pengirim: doaForm.nama_pemohon
    };
    const currentNotifs = StorageManager.getNotifications();
    StorageManager.saveNotifications([notifForAdmin, ...currentNotifs]);

    // Bunyikan chime notifikasi
    playNotificationChime();

    window.dispatchEvent(new Event('cms_data_changed'));
    setAdminToast(`Permohonan doa berhasil dikirim dan notifikasi telah dikirim ke Tim Pendoa / Admin!`);
    setTimeout(() => setAdminToast(null), 3500);

    setIsDoaModal(false);
  };

  const handleUpdateStatusDoa = (id: string, newStatus: string) => {
    const target = doaList.find((d) => d.doa_id === id);
    const updated = doaList.map((d) => (d.doa_id === id ? { ...d, status: newStatus as any } : d));
    setDoaList(updated);
    StorageManager.saveDoa(updated);

    // Sinkronisasi status ke prayer requests di storage bila ada
    try {
      const currentPrayers = StorageManager.getPrayerRequests();
      const updatedPrayers = currentPrayers.map((p) => {
        if (target && (p.jemaat_name === target.nama_pemohon || p.permohonan === target.isi_permohonan)) {
          return { ...p, status: (newStatus === 'Selesai Doa' ? 'Terjawab' : 'Dalam Doa') as any };
        }
        return p;
      });
      StorageManager.savePrayerRequests(updatedPrayers);
    } catch (e) {
      console.warn('Error syncing prayer request:', e);
    }

    // Jika admin menekan selesai doa, jemaat mendapat notifikasi bahwa permohonan sudah didoakan
    if (newStatus === 'Selesai Doa' && target) {
      const jemaatNotif: NotificationItem = {
        notif_id: `NTF-DOA-DONE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: target.nama_pemohon,
        tujuan_role: 'JEMAAT',
        judul: '🕊️ Pokok Doa Anda Sudah Didoakan',
        pesan: `Puji Tuhan, Saudara/i ${target.nama_pemohon}. Permohonan doa Anda mengenai "${target.kategori}": "${target.isi_permohonan}" telah selesai didoakan oleh Pelayan & Tim Pendoa Gereja. "Doa orang yang benar, bila dengan yakin didoakan, sangat besar kuasanya." (Yakobus 5:16)`,
        status_baca: 'Belum',
        tanggal: new Date().toISOString().slice(0, 10),
        tipe: 'Penting',
        pengirim: currentUser.nama || 'Pelayan & Tim Pendoa Gereja'
      };

      const currentNotifs = StorageManager.getNotifications();
      StorageManager.saveNotifications([jemaatNotif, ...currentNotifs]);
      playNotificationChime();

      StorageManager.logActivity(
        currentUser.username,
        `Mendoakan & menyelesaikan permohonan doa jemaat: ${target.nama_pemohon}`,
        'Permohonan Doa'
      );

      setAdminToast(`Permohonan doa "${target.nama_pemohon}" telah ditandai Selesai Doa (Sudah Didoakan) dan notifikasi telah dikirim ke jemaat!`);
      setTimeout(() => setAdminToast(null), 4000);
    }

    window.dispatchEvent(new Event('cms_data_changed'));
  };

  const handleDeleteEvent = async (id: string, nama: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Event',
      message: `Apakah Anda yakin ingin menghapus event "${nama}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = eventsList.filter((e) => e.event_id !== id);
    setEventsList(updated);
    StorageManager.saveEvents(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus event: ${nama}`, 'Jadwal & Event');
  };

  const handleDeleteDoa = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Permohonan Doa',
      message: 'Apakah Anda yakin ingin menghapus permohonan doa ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = doaList.filter((d) => d.doa_id !== id);
    setDoaList(updated);
    StorageManager.saveDoa(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus doa ID: ${id}`, 'Permohonan Doa');
  };

  // Separate lists
  const isRutinCategory = (cat?: string) => {
    if (!cat) return true;
    const lower = cat.toLowerCase();
    return lower.includes('ibadah') || lower.includes('rutin') || lower.includes('minggu') || lower.includes('komsel');
  };

  const jadwalRutinList = eventsList.filter((e) => isRutinCategory(e.kategori));
  const upcomingEventsList = eventsList.filter((e) => !isRutinCategory(e.kategori) || e.kategori?.includes('Event') || e.kategori?.includes('KKR') || e.kategori?.includes('Special'));

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl sm:text-2xl font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'} tracking-tight flex items-center gap-2`}>
            {mode === 'DOA' ? (
              <>
                <Heart className="w-6 h-6 text-rose-500" />
                <span>Permohonan Doa Jemaat</span>
              </>
            ) : mode === 'AGENDA' ? (
              <>
                <Sparkles className="w-6 h-6 text-amber-500" />
                <span>Upcoming Events &amp; Reservasi Kursi</span>
              </>
            ) : (
              <>
                <CalendarDays className="w-6 h-6 text-emerald-600" />
                <span>Jadwal Ibadah Rutin Gereja</span>
              </>
            )}
          </h2>
          <p className={`text-xs sm:text-sm ${isLightSystem ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
            {mode === 'DOA'
              ? 'Layanan permohonan doa syafaat, konseling rohani, dan dukungan doa persekutuan jemaat.'
              : mode === 'AGENDA'
              ? 'Agenda kegiatan spesial, KKR, retret, dan reservasi kehadiran jemaat terhubung langsung ke Admin.'
              : 'Kalender resmi jadwal ibadah raya mingguan, persekutuan komsel, dan pelayanan gereja.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className={`flex items-center gap-1.5 ${isLightSystem ? 'bg-white border border-slate-200/90 shadow-sm' : 'bg-slate-900 border border-slate-800'} p-1.5 rounded-2xl shrink-0 flex-wrap`}>
          <button
            onClick={() => setActiveTab('JADWAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'JADWAL'
                ? 'bg-emerald-600 text-white shadow-md'
                : isLightSystem
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Ibadah Rutin ({jadwalRutinList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('UPCOMING_EVENTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'UPCOMING_EVENTS'
                ? 'bg-amber-600 text-white shadow-md'
                : isLightSystem
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upcoming Events ({upcomingEventsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('DOA')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DOA'
                ? 'bg-rose-600 text-white shadow-md'
                : isLightSystem
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Permohonan Doa ({doaList.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: JADWAL IBADAH RUTIN */}
      {activeTab === 'JADWAL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLightSystem ? 'text-slate-800' : 'text-white'} uppercase tracking-wider flex items-center gap-2`}>
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>Jadwal Ibadah Rutin &amp; Persekutuan Komsel</span>
            </h3>
            {currentUser.role !== 'JEMAAT' && (
              <button
                onClick={() => {
                  setEditingEventId(null);
                  setEventForm({
                    nama: '',
                    kategori: 'Ibadah Raya',
                    tanggal: new Date().toISOString().slice(0, 10),
                    jam: '09:00 - 11:30 WIB',
                    lokasi: 'Sanctuary GKFC Pro',
                    pembicara: 'Pdt. Dr. Herman Setyawan, M.Th',
                    keterangan: 'Ibadah Raya Mingguan',
                    kuota_kursi: 150
                  });
                  setIsEventModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal Ibadah</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(jadwalRutinList.length > 0 ? jadwalRutinList : eventsList).map((e, idx) => (
              <div
                key={`rutin-${e.event_id || 'evt'}-${idx}`}
                className={`rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border border-slate-200/90 shadow-sm text-slate-800 hover:border-emerald-400'
                    : 'bg-slate-900 border border-slate-800 shadow-sm text-white hover:border-indigo-500/40'
                } p-5 transition-all space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full ${isLightSystem ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'} border text-[10px] font-bold`}>
                      {e.kategori || 'Ibadah Rutin'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{e.tanggal}</span>
                      {currentUser.role !== 'JEMAAT' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditEvent(e)}
                            className={`p-1.5 rounded-lg ${isLightSystem ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800'} transition-all text-[11px] cursor-pointer`}
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(e.event_id, e.nama)}
                            className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-all text-[11px] cursor-pointer"
                            title="Hapus Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className={`text-base font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} leading-snug`}>{e.nama}</h4>
                  <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} flex items-center gap-1.5`}>
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{e.jam}</span>
                  </p>
                  <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} flex items-center gap-1.5`}>
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{e.lokasi}</span>
                  </p>
                  {e.pembicara && (
                    <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-400'} pt-1 border-t ${isLightSystem ? 'border-slate-100' : 'border-slate-800'}`}>
                      Pelayan Firman / Musisi: <strong className={isLightSystem ? 'text-slate-900' : 'text-slate-200'}>{e.pembicara}</strong>
                    </p>
                  )}
                </div>

                <div className={`text-[11px] ${isLightSystem ? 'text-slate-600 bg-slate-50 border-slate-200' : 'text-slate-400 bg-slate-950/60 border-slate-800'} p-2.5 rounded-xl border`}>
                  {e.keterangan || 'Hadir dan nikmati lawatan Tuhan.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPCOMING EVENTS & RESERVASI */}
      {activeTab === 'UPCOMING_EVENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLightSystem ? 'text-slate-800' : 'text-white'} uppercase tracking-wider flex items-center gap-2`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Upcoming Special Events &amp; Reservasi Tempat</span>
            </h3>
            {currentUser.role !== 'JEMAAT' && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAllAdminReservationsModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-300" />
                  <span>Rekap Semua Reservasi Jemaat ({reservationsList.length})</span>
                </button>
                <button
                  onClick={() => {
                    setEditingEventId(null);
                    setEventForm({
                      nama: '',
                      kategori: 'Upcoming Event Spesial',
                      tanggal: new Date().toISOString().slice(0, 10),
                      jam: '18:00 - 21:00 WIB',
                      lokasi: 'Sanctuary GKFC Pro',
                      pembicara: '',
                      keterangan: 'Kebaktian & Persekutuan Spesial',
                      kuota_kursi: 150
                    });
                    setIsEventModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Upcoming Event</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(upcomingEventsList.length > 0 ? upcomingEventsList : eventsList).map((e, idx) => {
              const eventResList = reservationsList.filter((r) => isMatchingEvent(r.event_id, e.event_id) && r.status !== 'DIBATALKAN');
              const totalBookedSeats = eventResList.reduce((acc, curr) => acc + curr.jumlah_kursi, 0);
              const maxSeats = e.kuota_kursi || 150;
              const remainingSeats = Math.max(0, maxSeats - totalBookedSeats);

              // Check if user has already reserved
              const userRes = reservationsList.find((r) => isMatchingEvent(r.event_id, e.event_id) && (r.nama_jemaat || '').toLowerCase() === (currentUser.nama || '').toLowerCase());

              return (
                <div
                  key={`upcoming-${e.event_id || 'evt'}-${idx}`}
                  className={`rounded-3xl ${
                    isLightSystem
                      ? 'bg-white border-2 border-amber-300 shadow-md text-slate-800 hover:border-amber-500'
                      : 'bg-slate-900 border-2 border-amber-500/30 p-5 shadow-xl text-white hover:border-amber-500/70'
                  } p-5 transition-all space-y-4 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full ${isLightSystem ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} border text-[10px] font-bold uppercase tracking-wider`}>
                        {e.kategori || 'Special Event'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${isLightSystem ? 'text-amber-800' : 'text-amber-300'}`}>{e.tanggal}</span>
                        {currentUser.role !== 'JEMAAT' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditEvent(e)}
                              className={`p-1 rounded-lg ${isLightSystem ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800'} transition-all cursor-pointer`}
                              title="Edit Event"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(e.event_id, e.nama)}
                              className="p-1 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-all cursor-pointer"
                              title="Hapus Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className={`text-lg font-black ${isLightSystem ? 'text-slate-900' : 'text-white'} leading-snug`}>{e.nama}</h4>

                    <div className={`space-y-1.5 text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'}`}>
                      <p className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isLightSystem ? 'text-amber-600' : 'text-amber-400'} shrink-0`} />
                        <span>{e.jam}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{e.lokasi}</span>
                      </p>
                      {e.pembicara && (
                        <p className={isLightSystem ? 'text-slate-600 font-medium' : 'text-slate-300 font-medium'}>
                          Pembicara: <strong className={isLightSystem ? 'text-slate-900' : 'text-white'}>{e.pembicara}</strong>
                        </p>
                      )}
                    </div>

                    <p className={`text-xs ${isLightSystem ? 'text-slate-600 bg-slate-50 border-slate-200' : 'text-slate-300 bg-slate-950/80 border-slate-800'} p-3 rounded-2xl border`}>
                      {e.keterangan || 'Persiapkan hati Anda untuk menghadiri acara ini.'}
                    </p>

                    {/* Kuota Seats Info */}
                    <div className={`p-3 rounded-2xl ${isLightSystem ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-950 border-amber-500/20'} border space-y-2`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={`${isLightSystem ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                          <Ticket className={`w-4 h-4 ${isLightSystem ? 'text-amber-600' : 'text-amber-400'}`} />
                          <span>Status Kuota Kursi:</span>
                        </span>
                        <span className={remainingSeats > 0 ? (isLightSystem ? 'text-emerald-700 font-extrabold' : 'text-emerald-400 font-extrabold') : 'text-rose-600 font-extrabold'}>
                          {remainingSeats > 0 ? `${remainingSeats} Kursi Tersedia` : 'Penuh'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className={`w-full ${isLightSystem ? 'bg-slate-200' : 'bg-slate-800'} h-2 rounded-full overflow-hidden`}>
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (totalBookedSeats / maxSeats) * 100)}%` }}
                        />
                      </div>

                      <div className={`flex justify-between text-[10px] ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>Terisi: {totalBookedSeats} kursi</span>
                        <span>Total Kuota: {maxSeats} kursi</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className={`space-y-2 pt-2 border-t ${isLightSystem ? 'border-slate-100' : 'border-slate-800'}`}>
                    {userRes && (
                      <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-1.5 ${
                        userRes.status === 'TERKONFIRMASI'
                          ? (isLightSystem ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300')
                          : userRes.status === 'DITOLAK'
                          ? (isLightSystem ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-rose-500/20 border-rose-500/40 text-rose-300')
                          : userRes.status === 'DIBATALKAN'
                          ? (isLightSystem ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400')
                          : (isLightSystem ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse' : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse')
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {userRes.status === 'TERKONFIRMASI' ? (
                            <Check className={`w-4 h-4 ${isLightSystem ? 'text-emerald-700' : 'text-emerald-400'}`} />
                          ) : userRes.status === 'DITOLAK' ? (
                            <X className={`w-4 h-4 ${isLightSystem ? 'text-rose-700' : 'text-rose-400'}`} />
                          ) : (
                            <Clock className={`w-4 h-4 ${isLightSystem ? 'text-amber-700' : 'text-amber-400'}`} />
                          )}
                          <span>
                            Reservasi Anda: {userRes.jumlah_kursi} Kursi
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isLightSystem ? 'bg-white border border-slate-200' : 'bg-black/40'}`}>
                          {userRes.status === 'TERKONFIRMASI'
                            ? '✅ Diterima'
                            : userRes.status === 'DITOLAK'
                            ? '❌ Ditolak'
                            : userRes.status === 'DIBATALKAN'
                            ? 'Dibatalkan'
                            : '⏳ Menunggu'}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedEventForReservation(e)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Reservasi Kursi</span>
                      </button>

                      {currentUser.role !== 'JEMAAT' && (
                        <button
                          onClick={() => setSelectedEventForAdmin(e)}
                          className={`w-full py-2.5 rounded-xl ${isLightSystem ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
                        >
                          <Users className={`w-4 h-4 ${isLightSystem ? 'text-indigo-600' : 'text-indigo-400'}`} />
                          <span>Daftar Pemesan ({eventResList.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PERMOHONAN DOA */}
      {activeTab === 'DOA' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLightSystem ? 'text-slate-800' : 'text-white'} uppercase tracking-wider flex items-center gap-2`}>
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Daftar Permohonan Doa Jemaat</span>
            </h3>
            <button
              onClick={() => setIsDoaModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kirim Pokok Doa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doaList.map((d, idx) => (
              <div
                key={`doa-${d.doa_id || 'doa'}-${idx}`}
                className={`rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border border-slate-200/90 shadow-sm text-slate-800 hover:border-rose-400'
                    : 'bg-slate-900 border border-slate-800 shadow-sm text-white hover:border-rose-500/40'
                } p-5 transition-all space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full ${isLightSystem ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'} border text-[10px] font-bold`}>
                      {d.kategori}
                    </span>
                    <span className={`text-xs font-mono ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{d.tanggal}</span>
                  </div>

                  <h4 className={`text-sm font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
                    <UserCheck className={`w-4 h-4 ${isLightSystem ? 'text-indigo-600' : 'text-indigo-400'}`} />
                    <span>{d.nama_pemohon}</span>
                  </h4>

                  <p className={`text-xs ${isLightSystem ? 'text-slate-700 bg-slate-50 border-slate-200' : 'text-slate-300 bg-slate-950/80 border-slate-800'} p-3 rounded-2xl border leading-relaxed italic`}>
                    "{d.isi_permohonan}"
                  </p>
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${isLightSystem ? 'border-slate-100' : 'border-slate-800'} text-xs`}>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border ${
                    d.status === 'Selesai Doa'
                      ? (isLightSystem ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40')
                      : (isLightSystem ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30')
                  }`}>
                    {d.status === 'Selesai Doa' ? (
                      <>
                        <CheckCircle2 className={`w-3 h-3 ${isLightSystem ? 'text-emerald-700' : 'text-emerald-400'}`} />
                        <span>Sudah Didoakan</span>
                      </>
                    ) : (
                      <>
                        <Heart className={`w-3 h-3 ${isLightSystem ? 'text-amber-700' : 'text-amber-400'} animate-pulse`} />
                        <span>Proses Doa</span>
                      </>
                    )}
                  </span>

                  {currentUser.role !== 'JEMAAT' && (
                    <div className="flex items-center gap-1.5">
                      {d.status !== 'Selesai Doa' ? (
                        <button
                          onClick={() => handleUpdateStatusDoa(d.doa_id, 'Selesai Doa')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                          title="Tandai Sudah Didoakan & Kirim Notifikasi ke Jemaat"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Selesai Doa</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatusDoa(d.doa_id, 'Proses Doa')}
                          className={`px-2 py-1 rounded-lg ${isLightSystem ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} text-[10px] cursor-pointer`}
                          title="Kembalikan status ke Proses Doa"
                        >
                          Ubah
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDoa(d.doa_id)}
                        className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 cursor-pointer transition-all"
                        title="Hapus Doa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: RESERVASI KURSI JEMAAT */}
      {selectedEventForReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl p-5 sm:p-6 text-white space-y-4 my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Formulir Reservasi Kursi / Kehadiran Event</h3>
              </div>
              <button
                onClick={() => setSelectedEventForReservation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <h4 className="font-extrabold text-amber-300 text-sm">{selectedEventForReservation.nama}</h4>
                <p className="text-slate-300">Waktu: {selectedEventForReservation.tanggal} &bull; {selectedEventForReservation.jam}</p>
                <p className="text-slate-300">Lokasi: {selectedEventForReservation.lokasi}</p>
              </div>

              {resSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <span>{resSuccess}</span>
                </div>
              )}

              <form id="reservation-form" onSubmit={handleSaveReservation} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Nama Pemesan / Jemaat:</label>
                  <input
                    type="text"
                    required
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 block">Nomor WhatsApp / HP Active:</label>
                    <input
                      type="text"
                      required
                      value={resWa}
                      onChange={(e) => setResWa(e.target.value)}
                      placeholder="08123456789"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 block">Jumlah Tempat / Kursi:</label>
                    <select
                      value={resSeats}
                      onChange={(e) => setResSeats(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} Kursi / Orang
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Catatan Tambahan (Opsional):</label>
                  <input
                    type="text"
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                    placeholder="Contoh: Membawa anak-anak / lansia / rombongan komsel"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedEventForReservation(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="reservation-form"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Konfirmasi Reservasi Kursi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN VIEW RESERVATIONS LIST */}
      {selectedEventForAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Daftar Reservasi Kursi Jemaat</span>
                </h3>
                <p className="text-xs text-indigo-300 font-bold mt-0.5">{selectedEventForAdmin.nama}</p>
              </div>
              <button
                onClick={() => setSelectedEventForAdmin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminToast && (
              <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                adminToast.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : adminToast.type === 'error'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              }`}>
                {adminToast.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{adminToast.message}</span>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {reservationsList.filter((r) => isMatchingEvent(r.event_id, selectedEventForAdmin.event_id)).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Belum ada jemaat yang melakukan reservasi untuk event ini.</div>
              ) : (
                reservationsList
                  .filter((r) => isMatchingEvent(r.event_id, selectedEventForAdmin.event_id))
                  .map((r) => (
                    <div key={r.reservation_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-extrabold text-white text-sm">{r.nama_jemaat}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          r.status === 'TERKONFIRMASI'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : r.status === 'DITOLAK'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : r.status === 'DIBATALKAN'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        }`}>
                          {r.status === 'TERKONFIRMASI'
                            ? '✅ Diterima (Terkonfirmasi)'
                            : r.status === 'DITOLAK'
                            ? '❌ Ditolak'
                            : r.status === 'DIBATALKAN'
                            ? 'Dibatalkan'
                            : '⏳ Menunggu Konfirmasi'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WA: {r.nomor_wa}</span>
                        </p>
                        <p className="flex items-center gap-1 font-bold text-amber-300">
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{r.jumlah_kursi} Kursi</span>
                        </p>
                        <p className="text-slate-400 text-[10px]">{r.tanggal_reservasi}</p>
                      </div>
                      {r.catatan && <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl">Catatan: "{r.catatan}"</p>}

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-900">
                        {r.status !== 'TERKONFIRMASI' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.reservation_id, 'TERKONFIRMASI')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                            title="Konfirmasi & Terima reservasi ini (akan mengirim notifikasi ke jemaat)"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Konfirmasi (Terima)</span>
                          </button>
                        )}
                        {r.status !== 'DITOLAK' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.reservation_id, 'DITOLAK')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                            title="Tolak reservasi ini (akan mengirim notifikasi ke jemaat)"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        )}
                        {r.status === 'TERKONFIRMASI' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.reservation_id, 'DIBATALKAN')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer transition-all"
                          >
                            Batalkan
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReservation(r.reservation_id)}
                          className="p-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 cursor-pointer transition-all"
                          title="Hapus data reservasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2B: ADMIN REKAP SEMUA RESERVASI JEMAAT */}
      {isAllAdminReservationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Panel Admin: Rekap Seluruh Reservasi Kursi Jemaat</span>
                </h3>
                <p className="text-xs text-indigo-300 font-bold mt-0.5">
                  Total {reservationsList.length} Order Reservasi ({reservationsList.reduce((acc, curr) => acc + curr.jumlah_kursi, 0)} Total Kursi Dipesan)
                </p>
              </div>
              <button
                onClick={() => setIsAllAdminReservationsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminToast && (
              <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                adminToast.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : adminToast.type === 'error'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              }`}>
                {adminToast.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{adminToast.message}</span>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={reservationSearch}
                onChange={(e) => setReservationSearch(e.target.value)}
                placeholder="Cari nama jemaat, nomor WA, atau event..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {reservationsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Belum ada data reservasi kursi jemaat.</div>
              ) : (
                reservationsList
                  .filter((r) => {
                    if (!reservationSearch) return true;
                    const q = reservationSearch.toLowerCase();
                    const evtName = eventsList.find((e) => isMatchingEvent(e.event_id, r.event_id))?.nama || '';
                    return (
                      r.nama_jemaat.toLowerCase().includes(q) ||
                      r.nomor_wa.includes(q) ||
                      evtName.toLowerCase().includes(q) ||
                      r.status.toLowerCase().includes(q)
                    );
                  })
                  .map((r) => {
                    const matchedEvent = eventsList.find((e) => isMatchingEvent(e.event_id, r.event_id));
                    return (
                      <div key={r.reservation_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-extrabold text-white text-sm block">{r.nama_jemaat}</span>
                            <span className="text-[11px] text-amber-300 font-semibold block">
                              Event: {matchedEvent?.nama || `ID: ${r.event_id}`}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                              r.status === 'TERKONFIRMASI'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : r.status === 'DITOLAK'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : r.status === 'DIBATALKAN'
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            }`}
                          >
                            {r.status === 'TERKONFIRMASI'
                              ? '✅ Diterima (Terkonfirmasi)'
                              : r.status === 'DITOLAK'
                              ? '❌ Ditolak'
                              : r.status === 'DIBATALKAN'
                              ? 'Dibatalkan'
                              : '⏳ Menunggu Konfirmasi'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WA: {r.nomor_wa}</span>
                            <a
                              href={`https://wa.me/${r.nomor_wa.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-emerald-400 underline font-bold ml-1 hover:text-emerald-300"
                            >
                              Chat WA
                            </a>
                          </p>
                          <p className="flex items-center gap-1 font-bold text-amber-300">
                            <Ticket className="w-3.5 h-3.5" />
                            <span>{r.jumlah_kursi} Kursi Dipesan</span>
                          </p>
                          <p className="text-slate-400 text-[10px]">{r.tanggal_reservasi}</p>
                        </div>

                        {r.catatan && <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl">Catatan: "{r.catatan}"</p>}

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-900">
                          {r.status !== 'TERKONFIRMASI' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(r.reservation_id, 'TERKONFIRMASI')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                              title="Konfirmasi & Terima reservasi ini (akan mengirim notifikasi ke jemaat)"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Konfirmasi (Terima)</span>
                            </button>
                          )}
                          {r.status !== 'DITOLAK' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(r.reservation_id, 'DITOLAK')}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                              title="Tolak reservasi ini (akan mengirim notifikasi ke jemaat)"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          )}
                          {r.status === 'TERKONFIRMASI' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(r.reservation_id, 'DIBATALKAN')}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer transition-all"
                            >
                              Batalkan
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReservation(r.reservation_id)}
                            className="p-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 cursor-pointer transition-all"
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
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH EVENT BARU */}
      {isEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-white space-y-4 my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-base font-bold text-white">
                {editingEventId ? 'Edit Jadwal Ibadah / Event' : 'Tambah Jadwal Ibadah / Event Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsEventModal(false);
                  setEditingEventId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Acara / Event:</label>
                <input
                  type="text"
                  required
                  value={eventForm.nama}
                  onChange={(e) => setEventForm({ ...eventForm, nama: e.target.value })}
                  placeholder="Contoh: Kebaktian KKR Paskah / Ibadah Raya 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Event:</label>
                  <select
                    value={eventForm.kategori}
                    onChange={(e) => setEventForm({ ...eventForm, kategori: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="Ibadah Raya">Ibadah Raya</option>
                    <option value="Upcoming Event Spesial">Upcoming Event Spesial</option>
                    <option value="Persekutuan Komsel">Persekutuan Komsel</option>
                    <option value="Youth & Pemuda">Youth &amp; Pemuda</option>
                    <option value="Seminar & Retret">Seminar &amp; Retret</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kuota Tempat / Kursi:</label>
                  <input
                    type="number"
                    value={eventForm.kuota_kursi}
                    onChange={(e) => setEventForm({ ...eventForm, kuota_kursi: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal Acara:</label>
                  <input
                    type="date"
                    required
                    value={eventForm.tanggal}
                    onChange={(e) => setEventForm({ ...eventForm, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jam Pelaksanaan:</label>
                  <input
                    type="text"
                    required
                    value={eventForm.jam}
                    onChange={(e) => setEventForm({ ...eventForm, jam: e.target.value })}
                    placeholder="09:00 - 11:30 WIB"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lokasi Gedung / Hall:</label>
                <input
                  type="text"
                  required
                  value={eventForm.lokasi}
                  onChange={(e) => setEventForm({ ...eventForm, lokasi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pembicara / Pengkhotbah:</label>
                <input
                  type="text"
                  value={eventForm.pembicara}
                  onChange={(e) => setEventForm({ ...eventForm, pembicara: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan Tambahan:</label>
                <input
                  type="text"
                  value={eventForm.keterangan}
                  onChange={(e) => setEventForm({ ...eventForm, keterangan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: KIRIM DOA */}
      {isDoaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-white space-y-4 my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>Kirim Permohonan Doa Jemaat</span>
              </h3>
              <button onClick={() => setIsDoaModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoa} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Pemohon Doa:</label>
                <input
                  type="text"
                  required
                  value={doaForm.nama_pemohon}
                  onChange={(e) => setDoaForm({ ...doaForm, nama_pemohon: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kategori Doa:</label>
                <select
                  value={doaForm.kategori}
                  onChange={(e) => setDoaForm({ ...doaForm, kategori: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                >
                  <option value="Kesehatan & Kesembuhan">Kesehatan &amp; Kesembuhan</option>
                  <option value="Pemulihan Ekonomi & Pekerjaan">Pemulihan Ekonomi &amp; Pekerjaan</option>
                  <option value="Keharmonisan Keluarga">Keharmonisan Keluarga</option>
                  <option value="Pertumbuhan Rohani">Pertumbuhan Rohani</option>
                  <option value="Pokok Doa Umum">Pokok Doa Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Isi Permohonan Doa:</label>
                <textarea
                  required
                  rows={4}
                  value={doaForm.isi_permohonan}
                  onChange={(e) => setDoaForm({ ...doaForm, isi_permohonan: e.target.value })}
                  placeholder="Tuliskan permohonan doa Anda secara rinci..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDoaModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Permohonan Doa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
