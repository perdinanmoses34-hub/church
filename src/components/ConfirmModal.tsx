import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Info, X } from 'lucide-react';
import { setConfirmListener, ConfirmOptions } from '../utils/confirmDialog';
import { StorageManager } from '../utils/storage';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export const ConfirmModal: React.FC = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [settings, setSettings] = useState(() => StorageManager.getSettings());

  useEffect(() => {
    // Keep settings in sync with current active tenant / church configuration
    const updateSettings = () => {
      setSettings(StorageManager.getSettings());
    };

    setConfirmListener((state) => {
      if (state) {
        updateSettings();
      }
      setDialog(state);
    });

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        updateSettings();
        setDialog({
          isOpen: true,
          title: customEvent.detail.title,
          message: customEvent.detail.message,
          confirmText: customEvent.detail.confirmText,
          cancelText: customEvent.detail.cancelText,
          isDanger: customEvent.detail.isDanger,
          churchName: customEvent.detail.churchName,
          mode: customEvent.detail.mode,
          type: customEvent.detail.type,
          resolve: customEvent.detail.resolve,
        });
      }
    };

    window.addEventListener('app_custom_confirm', handleCustomEvent);
    window.addEventListener('cms_data_changed', updateSettings);

    return () => {
      setConfirmListener(null);
      window.removeEventListener('app_custom_confirm', handleCustomEvent);
      window.removeEventListener('cms_data_changed', updateSettings);
    };
  }, []);

  useEffect(() => {
    if (!dialog?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialog.resolve(false);
        setDialog(null);
      } else if (e.key === 'Enter') {
        dialog.resolve(true);
        setDialog(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  if (!dialog || !dialog.isOpen) return null;

  const handleConfirm = () => {
    dialog.resolve(true);
    setDialog(null);
  };

  const handleCancel = () => {
    dialog.resolve(false);
    setDialog(null);
  };

  const isAlertMode = dialog.mode === 'alert' || !dialog.cancelText;
  const isDanger = dialog.isDanger !== false;
  const churchName =
    dialog.churchName ||
    (settings?.nama_gereja && settings.nama_gereja.trim() !== '' && settings.nama_gereja !== 'Gereja Baru'
      ? settings.nama_gereja
      : 'Monapa Puriala');

  const churchLogo = settings?.logo || DEFAULT_CHURCH_LOGO;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-800"
      onClick={isAlertMode ? handleConfirm : handleCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white border border-teal-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Registered Church Identity */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
              <img
                src={churchLogo}
                alt="Logo Gereja"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                }}
                className="w-full h-full object-cover rounded-[8px]"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-teal-900 tracking-tight truncate leading-tight">
                {churchName}
              </h4>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">
                Sistem Informasi Gereja
              </p>
            </div>
          </div>

          {/* Close button on top-right */}
          <button
            type="button"
            onClick={isAlertMode ? handleConfirm : handleCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup dialog"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3.5 pt-1">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isDanger
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : dialog.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-teal-50 text-teal-600 border border-teal-200'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : dialog.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : dialog.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug">
              {dialog.title || (isAlertMode ? 'Pemberitahuan Sistem' : 'Konfirmasi Tindakan')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
              {dialog.message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          {!isAlertMode && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {dialog.cancelText || 'Batal'}
            </button>
          )}

          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-600/25'
            }`}
          >
            {dialog.confirmText || (isAlertMode ? 'OKE' : 'Ya, Lanjutkan')}
          </button>
        </div>
      </div>
    </div>
  );
};
