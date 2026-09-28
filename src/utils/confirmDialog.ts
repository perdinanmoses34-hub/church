export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

type ConfirmListener = (state: ConfirmState | null) => void;

let currentListener: ConfirmListener | null = null;

export const setConfirmListener = (listener: ConfirmListener | null) => {
  currentListener = listener;
};

/**
 * Custom modern confirmation dialog that replaces native window.confirm().
 * Completely eliminates browser headers like "tntimbu.github.io menyatakan:"
 * for a 100% professional user experience.
 */
export const confirmDialog = (options: ConfirmOptions | string): Promise<boolean> => {
  const opts: ConfirmOptions =
    typeof options === 'string'
      ? {
          title: 'Konfirmasi Hapus',
          message: options,
          confirmText: 'Ya, Hapus',
          cancelText: 'Batal',
          isDanger: true,
        }
      : {
          title: options.title || 'Konfirmasi Tindakan',
          message: options.message,
          confirmText: options.confirmText || 'Ya, Lanjutkan',
          cancelText: options.cancelText || 'Batal',
          isDanger: options.isDanger !== false,
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
