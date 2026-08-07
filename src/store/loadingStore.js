import { create } from 'zustand';

let autoResetTimer = null;

const useLoadingStore = create((set, get) => ({
  requestCount: 0,
  isLoading: false,

  showLoader: () => {
    // Clear any previous auto-reset timer
    if (autoResetTimer) clearTimeout(autoResetTimer);

    set((state) => {
      const newCount = state.requestCount + 1;
      return { requestCount: newCount, isLoading: true };
    });

    // Safety timeout: auto-reset loader after 6 seconds to prevent stuck UI
    autoResetTimer = setTimeout(() => {
      if (get().isLoading) {
        console.warn('GlobalLoader safety auto-reset triggered');
        get().resetLoader();
      }
    }, 6000);
  },

  hideLoader: () => {
    set((state) => {
      const newCount = Math.max(0, state.requestCount - 1);
      if (newCount === 0 && autoResetTimer) {
        clearTimeout(autoResetTimer);
      }
      return { requestCount: newCount, isLoading: newCount > 0 };
    });
  },

  resetLoader: () => {
    if (autoResetTimer) clearTimeout(autoResetTimer);
    set({ requestCount: 0, isLoading: false });
  }
}));

export default useLoadingStore;
