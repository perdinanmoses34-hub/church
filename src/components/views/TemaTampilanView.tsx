import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../types';
import { StorageManager } from '../../utils/storage';
import { isColorLight, getNavbarTheme, getFooterTheme } from '../../utils/themeHelper';
import { DEFAULT_CHURCH_LOGO } from '../../data/initialData';
import {
  Sparkles,
  Palette,
  Layers,
  Layout,
  Smartphone,
  Monitor,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  CheckCircle2,
  Home,
  BookOpen,
  Calendar,
  Bell,
  Menu,
  Maximize2,
  Minimize2,
  Church,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface TemaTampilanViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  isModalMode?: boolean;
  onCloseModal?: () => void;
}

interface DesignPreset {
  id: string;
  name: string;
  badge: string;
  badgeType: 'default' | 'formal' | 'glass' | 'innovative' | 'warm' | 'bold';
  hex: string;
  desc: string;
  themePreset: 'EMERALD_LIGHT' | 'LUXE_LIGHT' | 'DARK_SLATE' | 'MIDNIGHT_BLUE' | 'WARM_GOLD';
  cardStyle: 'GLASS' | 'SOLID' | 'NEON' | 'FLAT';
  cardSize: 'COMPACT' | 'NORMAL' | 'SPACIOUS';
  accentColor: 'EMERALD' | 'INDIGO' | 'AMBER' | 'ROSE' | 'CYAN' | 'PURPLE' | 'ROYAL_GOLD';
  radiusTag: string;
  shadowTag: string;
  paletteTag: string;
}

const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'ZAMRUD_PESISIR',
    name: 'Zamrud Pesisir',
    badge: 'Bawaan Gereja',
    badgeType: 'default',
    hex: '#059669',
    desc: 'Nuansa hijau zamrud toska profesional khas sistem pelayanan gereja nasional.',
    themePreset: 'EMERALD_LIGHT',
    cardStyle: 'SOLID',
    cardSize: 'NORMAL',
    accentColor: 'EMERALD',
    radiusTag: 'Radius: lg',
    shadowTag: 'Bayangan: sm',
    paletteTag: 'neutral-slate'
  },
  {
    id: 'SAFIR_KERAJAAN',
    name: 'Safir Kerajaan',
    badge: 'Formal & Wibawa',
    badgeType: 'formal',
    hex: '#2563eb',
    desc: 'Biru royal megah dipadukan dengan aksen sidebar bersih yang presisi.',
    themePreset: 'LUXE_LIGHT',
    cardStyle: 'SOLID',
    cardSize: 'NORMAL',
    accentColor: 'INDIGO',
    radiusTag: 'Radius: lg',
    shadowTag: 'Bayangan: md',
    paletteTag: 'cool-gray'
  },
  {
    id: 'SAMUDRA_MODERN',
    name: 'Samudra Modern',
    badge: 'Modern Glassmorphic',
    badgeType: 'glass',
    hex: '#0284c7',
    desc: 'Efek kaca buram (glassmorphism) dengan pendaran cahaya samudra modern.',
    themePreset: 'EMERALD_LIGHT',
    cardStyle: 'GLASS',
    cardSize: 'NORMAL',
    accentColor: 'CYAN',
    radiusTag: 'Radius: xl',
    shadowTag: 'Bayangan: glow',
    paletteTag: 'subtle-mesh'
  },
  {
    id: 'VIOLET_PRESISI',
    name: 'Violet Presisi',
    badge: 'Elegan & Inovatif',
    badgeType: 'innovative',
    hex: '#7c3aed',
    desc: 'Ungu bangsawan berpadu fuchsia berenergi tinggi untuk pelayanan unggulan.',
    themePreset: 'LUXE_LIGHT',
    cardStyle: 'GLASS',
    cardSize: 'NORMAL',
    accentColor: 'PURPLE',
    radiusTag: 'Radius: xl',
    shadowTag: 'Bayangan: md',
    paletteTag: 'subtle-mesh'
  },
  {
    id: 'MENTARI_SENJA',
    name: 'Mentari Senja',
    badge: 'Hangat & Ramah',
    badgeType: 'warm',
    hex: '#d97706',
    desc: 'Latar kertas krem lembut dengan aksen emas hangat yang bersahabat.',
    themePreset: 'WARM_GOLD',
    cardStyle: 'SOLID',
    cardSize: 'NORMAL',
    accentColor: 'ROYAL_GOLD',
    radiusTag: 'Radius: md',
    shadowTag: 'Bayangan: sm',
    paletteTag: 'warm-amber'
  },
  {
    id: 'MERAH_DELIMA',
    name: 'Merah Delima',
    badge: 'Tegas & Berani',
    badgeType: 'bold',
    hex: '#dc2626',
    desc: 'Aksen merah garnet premium dengan ketegasan wibawa pelayanan.',
    themePreset: 'LUXE_LIGHT',
    cardStyle: 'SOLID',
    cardSize: 'NORMAL',
    accentColor: 'ROSE',
    radiusTag: 'Radius: lg',
    shadowTag: 'Bayangan: md',
    paletteTag: 'crimson'
  }
];

const QUICK_SWATCHES = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Cyan', hex: '#0284c7' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Gold', hex: '#ca8a04' },
  { name: 'Slate Dark', hex: '#334155' }
];

export const TemaTampilanView: React.FC<TemaTampilanViewProps> = ({
  settings,
  onUpdateSettings,
  isModalMode = false,
  onCloseModal
}) => {
  const [activeTab, setActiveTab] = useState<'PRESETS' | 'COLORS' | 'CARDS' | 'LAYOUT' | 'BOTTOM_NAV'>('PRESETS');
  const [previewDevice, setPreviewDevice] = useState<'MOBILE' | 'DESKTOP'>('MOBILE');
  const [form, setForm] = useState<AppSettings>(settings);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ZAMRUD_PESISIR');

  useEffect(() => {
    setForm(settings);
    // Detect matched preset
    const currentHex = (settings.warna_tema || '#059669').toLowerCase();
    const matched = DESIGN_PRESETS.find((p) => p.hex.toLowerCase() === currentHex);
    if (matched) {
      setSelectedPresetId(matched.id);
    }
  }, [settings]);

  const applyChange = (updated: AppSettings) => {
    setForm(updated);
    onUpdateSettings(updated);
    StorageManager.saveSettings(updated);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const handleSelectPreset = (preset: DesignPreset) => {
    setSelectedPresetId(preset.id);
    const updated: AppSettings = {
      ...form,
      warna_tema: preset.hex,
      theme_preset: preset.themePreset,
      card_style: preset.cardStyle,
      card_size: preset.cardSize,
      accent_color: preset.accentColor,
      navbar_theme_preset: 'MATCH_THEME',
      footer_theme_preset: 'MATCH_THEME',
      navbar_style: preset.cardStyle === 'GLASS' ? 'GLASS' : 'SOLID',
      footer_style: preset.cardStyle === 'GLASS' ? 'GLASS' : 'SOLID'
    };
    applyChange(updated);
  };

  const handleColorChange = (hex: string) => {
    const cleanHex = hex.trim();
    const updated: AppSettings = {
      ...form,
      warna_tema: cleanHex
    };
    applyChange(updated);
  };

  const activeColorHex = form.warna_tema?.trim() || '#059669';
  const isThemeLight = form.theme_preset === 'EMERALD_LIGHT' || form.theme_preset === 'LUXE_LIGHT';
  const churchName = form.nama_gereja || 'Jesus Kingdom Christ';

  const getBadgeStyle = (type: DesignPreset['badgeType']) => {
    switch (type) {
      case 'default':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'formal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'glass':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'innovative':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'warm':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bold':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-12 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* 1. Header Bar with Subtitle */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: activeColorHex }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Tema &amp; Tampilan Sistem
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kustomisasi warna tema gereja, bentuk &amp; jarak kartu atas-bawah, dan bilah menu ikon bawah.
              </p>
            </div>
          </div>
        </div>

        {/* Live Feedback Toast Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {showSavedFeedback && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tersimpan Otomatis</span>
            </div>
          )}
          {isModalMode && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Scrollable Navigation Tabs (Matching Screenshot) */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PRESETS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'PRESETS'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Preset Siap Pakai</span>
        </button>

        <button
          onClick={() => setActiveTab('COLORS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'COLORS'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60'
          }`}
        >
          <Palette className="w-4 h-4 text-emerald-500" />
          <span>Warna &amp; Palet</span>
        </button>

        <button
          onClick={() => setActiveTab('CARDS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'CARDS'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Bentuk &amp; Gaya Kartu</span>
        </button>

        <button
          onClick={() => setActiveTab('LAYOUT')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'LAYOUT'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60'
          }`}
        >
          <Layout className="w-4 h-4 text-purple-500" />
          <span>Latar Belakang &amp; Navbar</span>
        </button>

        <button
          onClick={() => setActiveTab('BOTTOM_NAV')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'BOTTOM_NAV'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60'
          }`}
        >
          <Smartphone className="w-4 h-4 text-teal-500" />
          <span>Bilah Bawah (BottomNav)</span>
        </button>
      </div>

      {/* 3. Main Split View: Left Controls (~60%) and Right Phone Preview (~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* === LEFT COLUMN: Configuration Controls === */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB 1: PRESET SIAP PAKAI (Exact replica of pratinjau.png) */}
          {activeTab === 'PRESETS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
              {/* Header Title */}
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Koleksi Preset Desain Gereja</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Pilih salah satu tema profesional yang telah dikurasi dengan perpaduan warna, radius kartu, dan bayangan yang harmonis untuk jemaat dan admin.
                </p>
              </div>

              {/* 2-Column Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DESIGN_PRESETS.map((preset) => {
                  const isSelected =
                    selectedPresetId === preset.id ||
                    (form.warna_tema || '').toUpperCase() === preset.hex.toUpperCase();

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                        isSelected
                          ? 'bg-slate-50/80 dark:bg-slate-800/80 border-2 shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs'
                      }`}
                      style={{
                        borderColor: isSelected ? preset.hex : undefined
                      }}
                    >
                      {/* Top Row: Color Swatch + Title + Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-5 h-5 rounded-full shrink-0 shadow-xs ring-2 ring-white dark:ring-slate-900"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </h3>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${getBadgeStyle(
                            preset.badgeType
                          )}`}
                        >
                          {preset.badge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.desc}
                      </p>

                      {/* Bottom Spec Pills / Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          {preset.radiusTag}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          {preset.shadowTag}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          {preset.paletteTag}
                        </span>
                      </div>

                      {isSelected && (
                        <div
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900"
                          style={{ backgroundColor: preset.hex }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WARNA & PALET */}
          {activeTab === 'COLORS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  <span>Kustomisasi Warna Bebas &amp; Palet</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pilih dari koleksi warna kurasi atau masukkan kode HEX apa saja untuk identitas gereja Anda.
                </p>
              </div>

              {/* Hex Input & Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="relative w-12 h-12 rounded-2xl shadow-sm border-2 border-white dark:border-slate-700 overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={activeColorHex}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: activeColorHex }}
                    />
                  </label>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kode Hex Tema
                    </label>
                    <input
                      type="text"
                      value={activeColorHex}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#059669"
                      className="mt-0.5 px-3 py-1 font-mono font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Luminansi Kontras</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      isColorLight(activeColorHex)
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isColorLight(activeColorHex) ? 'Terang (Teks Gelap)' : 'Gelap (Teks Putih)'}
                  </span>
                </div>
              </div>

              {/* Quick Swatches Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Palet Cepat Populer
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {QUICK_SWATCHES.map((swatch) => {
                    const isSelected = activeColorHex.toUpperCase() === swatch.hex.toUpperCase();
                    return (
                      <button
                        key={swatch.hex}
                        onClick={() => handleColorChange(swatch.hex)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full shadow-2xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                          {swatch.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BENTUK & GAYA KARTU */}
          {activeTab === 'CARDS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <span>Gaya Kartu &amp; Kerapatan Tata Letak</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Atur kedalaman permukaan (elevation), jarak dalam (padding), dan aksen garis tepi.
                </p>
              </div>

              {/* Gaya Permukaan Kartu */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gaya Permukaan Kartu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'SOLID', label: 'Solid Bersih', desc: 'Putih bersih standar' },
                    { id: 'GLASS', label: 'Glassmorphic', desc: 'Kaca buram modern' },
                    { id: 'NEON', label: 'Bercahaya', desc: 'Aksen bayangan pendar' },
                    { id: 'FLAT', label: 'Flat Minimal', desc: 'Tanpa bayangan (flat)' }
                  ].map((style) => {
                    const isSelected = (form.card_style || 'SOLID') === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => applyChange({ ...form, card_style: style.id as any })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-extrabold text-xs block">{style.label}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                          {style.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jarak & Kerapatan (Padding) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kerapatan Kartu (Padding)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'COMPACT', label: 'Kompak (Padat)' },
                    { id: 'NORMAL', label: 'Normal (Seimbang)' },
                    { id: 'SPACIOUS', label: 'Lega (Spacious)' }
                  ].map((size) => {
                    const isSelected = (form.card_size || 'NORMAL') === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => applyChange({ ...form, card_size: size.id as any })}
                        className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LATAR BELAKANG & NAVBAR */}
          {activeTab === 'LAYOUT' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-purple-500" />
                  <span>Latar Belakang Sistem &amp; Bilah Atas (Navbar)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pilih kanvas utama latar belakang dan gaya bilah navigasi atas.
                </p>
              </div>

              {/* Base Background Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preset Kanvas Latar Belakang
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'EMERALD_LIGHT', label: '🌿 Emerald Light', bg: 'bg-[#f4fbf9]' },
                    { id: 'LUXE_LIGHT', label: '☀️ Minimalist Light', bg: 'bg-slate-50' },
                    { id: 'DARK_SLATE', label: '🌌 Dark Slate', bg: 'bg-slate-950' },
                    { id: 'MIDNIGHT_BLUE', label: '💙 Midnight Blue', bg: 'bg-[#030712]' },
                    { id: 'WARM_GOLD', label: '⚜️ Warm Gold', bg: 'bg-[#140c03]' }
                  ].map((p) => {
                    const isSelected = (form.theme_preset || 'EMERALD_LIGHT') === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => applyChange({ ...form, theme_preset: p.id as any })}
                        className={`p-3 rounded-2xl border text-left font-bold text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-purple-500 shadow-xs ring-2 ring-purple-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BILAH BAWAH (BOTTOMNAV) */}
          {activeTab === 'BOTTOM_NAV' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-500" />
                  <span>Pengaturan Bilah Navigasi Bawah (Mobile)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sesuaikan tampilan bilah navigasi 5 tombol saat aplikasi diakses lewat handphone / smartphone.
                </p>
              </div>

              {/* Gaya Tombol Ikon */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bentuk Sorotan Tombol Aktif
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'SUBTLE', label: 'Kotak Halus' },
                    { id: 'PILL', label: 'Pil (Pill)' },
                    { id: 'CIRCLE', label: 'Lingkaran' }
                  ].map((shape) => {
                    const isSelected = (form.footer_icon_bg_style || 'SUBTLE') === shape.id;
                    return (
                      <button
                        key={shape.id}
                        onClick={() =>
                          applyChange({ ...form, footer_icon_bg_style: shape.id as any })
                        }
                        className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-500 text-teal-950 dark:text-teal-100 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {shape.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN: PRATINJAU LAYAR PENUH & ULTRA-REALISTIC SMARTPHONE MOCKUP === */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          {/* Header of Preview Panel */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Pratinjau Layar Penuh</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Status Badge */}
              <div className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Terkunci &amp; Live</span>
              </div>

              {/* Device Toggle Switch */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  onClick={() => setPreviewDevice('DESKTOP')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'DESKTOP'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('MOBILE')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'MOBILE'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          {previewDevice === 'MOBILE' ? (
            /* === ULTRA-REALISTIC HANDPHONE / SMARTPHONE MOCKUP === */
            <div className="flex justify-center py-2">
              {/* Outer Phone Shell / Bezel */}
              <div className="w-[320px] xs:w-[340px] sm:w-[350px] bg-slate-950 border-[9px] border-slate-900 rounded-[44px] shadow-2xl relative ring-1 ring-slate-800/80 p-1">
                {/* Dynamic Island / Camera Notch */}
                <div className="w-24 h-4 bg-black rounded-full mx-auto my-1 flex items-center justify-center gap-1.5 z-20 relative">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="w-8 h-1 bg-slate-900/60 rounded-full" />
                </div>

                {/* Inner Screen Area */}
                <div
                  className="rounded-[34px] overflow-hidden flex flex-col justify-between select-none min-h-[520px] transition-colors"
                  style={{
                    backgroundColor: isThemeLight ? '#f4fbf9' : '#090d16',
                    color: isThemeLight ? '#0f172a' : '#f8fafc'
                  }}
                >
                  {/* Phone Top Content */}
                  <div className="space-y-2.5 p-3">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono font-medium">
                      <span>09:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px]">5G</span>
                        <div className="w-4 h-2 rounded-xs border border-current p-0.5 flex items-center">
                          <div className="w-full h-full bg-emerald-500 rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="flex items-center justify-between pt-0.5 px-0.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] shadow-2xs font-bold"
                          style={{ backgroundColor: activeColorHex }}
                        >
                          <Church className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-[11px] tracking-tight">
                          CMS GEREJA
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>

                    {/* Greeting Banner with Custom Color Gradient */}
                    <div
                      className="p-3 rounded-2xl text-white shadow-xs flex items-center justify-between"
                      style={{
                        background: `linear-gradient(135deg, ${activeColorHex}, ${activeColorHex}dd)`
                      }}
                    >
                      <div>
                        <span className="text-[9px] opacity-80 block font-medium">
                          Selamat Datang,
                        </span>
                        <span className="font-black text-xs block tracking-tight">
                          Portal Jemaat
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold backdrop-blur-xs">
                        Kustom
                      </span>
                    </div>

                    {/* Institution Identity Card */}
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 text-xs shadow-2xs"
                          style={{ backgroundColor: activeColorHex }}
                        >
                          <Church className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                            {churchName}
                          </h4>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                            Portal Jemaat &amp; Manajemen Gereja
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[9px] shrink-0">
                        Aktif
                      </span>
                    </div>

                    {/* 2 Stat Metric Widgets */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">
                          Total Jemaat
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                          1,248
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">
                          Kehadiran Ibadah
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          98.4%
                        </span>
                      </div>
                    </div>

                    {/* Interactive Action Buttons Sample */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        className="px-4 py-1.5 rounded-full text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95"
                        style={{ backgroundColor: activeColorHex }}
                      >
                        Tombol Utama
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold border transition-transform active:scale-95"
                        style={{
                          borderColor: `${activeColorHex}60`,
                          color: activeColorHex,
                          backgroundColor: `${activeColorHex}15`
                        }}
                      >
                        Aksen
                      </button>
                    </div>
                  </div>

                  {/* Phone Bottom: BottomNav & Home Swipe Bar */}
                  <div className="pt-2">
                    {/* Realistic 5-Icon BottomNav */}
                    <div className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around text-[9px] font-bold">
                      {/* 1. Beranda (Active) */}
                      <div
                        className="flex flex-col items-center gap-0.5 p-1 rounded-xl text-white shadow-2xs cursor-pointer"
                        style={{ backgroundColor: activeColorHex }}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-extrabold px-1">Beranda</span>
                      </div>

                      {/* 2. Warta */}
                      <div className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-[8px]">Warta</span>
                      </div>

                      {/* 3. Jadwal */}
                      <div className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[8px]">Jadwal</span>
                      </div>

                      {/* 4. Notifikasi with Red Count Badge */}
                      <div className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 cursor-pointer relative">
                        <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold text-[7px] flex items-center justify-center">
                          57
                        </span>
                        <Bell className="w-3.5 h-3.5" />
                        <span className="text-[8px]">Notifikasi</span>
                      </div>

                      {/* 5. Menu */}
                      <div className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                        <Menu className="w-3.5 h-3.5" />
                        <span className="text-[8px]">Menu</span>
                      </div>
                    </div>

                    {/* Bottom Home Swipe Bar */}
                    <div className="bg-white/95 dark:bg-slate-900/95 pb-1">
                      <div className="w-24 h-1 bg-slate-400/50 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* === DESKTOP BROWSER MOCKUP === */
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-md">
              {/* Browser Header Bar */}
              <div className="p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] text-slate-500 font-mono flex-1 truncate">
                  https://gereja-app.id/dashboard
                </span>
              </div>

              {/* Miniature Desktop UI */}
              <div className="flex h-72">
                {/* Mini Sidebar */}
                <div className="w-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-2 space-y-2">
                  <div
                    className="w-full h-5 rounded-md text-white text-[8px] font-black flex items-center justify-center"
                    style={{ backgroundColor: activeColorHex }}
                  >
                    CMS
                  </div>
                  <div className="space-y-1 pt-1">
                    <div
                      className="w-full h-3.5 rounded text-[8px] font-bold px-1 flex items-center text-white"
                      style={{ backgroundColor: activeColorHex }}
                    >
                      Beranda
                    </div>
                    <div className="w-full h-3.5 rounded text-[8px] text-slate-400 px-1 flex items-center">
                      Jemaat
                    </div>
                    <div className="w-full h-3.5 rounded text-[8px] text-slate-400 px-1 flex items-center">
                      Kas
                    </div>
                  </div>
                </div>

                {/* Mini Dashboard Content */}
                <div className="flex-1 p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto">
                  <div
                    className="p-2 rounded-xl text-white flex justify-between items-center text-[10px]"
                    style={{ backgroundColor: activeColorHex }}
                  >
                    <span className="font-extrabold">{churchName}</span>
                    <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-white/20">Aktif</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block">Jemaat</span>
                      <span className="text-xs font-black">1,248</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block">Kehadiran</span>
                      <span className="text-xs font-black text-emerald-600">98.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Status Spec Line at Bottom (Matching pratinjau.png) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium gap-2">
            <div>
              <span className="text-slate-400">Preset: </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {DESIGN_PRESETS.find((p) => p.id === selectedPresetId)?.name || 'Kustom'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">Warna: </span>
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: activeColorHex }}
              />
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                {activeColorHex}
              </span>
            </div>

            <div>
              <span className="text-slate-400">Gaya: </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {form.card_style || 'SOLID'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
