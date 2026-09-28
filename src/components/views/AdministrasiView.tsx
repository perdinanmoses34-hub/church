import React, { useState, useEffect } from 'react';
import { Baptisan, Sidi, Pernikahan, User, Jemaat } from '../../types';
import { StorageManager } from '../../utils/storage';
import { exportToPDF, printDocument, SignatureBlock } from '../../utils/exportTools';
import { FileText, Plus, Award, Heart, Scroll, Printer, Download, X, Trash2, Upload, CheckCircle, ExternalLink, Eye, Check } from 'lucide-react';
import { confirmDialog } from '../../utils/confirmDialog';

interface AdministrasiViewProps {
  currentUser: User;
}

export const AdministrasiView: React.FC<AdministrasiViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'BAPTISAN' | 'SIDI' | 'PERNIKAHAN' | 'SURAT'>('BAPTISAN');
  const [baptisanList, setBaptisanList] = useState<Baptisan[]>([]);
  const [sidiList, setSidiList] = useState<Sidi[]>([]);
  const [pernikahanList, setPernikahanList] = useState<Pernikahan[]>([]);
  const [jemaatList, setJemaatList] = useState<Jemaat[]>([]);

  // Modals
  const [isBaptisModal, setIsBaptisModal] = useState(false);
  const [isSidiModal, setIsSidiModal] = useState(false);
  const [isNikahModal, setIsNikahModal] = useState(false);

  // Upload file state for specific Sakramen (Baptisan, Sidi, Pernikahan)
  const [uploadTarget, setUploadTarget] = useState<{
    type: 'BAPTISAN' | 'SIDI' | 'PERNIKAHAN';
    id: string;
    name: string;
  } | null>(null);
  const [uploadUrlInput, setUploadUrlInput] = useState<string>('');

  // Berita Acara Preview Modal
  const [selectedBeritaAcara, setSelectedBeritaAcara] = useState<{
    type: 'BAPTISAN' | 'SIDI' | 'PERNIKAHAN';
    title: string;
    nomor: string;
    nama: string;
    tanggal: string;
    pendeta: string;
    lokasi?: string;
    suami?: string;
    istri?: string;
    items: { label: string; val: string }[];
  } | null>(null);

  // Form states
  const [baptisForm, setBaptisForm] = useState({
    nama_jemaat: '',
    tanggal: new Date().toISOString().slice(0, 10),
    pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
    lokasi: 'Gedung Sanctuary Utama',
    file_surat_baptis: ''
  });

  const [sidiForm, setSidiForm] = useState({
    nama_jemaat: '',
    tanggal: new Date().toISOString().slice(0, 10),
    pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
    file_surat_sidi: ''
  });

  const [nikahForm, setNikahForm] = useState({
    suami: '',
    istri: '',
    tanggal: new Date().toISOString().slice(0, 10),
    pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
    lokasi: 'Gedung Sanctuary Utama',
    file_surat_nikah: ''
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
    setBaptisanList(StorageManager.getBaptisan());
    setSidiList(StorageManager.getSidi());
    setPernikahanList(StorageManager.getPernikahan());
    setJemaatList(StorageManager.getJemaat());
  };

  const handleSaveBaptis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baptisForm.nama_jemaat) return;
    const settings = StorageManager.getSettings();
    const allJ = StorageManager.getJemaat();
    const matchedJ = allJ.find(
      (j) =>
        j.nama_lengkap.toLowerCase().includes(baptisForm.nama_jemaat.toLowerCase()) ||
        baptisForm.nama_jemaat.toLowerCase().includes(j.nama_lengkap.toLowerCase())
    );

    const newB: Baptisan = {
      baptisan_id: `BAP-2026-${(baptisanList.length + 1).toString().padStart(3, '0')}`,
      jemaat_id: matchedJ ? matchedJ.jemaat_id : 'JMT-GEN',
      nama_jemaat: baptisForm.nama_jemaat,
      tanggal: baptisForm.tanggal,
      pendeta: baptisForm.pendeta,
      lokasi: baptisForm.lokasi,
      nomor_surat: `BAP/${settings.nama_gereja ? settings.nama_gereja.slice(0, 4).toUpperCase() : 'GKFC'}/2026/${baptisForm.tanggal.slice(5, 7)}/${(baptisanList.length + 1).toString().padStart(3, '0')}`,
      file_surat_baptis: baptisForm.file_surat_baptis
    };
    const updated = [newB, ...baptisanList];
    setBaptisanList(updated);
    StorageManager.saveBaptisan(updated);
    StorageManager.logActivity(currentUser.username, `Input Surat Baptisan: ${newB.nama_jemaat}`, 'Administrasi Sacraments');
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'baptisan_updated' } }));
    setIsBaptisModal(false);
    setBaptisForm({
      nama_jemaat: '',
      tanggal: new Date().toISOString().slice(0, 10),
      pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
      lokasi: 'Gedung Sanctuary Utama',
      file_surat_baptis: ''
    });
  };

  const handleUploadSuratFile = (
    type: 'BAPTISAN' | 'SIDI' | 'PERNIKAHAN',
    targetId: string,
    fileData: string
  ) => {
    if (type === 'BAPTISAN') {
      const updated = baptisanList.map((b) => {
        if (b.baptisan_id === targetId) {
          return { ...b, file_surat_baptis: fileData };
        }
        return b;
      });
      setBaptisanList(updated);
      StorageManager.saveBaptisan(updated);
      StorageManager.logActivity(currentUser.username, `Upload Surat Baptisan ID: ${targetId}`, 'Administrasi Sacraments');
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'baptisan_file_uploaded' } }));
    } else if (type === 'SIDI') {
      const updated = sidiList.map((s) => {
        if (s.sidi_id === targetId) {
          return { ...s, file_surat_sidi: fileData };
        }
        return s;
      });
      setSidiList(updated);
      StorageManager.saveSidi(updated);
      StorageManager.logActivity(currentUser.username, `Upload Surat Sidi ID: ${targetId}`, 'Administrasi Sacraments');
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'sidi_file_uploaded' } }));
    } else if (type === 'PERNIKAHAN') {
      const updated = pernikahanList.map((n) => {
        if (n.nikah_id === targetId) {
          return { ...n, file_surat_nikah: fileData };
        }
        return n;
      });
      setPernikahanList(updated);
      StorageManager.savePernikahan(updated);
      StorageManager.logActivity(currentUser.username, `Upload Surat Nikah ID: ${targetId}`, 'Administrasi Sacraments');
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'nikah_file_uploaded' } }));
    }
    setUploadTarget(null);
    setUploadUrlInput('');
  };

  const handleSaveSidi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidiForm.nama_jemaat) return;
    const settings = StorageManager.getSettings();
    const newS: Sidi = {
      sidi_id: `SDI-2026-${(sidiList.length + 1).toString().padStart(3, '0')}`,
      jemaat_id: 'JMT-GEN',
      nama_jemaat: sidiForm.nama_jemaat,
      tanggal: sidiForm.tanggal,
      pendeta: sidiForm.pendeta,
      nomor_surat: `SDI/${settings.nama_gereja ? settings.nama_gereja.slice(0, 4).toUpperCase() : 'GKFC'}/2026/${sidiForm.tanggal.slice(5, 7)}/${(sidiList.length + 1).toString().padStart(3, '0')}`,
      file_surat_sidi: sidiForm.file_surat_sidi
    };
    const updated = [newS, ...sidiList];
    setSidiList(updated);
    StorageManager.saveSidi(updated);
    StorageManager.logActivity(currentUser.username, `Input Surat Peneguhan Sidi: ${newS.nama_jemaat}`, 'Administrasi Sacraments');
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'sidi_updated' } }));
    setIsSidiModal(false);
    setSidiForm({
      nama_jemaat: '',
      tanggal: new Date().toISOString().slice(0, 10),
      pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
      file_surat_sidi: ''
    });
  };

  const handleSaveNikah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikahForm.suami || !nikahForm.istri) return;
    const settings = StorageManager.getSettings();
    const newN: Pernikahan = {
      nikah_id: `NKH-2026-${(pernikahanList.length + 1).toString().padStart(3, '0')}`,
      suami: nikahForm.suami,
      istri: nikahForm.istri,
      tanggal: nikahForm.tanggal,
      pendeta: nikahForm.pendeta,
      lokasi: nikahForm.lokasi,
      nomor_surat: `NKH/${settings.nama_gereja ? settings.nama_gereja.slice(0, 4).toUpperCase() : 'GKFC'}/2026/${nikahForm.tanggal.slice(5, 7)}/${(pernikahanList.length + 1).toString().padStart(3, '0')}`,
      file_surat_nikah: nikahForm.file_surat_nikah
    };
    const updated = [newN, ...pernikahanList];
    setPernikahanList(updated);
    StorageManager.savePernikahan(updated);
    StorageManager.logActivity(currentUser.username, `Input Surat Pemberkatan Nikah: ${newN.suami} & ${newN.istri}`, 'Administrasi Sacraments');
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'nikah_updated' } }));
    setIsNikahModal(false);
    setNikahForm({
      suami: '',
      istri: '',
      tanggal: new Date().toISOString().slice(0, 10),
      pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
      lokasi: 'Gedung Sanctuary Utama',
      file_surat_nikah: ''
    });
  };

  const handleDeleteSuratFile = async (type: 'BAPTISAN' | 'SIDI' | 'PERNIKAHAN', targetId: string) => {
    const ok = await confirmDialog({
      title: 'Hapus File Surat',
      message: 'Apakah anda yakin akan menghapus file ini?',
      confirmText: 'Ya, Hapus File',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;
    handleUploadSuratFile(type, targetId, '');
  };

  const handleDeleteBaptis = async (id: string, nama: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Record Baptisan',
      message: `Apakah Anda yakin akan menghapus data baptisan untuk ${nama}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;
    const updated = baptisanList.filter((b) => b.baptisan_id !== id);
    setBaptisanList(updated);
    StorageManager.saveBaptisan(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus record baptis: ${nama}`, 'Administrasi Sacraments');
  };

  const handleDeleteSidi = async (id: string, nama: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Record Sidi',
      message: `Apakah Anda yakin akan menghapus data peneguhan sidi untuk ${nama}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;
    const updated = sidiList.filter((s) => s.sidi_id !== id);
    setSidiList(updated);
    StorageManager.saveSidi(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus record sidi: ${nama}`, 'Administrasi Sacraments');
  };

  const handleDeleteNikah = async (id: string, nama: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Record Pernikahan',
      message: `Apakah Anda yakin akan menghapus data pernikahan untuk ${nama}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;
    const updated = pernikahanList.filter((n) => n.nikah_id !== id);
    setPernikahanList(updated);
    StorageManager.savePernikahan(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus record pernikahan: ${nama}`, 'Administrasi Sacraments');
  };

  // Helper Signatures Builder
  const getSakramenSignatures = (pendetaName?: string, tanggalText?: string): SignatureBlock => {
    const settings = StorageManager.getSettings();
    return {
      mengetahuiText: 'Mengetahui,',
      leftTitle: 'Pendeta Jemaat / Gembala',
      leftName: pendetaName || 'Pdt. Dr. Herman Setyawan, M.Th',
      leftRole: 'Pendeta Pelayan / Gembala Jemaat',
      rightTitle: 'Ketua Majelis',
      rightName: '....................................................',
      rightRole: 'Ketua Majelis Jemaat',
      dateCity: `Ditetapkan di ${settings.alamat ? settings.alamat.split(',')[0].trim() : 'Gereja'}, ${tanggalText || new Date().toISOString().slice(0, 10)}`
    };
  };

  // Cetak Berita Acara Baptisan Kudus (PDF)
  const cetakBeritaAcaraBaptisPDF = (b: Baptisan) => {
    const settings = StorageManager.getSettings();
    const churchName = (settings.nama_gereja || 'SYSTEM MANAGEMENT CHURCH').trim();
    const title = `BERITA ACARA SAKRAMEN BAPTISAN KUDUS (No. ${b.nomor_surat || b.baptisan_id})`;
    const headers = ['Parameter Berita Acara', 'Rincian & Keterangan Resmi'];
    const rows = [
      ['Gereja Penyelenggara', churchName],
      ['Nomor Berita Acara / Surat', b.nomor_surat || b.baptisan_id],
      ['Nama Jemaat Yang Dibaptis', b.nama_jemaat || '-'],
      ['Tanggal Pelaksanaan Baptis', b.tanggal],
      ['Pendeta Pembaptis', b.pendeta],
      ['Lokasi Sakramen', b.lokasi || 'Gedung Sanctuary Utama'],
      ['Dasar Alkitabiah', 'Matius 28:19 - Dalam Nama Bapa, Anak, dan Roh Kudus'],
      ['Keterangan Status', 'Berita Acara Resmi Sakramen Baptisan Kudus Sah & Tercatat']
    ];
    const signatures = getSakramenSignatures(b.pendeta, b.tanggal);
    exportToPDF(title, headers, rows, settings, `Berita_Acara_Baptis_${b.nama_jemaat || 'Jemaat'}`, signatures);
  };

  // Cetak Berita Acara Peneguhan Sidi (PDF)
  const cetakBeritaAcaraSidiPDF = (s: Sidi) => {
    const settings = StorageManager.getSettings();
    const churchName = (settings.nama_gereja || 'SYSTEM MANAGEMENT CHURCH').trim();
    const title = `BERITA ACARA PENEGUHAN SIDI (No. ${s.nomor_surat || s.sidi_id})`;
    const headers = ['Parameter Berita Acara', 'Rincian & Keterangan Resmi'];
    const rows = [
      ['Gereja Penyelenggara', churchName],
      ['Nomor Berita Acara / Surat', s.nomor_surat || s.sidi_id],
      ['Nama Peserta Peneguhan Sidi', s.nama_jemaat || '-'],
      ['Tanggal Peneguhan Sidi', s.tanggal],
      ['Pendeta Yang Meneguhkan', s.pendeta],
      ['Dasar Pengakuan Iman', 'Roma 10:9-10 - Pengakuan Percaya di Hadapan Allah dan Jemaat'],
      ['Keterangan Status', 'Berita Acara Resmi Peneguhan Sidi Anggota Penuh Gereja Sah']
    ];
    const signatures = getSakramenSignatures(s.pendeta, s.tanggal);
    exportToPDF(title, headers, rows, settings, `Berita_Acara_Sidi_${s.nama_jemaat || 'Jemaat'}`, signatures);
  };

  // Cetak Berita Acara Pemberkatan Pernikahan (PDF)
  const cetakBeritaAcaraNikahPDF = (n: Pernikahan) => {
    const settings = StorageManager.getSettings();
    const churchName = (settings.nama_gereja || 'SYSTEM MANAGEMENT CHURCH').trim();
    const title = `BERITA ACARA PEMBERKATAN PERNIKAHAN KUDUS (No. ${n.nomor_surat || n.nikah_id})`;
    const headers = ['Parameter Berita Acara', 'Rincian & Keterangan Resmi'];
    const rows = [
      ['Gereja Penyelenggara', churchName],
      ['Nomor Akta / Berita Acara', n.nomor_surat || n.nikah_id],
      ['Nama Mempelai Pria (Suami)', n.suami],
      ['Nama Mempelai Wanita (Istri)', n.istri],
      ['Tanggal Pemberkatan Nikah', n.tanggal],
      ['Pendeta Pemberkat', n.pendeta],
      ['Lokasi Pemberkatan', n.lokasi || 'Gedung Sanctuary Utama'],
      ['Dasar Firman Tuhan', 'Matius 19:6 - Apa yang dipersatukan Allah tidak boleh diceraikan manusia'],
      ['Keterangan Status', 'Berita Acara Resmi Pemberkatan Pernikahan Kudus Gerejawi Sah']
    ];
    const signatures = getSakramenSignatures(n.pendeta, n.tanggal);
    exportToPDF(title, headers, rows, settings, `Berita_Acara_Nikah_${n.suami}_dan_${n.istri}`, signatures);
  };

  // Buka Pratinjau Berita Acara
  const handleOpenPreviewBaptis = (b: Baptisan) => {
    setSelectedBeritaAcara({
      type: 'BAPTISAN',
      title: 'BERITA ACARA SAKRAMEN BAPTISAN KUDUS',
      nomor: b.nomor_surat || b.baptisan_id,
      nama: b.nama_jemaat || '-',
      tanggal: b.tanggal,
      pendeta: b.pendeta,
      lokasi: b.lokasi || 'Gedung Sanctuary Utama',
      items: [
        { label: 'Nomor Berita Acara / Surat', val: b.nomor_surat || b.baptisan_id },
        { label: 'Nama Jemaat Yang Dibaptis', val: b.nama_jemaat || '-' },
        { label: 'Tanggal Pelaksanaan', val: b.tanggal },
        { label: 'Pendeta Pembaptis', val: b.pendeta },
        { label: 'Lokasi Sakramen', val: b.lokasi || 'Gedung Sanctuary Utama' },
        { label: 'Dasar Firman', val: 'Matius 28:19 - Dalam Nama Bapa, Anak, dan Roh Kudus' },
        { label: 'Status Dokumen', val: 'Surat & Berita Acara Sah Tercatat di Buku Induk Gereja' }
      ]
    });
  };

  const handleOpenPreviewSidi = (s: Sidi) => {
    setSelectedBeritaAcara({
      type: 'SIDI',
      title: 'BERITA ACARA PENEGUHAN SIDI (PENGAKUAN PERCAYA)',
      nomor: s.nomor_surat || s.sidi_id,
      nama: s.nama_jemaat || '-',
      tanggal: s.tanggal,
      pendeta: s.pendeta,
      items: [
        { label: 'Nomor Berita Acara / Surat', val: s.nomor_surat || s.sidi_id },
        { label: 'Nama Peserta Peneguhan Sidi', val: s.nama_jemaat || '-' },
        { label: 'Tanggal Peneguhan Sidi', val: s.tanggal },
        { label: 'Pendeta Yang Meneguhkan', val: s.pendeta },
        { label: 'Dasar Firman', val: 'Roma 10:9-10 - Pengakuan Percaya di Hadapan Allah dan Jemaat' },
        { label: 'Status Dokumen', val: 'Berita Acara Resmi Keanggotaan Penuh Gereja Sah' }
      ]
    });
  };

  const handleOpenPreviewNikah = (n: Pernikahan) => {
    setSelectedBeritaAcara({
      type: 'PERNIKAHAN',
      title: 'BERITA ACARA PEMBERKATAN PERNIKAHAN KUDUS',
      nomor: n.nomor_surat || n.nikah_id,
      nama: `${n.suami} & ${n.istri}`,
      tanggal: n.tanggal,
      pendeta: n.pendeta,
      suami: n.suami,
      istri: n.istri,
      lokasi: n.lokasi || 'Gedung Sanctuary Utama',
      items: [
        { label: 'Nomor Akta / Berita Acara', val: n.nomor_surat || n.nikah_id },
        { label: 'Mempelai Pria (Suami)', val: n.suami },
        { label: 'Mempelai Wanita (Istri)', val: n.istri },
        { label: 'Tanggal Pemberkatan Nikah', val: n.tanggal },
        { label: 'Pendeta Pemberkat', val: n.pendeta },
        { label: 'Lokasi Sakramen', val: n.lokasi || 'Gedung Sanctuary Utama' },
        { label: 'Dasar Firman', val: 'Matius 19:6 - Apa yang dipersatukan Allah tidak boleh diceraikan manusia' },
        { label: 'Status Dokumen', val: 'Berita Acara Resmi Pemberkatan Pernikahan Kudus Sah' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Scroll className="w-6 h-6 text-indigo-400" />
            <span>Administrasi Sakramen & Surat Gereja</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pencatatan Baptisan Kudus, Peneguhan Sidi, Pemberkatan Pernikahan Kudus, Upload Surat Baptisan, dan Berita Acara.
          </p>
        </div>

        {/* Subtab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('BAPTISAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'BAPTISAN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Baptisan ({baptisanList.length})
          </button>
          <button
            onClick={() => setActiveTab('SIDI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'SIDI' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sidi ({sidiList.length})
          </button>
          <button
            onClick={() => setActiveTab('PERNIKAHAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'PERNIKAHAN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pernikahan ({pernikahanList.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Baptisan */}
      {activeTab === 'BAPTISAN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Record Data Baptisan Kudus & Surat</h3>
            {isAdmin && (
              <button
                onClick={() => setIsBaptisModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Baptisan Baru</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">No. Surat & ID</th>
                    <th className="p-3.5">Nama Yang Dibaptis</th>
                    <th className="p-3.5">Tanggal Baptis</th>
                    <th className="p-3.5">Pendeta Pembaptis</th>
                    <th className="p-3.5">Dokumen Surat Jadi</th>
                    <th className="p-3.5 text-center">Cetak Berita Acara</th>
                    {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {baptisanList.map((b) => (
                    <tr key={b.baptisan_id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3.5 font-mono text-indigo-300">
                        {b.nomor_surat || b.baptisan_id}
                      </td>
                      <td className="p-3.5 font-bold text-white text-sm">{b.nama_jemaat || b.jemaat_id}</td>
                      <td className="p-3.5">{b.tanggal}</td>
                      <td className="p-3.5">{b.pendeta}</td>
                      <td className="p-3.5">
                        {b.file_surat_baptis ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Surat Jadi</span>
                            </span>
                            <a
                              href={b.file_surat_baptis}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Lihat / Download Surat Baptisan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka / Unduh</span>
                            </a>
                            {isAdmin && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setUploadTarget({ type: 'BAPTISAN', id: b.baptisan_id, name: b.nama_jemaat || b.jemaat_id })}
                                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                                >
                                  Ganti
                                </button>
                                <button
                                  onClick={() => handleDeleteSuratFile('BAPTISAN', b.baptisan_id)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                                  title="Hapus file surat ini"
                                >
                                  Hapus File
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isAdmin ? (
                          <button
                            onClick={() => setUploadTarget({ type: 'BAPTISAN', id: b.baptisan_id, name: b.nama_jemaat || b.jemaat_id })}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Surat Jadi</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                            Belum Diupload Admin
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPreviewBaptis(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-slate-700 transition-all shadow-sm"
                            title="Pratinjau Berita Acara & Tanda Tangan"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Lihat Akta</span>
                          </button>
                          <button
                            onClick={() => cetakBeritaAcaraBaptisPDF(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-900/50 hover:bg-indigo-900/90 text-indigo-300 inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-indigo-700/40 transition-all shadow-sm"
                            title="Unduh PDF Berita Acara Resmi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteBaptis(b.baptisan_id, b.nama_jemaat || b.jemaat_id)}
                            className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-all inline-flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Hapus Record"
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
        </div>
      )}

      {/* Modal Upload Surat Jadi Resmi (Baptisan / Sidi / Pernikahan) */}
      {uploadTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">
                  Upload Surat {uploadTarget.type === 'BAPTISAN' ? 'Baptisan' : uploadTarget.type === 'SIDI' ? 'Peneguhan Sidi' : 'Pemberkatan Nikah'} Resmi
                </h3>
              </div>
              <button onClick={() => setUploadTarget(null)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[11px] text-slate-400">
                  Nama Record: <span className="text-white font-bold">{uploadTarget.name}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  ID Dokumen: <span className="text-indigo-400 font-mono font-bold">{uploadTarget.id}</span>
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Unggah file Surat {uploadTarget.type === 'BAPTISAN' ? 'Baptisan' : uploadTarget.type === 'SIDI' ? 'Sidi' : 'Pernikahan'} yang telah selesai ditandatangani gereja (PDF/Foto) agar jemaat dapat langsung mengunduhnya dari portal gereja.
              </p>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Pilih File Surat dari Komputer (Foto/PDF)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-[11px]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          handleUploadSuratFile(uploadTarget.type, uploadTarget.id, evt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATAU</div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tautan / URL File Surat Online</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/... atau URL dokumen"
                  value={uploadUrlInput}
                  onChange={(e) => setUploadUrlInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setUploadTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (uploadUrlInput) {
                    handleUploadSuratFile(uploadTarget.type, uploadTarget.id, uploadUrlInput);
                  }
                }}
                disabled={!uploadUrlInput}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold cursor-pointer"
              >
                Simpan File Surat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sidi */}
      {activeTab === 'SIDI' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Record Data Peneguhan Sidi</h3>
            {isAdmin && (
              <button
                onClick={() => setIsSidiModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Peneguhan Sidi</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">No. Surat & ID</th>
                    <th className="p-3.5">Nama Peserta Sidi</th>
                    <th className="p-3.5">Tanggal Sidi</th>
                    <th className="p-3.5">Pendeta Melayani</th>
                    <th className="p-3.5">Dokumen Surat Jadi</th>
                    <th className="p-3.5 text-center">Berita Acara</th>
                    {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sidiList.map((s) => (
                    <tr key={s.sidi_id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3.5 font-mono text-blue-300">{s.nomor_surat || s.sidi_id}</td>
                      <td className="p-3.5 font-bold text-white text-sm">{s.nama_jemaat || s.jemaat_id}</td>
                      <td className="p-3.5">{s.tanggal}</td>
                      <td className="p-3.5">{s.pendeta}</td>
                      <td className="p-3.5">
                        {s.file_surat_sidi ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Surat Jadi</span>
                            </span>
                            <a
                              href={s.file_surat_sidi}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/60 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Lihat / Download Surat Sidi"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka / Unduh</span>
                            </a>
                            {isAdmin && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setUploadTarget({
                                      type: 'SIDI',
                                      id: s.sidi_id,
                                      name: s.nama_jemaat || s.jemaat_id
                                    })
                                  }
                                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                                >
                                  Ganti
                                </button>
                                <button
                                  onClick={() => handleDeleteSuratFile('SIDI', s.sidi_id)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                                  title="Hapus file surat ini"
                                >
                                  Hapus File
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isAdmin ? (
                          <button
                            onClick={() =>
                              setUploadTarget({
                                type: 'SIDI',
                                id: s.sidi_id,
                                name: s.nama_jemaat || s.jemaat_id
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Surat Jadi</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                            Belum Diupload Admin
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPreviewSidi(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-slate-700 transition-all shadow-sm"
                            title="Pratinjau Berita Acara Peneguhan Sidi"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Lihat Akta</span>
                          </button>
                          <button
                            onClick={() => cetakBeritaAcaraSidiPDF(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-900/90 text-blue-300 inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-blue-700/40 transition-all shadow-sm"
                            title="Unduh PDF Berita Acara Sidi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteSidi(s.sidi_id, s.nama_jemaat || s.jemaat_id)}
                            className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-all inline-flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Hapus Record"
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
        </div>
      )}

      {/* Tab 3: Pernikahan */}
      {activeTab === 'PERNIKAHAN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Record Pemberkatan Pernikahan Kudus</h3>
            {isAdmin && (
              <button
                onClick={() => setIsNikahModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Pernikahan Baru</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">No. Surat Nikah</th>
                    <th className="p-3.5">Mempelai Pria (Suami)</th>
                    <th className="p-3.5">Mempelai Wanita (Istri)</th>
                    <th className="p-3.5">Tanggal Pemberkatan</th>
                    <th className="p-3.5">Pendeta Pemberkat</th>
                    <th className="p-3.5">Dokumen Surat Jadi</th>
                    <th className="p-3.5 text-center">Berita Acara</th>
                    {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pernikahanList.map((n) => (
                    <tr key={n.nikah_id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3.5 font-mono text-emerald-300">{n.nomor_surat || n.nikah_id}</td>
                      <td className="p-3.5 font-bold text-white">{n.suami}</td>
                      <td className="p-3.5 font-bold text-white">{n.istri}</td>
                      <td className="p-3.5">{n.tanggal}</td>
                      <td className="p-3.5">{n.pendeta}</td>
                      <td className="p-3.5">
                        {n.file_surat_nikah ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Surat Jadi</span>
                            </span>
                            <a
                              href={n.file_surat_nikah}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Lihat / Download Surat Nikah"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka / Unduh</span>
                            </a>
                            {isAdmin && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setUploadTarget({
                                      type: 'PERNIKAHAN',
                                      id: n.nikah_id,
                                      name: `${n.suami} & ${n.istri}`
                                    })
                                  }
                                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                                >
                                  Ganti
                                </button>
                                <button
                                  onClick={() => handleDeleteSuratFile('PERNIKAHAN', n.nikah_id)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                                  title="Hapus file surat ini"
                                >
                                  Hapus File
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isAdmin ? (
                          <button
                            onClick={() =>
                              setUploadTarget({
                                type: 'PERNIKAHAN',
                                id: n.nikah_id,
                                name: `${n.suami} & ${n.istri}`
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Surat Jadi</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                            Belum Diupload Admin
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPreviewNikah(n)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-slate-700 transition-all shadow-sm"
                            title="Pratinjau Berita Acara Pemberkatan Pernikahan"
                          >
                            <Eye className="w-3.5 h-3.5 text-pink-400" />
                            <span>Lihat Akta</span>
                          </button>
                          <button
                            onClick={() => cetakBeritaAcaraNikahPDF(n)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-900/90 text-emerald-300 inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-emerald-700/40 transition-all shadow-sm"
                            title="Unduh PDF Berita Acara Nikah"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteNikah(n.nikah_id, `${n.suami} & ${n.istri}`)}
                            className="p-1.5 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-all inline-flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Hapus Record"
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
        </div>
      )}

      {/* Modal Input Baptis */}
      {isBaptisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">Input Data Baptisan Kudus</h3>
              <button onClick={() => setIsBaptisModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBaptis} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Jemaat Dibaptis *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Jemaat"
                  value={baptisForm.nama_jemaat}
                  onChange={(e) => setBaptisForm({ ...baptisForm, nama_jemaat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  value={baptisForm.tanggal}
                  onChange={(e) => setBaptisForm({ ...baptisForm, tanggal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pendeta Pembaptis</label>
                <input
                  type="text"
                  value={baptisForm.pendeta}
                  onChange={(e) => setBaptisForm({ ...baptisForm, pendeta: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Lokasi Baptisan</label>
                <input
                  type="text"
                  value={baptisForm.lokasi}
                  onChange={(e) => setBaptisForm({ ...baptisForm, lokasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Upload File Surat Baptisan Jadi (Opsional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-[11px]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setBaptisForm({ ...baptisForm, file_surat_baptis: evt.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsBaptisModal(false)} className="px-4 py-2 text-slate-300 font-bold cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold cursor-pointer">
                  Simpan Baptisan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Sidi */}
      {isSidiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">Input Data Peneguhan Sidi</h3>
              <button onClick={() => setIsSidiModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSidi} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Peserta Sidi *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Jemaat"
                  value={sidiForm.nama_jemaat}
                  onChange={(e) => setSidiForm({ ...sidiForm, nama_jemaat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tanggal Sidi</label>
                <input
                  type="date"
                  value={sidiForm.tanggal}
                  onChange={(e) => setSidiForm({ ...sidiForm, tanggal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pendeta Melayani</label>
                <input
                  type="text"
                  value={sidiForm.pendeta}
                  onChange={(e) => setSidiForm({ ...sidiForm, pendeta: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Upload File Surat Peneguhan Sidi Jadi (Opsional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-[11px]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setSidiForm({ ...sidiForm, file_surat_sidi: evt.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsSidiModal(false)} className="px-4 py-2 text-slate-300 font-bold cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold cursor-pointer">
                  Simpan Sidi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Nikah */}
      {isNikahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold">Input Pemberkatan Pernikahan</h3>
              <button onClick={() => setIsNikahModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNikah} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Mempelai Pria (Suami) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Suami"
                  value={nikahForm.suami}
                  onChange={(e) => setNikahForm({ ...nikahForm, suami: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Mempelai Wanita (Istri) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Istri"
                  value={nikahForm.istri}
                  onChange={(e) => setNikahForm({ ...nikahForm, istri: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tanggal Pemberkatan</label>
                <input
                  type="date"
                  value={nikahForm.tanggal}
                  onChange={(e) => setNikahForm({ ...nikahForm, tanggal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pendeta Pemberkat</label>
                <input
                  type="text"
                  value={nikahForm.pendeta}
                  onChange={(e) => setNikahForm({ ...nikahForm, pendeta: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Upload File Surat Pemberkatan Nikah Jadi (Opsional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-[11px]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setNikahForm({ ...nikahForm, file_surat_nikah: evt.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsNikahModal(false)} className="px-4 py-2 text-slate-300 font-bold cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold cursor-pointer">
                  Simpan Pernikahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU BERITA ACARA RESMI & TANDA TANGAN */}
      {selectedBeritaAcara && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Scroll className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug">
                    {selectedBeritaAcara.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Nomor Dokumen: {selectedBeritaAcara.nomor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBeritaAcara(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Area */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/60 space-y-5">
              {/* Paper Layout */}
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
                {/* Kop Surat Gereja */}
                <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                    {StorageManager.getSettings().nama_gereja || 'SYSTEM MANAGEMENT CHURCH'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {StorageManager.getSettings().alamat || 'Sekretariat & Gedung Ibadah Jemaat'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {StorageManager.getSettings().telepon ? `Telp: ${StorageManager.getSettings().telepon} | ` : ''}
                    Sistem Administrasi Sakramen &amp; Akta Gerejawi Sah
                  </p>
                </div>

                {/* Judul Berita Acara */}
                <div className="text-center my-4">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-950 uppercase underline decoration-2 underline-offset-4">
                    {selectedBeritaAcara.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1 font-mono">
                    No: {selectedBeritaAcara.nomor}
                  </p>
                </div>

                {/* Paragraf Pembuka */}
                <p className="text-xs leading-relaxed text-slate-700 my-4 text-justify">
                  Pada hari ini, dengan penuh rasa syukur ke hadapan Tuhan Yang Maha Esa dan disaksikan oleh Majelis serta Jemaat, telah dilaksanakan sakramen gerejawi yang sah dengan data dan ketetapan sebagai berikut:
                </p>

                {/* Tabel Data Berita Acara */}
                <div className="overflow-hidden rounded-xl border border-slate-300 my-4 text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      {selectedBeritaAcara.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="w-1/3 px-3.5 py-2.5 font-bold text-slate-700 border-b border-slate-200">
                            {item.label}
                          </td>
                          <td className="w-2/3 px-3.5 py-2.5 text-slate-900 font-semibold border-b border-slate-200">
                            : {item.val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paragraf Penutup */}
                <p className="text-xs leading-relaxed text-slate-700 my-3 text-justify">
                  Demikian Berita Acara ini dibuat dan disahkan dengan sebenar-benarnya dalam persekutuan jemaat untuk dipergunakan sebagaimana mestinya.
                </p>

                {/* BLOK TANDA TANGAN MENGETAHUI */}
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <div className="text-right text-xs text-slate-600 mb-3 italic">
                    Ditetapkan pada: {selectedBeritaAcara.tanggal || new Date().toISOString().slice(0, 10)}
                  </div>

                  <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
                    Mengetahui,
                  </div>

                  {/* Dua Kolom: Sebelah Kiri & Sebelah Kanan */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {/* Sebelah Kiri: Pendeta Jemaat / Gembala */}
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-bold text-slate-950 mb-1">
                        Pendeta Jemaat / Gembala
                      </div>
                      <div className="w-full max-w-[200px] h-20 border border-dashed border-slate-300 rounded-lg my-2 flex items-center justify-center bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 italic">
                          (Tanda Tangan &amp; Cap Gereja)
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 border-b border-slate-800 pb-0.5 min-w-[190px]">
                        ( {selectedBeritaAcara.pendeta || 'Pdt. Dr. Herman Setyawan, M.Th'} )
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Pendeta Pelayan / Gembala Jemaat
                      </div>
                    </div>

                    {/* Sebelah Kanan: Ketua Majelis */}
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-bold text-slate-950 mb-1">
                        Ketua Majelis
                      </div>
                      <div className="w-full max-w-[200px] h-20 border border-dashed border-slate-300 rounded-lg my-2 flex items-center justify-center bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 italic">
                          (Tanda Tangan &amp; Cap Majelis)
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 border-b border-slate-800 pb-0.5 min-w-[190px]">
                        ( .................................................... )
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Ketua Majelis Jemaat
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Format resmi sesuai ketentuan Sinode / PGI &amp; Buku Induk Gereja</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const settings = StorageManager.getSettings();
                    const headers = ['Parameter Berita Acara', 'Keterangan Resmi'];
                    const rows = selectedBeritaAcara.items.map((it) => [it.label, it.val]);
                    const sigs = getSakramenSignatures(selectedBeritaAcara.pendeta, selectedBeritaAcara.tanggal);
                    printDocument(selectedBeritaAcara.title, headers, rows, settings, sigs);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const settings = StorageManager.getSettings();
                    const headers = ['Parameter Berita Acara', 'Keterangan Resmi'];
                    const rows = selectedBeritaAcara.items.map((it) => [it.label, it.val]);
                    const sigs = getSakramenSignatures(selectedBeritaAcara.pendeta, selectedBeritaAcara.tanggal);
                    exportToPDF(
                      selectedBeritaAcara.title,
                      headers,
                      rows,
                      settings,
                      `Berita_Acara_${selectedBeritaAcara.type}_${selectedBeritaAcara.nama.replace(/[^a-zA-Z0-9]/g, '_')}`,
                      sigs
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF Resmi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
