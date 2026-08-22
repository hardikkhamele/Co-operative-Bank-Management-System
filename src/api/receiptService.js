import axiosInstance from './axiosConfig';

export const creditReceiptService = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/v1/society/credit-receipts', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/credit-receipts/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axiosInstance.post('/v1/society/credit-receipts', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/credit-receipts/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/credit-receipts/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await axiosInstance.put(`/v1/society/credit-receipts/${id}/approve`);
    return response.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await axiosInstance.put(`/v1/society/credit-receipts/${id}/reject`, { rejectionReason });
    return response.data;
  },

  export: async (params) => {
    const response = await axiosInstance.get('/v1/society/credit-receipts/export', {
      params,
      responseType: 'blob', // Important for file download
    });
    return response;
  }
};

export const debitReceiptService = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/v1/society/debit-receipts', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/debit-receipts/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axiosInstance.post('/v1/society/debit-receipts', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/debit-receipts/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/debit-receipts/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await axiosInstance.put(`/v1/society/debit-receipts/${id}/approve`);
    return response.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await axiosInstance.put(`/v1/society/debit-receipts/${id}/reject`, { rejectionReason });
    return response.data;
  },

  export: async (params) => {
    const response = await axiosInstance.get('/v1/society/debit-receipts/export', {
      params,
      responseType: 'blob',
    });
    return response;
  }
};

export const transferReceiptService = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/v1/society/transfer-receipts', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/transfer-receipts/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axiosInstance.post('/v1/society/transfer-receipts', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/transfer-receipts/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/transfer-receipts/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await axiosInstance.put(`/v1/society/transfer-receipts/${id}/approve`);
    return response.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await axiosInstance.put(`/v1/society/transfer-receipts/${id}/reject`, { rejectionReason });
    return response.data;
  },

  export: async (params) => {
    const response = await axiosInstance.get('/v1/society/transfer-receipts/export', {
      params,
      responseType: 'blob',
    });
    return response;
  }
};

export const contraReceiptService = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/v1/society/contra-receipts', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/contra-receipts/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axiosInstance.post('/v1/society/contra-receipts', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/contra-receipts/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/contra-receipts/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await axiosInstance.put(`/v1/society/contra-receipts/${id}/approve`);
    return response.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await axiosInstance.put(`/v1/society/contra-receipts/${id}/reject`, { rejectionReason });
    return response.data;
  },

  export: async (params) => {
    const response = await axiosInstance.get('/v1/society/contra-receipts/export', {
      params,
      responseType: 'blob',
    });
    return response;
  }
};
