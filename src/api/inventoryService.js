import axiosInstance from './axiosConfig';

export const inventoryService = {
  // 1. List Inventory Items
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/inventory', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Export Inventory as CSV
  export: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/inventory/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Create Inventory Item
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/inventory', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Update Inventory Item
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/inventory/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Delete Inventory Item
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default inventoryService;
