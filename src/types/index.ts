export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT';

export type ChurchStatus = 'AKTIF' | 'NONAKTIF' | 'KADALUARSA' | 'DIBLOKIR';

export interface ChurchTenant {
  tenant_id: string;
  nama_gereja: string;
  kode_unik: string;
  admin_username: string;
  admin_password_hash?: string;
  admin_nama: string;
  admin_email: string;
  admin_wa: string;
  alamat: string;
  status: ChurchStatus;
  tanggal_pendaftaran: string;
  tanggal_kadaluarsa: string;
  paket_langganan: 'PRO_SAAS_ANNUAL' | 'ENTERPRISE_LIFETIME' | 'BASIC_MONTHLY';
  harga_sewa?: string;
  catatan_admin?: string;
  apk_download_url?: string;
}

export interface SuperAdminContact {
  nama: string;
  wa: string;
  email: string;
  pesan_default?: string;
}

export interface User {
  user_id: string;
  username: string;
  password_hash?: string;
  nama: string;
  role: UserRole;
  email: string;
  no_hp?: string;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
  last_login?: string;
  jemaat_id?: string;
  foto?: string;
  tenant_id?: string;
}

export interface Jemaat {
  jemaat_id: string;
  nik: string;
  no_kk: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  wilayah: string;
  komisi: string;
  status_baptis: 'Sudah' | 'Belum';
  status_sidi: 'Sudah' | 'Belum';
  status_pernikahan: 'Belum Menikah' | 'Menikah' | 'Janda/Duda';
  pekerjaan: string;
  nomor_hp: string;
  email: string;
  foto: string;
  status: 'Aktif' | 'Pindah' | 'Meninggal';
}

export interface Keluarga {
  keluarga_id: string;
  no_kk: string;
  kepala_keluarga: string;
  alamat: string;
  wilayah: string;
  jumlah_anggota?: number;
}

export interface Wilayah {
  wilayah_id: string;
  nama_wilayah: string;
  ketua: string;
  jumlah_jemaat: number;
}

export interface Pelayanan {
  pelayanan_id: string;
  nama: string;
  kategori: string;
  penanggung_jawab: string;
  jadwal?: string;
}

export interface Baptisan {
  baptisan_id: string;
  jemaat_id: string;
  nama_jemaat?: string;
  tanggal: string;
  pendeta: string;
  lokasi: string;
  nomor_surat?: string;
  file_surat_baptis?: string;
}

export interface Sidi {
  sidi_id: string;
  jemaat_id: string;
  nama_jemaat?: string;
  tanggal: string;
  pendeta: string;
  nomor_surat?: string;
  file_surat_sidi?: string;
}

export interface Pernikahan {
  nikah_id: string;
  suami: string;
  istri: string;
  tanggal: string;
  pendeta: string;
  lokasi?: string;
  nomor_surat?: string;
  file_surat_nikah?: string;
}

export interface Persembahan {
  persembahan_id: string;
  tanggal: string;
  jenis?: string;
  kategori?: string;
  jumlah: number;
  keterangan: string;
  metode_pembayaran?: string;
  petugas?: string;
  status?: 'TERVERIFIKASI' | 'PENDING' | 'DITOLAK';
  bukti_transfer?: string;
  nama_pengirim?: string;
  jemaat_id?: string;
  catatan_admin?: string;
}

export interface Donasi {
  donasi_id: string;
  nama: string;
  jumlah: number;
  tanggal: string;
  kategori?: string;
  keterangan?: string;
}

export interface KasPengeluaran {
  kas_id: string;
  tanggal: string;
  kategori: string;
  jumlah: number;
  tipe: 'Penerimaan' | 'Pengeluaran';
  keterangan: string;
  pic?: string;
}

export interface Doa {
  doa_id: string;
  nama_pemohon: string;
  kategori: string;
  isi_permohonan: string;
  tanggal: string;
  status: 'Proses Doa' | 'Dijawab' | 'Selesai Doa';
}

export interface Pengumuman {
  pengumuman_id: string;
  judul: string;
  isi: string;
  tanggal: string;
  status?: 'Aktif' | 'Draft' | 'Arsip';
  kategori?: string;
  penulis?: string;
}

export interface Renungan {
  renungan_id: string;
  judul: string;
  isi: string;
  ayat?: string;
  ayat_alkitab?: string;
  tanggal: string;
  penulis?: string;
}

export interface EventSchedule {
  event_id: string;
  nama: string;
  lokasi: string;
  tanggal: string;
  jam: string;
  kategori?: string;
  pembicara?: string;
  keterangan?: string;
  kuota_kursi?: number;
}

export interface EventReservation {
  reservation_id: string;
  event_id: string;
  user_id?: string;
  nama_jemaat: string;
  nomor_wa: string;
  jumlah_kursi: number;
  catatan?: string;
  tanggal_reservasi: string;
  status: 'TERKONFIRMASI' | 'MENUNGGU' | 'DIBATALKAN' | 'DITOLAK';
}

export interface GalleryItem {
  gallery_id: string;
  judul: string;
  foto: string;
  tipe?: 'Foto' | 'Video';
  video_url?: string;
  tanggal: string;
  kategori?: string;
  keterangan?: string;
  penulis?: string;
}

export type NavTab =
  | 'dashboard'
  | 'jemaat'
  | 'wilayah'
  | 'administrasi'
  | 'keuangan'
  | 'jadwal'
  | 'doa'
  | 'pengumuman'
  | 'renungan'
  | 'galeri'
  | 'laporan'
  | 'jemaat_portal'
  | 'settings'
  | 'agenda'
  | 'media'
  | 'chat'
  | 'pustaka'
  | 'lainnya';

export interface NotificationItem {
  notif_id: string;
  user_id: string;
  judul: string;
  pesan: string;
  status_baca: 'Belum' | 'Sudah';
  tanggal: string;
  tujuan_role?: string;
  tipe?: 'Peringatan' | 'Informasi' | 'Penting';
  pengirim?: string;
  is_pinned?: boolean;
  target_view?: NavTab | string;
  target_id?: string;
  kategori_sumber?: 'Jadwal' | 'Renungan' | 'Pengumuman' | 'Video' | 'Lainnya';
}

export interface FeaturedVideo {
  video_id: string;
  judul: string;
  video_url: string;
  keterangan?: string;
  is_active: boolean;
  tanggal: string;
  platform?: 'YouTube' | 'TikTok' | 'Instagram' | 'Direct';
  kategori?: string;
}

export interface AppSettings {
  nama_gereja: string;
  logo: string;
  alamat: string;
  email: string;
  telepon: string;
  website?: string;
  warna_tema?: string;
  // Social Media Video Feed Settings
  video_url?: string;
  video_title?: string;
  video_description?: string;
  video_enabled?: boolean;
  // Rekening Bank & QRIS Transfer Persembahan Digital
  rekening_bank_nama?: string;
  rekening_bank_nomor?: string;
  rekening_bank_atas_nama?: string;
  qris_image_url?: string;
  // Floating APK Download Control (Admin / SuperAdmin)
  show_apk_download_button?: boolean;
  apk_download_url?: string;
  // Dashboard Visual Customization
  header_title?: string;
  header_subtitle?: string;
  theme_preset?: 'EMERALD_LIGHT' | 'DARK_SLATE' | 'MIDNIGHT_BLUE' | 'DEEP_PURPLE' | 'WARM_GOLD' | 'FOREST_GREEN' | 'LUXE_LIGHT';
  accent_color?: 'INDIGO' | 'EMERALD' | 'AMBER' | 'ROSE' | 'CYAN' | 'PURPLE' | 'ROYAL_GOLD';
  card_style?: 'GLASS' | 'SOLID' | 'NEON' | 'FLAT';
  card_size?: 'COMPACT' | 'NORMAL' | 'SPACIOUS';
  card_border_accent?: 'NONE' | 'ACCENT_FULL' | 'ACCENT_LEFT' | 'ACCENT_TOP' | 'ACCENT_GLOW';
  font_family?: 'SANS' | 'SERIF' | 'MONO';
  // Navbar Visual Customization
  navbar_theme_preset?: 'DEFAULT_DARK' | 'MATCH_THEME' | 'MIDNIGHT_BLUE' | 'DEEP_PURPLE' | 'EMERALD_GREEN' | 'CRIMSON_RED' | 'WARM_GOLD' | 'PURE_BLACK' | 'CLEAN_LIGHT' | 'CUSTOM_HEX';
  navbar_custom_bg?: string;
  navbar_custom_text?: 'AUTO' | 'WHITE' | 'DARK' | 'GOLD';
  navbar_style?: 'GLASS' | 'SOLID' | 'GRADIENT';
  navbar_border_accent?: 'NONE' | 'THEME_COLOR' | 'SUBTLE' | 'GLOW';
  // Footer & Bottom Nav Visual Customization
  footer_theme_preset?: 'DEFAULT_DARK' | 'MATCH_THEME' | 'MATCH_NAVBAR' | 'MIDNIGHT_BLUE' | 'DEEP_PURPLE' | 'EMERALD_GREEN' | 'CRIMSON_RED' | 'WARM_GOLD' | 'PURE_BLACK' | 'CLEAN_LIGHT' | 'CUSTOM_HEX';
  footer_custom_bg?: string;
  footer_style?: 'GLASS' | 'SOLID' | 'GRADIENT';
  footer_border_accent?: 'NONE' | 'THEME_COLOR' | 'SUBTLE' | 'GLOW';
  footer_icon_bg_style?: 'NONE' | 'SUBTLE' | 'SOLID' | 'GLOW' | 'PILL' | 'CIRCLE';
  footer_icon_custom_bg?: string;
  footer_icon_active_bg?: string;
  footer_icon_active_text?: string;
  footer_icon_inactive_text?: string;
  // Jemaat Portal Visual Customization
  jemaat_banner_title?: string;
  jemaat_banner_subtitle?: string;
  jemaat_banner_bg?: 'GRADIENT_INDIGO' | 'GRADIENT_PURPLE' | 'GRADIENT_GOLD' | 'GRADIENT_EMERALD' | 'OBSIDIAN_NIGHT' | 'OCEAN_BLUE';
  jemaat_cards_bg?: 'DEFAULT_GLASS' | 'GRADIENT_INDIGO' | 'GRADIENT_PURPLE' | 'GRADIENT_GOLD' | 'GRADIENT_EMERALD' | 'OBSIDIAN_NIGHT' | 'OCEAN_BLUE' | 'SOLID_SLATE' | 'NEON_CYAN';
  jemaat_card_width?: 'FULL' | 'CONTAINED' | 'COMPACT' | 'MOBILE_COMPACT';
  jemaat_announcement_text?: string;
  show_jemaat_announcement_banner?: boolean;
  show_jemaat_offering_history?: boolean;
  show_jemaat_sacraments_card?: boolean;
  show_jemaat_social_video?: boolean;
  show_jemaat_daily_renungan?: boolean;
  show_jemaat_quick_doa?: boolean;
  show_jemaat_event_jadwal?: boolean;
  // Dashboard Elements Visibility Toggles (Full Admin Control)
  show_header_banner?: boolean;
  show_quick_actions?: boolean;
  show_admin_quick_access?: boolean;
  show_floating_notifications?: boolean;
  show_pinned_notif_banner?: boolean;
  show_stat_cards?: boolean;
  show_apk_banner?: boolean;
  show_jemaat_quick_menu?: boolean;
  show_renungan_widget?: boolean;
  show_pengumuman_widget?: boolean;
  show_event_widget?: boolean;
  show_prayer_widget?: boolean;
  show_digital_offering_widget?: boolean;
  show_video_widget?: boolean;
  show_finance_chart?: boolean;
  show_wilayah_chart?: boolean;
  show_upcoming_events_table?: boolean;
  show_system_logs_widget?: boolean;
  firebaseConfig?: {
    apiKey?: string;
    projectId?: string;
    authDomain?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  firebase_api_key?: string;
  firebase_project_id?: string;
  firebase_auth_domain?: string;
  firebase_storage_bucket?: string;
  firebase_messaging_sender_id?: string;
  firebase_app_id?: string;
  google_sheet_id?: string;
  gas_api_url?: string;
  google_apps_script_url?: string;
  // Push Notification Settings (Website 2 APK Builder + Firebase FCM / OneSignal)
  firebase_package_name?: string;
  firebase_fcm_server_key?: string;
  // Android Studio & Professional Display Conversion Settings
  android_web_url?: string;
  android_package_name?: string;
  android_app_name?: string;
  android_status_bar_color?: string;
  android_status_bar_style?: 'DARK_ICONS' | 'LIGHT_ICONS';
  android_nav_bar_color?: string;
  android_enable_pull_to_refresh?: boolean;
  android_enable_hardware_acceleration?: boolean;
  android_enable_fullscreen?: boolean;
  android_safe_area_padding?: boolean;
  android_splash_bg_color?: string;
  android_splash_duration_ms?: number;
  android_user_agent_suffix?: string;
  android_fcm_default_topic?: string;
  onesignal_enabled?: boolean;
  onesignal_app_id?: string;
  onesignal_rest_api_key?: string;
  onesignal_google_project_number?: string;
  onesignal_auto_push_announcement?: boolean;
  // Security Warning / Alarm Broadcast from SuperAdmin
  security_alert?: SecurityAlert | null;
  timezone?: string;
  bahasa?: string;
}

export interface SecurityAlert {
  id: string;
  active: boolean;
  title: string;
  message: string;
  sender: string;
  sender_user_id?: string;
  sender_username?: string;
  created_at: string;
  severity: 'CRITICAL' | 'WARNING';
  target_user_id?: string; // Empty or 'ALL' for everyone, or specific user_id
  target_username?: string; // Empty or 'ALL' or specific username
  revoked?: boolean;
  revoked_at?: string;
  revoked_by?: string;
}

export interface ActivityLog {
  log_id: string;
  user: string;
  aktivitas: string;
  tanggal: string;
  ip_address: string;
  module?: string;
}

export interface LoginHistory {
  history_id: string;
  user: string;
  login: string;
  logout: string;
  device: string;
  browser: string;
  ip_address: string;
}

export interface PrayerRequest {
  prayer_id: string;
  jemaat_name: string;
  topik: string;
  permohonan: string;
  tanggal: string;
  status: 'Diterima' | 'Dalam Doa' | 'Terjawab';
  is_private: boolean;
}

export type ChatTag = 'UMUM' | 'DOA' | 'AYAT' | 'SALAM' | 'INFO';

export interface ChatMessage {
  id: string;
  sender_name: string;
  sender_id?: string;
  sender_role?: 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT' | 'TAMU';
  sender_avatar?: string;
  message: string;
  created_at: string;
  tag?: ChatTag;
  reply_to?: {
    id: string;
    sender_name: string;
    message: string;
  };
  is_pinned?: boolean;
}

export type HymnSongCategory = 'KJ' | 'NKB' | 'PKJ' | 'KONTEMPORER';

export interface HymnSong {
  id: string;
  category: HymnSongCategory;
  number?: string | number;
  title: string;
  key?: string;
  time_signature?: string;
  author?: string;
  lyrics: string[];
  chorus?: string;
  chords?: string;
  tags?: string[];
  is_favorite?: boolean;
  notes?: string;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'PL' | 'PB';
  category: string;
  chapters_count: number;
  abbreviation: string;
}

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

