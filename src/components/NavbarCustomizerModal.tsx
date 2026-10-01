import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { StorageManager } from '../utils/storage';
import { getNavbarTheme, getFooterTheme, getButtonIconTheme } from '../utils/themeHelper';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sun,
  ExternalLink,
  Layers,
  Eye,
  X,
  LayoutDashboard,
  Box,
  Users,
  CreditCard,
  FileJson,
  Send,
  Bell,
  Grid,
  Building,
  Calendar,
  BookOpen
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
    id: 'CLEAN_LIGHT',
    name: 'Luxe Clean Light',
    desc: 'Putih bersih & teal minimalis',
    previewBg: 'bg-white text-slate-900',
    border: 'border-slate-300'
  },
  {
    id: 'MATCH_THEME',
    name: 'Sesuai Tema Gereja',
    desc: 'Harmonis warna brand gereja',
    previewBg: 'bg-gradient-to-r from-teal-700 to-emerald-800 text-white',
    border: 'border-teal-400'
  },
  {
    id: 'EMERALD_GREEN',
    name: 'Forest Emerald',
    desc: 'Hijau zamrud teduh & elegan',
    previewBg: 'bg-[#031a0e] text-white',
    border: 'border-emerald-500/40'
  },
  {
    id: 'DEFAULT_DARK',
    name: 'Dark Slate',
    desc: 'Abu-abu gelap modern',
    previewBg: 'bg-slate-950 text-white',
    border: 'border-slate-800'
  },
  {
    id: 'MIDNIGHT_BLUE',
    name: 'Midnight Blue',
    desc: 'Biru laut dalam berwibawa',
    previewBg: 'bg-[#060c1d] text-white',
    border: 'border-blue-500/40'
  },
  {
    id: 'DEEP_PURPLE',
    name: 'Deep Amethyst',
    desc: 'Ungu royal megah',
    previewBg: 'bg-[#120520] text-white',
    border: 'border-purple-500/40'
  },
  {
    id: 'CRIMSON_RED',
    name: 'Crimson Burgundy',
    desc: 'Merah marun anggun',
    previewBg: 'bg-[#20050b] text-white',
    border: 'border-rose-500/40'
  },
  {
    id: 'WARM_GOLD',
    name: 'Warm Gold Luxe',
    desc: 'Emas hangat berkelas',
    previewBg: 'bg-[#1c1202] text-white',
    border: 'border-amber-500/40'
  },
  {
    id: 'PURE_BLACK',
    name: 'Pure Obsidian',
    desc: 'Hitam pekat OLED',
    previewBg: 'bg-black text-white',
    border: 'border-neutral-800'
  },
  {
    id: 'CUSTOM_HEX',
    name: 'Kustom Hex Bebas',
    desc: 'Bebas tentukan warna apa saja',
    previewBg: 'bg-gradient-to-r from-teal-600 to-indigo-700 text-white',
    border: 'border-teal-400'
  }
];

const BUTTON_ICON_PRESETS = [
  { id: 'MATCH_THEME', name: 'Sesuai Warna Tema', desc: 'Serasi Warna Gereja', color: 'bg-teal-600 text-white' },
  { id: 'CUSTOM_HEX', name: 'Kustom Hex Bebas', desc: 'Warna Mandiri', color: 'bg-indigo-600 text-white' },
  { id: 'GRADIENT', name: 'Gradasi Mewah', desc: 'Teal to Emerald', color: 'bg-gradient-to-br from-teal-600 to-emerald-500 text-white' },
  { id: 'GLASS', name: 'Glass Soft Blur', desc: 'Transparan Lembut', color: 'bg-teal-100 text-teal-800 border border-teal-300' },
  { id: 'SOLID', name: 'Solid Pekat', desc: 'Pekat Bersih', color: 'bg-slate-900 text-white' },
  { id: 'DEFAULT_COLORFUL', name: 'Warna-Warni Asli', desc: 'Tiap Menu Berbeda', color: 'bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 text-white' }
];

const FOOTER_PRESETS = [
  {
    id: 'CLEAN_LIGHT',
    name: 'Luxe Clean Light',
    desc: 'Putih bersih & teal minimalis',
    previewBg: 'bg-white text-slate-900',
    border: 'border-slate-300'
  },
  {
    id: 'MATCH_THEME',
    name: 'Sesuai Tema Gereja',
    desc: 'Mengikuti warna tema gereja',
    previewBg: 'bg-gradient-to-r from-teal-800 to-emerald-900 text-white',
    border: 'border-teal-400/50'
  },
  {
    id: 'MATCH_NAVBAR',
    name: 'Sama dengan Navbar',
    desc: 'Serasi dengan header atas',
    previewBg: 'bg-gradient-to-r from-slate-900 to-teal-950 text-white',
    border: 'border-teal-400/50'
  },
  {
    id: 'DEFAULT_DARK',
    name: 'Dark Slate',
    desc: 'Hitam slate elegan',
    previewBg: 'bg-slate-950 text-white',
    border: 'border-slate-800'
  },
  {
    id: 'MIDNIGHT_BLUE',
    name: 'Midnight Blue',
    desc: 'Biru laut dalam berwibawa',
    previewBg: 'bg-[#060c1d] text-white',
    border: 'border-blue-500/40'
  },
  {
    id: 'EMERALD_GREEN',
    name: 'Forest Emerald',
    desc: 'Hijau zamrud teduh',
    previewBg: 'bg-[#031a0e] text-white',
    border: 'border-emerald-500/40'
  },
  {
    id: 'PURE_BLACK',
    name: 'Pure Obsidian',
    desc: 'Hitam pekat OLED',
    previewBg: 'bg-black text-white',
    border: 'border-neutral-800'
  },
  {
    id: 'CUSTOM_HEX',
    name: 'Kustom Warna Hex',
    desc: 'Bebas pilih kode warna apa saja',
    previewBg: 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white',
    border: 'border-teal-400'
  }
];

const QUICK_SWATCHES = [
  { name: 'Putih Bersih', hex: '#ffffff' },
  { name: 'Teal Zamrud', hex: '#059669' },
  { name: 'Deep Teal', hex: '#042f2e' },
  { name: 'Cyan Terang', hex: '#06b6d4' },
  { name: 'Navy Midnight', hex: '#0f172a' },
  { name: 'Slate 950', hex: '#020617' },
  { name: 'Deep Indigo', hex: '#1e1b4b' },
  { name: 'Royal Purple', hex: '#3b0764' },
  { name: 'Forest Green', hex: '#052e16' },
  { name: 'Crimson Wine', hex: '#4c0519' },
  { name: 'Warm Amber', hex: '#451a03' },
  { name: 'Obsidian OLED', hex: '#000000' }
];

export const NavbarCustomizerModal: React.FC<NavbarCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onNavigateToSettings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'NAVBAR' | 'BUTTON_ICON' | 'FOOTER'>('NAVBAR');
  const [form, setForm] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(settings);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const currentNavbarTheme = getNavbarTheme(form);
  const currentFooterTheme = getFooterTheme(form);
  const currentButtonIconTheme = getButtonIconTheme(form);

  const applyChange = (updated: AppSettings) => {
    setForm(updated);
    onUpdateSettings(updated);
    StorageManager.saveSettings(updated);
  };

  // --- NAVBAR HANDLERS ---
  const handleSelectNavbarPreset = (presetId: string) => {
    applyChange({ ...form, navbar_theme_preset: presetId as any });
  };

  const handleNavbarCustomColorChange = (hex: string) => {
    applyChange({
      ...form,
      navbar_theme_preset: 'CUSTOM_HEX',
      navbar_custom_bg: hex
    });
  };

  const handleNavbarGradientToChange = (hex: string) => {
    applyChange({
      ...form,
      navbar_gradient_to: hex
    });
  };

  const handleNavbarGradientDirChange = (dir: 'to-r' | 'to-br' | 'to-b' | 'to-tr') => {
    applyChange({
      ...form,
      navbar_gradient_dir: dir
    });
  };

  const handleNavbarStyleChange = (style: 'GLASS' | 'SOLID' | 'GRADIENT') => {
    applyChange({ ...form, navbar_style: style });
  };

  const handleNavbarBorderChange = (border: 'NONE' | 'THEME_COLOR' | 'SUBTLE' | 'GLOW' | 'CUSTOM') => {
    applyChange({ ...form, navbar_border_accent: border });
  };

  const handleNavbarBorderColorChange = (hex: string) => {
    applyChange({ ...form, navbar_border_accent: 'CUSTOM', navbar_border_color: hex });
  };

  const handleNavbarBorderWidthChange = (width: '1' | '2' | '3' | '4') => {
    applyChange({ ...form, navbar_border_width: width });
  };

  const handleNavbarTextContrastChange = (contrast: 'AUTO' | 'WHITE' | 'DARK' | 'CUSTOM') => {
    applyChange({ ...form, navbar_custom_text: contrast });
  };

  const handleNavbarTextColorChange = (hex: string) => {
    applyChange({ ...form, navbar_custom_text: 'CUSTOM', navbar_custom_text_color: hex });
  };

  // --- NAVBAR ICON BUTTON HANDLERS ---
  const handleNavbarIconPresetChange = (preset: 'SUBTLE' | 'MATCH_THEME' | 'SOLID' | 'CUSTOM_HEX' | 'NONE') => {
    applyChange({ ...form, navbar_icon_bg_preset: preset });
  };

  const handleNavbarIconBgChange = (hex: string) => {
    applyChange({ ...form, navbar_icon_bg_preset: 'CUSTOM_HEX', navbar_icon_bg: hex });
  };

  const handleNavbarIconColorChange = (hex: string) => {
    applyChange({ ...form, navbar_icon_color: hex });
  };

  const handleNavbarIconShapeChange = (shape: 'ROUNDED' | 'CIRCLE' | 'SQUARE' | 'PILL') => {
    applyChange({ ...form, navbar_icon_shape: shape });
  };

  const handleNavbarIconBorderChange = (border: boolean, color?: string) => {
    applyChange({
      ...form,
      navbar_icon_border: border,
      ...(color ? { navbar_icon_border_color: color } : {})
    });
  };

  // --- BUTTON ICON (SELURUH APLIKASI) HANDLERS ---
  const handleButtonIconPresetChange = (preset: 'MATCH_THEME' | 'CUSTOM_HEX' | 'GRADIENT' | 'GLASS' | 'SOLID' | 'DEFAULT_COLORFUL') => {
    applyChange({ ...form, button_icon_preset: preset });
  };

  const handleButtonIconBgChange = (hex: string) => {
    applyChange({
      ...form,
      button_icon_preset: 'CUSTOM_HEX',
      button_icon_bg: hex
    });
  };

  const handleButtonIconGradientToChange = (hex: string) => {
    applyChange({
      ...form,
      button_icon_gradient_to: hex
    });
  };

  const handleButtonIconColorChange = (hex: string) => {
    applyChange({ ...form, button_icon_color: hex });
  };

  const handleButtonIconShapeChange = (shape: 'ROUNDED_XL' | 'CIRCLE' | 'SQUARE' | 'PILL') => {
    applyChange({ ...form, button_icon_shape: shape });
  };

  const handleButtonIconShadowChange = (shadow: 'NONE' | 'SOFT' | 'GLOW' | 'DEEP') => {
    applyChange({ ...form, button_icon_shadow: shadow });
  };

  const handleButtonIconBorderChange = (border: boolean, color?: string) => {
    applyChange({
      ...form,
      button_icon_border: border,
      ...(color ? { button_icon_border_color: color } : {})
    });
  };

  // --- FOOTER HANDLERS ---
  const handleSelectFooterPreset = (presetId: string) => {
    applyChange({ ...form, footer_theme_preset: presetId as any });
  };

  const handleFooterCustomColorChange = (hex: string) => {
    applyChange({
      ...form,
      footer_theme_preset: 'CUSTOM_HEX',
      footer_custom_bg: hex
    });
  };

  const handleFooterStyleChange = (style: 'GLASS' | 'SOLID' | 'GRADIENT') => {
    applyChange({ ...form, footer_style: style });
  };

  const handleFooterBorderChange = (border: 'NONE' | 'THEME_COLOR' | 'SUBTLE' | 'GLOW') => {
    applyChange({ ...form, footer_border_accent: border });
  };

  const handleIconBgStyleChange = (shape: 'SUBTLE' | 'SOLID' | 'PILL' | 'CIRCLE' | 'GLOW' | 'NONE') => {
    applyChange({ ...form, footer_icon_bg_style: shape });
  };

  const handleIconActiveBgChange = (color: string) => {
    applyChange({ ...form, footer_icon_active_bg: color });
  };

  const handleIconInactiveBgChange = (color: string) => {
    applyChange({ ...form, footer_icon_custom_bg: color });
  };

  const handleIconActiveTextChange = (color: string) => {
    applyChange({ ...form, footer_icon_active_text: color });
  };

  const handleIconInactiveTextChange = (color: string) => {
    applyChange({ ...form, footer_icon_inactive_text: color });
  };

  // --- RESETS ---
  const handleResetNavbarDefault = () => {
    const updated: AppSettings = {
      ...form,
      navbar_theme_preset: 'CLEAN_LIGHT',
      navbar_custom_bg: '#ffffff',
      navbar_gradient_to: '',
      navbar_gradient_dir: 'to-r',
      navbar_custom_text: 'AUTO',
      navbar_custom_text_color: '#0f172a',
      navbar_style: 'GLASS',
      navbar_border_accent: 'SUBTLE',
      navbar_border_color: '',
      navbar_border_width: '1',
      navbar_icon_bg_preset: 'SUBTLE',
      navbar_icon_bg: '',
      navbar_icon_color: '',
      navbar_icon_shape: 'ROUNDED',
      navbar_icon_border: false
    };
    applyChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetButtonIconDefault = () => {
    const updated: AppSettings = {
      ...form,
      button_icon_preset: 'MATCH_THEME',
      button_icon_bg: form.warna_tema || '#059669',
      button_icon_gradient_to: '',
      button_icon_color: '#ffffff',
      button_icon_shape: 'ROUNDED_XL',
      button_icon_shadow: 'SOFT',
      button_icon_border: false,
      button_icon_border_color: ''
    };
    applyChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetFooterDefault = () => {
    const updated: AppSettings = {
      ...form,
      footer_theme_preset: 'CLEAN_LIGHT',
      footer_custom_bg: '#ffffff',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white border-2 border-teal-200/90 text-slate-800 shadow-2xl overflow-hidden">
        {/* Header Modal with Tabs (Clean White & Teal Luxury Style) */}
        <div className="p-4 sm:p-5 border-b border-teal-100 bg-teal-50/80 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Panel Kustomisasi Tema, Navbar &amp; Button Icon</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-300">
                    Lengkap &amp; Terpadu
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Atur warna latar belakang, tombol icon, gradasi, border garis, dan tema visual di seluruh aplikasi.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-teal-100 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs: Header Navbar vs Button Icon vs Footer Mobile */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-teal-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('NAVBAR')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'NAVBAR'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Navbar Atas (Header)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('BUTTON_ICON')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'BUTTON_ICON'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>2. Tombol Icon (Button Icon)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('FOOTER')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'FOOTER'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Footer Mobile &amp; Bar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: NAVBAR ATAS (HEADER LENGKAP) */}
          {activeSubTab === 'NAVBAR' && (
            <>
              {/* Live Interactive Preview Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-teal-800">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>Pratinjau Langsung Navbar Atas:</span>
                  </span>
                  <span className="text-[11px] text-teal-700 font-mono font-bold">
                    {savedSuccess ? '✅ Tersimpan Real-time!' : 'Live Preview Interaktif'}
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
                      className={`p-2 transition-all shrink-0 ${currentNavbarTheme.iconBtnClass}`}
                      style={currentNavbarTheme.iconBtnStyle}
                      title="Menu Cepat"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shadow-xs shrink-0"
                        style={currentNavbarTheme.menuBtnStyle}
                      >
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p
                          className={`text-xs font-extrabold truncate ${currentNavbarTheme.titleClass}`}
                          style={currentNavbarTheme.titleStyle}
                        >
                          {form.nama_gereja || 'Jesus Kingdom Christ'}
                        </p>
                        <p
                          className={`text-[9px] font-bold leading-none ${currentNavbarTheme.subtextClass}`}
                          style={currentNavbarTheme.subtextStyle}
                        >
                          Portal Jemaat &bull; Enterprise CMS Pro
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${currentNavbarTheme.pillClass}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Cloud Live</span>
                    </div>

                    <button
                      type="button"
                      className={`p-2 transition-all shrink-0 relative ${currentNavbarTheme.iconBtnClass}`}
                      style={currentNavbarTheme.iconBtnStyle}
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    </button>

                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xs"
                      style={currentNavbarTheme.menuBtnStyle}
                    >
                      AD
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Preset Tema Navbar */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-800">
                  1. Pilih Preset Warna Tema Navbar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {NAVBAR_PRESETS.map((p) => {
                    const isSelected = (form.navbar_theme_preset || 'CLEAN_LIGHT') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectNavbarPreset(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 ring-2 ring-teal-300 bg-white text-teal-950 font-bold shadow-md'
                            : 'border-teal-200 bg-white/80 text-slate-700 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs ${p.previewBg}`}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold truncate">{p.name}</p>
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Hex Color & Gradient */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-teal-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-teal-600" />
                      <span>2. Kustom Warna Hex &amp; Gradasi Navbar Bebas</span>
                    </label>
                    <p className="text-[11px] text-slate-600">
                      Tentukan warna background utama atau kombinasikan dengan warna gradasi kedua.
                    </p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl border-2 border-teal-300 shadow-md shrink-0 flex items-center justify-center font-mono text-[9px] text-white font-bold"
                    style={{ backgroundColor: form.navbar_custom_bg || '#ffffff' }}
                  >
                    {form.navbar_custom_bg || '#fff'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Warna Utama */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-600">Warna Latar Utama (Hex):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={form.navbar_custom_bg || '#ffffff'}
                        onChange={(e) => handleNavbarCustomColorChange(e.target.value)}
                        placeholder="#ffffff"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-slate-900 font-mono font-bold text-xs uppercase outline-none"
                      />
                      <label className="px-2.5 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 border border-teal-300 cursor-pointer flex items-center gap-1.5 text-xs font-bold text-teal-800 shrink-0">
                        <input
                          type="color"
                          value={
                            form.navbar_custom_bg && /^#[0-9A-F]{6}$/i.test(form.navbar_custom_bg)
                              ? form.navbar_custom_bg
                              : '#ffffff'
                          }
                          onChange={(e) => handleNavbarCustomColorChange(e.target.value)}
                          className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span>Pilih</span>
                      </label>
                    </div>
                  </div>

                  {/* Warna Gradasi Ke-2 */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-600">Warna Gradasi Ke-2 (Opsional):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={form.navbar_gradient_to || ''}
                        onChange={(e) => handleNavbarGradientToChange(e.target.value)}
                        placeholder="#f1f5f9"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-slate-900 font-mono font-bold text-xs uppercase outline-none"
                      />
                      <label className="px-2.5 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 border border-teal-300 cursor-pointer flex items-center gap-1.5 text-xs font-bold text-teal-800 shrink-0">
                        <input
                          type="color"
                          value={
                            form.navbar_gradient_to && /^#[0-9A-F]{6}$/i.test(form.navbar_gradient_to)
                              ? form.navbar_gradient_to
                              : '#f1f5f9'
                          }
                          onChange={(e) => handleNavbarGradientToChange(e.target.value)}
                          className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span>Pilih</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Arah Gradasi */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-600">Arah Gradasi:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'to-r', label: 'Ke Kanan &rarr;' },
                      { id: 'to-br', label: 'Diagonal &searr;' },
                      { id: 'to-b', label: 'Ke Bawah &darr;' },
                      { id: 'to-tr', label: 'Miring Atas &nearr;' }
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleNavbarGradientDirChange(d.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          (form.navbar_gradient_dir || 'to-r') === d.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: d.label }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Swatches */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    Pilihan Cepat Warna Navbar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SWATCHES.map((sw) => (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() => handleNavbarCustomColorChange(sw.hex)}
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: sw.hex }} />
                        <span>{sw.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Style Transparansi, Garis Bawah, Kontras & Tombol Icon Navbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gaya Transparansi */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>3. Gaya Efek Visual</span>
                  </label>
                  {[
                    { id: 'GLASS', label: '✨ Glass Blur Transparan' },
                    { id: 'SOLID', label: '⬛ Solid Pekat Bersih' },
                    { id: 'GRADIENT', label: '🌈 Gradient Halus' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleNavbarStyleChange(s.id as any)}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.navbar_style || 'GLASS') === s.id
                          ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                          : 'border-teal-200 bg-white text-slate-600 hover:border-teal-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{s.label}</p>
                    </button>
                  ))}
                </div>

                {/* Garis Bawah Aksen */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>4. Garis Pembatas Bawah</span>
                  </label>
                  {[
                    { id: 'SUBTLE', label: '➖ Garis Halus' },
                    { id: 'THEME_COLOR', label: '🔲 Warna Tema Gereja' },
                    { id: 'GLOW', label: '✨ Glowing Neon Glow' },
                    { id: 'CUSTOM', label: '🎨 Garis Kustom Hex' },
                    { id: 'NONE', label: '✖️ Tanpa Garis' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleNavbarBorderChange(b.id as any)}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.navbar_border_accent || 'SUBTLE') === b.id
                          ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                          : 'border-teal-200 bg-white text-slate-600 hover:border-teal-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{b.label}</p>
                    </button>
                  ))}

                  {form.navbar_border_accent === 'CUSTOM' && (
                    <div className="pt-1 flex items-center gap-1.5">
                      <input
                        type="color"
                        value={form.navbar_border_color || form.warna_tema || '#059669'}
                        onChange={(e) => handleNavbarBorderColorChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0"
                      />
                      <select
                        value={form.navbar_border_width || '1'}
                        onChange={(e) => handleNavbarBorderWidthChange(e.target.value as any)}
                        className="flex-1 p-1 rounded-lg border border-teal-200 bg-white text-[10px] font-bold"
                      >
                        <option value="1">Tebal 1px</option>
                        <option value="2">Tebal 2px</option>
                        <option value="3">Tebal 3px</option>
                        <option value="4">Tebal 4px</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Kontras & Warna Teks Navbar */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>5. Warna Teks Navbar</span>
                  </label>
                  {[
                    { id: 'AUTO', label: '⚡ Otomatis Pintar' },
                    { id: 'WHITE', label: '⚪ Selalu Putih' },
                    { id: 'DARK', label: '⚫ Selalu Gelap' },
                    { id: 'CUSTOM', label: '🎨 Kustom Warna Teks' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleNavbarTextContrastChange(t.id as any)}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.navbar_custom_text || 'AUTO') === t.id
                          ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                          : 'border-teal-200 bg-white text-slate-600 hover:border-teal-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{t.label}</p>
                    </button>
                  ))}

                  {form.navbar_custom_text === 'CUSTOM' && (
                    <div className="pt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={form.navbar_custom_text_color || ''}
                        onChange={(e) => handleNavbarTextColorChange(e.target.value)}
                        placeholder="#0f172a"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-xs font-mono font-bold uppercase"
                      />
                      <input
                        type="color"
                        value={form.navbar_custom_text_color || '#0f172a'}
                        onChange={(e) => handleNavbarTextColorChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0"
                      />
                    </div>
                  )}
                </div>

                {/* Tombol Icon Navbar */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-teal-600" />
                    <span>6. Tombol Icon Navbar</span>
                  </label>
                  {[
                    { id: 'SUBTLE', label: 'Transparan Lembut' },
                    { id: 'MATCH_THEME', label: 'Sesuai Warna Tema' },
                    { id: 'SOLID', label: 'Solid Pekat' },
                    { id: 'CUSTOM_HEX', label: 'Kustom Hex Icon' },
                    { id: 'NONE', label: 'Polos / Tanpa Kotak' }
                  ].map((ib) => (
                    <button
                      key={ib.id}
                      type="button"
                      onClick={() => handleNavbarIconPresetChange(ib.id as any)}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.navbar_icon_bg_preset || 'SUBTLE') === ib.id
                          ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                          : 'border-teal-200 bg-white text-slate-600 hover:border-teal-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{ib.label}</p>
                    </button>
                  ))}

                  {form.navbar_icon_bg_preset === 'CUSTOM_HEX' && (
                    <div className="pt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={form.navbar_icon_bg || ''}
                        onChange={(e) => handleNavbarIconBgChange(e.target.value)}
                        placeholder="#059669"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-xs font-mono font-bold uppercase"
                      />
                      <input
                        type="color"
                        value={form.navbar_icon_bg || '#059669'}
                        onChange={(e) => handleNavbarIconBgChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0"
                      />
                    </div>
                  )}

                  {/* Bentuk Icon Navbar */}
                  <div className="pt-1 flex items-center gap-1">
                    {[
                      { id: 'ROUNDED', label: 'Rounded' },
                      { id: 'CIRCLE', label: 'Circle' },
                      { id: 'SQUARE', label: 'Square' }
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => handleNavbarIconShapeChange(sh.id as any)}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                          (form.navbar_icon_shape || 'ROUNDED') === sh.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BUTTON ICON & TOMBOL MENU (SELURUH APLIKASI) */}
          {activeSubTab === 'BUTTON_ICON' && (
            <>
              {/* Live Interactive Preview Box for Button Icons */}
              <div className="space-y-2 p-4 rounded-2xl bg-teal-50/70 border-2 border-teal-300 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-teal-800">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>Pratinjau Langsung Tombol Icon (Menu Cepat &amp; Modul):</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Preset: {form.button_icon_preset || 'MATCH_THEME'} &bull; Bentuk: {form.button_icon_shape || 'ROUNDED_XL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                  {[
                    { label: 'Data Jemaat', icon: Users, color: '#3b82f6' },
                    { label: 'Keuangan & Kas', icon: CreditCard, color: '#10b981' },
                    { label: 'Surat Sakramen', icon: FileJson, color: '#8b5cf6' },
                    { label: 'Agenda Event', icon: Calendar, color: '#f59e0b' },
                    { label: 'Ruang Chat', icon: Send, color: '#6366f1' },
                    { label: 'Alkitab & Lagu', icon: BookOpen, color: '#ec4899' }
                  ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white border border-teal-200 flex flex-col items-center text-center gap-2 group transition-all shadow-xs"
                      >
                        <div
                          className={`w-11 h-11 ${currentButtonIconTheme.getIconContainerClass()}`}
                          style={currentButtonIconTheme.getIconStyle(item.color)}
                        >
                          <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-800 truncate w-full">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1. Preset Background Button Icon */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-bold text-xs sm:text-sm">
                  1. Pilih Preset Gaya Background Button Icon:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {BUTTON_ICON_PRESETS.map((preset) => {
                    const isSelected = (form.button_icon_preset || 'MATCH_THEME') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleButtonIconPresetChange(preset.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 ring-2 ring-teal-300 bg-white text-teal-950 font-bold shadow-md'
                            : 'border-teal-200 bg-white/80 text-slate-700 hover:border-teal-400'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg ${preset.color} flex items-center justify-center text-[10px] font-bold mb-1.5 shadow-2xs`}>
                          ✓
                        </div>
                        <p className="text-[11px] font-bold truncate">{preset.name}</p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">{preset.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Hex Background & Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warna Background Hex Khusus */}
                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-teal-600" />
                      <span>2. Warna Background Button Icon (Hex)</span>
                    </label>
                    <span
                      className="w-5 h-5 rounded-lg border border-slate-300 inline-block shadow-2xs"
                      style={{ backgroundColor: form.button_icon_bg || form.warna_tema || '#059669' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.button_icon_bg || ''}
                      onChange={(e) => handleButtonIconBgChange(e.target.value)}
                      placeholder="#059669"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs uppercase outline-none font-bold"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer text-xs text-teal-800 font-bold flex items-center gap-1">
                      <input
                        type="color"
                        value={
                          form.button_icon_bg && /^#[0-9A-F]{6}$/i.test(form.button_icon_bg)
                            ? form.button_icon_bg
                            : form.warna_tema || '#059669'
                        }
                        onChange={(e) => handleButtonIconBgChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih Visual</span>
                    </label>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {QUICK_SWATCHES.slice(0, 6).map((sw) => (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() => handleButtonIconBgChange(sw.hex)}
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-[9px] font-bold flex items-center gap-1 bg-slate-50 hover:bg-white cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: sw.hex }} />
                        <span>{sw.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warna Simbol / Icon */}
                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>3. Warna Simbol Icon (Icon Color)</span>
                    </label>
                    <span
                      className="w-5 h-5 rounded-lg border border-slate-300 inline-block shadow-2xs"
                      style={{ backgroundColor: form.button_icon_color || '#ffffff' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.button_icon_color || ''}
                      onChange={(e) => handleButtonIconColorChange(e.target.value)}
                      placeholder="Default: Putih (#ffffff)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs uppercase outline-none font-bold"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer text-xs text-teal-800 font-bold flex items-center gap-1">
                      <input
                        type="color"
                        value={
                          form.button_icon_color && /^#[0-9A-F]{6}$/i.test(form.button_icon_color)
                            ? form.button_icon_color
                            : '#ffffff'
                        }
                        onChange={(e) => handleButtonIconColorChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih Visual</span>
                    </label>
                  </div>

                  {/* Quick Symbol Color Presets */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { name: 'Putih Bersih', hex: '#ffffff' },
                      { name: 'Hitam Slate', hex: '#0f172a' },
                      { name: 'Emas Hangat', hex: '#f59e0b' },
                      { name: 'Cyan Terang', hex: '#06b6d4' },
                      { name: 'Hijau Mint', hex: '#34d399' }
                    ].map((sw) => (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() => handleButtonIconColorChange(sw.hex)}
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-[9px] font-bold flex items-center gap-1 bg-slate-50 hover:bg-white cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: sw.hex }} />
                        <span>{sw.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Bentuk, Shadow & Border Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Bentuk Background Icon */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs">
                    4. Bentuk Tombol Icon:
                  </label>
                  {[
                    { id: 'ROUNDED_XL', label: '📦 Rounded Modern', desc: 'Kotak Membulat Halus' },
                    { id: 'CIRCLE', label: '⚪ Lingkaran Penuh', desc: 'Bulat Melingkar' },
                    { id: 'SQUARE', label: '⏹️ Persegi Sudut Halus', desc: 'Sudut Rapi Minimalis' },
                    { id: 'PILL', label: '💊 Kapsul Pill', desc: 'Kapsul Oval Melebar' }
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => handleButtonIconShapeChange(shape.id as any)}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.button_icon_shape || 'ROUNDED_XL') === shape.id
                          ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                          : 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{shape.label}</p>
                      <p className="text-[9px] text-slate-400">{shape.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Efek Bayangan / Glow */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs">
                    5. Efek Bayangan / Shadow:
                  </label>
                  {[
                    { id: 'NONE', label: 'Datar (Flat / No Shadow)', desc: 'Tanpa Bayangan' },
                    { id: 'SOFT', label: '✨ Lembut Elegan (Soft)', desc: 'Standar Modern' },
                    { id: 'GLOW', label: '💡 Glow Menyala (Neon)', desc: 'Cahaya Neon Warna' },
                    { id: 'DEEP', label: '⬛ Deep Shadow', desc: 'Bayangan Kontras Kuat' }
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => handleButtonIconShadowChange(sh.id as any)}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        (form.button_icon_shadow || 'SOFT') === sh.id
                          ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                          : 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{sh.label}</p>
                      <p className="text-[9px] text-slate-400">{sh.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Border Garis Pinggir */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold text-xs">
                    6. Border Garis Pinggir:
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-teal-200 bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.button_icon_border)}
                      onChange={(e) => handleButtonIconBorderChange(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-[11px] font-bold text-slate-800">Aktifkan Garis Border</span>
                  </label>

                  {form.button_icon_border && (
                    <div className="p-2.5 rounded-xl border border-teal-200 bg-white space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-600 block">Warna Border Icon:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={form.button_icon_border_color || ''}
                          onChange={(e) => handleButtonIconBorderChange(true, e.target.value)}
                          placeholder="#059669"
                          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-teal-200 text-xs font-mono"
                        />
                        <label className="p-1 rounded-lg border border-teal-200 cursor-pointer">
                          <input
                            type="color"
                            value={
                              form.button_icon_border_color && /^#[0-9A-F]{6}$/i.test(form.button_icon_border_color)
                                ? form.button_icon_border_color
                                : '#059669'
                            }
                            onChange={(e) => handleButtonIconBorderChange(true, e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: FOOTER MOBILE & BAR NAVIGASI BAWAH */}
          {activeSubTab === 'FOOTER' && (
            <>
              {/* Live Preview Box */}
              <div className="space-y-2 p-4 rounded-2xl bg-teal-50/70 border-2 border-teal-300">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-teal-800">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>Pratinjau Langsung Tampilan Footer &amp; Icon:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Preset: {form.footer_theme_preset || 'CLEAN_LIGHT'}
                  </span>
                </div>
                <div
                  className={`w-full rounded-2xl p-3 flex items-center justify-around shadow-xl border ${currentFooterTheme.containerClass.replace(
                    'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
                    ''
                  )}`}
                  style={currentFooterTheme.containerStyle}
                >
                  <div style={currentFooterTheme.getItemStyle(true)} className={currentFooterTheme.getItemClass(true)}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Home</span>
                  </div>
                  <div style={currentFooterTheme.getItemStyle(false)} className={currentFooterTheme.getItemClass(false)}>
                    <BookOpen className="w-5 h-5" />
                    <span>Renungan</span>
                  </div>
                  <div style={currentFooterTheme.getItemStyle(false)} className={currentFooterTheme.getItemClass(false)}>
                    <Calendar className="w-5 h-5" />
                    <span>Jadwal</span>
                  </div>
                  <div style={currentFooterTheme.getItemStyle(false)} className={currentFooterTheme.getItemClass(false)}>
                    <Users className="w-5 h-5" />
                    <span>Profil</span>
                  </div>
                </div>
              </div>

              {/* 1. Preset Tema Footer */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-bold text-xs sm:text-sm">
                  1. Preset Warna Background Footer:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FOOTER_PRESETS.map((fp) => {
                    const isSelected = (form.footer_theme_preset || 'CLEAN_LIGHT') === fp.id;
                    return (
                      <button
                        key={fp.id}
                        type="button"
                        onClick={() => handleSelectFooterPreset(fp.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 ring-2 ring-teal-300 bg-white text-teal-950 font-bold shadow-md'
                            : 'border-teal-200 bg-white/80 text-slate-700 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`w-3.5 h-3.5 rounded-full border border-slate-300 ${fp.previewBg}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] font-bold truncate">{fp.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{fp.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Hex Background & Warna Aktif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warna Latar Footer Hex */}
                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2 shadow-xs">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>2. Warna Latar Footer (Hex)</span>
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: form.footer_custom_bg || '#ffffff' }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_custom_bg || ''}
                      onChange={(e) => handleFooterCustomColorChange(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs outline-none uppercase font-bold"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer flex items-center gap-1.5 text-xs text-teal-800 font-bold">
                      <input
                        type="color"
                        value={
                          form.footer_custom_bg && /^#[0-9A-F]{6}$/i.test(form.footer_custom_bg)
                            ? form.footer_custom_bg
                            : '#ffffff'
                        }
                        onChange={(e) => handleFooterCustomColorChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih</span>
                    </label>
                  </div>
                </div>

                {/* Bentuk Background Icon Navigasi */}
                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2 shadow-xs">
                  <label className="text-xs font-bold text-slate-800 block">
                    3. Bentuk Background Icon Navigasi Bawah:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'SUBTLE', label: 'Lembut' },
                      { id: 'SOLID', label: 'Solid' },
                      { id: 'PILL', label: 'Pill Kapsul' },
                      { id: 'CIRCLE', label: 'Lingkaran' },
                      { id: 'GLOW', label: 'Glow Neon' },
                      { id: 'NONE', label: 'Polos' }
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleIconBgStyleChange(bg.id as any)}
                        className={`p-1.5 rounded-lg border text-center text-[10px] font-bold cursor-pointer transition-all ${
                          (form.footer_icon_bg_style || 'SUBTLE') === bg.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 text-slate-700 border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Warna Teks & Icon Aktif vs Idle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2 shadow-xs">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>4. Warna Teks &amp; Icon Saat Aktif</span>
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                      style={{
                        backgroundColor: form.footer_icon_active_text || form.warna_tema || '#059669'
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_icon_active_text || ''}
                      onChange={(e) => handleIconActiveTextChange(e.target.value)}
                      placeholder={form.warna_tema || '#059669'}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs outline-none uppercase font-bold"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer flex items-center gap-1.5 text-xs text-teal-800 font-bold">
                      <input
                        type="color"
                        value={
                          form.footer_icon_active_text && /^#[0-9A-F]{6}$/i.test(form.footer_icon_active_text)
                            ? form.footer_icon_active_text
                            : form.warna_tema || '#059669'
                        }
                        onChange={(e) => handleIconActiveTextChange(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span>Pilih</span>
                    </label>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2 shadow-xs">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>5. Warna Teks &amp; Icon Saat Diam (Inactive)</span>
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                      style={{
                        backgroundColor: form.footer_icon_inactive_text || '#64748b'
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.footer_icon_inactive_text || ''}
                      onChange={(e) => handleIconInactiveTextChange(e.target.value)}
                      placeholder="#64748b"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs outline-none uppercase font-bold"
                    />
                    <label className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer flex items-center gap-1.5 text-xs text-teal-800 font-bold">
                      <input
                        type="color"
                        value={
                          form.footer_icon_inactive_text && /^#[0-9A-F]{6}$/i.test(form.footer_icon_inactive_text)
                            ? form.footer_icon_inactive_text
                            : '#64748b'
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

        {/* Footer Actions (Clean Teal & White) */}
        <div className="p-4 sm:p-5 border-t border-teal-100 bg-teal-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={
              activeSubTab === 'NAVBAR'
                ? handleResetNavbarDefault
                : activeSubTab === 'BUTTON_ICON'
                ? handleResetButtonIconDefault
                : handleResetFooterDefault
            }
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {activeSubTab === 'NAVBAR'
                ? 'Reset Default Navbar'
                : activeSubTab === 'BUTTON_ICON'
                ? 'Reset Default Button Icon'
                : 'Reset Default Footer'}
            </span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToSettings();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-teal-300 bg-white text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Pengaturan Sistem Lengkap</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-lg shadow-teal-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
