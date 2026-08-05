import axiosInstance from './axiosConfig';

export const contraReceiptService = {
  /**
   * 4.1 Export Contra Receipts
   * GET /v1/society/contra-receipts/export?search=...&status=...&dateFrom=...&dateTo=...
   */
  exportCsv: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/contra-receipts/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 4.2 List Contra Receipts
   * GET /v1/society/contra-receipts?page=1&limit=8&search=...&status=...
   */
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/contra-receipts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 4.3 Create Contra Receipt
   * POST /v1/society/contra-receipts
   * @param {Object} data - { name, glHead, glHeadName, accountNumber, date, status }
   */
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/contra-receipts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 4.4 Get Contra Receipt Details
   * GET /v1/society/contra-receipts/:id
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/contra-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 4.5 Update Contra Receipt
   * PUT /v1/society/contra-receipts/:id
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/contra-receipts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 4.6 Delete Contra Receipt
   * DELETE /v1/society/contra-receipts/:id
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/contra-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
