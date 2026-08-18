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
          const res = await branchService.getDropdownList();
          if (res && res.success) {
            set({ branchOptions: res.data || [], isLoading: false });
          } else {
            set({ isLoading: false });
          }
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
