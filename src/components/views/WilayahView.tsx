import React, { useState, useEffect } from 'react';
import { Wilayah, Pelayanan, User } from '../../types';
import { StorageManager } from '../../utils/storage';
import { confirmDialog } from '../../utils/confirmDialog';
import {
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Shield,
  Calendar,
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface WilayahViewProps {
  currentUser: User;
}

export const WilayahView: React.FC<WilayahViewProps> = ({ currentUser }) => {
  const [wilayahList, setWilayahList] = useState<Wilayah[]>([]);
  const [pelayananList, setPelayananList] = useState<Pelayanan[]>([]);
  const [komisiList, setKomisiList] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'wilayah' | 'komisi' | 'pelayanan'>('wilayah');

  // Wilayah Modal States
  const [isWilayahModal, setIsWilayahModal] = useState(false);
  const [editingWilayah, setEditingWilayah] = useState<Wilayah | null>(null);
  const [wilayahForm, setWilayahForm] = useState<Partial<Wilayah>>({
    nama_wilayah: '',
    ketua: '',
    jumlah_jemaat: 50
  });

  // Pelayanan Modal States
  const [isPelayananModal, setIsPelayananModal] = useState(false);
  const [editingPelayanan, setEditingPelayanan] = useState<Pelayanan | null>(null);
  const [pelayananForm, setPelayananForm] = useState<Partial<Pelayanan>>({
    nama: '',
    kategori: 'Musik & Ibadah',
    penanggung_jawab: '',
    jadwal: 'Minggu'
  });

  // Komisi Modal States
  const [isKomisiModal, setIsKomisiModal] = useState(false);
  const [komisiForm, setKomisiForm] = useState('');

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

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
    setWilayahList(StorageManager.getWilayah());
    setPelayananList(StorageManager.getPelayanan());
    setKomisiList(StorageManager.getKomisi());
  };

  // --- WILAYAH HANDLERS ---
  const handleOpenAddWilayah = () => {
    setEditingWilayah(null);
    setWilayahForm({ nama_wilayah: '', ketua: '', jumlah_jemaat: 40 });
    setIsWilayahModal(true);
  };

  const handleOpenEditWilayah = (w: Wilayah) => {
    setEditingWilayah(w);
    setWilayahForm(w);
    setIsWilayahModal(true);
  };

  const handleDeleteWilayah = async (w: Wilayah) => {
    const ok = await confirmDialog({
      title: 'Hapus Wilayah Sektor',
      message: `Hapus wilayah sektor "${w.nama_wilayah}"? Jemaat yang berada di wilayah ini tidak akan dihapus, namun sektor akan dihapus dari daftar.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    StorageManager.deleteWilayah(w.wilayah_id);
    setWilayahList((prev) => prev.filter((item) => item.wilayah_id !== w.wilayah_id));
    StorageManager.logActivity(currentUser.username, `Menghapus wilayah sektor: ${w.nama_wilayah}`, 'Wilayah');
  };

  const handleSaveWilayah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wilayahForm.nama_wilayah) return;

    if (editingWilayah) {
      const updated = wilayahList.map((w) =>
        w.wilayah_id === editingWilayah.wilayah_id
          ? {
              ...w,
              nama_wilayah: wilayahForm.nama_wilayah!,
              ketua: wilayahForm.ketua || 'Belum Ditentukan',
              jumlah_jemaat: Number(wilayahForm.jumlah_jemaat) || 0
            }
          : w
      );
      setWilayahList(updated);
      StorageManager.saveWilayah(updated);
      StorageManager.logActivity(currentUser.username, `Mengubah data wilayah: ${wilayahForm.nama_wilayah}`, 'Wilayah');
    } else {
      const newW: Wilayah = {
        wilayah_id: `WIL-${(wilayahList.length + 1).toString().padStart(3, '0')}`,
        nama_wilayah: wilayahForm.nama_wilayah,
        ketua: wilayahForm.ketua || 'Belum Ditentukan',
        jumlah_jemaat: Number(wilayahForm.jumlah_jemaat) || 0
      };
      const updated = [...wilayahList, newW];
      setWilayahList(updated);
      StorageManager.saveWilayah(updated);
      StorageManager.logActivity(currentUser.username, `Menambahkan wilayah baru: ${newW.nama_wilayah}`, 'Wilayah');
    }
    setIsWilayahModal(false);
  };

  // --- KOMISI HANDLERS ---
  const handleOpenAddKomisi = () => {
    setKomisiForm('');
    setIsKomisiModal(true);
  };

  const handleDeleteKomisi = async (komisiName: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Komisi Gereja',
      message: `Hapus komisi "${komisiName}" dari daftar pilihan gereja?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    StorageManager.deleteKomisi(komisiName);
    setKomisiList((prev) => prev.filter((k) => k !== komisiName));
    StorageManager.logActivity(currentUser.username, `Menghapus komisi gereja: ${komisiName}`, 'Komisi');
  };

  const handleSaveKomisi = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = komisiForm.trim();
    if (!clean) return;

    StorageManager.addKomisi(clean);
    setKomisiList(StorageManager.getKomisi());
    StorageManager.logActivity(currentUser.username, `Menambahkan komisi gereja baru: ${clean}`, 'Komisi');
    setIsKomisiModal(false);
  };

  // --- PELAYANAN HANDLERS ---
  const handleOpenAddPelayanan = () => {
    setEditingPelayanan(null);
    setPelayananForm({
      nama: '',
      kategori: 'Musik & Ibadah',
      penanggung_jawab: '',
      jadwal: 'Sabtu / Minggu'
    });
    setIsPelayananModal(true);
  };

  const handleOpenEditPelayanan = (p: Pelayanan) => {
    setEditingPelayanan(p);
    setPelayananForm(p);
    setIsPelayananModal(true);
  };

  const handleDeletePelayanan = async (p: Pelayanan) => {
    const ok = await confirmDialog({
      title: 'Hapus Tim Pelayanan',
      message: `Hapus tim pelayanan "${p.nama}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    StorageManager.deletePelayanan(p.pelayanan_id);
    setPelayananList((prev) => prev.filter((item) => item.pelayanan_id !== p.pelayanan_id));
    StorageManager.logActivity(currentUser.username, `Menghapus tim pelayanan: ${p.nama}`, 'Pelayanan');
  };

  const handleSavePelayanan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pelayananForm.nama) return;

    if (editingPelayanan) {
      const updated = pelayananList.map((p) =>
        p.pelayanan_id === editingPelayanan.pelayanan_id
          ? {
              ...p,
              nama: pelayananForm.nama!,
              kategori: pelayananForm.kategori || 'Umum',
              penanggung_jawab: pelayananForm.penanggung_jawab || 'Sekretariat',
              jadwal: pelayananForm.jadwal || 'Minggu'
            }
          : p
      );
      setPelayananList(updated);
      StorageManager.savePelayanan(updated);
      StorageManager.logActivity(currentUser.username, `Mengubah data pelayanan: ${pelayananForm.nama}`, 'Pelayanan');
    } else {
      const newP: Pelayanan = {
        pelayanan_id: `PLY-${(pelayananList.length + 1).toString().padStart(3, '0')}`,
        nama: pelayananForm.nama,
        kategori: pelayananForm.kategori || 'Umum',
        penanggung_jawab: pelayananForm.penanggung_jawab || 'Sekretariat',
        jadwal: pelayananForm.jadwal || 'Minggu'
      };
      const updated = [...pelayananList, newP];
      setPelayananList(updated);
      StorageManager.savePelayanan(updated);
      StorageManager.logActivity(currentUser.username, `Menambahkan komisi/pelayanan baru: ${newP.nama}`, 'Pelayanan');
    }
    setIsPelayananModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-400" />
            <span>Manajemen Wilayah, Komisi & Pelayanan</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pengorganisasian wilayah sektor jemaat, komisi kategorial gereja, dan tim pelayanan ibadah.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddWilayah}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Tambah Wilayah Sektor Baru"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>+ Wilayah</span>
            </button>

            <button
              onClick={handleOpenAddKomisi}
              className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Tambah Komisi Baru"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>+ Komisi</span>
            </button>

            <button
              onClick={handleOpenAddPelayanan}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Tambah Tim Pelayanan Baru"
            >
              <Plus className="w-4 h-4" />
              <span>+ Pelayanan</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('wilayah')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'wilayah'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Wilayah Rayon / Sektor ({wilayahList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('komisi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'komisi'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Komisi Gereja ({komisiList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pelayanan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pelayanan'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tim Pelayanan Ibadah ({pelayananList.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: WILAYAH SEKTOR */}
      {activeSubTab === 'wilayah' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Daftar Wilayah Sektor Jemaat</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-xs">
                  {wilayahList.length} Sektor
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin dapat menambah wilayah baru atau menghapus wilayah yang tidak diperlukan menggunakan ikon hapus.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddWilayah}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Wilayah</span>
              </button>
            )}
          </div>

          {wilayahList.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-slate-400">
              <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">Belum ada wilayah sektor.</p>
              <p className="text-xs text-slate-500 mt-1">Klik tombol "+ Wilayah" di atas untuk menambahkan sektor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wilayahList.map((w) => (
                <div
                  key={w.wilayah_id}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm text-white hover:border-indigo-500/40 transition-all space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {w.wilayah_id}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{w.jumlah_jemaat} Jiwa</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-white tracking-tight">{w.nama_wilayah}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Ketua: {w.ketua}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditWilayah(w)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-all cursor-pointer"
                          title="Edit Wilayah"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWilayah(w)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Hapus Wilayah Sektor Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: KOMISI GEREJA */}
      {activeSubTab === 'komisi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Daftar Komisi Kategorial Gereja</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 text-xs">
                  {komisiList.length} Komisi
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daftar komisi ini digunakan sebagai pilihan otomatis saat input jemaat baru. Admin dapat menambah dan menghapus komisi secara mandiri.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddKomisi}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1.5 rounded-xl border border-purple-500/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Komisi</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {komisiList.map((komisiName, idx) => (
              <div
                key={komisiName}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{komisiName}</h4>
                    <p className="text-[11px] text-slate-400">Komisi Resmi Gereja</p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteKomisi(komisiName)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition-all cursor-pointer"
                    title={`Hapus komisi "${komisiName}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TIM PELAYANAN IBADAH */}
      {activeSubTab === 'pelayanan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Daftar Tim Pelayanan Ibadah</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-xs">
                  {pelayananList.length} Tim
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tim pelayanan musik, multimedia, usher, sekolah minggu, dan divisi penatalayanan ibadah lainnya.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddPelayanan}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pelayanan</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Nama Pelayanan / Tim</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Penanggung Jawab</th>
                    <th className="p-3.5">Jadwal Latihan / Tugas</th>
                    {isAdmin && <th className="p-3.5 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pelayananList.map((p) => (
                    <tr key={p.pelayanan_id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3.5 font-bold text-white text-sm">{p.nama}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3.5">{p.penanggung_jawab}</td>
                      <td className="p-3.5 text-slate-400">{p.jadwal || '-'}</td>
                      {isAdmin && (
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditPelayanan(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-all cursor-pointer"
                              title="Edit Pelayanan"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePelayanan(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition-all cursor-pointer"
                              title="Hapus Tim Pelayanan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Wilayah Modal */}
      {isWilayahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">
                {editingWilayah ? 'Edit Wilayah Sektor' : 'Tambah Wilayah Sektor Baru'}
              </h3>
              <button
                onClick={() => setIsWilayahModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveWilayah} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Nama Wilayah / Sektor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Wilayah V - Jakarta Barat"
                  value={wilayahForm.nama_wilayah || ''}
                  onChange={(e) => setWilayahForm({ ...wilayahForm, nama_wilayah: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ketua Wilayah / Penatua</label>
                <input
                  type="text"
                  placeholder="Nama Penatua / Diaken"
                  value={wilayahForm.ketua || ''}
                  onChange={(e) => setWilayahForm({ ...wilayahForm, ketua: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Jumlah Jemaat Estimasi</label>
                <input
                  type="number"
                  value={wilayahForm.jumlah_jemaat || 0}
                  onChange={(e) => setWilayahForm({ ...wilayahForm, jumlah_jemaat: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsWilayahModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {editingWilayah ? 'Simpan Perubahan' : 'Simpan Wilayah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Komisi Modal */}
      {isKomisiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Tambah Komisi Baru</span>
              </h3>
              <button
                onClick={() => setIsKomisiModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveKomisi} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Nama Komisi Baru *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Komisi Lansia (Simeon Hanna)"
                  value={komisiForm}
                  onChange={(e) => setKomisiForm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsKomisiModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-md shadow-purple-600/30"
                >
                  Simpan Komisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Pelayanan Modal */}
      {isPelayananModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">
                {editingPelayanan ? 'Edit Tim Pelayanan' : 'Tambah Tim Pelayanan Ibadah'}
              </h3>
              <button
                onClick={() => setIsPelayananModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePelayanan} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1">Nama Tim / Pelayanan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tim Sound Engine & Audio"
                  value={pelayananForm.nama || ''}
                  onChange={(e) => setPelayananForm({ ...pelayananForm, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Musik & Ibadah / Media / Diakonia / Umum"
                  value={pelayananForm.kategori || ''}
                  onChange={(e) => setPelayananForm({ ...pelayananForm, kategori: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Penanggung Jawab / Koordinator</label>
                <input
                  type="text"
                  value={pelayananForm.penanggung_jawab || ''}
                  onChange={(e) => setPelayananForm({ ...pelayananForm, penanggung_jawab: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Jadwal Latihan / Tugas</label>
                <input
                  type="text"
                  value={pelayananForm.jadwal || ''}
                  onChange={(e) => setPelayananForm({ ...pelayananForm, jadwal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPelayananModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {editingPelayanan ? 'Simpan Perubahan' : 'Simpan Pelayanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
