import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { branchService } from '../api/branchService';
import useAuthStore from './authStore';

const useBranchStore = create(
  persist(
    (set, get) => ({
      globalBranchId: '',
      branchOptions: [],
      isLoading: false,
      hasFetched: false,
      
      setGlobalBranchId: (id) => set({ globalBranchId: id }),

      resetBranchStore: () => {
        set({
          globalBranchId: '',
          branchOptions: [],
          isLoading: false,
          hasFetched: false,
        });
        try {
          localStorage.removeItem('branch-storage');
        } catch {}
      },
      
      fetchBranches: async (force = false) => {
        if (get().isLoading) return;
        if (get().hasFetched && !force) return;

        set({ isLoading: true });
        try {
          let list = [];
          try {
            const res = await branchService.getDropdownList();
            if (res && res.success && Array.isArray(res.data)) {
              list = res.data;
            } else if (Array.isArray(res)) {
              list = res;
            }
          } catch (e) {
            console.warn("Dropdown endpoint failed, attempting fallback list...", e);
          }

          if (list.length === 0) {
            const fallbackRes = await branchService.list({ limit: 100 });
            if (fallbackRes && fallbackRes.success) {
              list = Array.isArray(fallbackRes.data)
                ? fallbackRes.data
                : fallbackRes.data?.items || fallbackRes.data?.branches || fallbackRes.data?.data || [];
            } else if (Array.isArray(fallbackRes)) {
              list = fallbackRes;
            }
          }

          const currentSelected = get().globalBranchId;
          const branchExists = list.some(b => (b.id || b._id || b.branchId) === currentSelected);

          set({ 
            branchOptions: list, 
            isLoading: false, 
            hasFetched: true,
            globalBranchId: branchExists ? currentSelected : ''
          });
        } catch (error) {
          console.error("Failed to fetch branches for global store", error);
          set({ isLoading: false, hasFetched: true, branchOptions: [], globalBranchId: '' });
        }
      }
    }),
    {
      name: 'branch-storage', // unique name for localStorage
      partialize: (state) => ({ globalBranchId: state.globalBranchId }), // only persist the selected branch
    }
  )
);

// Automatically reset branch store when user logs out or switches accounts
useAuthStore.subscribe((state, prevState) => {
  const prevUserId = prevState?.user?.id || prevState?.user?._id;
  const currentUserId = state?.user?.id || state?.user?._id;
  if (!state.isAuthenticated || (prevUserId && currentUserId && prevUserId !== currentUserId)) {
    useBranchStore.getState().resetBranchStore();
  }
});

export default useBranchStore;
