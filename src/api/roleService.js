import axiosInstance from './axiosConfig';

export const roleService = {
  // 1. Get Available System Permissions
  getPermissions: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Create Society Role
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/roles', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. List Bank Roles
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/roles', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Get Single Role Details
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Update Role Capabilities
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/roles/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 6. Delete Role
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
