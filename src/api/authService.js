import axiosInstance from './axiosConfig';

export const authService = {
  // Society Login (Bank Owner, Branch Manager, Employee)
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/v1/society/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh JWT Session
  refresh: async (refreshToken) => {
    try {
      // Use standard axios to avoid interceptor loops if refresh fails
      const response = await axiosInstance.post('/v1/society/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await axiosInstance.post('/v1/society/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Profile & Society Context
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Available Roles
  getRoles: async (bankId = '') => {
    try {
      const url = bankId ? `/v1/society/auth/roles?bankId=${bankId}` : '/v1/society/auth/roles';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
