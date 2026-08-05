import axiosInstance from './axiosConfig';

export const transferReceiptService = {
  /**
   * 3.1 Export Transfer Receipts
   * GET /v1/society/transfer-receipts/export?dateFrom=...&dateTo=...
   */
  exportCsv: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/transfer-receipts/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3.2 List Transfer Receipts
   * GET /v1/society/transfer-receipts?page=1&limit=8&search=...&status=...
   */
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/transfer-receipts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3.3 Create Transfer Receipt
   * POST /v1/society/transfer-receipts
   * @param {Object} data - { name, glHead, glHeadName, accountNumber, date, status }
   */
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/transfer-receipts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3.4 Get Transfer Receipt Details
   * GET /v1/society/transfer-receipts/:id
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/transfer-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3.5 Update Transfer Receipt
   * PUT /v1/society/transfer-receipts/:id
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/transfer-receipts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3.6 Delete Transfer Receipt
   * DELETE /v1/society/transfer-receipts/:id
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/transfer-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
