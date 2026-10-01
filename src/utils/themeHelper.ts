import React, { CSSProperties } from 'react';
import { AppSettings } from '../types';

export interface NavbarThemeStyles {
  containerClass: string;
  containerStyle: CSSProperties;
  textClass: string;
  titleClass: string;
  subtextClass: string;
  titleStyle?: CSSProperties;
  subtextStyle?: CSSProperties;
  isLight: boolean;
  pillClass: string;
  pillBorderClass: string;
  iconBtnClass: string;
  iconBtnStyle: CSSProperties;
  badgeClass: string;
  borderBottomClass: string;
  borderBottomStyle: CSSProperties;
  menuBtnStyle: CSSProperties;
  searchBoxClass: string;
  searchBoxStyle: CSSProperties;
}

export interface ButtonIconThemeStyles {
  preset: string;
  iconBg: string;
  iconColor: string;
  shapeClass: string;
  shadowClass: string;
  borderClass: string;
  borderStyle: CSSProperties;
  getIconStyle: (fallbackBg?: string, fallbackColor?: string) => CSSProperties;
  getIconContainerClass: (extraClasses?: string) => string;
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

  // Gradient options
  const gradTo = (settings?.navbar_gradient_to || (isColorLight(hex) ? '#f1f5f9' : '#040d1a')).trim();
  const gradToHex = gradTo.startsWith('#') ? gradTo : `#${gradTo}`;
  const gradDir = settings?.navbar_gradient_dir || 'to-r';
  const gradientCssDir = gradDir === '135deg' ? '135deg' : gradDir.replace('to-', 'to ');

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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, ${churchHex}, ${gradToHex})` };
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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #0f2452, ${gradToHex === '#f1f5f9' ? '#060c1d' : gradToHex})` };
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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #270942, ${gradToHex === '#f1f5f9' ? '#0c0316' : gradToHex})` };
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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #07381d, ${gradToHex === '#f1f5f9' ? '#021209' : gradToHex})` };
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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #420a17, ${gradToHex === '#f1f5f9' ? '#140206' : gradToHex})` };
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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #3d2703, ${gradToHex === '#f1f5f9' ? '#120b01' : gradToHex})` };
      } else {
        containerClass = 'bg-[#1c1202]/90 backdrop-blur-xl border-b';
      }
      break;
    }
    case 'PURE_BLACK': {
      isLight = false;
      if (style === 'GRADIENT') {
        containerClass = 'border-b border-white/10 text-white';
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #000000, ${gradToHex === '#f1f5f9' ? '#111827' : gradToHex})` };
      } else {
        containerClass = 'bg-black/95 backdrop-blur-xl border-b border-white/10 text-white';
      }
      break;
    }
    case 'CLEAN_LIGHT': {
      isLight = true;
      if (style === 'SOLID') {
        containerClass = 'bg-white border-b shadow-xs';
        containerStyle = { backgroundColor: '#ffffff' };
      } else if (style === 'GRADIENT') {
        containerClass = 'border-b shadow-xs';
        containerStyle = { background: `linear-gradient(${gradientCssDir}, #ffffff, ${gradToHex})` };
      } else {
        containerClass = 'bg-white/95 backdrop-blur-xl border-b shadow-xs';
        containerStyle = { backgroundColor: '#fffffffa' };
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
        containerStyle = { background: `linear-gradient(${gradientCssDir}, ${hex}, ${gradToHex})` };
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
        containerClass = 'bg-white/95 border-slate-200 shadow-xs backdrop-blur-xl border-b';
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
  if (customTextChoice === 'GOLD') isLight = false;

  // Custom text color styling if specified
  let titleStyle: CSSProperties | undefined = undefined;
  let subtextStyle: CSSProperties | undefined = undefined;
  if (customTextChoice === 'CUSTOM' && settings?.navbar_custom_text_color) {
    const txtColor = settings.navbar_custom_text_color.trim();
    const txtHex = txtColor.startsWith('#') ? txtColor : `#${txtColor}`;
    titleStyle = { color: txtHex };
    subtextStyle = { color: `${txtHex}bb` };
    isLight = isColorLight(txtHex) ? false : true;
  } else if (customTextChoice === 'GOLD') {
    titleStyle = { color: '#fbbf24' };
    subtextStyle = { color: '#fef3c7' };
  }

  // Border bottom styling
  let borderBottomClass = 'border-white/10';
  let borderBottomStyle: CSSProperties = {};
  if (isLight) {
    borderBottomClass = 'border-slate-200/90';
  }

  if (borderAccent === 'THEME_COLOR') {
    borderBottomClass = 'border-b-2';
    borderBottomStyle = { borderBottomColor: churchHex };
  } else if (borderAccent === 'GLOW') {
    borderBottomClass = isLight
      ? 'border-b border-emerald-400/50 shadow-md shadow-emerald-500/10'
      : 'border-b border-indigo-400/40 shadow-lg shadow-indigo-500/20';
  } else if (borderAccent === 'CUSTOM' && settings?.navbar_border_color) {
    const bColor = settings.navbar_border_color.trim();
    const bHex = bColor.startsWith('#') ? bColor : `#${bColor}`;
    const bWidth = settings.navbar_border_width ? parseInt(settings.navbar_border_width, 10) : 2;
    borderBottomClass = 'border-b';
    borderBottomStyle = {
      borderBottomColor: bHex,
      borderBottomWidth: `${bWidth}px`,
      borderBottomStyle: 'solid'
    };
  } else if (borderAccent === 'NONE') {
    borderBottomClass = 'border-b-0';
  }

  // Text & UI elements classes
  const textClass = isLight ? 'text-slate-800' : 'text-slate-100';
  const titleClass = isLight ? 'text-slate-900' : 'text-white';
  const subtextClass = isLight ? 'text-slate-500' : 'text-slate-300';
  const pillClass = isLight
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : 'bg-white/10 text-emerald-300 border-white/15';
  const pillBorderClass = isLight ? 'border-emerald-200' : 'border-white/10';

  // Navbar Button Icon Customization
  const iconShape = settings?.navbar_icon_shape || 'ROUNDED';
  let iconShapeClass = 'rounded-xl';
  if (iconShape === 'CIRCLE') iconShapeClass = 'rounded-full';
  else if (iconShape === 'PILL') iconShapeClass = 'rounded-full px-3';
  else if (iconShape === 'SQUARE') iconShapeClass = 'rounded-lg';

  const iconBgPreset = settings?.navbar_icon_bg_preset || (settings?.navbar_icon_bg ? 'CUSTOM_HEX' : 'SUBTLE');
  let iconBtnClass = `${iconShapeClass} transition-all cursor-pointer`;
  let iconBtnStyle: CSSProperties = {};

  if (iconBgPreset === 'CUSTOM_HEX' && settings?.navbar_icon_bg) {
    const bg = settings.navbar_icon_bg.trim();
    iconBtnStyle.backgroundColor = bg.startsWith('#') ? bg : `#${bg}`;
    if (settings?.navbar_icon_color) {
      const c = settings.navbar_icon_color.trim();
      iconBtnStyle.color = c.startsWith('#') ? c : `#${c}`;
    } else {
      iconBtnStyle.color = isColorLight(iconBtnStyle.backgroundColor) ? '#0f172a' : '#ffffff';
    }
    if (settings?.navbar_icon_border) {
      iconBtnClass += ' border border-black/10 dark:border-white/20';
    }
  } else if (iconBgPreset === 'MATCH_THEME') {
    iconBtnStyle.backgroundColor = `${churchHex}20`;
    iconBtnStyle.color = churchHex;
    iconBtnClass += ' border border-current/30 hover:opacity-90';
  } else if (iconBgPreset === 'SOLID') {
    iconBtnStyle.backgroundColor = isLight ? '#0f172a' : '#ffffff';
    iconBtnStyle.color = isLight ? '#ffffff' : '#0f172a';
    iconBtnClass += ' shadow-xs';
  } else if (iconBgPreset === 'NONE') {
    iconBtnClass += isLight
      ? ' text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
      : ' text-slate-200 hover:text-white hover:bg-white/10';
  } else {
    // SUBTLE
    iconBtnClass += isLight
      ? ' text-slate-700 hover:text-emerald-700 bg-slate-100/90 hover:bg-emerald-50 border border-slate-200/80 shadow-2xs'
      : ' text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 shadow-2xs';
  }

  if (settings?.navbar_icon_color && !iconBtnStyle.color) {
    const c = settings.navbar_icon_color.trim();
    iconBtnStyle.color = c.startsWith('#') ? c : `#${c}`;
  }

  const badgeClass = isLight
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  const menuBtnStyle: CSSProperties = {
    backgroundColor: churchHex,
    color: isColorLight(churchHex) ? '#0f172a' : '#ffffff'
  };

  const searchBoxClass = isLight
    ? 'bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 text-slate-600 placeholder-slate-400'
    : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white placeholder-slate-300';
  const searchBoxStyle: CSSProperties = {};

  return {
    containerClass,
    containerStyle,
    textClass,
    titleClass,
    subtextClass,
    titleStyle,
    subtextStyle,
    isLight,
    pillClass,
    pillBorderClass,
    iconBtnClass,
    iconBtnStyle,
    badgeClass,
    borderBottomClass,
    borderBottomStyle,
    menuBtnStyle,
    searchBoxClass,
    searchBoxStyle
  };
};

export const getButtonIconTheme = (settings?: AppSettings): ButtonIconThemeStyles => {
  const preset = settings?.button_icon_preset || 'MATCH_THEME';
  const churchHex = (settings?.warna_tema || '#059669').trim().startsWith('#')
    ? (settings?.warna_tema || '#059669').trim()
    : `#${(settings?.warna_tema || '#059669').trim()}`;
  const customBg = settings?.button_icon_bg?.trim();
  const customColor = settings?.button_icon_color?.trim();
  const shape = settings?.button_icon_shape || 'ROUNDED_XL';
  const shadow = settings?.button_icon_shadow || 'SOFT';
  const hasBorder = settings?.button_icon_border ?? false;
  const borderColor = settings?.button_icon_border_color?.trim();

  let shapeClass = 'rounded-2xl';
  if (shape === 'CIRCLE') shapeClass = 'rounded-full';
  else if (shape === 'SQUARE') shapeClass = 'rounded-lg';
  else if (shape === 'PILL') shapeClass = 'rounded-full px-3';
  else shapeClass = 'rounded-2xl';

  let shadowClass = 'shadow-md';
  if (shadow === 'NONE') shadowClass = 'shadow-none';
  else if (shadow === 'GLOW') shadowClass = 'shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30';
  else if (shadow === 'DEEP') shadowClass = 'shadow-xl shadow-slate-900/30';

  let borderClass = hasBorder ? 'border' : 'border border-transparent';
  let borderStyle: CSSProperties = {};
  if (hasBorder && borderColor) {
    borderStyle.borderColor = borderColor.startsWith('#') ? borderColor : `#${borderColor}`;
  }

  const getIconStyle = (fallbackBg?: string, fallbackColor?: string): CSSProperties => {
    const styleObj: CSSProperties = { ...borderStyle };

    if (preset === 'CUSTOM_HEX' && customBg) {
      styleObj.backgroundColor = customBg.startsWith('#') ? customBg : `#${customBg}`;
    } else if (preset === 'MATCH_THEME') {
      styleObj.backgroundColor = churchHex;
    } else if (preset === 'GRADIENT') {
      styleObj.background = `linear-gradient(135deg, ${churchHex}, #0d9488)`;
    } else if (preset === 'SOLID') {
      styleObj.backgroundColor = customBg || churchHex;
    } else if (preset === 'GLASS') {
      styleObj.backgroundColor = `${churchHex}22`;
      styleObj.backdropFilter = 'blur(8px)';
      styleObj.border = `1px solid ${churchHex}44`;
    } else if (fallbackBg) {
      // DEFAULT_COLORFUL or fallback
      styleObj.backgroundColor = fallbackBg.startsWith('#') ? fallbackBg : fallbackBg;
    } else {
      styleObj.backgroundColor = churchHex;
    }

    if (customColor) {
      styleObj.color = customColor.startsWith('#') ? customColor : `#${customColor}`;
    } else if (preset === 'GLASS') {
      styleObj.color = churchHex;
    } else if (fallbackColor) {
      styleObj.color = fallbackColor;
    } else {
      const bgHex = typeof styleObj.backgroundColor === 'string' && styleObj.backgroundColor.startsWith('#')
        ? styleObj.backgroundColor
        : churchHex;
      styleObj.color = isColorLight(bgHex) ? '#0f172a' : '#ffffff';
    }

    return styleObj;
  };

  const getIconContainerClass = (extraClasses: string = ''): string => {
    return `${shapeClass} ${shadowClass} ${borderClass} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${extraClasses}`.trim();
  };

  return {
    preset,
    iconBg: customBg || churchHex,
    iconColor: customColor || '#ffffff',
    shapeClass,
    shadowClass,
    borderClass,
    borderStyle,
    getIconStyle,
    getIconContainerClass
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
  buttonIcon: ButtonIconThemeStyles;
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
    navbar: getNavbarTheme(settings),
    buttonIcon: getButtonIconTheme(settings)
  };
};
