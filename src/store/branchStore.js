import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { branchService } from '../api/branchService';

const useBranchStore = create(
  persist(
    (set) => ({
      globalBranchId: '',
      branchOptions: [],
      isLoading: false,
      
      setGlobalBranchId: (id) => set({ globalBranchId: id }),
      
      fetchBranches: async () => {
        set({ isLoading: true });
        try {
          let list = [];
          try {
            const res = await branchService.getDropdownList();
            if (res && res.success && Array.isArray(res.data)) {
              list = res.data;
            }
          } catch (e) {
            console.warn("Dropdown endpoint failed, attempting fallback list...", e);
          }

          if (list.length === 0) {
            const fallbackRes = await branchService.list({ limit: 100 });
            if (fallbackRes && fallbackRes.success) {
              list = Array.isArray(fallbackRes.data)
                ? fallbackRes.data
                : fallbackRes.data?.items || fallbackRes.data?.branches || [];
            }
          }

          set({ branchOptions: list, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch branches for global store", error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'branch-storage', // unique name for localStorage
      partialize: (state) => ({ globalBranchId: state.globalBranchId }), // only persist the selected branch
    }
  )
);

export default useBranchStore;
