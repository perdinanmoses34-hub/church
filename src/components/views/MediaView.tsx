import React, { useState, useEffect } from 'react';
import { Pengumuman, Renungan, User } from '../../types';
import { StorageManager } from '../../utils/storage';
import { broadcastContentNotification } from '../../utils/notificationBroadcast';
import { confirmDialog } from '../../utils/confirmDialog';
import { Megaphone, BookOpen, Plus, Heart, Share2, Sparkles, X, Trash2, Volume2, Maximize2, Edit3, Check } from 'lucide-react';
import { RenunganFullscreenModal } from '../RenunganFullscreenModal';
import { RenunganAudioPlayer } from '../RenunganAudioPlayer';

interface MediaViewProps {
  currentUser: User;
  mode?: 'PENGUMUMAN' | 'RENUNGAN' | 'BOTH';
}

export const MediaView: React.FC<MediaViewProps> = ({ currentUser, mode = 'BOTH' }) => {
  const [settings, setSettings] = useState(() => StorageManager.getSettings());
  const isLightSystem =
    settings.theme_preset === 'EMERALD_LIGHT' ||
    settings.theme_preset === 'LUXE_LIGHT' ||
    settings.theme_preset === 'CLEAN_LIGHT' ||
    !settings.theme_preset ||
    true;

  const [activeTab, setActiveTab] = useState<'PENGUMUMAN' | 'RENUNGAN'>(mode === 'RENUNGAN' ? 'RENUNGAN' : 'PENGUMUMAN');
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [renunganList, setRenunganList] = useState<Renungan[]>([]);

  useEffect(() => {
    if (mode === 'RENUNGAN') setActiveTab('RENUNGAN');
    else if (mode === 'PENGUMUMAN') setActiveTab('PENGUMUMAN');
  }, [mode]);

  // Modals
  const [isPengumumanModal, setIsPengumumanModal] = useState(false);
  const [editingPengumumanId, setEditingPengumumanId] = useState<string | null>(null);
  const [isRenunganModal, setIsRenunganModal] = useState(false);
  const [editingRenunganId, setEditingRenunganId] = useState<string | null>(null);
  const [selectedRenunganForModal, setSelectedRenunganForModal] = useState<Renungan | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Forms
  const [pengumumanForm, setPengumumanForm] = useState({
    judul: '',
    isi: '',
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: 'Pengumuman Penting',
    penulis: currentUser.nama || 'Sekretariat'
  });

  const [renunganForm, setRenunganForm] = useState({
    judul: '',
    ayat_alkitab: 'Filipi 4:13',
    isi: '',
    tanggal: new Date().toISOString().slice(0, 10),
    penulis: currentUser.nama || 'Pdt. Dr. Herman Setyawan'
  });

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    const unsubscribe = StorageManager.subscribe(handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    // Optimized polling (3s instead of aggressive 500ms) to prevent UI lag/sluggishness
    const intervalId = setInterval(loadData, 3000);

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
    setPengumumanList(StorageManager.getPengumuman());
    setRenunganList(StorageManager.getRenungan());
  };

  const handleOpenAddPengumuman = () => {
    setEditingPengumumanId(null);
    setPengumumanForm({
      judul: '',
      isi: '',
      tanggal: new Date().toISOString().slice(0, 10),
      kategori: 'Pengumuman Penting',
      penulis: currentUser.nama || 'Sekretariat'
    });
    setIsPengumumanModal(true);
  };

  const handleOpenEditPengumuman = (p: Pengumuman) => {
    setEditingPengumumanId(p.pengumuman_id);
    setPengumumanForm({
      judul: p.judul,
      isi: p.isi,
      tanggal: p.tanggal || new Date().toISOString().slice(0, 10),
      kategori: p.kategori || 'Pengumuman Penting',
      penulis: p.penulis || currentUser.nama || 'Sekretariat'
    });
    setIsPengumumanModal(true);
  };

  const handleOpenAddRenungan = () => {
    setEditingRenunganId(null);
    setRenunganForm({
      judul: '',
      ayat_alkitab: '',
      isi: '',
      tanggal: new Date().toISOString().slice(0, 10),
      penulis: currentUser.nama || 'Pdt. Dr. Herman Setyawan'
    });
    setIsRenunganModal(true);
  };

  const handleOpenEditRenungan = (r: Renungan) => {
    setEditingRenunganId(r.renungan_id);
    setRenunganForm({
      judul: r.judul,
      ayat_alkitab: r.ayat_alkitab || r.ayat || '',
      isi: r.isi,
      tanggal: r.tanggal || new Date().toISOString().slice(0, 10),
      penulis: r.penulis || 'Pdt. Dr. Herman Setyawan'
    });
    setIsRenunganModal(true);
  };

  const handleSavePengumuman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengumumanForm.judul || !pengumumanForm.isi) return;

    let updated: Pengumuman[];

    if (editingPengumumanId) {
      updated = pengumumanList.map((item) =>
        item.pengumuman_id === editingPengumumanId
          ? {
              ...item,
              judul: pengumumanForm.judul,
              isi: pengumumanForm.isi,
              tanggal: pengumumanForm.tanggal,
              kategori: pengumumanForm.kategori,
              penulis: pengumumanForm.penulis
            }
          : item
      );
      StorageManager.logActivity(currentUser.username, `Mengedit pengumuman warta: ${pengumumanForm.judul}`, 'Media & Renungan');
      showToast('✅ Pengumuman gereja berhasil diperbarui dan disimpan!');
    } else {
      const newP: Pengumuman = {
        pengumuman_id: `PGM-2026-${(pengumumanList.length + 1).toString().padStart(3, '0')}`,
        judul: pengumumanForm.judul,
        isi: pengumumanForm.isi,
        tanggal: pengumumanForm.tanggal,
        kategori: pengumumanForm.kategori,
        penulis: pengumumanForm.penulis
      };
      updated = [newP, ...pengumumanList];
      StorageManager.logActivity(currentUser.username, `Menerbitkan pengumuman: ${newP.judul}`, 'Media & Renungan');
      showToast('📢 Pengumuman baru berhasil diterbitkan!');
    }

    setPengumumanList(updated);
    StorageManager.savePengumuman(updated);

    // Broadcast Floating Notification for Pengumuman
    const isEditPengumuman = !!editingPengumumanId;
    const targetPengumumanId = editingPengumumanId || (updated[0] && updated[0].pengumuman_id);
    broadcastContentNotification({
      category: 'Pengumuman',
      action: isEditPengumuman ? 'UPDATE' : 'TAMBAH',
      title: pengumumanForm.judul,
      summary: pengumumanForm.isi.length > 110 ? `${pengumumanForm.isi.slice(0, 110)}...` : pengumumanForm.isi,
      targetView: 'pengumuman',
      targetId: targetPengumumanId,
      senderName: pengumumanForm.penulis || currentUser.nama || 'Sekretariat Gereja'
    });

    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'pengumuman_updated' } }));
    setIsPengumumanModal(false);
  };

  const handleSaveRenungan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renunganForm.judul || !renunganForm.isi) return;

    let updated: Renungan[];
    const isEditRenungan = !!editingRenunganId;

    if (editingRenunganId) {
      updated = renunganList.map((item) =>
        item.renungan_id === editingRenunganId
          ? {
              ...item,
              judul: renunganForm.judul,
              ayat_alkitab: renunganForm.ayat_alkitab,
              ayat: renunganForm.ayat_alkitab,
              isi: renunganForm.isi,
              tanggal: renunganForm.tanggal,
              penulis: renunganForm.penulis
            }
          : item
      );
      StorageManager.logActivity(currentUser.username, `Mengedit renungan: ${renunganForm.judul}`, 'Media & Renungan');
    } else {
      const newR: Renungan = {
        renungan_id: `RNG-2026-${Date.now().toString().slice(-4)}`,
        judul: renunganForm.judul,
        ayat_alkitab: renunganForm.ayat_alkitab,
        ayat: renunganForm.ayat_alkitab,
        isi: renunganForm.isi,
        tanggal: renunganForm.tanggal,
        penulis: renunganForm.penulis
      };
      updated = [newR, ...renunganList];
      StorageManager.logActivity(currentUser.username, `Menerbitkan renungan: ${newR.judul}`, 'Media & Renungan');
    }

    setRenunganList(updated);
    StorageManager.saveRenungan(updated);

    // Broadcast Floating Notification for Renungan
    const targetRenunganId = editingRenunganId || (updated[0] && updated[0].renungan_id);
    const summaryPrefix = renunganForm.ayat_alkitab ? `(${renunganForm.ayat_alkitab}) ` : '';
    broadcastContentNotification({
      category: 'Renungan',
      action: isEditRenungan ? 'UPDATE' : 'TAMBAH',
      title: renunganForm.judul,
      summary: `${summaryPrefix}${renunganForm.isi.length > 100 ? `${renunganForm.isi.slice(0, 100)}...` : renunganForm.isi}`,
      targetView: 'renungan',
      targetId: targetRenunganId,
      senderName: renunganForm.penulis || currentUser.nama || 'Pelayan Firman'
    });

    setIsRenunganModal(false);
    setEditingRenunganId(null);
  };

  const handleDeletePengumuman = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirmDialog({
      title: 'Hapus Pengumuman',
      message: 'Apakah Anda yakin ingin menghapus pengumuman ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = pengumumanList.filter((p) => p.pengumuman_id !== id);
    setPengumumanList(updated);
    StorageManager.savePengumuman(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus pengumuman ID ${id}`, 'Media & Renungan');
  };

  const handleDeleteRenungan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirmDialog({
      title: 'Hapus Renungan Harian',
      message: 'Apakah Anda yakin ingin menghapus renungan harian ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = renunganList.filter((r) => r.renungan_id !== id);
    setRenunganList(updated);
    StorageManager.saveRenungan(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus renungan ID ${id}`, 'Media & Renungan');
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 px-4 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-white shadow-2xl flex items-center space-x-2.5 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-100">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl sm:text-2xl font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'} tracking-tight flex items-center gap-2`}>
            {mode === 'RENUNGAN' ? (
              <>
                <BookOpen className="w-6 h-6 text-amber-500" />
                <span>Renungan Harian & Santapan Rohani</span>
              </>
            ) : mode === 'PENGUMUMAN' ? (
              <>
                <Megaphone className="w-6 h-6 text-emerald-600" />
                <span>Pengumuman & Warta Gereja</span>
              </>
            ) : (
              <>
                <Megaphone className="w-6 h-6 text-emerald-600" />
                <span>Pengumuman Jemaat & Renungan Harian</span>
              </>
            )}
          </h2>
          <p className={`text-xs sm:text-sm ${isLightSystem ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
            {mode === 'RENUNGAN'
              ? 'Santapan rohani harian, firman Tuhan, dan inspirasi iman bagi pertumbuhan jemaat.'
              : mode === 'PENGUMUMAN'
              ? 'Warta jemaat mingguan, pengumuman resmi majelis, dan buletin informasi gereja.'
              : 'Warta jemaat mingguan, buletin gereja, dan santapan rohani harian bagi jemaat.'}
          </p>
        </div>

        {mode === 'BOTH' && (
          <div className={`flex items-center gap-1.5 ${isLightSystem ? 'bg-white border border-slate-200/90 shadow-sm' : 'bg-slate-900 border border-slate-800'} p-1.5 rounded-2xl`}>
            <button
              onClick={() => setActiveTab('PENGUMUMAN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'PENGUMUMAN'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isLightSystem
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Warta / Pengumuman ({pengumumanList.length})
            </button>
            <button
              onClick={() => setActiveTab('RENUNGAN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'RENUNGAN'
                  ? 'bg-amber-600 text-white shadow-md'
                  : isLightSystem
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Renungan Harian ({renunganList.length})
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Pengumuman */}
      {activeTab === 'PENGUMUMAN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLightSystem ? 'text-slate-800' : 'text-white'} uppercase tracking-wider`}>Warta Jemaat & Informasi Gereja</h3>
            {currentUser.role !== 'JEMAAT' && (
              <button
                onClick={handleOpenAddPengumuman}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Pengumuman Baru</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pengumumanList.map((p) => (
              <div
                key={p.pengumuman_id}
                className={`rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border-2 border-teal-100/90 shadow-xl shadow-teal-900/5 text-slate-800 hover:border-teal-400 hover:shadow-2xl'
                    : 'bg-slate-900 border border-slate-800 shadow-sm text-white hover:border-indigo-500/40'
                } p-6 transition-all flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full ${isLightSystem ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'} border text-[10px] font-bold`}>
                      {p.kategori}
                    </span>
                    <span className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'}`}>{p.tanggal}</span>
                  </div>

                  <h4 className={`text-lg font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} leading-snug tracking-tight text-left`}>{p.judul}</h4>
                  <p
                    lang="id"
                    className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-300'} leading-relaxed text-justify hyphens-auto [text-align-last:left] [text-justify:inter-word] break-words whitespace-pre-line`}
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
                    {p.isi}
                  </p>
                </div>

                <div className={`pt-3 border-t ${isLightSystem ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'} flex items-center justify-between text-xs font-medium`}>
                  <span>Diterbitkan oleh: {p.penulis}</span>
                  <div className="flex items-center gap-2">
                    <button className={`${isLightSystem ? 'text-emerald-700 hover:text-emerald-800' : 'text-indigo-400 hover:text-indigo-300'} flex items-center gap-1 cursor-pointer`}>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan</span>
                    </button>
                    {currentUser.role !== 'JEMAAT' && (
                      <>
                        <button
                          onClick={() => handleOpenEditPengumuman(p)}
                          className={`px-2.5 py-1 rounded-lg ${isLightSystem ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border-indigo-500/30'} border transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer`}
                          title="Edit Pengumuman ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDeletePengumuman(p.pengumuman_id, e)}
                          className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Renungan Harian */}
      {activeTab === 'RENUNGAN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLightSystem ? 'text-slate-800' : 'text-white'} uppercase tracking-wider`}>Santapan Rohani & Renungan Harian</h3>
            {currentUser.role !== 'JEMAAT' && (
              <button
                onClick={handleOpenAddRenungan}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tulis Renungan Baru</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {renunganList.map((r) => (
              <div
                key={r.renungan_id}
                className={`rounded-3xl ${
                  isLightSystem
                    ? 'bg-white border-2 border-teal-100/90 shadow-xl shadow-teal-900/5 text-slate-800 hover:border-teal-400 hover:shadow-2xl'
                    : 'bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl text-white hover:border-indigo-500/40'
                } p-5 sm:p-6 transition-all space-y-4`}
              >
                {/* Header Info */}
                <div className={`flex items-center justify-between flex-wrap gap-2 pb-2 border-b ${isLightSystem ? 'border-slate-100' : 'border-slate-800/80'}`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className={`text-xs font-bold ${isLightSystem ? 'text-amber-800' : 'text-amber-300'} uppercase tracking-wider`}>
                      Tanggal: {r.tanggal}
                    </span>
                  </div>
                  <span className={`text-xs ${isLightSystem ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'} px-2.5 py-1 rounded-xl border font-semibold`}>
                    Penulis: {r.penulis || 'Pdt. Dr. Herman Setyawan'}
                  </span>
                </div>

                {/* Title & Verse */}
                <div>
                  <h4
                    onClick={() => setSelectedRenunganForModal(r)}
                    className={`text-lg sm:text-xl font-extrabold ${isLightSystem ? 'text-slate-900 hover:text-emerald-700' : 'text-white hover:text-indigo-300'} tracking-tight cursor-pointer transition-colors text-left`}
                  >
                    {r.judul}
                  </h4>
                  <div className={`mt-2 inline-block px-3 py-1 rounded-xl ${isLightSystem ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-indigo-950/80 border-indigo-500/30 text-indigo-300'} border font-semibold text-xs`}>
                    Bacaan Alkitab: {r.ayat_alkitab || r.ayat}
                  </div>
                </div>

                {/* Devotional Text Short Snippet Preview */}
                <div
                  lang="id"
                  onClick={() => setSelectedRenunganForModal(r)}
                  className={`p-4 rounded-2xl ${isLightSystem ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-100/60' : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-950'} border text-xs sm:text-sm leading-relaxed font-sans cursor-pointer transition-all text-justify break-words line-clamp-3 select-none`}
                  title="Klik untuk membaca selengkapnya"
                >
                  {r.isi.length > 200 ? `${r.isi.slice(0, 200)}...` : r.isi}
                </div>

                {/* Horizontal Action Bar (Tombol Jejer Kesamping) */}
                <div className={`pt-3 border-t ${isLightSystem ? 'border-slate-100' : 'border-slate-800'} flex items-center justify-between gap-2.5 flex-wrap`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedRenunganForModal(r)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Baca Selengkapnya</span>
                    </button>

                    {/* Integrated AI Audio Player side-by-side */}
                    <RenunganAudioPlayer
                      text={r.isi}
                      title={r.judul}
                      verse={r.ayat_alkitab || r.ayat}
                      writer={r.penulis}
                      compact={true}
                    />
                  </div>

                  {currentUser.role !== 'JEMAAT' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditRenungan(r)}
                        className={`px-3 py-2 rounded-xl ${isLightSystem ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-indigo-900/50 hover:bg-indigo-900/80 text-indigo-200 border-indigo-500/30'} transition-all flex items-center gap-1.5 text-xs font-semibold border cursor-pointer active:scale-95`}
                        title="Edit Renungan"
                      >
                        <Edit3 className={`w-3.5 h-3.5 ${isLightSystem ? 'text-indigo-600' : 'text-indigo-300'}`} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteRenungan(r.renungan_id, e)}
                        className="px-3 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/80 text-rose-300 transition-all flex items-center gap-1.5 text-xs font-semibold border border-rose-500/20 cursor-pointer active:scale-95"
                        title="Hapus Renungan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Pengumuman */}
      {isPengumumanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  {editingPengumumanId ? 'Edit Warta & Pengumuman' : 'Terbitkan Pengumuman Baru'}
                </h3>
              </div>
              <button onClick={() => setIsPengumumanModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePengumuman} className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Gotong Royong Persiapan Paskah"
                  value={pengumumanForm.judul}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Kategori Warta</label>
                <input
                  type="text"
                  value={pengumumanForm.kategori}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, kategori: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Isi Teks Pengumuman *</label>
                <textarea
                  required
                  rows={4}
                  value={pengumumanForm.isi}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, isi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPengumumanModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPengumumanId ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Renungan (Tulis / Edit) */}
      {isRenunganModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>{editingRenunganId ? 'Edit Renungan Harian' : 'Tulis Renungan Harian Baru'}</span>
              </h3>
              <button onClick={() => setIsRenunganModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRenungan} className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Renungan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengharapan Yang Teguh"
                  value={renunganForm.judul}
                  onChange={(e) => setRenunganForm({ ...renunganForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Penulis Renungan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pdt. Dr. Herman Setyawan"
                    value={renunganForm.penulis}
                    onChange={(e) => setRenunganForm({ ...renunganForm, penulis: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Anda bebas mengetik nama hamba Tuhan / penulis renungan ini.</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal Renungan</label>
                  <input
                    type="date"
                    required
                    value={renunganForm.tanggal}
                    onChange={(e) => setRenunganForm({ ...renunganForm, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ayat Alkitab Kunci</label>
                <input
                  type="text"
                  placeholder="Contoh: Filipi 4:13"
                  value={renunganForm.ayat_alkitab}
                  onChange={(e) => setRenunganForm({ ...renunganForm, ayat_alkitab: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Isi Pesan Renungan *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tuliskan renungan firman Tuhan..."
                  value={renunganForm.isi}
                  onChange={(e) => setRenunganForm({ ...renunganForm, isi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsRenunganModal(false)} className="px-4 py-2 text-slate-300 hover:text-white cursor-pointer font-medium">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold cursor-pointer shadow-lg text-white">
                  {editingRenunganId ? 'Simpan Perubahan Renungan' : 'Simpan & Terbitkan Renungan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Renungan Reader Modal */}
      <RenunganFullscreenModal
        renungan={selectedRenunganForModal}
        onClose={() => setSelectedRenunganForModal(null)}
      />
    </div>
  );
};
