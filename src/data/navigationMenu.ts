import { NavTab } from '../components/Sidebar';
import {
  Users,
  DollarSign,
  FileText,
  Calendar,
  Megaphone,
  BookOpen,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  UserCheck,
  Settings,
  Heart,
  Grid,
  Sparkles,
  MapPin,
  Building2,
  LayoutDashboard,
  MessageCircle,
  BookMarked
} from 'lucide-react';

export interface MenuItem {
  id: NavTab;
  title: string;
  subtitle: string;
  category: string;
  icon: any;
  gradient: string;
  badge: string;
  roles: ('JEMAAT' | 'ADMIN' | 'SUPER_ADMIN')[];
}

export const menuModules: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Utama System',
    subtitle: 'Ikhtisar Ringkasan Statistik, Kas & Aktivitas Church',
    category: 'OVERVIEW SYSTEM',
    icon: LayoutDashboard,
    gradient: 'from-indigo-600 via-blue-600 to-indigo-800',
    badge: 'Dashboard',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'jemaat_portal',
    title: 'Portal Jemaat Saya',
    subtitle: 'KTA Digital, Sakramen, Doa & Persembahan Saya',
    category: 'PELAYANAN MANDIRI',
    icon: UserCheck,
    gradient: 'from-teal-600 via-emerald-600 to-teal-800',
    badge: 'Jemaat Mandatory',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'chat',
    title: 'Ruang Chat Komunitas Jemaat',
    subtitle: 'Obrolan Komunitas, Berbagi Sapaan, Doa & Persekutuan Bersama',
    category: 'KOMUNITAS & CHAT',
    icon: MessageCircle,
    gradient: 'from-blue-600 via-indigo-600 to-violet-800',
    badge: 'Live Chat',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'pustaka',
    title: 'Alkitab & Buku Pujian (KJ, NKB, PKJ, Lagu)',
    subtitle: '66 Kitab Suci Alkitab, Kidung Jemaat, NKB, PKJ & Lagu Rohani Berchord',
    category: 'PUSTAKA ROHANI',
    icon: BookMarked,
    gradient: 'from-amber-600 via-yellow-600 to-amber-800',
    badge: 'Alkitab & Lagu',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'jemaat',
    title: 'Data Jemaat & KK',
    subtitle: 'Database Seluruh Anggota, Sektor & Kepala Keluarga',
    category: 'ADMINISTRASI JEMAAT',
    icon: Users,
    gradient: 'from-blue-600 via-indigo-600 to-blue-800',
    badge: 'Database',
    roles: ['ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'keuangan',
    title: 'Keuangan & Kas Gereja',
    subtitle: 'Pencatatan Kas, Transfer Bank, QRIS & Laporan Kebendaharaan',
    category: 'KEUANGAN & BENDAHARA',
    icon: DollarSign,
    gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
    badge: 'Kas & QRIS',
    roles: ['ADMIN', 'SUPER_ADMIN', 'JEMAAT']
  },
  {
    id: 'administrasi',
    title: 'Surat Sakramen & Akta',
    subtitle: 'Pengurusan Surat Baptis Kudus, Sidi, Pernikahan & Jemaat',
    category: 'SEKRETARIAT',
    icon: FileText,
    gradient: 'from-purple-600 via-indigo-600 to-purple-800',
    badge: 'Arsip Surat',
    roles: ['ADMIN', 'SUPER_ADMIN', 'JEMAAT']
  },
  {
    id: 'jadwal',
    title: 'Jadwal Ibadah Rutin',
    subtitle: 'Jadwal Kebaktian Minggu, Pelayan Ibadah & Pemusik',
    category: 'IBADAH & PELAYANAN',
    icon: Calendar,
    gradient: 'from-amber-600 via-orange-600 to-amber-800',
    badge: 'Ibadah Minggu',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'agenda',
    title: 'Agenda Events & Reservasi',
    subtitle: 'Jadwal Acara Spesial & Booking Tempat Duduk Ibadah',
    category: 'EVENT & RESERVASI',
    icon: Sparkles,
    gradient: 'from-orange-600 via-amber-600 to-rose-700',
    badge: 'Booking Seat',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'doa',
    title: 'Permohonan Doa & Syafaat',
    subtitle: 'Kirim Pokok Doa Pribadi & Dukungan Komunitas Doa',
    category: 'PELAYANAN DOA',
    icon: Heart,
    gradient: 'from-rose-600 via-pink-600 to-rose-800',
    badge: 'Syafaat',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'renungan',
    title: 'Renungan Harian & Audio',
    subtitle: 'Artikel Firman Tuhan & Audio Podcast Renungan Pagi',
    category: 'ROHANI & MEDIA',
    icon: BookOpen,
    gradient: 'from-cyan-600 via-blue-600 to-cyan-800',
    badge: 'Audio & Teks',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'pengumuman',
    title: 'Warta & Pengumuman',
    subtitle: 'Informasi Warta Minggu & Pengumuman Resmi Gembala',
    category: 'INFORMASI GEREJA',
    icon: Megaphone,
    gradient: 'from-indigo-600 via-blue-600 to-indigo-800',
    badge: 'Warta Minggu',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'galeri',
    title: 'Galeri Foto Kegiatan',
    subtitle: 'Dokumentasi Album Foto Ibadah, Youth & Diakonia',
    category: 'DOKUMENTASI',
    icon: ImageIcon,
    gradient: 'from-fuchsia-600 via-purple-600 to-fuchsia-800',
    badge: 'Album Foto',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'media',
    title: 'Video & Live Streaming',
    subtitle: 'Rekaman Khotbah, Live Broadcast & Video Youtube',
    category: 'MULTIMEDIA',
    icon: Video,
    gradient: 'from-red-600 via-rose-600 to-red-800',
    badge: 'Live Streaming',
    roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'wilayah',
    title: 'Wilayah & Sektor Pelayanan',
    subtitle: 'Pemetaan Sektor Jemaat, Ketua Sektor & Lokasi Ibadah Rumah',
    category: 'ORGANISASI',
    icon: MapPin,
    gradient: 'from-emerald-600 via-lime-600 to-emerald-800',
    badge: 'Sektor',
    roles: ['ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'laporan',
    title: 'Laporan PDF & Excel',
    subtitle: 'Cetak Laporan Keuangan, Jemaat & Statistik Ibadah',
    category: 'LAPORAN SYSTEM',
    icon: FileSpreadsheet,
    gradient: 'from-blue-700 via-indigo-700 to-slate-800',
    badge: 'Export PDF',
    roles: ['ADMIN', 'SUPER_ADMIN']
  },
  {
    id: 'settings',
    title: 'Pengaturan System & Tema Navbar',
    subtitle: 'Kustomisasi Warna Navbar, Tema Hex (#CD5C5C), Logo Gereja & Tampilan',
    category: 'SYSTEM ADMIN',
    icon: Settings,
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    badge: 'Khusus Admin',
    roles: ['ADMIN', 'SUPER_ADMIN']
  }
];
