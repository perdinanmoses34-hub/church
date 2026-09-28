import React, { CSSProperties } from 'react';
import { AppSettings } from '../types';

export interface NavbarThemeStyles {
  containerClass: string;
  containerStyle: CSSProperties;
  textClass: string;
  titleClass: string;
  subtextClass: string;
  isLight: boolean;
  pillClass: string;
  pillBorderClass: string;
  iconBtnClass: string;
  badgeClass: string;
  borderBottomClass: string;
  borderBottomStyle: CSSProperties;
  menuBtnStyle: CSSProperties;
}

export function isColorLight(hex?: string): boolean {
  if (!hex) return false;
  let clean = hex.trim().replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length < 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6;
}

export const getNavbarTheme = (settings?: AppSettings): NavbarThemeStyles => {
  const preset = settings?.navbar_theme_preset || 'CLEAN_LIGHT';
  const customBg = (settings?.navbar_custom_bg || settings?.warna_tema || '#ffffff').trim();
  const hex = customBg.startsWith('#') ? customBg : `#${customBg}`;
  const churchHex = (settings?.warna_tema || '#059669').trim().startsWith('#')
    ? (settings?.warna_tema || '#059669').trim()
    : `#${(settings?.warna_tema || '#059669').trim()}`;
  const style = settings?.navbar_style || 'GLASS';
  const borderAccent = settings?.navbar_border_accent || 'SUBTLE';
  const customTextChoice = settings?.navbar_custom_text || 'AUTO';

  let isLight = false;
  let containerClass = 'backdrop-blur-xl border-b';
  let containerStyle: CSSProperties = {};

  switch (preset) {
    case 'MATCH_THEME': {
      isLight = isColorLight(churchHex);
      if (style === 'SOLID') {
        containerClass = 'border-b';
        containerStyle = { backgroundColor: churchHex };
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: `linear-gradient(135deg, ${churchHex}, #090d16)` };
      } else {
        // GLASS
        containerClass = 'backdrop-blur-xl border-b';
        containerStyle = { backgroundColor: `${churchHex}e0` };
      }
      break;
    }
    case 'MIDNIGHT_BLUE': {
      isLight = false;
      if (style === 'SOLID') {
        containerClass = 'bg-[#060c1d] border-b';
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: 'linear-gradient(135deg, #0f2452, #060c1d 70%)' };
      } else {
        containerClass = 'bg-[#060c1d]/90 backdrop-blur-xl border-b';
      }
      break;
    }
    case 'DEEP_PURPLE': {
      isLight = false;
      if (style === 'SOLID') {
        containerClass = 'bg-[#120520] border-b';
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: 'linear-gradient(135deg, #270942, #0c0316 70%)' };
      } else {
        containerClass = 'bg-[#120520]/90 backdrop-blur-xl border-b';
      }
      break;
    }
    case 'EMERALD_GREEN': {
      isLight = false;
      if (style === 'SOLID') {
        containerClass = 'bg-[#031a0e] border-b';
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: 'linear-gradient(135deg, #07381d, #021209 70%)' };
      } else {
        containerClass = 'bg-[#031a0e]/90 backdrop-blur-xl border-b';
      }
      break;
    }
    case 'CRIMSON_RED': {
      isLight = false;
      if (style === 'SOLID') {
        containerClass = 'bg-[#20050b] border-b';
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: 'linear-gradient(135deg, #420a17, #140206 70%)' };
      } else {
        containerClass = 'bg-[#20050b]/90 backdrop-blur-xl border-b';
      }
      break;
    }
    case 'WARM_GOLD': {
      isLight = false;
      if (style === 'SOLID') {
        containerClass = 'bg-[#1c1202] border-b';
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: 'linear-gradient(135deg, #3d2703, #120b01 70%)' };
      } else {
        containerClass = 'bg-[#1c1202]/90 backdrop-blur-xl border-b';
      }
      break;
    }
    case 'PURE_BLACK': {
      isLight = false;
      containerClass = 'bg-black/95 backdrop-blur-xl border-b border-white/10 text-white';
      break;
    }
    case 'CLEAN_LIGHT': {
      isLight = true;
      if (style === 'SOLID') {
        containerClass = 'bg-white border-b shadow-sm';
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b shadow-sm';
        containerStyle = { background: 'linear-gradient(135deg, #ffffff, #f1f5f9 80%)' };
      } else {
        containerClass = 'bg-white/95 backdrop-blur-xl border-b shadow-sm';
      }
      break;
    }
    case 'CUSTOM_HEX': {
      isLight = isColorLight(hex);
      if (style === 'SOLID') {
        containerClass = 'border-b';
        containerStyle = { backgroundColor: hex };
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b';
        containerStyle = { background: `linear-gradient(135deg, ${hex}, #090d16)` };
      } else {
        // GLASS
        containerClass = 'backdrop-blur-xl border-b';
        containerStyle = { backgroundColor: `${hex}e6` };
      }
      break;
    }
    case 'DEFAULT_DARK':
    default: {
      const isSystemLight = settings?.theme_preset === 'LUXE_LIGHT' || settings?.theme_preset === 'EMERALD_LIGHT';
      if (isSystemLight) {
        isLight = true;
        containerClass = 'bg-white/95 border-slate-200 shadow-sm backdrop-blur-xl border-b';
      } else {
        isLight = false;
        containerClass = 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10';
      }
      break;
    }
  }

  // Override text lighting if explicitly chosen
  if (customTextChoice === 'WHITE') isLight = false;
  if (customTextChoice === 'DARK') isLight = true;

  // Border bottom styling
  let borderBottomClass = 'border-white/10';
  let borderBottomStyle: CSSProperties = {};
  if (isLight) {
    borderBottomClass = 'border-slate-200';
  }

  if (borderAccent === 'THEME_COLOR') {
    borderBottomClass = 'border-b-2';
    borderBottomStyle = { borderBottomColor: churchHex };
  } else if (borderAccent === 'GLOW') {
    borderBottomClass = 'border-b border-indigo-400/40 shadow-lg shadow-indigo-500/20';
  } else if (borderAccent === 'NONE') {
    borderBottomClass = 'border-b-0';
  }

  // Text & UI elements classes
  const textClass = isLight ? 'text-slate-800' : 'text-slate-100';
  const titleClass = isLight ? 'text-slate-900' : 'text-white';
  const subtextClass = isLight ? 'text-slate-500' : 'text-slate-400';
  const pillClass = isLight
    ? 'bg-emerald-50/90 text-emerald-950 border-emerald-200/80'
    : 'bg-white/5 text-indigo-300 border-white/10';
  const pillBorderClass = isLight ? 'border-emerald-200' : 'border-white/10';
  const iconBtnClass = isLight
    ? 'text-slate-600 hover:text-emerald-700 bg-slate-100/80 hover:bg-emerald-50 border-slate-200'
    : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10';
  const badgeClass = isLight
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';

  const menuBtnStyle: CSSProperties = {
    backgroundColor: churchHex
  };

  return {
    containerClass,
    containerStyle,
    textClass,
    titleClass,
    subtextClass,
    isLight,
    pillClass,
    pillBorderClass,
    iconBtnClass,
    badgeClass,
    borderBottomClass,
    borderBottomStyle,
    menuBtnStyle
  };
};

export interface FooterThemeStyles {
  containerClass: string;
  containerStyle: CSSProperties;
  isLight: boolean;
  getItemStyle: (isActive: boolean) => CSSProperties;
  getItemClass: (isActive: boolean) => string;
}

export const getFooterTheme = (settings?: AppSettings): FooterThemeStyles => {
  const preset = settings?.footer_theme_preset || 'CLEAN_LIGHT';
  const churchHex = (settings?.warna_tema || '#059669').trim().startsWith('#')
    ? (settings?.warna_tema || '#059669').trim()
    : `#${(settings?.warna_tema || '#059669').trim()}`;

  let baseBgHex = '#020617';
  if (preset === 'MATCH_THEME') {
    baseBgHex = churchHex;
  } else if (preset === 'MATCH_NAVBAR') {
    const navbarPreset = settings?.navbar_theme_preset || 'DEFAULT_DARK';
    if (navbarPreset === 'MATCH_THEME') baseBgHex = churchHex;
    else if (navbarPreset === 'CUSTOM_HEX') baseBgHex = (settings?.navbar_custom_bg || '#1e293b').trim();
    else if (navbarPreset === 'MIDNIGHT_BLUE') baseBgHex = '#060c1d';
    else if (navbarPreset === 'DEEP_PURPLE') baseBgHex = '#120520';
    else if (navbarPreset === 'EMERALD_GREEN') baseBgHex = '#031a0e';
    else if (navbarPreset === 'CRIMSON_RED') baseBgHex = '#20050b';
    else if (navbarPreset === 'WARM_GOLD') baseBgHex = '#1c1202';
    else if (navbarPreset === 'PURE_BLACK') baseBgHex = '#000000';
    else if (navbarPreset === 'CLEAN_LIGHT') baseBgHex = '#ffffff';
    else baseBgHex = '#020617';
  } else if (preset === 'CUSTOM_HEX') {
    const raw = (settings?.footer_custom_bg || '#020617').trim();
    baseBgHex = raw.startsWith('#') ? raw : `#${raw}`;
  } else if (preset === 'MIDNIGHT_BLUE') {
    baseBgHex = '#060c1d';
  } else if (preset === 'DEEP_PURPLE') {
    baseBgHex = '#120520';
  } else if (preset === 'EMERALD_GREEN') {
    baseBgHex = '#031a0e';
  } else if (preset === 'CRIMSON_RED') {
    baseBgHex = '#20050b';
  } else if (preset === 'WARM_GOLD') {
    baseBgHex = '#1c1202';
  } else if (preset === 'PURE_BLACK') {
    baseBgHex = '#000000';
  } else if (preset === 'CLEAN_LIGHT') {
    baseBgHex = '#ffffff';
  } else {
    baseBgHex = '#020617';
  }

  const isLight = isColorLight(baseBgHex);
  const style = settings?.footer_style || 'GLASS';
  const borderAccent = settings?.footer_border_accent || 'SUBTLE';
  const iconBgStyle = settings?.footer_icon_bg_style || 'SUBTLE';

  let containerClass = 'fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 py-2 flex items-center justify-around shadow-2xl transition-all';
  let containerStyle: CSSProperties = {};

  if (style === 'SOLID') {
    containerStyle.backgroundColor = baseBgHex;
  } else if (style === 'GRADIENT') {
    containerStyle.background = `linear-gradient(180deg, ${baseBgHex}ee, ${baseBgHex})`;
  } else {
    // GLASS
    containerClass += ' backdrop-blur-2xl';
    containerStyle.backgroundColor = baseBgHex.length === 7 ? `${baseBgHex}f0` : baseBgHex;
  }

  // Border top
  if (borderAccent === 'THEME_COLOR') {
    containerClass += ' border-t-2';
    containerStyle.borderTopColor = churchHex;
  } else if (borderAccent === 'GLOW') {
    containerClass += ' border-t border-indigo-400/40 shadow-[0_-4px_20px_rgba(99,102,241,0.25)]';
  } else if (borderAccent === 'NONE') {
    containerClass += ' border-t-0';
  } else {
    // SUBTLE
    containerClass += isLight ? ' border-t border-slate-200/80 shadow-md' : ' border-t border-white/10';
  }

  // Text color on footer
  containerClass += isLight ? ' text-slate-600' : ' text-slate-400';

  // Icon Button background & styling
  const activeBg = settings?.footer_icon_active_bg?.trim() || `${churchHex}25`;
  const activeText = settings?.footer_icon_active_text?.trim() || churchHex;
  const inactiveBg = settings?.footer_icon_custom_bg?.trim() || 'transparent';
  const inactiveText = settings?.footer_icon_inactive_text?.trim() || (isLight ? '#64748b' : '#94a3b8');

  const getItemStyle = (isActive: boolean): CSSProperties => {
    if (isActive) {
      return {
        backgroundColor: activeBg,
        color: activeText,
        borderColor: `${activeText}60`
      };
    }
    return {
      backgroundColor: inactiveBg,
      color: inactiveText,
      borderColor: inactiveBg !== 'transparent' ? `${inactiveText}20` : 'transparent'
    };
  };

  const getItemClass = (isActive: boolean): string => {
    let shapeClass = 'rounded-xl';
    if (iconBgStyle === 'PILL') shapeClass = 'rounded-full px-3 py-1.5';
    else if (iconBgStyle === 'CIRCLE') shapeClass = 'rounded-2xl px-2.5 py-1.5';
    else if (iconBgStyle === 'NONE') shapeClass = 'rounded-lg px-2 py-1';
    else shapeClass = 'rounded-xl px-2.5 py-1.5';

    const glowClass = isActive && iconBgStyle === 'GLOW' ? 'shadow-md shadow-emerald-500/30' : '';
    const activeStateClass = isActive
      ? `font-black scale-105 ${glowClass}`
      : isLight
      ? 'hover:text-emerald-700 opacity-80 hover:opacity-100'
      : 'hover:text-slate-200 opacity-80 hover:opacity-100';

    return `flex flex-col items-center gap-1 text-[10px] transition-all cursor-pointer border ${shapeClass} ${activeStateClass}`;
  };

  return {
    containerClass,
    containerStyle,
    isLight,
    getItemStyle,
    getItemClass
  };
};

export interface ThemeStyles {
  rootBg: string;
  cardBg: string;
  cardPadding: string;
  cardClass: string;
  cardBorderAccentClass?: string;
  accentGradient: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  accentRing: string;
  fontClass: string;
  isLight: boolean;
  customHexColor: string;
  customBgStyle: CSSProperties;
  customTextStyle: CSSProperties;
  customBorderStyle: CSSProperties;
  navbar: NavbarThemeStyles;
}

export const getThemeClasses = (settings?: AppSettings): ThemeStyles => {
  const preset = settings?.theme_preset || 'EMERALD_LIGHT';
  const accent = settings?.accent_color || 'EMERALD';
  const cardStyle = settings?.card_style || 'GLASS';
  const cardSize = settings?.card_size || 'NORMAL';
  const fontFam = settings?.font_family || 'SANS';
  const cardBorderAccent = settings?.card_border_accent || 'ACCENT_FULL';
  
  let rawHex = (settings?.warna_tema || '#00a859').trim();
  if (!rawHex.startsWith('#')) {
    rawHex = `#${rawHex}`;
  }
  const customHexColor = rawHex;

  // 1. Root Container Background
  let rootBg = 'bg-[#f0f5f2] text-slate-800';
  switch (preset) {
    case 'MIDNIGHT_BLUE':
      rootBg = 'bg-[#030712] text-slate-100';
      break;
    case 'DEEP_PURPLE':
      rootBg = 'bg-[#090514] text-purple-100';
      break;
    case 'FOREST_GREEN':
      rootBg = 'bg-[#04120a] text-emerald-100';
      break;
    case 'WARM_GOLD':
      rootBg = 'bg-[#140c03] text-amber-100';
      break;
    case 'LUXE_LIGHT':
      rootBg = 'bg-slate-100 text-slate-900';
      break;
    case 'DARK_SLATE':
      rootBg = 'bg-slate-950 text-slate-100';
      break;
    case 'EMERALD_LIGHT':
    default:
      rootBg = 'bg-[#f0f5f2] text-slate-800';
      break;
  }

  // 2. Card Background & Borders
  const isLightSystem = preset === 'LUXE_LIGHT' || preset === 'EMERALD_LIGHT';
  let cardBg = 'bg-white border border-slate-200/90 shadow-sm text-slate-900';
  if (isLightSystem) {
    switch (cardStyle) {
      case 'SOLID':
        cardBg = 'bg-white border border-slate-200/90 shadow-md text-slate-900';
        break;
      case 'NEON':
        cardBg = 'bg-white border-2 border-emerald-400 shadow-xl shadow-emerald-500/10 text-slate-900';
        break;
      case 'FLAT':
        cardBg = 'bg-slate-50 border border-slate-200/80 shadow-none text-slate-900';
        break;
      case 'GLASS':
      default:
        cardBg = 'bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm text-slate-900';
        break;
    }
  } else {
    switch (cardStyle) {
      case 'SOLID':
        cardBg = 'bg-slate-900 border border-slate-800 shadow-xl text-white';
        break;
      case 'NEON':
        cardBg = 'bg-slate-900/90 border-2 border-indigo-500/60 shadow-xl shadow-indigo-500/20 text-white';
        break;
      case 'FLAT':
        cardBg = 'bg-slate-900/40 border border-slate-800 shadow-none text-white';
        break;
      case 'GLASS':
      default:
        cardBg = 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white';
        break;
    }
  }

  // 3. Card Size / Padding
  let cardPadding = 'p-5 sm:p-6';
  if (cardSize === 'COMPACT') cardPadding = 'p-3.5 sm:p-4';
  if (cardSize === 'SPACIOUS') cardPadding = 'p-6 sm:p-8';

  // 4. Accent Gradient & Color Accents
  let accentGradient = 'from-indigo-600 to-blue-600';
  let accentText = 'text-indigo-400';
  let accentBorder = 'border-indigo-500';
  let accentBg = 'bg-indigo-600';
  let accentRing = 'ring-indigo-500/50';

  switch (accent) {
    case 'EMERALD':
      accentGradient = 'from-emerald-600 to-teal-600';
      accentText = 'text-emerald-400';
      accentBorder = 'border-emerald-500';
      accentBg = 'bg-emerald-600';
      accentRing = 'ring-emerald-500/50';
      break;
    case 'AMBER':
      accentGradient = 'from-amber-600 to-orange-600';
      accentText = 'text-amber-400';
      accentBorder = 'border-amber-500';
      accentBg = 'bg-amber-600';
      accentRing = 'ring-amber-500/50';
      break;
    case 'ROSE':
      accentGradient = 'from-rose-600 to-pink-600';
      accentText = 'text-rose-400';
      accentBorder = 'border-rose-500';
      accentBg = 'bg-rose-600';
      accentRing = 'ring-rose-500/50';
      break;
    case 'CYAN':
      accentGradient = 'from-cyan-600 to-blue-600';
      accentText = 'text-cyan-400';
      accentBorder = 'border-cyan-500';
      accentBg = 'bg-cyan-600';
      accentRing = 'ring-cyan-500/50';
      break;
    case 'PURPLE':
      accentGradient = 'from-purple-600 to-indigo-600';
      accentText = 'text-purple-400';
      accentBorder = 'border-purple-500';
      accentBg = 'bg-purple-600';
      accentRing = 'ring-purple-500/50';
      break;
    case 'ROYAL_GOLD':
      accentGradient = 'from-amber-500 via-amber-600 to-yellow-600';
      accentText = 'text-amber-400';
      accentBorder = 'border-amber-500';
      accentBg = 'bg-amber-600';
      accentRing = 'ring-amber-500/50';
      break;
  }

  // 5. Font Family
  let fontClass = 'font-sans';
  if (fontFam === 'SERIF') fontClass = 'font-serif';
  if (fontFam === 'MONO') fontClass = 'font-mono';

  let cardBorderAccentClass = 'border';
  switch (cardBorderAccent) {
    case 'ACCENT_LEFT':
      cardBorderAccentClass = 'border-l-4';
      break;
    case 'ACCENT_TOP':
      cardBorderAccentClass = 'border-t-4';
      break;
    case 'ACCENT_GLOW':
      cardBorderAccentClass = 'border shadow-lg';
      break;
    case 'ACCENT_FULL':
    default:
      cardBorderAccentClass = 'border';
      break;
  }

  return {
    rootBg,
    cardBg,
    cardPadding,
    cardClass: `${cardBg} ${cardPadding} ${cardBorderAccentClass}`,
    cardBorderAccentClass,
    accentGradient,
    accentText,
    accentBorder,
    accentBg,
    accentRing,
    fontClass,
    isLight: preset === 'LUXE_LIGHT' || preset === 'EMERALD_LIGHT',
    customHexColor,
    customBgStyle: { backgroundColor: customHexColor },
    customTextStyle: { color: customHexColor },
    customBorderStyle: { borderColor: customHexColor },
    navbar: getNavbarTheme(settings)
  };
};
