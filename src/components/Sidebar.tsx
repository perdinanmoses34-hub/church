import React from 'react';
import { User, AppSettings } from '../types';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  DollarSign,
  CalendarDays,
  Sparkles,
  Heart,
  Megaphone,
  BookOpen,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  Settings,
  UserCheck,
  Grid,
  ChevronRight,
  MessageCircle,
  BookMarked,
  Home,
  CheckSquare,
  Building2,
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';

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

interface SidebarProps {
  currentUser: User;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  settings?: AppSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  settings
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || isSuperAdmin;
  const isJemaat = currentUser.role === 'JEMAAT';

  // Menu groups strictly styled like the reference UI (tampilan.png)
  const menuSections = [
    {
      group: 'UTAMA',
      items: [
        {
          id: 'dashboard',
          label: isAdmin ? 'Dashboard Admin' : 'Dashboard Jemaat',
          icon: LayoutDashboard,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        }
      ]
    },
    {
      group: 'DATA MASTER',
      items: [
        {
          id: 'jemaat',
          label: 'Data Jemaat',
          icon: Users,
          roles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          id: 'jemaat_portal',
          label: isJemaat ? 'Profil Saya' : 'Data Anggota',
          icon: UserCheck,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'wilayah',
          label: 'Data Wilayah / Sektor',
          icon: Building2,
          roles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          id: 'administrasi',
          label: 'Administrasi Surat',
          icon: FileText,
          roles: ['SUPER_ADMIN', 'ADMIN']
        }
      ]
    },
    {
      group: 'PELAYANAN & AGENDA',
      items: [
        {
          id: 'jadwal',
          label: 'Jadwal Ibadah',
          icon: CalendarDays,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'agenda',
          label: 'Agenda & Event',
          icon: Clock,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'renungan',
          label: 'Renungan Harian',
          icon: BookOpen,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'pustaka',
          label: 'Alkitab & Pujian',
          icon: BookMarked,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'doa',
          label: 'Permohonan Doa',
          icon: Heart,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        }
      ]
    },
    {
      group: 'KOMUNIKASI & KEUANGAN',
      items: [
        {
          id: 'keuangan',
          label: 'Kas & Persembahan',
          icon: DollarSign,
          roles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          id: 'pengumuman',
          label: 'Warta & Pengumuman',
          icon: Megaphone,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'chat',
          label: 'Ruang Chat',
          icon: MessageCircle,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'galeri',
          label: 'Galeri Foto & Media',
          icon: ImageIcon,
          roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT']
        },
        {
          id: 'laporan',
          label: 'Laporan Keuangan',
          icon: FileSpreadsheet,
          roles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          id: 'settings',
          label: 'Pengaturan Sistem',
          icon: Settings,
          roles: ['SUPER_ADMIN', 'ADMIN']
        }
      ]
    }
  ];

  const churchName = settings?.nama_gereja || 'Jesus Kingdom Christ';
  const shortCode = churchName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 4)
    .toUpperCase() || 'JKC';

  const sidebarContent = (
    <div className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full text-slate-700 select-none overflow-hidden">
      {/* 1. Header Box: Brand / School / Church Info */}
      <div className="p-3.5 border-b border-slate-100 shrink-0">
        <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center p-1 shadow-xs shrink-0">
              <img
                src={settings?.logo || DEFAULT_CHURCH_LOGO}
                alt="Logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                }}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-black text-slate-800 tracking-tight truncate leading-tight">
                {shortCode}
              </h2>
              <p className="text-[10px] text-emerald-700 font-bold truncate">
                ID: {settings?.header_title?.substring(0, 14) || '20104523'}
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-medium scrollbar-thin">
        {menuSections.map((section, idx) => {
          const visibleItems = section.items.filter((item) =>
            item.roles.includes(currentUser.role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {section.group}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id as NavTab);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#00a859] hover:bg-[#00914c] text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Status Bar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Firebase Cloud Live</span>
        </span>
        <span className="font-semibold text-slate-400">v2.4</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Fixed on the Left) */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-5rem)] sticky top-20 z-20 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-full bg-white h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
