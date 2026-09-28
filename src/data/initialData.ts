import defaultFirebaseConfig from '../../firebase-applet-config.json';
import {
  User,
  Jemaat,
  Keluarga,
  Wilayah,
  Pelayanan,
  Baptisan,
  Sidi,
  Pernikahan,
  Persembahan,
  Donasi,
  Pengumuman,
  Renungan,
  EventSchedule,
  GalleryItem,
  NotificationItem,
  AppSettings,
  ActivityLog,
  LoginHistory,
  PrayerRequest,
  FeaturedVideo,
  ChurchTenant,
  SuperAdminContact,
  ChatMessage
} from '../types';

export const initialTenants: ChurchTenant[] = [
  {
    tenant_id: 'CHURCH-001',
    nama_gereja: 'Jesus Kingdom Christ',
    kode_unik: 'JKC-01',
    admin_username: 'adminsekretariat',
    admin_nama: 'Dkn. Maria Melani',
    admin_email: 'admin@jesuskingdomchrist.org',
    admin_wa: '081298765432',
    alamat: 'Jl. Pemuda No. 77, Jakarta Pusat, DKI Jakarta',
    status: 'AKTIF',
    tanggal_pendaftaran: '2025-01-01',
    tanggal_kadaluarsa: '2028-12-31',
    paket_langganan: 'PRO_SAAS_ANNUAL',
    harga_sewa: 'Rp 2.500.000 / Tahun',
    catatan_admin: 'Lisensi Gereja Utama (SaaS Pro Plan)',
    apk_download_url: 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing'
  },
  {
    tenant_id: 'CHURCH-002',
    nama_gereja: 'Gereja Bethel Indonesia Grace Community',
    kode_unik: 'GBI-GC02',
    admin_username: 'admin_gbi',
    admin_nama: 'Admin GBI',
    admin_email: 'admin@gbigrace.org',
    admin_wa: '081311223344',
    alamat: 'Jl. Boulevard Raya M3 No. 12, Kelapa Gading',
    status: 'AKTIF',
    tanggal_pendaftaran: '2026-03-15',
    tanggal_kadaluarsa: '2027-03-15',
    paket_langganan: 'PRO_SAAS_ANNUAL',
    harga_sewa: 'Rp 3.000.000 / Tahun',
    catatan_admin: 'Mitra Pembeli Paket SaaS Pro',
    apk_download_url: ''
  },
  {
    tenant_id: 'CHURCH-003',
    nama_gereja: 'Gereja Kemah Injil Indonesia Sejahtera',
    kode_unik: 'GKII-03',
    admin_username: 'admin_gkii',
    admin_nama: 'Dkn. Lukas Kurniawan',
    admin_email: 'sekretariat@gkii-sejahtera.org',
    admin_wa: '081555443322',
    alamat: 'Jl. Ahmad Yani No. 102, Bandung',
    status: 'KADALUARSA',
    tanggal_pendaftaran: '2025-01-01',
    tanggal_kadaluarsa: '2026-06-30',
    paket_langganan: 'BASIC_MONTHLY',
    harga_sewa: 'Rp 250.000 / Bulan',
    catatan_admin: 'Masa berlaku lisensi telah habis. Diperlukan pembayaran untuk mengaktifkan kembali.',
    apk_download_url: ''
  },
  {
    tenant_id: 'CHURCH-004',
    nama_gereja: 'Gereja Monapa Puriala',
    kode_unik: 'GMP-04',
    admin_username: 'admin_monapa',
    admin_nama: 'Admin Monapa Puriala',
    admin_email: 'admin_monapa@puriala.org',
    admin_wa: '0881036358650',
    alamat: 'Puriala, Sulawesi Tenggara',
    status: 'AKTIF',
    tanggal_pendaftaran: '2025-01-01',
    tanggal_kadaluarsa: '2028-12-31',
    paket_langganan: 'PRO_SAAS_ANNUAL',
    harga_sewa: 'Rp 2.500.000 / Tahun',
    catatan_admin: 'Akun Lisensi Resmi Gereja Monapa Puriala',
    apk_download_url: ''
  }
];

export const initialSuperAdminContact: SuperAdminContact = {
  nama: 'Pdt. Ferdinan Moses Timbu, S.Th',
  wa: '0881036358650',
  email: 'tn.timbu@gmail.com',
  pesan_default: 'Halo SuperAdmin SaaS (Pdt. Ferdinan Moses Timbu, S.Th), saya dari %NAMA_GEREJA% ingin konfirmasi pembayaran lisensi aplikasi & pengaktifan kembali akun gereja kami.'
};

export const DEFAULT_CHURCH_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%234f46e5"/><stop offset="100%" stop-color="%237c3aed"/></linearGradient></defs><rect width="200" height="200" rx="48" fill="url(%23g)"/><path d="M100 35 v130 M55 80 h90" stroke="%23ffffff" stroke-width="22" stroke-linecap="round"/><circle cx="100" cy="80" r="10" fill="%23f59e0b"/></svg>`;

export const initialFeaturedVideos: FeaturedVideo[] = [
  {
    video_id: 'VID-001',
    judul: 'Tayangan Ibadah Raya & Khotbah Minggu Terbaru',
    video_url: 'https://www.youtube.com/watch?v=wX2S6AebnI8',
    keterangan: 'Saksikan siaran ulang ibadah minggu & puji-pujian firman Tuhan yang memberkati.',
    is_active: true,
    tanggal: '2026-07-28',
    platform: 'YouTube',
    kategori: 'Ibadah Raya'
  },
  {
    video_id: 'VID-002',
    judul: 'Shorts Renungan Singkat Pemuda & Youth',
    video_url: 'https://www.youtube.com/watch?v=wX2S6AebnI8',
    keterangan: 'Kiprah puji-pujian dan firman Tuhan untuk generasi muda.',
    is_active: false,
    tanggal: '2026-07-25',
    platform: 'YouTube',
    kategori: 'Youth'
  }
];

export const initialSettings: AppSettings = {
  nama_gereja: 'Jesus Kingdom Christ',
  logo: DEFAULT_CHURCH_LOGO,
  alamat: 'Jl. Pemuda No. 77, Jakarta Pusat, DKI Jakarta 10110',
  email: 'info@jesuskingdomchrist.org',
  telepon: '+62 21 555-9876',
  warna_tema: '#059669',
  // Rekening Bank & QRIS Transfer Persembahan Digital
  rekening_bank_nama: 'Bank BCA',
  rekening_bank_nomor: '527-089-1122',
  rekening_bank_atas_nama: 'Jesus Kingdom Christ',
  qris_image_url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&auto=format&fit=crop&q=80',
  // Video & Visual Customization Defaults
  video_url: 'https://www.youtube.com/watch?v=wX2S6AebnI8',
  video_title: 'Tayangan Ibadah Raya & Khotbah Terbaru',
  video_description: 'Saksikan siaran ulang ibadah minggu & firman Tuhan yang memberkati.',
  video_enabled: true,
  show_apk_download_button: true,
  apk_download_url: 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing',
  header_title: 'Jesus Kingdom Christ',
  header_subtitle: 'Sistem Informasi Management & Portal Layanan Jemaat',
  theme_preset: 'EMERALD_LIGHT',
  accent_color: 'EMERALD',
  card_style: 'GLASS',
  card_size: 'NORMAL',
  // Navbar Visual Customization
  navbar_theme_preset: 'CLEAN_LIGHT',
  navbar_custom_bg: '#ffffff',
  navbar_custom_text: 'DARK',
  navbar_style: 'GLASS',
  navbar_border_accent: 'THEME_COLOR',
  // Footer & Bottom Nav Visual Customization
  footer_theme_preset: 'CLEAN_LIGHT',
  footer_custom_bg: '#ffffff',
  footer_style: 'GLASS',
  footer_border_accent: 'SUBTLE',
  footer_icon_bg_style: 'SUBTLE',
  footer_icon_custom_bg: 'transparent',
  footer_icon_active_bg: '#ecfdf5',
  footer_icon_active_text: '#059669',
  footer_icon_inactive_text: '#64748b',
  // Custom Jemaat Portal Banner & Toggles
  jemaat_banner_title: 'Shalom & Selamat Datang',
  jemaat_banner_subtitle: 'Portal Layanan Jemaat Resmi & Sistem Informasi Terpadu',
  jemaat_banner_bg: 'GRADIENT_EMERALD',
  jemaat_cards_bg: 'DEFAULT_GLASS',
  jemaat_card_width: 'CONTAINED',
  jemaat_announcement_text: 'Ibadah Raya Minggu ini diadakan pukul 09:00 WIB. Mari hadir bertatap muka atau saksikan tayangan streaming online.',
  show_jemaat_announcement_banner: true,
  show_jemaat_offering_history: true,
  show_jemaat_sacraments_card: true,
  show_jemaat_social_video: true,
  show_jemaat_daily_renungan: true,
  show_jemaat_quick_doa: true,
  show_jemaat_event_jadwal: true,
  // Dashboard Elements Visibility Toggles (Full Admin Control)
  show_header_banner: true,
  show_quick_actions: true,
  show_admin_quick_access: true,
  show_floating_notifications: true,
  show_pinned_notif_banner: true,
  show_stat_cards: true,
  show_apk_banner: true,
  show_jemaat_quick_menu: true,
  show_renungan_widget: true,
  show_pengumuman_widget: true,
  show_event_widget: true,
  show_prayer_widget: true,
  show_digital_offering_widget: true,
  show_video_widget: true,
  show_finance_chart: true,
  show_wilayah_chart: true,
  show_upcoming_events_table: true,
  show_system_logs_widget: true,
  firebase_api_key: defaultFirebaseConfig.apiKey,
  firebase_project_id: defaultFirebaseConfig.projectId,
  firebase_auth_domain: defaultFirebaseConfig.authDomain,
  firebase_storage_bucket: defaultFirebaseConfig.storageBucket,
  firebase_messaging_sender_id: defaultFirebaseConfig.messagingSenderId,
  firebase_app_id: defaultFirebaseConfig.appId,
  google_sheet_id: '1A2b3C4d5E6f7G8h9I0j_ChurchMasterDatabase2026',
  google_apps_script_url: 'https://script.google.com/macros/s/AKfycbxDemoCMSProScript/exec',
  // Push Notification Defaults (Website 2 APK Builder + OneSignal)
  onesignal_enabled: true,
  onesignal_app_id: '',
  onesignal_rest_api_key: '',
  onesignal_google_project_number: '250034601366',
  onesignal_auto_push_announcement: true,
  timezone: 'Asia/Jakarta (WIB)',
  bahasa: 'Bahasa Indonesia'
};

export const initialUsers: User[] = [
  {
    user_id: 'USR-001',
    username: 'superadmin',
    password_hash: 'admin123',
    nama: 'Pdt. Ferdinan Moses Timbu, S.Th (SuperAdmin SaaS)',
    role: 'SUPER_ADMIN',
    email: 'tn.timbu@gmail.com',
    no_hp: '0881036358650',
    status: 'Aktif',
    created_at: '2025-01-01 08:00',
    last_login: '2026-07-28 22:15',
    tenant_id: 'ALL'
  },
  {
    user_id: 'USR-002',
    username: 'adminsekretariat',
    password_hash: 'admin123',
    nama: 'Dkn. Maria Melani (Admin Sekretariat GKFC)',
    role: 'ADMIN',
    email: 'admin@gkfc-cms.org',
    no_hp: '+62 812-9876-5432',
    status: 'Aktif',
    created_at: '2025-01-10 09:30',
    last_login: '2026-07-28 20:45',
    tenant_id: 'CHURCH-001'
  },
  {
    user_id: 'USR-MONAPA',
    username: 'admin_monapa',
    password_hash: 'admin123',
    nama: 'Admin Monapa Puriala',
    role: 'ADMIN',
    email: 'admin_monapa@puriala.org',
    no_hp: '+62 881-0363-58650',
    status: 'Aktif',
    created_at: '2025-01-01 08:00',
    last_login: '2026-07-28 20:45',
    tenant_id: 'CHURCH-001'
  },
  {
    user_id: 'USR-002B',
    username: 'admin_gbi',
    password_hash: 'admin123',
    nama: 'Admin GBI',
    role: 'ADMIN',
    email: 'admin@gbigrace.org',
    no_hp: '+62 813-1122-3344',
    status: 'Aktif',
    created_at: '2026-03-15 10:00',
    last_login: '2026-07-29 11:30',
    tenant_id: 'CHURCH-002'
  },
  {
    user_id: 'USR-002C',
    username: 'admin_gkii',
    password_hash: 'admin123',
    nama: 'Dkn. Lukas Kurniawan (Admin GKII Sejahtera)',
    role: 'ADMIN',
    email: 'sekretariat@gkii-sejahtera.org',
    no_hp: '+62 815-5544-3322',
    status: 'Aktif',
    created_at: '2025-01-01 08:00',
    last_login: '2026-06-20 09:15',
    tenant_id: 'CHURCH-003'
  },
  {
    user_id: 'USR-003',
    username: 'jemaat01',
    password_hash: 'jemaat123',
    nama: 'Bpk. Yohanes Pratama',
    role: 'JEMAAT',
    email: 'yohanes.pratama@gmail.com',
    no_hp: '+62 812-3456-7890',
    status: 'Aktif',
    created_at: '2025-02-01 11:00',
    last_login: '2026-07-28 18:30',
    jemaat_id: 'JMT-001',
    tenant_id: 'CHURCH-001'
  },
  {
    user_id: 'USR-004',
    username: 'jemaat02',
    password_hash: 'jemaat123',
    nama: 'Ibu Ruth Wijaya',
    role: 'JEMAAT',
    email: 'ruth.wijaya@gmail.com',
    no_hp: '+62 814-7777-8888',
    status: 'Aktif',
    created_at: '2025-03-01 14:00',
    last_login: '2026-07-27 15:30',
    jemaat_id: 'JMT-002',
    tenant_id: 'CHURCH-001'
  }
];

export const initialJemaat: Jemaat[] = [
  {
    jemaat_id: 'JMT-001',
    nik: '3171011508850001',
    no_kk: '3171011005120099',
    nama_lengkap: 'Bpk. Yohanes Pratama',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1985-08-15',
    alamat: 'Jl. Danau Sunter Utara No. 12, Jakarta Utara',
    wilayah: 'Wilayah I - Sunter',
    komisi: 'Komisi Pria (Bapa)',
    status_baptis: 'Sudah',
    status_sidi: 'Sudah',
    status_pernikahan: 'Menikah',
    pekerjaan: 'Wiraswasta / Konsultan',
    nomor_hp: '+62 813-5555-1234',
    email: 'yohanes.pratama@gmail.com',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif'
  },
  {
    jemaat_id: 'JMT-002',
    nik: '3171015203900004',
    no_kk: '3171011005120099',
    nama_lengkap: 'Ibu Ruth Wijaya',
    jenis_kelamin: 'Perempuan',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1990-03-12',
    alamat: 'Jl. Danau Sunter Utara No. 12, Jakarta Utara',
    wilayah: 'Wilayah I - Sunter',
    komisi: 'Komisi Wanita (WBI)',
    status_baptis: 'Sudah',
    status_sidi: 'Sudah',
    status_pernikahan: 'Menikah',
    pekerjaan: 'Desainer Grafis',
    nomor_hp: '+62 814-7777-8888',
    email: 'ruth.wijaya@gmail.com',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif'
  },
  {
    jemaat_id: 'JMT-003',
    nik: '3172042210020003',
    no_kk: '3172041108150044',
    nama_lengkap: 'Daniel Pratama',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2002-10-22',
    alamat: 'Jl. Kelapa Gading Boulevard B-4',
    wilayah: 'Wilayah II - Kelapa Gading',
    komisi: 'Komisi Pemuda (Youth)',
    status_baptis: 'Sudah',
    status_sidi: 'Sudah',
    status_pernikahan: 'Belum Menikah',
    pekerjaan: 'Mahasiswa CS',
    nomor_hp: '+62 815-9999-1111',
    email: 'daniel.p@gmail.com',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif'
  },
  {
    jemaat_id: 'JMT-004',
    nik: '3173056011780002',
    no_kk: '3173050102100088',
    nama_lengkap: 'Dkn. Samuel Santoso',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1978-11-20',
    alamat: 'Jl. Cempaka Putih Raya No. 45',
    wilayah: 'Wilayah III - Cempaka Putih',
    komisi: 'Komisi Pria (Bapa)',
    status_baptis: 'Sudah',
    status_sidi: 'Sudah',
    status_pernikahan: 'Menikah',
    pekerjaan: 'Manajer Operasional',
    nomor_hp: '+62 812-4444-3333',
    email: 'samuel.santoso@gmail.com',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif'
  },
  {
    jemaat_id: 'JMT-005',
    nik: '3174094507080005',
    no_kk: '3174090102100099',
    nama_lengkap: 'Grace Angelia',
    jenis_kelamin: 'Perempuan',
    tempat_lahir: 'Semarang',
    tanggal_lahir: '2008-07-05',
    alamat: 'Jl. Kemayoran Gempol No. 8',
    wilayah: 'Wilayah I - Sunter',
    komisi: 'Komisi Remaja',
    status_baptis: 'Sudah',
    status_sidi: 'Belum',
    status_pernikahan: 'Belum Menikah',
    pekerjaan: 'Pelajar SMA',
    nomor_hp: '+62 819-2222-3333',
    email: 'grace.angelia@gmail.com',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif'
  }
];

export const initialKeluarga: Keluarga[] = [
  {
    keluarga_id: 'KK-001',
    no_kk: '3171011005120099',
    kepala_keluarga: 'Bpk. Yohanes Pratama',
    alamat: 'Jl. Danau Sunter Utara No. 12, Jakarta Utara',
    wilayah: 'Wilayah I - Sunter',
    jumlah_anggota: 4
  },
  {
    keluarga_id: 'KK-002',
    no_kk: '3172041108150044',
    kepala_keluarga: 'Bpk. Hendra Pratama',
    alamat: 'Jl. Kelapa Gading Boulevard B-4',
    wilayah: 'Wilayah II - Kelapa Gading',
    jumlah_anggota: 3
  },
  {
    keluarga_id: 'KK-003',
    no_kk: '3173050102100088',
    kepala_keluarga: 'Dkn. Samuel Santoso',
    alamat: 'Jl. Cempaka Putih Raya No. 45',
    wilayah: 'Wilayah III - Cempaka Putih',
    jumlah_anggota: 5
  }
];

export const initialWilayah: Wilayah[] = [
  {
    wilayah_id: 'WIL-001',
    nama_wilayah: 'Wilayah I - Sunter',
    ketua: 'Pnt. Paulus Hartono',
    jumlah_jemaat: 145
  },
  {
    wilayah_id: 'WIL-002',
    nama_wilayah: 'Wilayah II - Kelapa Gading',
    ketua: 'Dkn. Barnabas Setiawan',
    jumlah_jemaat: 198
  },
  {
    wilayah_id: 'WIL-003',
    nama_wilayah: 'Wilayah III - Cempaka Putih',
    ketua: 'Dkn. Samuel Santoso',
    jumlah_jemaat: 112
  },
  {
    wilayah_id: 'WIL-004',
    nama_wilayah: 'Wilayah IV - Kemayoran & Menteng',
    ketua: 'Pnt. Stefanus Budi',
    jumlah_jemaat: 87
  }
];

export const initialPelayanan: Pelayanan[] = [
  {
    pelayanan_id: 'PLY-001',
    nama: 'Praise & Worship Team (Pemusik & Singers)',
    kategori: 'Musik & Ibadah',
    penanggung_jawab: 'Ev. Joshua Tan',
    jadwal: 'Sabtu, 18.00 WIB (Latihan)'
  },
  {
    pelayanan_id: 'PLY-002',
    nama: 'Multimedia & Broadcast Live Streaming',
    kategori: 'Media & IT',
    penanggung_jawab: 'Daniel Pratama',
    jadwal: 'Minggu, 06.30 WIB & 09.30 WIB'
  },
  {
    pelayanan_id: 'PLY-003',
    nama: 'Usher & Penerima Jemaat',
    kategori: 'Pelayanan Umum',
    penanggung_jawab: 'Dkn. Maria Melani',
    jadwal: 'Minggu, Setiap Sesi Ibadah'
  },
  {
    pelayanan_id: 'PLY-004',
    nama: 'Guru Sekolah Minggu (Kids Church)',
    kategori: 'Anak & Sekolah Minggu',
    penanggung_jawab: 'Ibu Ruth Wijaya',
    jadwal: 'Minggu, 08.00 WIB & 10.30 WIB'
  }
];

export const initialBaptisan: Baptisan[] = [
  {
    baptisan_id: 'BAP-2025-001',
    jemaat_id: 'JMT-005',
    nama_jemaat: 'Grace Angelia',
    tanggal: '2025-04-20',
    pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
    lokasi: 'Gedung Kolam Baptisan GKFC Pro',
    nomor_surat: 'BAP/GKFC/2025/04/012'
  },
  {
    baptisan_id: 'BAP-2024-089',
    jemaat_id: 'JMT-003',
    nama_jemaat: 'Daniel Pratama',
    tanggal: '2024-12-15',
    pendeta: 'Pdt. Markus Iskandar, S.Th',
    lokasi: 'Gedung Utama GKFC Pro',
    nomor_surat: 'BAP/GKFC/2024/12/089'
  }
];

export const initialSidi: Sidi[] = [
  {
    sidi_id: 'SDI-2024-045',
    jemaat_id: 'JMT-003',
    nama_jemaat: 'Daniel Pratama',
    tanggal: '2024-12-22',
    pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
    nomor_surat: 'SDI/GKFC/2024/12/045'
  }
];

export const initialPernikahan: Pernikahan[] = [
  {
    nikah_id: 'NKH-2020-018',
    suami: 'Bpk. Yohanes Pratama',
    istri: 'Ibu Ruth Wijaya',
    tanggal: '2020-10-10',
    pendeta: 'Pdt. Dr. Herman Setyawan, M.Th',
    lokasi: 'Sanctuary Main Hall GKFC Pro',
    nomor_surat: 'NKH/GKFC/2020/10/018'
  }
];

export const initialPersembahan: Persembahan[] = [
  {
    persembahan_id: 'PSB-2026-0701',
    tanggal: '2026-07-26',
    jenis: 'Persembahan Minggu',
    kategori: 'Persembahan Minggu',
    jumlah: 24850000,
    keterangan: 'Ibadah Raya I & II Minggu 26 Juli 2026',
    metode_pembayaran: 'Tunai',
    petugas: 'Dkn. Samuel Santoso',
    status: 'TERVERIFIKASI'
  },
  {
    persembahan_id: 'PSB-2026-0702',
    tanggal: '2026-07-26',
    jenis: 'Persembahan Perpuluhan',
    kategori: 'Persembahan Perpuluhan',
    jumlah: 48500000,
    keterangan: 'Amplop Perpuluhan Jemaat Bulan Juli',
    metode_pembayaran: 'Transfer Bank',
    petugas: 'Dkn. Maria Melani',
    status: 'TERVERIFIKASI'
  },
  {
    persembahan_id: 'PSB-2026-0703',
    tanggal: '2026-07-28',
    jenis: 'Persembahan Perpuluhan',
    kategori: 'Persembahan Perpuluhan',
    jumlah: 2500000,
    keterangan: 'Perpuluhan Bulan Juli via Transfer BCA',
    metode_pembayaran: 'Transfer Bank',
    nama_pengirim: 'Bpk. Yohanes Pratama',
    jemaat_id: 'JMT-001',
    status: 'PENDING',
    bukti_transfer: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  },
  {
    persembahan_id: 'PSB-2026-0704',
    tanggal: '2026-07-20',
    jenis: 'Persembahan Pembangunan',
    kategori: 'Persembahan Pembangunan',
    jumlah: 15000000,
    keterangan: 'Dana Renovasi Ruang Sekolah Minggu',
    metode_pembayaran: 'QRIS Digital',
    petugas: 'Bendahara Gereja',
    status: 'TERVERIFIKASI'
  },
  {
    persembahan_id: 'PSB-2026-0705',
    tanggal: '2026-07-19',
    jenis: 'Persembahan Syukur',
    kategori: 'Persembahan Syukur',
    jumlah: 8750000,
    keterangan: 'Ucapan Syukur Kelahiran & Ulang Tahun',
    metode_pembayaran: 'Tunai',
    petugas: 'Dkn. Samuel Santoso',
    status: 'TERVERIFIKASI'
  }
];

export const initialDonasi: Donasi[] = [
  {
    donasi_id: 'DNS-2026-005',
    nama: 'Hamba Allah (Anonim)',
    jumlah: 25000000,
    tanggal: '2026-07-15',
    kategori: 'Bantuan Sosial Diakonia',
    keterangan: 'Paket Sembako untuk Warga Kurang Mampu'
  },
  {
    donasi_id: 'DNS-2026-006',
    nama: 'Keluarga Bpk. Yohanes Pratama',
    jumlah: 10000000,
    tanggal: '2026-07-10',
    kategori: 'Pengadaan Sound System Multimedia',
    keterangan: 'Donasi Mic Wireless Shure Main Hall'
  }
];

export const initialPengumuman: Pengumuman[] = [
  {
    pengumuman_id: 'PGM-001',
    judul: 'Pelatihan Pelayan Tuhan & Retreat Kepemimpinan 2026',
    isi: 'Diberitahukan kepada seluruh Pengurus Komisi, Diaken, dan Pelayan Musik/Usher untuk menghadiri Retreat Kepemimpinan di Puncak pada 15-17 Agustus 2026. Pendaftaran dibuka melalui Sekretariat.',
    tanggal: '2026-07-27',
    status: 'Aktif',
    kategori: 'Event'
  },
  {
    pengumuman_id: 'PGM-002',
    judul: 'Jadwal Kelas Katekisasi & Persiapan Baptisan Raya',
    isi: 'Kelas Katekisasi Baptisan dan Sidi gelombang II akan dimulai pada hari Sabtu, 8 Agustus 2026 pukul 16.00 WIB di Ruang Rapat Lt 2.',
    tanggal: '2026-07-25',
    status: 'Aktif',
    kategori: 'Pengajaran'
  },
  {
    pengumuman_id: 'PGM-003',
    judul: 'Bakti Sosial & Pengobatan Gratis Diakonia Gereja',
    isi: 'Komisi Diakonia mengadakan pengobatan gratis dan pembagian 500 paket sembako pada hari Sabtu, 22 Agustus 2026.',
    tanggal: '2026-07-20',
    status: 'Aktif',
    kategori: 'Diakonia'
  }
];

export const initialRenungan: Renungan[] = [
  {
    renungan_id: 'RNG-2026-0728',
    judul: 'Iman yang Berakar Kuat di Tengah Badai Hidup',
    isi: 'Di dalam Kolose 2:6-7, Rasul Paulus mengingatkan kita untuk hidup di dalam Kristus, berakar, dan dibangun di atas Dia. Pohon yang memiliki akar yang dalam tidak akan tumbang ketika angin kencang menerpa. Demikian juga kehidupan iman kita yang terus dipupuk dengan doa dan sabda Allah.',
    ayat: 'Kolose 2:6-7',
    tanggal: '2026-07-28',
    penulis: 'Pdt. Dr. Herman Setyawan, M.Th'
  },
  {
    renungan_id: 'RNG-2026-0727',
    judul: 'Kasih Karunia yang Memulihkan',
    isi: 'Tuhan tidak melihat masa lalu kita untuk menentukan masa depan kita. Kasih karunia-Nya selalu baru setiap pagi (Ratapan 3:22-23). Datanglah kepada-Nya dengan hati yang berserah.',
    ayat: 'Ratapan 3:22-23',
    tanggal: '2026-07-27',
    penulis: 'Ev. Joshua Tan'
  }
];

export const initialEvents: EventSchedule[] = [
  {
    event_id: 'EVT-2026-001',
    nama: 'KKR Kebangunan Rohani & Doa Kesembuhan Massal 2026',
    lokasi: 'Sanctuary Main Hall Lt. 3 GKFC Pro',
    tanggal: '2026-08-15',
    jam: '18.00 - 21.00 WIB',
    kategori: 'Upcoming Special Event',
    pembicara: 'Pdt. Dr. Herman Setyawan, M.Th',
    keterangan: 'Kebaktian KKR Spesial dengan Doa Kesembuhan & Pembagian Berkat Rohani. Kuota tempat terbatas.',
    kuota_kursi: 200
  },
  {
    event_id: 'EVT-2026-002',
    nama: 'Retret Kebangunan Keluarga & Pasutri Bahagia',
    lokasi: 'Grand Convention Hall Lt. 2',
    tanggal: '2026-08-28',
    jam: '09.00 - 17.00 WIB',
    kategori: 'Upcoming Special Event',
    pembicara: 'Pdt. Markus & Ev. Ruth Iskandar',
    keterangan: 'Seminar & retret pemulihan mezbah keluarga jemaat. Dapatkan kursi reservasi Anda sekarang.',
    kuota_kursi: 120
  },
  {
    event_id: 'EVT-001',
    nama: 'Ibadah Raya I (Umum & Pemuda)',
    lokasi: 'Sanctuary Main Hall Lt. 3',
    tanggal: '2026-08-02',
    jam: '07.00 - 09.00 WIB',
    kategori: 'Ibadah Utama',
    pembicara: 'Pdt. Dr. Herman Setyawan, M.Th'
  },
  {
    event_id: 'EVT-002',
    nama: 'Ibadah Raya II (Bilingual & Family)',
    lokasi: 'Sanctuary Main Hall Lt. 3',
    tanggal: '2026-08-02',
    jam: '10.00 - 12.00 WIB',
    kategori: 'Ibadah Utama',
    pembicara: 'Pdt. Markus Iskandar, S.Th'
  },
  {
    event_id: 'EVT-003',
    nama: 'Ibadah Youth & Teen Impact',
    lokasi: 'Chapel Lt. 2',
    tanggal: '2026-08-01',
    jam: '17.00 - 19.00 WIB',
    kategori: 'Youth',
    pembicara: 'Ev. Joshua Tan'
  },
  {
    event_id: 'EVT-004',
    nama: 'Persekutuan Doa Malam & Deliverance',
    lokasi: 'Ruang Doa Efrata',
    tanggal: '2026-07-31',
    jam: '19.00 - 21.00 WIB',
    kategori: 'Doa',
    pembicara: 'Tim Doa Syafaat'
  }
];

export const initialGallery: GalleryItem[] = [
  {
    gallery_id: 'GAL-001',
    judul: 'Dokumentasi Perayaan Paskah Raya & Baptisan',
    foto: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-04-12',
    kategori: 'Paskah'
  },
  {
    gallery_id: 'GAL-002',
    judul: 'Konser Pujian & Penyembahan Worship Night',
    foto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-06-20',
    kategori: 'Konser Musik'
  },
  {
    gallery_id: 'GAL-003',
    judul: 'Kegiatan Diakonia & Pengobatan Gratis Jemaat',
    foto: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-05-15',
    kategori: 'Diakonia'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    notif_id: 'NTF-001',
    user_id: 'ALL',
    judul: 'Jadwal Ibadah Minggu Ini',
    pesan: 'Jangan lupa hadir tepat waktu pada Ibadah Raya I (07.00 WIB) & II (10.00 WIB). Perjamuan Kudus akan dilayani minggu ini.',
    status_baca: 'Belum',
    tanggal: '2026-07-28 10:00'
  },
  {
    notif_id: 'NTF-002',
    user_id: 'USR-003',
    judul: 'Permohonan Doa Anda Telah Diterima',
    pesan: 'Tim Doa Syafaat telah menerima permohonan doa Anda dan mendoakannya secara khusus.',
    status_baca: 'Belum',
    tanggal: '2026-07-27 15:20'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    log_id: 'ACT-901',
    user: 'superadmin',
    aktivitas: 'Mengubah konfigurasi tema & Firebase Firestore Realtime endpoint',
    tanggal: '2026-07-28 21:30',
    ip_address: '180.252.12.99',
    module: 'System Setting'
  },
  {
    log_id: 'ACT-902',
    user: 'adminsekretariat',
    aktivitas: 'Menambahkan data jemaat baru: Grace Angelia (JMT-005)',
    tanggal: '2026-07-28 18:45',
    ip_address: '180.252.12.102',
    module: 'Master Jemaat'
  },
  {
    log_id: 'ACT-903',
    user: 'adminsekretariat',
    aktivitas: 'Input data persembahan minggu 26 Juli 2026 (Rp 24.850.000)',
    tanggal: '2026-07-26 14:10',
    ip_address: '180.252.12.102',
    module: 'Keuangan'
  }
];

export const initialLoginHistory: LoginHistory[] = [
  {
    history_id: 'LOG-801',
    user: 'superadmin',
    login: '2026-07-28 22:15',
    logout: 'Sedang Aktif',
    device: 'Desktop / Windows 11',
    browser: 'Chrome 127.0 Enterprise',
    ip_address: '180.252.12.99'
  },
  {
    history_id: 'LOG-802',
    user: 'adminsekretariat',
    login: '2026-07-28 20:45',
    logout: '2026-07-28 21:50',
    device: 'Tablet / Android PWA',
    browser: 'Chrome Mobile 127',
    ip_address: '180.252.12.102'
  },
  {
    history_id: 'LOG-803',
    user: 'jemaat01',
    login: '2026-07-28 19:10',
    logout: '2026-07-28 19:40',
    device: 'Mobile / iPhone 15 Pro PWA',
    browser: 'Safari Mobile 17.5',
    ip_address: '114.122.34.88'
  }
];

export const initialPrayerRequests: PrayerRequest[] = [
  {
    prayer_id: 'PRY-001',
    jemaat_name: 'Bpk. Yohanes Pratama',
    topik: 'Kesehatan & Pemulihan Keluarga',
    permohonan: 'Mohon dukungan doa untuk pemulihan kesehatan Ibu Ruth pasca operasi serta perlindungan usaha kelancaran pekerjaan.',
    tanggal: '2026-07-27',
    status: 'Dalam Doa',
    is_private: false
  },
  {
    prayer_id: 'PRY-002',
    jemaat_name: 'Daniel Pratama',
    topik: 'Kelulusan Skripsi & Karir',
    permohonan: 'Mohon doa agar penyusunan tugas akhir skripsi berjalan lancar dan hikmat Tuhan menuntun masa depan karir.',
    tanggal: '2026-07-25',
    status: 'Terjawab',
    is_private: false
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'CHAT-001',
    sender_name: 'Dkn. Maria Melani (Sekretariat)',
    sender_id: 'adminsekretariat',
    sender_role: 'ADMIN',
    message: 'Syalom Bapak/Ibu dan Saudara sekalian! Selamat datang di Ruang Chat Komunitas Jemaat GKFC. Di sini kita dapat saling bertukar sapa, berbagi pokok doa, dan saling menguatkan di dalam kasih Kristus. 🙏🕊️',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    tag: 'INFO',
    is_pinned: true
  },
  {
    id: 'CHAT-002',
    sender_name: 'Pdt. Timotius Susanto',
    sender_id: 'pdt_timotius',
    sender_role: 'ADMIN',
    message: 'Syalom jemaat yang terkasih. "Sebab di mana dua atau tiga orang berkumpul dalam Nama-Ku, di situ Aku ada di tengah-tengah mereka." (Matius 18:20). Kiranya damai sejahtera Kristus senantiasa menaungi kita semua.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    tag: 'AYAT'
  },
  {
    id: 'CHAT-003',
    sender_name: 'Bpk. Yohanes Pratama',
    sender_id: 'yohanes_p',
    sender_role: 'JEMAAT',
    message: 'Syalom semuanya! Puji Tuhan terima kasih atas dukungan doa jemaat untuk keluarga kami. Tuhan Yesus memberkati pelayanan kita bersama.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    tag: 'SALAM'
  }
];

