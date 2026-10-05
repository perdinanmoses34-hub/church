import { StorageManager } from './storage';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  churchName?: string;
  mode?: 'confirm' | 'alert';
  type?: 'info' | 'success' | 'warning' | 'danger';
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export type ConfirmListener = (state: ConfirmState | null) => void;

let currentListener: ConfirmListener | null = null;

export const setConfirmListener = (listener: ConfirmListener | null) => {
  currentListener = listener;
};

/**
 * Returns current registered church name from settings
 */
export const getRegisteredChurchName = (): string => {
  try {
    const s = StorageManager.getSettings();
    if (s && s.nama_gereja && s.nama_gereja.trim() !== '' && s.nama_gereja !== 'Gereja Baru') {
      return s.nama_gereja.trim();
    }
  } catch (e) {
    // fallback
  }
  return 'Monapa Puriala';
};

/**
 * Custom modern confirmation dialog that replaces native window.confirm().
 * Always displays the registered church name in the header.
 * Completely eliminates browser headers like "perdinanmoses34-hub.github.io menyatakan:"
 * for a 100% professional user experience.
 */
export const confirmDialog = (options: ConfirmOptions | string): Promise<boolean> => {
  const registeredName = getRegisteredChurchName();
  const opts: ConfirmOptions =
    typeof options === 'string'
      ? {
          title: 'Konfirmasi Hapus File',
          message: options,
          confirmText: 'Ya, Hapus',
          cancelText: 'Batal',
          isDanger: true,
          churchName: registeredName,
          mode: 'confirm',
        }
      : {
          title: options.title || 'Konfirmasi Tindakan',
          message: options.message,
          confirmText: options.confirmText || 'Ya, Lanjutkan',
          cancelText: options.cancelText !== undefined ? options.cancelText : 'Batal',
          isDanger: options.isDanger !== false,
          churchName: options.churchName || registeredName,
          mode: options.mode || 'confirm',
          type: options.type,
        };

  return new Promise<boolean>((resolve) => {
    if (currentListener) {
      currentListener({
        ...opts,
        isOpen: true,
        resolve: (result: boolean) => {
          if (currentListener) currentListener(null);
          resolve(result);
        },
      });
    } else {
      // Fallback if modal listener not mounted yet
      window.dispatchEvent(
        new CustomEvent('app_custom_confirm', {
          detail: {
            ...opts,
            resolve,
          },
        })
      );
    }
  });
};

/**
 * Custom modern alert dialog that replaces native window.alert().
 * Always shows the registered church name with an "OKE" button.
 */
export const alertDialog = (
  options:
    | {
        title?: string;
        message: string;
        confirmText?: string;
        type?: 'info' | 'success' | 'warning' | 'danger';
        churchName?: string;
      }
    | string
): Promise<boolean> => {
  const registeredName = getRegisteredChurchName();
  const opts = typeof options === 'string' ? { message: options } : options;
  return confirmDialog({
    title: opts.title || 'Pemberitahuan Sistem',
    message: opts.message,
    confirmText: opts.confirmText || 'OKE',
    cancelText: '', // Empty cancelText signifies single-button alert mode
    isDanger: opts.type === 'danger',
    churchName: opts.churchName || registeredName,
    mode: 'alert',
    type: opts.type || 'info',
  });
};

// Global intercept for window.alert to guarantee no native dialog ever appears
if (typeof window !== 'undefined') {
  (window as any).alert = (message?: any) => {
    alertDialog({
      title: 'Pemberitahuan Sistem',
      message: String(message ?? ''),
      confirmText: 'OKE',
    });
  };
}
