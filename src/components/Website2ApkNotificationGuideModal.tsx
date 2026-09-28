import React, { useState } from 'react';
import {
  X,
  Bell,
  Smartphone,
  CheckCircle,
  Copy,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Send,
  Sparkles,
  Zap,
  Info,
  Download,
  FileJson,
  Check,
  AlertTriangle
} from 'lucide-react';
import { downloadGoogleServicesJsonFile } from '../utils/googleServicesHelper';

interface Website2ApkNotificationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderId?: string;
  appUrl?: string;
  packageName?: string;
}

export const Website2ApkNotificationGuideModal: React.FC<Website2ApkNotificationGuideModalProps> = ({
  isOpen,
  onClose,
  senderId = '248780279971',
  appUrl = window.location.origin,
  packageName = 'com.gkfc'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPackageName, setCurrentPackageName] = useState(packageName || 'com.gkfc');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'V5_GUIDE' | 'SEND_NOTIF' | 'CHECKLIST' | 'ONESIGNAL'>('V5_GUIDE');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleDownload = () => {
    downloadGoogleServicesJsonFile(currentPackageName);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border-2 border-teal-200/90 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] text-slate-800">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 border-b border-teal-600 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/15 text-white border border-white/20 shrink-0">
              <Bell className="w-6 h-6 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Panduan Push Notifikasi Website 2 APK Builder Pro v5.0
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-100 text-[10px] font-extrabold border border-teal-400/40">
                  Firebase FCM / google-services.json
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Sesuai persis dengan tampilan jendela <strong>"Configure Push Notifications"</strong> di software Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-teal-100 bg-teal-50/50 px-5 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('V5_GUIDE')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'V5_GUIDE'
                ? 'border-teal-600 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-teal-700'
            }`}
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>1. Langkah di Website 2 APK Pro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SEND_NOTIF')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SEND_NOTIF'
                ? 'border-teal-600 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-teal-700'
            }`}
          >
            <Send className="w-4 h-4 text-teal-600" />
            <span>2. Cara Mengirim Notifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHECKLIST')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CHECKLIST'
                ? 'border-teal-600 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-teal-700'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span>3. Checklist Penting (Jangan Terlewat)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ONESIGNAL')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ONESIGNAL'
                ? 'border-teal-600 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-teal-700'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>4. Opsi OneSignal (Opsional)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed flex-1">
          {/* TAB 1: PANDUAN WEBSITE 2 APK BUILDER PRO V5.0 */}
          {activeTab === 'V5_GUIDE' && (
            <div className="space-y-4">
              {/* Highlight Penjelasan */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-900">
                  <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>Website 2 APK Builder Pro v5.0 Menggunakan Firebase Cloud Messaging (FCM)</span>
                </div>
                <p>
                  Pada Website 2 APK Builder Pro versi 5.0 (seperti di gambar Anda), push notification menggunakan konfigurasi resmi Google bernama <strong>google-services.json</strong>.
                </p>
                <p>
                  Dengan file ini, aplikasi Android Anda akan otomatis terhubung ke sistem notifikasi background Google. HP Android jemaat akan <strong>berdering dan bergetar di status bar atas</strong> saat Anda mengirim pengumuman/warta, <strong>meskipun aplikasi sedang ditutup total</strong>!
                </p>
              </div>

              {/* CARD DOWNLOAD FILE GOOGLE-SERVICES.JSON */}
              <div className="p-4 rounded-2xl bg-white border-2 border-teal-200/90 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                      <FileJson className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>Langkah 1: Download File "google-services.json" Anda</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                          Siap Pakai
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        File ini telah dikonfigurasi khusus dengan Package Name dan kredensial Firebase gereja Anda.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/25 transition cursor-pointer shrink-0"
                  >
                    {isDownloaded ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
                    <span>{isDownloaded ? 'File Berhasil Didownload!' : 'Download google-services.json'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-[11px] text-slate-700 font-semibold whitespace-nowrap">
                    Package Name Android (Sesuai di Website 2 APK):
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={currentPackageName}
                      onChange={(e) => setCurrentPackageName(e.target.value)}
                      placeholder="com.gkfc"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-teal-200 text-teal-800 font-mono text-xs focus:outline-none focus:border-teal-500 w-full max-w-xs"
                    />
                    <span className="text-[10px] text-slate-500 italic">
                      (Sesuai gambar Anda: <code>com.gkfc</code>)
                    </span>
                  </div>
                </div>
              </div>

              {/* PANDUAN PENGISIAN JENDELA CONFIGURE PUSH NOTIFICATIONS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-teal-200/90 space-y-3.5 shadow-sm">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span>Langkah 2: Isi Jendela "Configure Push Notifications" (Sesuai Gambar Anda):</span>
                </h4>

                <div className="space-y-3 pl-1 sm:pl-3">
                  {/* Point 1 */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Push Icon</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Klik tombol <strong>"Change Icon"</strong> dan pilih ikon gambar lonceng atau salib gereja Anda (seperti gambar salib &amp; Alkitab yang sudah tampil di layar Anda). Ikon ini akan muncul di bilah notifikasi HP.
                      </p>
                    </div>
                  </div>

                  {/* Point 2 */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>google-services.json</span>
                        <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">(Paling Utama)</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Klik tombol <strong>"Choose File"</strong> yang saat ini masih bertuliskan <em>No File Selected...</em>, lalu pilih file <code>google-services.json</code> yang baru saja Anda download di Langkah 1 tadi.
                      </p>
                    </div>
                  </div>

                  {/* Point 3 */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Centang Kedua Kotak Pilihan:</div>
                      <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-1 mt-1">
                        <li>
                          ☑ <strong>Ask User to Allow or Disallow Receiving Notifications</strong> &rarr; <span className="text-amber-700 font-semibold">Sangat Wajib!</span> Agar di Android 13 ke atas HP meminta izin notifikasi saat dibuka.
                        </li>
                        <li>
                          ☑ <strong>Show each notification individually (Prevent Overlap)</strong> &rarr; Agar tiap warta yang dikirim muncul tersendiri di bar atas dan tidak tertimpa.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Point 4 */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <div className="font-bold text-emerald-800 text-xs">Klik Tombol: [Import &amp; Apply]</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Klik tombol <strong>Import &amp; Apply</strong> untuk menyimpan dan memasukkan konfigurasi Firebase ke dalam proyek APK Anda. Jendela konfigurasi akan tertutup otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LANGKAH 3: PENTING DI JENDELA UTAMA */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Langkah 3 (PENTING): Di Jendela Utama, Pindahkan Radio Button ke "Enable"!</span>
                </div>
                <p className="text-[11px]">
                  Perhatikan pada latar belakang jendela utama Website 2 APK Builder di gambar Anda:
                </p>
                <div className="p-3 rounded-xl bg-white border border-amber-300 text-slate-800 text-xs font-mono shadow-xs">
                  Push Notifications: &nbsp;
                  <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">(*) Enable</span> &nbsp;
                  <span className="text-slate-400 line-through">( ) Disable</span> &nbsp;
                  <span className="text-slate-600">[Configure]</span>
                </div>
                <p className="text-[11px] text-amber-900">
                  Pada gambar Anda, saat ini pilihan masih berada di <strong>Disable</strong>. Pastikan Anda mengklik bulatan <strong>Enable</strong> agar modul notifikasi diaktifkan ke dalam APK!
                </p>
              </div>

              {/* LANGKAH 4: BUILD APK */}
              <div className="p-4 rounded-2xl bg-white border-2 border-teal-200/90 flex items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">5</span>
                    <span>Langkah Terakhir: Klik "Build Android APK"</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Klik tombol merah besar <strong>"Build Android APK"</strong> di pojok kanan bawah jendela aplikasi. File APK siap dipasang di HP jemaat!
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-bold text-[11px] shrink-0">
                  Build Android APK
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARA MENGIRIM NOTIFIKASI KE HP JEMAAT */}
          {activeTab === 'SEND_NOTIF' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-teal-950 flex items-center gap-2">
                    <Send className="w-5 h-5 text-teal-600" />
                    <span>Cara Mengirimkan Notifikasi ke Status Bar HP Jemaat:</span>
                  </span>
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    <span>Buka Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-slate-700 text-xs">
                  Karena APK Anda sudah dilengkapi <code>google-services.json</code>, Anda bisa mengirim pesan siaran resmi kapan saja secara <strong>gratis tanpa batas kuota</strong> melalui Google Firebase Cloud Messaging!
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-1 shadow-xs">
                  <span className="font-bold text-slate-900 block">1. Buka Firebase Console</span>
                  <p className="text-slate-600 text-[11px]">
                    Kunjungi <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-semibold">console.firebase.google.com</a> dan buka project gereja Anda.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-1 shadow-xs">
                  <span className="font-bold text-slate-900 block">2. Masuk ke Menu Messaging</span>
                  <p className="text-slate-600 text-[11px]">
                    Di menu sebelah kiri, pilih <strong>Engage &gt; Messaging</strong> (atau Cloud Messaging).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-1 shadow-xs">
                  <span className="font-bold text-slate-900 block">3. Buat Kampanye Notifikasi Baru</span>
                  <p className="text-slate-600 text-[11px]">
                    Klik <strong>New campaign &gt; Firebase Notification messages</strong>. Masukkan Judul (contoh: "Warta Jemaat Minggu Ini") dan Isi Pesan.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-1 shadow-xs">
                  <span className="font-bold text-slate-900 block">4. Targetkan ke Aplikasi &amp; Kirim</span>
                  <p className="text-slate-600 text-[11px]">
                    Pilih nama aplikasi Android Anda (Package Name: <code>{currentPackageName}</code>), lalu klik <strong>Review &gt; Publish</strong>. Seluruh HP jemaat akan langsung berdering!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST PENTING */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border-2 border-teal-200/90 space-y-2 shadow-xs">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Checklist Agar Notifikasi Berjalan Lancar di HP Android:</span>
                </div>
                <div className="space-y-2.5 text-[11px] text-slate-600">
                  <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Izin Notifikasi (Android 13 ke atas):</strong>
                      <p className="text-slate-600 mt-0.5">
                        Saat aplikasi pertama kali dibuka setelah diinstal, Android akan memunculkan pop-up izin notifikasi. Pastikan pengguna menekan <strong>"Izinkan" (Allow)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Optimasi Baterai HP (Hemat Daya Ekstrem):</strong>
                      <p className="text-slate-600 mt-0.5">
                        Pada beberapa HP merk Xiaomi/Oppo/Vivo, pastikan pengaturan <em>Auto-start</em> diaktifkan dan pembatasan baterai diatur ke <em>"No restrictions"</em> agar Android tidak membunuh service background.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Package Name Harus Sama:</strong>
                      <p className="text-slate-600 mt-0.5">
                        Package name pada <code>google-services.json</code> (<code>{currentPackageName}</code>) harus persis sama dengan yang Anda ketikkan di kolom Package Name Website 2 APK Builder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPSIONAL ONESIGNAL */}
          {activeTab === 'ONESIGNAL' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border-2 border-teal-200/90 space-y-2 shadow-xs">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Kapan Menggunakan OneSignal?</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Jika suatu saat Anda menggunakan plugin Website 2 APK Builder yang meminta <em>OneSignal App ID</em> atau ingin integrasi kirim notifikasi 1-klik langsung dari dalam CMS web ini tanpa buka Firebase Console:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-200">
                    <div className="text-[10px] text-slate-500">Google Project Number / Sender ID:</div>
                    <div className="font-mono text-teal-800 font-bold mt-0.5">{senderId}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-200">
                    <div className="text-[10px] text-slate-500">URL Web App:</div>
                    <div className="font-mono text-teal-800 font-bold mt-0.5 truncate">{appUrl}</div>
                  </div>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Keduanya tetap dapat dikonfigurasi di menu <strong>Pengaturan &gt; Notifikasi HP</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-teal-50/70 border-t border-teal-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>Package Name saat ini: <strong className="text-teal-900 font-mono">{currentPackageName}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Download File</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-teal-600/25 transition"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
