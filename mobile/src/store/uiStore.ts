import { create } from "zustand";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface UIState {
  toasts: ToastItem[];
  isOffline: boolean;
  activeModal: string | null;

  showToast: (message: string, type?: ToastItem["type"]) => void;
  hideToast: (id: string) => void;
  setOffline: (status: boolean) => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isOffline: false,
  activeModal: null,

  showToast: (message: string, type = "info") => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  hideToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setOffline: (status: boolean) => set({ isOffline: status }),
  openModal: (modalName: string) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),
}));
