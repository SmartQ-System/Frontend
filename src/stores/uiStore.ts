import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

interface UiState {
  confirmModal: {
    isOpen: boolean;
    options: ConfirmOptions | null;
  };
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  confirmModal: {
    isOpen: false,
    options: null,
  },
  openConfirm: (options) =>
    set({
      confirmModal: {
        isOpen: true,
        options,
      },
    }),
  closeConfirm: () =>
    set({
      confirmModal: {
        isOpen: false,
        options: null,
      },
    }),
}));
