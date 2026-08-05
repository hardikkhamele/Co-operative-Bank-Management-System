import axiosInstance from './axiosConfig';

export const debitReceiptService = {
  /**
   * 2.1 Export Debit Receipts
   * GET /v1/society/debit-receipts/export?search=...&status=...&dateFrom=...&dateTo=...
   */
  exportCsv: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/debit-receipts/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2.2 List Debit Receipts
   * GET /v1/society/debit-receipts?page=1&limit=8&search=...&status=...
   */
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/debit-receipts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2.3 Create Debit Receipt
   * POST /v1/society/debit-receipts
   * @param {Object} data - { name, glHead, glHeadName, accountNumber, date, status }
   */
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/debit-receipts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2.4 Get Debit Receipt Details
   * GET /v1/society/debit-receipts/:id
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/debit-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2.5 Update Debit Receipt
   * PUT /v1/society/debit-receipts/:id
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/debit-receipts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2.6 Delete Debit Receipt
   * DELETE /v1/society/debit-receipts/:id
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/debit-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
