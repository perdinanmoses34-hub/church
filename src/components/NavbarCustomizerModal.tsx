import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { StorageManager } from '../utils/storage';
import { getNavbarTheme, getFooterTheme, isColorLight } from '../utils/themeHelper';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Sun,
  Moon,
  ExternalLink,
  Layers,
  Eye,
  X,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  UserCheck,
  MoreHorizontal,
  Box,
  Circle,
  Square
} from 'lucide-react';

interface NavbarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onNavigateToSettings?: () => void;
}

const NAVBAR_PRESETS = [
  {
    id: 'DEFAULT_DARK',
    name: 'Dark Slate',
    desc: 'Default elegan transparan',
    previewBg: 'bg-slate-950',
    border: 'border-slate-800'
  },
  {
    id: 'MATCH_THEME',
    name: 'Sesuai Tema Gereja',
    desc: 'Mengikuti warna tema gereja',
    previewBg: 'bg-gradient-to-r from-rose-900 to-slate-900',
    border: 'border-rose-500/50'
  },
  {
    id: 'MIDNIGHT_BLUE',
    name: 'Midnight Blue',
    desc: 'Biru laut dalam berwibawa',
    previewBg: 'bg-[#060c1d]',
    border: 'border-blue-500/40'
  },
  {
    id: 'DEEP_PURPLE',
    name: 'Deep Amethyst',
    desc: 'Ungu royal megah',
    previewBg: 'bg-[#120520]',
    border: 'border-purple-500/40'
  },
  {
    id: 'EMERALD_GREEN',
    name: 'Forest Emerald',
    desc: 'Hijau zamrud teduh',
    previewBg: 'bg-[#031a0e]',
    border: 'border-emerald-500/40'
  },
  {
    id: 'CRIMSON_RED',
    name: 'Crimson Burgundy',
    desc: 'Merah marun anggun',
    previewBg: 'bg-[#20050b]',
    border: 'border-rose-500/40'
  },
  {
    id: 'WARM_GOLD',
    name: 'Warm Gold Luxe',
    desc: 'Emas hangat berkelas',
    previewBg: 'bg-[#1c1202]',
    border: 'border-amber-500/40'
  },
  {
    id: 'PURE_BLACK',
    name: 'Pure Obsidian',
    desc: 'Hitam pekat sejati OLED',
    previewBg: 'bg-black',
    border: 'border-neutral-800'
  },
  {
    id: 'CLEAN_LIGHT',
    name: 'Luxe Clean Light',
    desc: 'Putih terang minimalis',
    previewBg: 'bg-white text-slate-900',
    border: 'border-slate-300'
  },
  {
    id: 'CUSTOM_HEX',
    name: 'Kustom Warna Hex',
    desc: 'Bebas pilih kode warna apa saja',
    previewBg: 'bg-gradient-to-r from-indigo-900 to-purple-900',
    border: 'border-indigo-400'
  }
];

const FOOTER_PRESETS = [
  {
    id: 'DEFAULT_DARK',
    name: 'Dark Slate',
    desc: 'Default hitam slate elegan',
    previewBg: 'bg-slate-950',
    border: 'border-slate-800'
  },
  {
    id: 'MATCH_THEME',
    name: 'Sesuai Tema Gereja',
    desc: 'Mengikuti warna tema gereja',
    previewBg: 'bg-gradient-to-r from-rose-900 to-slate-900',
    border: 'border-rose-500/50'
  },
  {
    id: 'MATCH_NAVBAR',
    name: 'Sama dengan Navbar',
    desc: 'Serasi dengan header atas',
    previewBg: 'bg-gradient-to-r from-slate-900 to-indigo-950',
    border: 'border-indigo-400/50'
  },
  {
    id: 'MIDNIGHT_BLUE',
    name: 'Midnight Blue',
    desc: 'Biru laut dalam berwibawa',
    previewBg: 'bg-[#060c1d]',
    border: 'border-blue-500/40'
  },
  {
    id: 'DEEP_PURPLE',
    name: 'Deep Amethyst',
    desc: 'Ungu royal megah',
    previewBg: 'bg-[#120520]',
    border: 'border-purple-500/40'
  },
  {
    id: 'EMERALD_GREEN',
    name: 'Forest Emerald',
    desc: 'Hijau zamrud teduh',
    previewBg: 'bg-[#031a0e]',
    border: 'border-emerald-500/40'
  },
  {
    id: 'CRIMSON_RED',
    name: 'Crimson Burgundy',
    desc: 'Merah marun anggun',
    previewBg: 'bg-[#20050b]',
    border: 'border-rose-500/40'
  },
  {
    id: 'WARM_GOLD',
    name: 'Warm Gold Luxe',
    desc: 'Emas hangat berkelas',
    previewBg: 'bg-[#1c1202]',
    border: 'border-amber-500/40'
  },
  {
    id: 'PURE_BLACK',
    name: 'Pure Obsidian',
    desc: 'Hitam pekat sejati OLED',
    previewBg: 'bg-black',
    border: 'border-neutral-800'
  },
  {
    id: 'CLEAN_LIGHT',
    name: 'Luxe Clean Light',
    desc: 'Putih terang minimalis',
    previewBg: 'bg-white text-slate-900',
    border: 'border-slate-300'
  },
  {
    id: 'CUSTOM_HEX',
    name: 'Kustom Warna Hex',
    desc: 'Bebas pilih kode warna apa saja',
    previewBg: 'bg-gradient-to-r from-indigo-900 to-purple-900',
    border: 'border-indigo-400'
  }
];

const QUICK_SWATCHES = [
  { name: 'Obsidian OLED', hex: '#000000' },
  { name: 'Slate 950', hex: '#020617' },
  { name: 'Navy Midnight', hex: '#0f172a' },
  { name: 'Deep Indigo', hex: '#1e1b4b' },
  { name: 'Royal Purple', hex: '#3b0764' },
  { name: 'Deep Teal', hex: '#042f2e' },
  { name: 'Forest Green', hex: '#052e16' },
  { name: 'Crimson Wine', hex: '#4c0519' },
  { name: 'Dark Amber', hex: '#451a03' },
  { name: 'Charcoal', hex: '#18181b' },
  { name: 'Terracotta', hex: '#CD5C5C' },
  { name: 'Clean White', hex: '#ffffff' }
];

const ICON_BG_SWATCHES = [
  { name: 'Transparan', hex: 'transparent' },
  { name: 'Putih Kaca', hex: 'rgba(255,255,255,0.08)' },
  { name: 'Hitam Kaca', hex: 'rgba(0,0,0,0.3)' },
  { name: 'Slate 800', hex: '#1e293b' },
  { name: 'Indigo 900', hex: '#312e81' },
  { name: 'Rose 900', hex: '#881337' },
  { name: 'Amber 900', hex: '#78350f' },
  { name: 'Emerald 900', hex: '#064e3b' }
];

export const NavbarCustomizerModal: React.FC<NavbarCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onNavigateToSettings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'NAVBAR' | 'FOOTER'>('NAVBAR');
  const [form, setForm] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewActiveIcon, setPreviewActiveIcon] = useState<'home' | 'renungan' | 'jadwal' | 'profil' | 'lainnya'>('home');

  useEffect(() => {
    if (isOpen) {
      setForm(settings);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const currentNavbarTheme = getNavbarTheme(form);
  const currentFooterTheme = getFooterTheme(form);

  const applyChange = (updated: AppSettings) => {
    setForm(updated);
    onUpdateSettings(updated);
    StorageManager.saveSettings(updated);
  };

  // --- NAVBAR HANDLERS ---
  const handleSelectNavbarPreset = (presetId: string) => {
    const updated: AppSettings = {
      ...form,
      navbar_theme_preset: presetId as any
    };
    applyChange(updated);
  };

  const handleNavbarCustomColorChange = (hex: string) => {
    const updated: AppSettings = {
      ...form,
      navbar_theme_preset: 'CUSTOM_HEX',
      navbar_custom_bg: hex
    };
    applyChange(updated);
  };

  const handleNavbarStyleChange = (style: 'GLASS' | 'SOLID' | 'GRADIENT') => {
    const updated: AppSettings = {
      ...form,
      navbar_style: style
    };
    applyChange(updated);
  };

  const handleNavbarBorderChange = (border: 'NONE' | 'THEME_COLOR' | 'SUBTLE' | 'GLOW') => {
    const updated: AppSettings = {
      ...form,
      navbar_border_accent: border
    };
    applyChange(updated);
  };

  const handleNavbarTextContrastChange = (contrast: 'AUTO' | 'WHITE' | 'DARK' | 'GOLD') => {
    const updated: AppSettings = {
      ...form,
      navbar_custom_text: contrast
    };
    applyChange(updated);
  };

  const handleResetNavbarDefault = () => {
    const updated: AppSettings = {
      ...form,
      navbar_theme_preset: 'DEFAULT_DARK',
      navbar_custom_bg: '#1e293b',
      navbar_custom_text: 'AUTO',
      navbar_style: 'GLASS',
      navbar_border_accent: 'SUBTLE'
    };
    applyChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // --- FOOTER HANDLERS ---
  const handleSelectFooterPreset = (presetId: string) => {
    const updated: AppSettings = {
      ...form,
      footer_theme_preset: presetId as any
    };
    applyChange(updated);
  };

  const handleFooterCustomColorChange = (hex: string) => {
    const updated: AppSettings = {
      ...form,
      footer_theme_preset: 'CUSTOM_HEX',
      footer_custom_bg: hex
    };
    applyChange(updated);
  };

  const handleFooterStyleChange = (style: 'GLASS' | 'SOLID' | 'GRADIENT') => {
    const updated: AppSettings = {
      ...form,
      footer_style: style
    };
    applyChange(updated);
  };

  const handleFooterBorderChange = (border: 'NONE' | 'THEME_COLOR' | 'SUBTLE' | 'GLOW') => {
    const updated: AppSettings = {
      ...form,
      footer_border_accent: border
    };
    applyChange(updated);
  };

  const handleIconBgStyleChange = (shape: 'SUBTLE' | 'SOLID' | 'PILL' | 'CIRCLE' | 'GLOW' | 'NONE') => {
    const updated: AppSettings = {
      ...form,
      footer_icon_bg_style: shape
    };
    applyChange(updated);
  };

  const handleIconActiveBgChange = (color: string) => {
    const updated: AppSettings = {
      ...form,
      footer_icon_active_bg: color
    };
    applyChange(updated);
  };

  const handleIconInactiveBgChange = (color: string) => {
    const updated: AppSettings = {
      ...form,
      footer_icon_custom_bg: color
    };
    applyChange(updated);
  };

  const handleIconActiveTextChange = (color: string) => {
    const updated: AppSettings = {
      ...form,
      footer_icon_active_text: color
    };
    applyChange(updated);
  };

  const handleIconInactiveTextChange = (color: string) => {
    const updated: AppSettings = {
      ...form,
      footer_icon_inactive_text: color
    };
    applyChange(updated);
  };

  const handleResetFooterDefault = () => {
    const updated: AppSettings = {
      ...form,
      footer_theme_preset: 'DEFAULT_DARK',
      footer_custom_bg: '#020617',
      footer_style: 'GLASS',
      footer_border_accent: 'SUBTLE',
      footer_icon_bg_style: 'SUBTLE',
      footer_icon_custom_bg: 'transparent',
      footer_icon_active_bg: '',
      footer_icon_active_text: '',
      footer_icon_inactive_text: ''
    };
    applyChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 text-white shadow-2xl overflow-hidden">
        {/* Header Modal with Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Kustomisasi Navigasi Bar</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    Admin & SuperAdmin
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Sesuaikan tampilan warna, background footer, icon tombol navigasi, dan header atas.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs: Header vs Footer */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('NAVBAR')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'NAVBAR'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Navbar Atas (Header)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('FOOTER')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'FOOTER'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Footer &amp; Background Icon</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: NAVBAR ATAS */}
          {activeSubTab === 'NAVBAR' && (
            <>
              {/* Live Mini Preview Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Pratinjau Langsung Navbar Atas</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {savedSuccess ? 'Tersimpan!' : 'Live Interactive'}
                  </span>
                </div>
                <div
                  className={`w-full rounded-2xl p-3 sm:p-4 transition-all duration-300 border flex items-center justify-between ${currentNavbarTheme.containerClass} ${currentNavbarTheme.borderBottomClass} shadow-xl`}
                  style={{
                    ...currentNavbarTheme.containerStyle,
                    ...currentNavbarTheme.borderBottomStyle
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-xl text-white font-black text-[11px] shadow flex items-center gap-1.5 shrink-0"
                      style={currentNavbarTheme.menuBtnStyle}
                    >
                      <span>Kartu Menu</span>
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={form.logo || DEFAULT_CHURCH_LOGO}
                        alt="Logo"
                        className="w-7 h-7 rounded-lg object-cover border border-white/20 shrink-0"
                      />
                      <div className="truncate">
                        <p className={`text-xs font-extrabold truncate ${currentNavbarTheme.titleClass}`}>
                          {form.nama_gereja || 'Jesus Kingdom Christ'}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-amber-400 font-bold leading-none">
                          Enterprise CMS Pro
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold ${currentNavbarTheme.pillClass}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>09:41 WIB • Real-Time</span>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        currentNavbarTheme.isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
                      }`}
                    >
                      AD
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Theme Selection */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-amber-300">
                  1. Pilih Preset Warna Tema Navbar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {NAVBAR_PRESETS.map((p) => {
                    const isSelected = (form.navbar_theme_preset || 'DEFAULT_DARK') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectNavbarPreset(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.02] bg-slate-800'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950/70 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-4 h-4 rounded-full border border-white/20 shadow-inner ${p.previewBg}`}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>2. Kustom Warna Hex Navbar Khusus</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Ketik kode warna hex apa saja atau gunakan pemilih visual.
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/20 shadow-md shrink-0 flex items-center justify-center font-mono text-[9px] text-white font-bold"
                    style={{ backgroundColor: form.navbar_custom_bg || '#1e293b' }}
                  >
                    {form.navbar_custom_bg || '#1e293b'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">
                      HEX:
                    </span>
                    <input
                      type="text"
                      value={form.navbar_custom_bg || '#1e293b'}
                      onChange={(e) => handleNavbarCustomColorChange(e.target.value)}
                      placeholder="#1e293b"
                      className="w-full pl-14 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:ring-2 focus:ring-amber-400 outline-none uppercase"
                    />
                  </div>

                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-200 shrink-0">
                    <input
                      type="color"
                      value={
                        form.navbar_custom_bg && /^#[0-9A-F]{6}$/i.test(form.navbar_custom_bg)
                          ? form.navbar_custom_bg
                          : '#1e293b'
                      }
                      onChange={(e) => handleNavbarCustomColorChange(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span>Pilih Visual</span>
                  </label>
                </div>

                {/* Quick Swatches */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Rekomendasi Warna Populer:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SWATCHES.map((chip) => {
                      const isActive =
                        form.navbar_theme_preset === 'CUSTOM_HEX' &&
                        (form.navbar_custom_bg || '').toUpperCase() === chip.hex.toUpperCase();
                      return (
                        <button
                          key={chip.hex}
                          type="button"
                          onClick={() => handleNavbarCustomColorChange(chip.hex)}
                          className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? 'border-amber-400 text-white bg-slate-800 ring-2 ring-amber-400/40'
                              : 'border-slate-800 text-slate-300 hover:border-slate-600 bg-slate-900/90'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: chip.hex }}
                          />
                          <span>{chip.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Style & Transparansi Navbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3. Gaya &amp; Transparansi Navbar</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'GLASS', label: '✨ Glass Blur', desc: 'Transparan' },
                      { id: 'SOLID', label: '⬛ Solid', desc: 'Pekat Tanpa Blur' },
                      { id: 'GRADIENT', label: '🌈 Gradient', desc: 'Gradasi Halus' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleNavbarStyleChange(s.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          (form.navbar_style || 'GLASS') === s.id
                            ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-2 ring-indigo-500/30'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="text-[11px] font-bold">{s.label}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garis Bawah Aksen */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>4. Garis Bawah Aksen Navbar</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'SUBTLE', label: '➖ Garis Halus', desc: 'Standar Elegan' },
                      { id: 'THEME_COLOR', label: '🔲 Warna Tema', desc: 'Aksen Garis Tema' },
                      { id: 'GLOW', label: '✨ Glowing Glow', desc: 'Cahaya Menawan' },
                      { id: 'NONE', label: '✖️ Tanpa Garis', desc: 'Menyatu Bersih' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleNavbarBorderChange(b.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          (form.navbar_border_accent || 'SUBTLE') === b.id
                            ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-2 ring-indigo-500/30'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate">{b.label}</p>
                        <p className="text-[9px] text-slate-500 truncate mt-0.5">{b.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kontras Teks */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>5. Kontras Teks &amp; Icon Navbar</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'AUTO', label: '⚡ Otomatis', desc: 'Deteksi kecerahan' },
                    { id: 'WHITE', label: '⚪ Selalu Putih', desc: 'Teks putih terang' },
                    { id: 'DARK', label: '⚫ Selalu Gelap', desc: 'Teks abu pekat/hitam' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleNavbarTextContrastChange(t.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        (form.navbar_custom_text || 'AUTO') === t.id
                          ? 'border-amber-400 bg-amber-500/15 text-white font-bold ring-2 ring-amber-400/30'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{t.label}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: FOOTER & BACKGROUND ICON */}
          {activeSubTab === 'FOOTER' && (
            <>
              {/* Live Interactive Footer Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Pratinjau Langsung Footer &amp; Tombol Icon</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Klik icon di bawah untuk uji coba status aktif)
                  </span>
                </div>
                <div
                  className={`w-full rounded-2xl p-3 sm:p-4 transition-all duration-300 flex items-center justify-around shadow-xl border ${currentFooterTheme.containerClass.replace('fixed bottom-0 left-0 right-0 z-40 lg:hidden', '')}`}
                  style={currentFooterTheme.containerStyle}
                >
                  {/* Home */}
                  <button
                    type="button"
                    onClick={() => setPreviewActiveIcon('home')}
                    style={currentFooterTheme.getItemStyle(previewActiveIcon === 'home')}
                    className={currentFooterTheme.getItemClass(previewActiveIcon === 'home')}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Home</span>
                  </button>

                  {/* Renungan */}
                  <button
                    type="button"
                    onClick={() => setPreviewActiveIcon('renungan')}
                    style={currentFooterTheme.getItemStyle(previewActiveIcon === 'renungan')}
                    className={currentFooterTheme.getItemClass(previewActiveIcon === 'renungan')}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Renungan</span>
                  </button>

                  {/* Jadwal */}
                  <button
                    type="button"
                    onClick={() => setPreviewActiveIcon('jadwal')}
                    style={currentFooterTheme.getItemStyle(previewActiveIcon === 'jadwal')}
                    className={currentFooterTheme.getItemClass(previewActiveIcon === 'jadwal')}
                  >
                    <CalendarDays className="w-5 h-5" />
                    <span>Jadwal</span>
                  </button>

                  {/* Profil */}
                  <button
                    type="button"
                    onClick={() => setPreviewActiveIcon('profil')}
                    style={currentFooterTheme.getItemStyle(previewActiveIcon === 'profil')}
                    className={currentFooterTheme.getItemClass(previewActiveIcon === 'profil')}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>Profil</span>
                  </button>

                  {/* Lainnya */}
                  <button
                    type="button"
                    onClick={() => setPreviewActiveIcon('lainnya')}
                    style={currentFooterTheme.getItemStyle(previewActiveIcon === 'lainnya')}
                    className={currentFooterTheme.getItemClass(previewActiveIcon === 'lainnya')}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    <span>Lainnya</span>
                  </button>
                </div>
              </div>

              {/* 1. Preset Tema Background Footer */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-indigo-300">
                  1. Pilih Preset Background Footer (Bar Navigasi Bawah)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FOOTER_PRESETS.map((p) => {
                    const isSelected = (form.footer_theme_preset || 'DEFAULT_DARK') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectFooterPreset(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg scale-[1.02] bg-slate-800'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950/70 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-4 h-4 rounded-full border border-white/20 shadow-inner ${p.previewBg}`}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Kustom Hex Footer Khusus */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      <span>2. Kustom Warna Hex Background Footer Khusus</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Bebas memasukkan warna latar belakang footer apa saja.
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/20 shadow-md shrink-0 flex items-center justify-center font-mono text-[9px] text-white font-bold"
                    style={{ backgroundColor: form.footer_custom_bg || '#020617' }}
                  >
                    {form.footer_custom_bg || '#020617'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">
                      HEX:
                    </span>
                    <input
                      type="text"
                      value={form.footer_custom_bg || '#020617'}
                      onChange={(e) => handleFooterCustomColorChange(e.target.value)}
                      placeholder="#020617"
                      className="w-full pl-14 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-400 outline-none uppercase"
                    />
                  </div>

                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-200 shrink-0">
                    <input
                      type="color"
                      value={
                        form.footer_custom_bg && /^#[0-9A-F]{6}$/i.test(form.footer_custom_bg)
                          ? form.footer_custom_bg
                          : '#020617'
                      }
                      onChange={(e) => handleFooterCustomColorChange(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span>Pilih Visual</span>
                  </label>
                </div>

                {/* Quick Swatches for Footer */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Pilihan Cepat Warna Footer:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SWATCHES.map((chip) => {
                      const isActive =
                        form.footer_theme_preset === 'CUSTOM_HEX' &&
                        (form.footer_custom_bg || '').toUpperCase() === chip.hex.toUpperCase();
                      return (
                        <button
                          key={chip.hex}
                          type="button"
                          onClick={() => handleFooterCustomColorChange(chip.hex)}
                          className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? 'border-indigo-400 text-white bg-slate-800 ring-2 ring-indigo-400/40'
                              : 'border-slate-800 text-slate-300 hover:border-slate-600 bg-slate-900/90'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: chip.hex }}
                          />
                          <span>{chip.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Gaya Transparansi & Garis Atas Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3. Gaya &amp; Transparansi Footer</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'GLASS', label: '✨ Glass Blur', desc: 'Transparan Mewah' },
                      { id: 'SOLID', label: '⬛ Solid', desc: 'Pekat Tanpa Blur' },
                      { id: 'GRADIENT', label: '🌈 Gradient', desc: 'Gradasi Halus' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleFooterStyleChange(s.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          (form.footer_style || 'GLASS') === s.id
                            ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-2 ring-indigo-500/30'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="text-[11px] font-bold">{s.label}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>4. Garis Pembatas Atas Footer</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'SUBTLE', label: '➖ Garis Halus', desc: 'Standar Elegan' },
                      { id: 'THEME_COLOR', label: '🔲 Warna Tema', desc: 'Garis Sesuai Tema' },
                      { id: 'GLOW', label: '✨ Glowing Glow', desc: 'Pendar Neon Atas' },
                      { id: 'NONE', label: '✖️ Tanpa Garis', desc: 'Menyatu Bersih' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleFooterBorderChange(b.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          (form.footer_border_accent || 'SUBTLE') === b.id
                            ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-2 ring-indigo-500/30'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate">{b.label}</p>
                        <p className="text-[9px] text-slate-500 truncate mt-0.5">{b.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Gaya Bentuk Background Icon */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  <span>5. Gaya Bentuk Background Icon (Home, Renungan, Jadwal, Profil, Lainnya)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'SUBTLE', label: '📦 Rounded Box', desc: 'Kotak Melengkung Elegan' },
                    { id: 'PILL', label: '💊 Kapsul Pill', desc: 'Memanjang Modern' },
                    { id: 'CIRCLE', label: '⚪ Lingkaran Badge', desc: 'Bulat Melingkar' },
                    { id: 'GLOW', label: '✨ Neon Glow', desc: 'Pendar Efek Bercahaya' },
                    { id: 'SOLID', label: '⬛ Solid Box', desc: 'Kotak Tegas Pekat' },
                    { id: 'NONE', label: '🔘 Minimalis', desc: 'Transparan Polos' }
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => handleIconBgStyleChange(shape.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.footer_icon_bg_style || 'SUBTLE') === shape.id
                          ? 'border-amber-400 bg-amber-500/15 text-white font-bold ring-2 ring-amber-400/30'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-[11px] font-bold truncate">{shape.label}</p>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">{shape.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Kustom Warna Background Icon Saat Aktif & Idle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warna Background Icon Aktif */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <label className="block text-xs font-bold text-white flex items-center justify-between">
                    <span>Warna Background Icon Aktif</span>
                    <span
                      className="w-5 h-5 rounded-md border border-white/20 inline-block"
                      style={{
                        backgroundColor: form.footer_icon_active_bg || `${form.warna_tema || '#CD5C5C'}25`
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Warna latar belakang tombol menu saat halaman aktif dibuka.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_icon_active_bg || ''}
                      onChange={(e) => handleIconActiveBgChange(e.target.value)}
                      placeholder="Default: Warna Tema"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs text-slate-200">
                      <input
                        type="color"
                        value={
                          form.footer_icon_active_bg && /^#[0-9A-F]{6}$/i.test(form.footer_icon_active_bg)
                            ? form.footer_icon_active_bg
                            : form.warna_tema || '#CD5C5C'
                        }
                        onChange={(e) => handleIconActiveBgChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ICON_BG_SWATCHES.slice(0, 4).map((sw) => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => handleIconActiveBgChange(sw.hex)}
                        className="px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 text-[9px] text-slate-300 hover:text-white"
                      >
                        {sw.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warna Background Icon Diam (Idle / Inactive) */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <label className="block text-xs font-bold text-white flex items-center justify-between">
                    <span>Warna Background Icon Diam</span>
                    <span
                      className="w-5 h-5 rounded-md border border-white/20 inline-block"
                      style={{
                        backgroundColor: form.footer_icon_custom_bg || 'transparent'
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Warna latar tombol menu ketika sedang tidak aktif.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_icon_custom_bg || ''}
                      onChange={(e) => handleIconInactiveBgChange(e.target.value)}
                      placeholder="Default: Transparan"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs text-slate-200">
                      <input
                        type="color"
                        value={
                          form.footer_icon_custom_bg && /^#[0-9A-F]{6}$/i.test(form.footer_icon_custom_bg)
                            ? form.footer_icon_custom_bg
                            : '#1e293b'
                        }
                        onChange={(e) => handleIconInactiveBgChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleIconInactiveBgChange('transparent')}
                      className="px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 text-[9px] text-slate-300 hover:text-white"
                    >
                      Transparan
                    </button>
                    {ICON_BG_SWATCHES.slice(1, 4).map((sw) => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => handleIconInactiveBgChange(sw.hex)}
                        className="px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 text-[9px] text-slate-300 hover:text-white"
                      >
                        {sw.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. Kustom Warna Teks / Icon Saat Aktif & Idle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warna Teks/Icon Aktif */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Warna Teks &amp; Icon Aktif</span>
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 inline-block"
                      style={{
                        backgroundColor: form.footer_icon_active_text || form.warna_tema || '#CD5C5C'
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_icon_active_text || ''}
                      onChange={(e) => handleIconActiveTextChange(e.target.value)}
                      placeholder={form.warna_tema || '#CD5C5C'}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none uppercase"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs text-slate-200">
                      <input
                        type="color"
                        value={
                          form.footer_icon_active_text && /^#[0-9A-F]{6}$/i.test(form.footer_icon_active_text)
                            ? form.footer_icon_active_text
                            : form.warna_tema || '#CD5C5C'
                        }
                        onChange={(e) => handleIconActiveTextChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih</span>
                    </label>
                  </div>
                </div>

                {/* Warna Teks/Icon Diam (Inactive) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Warna Teks &amp; Icon Diam</span>
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 inline-block"
                      style={{
                        backgroundColor: form.footer_icon_inactive_text || '#94a3b8'
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_icon_inactive_text || ''}
                      onChange={(e) => handleIconInactiveTextChange(e.target.value)}
                      placeholder="#94a3b8"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none uppercase"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs text-slate-200">
                      <input
                        type="color"
                        value={
                          form.footer_icon_inactive_text && /^#[0-9A-F]{6}$/i.test(form.footer_icon_inactive_text)
                            ? form.footer_icon_inactive_text
                            : '#94a3b8'
                        }
                        onChange={(e) => handleIconInactiveTextChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={activeSubTab === 'NAVBAR' ? handleResetNavbarDefault : handleResetFooterDefault}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{activeSubTab === 'NAVBAR' ? 'Reset Default Navbar' : 'Reset Default Footer'}</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToSettings();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Pengaturan Sistem</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Selesai &amp; Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
