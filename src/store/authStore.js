import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      context: null,
      role: null,
      permissions: [],
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: (data) => {
        const accessToken = data?.tokens?.accessToken || data?.accessToken || data?.token || null;
        const refreshToken = data?.tokens?.refreshToken || data?.refreshToken || null;
        set({ 
          user: data?.user || null, 
          context: data?.context || null,
          role: data?.role || null,
          permissions: data?.permissions || [],
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken 
        });
      },
      
      setUser: (user) => set({ user }),

      updateUser: (updatedFields) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updatedFields } : updatedFields 
      })),
      
      setTokens: (tokens) => {
        const accessToken = typeof tokens === 'string' ? tokens : (tokens?.accessToken || tokens?.tokens?.accessToken || tokens?.token);
        const refreshToken = typeof tokens === 'object' ? (tokens?.refreshToken || tokens?.tokens?.refreshToken || null) : null;
        set((state) => ({
          accessToken,
          refreshToken: refreshToken !== null ? refreshToken : state.refreshToken
        }));
      },
      
      logout: () => set({ 
        user: null, 
        context: null,
        role: null,
        permissions: [],
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // unique name
    }
  )
);

export default useAuthStore;
