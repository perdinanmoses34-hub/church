import React, { useState } from 'react';
import { User, AppSettings } from '../types';
import { NavTab } from './Sidebar';
import { menuModules } from '../data/navigationMenu';
import { X, Search, Grid, ArrowRight, Sparkles, Building2, Palette, Smartphone, Download, ChevronRight } from 'lucide-react';
import { downloadGoogleServicesJsonFile } from '../utils/googleServicesHelper';

interface CardMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  settings: AppSettings;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSuperAdminSaaSPanel?: () => void;
  onOpenNavbarCustomizer?: () => void;
  onOpenAndroidStudioModal?: () => void;
}

export const CardMenuModal: React.FC<CardMenuModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  activeTab,
  onSelectTab,
  onOpenSuperAdminSaaSPanel,
  onOpenNavbarCustomizer,
  onOpenAndroidStudioModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Filter modules based on user role
  const availableModules = menuModules.filter((m) =>
    m.roles.includes(currentUser.role)
  );

  const categories = ['ALL', ...Array.from(new Set(availableModules.map((m) => m.category)))];

  const filteredModules = availableModules.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const customHexColor = settings.warna_tema || '#059669';
  const isLightSystem = settings.theme_preset === 'EMERALD_LIGHT' || settings.theme_preset === 'LUXE_LIGHT';

  // Dynamic Theme Preset Style Classes matching Dashboard
  const getCardStyleClass = () => {
    const cardBg = settings.jemaat_cards_bg || 'DEFAULT_GLASS';
    const cardStyle = settings.card_style || 'GLASS';

    let base = isLightSystem
      ? 'bg-white border border-slate-200/90 shadow-xs hover:shadow-md text-slate-800'
      : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white';

    if (cardBg && cardBg !== 'DEFAULT_GLASS') {
      switch (cardBg) {
        case 'GRADIENT_INDIGO':
          base = 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/40 shadow-xl shadow-indigo-950/30 backdrop-blur-xl';
          break;
        case 'GRADIENT_PURPLE':
          base = 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-purple-950/90 border border-purple-500/40 shadow-xl shadow-purple-950/30 backdrop-blur-xl';
          break;
        case 'GRADIENT_GOLD':
          base = 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 shadow-xl shadow-amber-950/30 backdrop-blur-xl';
          break;
        case 'GRADIENT_EMERALD':
          base = 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-950/90 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 backdrop-blur-xl';
          break;
        case 'OBSIDIAN_NIGHT':
          base = 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 border border-slate-700/80 shadow-2xl backdrop-blur-xl';
          break;
        case 'OCEAN_BLUE':
          base = 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-cyan-950/90 border border-cyan-500/40 shadow-xl shadow-cyan-950/30 backdrop-blur-xl';
          break;
        case 'SOLID_SLATE':
          base = 'bg-slate-900 border border-slate-800 shadow-xl';
          break;
        case 'NEON_CYAN':
          base = 'bg-cyan-950/50 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 backdrop-blur-xl';
          break;
        default:
          base = 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl';
          break;
      }
    } else {
      switch (cardStyle) {
        case 'SOLID':
          base = 'bg-slate-900 border border-slate-800 shadow-xl';
          break;
        case 'NEON':
          base = 'bg-slate-900/90 border border-indigo-500/40 shadow-lg shadow-indigo-500/10 backdrop-blur-xl';
          break;
        case 'FLAT':
          base = 'bg-slate-900/60 border border-slate-700/60 shadow-none';
          break;
        case 'GLASS':
        default:
          base = 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl';
          break;
      }
    }

    return base;
  };

  const cardStyleClass = getCardStyleClass();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in text-slate-800 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden relative">
        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a859] border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Grid className="w-6 h-6 text-[#00a859]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00a859] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                  Daftar Menu Navigasi
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {availableModules.length} Modul Aktif
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Pusat Navigasi &amp; Modul Pelayanan Gereja
              </h2>
              <p className="text-xs text-slate-500">
                Pilih menu pelayanan di bawah ini untuk berpindah modul secara instan dari perangkat manapun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onOpenNavbarCustomizer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNavbarCustomizer();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Kustomisasi Warna & Tema Navbar (Khusus Admin)"
              >
                <Palette className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Kustom Navbar</span>
                <span className="sm:hidden">Warna</span>
              </button>
            )}

            {isSuperAdmin && onOpenSuperAdminSaaSPanel && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSuperAdminSaaSPanel();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-200" />
                <span className="hidden sm:inline">SuperAdmin SaaS</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari menu pelayanan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#00a859] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#00a859] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/80'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar List Menu Utama (BUKAN DALAM BENTUK KARTU) */}
        <div className="bg-slate-50/60 border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-y-auto pr-0 flex-1">
          {filteredModules.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 sm:p-3.5 text-left transition-all duration-150 cursor-pointer group ${
                  isActive ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-[#00a859] text-white'
                        : 'bg-emerald-50 text-[#00a859] border border-emerald-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-[#00a859]' : 'text-slate-800 group-hover:text-[#00a859]'}`}>
                        {item.title}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shrink-0">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold group-hover:bg-emerald-100 group-hover:text-emerald-800">
                    {item.badge}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-[#00a859] text-slate-400 group-hover:text-white flex items-center justify-center transition-all">
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00a859]" />
            <span className="text-[11px] sm:text-xs">
              {settings.nama_gereja || 'Jesus Kingdom Christ'} — Navigasi Modul Pelayanan Gereja
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-all text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
