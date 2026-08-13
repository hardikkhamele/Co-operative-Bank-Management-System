import axiosInstance from './axiosConfig';

export const merchantService = {
  getMerchants: async (params) => {
    // params: { page, limit, search, status, sortBy, sortOrder }
    const response = await axiosInstance.get('/v1/society/merchant', { params });
    return response.data;
  },

  getMerchantDropdown: async () => {
    const response = await axiosInstance.get('/v1/society/merchant/dropdown');
    return response.data;
  },

  createMerchant: async (formData) => {
    const response = await axiosInstance.post('/v1/society/merchant', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMerchantDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/society/merchant/${id}`);
    return response.data;
  },

  updateMerchant: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/society/merchant/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteMerchant: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/merchant/${id}`);
    return response.data;
  }
};
