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
    try {
      const response = await axiosInstance.patch(`/v1/society/merchants/${id}/restore`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        const fallbackRes = await axiosInstance.put(`/v1/society/merchants/${id}/restore`);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  restoreMerchant: async (id) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/merchants/${id}/restore`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        const fallbackRes = await axiosInstance.put(`/v1/society/merchants/${id}/restore`);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  // 8. Permanently (hard) delete merchant account from MongoDB
  permanentDelete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/merchants/${id}/permanent`);
    return response.data;
  },

  // 9. Approve Merchant Onboarding (Branch Owner / Manager)
  approve: async (id) => {
    const payload = { merchantId: id };
    // Try PATCH /v1/society/merchants/:id/approve -> POST -> PUT -> /v1/society/merchants/approve
    try {
      const response = await axiosInstance.patch(`/v1/society/merchants/${id}/approve`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const postRes = await axiosInstance.post(`/v1/society/merchants/${id}/approve`, payload);
          return postRes.data;
        } catch (postErr) {
          if (postErr.response?.status === 404 || postErr.response?.status === 405) {
            try {
              const putRes = await axiosInstance.put(`/v1/society/merchants/${id}/approve`, payload);
              return putRes.data;
            } catch (putErr) {
              if (putErr.response?.status === 404) {
                // Fallback to /v1/society/merchants/approve
                const rootPost = await axiosInstance.post('/v1/society/merchants/approve', payload);
                return rootPost.data;
              }
              throw putErr;
            }
          }
          throw postErr;
        }
      }
      throw err;
    }
  },

  approveMerchant: async (id) => {
    return merchantService.approve(id);
  },

  // 10. Reject Merchant Onboarding (Branch Owner / Manager)
  reject: async (id, reason) => {
    const payload = { 
      merchantId: id,
      reason: typeof reason === 'string' ? reason.trim() : ''
    };

    // Try PATCH /v1/society/merchants/:id/reject -> POST -> PUT -> /v1/society/merchants/reject
    try {
      const response = await axiosInstance.patch(`/v1/society/merchants/${id}/reject`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const postRes = await axiosInstance.post(`/v1/society/merchants/${id}/reject`, payload);
          return postRes.data;
        } catch (postErr) {
          if (postErr.response?.status === 404 || postErr.response?.status === 405) {
            try {
              const putRes = await axiosInstance.put(`/v1/society/merchants/${id}/reject`, payload);
              return putRes.data;
            } catch (putErr) {
              if (putErr.response?.status === 404) {
                // Fallback to /v1/society/merchants/reject
                const rootPost = await axiosInstance.post('/v1/society/merchants/reject', payload);
                return rootPost.data;
              }
              throw putErr;
            }
          }
          throw postErr;
        }
      }
      throw err;
    }
  },

  rejectMerchant: async (id, reason) => {
    return merchantService.reject(id, reason);
  }
};
