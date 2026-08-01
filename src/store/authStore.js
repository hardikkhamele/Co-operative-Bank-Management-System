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
      
      login: (data) => set({ 
        user: data.user, 
        context: data.context,
        role: data.role,
        permissions: data.permissions || [],
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        isAuthenticated: true 
      }),
      
      setTokens: (tokens) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }),
      
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
