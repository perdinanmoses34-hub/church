import React, { useState, useEffect } from 'react';
import { User, AppSettings } from '../../types';
import { StorageManager } from '../../utils/storage';
import { exportToExcel, exportToPDF, printDocument, getDefaultSignatures } from '../../utils/exportTools';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle,
  Database,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  UserCheck,
  Settings,
  Eye,
  Save,
  X,
  PenTool
} from 'lucide-react';

interface LaporanViewProps {
  currentUser: User;
}

export const LaporanView: React.FC<LaporanViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const [settings, setSettings] = useState<AppSettings>(() => StorageManager.getSettings());
  const [sigForm, setSigForm] = useState({
    nama_ketua_majelis: settings.nama_ketua_majelis || 'Dkn. Maria Melani',
    jabatan_ketua_majelis: settings.jabatan_ketua_majelis || 'Ketua Majelis Jemaat',
    nama_pendeta: settings.nama_pendeta || 'Pdt. Ferdinan Moses Timbu, S.Th, M.PdK',
    jabatan_pendeta: settings.jabatan_pendeta || 'Pelayan Firman / Gembala',
    kota_surat:
      settings.kota_surat ||
      (settings.alamat ? settings.alamat.split(',')[0].trim() : 'Puriala') ||
      'Puriala'
  });
  const [savedSigSuccess, setSavedSigSuccess] = useState(false);
  const [showSigPreview, setShowSigPreview] = useState(true);
  const [previewModuleId, setPreviewModuleId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const syncSettings = () => {
      const fresh = StorageManager.getSettings();
      setSettings(fresh);
      setSigForm({
        nama_ketua_majelis: fresh.nama_ketua_majelis || 'Dkn. Maria Melani',
        jabatan_ketua_majelis: fresh.jabatan_ketua_majelis || 'Ketua Majelis Jemaat',
        nama_pendeta: fresh.nama_pendeta || 'Pdt. Ferdinan Moses Timbu, S.Th, M.PdK',
        jabatan_pendeta: fresh.jabatan_pendeta || 'Pelayan Firman / Gembala',
        kota_surat:
          fresh.kota_surat ||
          (fresh.alamat ? fresh.alamat.split(',')[0].trim() : 'Puriala') ||
          'Puriala'
      });
    };

    const unsubscribe = StorageManager.subscribe(syncSettings);
    window.addEventListener('cms_data_changed', syncSettings);
    window.addEventListener('storage', syncSettings);
    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, []);

  const handleSaveSignatureSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = StorageManager.getSettings();
    const updatedSettings: AppSettings = {
      ...currentSettings,
      nama_ketua_majelis: sigForm.nama_ketua_majelis.trim() || 'Dkn. Maria Melani',
      jabatan_ketua_majelis: sigForm.jabatan_ketua_majelis.trim() || 'Ketua Majelis Jemaat',
      nama_pendeta: sigForm.nama_pendeta.trim() || 'Pdt. Ferdinan Moses Timbu, S.Th, M.PdK',
      jabatan_pendeta: sigForm.jabatan_pendeta.trim() || 'Pelayan Firman / Gembala',
      kota_surat: sigForm.kota_surat.trim() || 'Puriala'
    };
    StorageManager.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    window.dispatchEvent(
      new CustomEvent('cms_data_changed', {
        detail: { action: 'settings_updated', settings: updatedSettings }
      })
    );
    StorageManager.logActivity(
      currentUser.username,
      `Memperbarui Pejabat Pengesahan (Mengetahui) Surat & Laporan: Ketua Majelis (${updatedSettings.nama_ketua_majelis}) & Pendeta Jemaat (${updatedSettings.nama_pendeta})`,
      'Data Laporan'
    );
    setSavedSigSuccess(true);
    setTimeout(() => setSavedSigSuccess(false), 4000);
  };

  const reportModules = [
    { id: 'JEMAAT', title: '02_JEMAAT - Master Data Jemaat & NIK', desc: 'Data lengkap seluruh jemaat, status baptis/sidi, komisi, & wilayah' },
    { id: 'KELUARGA', title: '03_KELUARGA - Kartu Keluarga (KK)', desc: 'Data kepala keluarga, alamat, nomor KK, dan anggota keluarga' },
    { id: 'WILAYAH', title: '04_WILAYAH - Sebaran Wilayah Rayon', desc: 'Daftar wilayah gereja, penatua ketua wilayah, dan statistik' },
    { id: 'PELAYANAN', title: '05_PELAYANAN - Komisi & Tim Ibadah', desc: 'Daftar komisi pemuda, bapa, wanita, sekolah minggu, & tim musik' },
    { id: 'BAPTISAN', title: '06_BAPTISAN - Sacraments Baptisan', desc: 'Data surat baptisan kudus, nomor registrasi, & pendeta pembaptis' },
    { id: 'SIDI', title: '07_SIDI - Peneguhan Sidi Jemaat', desc: 'Data surat sidi, tanggal peneguhan, dan pendeta melayani' },
    { id: 'PERNIKAHAN', title: '08_PERNIKAHAN - Pemberkatan Nikah', desc: 'Data akta nikah gereja, mempelai pria/wanita, dan tanggal nikah' },
    { id: 'PERSEMBAHAN', title: '09_PERSEMBAHAN - Keuangan Ibadah', desc: 'Catatan persembahan minggu, perpuluhan, syukur, & diakonia' },
    { id: 'DONASI', title: '10_DONASI - Donasi Pembangunan', desc: 'Penerimaan dana donasi khusus gedung & pembangunan' },
    { id: 'KAS', title: '11_KAS_PENGELUARAN - Arus Kas & Biaya', desc: 'Detail pengeluaran operasional, listrik, maintenance & saldo kas' }
  ];

  const handleOpenExternalBrowser = () => {
    const currentUrl = window.location.href;
    try {
      // In Android WebView / Cordova, '_system' opens device browser
      window.open(currentUrl, '_system');
    } catch {
      window.open(currentUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setIsCopied(true);
        setToastMsg('📋 Tautan web berhasil disalin! Silakan tempel dan buka di browser Google Chrome HP Anda.');
        setTimeout(() => {
          setIsCopied(false);
          setToastMsg('');
        }, 4000);
      }).catch(() => {
        prompt('Salin link berikut untuk dibuka di Google Chrome ponsel:', currentUrl);
      });
    } else {
      prompt('Salin link berikut untuk dibuka di Google Chrome ponsel:', currentUrl);
    }
  };

  const getModuleData = (modId: string) => {
    let title = '';
    let headers: string[] = [];
    let rows: any[][] = [];

    if (modId === 'JEMAAT') {
      const data = StorageManager.getJemaat();
      title = 'LAPORAN MASTER DATA JEMAAT GEREJA (02_JEMAAT)';
      headers = ['ID', 'NIK', 'Nama Lengkap', 'JK', 'Wilayah', 'Komisi', 'Status'];
      rows = data.map((j) => [j.jemaat_id, j.nik, j.nama_lengkap, j.jenis_kelamin, j.wilayah, j.komisi, j.status]);
    } else if (modId === 'KELUARGA') {
      const data = StorageManager.getKeluarga();
      title = 'LAPORAN KARTU KELUARGA (03_KELUARGA)';
      headers = ['No KK', 'Kepala Keluarga', 'Alamat', 'Wilayah', 'Jumlah Anggota'];
      rows = data.map((k) => [k.no_kk, k.kepala_keluarga, k.alamat, k.wilayah, `${k.jumlah_anggota || 1} Jiwa`]);
    } else if (modId === 'WILAYAH') {
      const data = StorageManager.getWilayah();
      title = 'LAPORAN WILAYAH RAYON GEREJA (04_WILAYAH)';
      headers = ['ID Wilayah', 'Nama Wilayah', 'Ketua Wilayah', 'Jumlah Jemaat'];
      rows = data.map((w) => [w.wilayah_id, w.nama_wilayah, w.ketua || '-', `${w.jumlah_jemaat || 0} Jemaat`]);
    } else if (modId === 'PELAYANAN') {
      const data = StorageManager.getPelayanan();
      title = 'LAPORAN KOMISI & TIM PELAYANAN (05_PELAYANAN)';
      headers = ['ID', 'Nama Pelayanan', 'Kategori', 'Penanggung Jawab', 'Jadwal'];
      rows = data.map((p) => [p.pelayanan_id, p.nama, p.kategori, p.penanggung_jawab || '-', p.jadwal || '-']);
    } else if (modId === 'BAPTISAN') {
      const data = StorageManager.getBaptisan();
      title = 'LAPORAN SAKRAMEN BAPTISAN KUDUS (06_BAPTISAN)';
      headers = ['No Surat', 'Nama Jemaat', 'Tanggal Baptis', 'Pendeta Pembaptis'];
      rows = data.map((b) => [b.nomor_surat || '-', b.nama_jemaat || b.jemaat_id, b.tanggal, b.pendeta]);
    } else if (modId === 'SIDI') {
      const data = StorageManager.getSidi();
      title = 'LAPORAN PENEGUHAN SIDI (07_SIDI)';
      headers = ['No Surat', 'Nama Jemaat', 'Tanggal Peneguhan', 'Pendeta'];
      rows = data.map((s) => [s.nomor_surat || '-', s.nama_jemaat || s.jemaat_id, s.tanggal, s.pendeta]);
    } else if (modId === 'PERNIKAHAN') {
      const data = StorageManager.getPernikahan();
      title = 'LAPORAN PEMBERKATAN NIKAH (08_PERNIKAHAN)';
      headers = ['No Surat', 'Mempelai Pria', 'Mempelai Wanita', 'Tanggal Nikah', 'Pendeta'];
      rows = data.map((p) => [p.nomor_surat || '-', p.suami, p.istri, p.tanggal, p.pendeta]);
    } else if (modId === 'PERSEMBAHAN') {
      const data = StorageManager.getPersembahan();
      title = 'LAPORAN REKAPITULASI PERSEMBAHAN GEREJA (09_PERSEMBAHAN)';
      headers = ['ID', 'Tanggal', 'Jenis', 'Metode', 'Keterangan', 'Jumlah (Rp)'];
      rows = data.map((p) => [p.persembahan_id, p.tanggal, p.jenis || '-', p.metode_pembayaran || 'Tunai', p.keterangan, `Rp ${p.jumlah.toLocaleString('id-ID')}`]);
    } else if (modId === 'DONASI') {
      const data = StorageManager.getDonasi();
      title = 'LAPORAN PENERIMAAN DONASI PEMBANGUNAN (10_DONASI)';
      headers = ['ID Donasi', 'Nama Donatur', 'Jumlah (Rp)', 'Tanggal', 'Keterangan'];
      rows = data.map((d) => [d.donasi_id, d.nama, `Rp ${d.jumlah.toLocaleString('id-ID')}`, d.tanggal, d.keterangan || '-']);
    } else if (modId === 'KAS') {
      const data = StorageManager.getKasPengeluaran();
      title = 'LAPORAN ARUS KAS & PENGELUARAN (11_KAS_PENGELUARAN)';
      headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Jumlah (Rp)'];
      rows = data.map((k) => [k.kas_id, k.tanggal, k.tipe, k.kategori, k.keterangan, `Rp ${k.jumlah.toLocaleString('id-ID')}`]);
    } else {
      const data = StorageManager.getJemaat();
      title = `LAPORAN RESMI CMS PRO GEREJA (${modId})`;
      headers = ['ID', 'Informasi Module', 'Tanggal Cetak'];
      rows = data.map((j) => [j.jemaat_id, j.nama_lengkap, new Date().toLocaleDateString('id-ID')]);
    }

    return { title, headers, rows };
  };

  const getActiveMergedSettings = (): AppSettings => {
    const base = StorageManager.getSettings();
    return {
      ...base,
      nama_ketua_majelis: sigForm.nama_ketua_majelis.trim() || base.nama_ketua_majelis || 'Dkn. Maria Melani',
      jabatan_ketua_majelis: sigForm.jabatan_ketua_majelis.trim() || base.jabatan_ketua_majelis || 'Ketua Majelis Jemaat',
      nama_pendeta: sigForm.nama_pendeta.trim() || base.nama_pendeta || 'Pdt. Ferdinan Moses Timbu, S.Th, M.PdK',
      jabatan_pendeta: sigForm.jabatan_pendeta.trim() || base.jabatan_pendeta || 'Pelayan Firman / Gembala',
      kota_surat: sigForm.kota_surat.trim() || base.kota_surat || 'Puriala'
    };
  };

  const handleGenerateExcel = (modId: string) => {
    const activeSettings = getActiveMergedSettings();
    switch (modId) {
      case 'JEMAAT':
        exportToExcel(StorageManager.getJemaat(), 'Data_Laporan_02_JEMAAT', activeSettings);
        break;
      case 'KELUARGA':
        exportToExcel(StorageManager.getKeluarga(), 'Data_Laporan_03_KELUARGA', activeSettings);
        break;
      case 'WILAYAH':
        exportToExcel(StorageManager.getWilayah(), 'Data_Laporan_04_WILAYAH', activeSettings);
        break;
      case 'PELAYANAN':
        exportToExcel(StorageManager.getPelayanan(), 'Data_Laporan_05_PELAYANAN', activeSettings);
        break;
      case 'BAPTISAN':
        exportToExcel(StorageManager.getBaptisan(), 'Data_Laporan_06_BAPTISAN', activeSettings);
        break;
      case 'SIDI':
        exportToExcel(StorageManager.getSidi(), 'Data_Laporan_07_SIDI', activeSettings);
        break;
      case 'PERNIKAHAN':
        exportToExcel(StorageManager.getPernikahan(), 'Data_Laporan_08_PERNIKAHAN', activeSettings);
        break;
      case 'PERSEMBAHAN':
        exportToExcel(StorageManager.getPersembahan(), 'Data_Laporan_09_PERSEMBAHAN', activeSettings);
        break;
      case 'DONASI':
        exportToExcel(StorageManager.getDonasi(), 'Data_Laporan_10_DONASI', activeSettings);
        break;
      case 'KAS':
        exportToExcel(StorageManager.getKasPengeluaran(), 'Data_Laporan_11_KAS_PENGELUARAN', activeSettings);
        break;
      default:
        break;
    }
  };

  const handleGeneratePDF = async (modId: string) => {
    const { title, headers, rows } = getModuleData(modId);
    await exportToPDF(title, headers, rows, getActiveMergedSettings(), `Data_Laporan_${modId}`);
  };

  const handlePrintDirect = (modId: string) => {
    const { title, headers, rows } = getModuleData(modId);
    printDocument(title, headers, rows, getActiveMergedSettings());
  };

  const liveSignature = getDefaultSignatures(getActiveMergedSettings());

  return (
    <div className="space-y-6">
      {/* Header Card Proposional */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-teal-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 shadow-2xs shrink-0">
            <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Data Laporan Gereja (Cetak PDF &amp; Excel)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Generate dokumen resmi data laporan gereja (keuangan, ibadah per wilayah, sakramen, &amp; data jemaat) lengkap dengan kop surat resmi dan tanda tangan pengesahan (&quot;Mengetahui&quot;).
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate_to_tab', { detail: { tab: 'settings' } }));
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all self-start sm:self-auto"
            title="Buka Pengaturan Sistem > Profil Gereja"
          >
            <Settings className="w-4 h-4 text-teal-600" />
            <span>Buka Pengaturan Sistem</span>
          </button>
        )}
      </div>

      {/* PANEL PENGATURAN PEJABAT PENGESAHAN ("MENGETAHUI") SURAT & LAPORAN */}
      {isAdmin && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-teal-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-teal-100">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-xs shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Pengaturan Pejabat Pengesahan (&quot;Mengetahui&quot;) Surat &amp; Laporan
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-700">
                    · Otomatis tampil di semua PDF, Excel &amp; Cetak
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Atur nama <strong>Ketua Majelis Jemaat</strong> (Kiri) dan <strong>Pendeta Jemaat</strong> (Kanan) pada blok tanda tangan <em>&quot;Mengetahui&quot;</em> di bawah ini, atau melalui menu <strong>Pengaturan Sistem &gt; Tab 1. Profil, Tema &amp; Navbar &gt; Bagian 1. Identitas &amp; Profil Gereja</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSigPreview((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>{showSigPreview ? 'Sembunyikan Pratinjau' : 'Lihat Pratinjau Tanda Tangan'}</span>
            </button>
          </div>

          {savedSigSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Berhasil disimpan! Nama Ketua Majelis ({sigForm.nama_ketua_majelis}) dan Pendeta Jemaat ({sigForm.nama_pendeta}) telah diperbarui untuk seluruh dokumen laporan &amp; surat gereja.
              </span>
            </div>
          )}

          <form onSubmit={handleSaveSignatureSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom Kiri: Ketua Majelis Jemaat */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>Pihak Kiri: Ketua Majelis Jemaat / Penanggung Jawab</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Tanda Tangan Kiri</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar Ketua Majelis Jemaat *
                  </label>
                  <input
                    type="text"
                    required
                    value={sigForm.nama_ketua_majelis}
                    onChange={(e) => setSigForm({ ...sigForm, nama_ketua_majelis: e.target.value })}
                    placeholder="Contoh: Dkn. Maria Melani"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-teal-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Baris Bawah (Keterangan Jabatan)
                  </label>
                  <input
                    type="text"
                    value={sigForm.jabatan_ketua_majelis}
                    onChange={(e) => setSigForm({ ...sigForm, jabatan_ketua_majelis: e.target.value })}
                    placeholder="Contoh: Ketua Majelis Jemaat"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Pendeta Jemaat */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>Pihak Kanan: Pendeta Jemaat / Gembala Sidang</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Tanda Tangan Kanan</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar Pendeta Jemaat *
                  </label>
                  <input
                    type="text"
                    required
                    value={sigForm.nama_pendeta}
                    onChange={(e) => setSigForm({ ...sigForm, nama_pendeta: e.target.value })}
                    placeholder="Contoh: Pdt. Ferdinan Moses Timbu, S.Th, M.PdK"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-teal-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Baris Bawah (Keterangan Jabatan)
                  </label>
                  <input
                    type="text"
                    value={sigForm.jabatan_pendeta}
                    onChange={(e) => setSigForm({ ...sigForm, jabatan_pendeta: e.target.value })}
                    placeholder="Contoh: Pelayan Firman / Gembala"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Baris Kota Penetapan & Tombol Simpan */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
              <div className="w-full sm:max-w-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota Penetapan Surat / Laporan (Titimangsa)
                </label>
                <input
                  type="text"
                  value={sigForm.kota_surat}
                  onChange={(e) => setSigForm({ ...sigForm, kota_surat: e.target.value })}
                  placeholder="Contoh: Puriala"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pejabat Pengesahan</span>
                </button>
              </div>
            </div>
          </form>

          {/* Pratinjau Langsung Blok Tanda Tangan "MENGETAHUI" */}
          {showSigPreview && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold border-b border-slate-200 pb-2">
                <span>Pratinjau Hasil Cetak Blok Pengesahan di Bagian Bawah Surat / Laporan:</span>
                <span className="italic">{liveSignature.dateCity}</span>
              </div>

              <div className="text-center text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                {liveSignature.mengetahuiText}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-900">{liveSignature.leftTitle}</div>
                  <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan &amp; Cap Majelis)
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 border-t border-slate-400 pt-1 min-w-[200px]">
                    ( {liveSignature.leftName} )
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{liveSignature.leftRole}</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-900">{liveSignature.rightTitle}</div>
                  <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan &amp; Cap Gereja)
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 border-t border-slate-400 pt-1 min-w-[200px]">
                    ( {liveSignature.rightName} )
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{liveSignature.rightRole}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APK / Android Compatibility Helper Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200/90 text-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
              <Smartphone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                <span>Opsi Download &amp; Cetak untuk Pengguna Aplikasi Android (APK)</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Aplikasi hasil konversi APK sering membatasi unduhan file sistem (WebView). Gunakan opsi cepat ini jika unduhan terhambat:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleOpenExternalBrowser}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Buka halaman ini di browser Google Chrome ponsel"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Browser HP (Chrome)</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 text-slate-700 hover:text-slate-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Link Web'}</span>
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Grid Modules - Tema Teal & Putih */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportModules.map((mod) => (
          <div
            key={mod.id}
            className="p-5 rounded-3xl bg-white border-2 border-teal-100 hover:border-teal-300 text-slate-900 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600 shrink-0" />
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                  {mod.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{mod.desc}</p>
            </div>

            <div className="pt-3 border-t border-teal-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPreviewModuleId(mod.id)}
                className="text-[11px] text-teal-800 hover:text-teal-950 font-bold bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                title="Lihat Pratinjau Surat, Kop & Tanda Tangan Mengetahui"
              >
                <Eye className="w-3.5 h-3.5 text-teal-600" />
                <span>Lihat Surat</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleGenerateExcel(mod.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Download File Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => handleGeneratePDF(mod.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Download Dokumen PDF (.pdf)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handlePrintDirect(mod.id)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Cetak Langsung / Print Dokumen"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Pratinjau Surat Laporan & Blok Tanda Tangan "Mengetahui" */}
      {previewModuleId && (() => {
        const { title, headers, rows } = getModuleData(previewModuleId);
        const activeSettings = getActiveMergedSettings();
        const sig = getDefaultSignatures(activeSettings);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base truncate">{title}</h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      Pratinjau Kop Surat Resmi, Tabel Data &amp; Pengesahan (&quot;Mengetahui&quot;)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModuleId(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
                <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-5">
                  {/* Kop Surat */}
                  <div className="text-center border-b-4 border-double border-slate-900 pb-4">
                    {activeSettings.logo && (
                      <img
                        src={activeSettings.logo}
                        alt="Logo Gereja"
                        className="w-16 h-16 object-contain mx-auto mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                      {activeSettings.nama_gereja || 'GEREJA JEMAAT MONAPA PURIALA'}
                    </h2>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {activeSettings.alamat || 'Puriala, Sulawesi Tenggara'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Email: {activeSettings.email || '-'} | Telp / WhatsApp: {activeSettings.telepon || '-'}
                    </p>
                  </div>

                  {/* Judul Laporan */}
                  <div className="text-center">
                    <h3 className="text-sm sm:text-base font-extrabold uppercase text-slate-900">{title}</h3>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      Dicetak pada: {new Date().toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Tabel Data */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          {headers.map((h, i) => (
                            <th key={i} className="p-2.5 border border-slate-700 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length > 0 ? (
                          rows.slice(0, 15).map((r, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              {r.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 border border-slate-200 text-slate-800">
                                  {cell !== undefined && cell !== null ? cell : ''}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={headers.length} className="p-4 text-center text-slate-400 italic">
                              Belum ada data pada modul ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Blok Tanda Tangan Mengetahui */}
                  <div className="pt-6 border-t border-slate-200 space-y-3">
                    <div className="text-right text-xs text-slate-600 italic">{sig.dateCity}</div>
                    <div className="text-center text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      {sig.mengetahuiText}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-slate-900">{sig.leftTitle}</div>
                        <div className="h-14 flex items-center justify-center text-[10px] text-slate-400 italic">
                          (Tanda Tangan &amp; Cap Majelis)
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 border-t border-slate-500 pt-1 min-w-[200px]">
                          ( {sig.leftName} )
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{sig.leftRole}</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-slate-900">{sig.rightTitle}</div>
                        <div className="h-14 flex items-center justify-center text-[10px] text-slate-400 italic">
                          (Tanda Tangan &amp; Cap Gereja)
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 border-t border-slate-500 pt-1 min-w-[200px]">
                          ( {sig.rightName} )
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{sig.rightRole}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewModuleId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateExcel(previewModuleId)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Unduh Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeneratePDF(previewModuleId)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintDirect(previewModuleId)}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};


