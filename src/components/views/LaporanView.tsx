import React, { useState } from 'react';
import { User } from '../../types';
import { StorageManager } from '../../utils/storage';
import { exportToExcel, exportToPDF, printDocument } from '../../utils/exportTools';
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
  Info
} from 'lucide-react';

interface LaporanViewProps {
  currentUser: User;
}

export const LaporanView: React.FC<LaporanViewProps> = ({ currentUser }) => {
  const [selectedModule, setSelectedModule] = useState('JEMAAT');
  const [isCopied, setIsCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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

  const handleGenerateExcel = (modId: string) => {
    switch (modId) {
      case 'JEMAAT':
        exportToExcel(StorageManager.getJemaat(), 'Laporan_02_JEMAAT');
        break;
      case 'KELUARGA':
        exportToExcel(StorageManager.getKeluarga(), 'Laporan_03_KELUARGA');
        break;
      case 'WILAYAH':
        exportToExcel(StorageManager.getWilayah(), 'Laporan_04_WILAYAH');
        break;
      case 'PELAYANAN':
        exportToExcel(StorageManager.getPelayanan(), 'Laporan_05_PELAYANAN');
        break;
      case 'BAPTISAN':
        exportToExcel(StorageManager.getBaptisan(), 'Laporan_06_BAPTISAN');
        break;
      case 'SIDI':
        exportToExcel(StorageManager.getSidi(), 'Laporan_07_SIDI');
        break;
      case 'PERNIKAHAN':
        exportToExcel(StorageManager.getPernikahan(), 'Laporan_08_PERNIKAHAN');
        break;
      case 'PERSEMBAHAN':
        exportToExcel(StorageManager.getPersembahan(), 'Laporan_09_PERSEMBAHAN');
        break;
      case 'DONASI':
        exportToExcel(StorageManager.getDonasi(), 'Laporan_10_DONASI');
        break;
      case 'KAS':
        exportToExcel(StorageManager.getKasPengeluaran(), 'Laporan_11_KAS_PENGELUARAN');
        break;
      default:
        break;
    }
  };

  const handleGeneratePDF = (modId: string) => {
    const { title, headers, rows } = getModuleData(modId);
    exportToPDF(title, headers, rows, undefined, `Laporan_${modId}`);
  };

  const handlePrintDirect = (modId: string) => {
    const { title, headers, rows } = getModuleData(modId);
    printDocument(title, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
          <span>Pusat Cetak &amp; Generator Laporan (PDF &amp; Excel)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Generate dokumen resmi laporan gereja dari database dengan sekali klik, siap simpan atau cetak langsung.
        </p>
      </div>

      {/* APK / Android Compatibility Helper Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-500/30 text-white space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
                <span>Opsi Download &amp; Cetak untuk Pengguna Aplikasi Android (APK)</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Aplikasi hasil konversi APK sering membatasi unduhan file sistem (WebView). Gunakan opsi cepat ini jika unduhan terhambat:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleOpenExternalBrowser}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
              title="Buka halaman ini di browser Google Chrome ponsel"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Browser HP (Chrome)</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Link Web'}</span>
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportModules.map((mod) => (
          <div
            key={mod.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-3 shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-base text-white">{mod.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Ready Sync
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleGenerateExcel(mod.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow flex items-center gap-1 cursor-pointer transition-all"
                  title="Download File Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => handleGeneratePDF(mod.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow flex items-center gap-1 cursor-pointer transition-all"
                  title="Download Dokumen PDF (.pdf)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handlePrintDirect(mod.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow flex items-center gap-1 cursor-pointer transition-all"
                  title="Cetak Langsung / Print Dokumen"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

