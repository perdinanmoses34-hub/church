import React, { useState, useEffect } from 'react';
import { Jemaat, Keluarga, User, Wilayah } from '../../types';
import { StorageManager } from '../../utils/storage';
import { exportToExcel, exportToPDF } from '../../utils/exportTools';
import { confirmDialog } from '../../utils/confirmDialog';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Edit,
  Trash2,
  Eye,
  X,
  UserCheck,
  Building,
  Upload,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Home
} from 'lucide-react';

interface JemaatViewProps {
  currentUser: User;
}

export const JemaatView: React.FC<JemaatViewProps> = ({ currentUser }) => {
  const [jemaatList, setJemaatList] = useState<Jemaat[]>([]);
  const [keluargaList, setKeluargaList] = useState<Keluarga[]>([]);
  const [wilayahList, setWilayahList] = useState<Wilayah[]>([]);
  const [komisiList, setKomisiList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWilayah, setFilterWilayah] = useState('ALL');
  const [filterKomisi, setFilterKomisi] = useState('ALL');

  // Quick Add Wilayah / Komisi Modals
  const [showAddWilayahModal, setShowAddWilayahModal] = useState(false);
  const [newWilayahName, setNewWilayahName] = useState('');
  const [showAddKomisiModal, setShowAddKomisiModal] = useState(false);
  const [newKomisiName, setNewKomisiName] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJemaat, setEditingJemaat] = useState<Jemaat | null>(null);
  const [viewingJemaat, setViewingJemaat] = useState<Jemaat | null>(null);
  const [toastNotification, setToastNotification] = useState<{ title: string; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Jemaat>>({
    nik: '',
    no_kk: '',
    nama_lengkap: '',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1995-01-01',
    alamat: '',
    wilayah: 'Wilayah I - Sunter',
    komisi: 'Komisi Pemuda (Youth)',
    status_baptis: 'Sudah',
    status_sidi: 'Sudah',
    status_pernikahan: 'Belum Menikah',
    pekerjaan: 'Wiraswasta',
    nomor_hp: '',
    email: '',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif'
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
    setJemaatList(StorageManager.getJemaat());
    setKeluargaList(StorageManager.getKeluarga());
    setWilayahList(StorageManager.getWilayah());
    setKomisiList(StorageManager.getKomisi());
  };

  const filteredJemaat = jemaatList.filter((j) => {
    const matchesQuery =
      j.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.nik.includes(searchQuery) ||
      j.no_kk.includes(searchQuery) ||
      j.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWilayah = filterWilayah === 'ALL' || j.wilayah === filterWilayah;
    const matchesKomisi = filterKomisi === 'ALL' || j.komisi === filterKomisi;
    return matchesQuery && matchesWilayah && matchesKomisi;
  });

  const matchingKeluarga = React.useMemo(() => {
    const clean = (formData.no_kk || '').trim().replace(/[\s.-]/g, '');
    if (!clean || clean === '-') return null;
    return keluargaList.find((k) => (k.no_kk || '').trim().replace(/[\s.-]/g, '') === clean);
  }, [formData.no_kk, keluargaList]);

  const handleOpenAdd = () => {
    setEditingJemaat(null);
    const defaultW = wilayahList[0]?.nama_wilayah || 'Wilayah I - Sunter';
    const defaultK = komisiList[0] || 'Komisi Pria (Bapa)';
    setFormData({
      nik: '',
      no_kk: '',
      nama_lengkap: '',
      jenis_kelamin: 'Laki-laki',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1995-05-15',
      alamat: '',
      wilayah: defaultW,
      komisi: defaultK,
      status_baptis: 'Sudah',
      status_sidi: 'Sudah',
      status_pernikahan: 'Belum Menikah',
      pekerjaan: 'Karyawan Swasta',
      nomor_hp: '+62 ',
      email: '',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (j: Jemaat) => {
    setEditingJemaat(j);
    setFormData(j);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Data Jemaat',
      message: `Hapus data jemaat ${nama} beserta akun login terkait?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    StorageManager.deleteJemaat(id, nama);
    const updated = StorageManager.getJemaat();
    setJemaatList(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus data jemaat & akun login: ${nama}`, 'Master Jemaat');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap) return;

    const activeTenantId = (currentUser.role !== 'SUPER_ADMIN' && currentUser.tenant_id && currentUser.tenant_id !== 'ALL')
      ? currentUser.tenant_id
      : StorageManager.getActiveTenantId();

    if (editingJemaat) {
      const updated = jemaatList.map((j) =>
        j.jemaat_id === editingJemaat.jemaat_id ? ({ ...j, ...formData } as Jemaat) : j
      );
      setJemaatList(updated);
      StorageManager.saveJemaat(updated);
      StorageManager.logActivity(currentUser.username, `Mengubah data jemaat: ${formData.nama_lengkap}`, 'Master Jemaat');
    } else {
      const generatedJmtId = StorageManager.getNextJemaatId();
      const newJemaat: Jemaat = {
        jemaat_id: generatedJmtId,
        ...(formData as Jemaat)
      };
      const updated = [newJemaat, ...jemaatList];
      setJemaatList(updated);
      StorageManager.saveJemaat(updated);

      // Auto create user login account for this Jemaat so they can immediately log in
      const allUsers = StorageManager.getUsers();
      let derivedUsername = '';
      if (formData.email && formData.email.includes('@')) {
        derivedUsername = formData.email.split('@')[0].toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      }
      if (!derivedUsername || derivedUsername.length < 3) {
        derivedUsername = formData.nama_lengkap.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      }
      if (!derivedUsername || derivedUsername.length < 3) {
        derivedUsername = `jemaat_${newJemaat.jemaat_id.toLowerCase().replace('-', '')}`;
      }

      let finalUsername = derivedUsername;
      let counter = 1;
      while (allUsers.some((u) => u.username.toLowerCase() === finalUsername)) {
        finalUsername = `${derivedUsername}${counter}`;
        counter++;
      }

      const generatedUserId = StorageManager.getNextUserId();
      const newJemaatUser: User = {
        user_id: generatedUserId,
        jemaat_id: newJemaat.jemaat_id,
        username: finalUsername,
        nama: newJemaat.nama_lengkap,
        email: newJemaat.email || '',
        no_hp: newJemaat.nomor_hp || '',
        role: 'JEMAAT',
        status: 'Aktif',
        password_hash: 'jemaat123',
        tenant_id: activeTenantId,
        created_at: new Date().toLocaleString('id-ID')
      };

      StorageManager.saveUsers([newJemaatUser, ...allUsers]);
      StorageManager.logActivity(currentUser.username, `Menambahkan jemaat baru: ${newJemaat.nama_lengkap} & akun login: ${finalUsername}`, 'Master Jemaat');

      setToastNotification({
        title: `Jemaat "${newJemaat.nama_lengkap}" berhasil ditambahkan!`,
        message: `Akun Login Jemaat dibuat: Username: ${finalUsername} (Password: jemaat123)`
      });
      setTimeout(() => setToastNotification(null), 6000);
    }

    setIsModalOpen(false);
  };

  const handleQuickAddWilayah = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWilayahName.trim();
    if (!trimmed) return;
    const currentW = StorageManager.getWilayah();
    const newW: Wilayah = {
      wilayah_id: `WIL-${(currentW.length + 1).toString().padStart(3, '0')}`,
      nama_wilayah: trimmed,
      ketua: 'Belum Ditentukan',
      jumlah_jemaat: 0
    };
    const updated = [...currentW, newW];
    StorageManager.saveWilayah(updated);
    setWilayahList(updated);
    setFormData((prev) => ({ ...prev, wilayah: trimmed }));
    setNewWilayahName('');
    setShowAddWilayahModal(false);
    StorageManager.logActivity(currentUser.username, `Menambahkan wilayah sektor baru: ${trimmed}`, 'Wilayah');
  };

  const handleQuickAddKomisi = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKomisiName.trim();
    if (!trimmed) return;
    StorageManager.addKomisi(trimmed);
    const updated = StorageManager.getKomisi();
    setKomisiList(updated);
    setFormData((prev) => ({ ...prev, komisi: trimmed }));
    setNewKomisiName('');
    setShowAddKomisiModal(false);
    StorageManager.logActivity(currentUser.username, `Menambahkan komisi pelayanan baru: ${trimmed}`, 'Komisi');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredJemaat, 'Data_Jemaat_Gereja');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'NIK', 'Nama Lengkap', 'JK', 'Wilayah', 'Komisi', 'No. HP', 'Status'];
    const rows = filteredJemaat.map((j) => [
      j.jemaat_id,
      j.nik,
      j.nama_lengkap,
      j.jenis_kelamin,
      j.wilayah,
      j.komisi,
      j.nomor_hp,
      j.status
    ]);
    exportToPDF('LAPORAN MASTER DATA JEMAAT GEREJA', headers, rows, undefined, 'Data_Jemaat');
  };

  return (
    <div className="space-y-6">
      {toastNotification && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-200">{toastNotification.title}</p>
              <p className="text-xs text-emerald-300/90 mt-0.5">{toastNotification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-xs px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Master Data Jemaat & Kartu Keluarga</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola data jemaat, wilayah, komisi, status baptis/sidi, dan kartu keluarga secara rinci.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jemaat</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan NIK, No KK, Nama, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterWilayah}
            onChange={(e) => setFilterWilayah(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Wilayah</option>
            {wilayahList.map((w) => (
              <option key={w.wilayah_id} value={w.nama_wilayah}>
                {w.nama_wilayah}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterKomisi}
            onChange={(e) => setFilterKomisi(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Komisi</option>
            {komisiList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jemaat Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Foto & Nama</th>
                <th className="p-3.5">NIK & No KK</th>
                <th className="p-3.5">Wilayah</th>
                <th className="p-3.5">Komisi</th>
                <th className="p-3.5">Baptis / Sidi</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJemaat.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada data jemaat yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredJemaat.map((j) => (
                  <tr key={j.jemaat_id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={j.foto}
                          alt={j.nama_lengkap}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{j.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400">{j.jemaat_id} • {j.jenis_kelamin}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-300">
                      <div>NIK: {j.nik}</div>
                      <div className="text-[10px] text-slate-500">KK: {j.no_kk}</div>
                    </td>

                    <td className="p-3.5">{j.wilayah}</td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                        {j.komisi}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5 text-[11px]">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] ${j.status_baptis === 'Sudah' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          Baptis: {j.status_baptis}
                        </span>
                        <br />
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] ${j.status_sidi === 'Sudah' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          Sidi: {j.status_sidi}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div>{j.nomor_hp}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{j.email}</div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingJemaat(j)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                          title="Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(j)}
                          className="p-1.5 rounded-lg bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/80"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(j.jemaat_id, j.nama_lengkap)}
                          className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewingJemaat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>Kartu Detail Jemaat</span>
              </h3>
              <button onClick={() => setViewingJemaat(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <img
                  src={viewingJemaat.foto}
                  alt={viewingJemaat.nama_lengkap}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
                />
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xl font-bold">{viewingJemaat.nama_lengkap}</h4>
                  <p className="text-xs text-indigo-400 font-semibold">{viewingJemaat.jemaat_id} • Status: {viewingJemaat.status}</p>
                  <p className="text-xs text-slate-300">{viewingJemaat.komisi} • {viewingJemaat.wilayah}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">NIK:</span>
                  <span className="font-mono text-slate-200">{viewingJemaat.nik}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">No. KK:</span>
                  <span className="font-mono text-slate-200">{viewingJemaat.no_kk}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jenis Kelamin:</span>
                  <span>{viewingJemaat.jenis_kelamin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TTL:</span>
                  <span>{viewingJemaat.tempat_lahir}, {viewingJemaat.tanggal_lahir}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Baptis:</span>
                  <span className="text-emerald-400 font-bold">{viewingJemaat.status_baptis}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Sidi:</span>
                  <span className="text-blue-400 font-bold">{viewingJemaat.status_sidi}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pekerjaan:</span>
                  <span>{viewingJemaat.pekerjaan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">No. HP:</span>
                  <span>{viewingJemaat.nomor_hp}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Alamat Domisili:</span>
                  <span className="text-slate-200">{viewingJemaat.alamat}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setViewingJemaat(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold">
                {editingJemaat ? 'Edit Data Jemaat' : 'Tambah Jemaat Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_lengkap || ''}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">NIK (KTP) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nik || ''}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400">No. Kartu Keluarga (KK) *</label>
                    {keluargaList.length > 0 && (
                      <span className="text-[10px] text-indigo-400 font-medium">1 KK dengan keluarga terdaftar?</span>
                    )}
                  </div>

                  {/* Dropdown Pilihan Cepat KK Terdaftar */}
                  {keluargaList.length > 0 && (
                    <div className="mb-2">
                      <select
                        value={matchingKeluarga ? matchingKeluarga.no_kk : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const found = keluargaList.find((k) => k.no_kk === val);
                            if (found) {
                              setFormData({
                                ...formData,
                                no_kk: found.no_kk,
                                alamat: formData.alamat || found.alamat,
                                wilayah: found.wilayah || formData.wilayah
                              });
                            }
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs text-indigo-200 focus:outline-none focus:border-indigo-400"
                      >
                        <option value="">-- Pilih jika 1 KK dengan keluarga yang sudah ada --</option>
                        {keluargaList.map((k) => (
                          <option key={k.keluarga_id} value={k.no_kk}>
                            KK: {k.kepala_keluarga} ({k.no_kk}) • {k.jumlah_anggota || 1} Jiwa
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3171011005120099 (16 Digit)"
                    value={formData.no_kk || ''}
                    onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  {/* Deteksi Status Keluarga Realtime */}
                  {matchingKeluarga ? (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-200">
                          Satu KK dengan Keluarga Bpk/Ibu {matchingKeluarga.kepala_keluarga} ({matchingKeluarga.jumlah_anggota || 1} Anggota)
                        </p>
                        <p className="text-[10px] text-emerald-300/80 mt-0.5">
                          ✓ Jemaat ini akan terdata sebagai anggota keluarga ini.<br />
                          ✓ <strong>Total KK di Dashboard tetap</strong> (tidak bertambah), hanya <strong>Total Jemaat</strong> yang bertambah +1.
                        </p>
                      </div>
                    </div>
                  ) : (formData.no_kk && formData.no_kk.trim().length >= 6) ? (
                    <div className="mt-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-2">
                      <Home className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-indigo-200">
                          Nomor KK Baru Terdeteksi
                        </p>
                        <p className="text-[10px] text-indigo-300/80 mt-0.5">
                          Akan didaftarkan sebagai Kartu Keluarga baru di gereja (Total KK di Dashboard bertambah +1).
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin || 'Laki-laki'}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400">Wilayah Sektor</label>
                    <button
                      type="button"
                      onClick={() => setShowAddWilayahModal(true)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/15 hover:bg-indigo-500/30 px-2 py-0.5 rounded-lg border border-indigo-500/40 cursor-pointer"
                      title="Tambah Wilayah Sektor Baru Secara Mandiri"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Wilayah</span>
                    </button>
                  </div>
                  <select
                    value={formData.wilayah || (wilayahList[0]?.nama_wilayah || '')}
                    onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {wilayahList.map((w) => (
                      <option key={w.wilayah_id} value={w.nama_wilayah}>
                        {w.nama_wilayah}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400">Komisi</label>
                    <button
                      type="button"
                      onClick={() => setShowAddKomisiModal(true)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/15 hover:bg-indigo-500/30 px-2 py-0.5 rounded-lg border border-indigo-500/40 cursor-pointer"
                      title="Tambah Komisi Baru Secara Mandiri"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Komisi</span>
                    </button>
                  </div>
                  <select
                    value={formData.komisi || (komisiList[0] || '')}
                    onChange={(e) => setFormData({ ...formData, komisi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {komisiList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Baptis</label>
                  <select
                    value={formData.status_baptis || 'Sudah'}
                    onChange={(e) => setFormData({ ...formData, status_baptis: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sudah">Sudah Baptis</option>
                    <option value="Belum">Belum Baptis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Sidi</label>
                  <select
                    value={formData.status_sidi || 'Sudah'}
                    onChange={(e) => setFormData({ ...formData, status_sidi: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sudah">Sudah Sidi</option>
                    <option value="Belum">Belum Sidi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nomor HP / Whatsapp</label>
                  <input
                    type="text"
                    value={formData.nomor_hp || ''}
                    onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Alamat Domisili Lengkap</label>
                  <input
                    type="text"
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Quick Add Wilayah Modal */}
      {showAddWilayahModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Tambah Wilayah Sektor Baru</span>
              </h3>
              <button
                onClick={() => setShowAddWilayahModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAddWilayah} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Nama Wilayah / Sektor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Wilayah V - Jakarta Barat"
                  value={newWilayahName}
                  onChange={(e) => setNewWilayahName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddWilayahModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Simpan Wilayah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Komisi Modal */}
      {showAddKomisiModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Tambah Komisi Baru</span>
              </h3>
              <button
                onClick={() => setShowAddKomisiModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAddKomisi} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Nama Komisi Baru *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Komisi Lansia (Simeon Hanna)"
                  value={newKomisiName}
                  onChange={(e) => setNewKomisiName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddKomisiModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Simpan Komisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
