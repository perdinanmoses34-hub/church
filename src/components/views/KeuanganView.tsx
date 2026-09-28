import React, { useState, useEffect } from 'react';
import { Persembahan, Donasi, KasPengeluaran, User } from '../../types';
import { StorageManager } from '../../utils/storage';
import { exportToExcel, exportToPDF } from '../../utils/exportTools';
import { confirmDialog } from '../../utils/confirmDialog';
import {
  DollarSign,
  Plus,
  FileSpreadsheet,
  FileText,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Filter,
  Check,
  Search,
  Building,
  CreditCard
} from 'lucide-react';

interface KeuanganViewProps {
  currentUser: User;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'PERSEMBAHAN' | 'DONASI' | 'KAS'>('PERSEMBAHAN');
  const [persembahanList, setPersembahanList] = useState<Persembahan[]>([]);
  const [donasiList, setDonasiList] = useState<Donasi[]>([]);
  const [kasList, setKasList] = useState<KasPengeluaran[]>([]);

  // Filter & Search states for Persembahan
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'TERVERIFIKASI' | 'DITOLAK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPersembahanModal, setIsPersembahanModal] = useState(false);
  const [isKasModal, setIsKasModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Persembahan | null>(null);

  // Form states
  const [persembahanForm, setPersembahanForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: 'Persembahan Minggu',
    jumlah: 1500000,
    keterangan: 'Ibadah Raya 1 (Pagi)',
    metode_pembayaran: 'Tunai',
    nama_pengirim: ''
  });

  const [kasForm, setKasForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: 'Biaya Operasional & Listrik',
    jumlah: 750000,
    tipe: 'Pengeluaran' as 'Penerimaan' | 'Pengeluaran',
    keterangan: 'Pembayaran Rekening Listrik & AC Gedung Utama',
    pic: 'Bendahara Gereja'
  });

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    const unsubscribe = StorageManager.subscribe(handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const intervalId = setInterval(loadData, 500);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(intervalId);
    };
  }, []);

  const loadData = () => {
    setPersembahanList(StorageManager.getPersembahan());
    setDonasiList(StorageManager.getDonasi());
    setKasList(StorageManager.getKasPengeluaran());
  };

  // Balance calculation: ONLY count verified persembahan (status === 'TERVERIFIKASI' or no status for legacy entries)
  const verifiedPersembahanList = persembahanList.filter((p) => p.status === 'TERVERIFIKASI' || !p.status);
  const totalPersembahan = verifiedPersembahanList.reduce((acc, c) => acc + (c.jumlah || 0), 0);
  const totalPengeluaran = kasList.filter((k) => k.tipe === 'Pengeluaran').reduce((acc, c) => acc + (c.jumlah || 0), 0);
  const totalPenerimaan = kasList.filter((k) => k.tipe === 'Penerimaan').reduce((acc, c) => acc + (c.jumlah || 0), 0) + totalPersembahan;

  const pendingList = persembahanList.filter((p) => p.status === 'PENDING');

  // Filtered persembahan list for UI
  const filteredPersembahan = persembahanList.filter((p) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'TERVERIFIKASI'
        ? p.status === 'TERVERIFIKASI' || !p.status
        : p.status === statusFilter;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.persembahan_id.toLowerCase().includes(q) ||
      (p.jenis || '').toLowerCase().includes(q) ||
      (p.nama_pengirim || '').toLowerCase().includes(q) ||
      (p.keterangan || '').toLowerCase().includes(q) ||
      (p.metode_pembayaran || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Action: Save Persembahan (Admin Direct Input -> default TERVERIFIKASI)
  const handleSavePersembahan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!persembahanForm.jumlah) return;

    const newP: Persembahan = {
      persembahan_id: `PRS-2026-${Date.now().toString().slice(-4)}`,
      tanggal: persembahanForm.tanggal,
      jenis: persembahanForm.jenis,
      kategori: persembahanForm.jenis,
      jumlah: Number(persembahanForm.jumlah),
      keterangan: persembahanForm.keterangan,
      metode_pembayaran: persembahanForm.metode_pembayaran,
      nama_pengirim: persembahanForm.nama_pengirim || currentUser.nama,
      status: 'TERVERIFIKASI',
      petugas: currentUser.nama
    };

    const updated = [newP, ...persembahanList];
    setPersembahanList(updated);
    StorageManager.savePersembahan(updated);
    StorageManager.logActivity(currentUser.username, `Input Persembahan Manual Rp ${newP.jumlah.toLocaleString('id-ID')}`, 'Keuangan & Kas');
    setIsPersembahanModal(false);
  };

  // Action: Save Kas
  const handleSaveKas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kasForm.jumlah) return;

    const newK: KasPengeluaran = {
      kas_id: `KAS-2026-${Date.now().toString().slice(-4)}`,
      tanggal: kasForm.tanggal,
      kategori: kasForm.kategori,
      jumlah: Number(kasForm.jumlah),
      tipe: kasForm.tipe,
      keterangan: kasForm.keterangan,
      pic: kasForm.pic
    };

    const updated = [newK, ...kasList];
    setKasList(updated);
    StorageManager.saveKasPengeluaran(updated);
    StorageManager.logActivity(currentUser.username, `Input Kas/Pengeluaran Rp ${newK.jumlah.toLocaleString('id-ID')}`, 'Keuangan & Kas');
    setIsKasModal(false);
  };

  // Action: Verifikasi Persembahan Transfer (Set Status = TERVERIFIKASI)
  const handleVerifyPersembahan = (id: string) => {
    const target = persembahanList.find((p) => p.persembahan_id === id);
    if (!target) return;

    const updated = persembahanList.map((p) => {
      if (p.persembahan_id === id) {
        return {
          ...p,
          status: 'TERVERIFIKASI' as const,
          catatan_admin: `Diverifikasi & Diterima oleh ${currentUser.nama}`
        };
      }
      return p;
    });

    setPersembahanList(updated);
    StorageManager.savePersembahan(updated);
    StorageManager.logActivity(
      currentUser.username,
      `Verifikasi & Diterima Persembahan Transfer ID ${id} (Rp ${target.jumlah.toLocaleString('id-ID')})`,
      'Keuangan & Kas'
    );

    // Create Notification
    const notifs = StorageManager.getNotifications();
    const newNotif = {
      notif_id: `NTF-${Date.now().toString().slice(-4)}`,
      user_id: target.jemaat_id || 'ALL',
      judul: 'Persembahan Transfer Berhasil Diverifikasi',
      pesan: `Persembahan / perpuluhan transfer sebesar Rp ${target.jumlah.toLocaleString('id-ID')} atas nama "${target.nama_pengirim || 'Jemaat'}" telah diverifikasi & resmi tercatat di Kas Gereja. Terima kasih, Tuhan memberkati!`,
      status_baca: 'Belum' as const,
      tanggal: new Date().toLocaleString('id-ID')
    };
    StorageManager.saveNotifications([newNotif, ...notifs]);

    if (selectedReceipt?.persembahan_id === id) {
      setSelectedReceipt(null);
    }
  };

  // Action: Tolak Persembahan Transfer
  const handleRejectPersembahan = (id: string) => {
    const target = persembahanList.find((p) => p.persembahan_id === id);
    if (!target) return;

    const reason = prompt('Masukkan alasan penolakan (misal: Bukti transfer tidak valid / tidak terbaca):', 'Bukti transfer tidak sesuai');
    if (reason === null) return;

    const updated = persembahanList.map((p) => {
      if (p.persembahan_id === id) {
        return {
          ...p,
          status: 'DITOLAK' as const,
          catatan_admin: reason || 'Ditolak Admin'
        };
      }
      return p;
    });

    setPersembahanList(updated);
    StorageManager.savePersembahan(updated);
    StorageManager.logActivity(currentUser.username, `Menolak Persembahan Transfer ID ${id}`, 'Keuangan & Kas');

    if (selectedReceipt?.persembahan_id === id) {
      setSelectedReceipt(null);
    }
  };

  // Action: Hapus Persembahan
  const handleDeletePersembahan = async (id: string) => {
    const target = persembahanList.find((p) => p.persembahan_id === id);
    if (!target) return;

    const ok = await confirmDialog({
      title: 'Hapus Riwayat Persembahan',
      message: `Apakah Anda yakin ingin menghapus data persembahan ${id} (Rp ${target.jumlah.toLocaleString('id-ID')}) dari riwayat?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = persembahanList.filter((p) => p.persembahan_id !== id);
    setPersembahanList(updated);
    StorageManager.savePersembahan(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus riwayat persembahan ID ${id}`, 'Keuangan & Kas');
  };

  // Action: Hapus Kas / Pengeluaran
  const handleDeleteKas = async (id: string) => {
    const target = kasList.find((k) => k.kas_id === id);
    if (!target) return;

    const ok = await confirmDialog({
      title: 'Hapus Transaksi Kas',
      message: `Apakah Anda yakin ingin menghapus riwayat transaksi kas ${id} (${target.kategori})?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = kasList.filter((k) => k.kas_id !== id);
    setKasList(updated);
    StorageManager.saveKasPengeluaran(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus transaksi kas ID ${id}`, 'Keuangan & Kas');
  };

  // Action: Hapus Donasi
  const handleDeleteDonasi = async (id: string) => {
    const target = donasiList.find((d) => d.donasi_id === id);
    if (!target) return;

    const ok = await confirmDialog({
      title: 'Hapus Data Donasi',
      message: `Apakah Anda yakin ingin menghapus data donasi dari ${target.nama}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = donasiList.filter((d) => d.donasi_id !== id);
    setDonasiList(updated);
    StorageManager.saveDonasi(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus riwayat donasi ID ${id}`, 'Keuangan & Kas');
  };

  const handleExportExcel = () => {
    exportToExcel(persembahanList, 'Data_Persembahan_Keuangan');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Tanggal', 'Pengirim / Jenis', 'Metode', 'Status', 'Jumlah (Rp)'];
    const rows = persembahanList.map((p) => [
      p.persembahan_id,
      p.tanggal,
      `${p.nama_pengirim ? p.nama_pengirim + ' - ' : ''}${p.jenis || 'Persembahan'}`,
      p.metode_pembayaran || 'Tunai',
      p.status || 'TERVERIFIKASI',
      `Rp ${p.jumlah.toLocaleString('id-ID')}`
    ]);
    exportToPDF('LAPORAN PERSEMBAHAN & KAS GEREJA', headers, rows, undefined, 'Laporan_Keuangan_Persembahan');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Manajemen Keuangan, Persembahan & Kas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pencatatan persembahan ibadah, verifikasi transfer digital jemaat, kas penerimaan & pengeluaran operasional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Alert Banner for Pending Verification */}
      {pendingList.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span>🔔 Terdapat <strong>{pendingList.length} persembahan transfer jemaat</strong> yang memerlukan verifikasi Admin!</span>
              <p className="text-[11px] font-normal text-amber-300/80 mt-0.5">
                Saldo kas hanya akan bertambah setelah transaksi diverifikasi & diterima oleh Admin.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('PERSEMBAHAN');
              setStatusFilter('PENDING');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow"
          >
            Verifikasi Sekarang ({pendingList.length})
          </button>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm text-white">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Penerimaan (Terverifikasi)</span>
          <h3 className="text-2xl font-bold tracking-tight text-emerald-400 mt-2">
            Rp {totalPenerimaan.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Hanya mencakup transaksi terverifikasi & tunai</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm text-white">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Pengeluaran Operasional</span>
          <h3 className="text-2xl font-bold tracking-tight text-rose-400 mt-2">
            Rp {totalPengeluaran.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Biaya Listrik, Maintenance & Diakonia</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm text-white">
          <span className="text-xs text-slate-400 uppercase font-semibold">Saldo Kas Bersih Realtime</span>
          <h3 className="text-2xl font-bold tracking-tight text-indigo-400 mt-2">
            Rp {(totalPenerimaan - totalPengeluaran).toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Tersedia di Kas Bank / Tunai Gereja</p>
        </div>
      </div>

      {/* Subtab Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('PERSEMBAHAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'PERSEMBAHAN' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Persembahan & Transfer ({persembahanList.length})
            {pendingList.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('KAS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'KAS' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Kas & Pengeluaran ({kasList.length})
          </button>

          <button
            onClick={() => setActiveTab('DONASI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'DONASI' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Donasi Pembangunan ({donasiList.length})
          </button>
        </div>

        {isAdmin && activeTab === 'PERSEMBAHAN' && (
          <button
            onClick={() => setIsPersembahanModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Persembahan Tunai</span>
          </button>
        )}

        {isAdmin && activeTab === 'KAS' && (
          <button
            onClick={() => setIsKasModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Kas</span>
          </button>
        )}
      </div>

      {/* Tab 1: Persembahan & Transfer Jemaat */}
      {activeTab === 'PERSEMBAHAN' && (
        <div className="space-y-4">
          {/* Status Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter:
              </span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Semua ({persembahanList.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Perlu Verifikasi ({pendingList.length})</span>
              </button>
              <button
                onClick={() => setStatusFilter('TERVERIFIKASI')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'TERVERIFIKASI'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Terverifikasi ({persembahanList.filter((p) => p.status === 'TERVERIFIKASI' || !p.status).length})
              </button>
              <button
                onClick={() => setStatusFilter('DITOLAK')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'DITOLAK'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Ditolak ({persembahanList.filter((p) => p.status === 'DITOLAK').length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari pengirim, ID, jenis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          {/* Table Persembahan */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">ID & Tanggal</th>
                    <th className="p-3.5">Pengirim & Jenis</th>
                    <th className="p-3.5">Metode / Bukti</th>
                    <th className="p-3.5">Status Verifikasi</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5 text-right">Jumlah (Rp)</th>
                    {isAdmin && <th className="p-3.5 text-center">Aksi / Kontrol</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPersembahan.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-500 text-xs">
                        Tidak ada data persembahan untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPersembahan.map((p) => {
                      const isPending = p.status === 'PENDING';
                      const isVerified = p.status === 'TERVERIFIKASI' || !p.status;
                      const isRejected = p.status === 'DITOLAK';

                      return (
                        <tr key={p.persembahan_id} className={`hover:bg-slate-800/40 transition-all ${isPending ? 'bg-amber-500/5' : ''}`}>
                          <td className="p-3.5">
                            <div className="font-mono text-indigo-300 font-bold">{p.persembahan_id}</div>
                            <div className="text-[10px] text-slate-400">{p.tanggal}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{p.nama_pengirim || 'Jemaat'}</span>
                            </div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                              {p.jenis || p.kategori || 'Persembahan'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200">{p.metode_pembayaran || 'Tunai'}</span>
                              {p.bukti_transfer && (
                                <button
                                  onClick={() => setSelectedReceipt(p)}
                                  className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Lihat Bukti Transfer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Bukti</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Perlu Verifikasi</span>
                              </span>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Terverifikasi</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-300 max-w-xs truncate">
                            {p.keterangan || '-'}
                            {p.catatan_admin && (
                              <div className="text-[10px] text-amber-300/80 mt-0.5 truncate italic">
                                Admin: {p.catatan_admin}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-bold text-sm">
                            <span className={isVerified ? 'text-emerald-400' : isPending ? 'text-amber-300' : 'text-slate-500 line-through'}>
                              Rp {p.jumlah.toLocaleString('id-ID')}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyPersembahan(p.persembahan_id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
                                      title="Verifikasi & Terima (Saldo Bertambah)"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Verifikasi</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectPersembahan(p.persembahan_id)}
                                      className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/60 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                      title="Tolak Transaksi"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => handleDeletePersembahan(p.persembahan_id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                                  title="Hapus Riwayat Persembahan Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kas & Pengeluaran */}
      {activeTab === 'KAS' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">ID & Tanggal</th>
                  <th className="p-3.5">Tipe & Kategori</th>
                  <th className="p-3.5">Keterangan Transaksi</th>
                  <th className="p-3.5">PIC / Penanggung Jawab</th>
                  <th className="p-3.5 text-right">Jumlah (Rp)</th>
                  {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {kasList.map((k) => (
                  <tr key={k.kas_id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3.5">
                      <div className="font-mono text-slate-300 font-bold">{k.kas_id}</div>
                      <div className="text-[10px] text-slate-400">{k.tanggal}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.tipe === 'Penerimaan' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {k.tipe}: {k.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{k.keterangan}</td>
                    <td className="p-3.5 text-slate-400">{k.pic || '-'}</td>
                    <td className={`p-3.5 text-right font-bold text-sm ${k.tipe === 'Penerimaan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {k.tipe === 'Penerimaan' ? '+' : '-'} Rp {k.jumlah.toLocaleString('id-ID')}
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteKas(k.kas_id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Hapus Riwayat Kas Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Donasi Pembangunan */}
      {activeTab === 'DONASI' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">ID & Tanggal</th>
                  <th className="p-3.5">Nama Donatur</th>
                  <th className="p-3.5">Kategori / Peruntukan</th>
                  <th className="p-3.5">Keterangan</th>
                  <th className="p-3.5 text-right">Jumlah (Rp)</th>
                  {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {donasiList.map((d) => (
                  <tr key={d.donasi_id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3.5">
                      <div className="font-mono text-purple-300 font-bold">{d.donasi_id}</div>
                      <div className="text-[10px] text-slate-400">{d.tanggal}</div>
                    </td>
                    <td className="p-3.5 font-bold text-white">{d.nama}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        {d.kategori || 'Pembangunan'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{d.keterangan || '-'}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-400 text-sm">
                      + Rp {d.jumlah.toLocaleString('id-ID')}
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteDonasi(d.donasi_id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Hapus Donasi Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal View Bukti Transfer */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Bukti Transfer Persembahan</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nama Pengirim</span>
                  <span className="font-bold text-white">{selectedReceipt.nama_pengirim || 'Jemaat'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Jumlah Nominal</span>
                  <span className="font-bold text-emerald-400 text-sm">Rp {selectedReceipt.jumlah.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kategori / Jenis</span>
                  <span className="font-semibold text-indigo-300">{selectedReceipt.jenis || 'Persembahan'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-200">{selectedReceipt.metode_pembayaran || 'Transfer Bank'}</span>
                </div>
              </div>

              {selectedReceipt.bukti_transfer ? (
                <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                  <img
                    src={selectedReceipt.bukti_transfer}
                    alt="Bukti Transfer"
                    className="max-h-72 object-contain rounded-xl border border-slate-800"
                  />
                </div>
              ) : (
                <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center text-slate-500">
                  Tidak ada file/foto bukti transfer terlampir.
                </div>
              )}

              {selectedReceipt.keterangan && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <strong className="text-slate-300">Catatan Jemaat:</strong> {selectedReceipt.keterangan}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              {selectedReceipt.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleRejectPersembahan(selectedReceipt.persembahan_id)}
                    className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-xs font-bold cursor-pointer"
                  >
                    Tolak Transaksi
                  </button>
                  <button
                    onClick={() => handleVerifyPersembahan(selectedReceipt.persembahan_id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verifikasi & Terima (Saldo Bertambah)</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Persembahan Manual */}
      {isPersembahanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">Catat Persembahan Tunai / Manual</h3>
              <button onClick={() => setIsPersembahanModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePersembahan} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Tanggal *</label>
                <input
                  type="date"
                  required
                  value={persembahanForm.tanggal}
                  onChange={(e) => setPersembahanForm({ ...persembahanForm, tanggal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Jenis Persembahan</label>
                <select
                  value={persembahanForm.jenis}
                  onChange={(e) => setPersembahanForm({ ...persembahanForm, jenis: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Persembahan Minggu">Persembahan Minggu</option>
                  <option value="Persembahan Perpuluhan">Persembahan Perpuluhan</option>
                  <option value="Persembahan Syukur">Persembahan Syukur</option>
                  <option value="Persembahan Kasih Diakonia">Diakonia / Pelayanan</option>
                  <option value="Persembahan Pembangunan">Pembangunan Gedung</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nama Pengirim / Jemaat</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Yohanes / Anonim"
                  value={persembahanForm.nama_pengirim}
                  onChange={(e) => setPersembahanForm({ ...persembahanForm, nama_pengirim: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Metode Pembayaran</label>
                <select
                  value={persembahanForm.metode_pembayaran}
                  onChange={(e) => setPersembahanForm({ ...persembahanForm, metode_pembayaran: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Tunai">Tunai / Amplop</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="QRIS Digital">QRIS Digital</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Jumlah Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  value={persembahanForm.jumlah}
                  onChange={(e) => setPersembahanForm({ ...persembahanForm, jumlah: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Keterangan / Ibadah</label>
                <input
                  type="text"
                  value={persembahanForm.keterangan}
                  onChange={(e) => setPersembahanForm({ ...persembahanForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsPersembahanModal(false)} className="px-4 py-2 text-slate-300 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold cursor-pointer">
                  Simpan Persembahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kas */}
      {isKasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">Catat Transaksi Kas & Operasional</h3>
              <button onClick={() => setIsKasModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveKas} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Tipe Transaksi</label>
                <select
                  value={kasForm.tipe}
                  onChange={(e) => setKasForm({ ...kasForm, tipe: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Pengeluaran">Pengeluaran (Kredit)</option>
                  <option value="Penerimaan">Penerimaan (Debit)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Kategori Biaya</label>
                <input
                  type="text"
                  value={kasForm.kategori}
                  onChange={(e) => setKasForm({ ...kasForm, kategori: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  value={kasForm.jumlah}
                  onChange={(e) => setKasForm({ ...kasForm, jumlah: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  value={kasForm.keterangan}
                  onChange={(e) => setKasForm({ ...kasForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsKasModal(false)} className="px-4 py-2 text-slate-300 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold cursor-pointer">
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
