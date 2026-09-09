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
  getById: async (id, params = {}) => {
    // Attempt 1: Plural endpoint with includeDeleted support
    try {
      const response = await axiosInstance.get(`/v1/society/merchants/${id}`, {
        params: { includeDeleted: true, ...params }
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 405) {
        // Attempt 2: Singular endpoint /v1/society/merchant/:id
        try {
          const singularRes = await axiosInstance.get(`/v1/society/merchant/${id}`, {
            params: { includeDeleted: true, ...params }
          });
          return singularRes.data;
        } catch (singularErr) {
          // Attempt 3: Retrieve via list with includeDeleted=true and locate matching record
          try {
            const listRes = await axiosInstance.get('/v1/society/merchants', {
              params: { includeDeleted: true, limit: 100 }
            });
            const payload = listRes.data?.data || listRes.data;
            const items = Array.isArray(payload) 
              ? payload 
              : (payload?.merchants || payload?.items || payload?.data || []);
            if (Array.isArray(items)) {
              const matched = items.find(m => 
                String(m._id || m.id || m.merchantId) === String(id)
              );
              if (matched) {
                return { success: true, data: matched };
              }
            }
          } catch (listErr) {
            // Silently ignore list lookup failure and throw original error
          }
        }
      }
      throw err;
    }
  },

  getMerchantDetails: async (id, params) => {
    return merchantService.getById(id, params);
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

  // 4b. Dedicated Link Society Bank Account Details (Uses /api/v1/society/pigmy-customers/:id/society-account)
  linkSocietyAccount: async (id, bankData = {}) => {
    const payload = {
      pigmyCustomerId: id,
      merchantId: id,
      societyAccountNumber: String(bankData.societyAccountNumber || bankData.accountNumber || '').trim(),
      ifscCode: bankData.ifscCode ? String(bankData.ifscCode).toUpperCase().trim() : undefined,
      accountHolderName: bankData.accountHolderName ? String(bankData.accountHolderName).trim() : undefined,
      bankBranchName: String(bankData.bankBranchName || bankData.branchName || '').trim() || undefined,
      pincode: bankData.pincode ? String(bankData.pincode).trim() : undefined,
      // Compatibility aliases
      accountNumber: String(bankData.accountNumber || bankData.societyAccountNumber || '').trim(),
      bankName: String(bankData.bankName || 'Co-operative Bank').trim(),
      branchName: String(bankData.branchName || bankData.bankBranchName || '').trim(),
      accountType: bankData.accountType || 'CURRENT',
    };

    // Primary: POST /api/v1/society/pigmy-customers/:id/society-account
    try {
      const response = await axiosInstance.post(`/v1/society/pigmy-customers/${id}/society-account`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback 1: POST /api/v1/society/pigmy-customers/society-account
        try {
          const fallbackRes = await axiosInstance.post('/v1/society/pigmy-customers/society-account', payload);
          return fallbackRes.data;
        } catch (fbErr) {
          if (fbErr.response?.status === 404) {
            // Fallback 2: POST /api/v1/society/merchants/:id/society-account or /link-bank
            try {
              const merchRes = await axiosInstance.post(`/v1/society/merchants/${id}/society-account`, payload);
              return merchRes.data;
            } catch (merchErr) {
              if (merchErr.response?.status === 404 || merchErr.response?.status === 405) {
                const aliasRes = await axiosInstance.post(`/v1/society/merchants/${id}/link-bank`, payload);
                return aliasRes.data;
              }
              throw merchErr;
            }
          }
          throw fbErr;
        }
      }
      throw err;
    }
  },

  linkBank: async (id, bankData) => {
    return merchantService.linkSocietyAccount(id, bankData);
  },

  // 5. Update Merchant profile details, document files, and bank details
  // Note: societyAccount cannot be updated via this endpoint
  update: async (id, formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    let dataToSend = formData;
    if (isFormData) {
      formData.delete('societyAccount');
      formData.delete('societyAccountNumber');
    } else if (formData && typeof formData === 'object') {
      const { societyAccount, societyAccountNumber, ...rest } = formData;
      dataToSend = rest;
    }
    const response = await axiosInstance.put(`/v1/society/merchants/${id}`, dataToSend, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  updateMerchant: async (id, formData) => {
    return merchantService.update(id, formData);
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
