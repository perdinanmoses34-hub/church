import React, { useState } from 'react';
import { User, AppSettings } from '../../types';
import { NavTab } from '../Sidebar';
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
  ChevronRight,
  MessageCircle,
  BookMarked,
  Search,
  Church,
  SlidersHorizontal
} from 'lucide-react';

interface LainnyaViewProps {
  currentUser: User;
  onNavigate: (tab: NavTab) => void;
  settings: AppSettings;
}

interface MenuItem {
  id: NavTab;
  title: string;
  subtitle: string;
  group: string;
  icon: React.ElementType;
  badge: string;
  colorClass: string;
  roles: string[];
}

export const LainnyaView: React.FC<LainnyaViewProps> = ({
  currentUser,
  onNavigate,
  settings
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const menuModules: MenuItem[] = [
    // 1. PELAYANAN & JEMAAT MANDIRI
    {
      id: 'jemaat_portal',
      title: 'Portal Jemaat Mandiri',
      subtitle: 'KTA Digital, riwayat sakramen, warta personal & persembahan',
      group: 'Pelayanan & Komunitas Jemaat',
      icon: UserCheck,
      badge: 'Portal Jemaat',
      colorClass: 'bg-emerald-50 text-[#00a859] border-emerald-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'chat',
      title: 'Ruang Chat Komunitas',
      subtitle: 'Forum persekutuan, obrolan jemaat, saling menguatkan dalam doa',
      group: 'Pelayanan & Komunitas Jemaat',
      icon: MessageCircle,
      badge: 'Live Chat',
      colorClass: 'bg-teal-50 text-teal-600 border-teal-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'doa',
      title: 'Permohonan Doa & Syafaat',
      subtitle: 'Kirimkan pokok doa pribadi ke tim pendoa syafaat gereja',
      group: 'Pelayanan & Komunitas Jemaat',
      icon: Heart,
      badge: 'Pelayanan Doa',
      colorClass: 'bg-rose-50 text-rose-600 border-rose-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'pustaka',
      title: 'Alkitab & Buku Pujian (Lagu)',
      subtitle: 'Teks Alkitab 66 Kitab, Kidung Jemaat, NKB, PKJ & lagu rohani berchord',
      group: 'Pelayanan & Komunitas Jemaat',
      icon: BookMarked,
      badge: 'Alkitab & Lagu',
      colorClass: 'bg-amber-50 text-amber-600 border-amber-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'renungan',
      title: 'Renungan Harian',
      subtitle: 'Santapan rohani setiap hari, firman Tuhan & renungan audio',
      group: 'Pelayanan & Komunitas Jemaat',
      icon: BookOpen,
      badge: 'Renungan',
      colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },

    // 2. IBADAH & KEGIATAN GEREJA
    {
      id: 'jadwal',
      title: 'Jadwal Ibadah Rutin',
      subtitle: 'Jadwal kebaktian umum, pemuda, anak, dan pelayan ibadah',
      group: 'Ibadah & Agenda Gereja',
      icon: Calendar,
      badge: 'Ibadah',
      colorClass: 'bg-blue-50 text-blue-600 border-blue-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'agenda',
      title: 'Agenda Acara & Reservasi',
      subtitle: 'Kalender kegiatan gereja, seminar, retreat & booking kursi ibadah',
      group: 'Ibadah & Agenda Gereja',
      icon: Sparkles,
      badge: 'Event & Reservasi',
      colorClass: 'bg-amber-50 text-amber-600 border-amber-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'pengumuman',
      title: 'Warta & Pengumuman Resmi',
      subtitle: 'Informasi warta jemaat mingguan dan pengumuman pastoral gereja',
      group: 'Ibadah & Agenda Gereja',
      icon: Megaphone,
      badge: 'Warta Jemaat',
      colorClass: 'bg-orange-50 text-orange-600 border-orange-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },

    // 3. ADMINISTRASI & KEUANGAN
    {
      id: 'jemaat',
      title: 'Data Jemaat & Kartu Keluarga',
      subtitle: 'Database lengkap jemaat, nomor KK, status baptis/sidi & biodata',
      group: 'Administrasi & Keuangan',
      icon: Users,
      badge: 'Data Jemaat',
      colorClass: 'bg-sky-50 text-sky-600 border-sky-200',
      roles: ['ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'keuangan',
      title: 'Keuangan, Kas & Persembahan',
      subtitle: 'Pencatatan kas masuk/keluar, transfer persembahan, QRIS & bank',
      group: 'Administrasi & Keuangan',
      icon: DollarSign,
      badge: 'Kas & QRIS',
      colorClass: 'bg-emerald-50 text-[#00a859] border-emerald-200',
      roles: ['ADMIN', 'SUPER_ADMIN', 'JEMAAT']
    },
    {
      id: 'administrasi',
      title: 'Administrasi Surat & Sakramen',
      subtitle: 'Surat keterangan jemaat, akta baptisan kudus, peneguhan sidi & nikah',
      group: 'Administrasi & Keuangan',
      icon: FileText,
      badge: 'Surat & Akta',
      colorClass: 'bg-purple-50 text-purple-600 border-purple-200',
      roles: ['ADMIN', 'SUPER_ADMIN', 'JEMAAT']
    },
    {
      id: 'wilayah',
      title: 'Wilayah Sektor & Komisi Pelayanan',
      subtitle: 'Pengaturan wilayah domisili jemaat, persekutuan doa sektor & komisi',
      group: 'Administrasi & Keuangan',
      icon: MapPin,
      badge: 'Sektor & Komisi',
      colorClass: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      roles: ['ADMIN', 'SUPER_ADMIN']
    },

    // 4. MULTIMEDIA & DOKUMENTASI
    {
      id: 'media',
      title: 'Video Khotbah & Live Streaming',
      subtitle: 'Tayangan siaran langsung ibadah dan arsip khotbah video YouTube',
      group: 'Multimedia & Dokumentasi',
      icon: Video,
      badge: 'Live Streaming',
      colorClass: 'bg-red-50 text-red-600 border-red-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'galeri',
      title: 'Galeri Foto & Dokumentasi',
      subtitle: 'Album foto momen peribadahan, pelayanan kasih, perayaan gerejawi',
      group: 'Multimedia & Dokumentasi',
      icon: ImageIcon,
      badge: 'Galeri Foto',
      colorClass: 'bg-violet-50 text-violet-600 border-violet-200',
      roles: ['JEMAAT', 'ADMIN', 'SUPER_ADMIN']
    },

    // 5. SISTEM & LAPORAN
    {
      id: 'laporan',
      title: 'Laporan Keuangan & Statistik',
      subtitle: 'Export laporan kas, neraca, rekapitulasi data jemaat ke PDF & Excel',
      group: 'Sistem & Laporan',
      icon: FileSpreadsheet,
      badge: 'Export PDF/Excel',
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      roles: ['ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'settings',
      title: 'Pengaturan Sistem & Gereja',
      subtitle: 'Kustomisasi identitas gereja, logo, rekening persembahan, tema & user',
      group: 'Sistem & Laporan',
      icon: Settings,
      badge: 'Pengaturan',
      colorClass: 'bg-slate-100 text-slate-700 border-slate-300',
      roles: ['ADMIN', 'SUPER_ADMIN']
    }
  ];

  const visibleModules = menuModules.filter((m) => m.roles.includes(currentUser.role));

  const filteredModules = visibleModules.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    );
  });

  // Extract distinct groups in chronological order
  const distinctGroups = Array.from(new Set(filteredModules.map((m) => m.group)));

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-1 sm:px-3 pb-16 animate-fade-in text-slate-800">
      {/* 1. Header Bar: Clean List Navigation Title */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00a859] border border-emerald-200 flex items-center justify-center shrink-0">
            <Church className="w-5 h-5 text-[#00a859]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Menu &amp; Modul Pelayanan Gereja
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#00a859] border border-emerald-200 text-[10px] font-bold">
                {visibleModules.length} Menu
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {settings.nama_gereja || 'Jesus Kingdom Christ'} — Pilih menu untuk membuka modul pelayanan
            </p>
          </div>
        </div>

        {/* Real-time search filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu pelayanan..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a859] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Structured Grouped Lists (NOT in Card/Grid Form!) */}
      {filteredModules.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">Menu tidak ditemukan</p>
          <p className="text-xs text-slate-400">
            Tidak ada menu yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#00a859] text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            Tampilkan Semua Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {distinctGroups.map((groupName) => {
            const itemsInGroup = filteredModules.filter((m) => m.group === groupName);
            if (itemsInGroup.length === 0) return null;

            return (
              <div key={groupName} className="space-y-1.5">
                {/* Group Heading */}
                <div className="px-3 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <span>{groupName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {itemsInGroup.length} pilihan
                  </span>
                </div>

                {/* Sleek List Container with smooth row dividers */}
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {itemsInGroup.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-emerald-50/50 active:bg-emerald-100/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {/* Colorful Icon Badge */}
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.colorClass} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>

                          {/* Title and Subtitle */}
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#00a859] transition-colors truncate">
                              {item.title}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right: Badge & Chevron Navigation */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                            {item.badge}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-[#00a859] text-slate-400 group-hover:text-white flex items-center justify-center transition-all">
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
