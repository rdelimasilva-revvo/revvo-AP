type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (type: ToastType, title: string, description?: string) => {
  window.dispatchEvent(new CustomEvent('global-toast', { detail: { type, title, description } }));
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('global-confirm', { detail: { message, resolve } }));
  });
};
