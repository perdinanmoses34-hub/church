import { AppSettings } from '../types';

export interface DashboardComponentDef {
  key: keyof AppSettings;
  label: string;
  description: string;
  category: 'header_nav' | 'notifications' | 'stats_mobile' | 'content_jemaat' | 'admin_operational';
  targetRole: 'ALL' | 'ADMIN' | 'JEMAAT';
  defaultValue: boolean;
  iconName: string;
}

export const DASHBOARD_CATEGORIES = [
  { id: 'all', label: 'Semua Komponen' },
  { id: 'header_nav', label: 'Header & Navigasi' },
  { id: 'notifications', label: 'Notifikasi & Peringatan' },
  { id: 'stats_mobile', label: 'Statistik & Mobile (.APK)' },
  { id: 'content_jemaat', label: 'Konten & Pelayanan Jemaat' },
  { id: 'admin_operational', label: 'Grafik & Operasional Admin' }
] as const;

export const DASHBOARD_COMPONENT_DEFS: DashboardComponentDef[] = [
  // 1. Header & Navigasi
  {
    key: 'show_header_banner',
    label: 'Banner Sambutan Utama (Welcome Header)',
    description: 'Header paling atas memuat ucapan sambutan, avatar gereja, role pengguna, dan tombol kontrol live portal.',
    category: 'header_nav',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Layout'
  },
  {
    key: 'show_quick_actions',
    label: 'Tombol Aksi Cepat Header (Quick Actions)',
    description: 'Tombol aksi cepat di dalam header: Tambah Jemaat, Catat Kas Persembahan, dan Cetak Laporan.',
    category: 'header_nav',
    targetRole: 'ADMIN',
    defaultValue: true,
    iconName: 'PlusCircle'
  },
  {
    key: 'show_admin_quick_access',
    label: 'Panel Quick Access Shortcut Modul Admin',
    description: 'Grid tombol pintasan cepat ke modul Jemaat & KK, Kas Keuangan, Surat Sakramen, Agenda & Menu Lainnya.',
    category: 'header_nav',
    targetRole: 'ADMIN',
    defaultValue: true,
    iconName: 'Grid'
  },
  {
    key: 'show_jemaat_quick_menu',
    label: 'Bar Navigasi Pintasan Jemaat',
    description: 'Bilah pintasan khusus jemaat: Baca Renungan Hari Ini, Warta Pengumuman, dan Tonton Live Streaming.',
    category: 'header_nav',
    targetRole: 'JEMAAT',
    defaultValue: true,
    iconName: 'Layers'
  },

  // 2. Notifikasi & Peringatan
  {
    key: 'show_floating_notifications',
    label: 'Pop-up Notifikasi Mengambang di Atas Layar',
    description: 'Notifikasi peringatan resmi dan pengumuman darurat realtime di bagian atas layar disertai audio chimes.',
    category: 'notifications',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'BellRing'
  },
  {
    key: 'show_pinned_notif_banner',
    label: 'Banner Warta & Pengumuman Gereja (Icon Toa / Megaphone)',
    description: 'Banner pengumuman penting gereja dengan icon toa berkedip di bagian paling atas dashboard. Teks dapat langsung diedit oleh Admin.',
    category: 'notifications',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Megaphone'
  },

  // 3. Statistik & Mobile Android
  {
    key: 'show_stat_cards',
    label: 'Kartu Ringkasan Angka Statistik',
    description: 'Kartu ringkasan angka total: Jumlah Jemaat (Jiwa), Kepala Keluarga (KK), Total Kas & Total Agenda.',
    category: 'stats_mobile',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'BarChart3'
  },
  {
    key: 'show_apk_banner',
    label: 'Banner Download Aplikasi Mobile Android (.APK)',
    description: 'Banner unduhan file APK Android resmi gereja yang tampil di tengah alur dashboard.',
    category: 'stats_mobile',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Smartphone'
  },
  {
    key: 'show_apk_download_button',
    label: 'Tombol Melayang Floating Download APK',
    description: 'Tombol melayang di pojok kanan bawah layar untuk mengunduh file APK instalasi Android kapan saja.',
    category: 'stats_mobile',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Download'
  },

  // 4. Konten Rohani & Pelayanan Jemaat
  {
    key: 'show_renungan_widget',
    label: 'Widget Renungan Utama Hari Ini',
    description: 'Kartu renungan firman Tuhan harian terbaru lengkap dengan nas Alkitab dan isi ulasan renungan.',
    category: 'content_jemaat',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'BookOpen'
  },
  {
    key: 'show_pengumuman_widget',
    label: 'Widget Pengumuman Resmi Gereja',
    description: 'Kartu warta berita dan pengumuman resmi majelis terkini untuk seluruh jemaat dan pengurus.',
    category: 'content_jemaat',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Megaphone'
  },
  {
    key: 'show_event_widget',
    label: 'Widget Agenda Ibadah & Reservasi Kursi',
    description: 'Jadwal ibadah raya terdekat serta formulir reservasi kehadiran / kursi ibadah jemaat.',
    category: 'content_jemaat',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Calendar'
  },
  {
    key: 'show_prayer_widget',
    label: 'Widget Formulir Permohonan Doa Mandiri',
    description: 'Formulir online bagi jemaat untuk langsung mengirimkan pokok doa pribadi secara langsung ke tim doa.',
    category: 'content_jemaat',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'MessageSquare'
  },
  {
    key: 'show_digital_offering_widget',
    label: 'Widget Persembahan Digital (Bank & QRIS)',
    description: 'Info nomor rekening BCA gereja, scan QRIS barcode, dan formulir konfirmasi bukti transfer persembahan.',
    category: 'content_jemaat',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'CreditCard'
  },
  {
    key: 'show_video_widget',
    label: 'Widget Live Streaming Video / YouTube',
    description: 'Pemutar siaran langsung ibadah online, khotbah YouTube, atau video pelayanan media sosial.',
    category: 'content_jemaat',
    targetRole: 'ALL',
    defaultValue: true,
    iconName: 'Tv'
  },

  // 5. Analitik & Operasional Admin
  {
    key: 'show_finance_chart',
    label: 'Widget Grafik Garis Tren Keuangan & Kas',
    description: 'Grafik visual tren penerimaan kas persembahan gereja per bulan sepanjang tahun 2026.',
    category: 'admin_operational',
    targetRole: 'ADMIN',
    defaultValue: true,
    iconName: 'TrendingUp'
  },
  {
    key: 'show_wilayah_chart',
    label: 'Widget Diagram Demografi Sebaran Wilayah',
    description: 'Diagram donat sebaran wilayah tempat tinggal jemaat untuk pemetaan pelayanan wilayah.',
    category: 'admin_operational',
    targetRole: 'ADMIN',
    defaultValue: true,
    iconName: 'PieChart'
  },
  {
    key: 'show_upcoming_events_table',
    label: 'Widget Jadwal Ibadah & Agenda Lengkap',
    description: 'Tabel daftar agenda ibadah dan kegiatan gereja mendatang di panel operasional admin.',
    category: 'admin_operational',
    targetRole: 'ADMIN',
    defaultValue: true,
    iconName: 'Clock'
  },
  {
    key: 'show_system_logs_widget',
    label: 'Widget Log Audit Aktivitas Sistem',
    description: 'Feed riwayat aktivitas login, penambahan data jemaat, dan transaksi kas sistem terbaru.',
    category: 'admin_operational',
    targetRole: 'ADMIN',
    defaultValue: true,
    iconName: 'Activity'
  }
];

export function enableAllDashboardComponents<T extends Partial<AppSettings>>(currentSettings: T): T {
  const updated = { ...currentSettings };
  DASHBOARD_COMPONENT_DEFS.forEach((comp) => {
    (updated as any)[comp.key] = true;
  });
  return updated;
}

export function disableAllDashboardComponents<T extends Partial<AppSettings>>(currentSettings: T): T {
  const updated = { ...currentSettings };
  DASHBOARD_COMPONENT_DEFS.forEach((comp) => {
    (updated as any)[comp.key] = false;
  });
  return updated;
}

export function resetDefaultDashboardComponents<T extends Partial<AppSettings>>(currentSettings: T): T {
  const updated = { ...currentSettings };
  DASHBOARD_COMPONENT_DEFS.forEach((comp) => {
    (updated as any)[comp.key] = comp.defaultValue;
  });
  return updated;
}
