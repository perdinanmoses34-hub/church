import React from 'react';
import { NavTab } from './Sidebar';
import { User, AppSettings } from '../types';
import { LayoutDashboard, Users, CalendarDays, BookOpen, MoreHorizontal, UserCheck } from 'lucide-react';
import { getFooterTheme } from '../utils/themeHelper';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser?: User | null;
  onOpenMobileMenu: () => void;
  settings?: AppSettings;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenMobileMenu,
  settings
}) => {
  const isJemaat = (currentUser?.role || 'JEMAAT') === 'JEMAAT';
  const footerTheme = getFooterTheme(settings);

  return (
    <div
      id="app-bottom-nav-footer"
      className={footerTheme.containerClass}
      style={footerTheme.containerStyle}
    >
      {/* 1. HOME */}
      <button
        id="bottom-nav-btn-home"
        onClick={() => onSelectTab('dashboard')}
        style={footerTheme.getItemStyle(activeTab === 'dashboard')}
        className={footerTheme.getItemClass(activeTab === 'dashboard')}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </button>

      {/* 2. RENUNGAN */}
      <button
        id="bottom-nav-btn-renungan"
        onClick={() => onSelectTab('renungan')}
        style={footerTheme.getItemStyle(activeTab === 'renungan')}
        className={footerTheme.getItemClass(activeTab === 'renungan')}
      >
        <BookOpen className="w-5 h-5" />
        <span>Renungan</span>
      </button>

      {/* 3. JADWAL */}
      <button
        id="bottom-nav-btn-jadwal"
        onClick={() => onSelectTab('jadwal')}
        style={footerTheme.getItemStyle(activeTab === 'jadwal' || activeTab === 'agenda')}
        className={footerTheme.getItemClass(activeTab === 'jadwal' || activeTab === 'agenda')}
      >
        <CalendarDays className="w-5 h-5" />
        <span>Jadwal</span>
      </button>

      {/* 4. PROFIL (for Jemaat) or JEMAAT (for Admin/SuperAdmin) */}
      {isJemaat ? (
        <button
          id="bottom-nav-btn-profil"
          onClick={() => onSelectTab('jemaat_portal')}
          style={footerTheme.getItemStyle(activeTab === 'jemaat_portal')}
          className={footerTheme.getItemClass(activeTab === 'jemaat_portal')}
        >
          <UserCheck className="w-5 h-5" />
          <span>Profil</span>
        </button>
      ) : (
        <button
          id="bottom-nav-btn-jemaat"
          onClick={() => onSelectTab('jemaat')}
          style={footerTheme.getItemStyle(activeTab === 'jemaat')}
          className={footerTheme.getItemClass(activeTab === 'jemaat')}
        >
          <Users className="w-5 h-5" />
          <span>Jemaat</span>
        </button>
      )}

      {/* 5. LAINNYA */}
      <button
        id="bottom-nav-btn-lainnya"
        onClick={() => onSelectTab('lainnya')}
        style={footerTheme.getItemStyle(activeTab === 'lainnya')}
        className={footerTheme.getItemClass(activeTab === 'lainnya')}
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>Lainnya</span>
      </button>
    </div>
  );
};
