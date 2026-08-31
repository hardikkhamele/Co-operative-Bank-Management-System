import axiosInstance from './axiosConfig';

export const merchantService = {
  // 1. List Merchants (with stats, deleted filter, search & multi-filters)
  list: async (params) => {
    const response = await axiosInstance.get('/v1/society/merchants', { params });
    return response.data;
  },

  // Backward compatibility alias
  getMerchants: async (params) => {
    const response = await axiosInstance.get('/v1/society/merchants', { params });
    return response.data;
  },

  // 2. Active Merchants Dropdown List
  getDropdown: async () => {
    const response = await axiosInstance.get('/v1/society/merchants/dropdown');
    return response.data;
  },

  getMerchantDropdown: async () => {
    const response = await axiosInstance.get('/v1/society/merchants/dropdown');
    return response.data;
  },

  // 3. Get detailed merchant profile
  getById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/merchants/${id}`);
    return response.data;
  },

  getMerchantDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/society/merchants/${id}`);
    return response.data;
  },

  // 4. Register new Merchant Partner
  create: async (formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const response = await axiosInstance.post('/v1/society/merchants', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  createMerchant: async (formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const response = await axiosInstance.post('/v1/society/merchants', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // 5. Update Merchant profile details and document files
  update: async (id, formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const response = await axiosInstance.put(`/v1/society/merchants/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  updateMerchant: async (id, formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const response = await axiosInstance.put(`/v1/society/merchants/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // 6. Soft delete merchant partner account
  softDelete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/merchants/${id}`);
    return response.data;
  },

  deleteMerchant: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/merchants/${id}`);
    return response.data;
  },

  // 7. Restore soft-deleted merchant partner account
  restore: async (id) => {
    const response = await axiosInstance.patch(`/v1/society/merchants/${id}/restore`);
    return response.data;
  },

  // 8. Permanently (hard) delete merchant account from MongoDB
  permanentDelete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/merchants/${id}/permanent`);
    return response.data;
  }
};
