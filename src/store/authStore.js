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
        // Unpack whether data is the root response, response.data, or pre-merged
        const inner = (data?.data && typeof data.data === 'object' && !data.data.role) ? data.data : {};
        const payload = { ...inner, ...(data || {}) };

        const accessToken = 
          payload?.tokens?.accessToken || 
          payload?.accessToken || 
          payload?.token || 
          data?.tokens?.accessToken || 
          data?.accessToken || 
          data?.token || 
          null;

        const refreshToken = 
          payload?.tokens?.refreshToken || 
          payload?.refreshToken || 
          data?.tokens?.refreshToken || 
          data?.refreshToken || 
          null;
        
        const user = payload?.user || data?.user || payload?.data?.user || null;

        // Robustly extract role from:
        // 1. data.role: { id: null, name: "Bank Owner" }
        // 2. payload.role: { id: null, name: "Bank Owner" }
        // 3. user.role: { id: null, name: "Bank Owner" }
        // 4. payload.data.role / data.data.role
        const rawRole = 
          payload?.role || 
          data?.role || 
          payload?.data?.role || 
          data?.data?.role || 
          user?.role || 
          payload?.userRole || 
          null;

        // Normalize role to an object with both name and code for bulletproof compatibility
        let role = null;
        if (typeof rawRole === 'string') {
          role = {
            id: null,
            name: rawRole,
            code: rawRole.toUpperCase().replace(/\s+/g, '_')
          };
        } else if (rawRole && typeof rawRole === 'object') {
          const name = rawRole.name || rawRole.code || rawRole.roleName || rawRole.title || 'Bank Owner';
          const code = rawRole.code || name.toUpperCase().replace(/\s+/g, '_');
          role = {
            ...rawRole,
            name,
            code
          };
        } else if (user?.designation) {
          role = {
            id: null,
            name: user.designation,
            code: user.designation.toUpperCase().replace(/\s+/g, '_')
          };
        }

        let permissions = [];
        if (Array.isArray(payload?.permissions) && payload.permissions.length > 0) {
          permissions = payload.permissions;
        } else if (Array.isArray(data?.permissions) && data.permissions.length > 0) {
          permissions = data.permissions;
        } else if (Array.isArray(user?.permissions) && user.permissions.length > 0) {
          permissions = user.permissions;
        } else if (Array.isArray(role?.permissions) && role.permissions.length > 0) {
          permissions = role.permissions;
        }

        set({ 
          user, 
          context: payload?.context || data?.context || null,
          role,
          permissions,
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
      
      logout: () => {
        try {
          localStorage.removeItem('branch-storage');
        } catch {}
        set({ 
          user: null, 
          context: null,
          role: null,
          permissions: [],
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage', // unique name
    }
  )
);

export default useAuthStore;
