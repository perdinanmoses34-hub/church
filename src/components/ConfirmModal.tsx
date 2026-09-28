import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { setConfirmListener, ConfirmOptions } from '../utils/confirmDialog';

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export const ConfirmModal: React.FC = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    setConfirmListener((state) => {
      setDialog(state);
    });

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setDialog({
          isOpen: true,
          title: customEvent.detail.title,
          message: customEvent.detail.message,
          confirmText: customEvent.detail.confirmText,
          cancelText: customEvent.detail.cancelText,
          isDanger: customEvent.detail.isDanger,
          resolve: customEvent.detail.resolve,
        });
      }
    };

    window.addEventListener('app_custom_confirm', handleCustomEvent);

    return () => {
      setConfirmListener(null);
      window.removeEventListener('app_custom_confirm', handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    if (!dialog?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialog.resolve(false);
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

  const isDanger = dialog.isDanger !== false;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Top-Right */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Tutup dialog"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3.5 rounded-2xl shrink-0 ${
              isDanger
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDanger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1 pr-4">
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
              {dialog.title || 'Konfirmasi Tindakan'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
              {dialog.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-800"
          >
            {dialog.cancelText || 'Batal'}
          </button>
          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {dialog.confirmText || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};
