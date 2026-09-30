import React from 'react';
import { AppSettings } from '../types';
import { TemaTampilanView } from './views/TemaTampilanView';
import { X } from 'lucide-react';

interface NavbarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onNavigateToSettings?: () => void;
}

export const NavbarCustomizerModal: React.FC<NavbarCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-2xl overflow-y-auto my-auto p-3 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>
        <TemaTampilanView
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          isModalMode={true}
          onCloseModal={onClose}
        />
      </div>
    </div>
  );
};
