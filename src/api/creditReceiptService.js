import axiosInstance from './axiosConfig';

export const creditReceiptService = {

  getLocations: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/credit-receipts/locations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1.1 Export Credit Receipts
   * GET /v1/society/credit-receipts/export?search=...&status=...&dateFrom=...&dateTo=...
   * @param {Object} params - Filter parameters
   */
  exportCsv: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/credit-receipts/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1.2 List Credit Receipts
   * GET /v1/society/credit-receipts?page=1&limit=8&search=...&status=...
   * @param {Object} params - Query parameters (page, limit, search, status, dateFrom, dateTo)
   */
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/credit-receipts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1.3 Create Credit Receipt
   * POST /v1/society/credit-receipts
   * @param {Object} data - { name, glHead, glHeadName, accountNumber, date, status }
   */
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/credit-receipts', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1.4 Get Credit Receipt Details
   * GET /v1/society/credit-receipts/:id
   * @param {string|number} id - Receipt ID
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/credit-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1.5 Update Credit Receipt
   * PUT /v1/society/credit-receipts/:id
   * @param {string|number} id - Receipt ID
   * @param {Object} data - Fields to update (e.g. { status: 'APPROVED' })
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/credit-receipts/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1.6 Delete Credit Receipt
   * DELETE /v1/society/credit-receipts/:id
   * @param {string|number} id - Receipt ID
   */
  
  /**
   * Approve Receipt
   * PUT /v1/society/credit-receipts/:id/approve
   * @param {string|number} id - Receipt ID
   */
  approve: async (id) => {
    try {
      const response = await axiosInstance.put(`/v1/society/credit-receipts/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reject Receipt
   * PUT /v1/society/credit-receipts/:id/reject
   * @param {string|number} id - Receipt ID
   * @param {string} rejectionReason - Reason for rejection
   */
  reject: async (id, rejectionReason) => {
    try {
      const response = await axiosInstance.put(`/v1/society/credit-receipts/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/credit-receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
