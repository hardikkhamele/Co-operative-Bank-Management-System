import axiosInstance from './axiosConfig';

export const cashPaymentService = {
  /**
   * 1. List Cash Payments
   * GET /v1/society/cash-payment?page=1&limit=10&search=
   * @param {Object} params - { page, limit, search }
   */
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/cash-payment', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2. Get Cash Payment Details
   * GET /v1/society/cash-payment/:employeeId?page=1&limit=10&fromDate=&toDate=
   * @param {string} employeeId
   * @param {Object} params - { page, limit, fromDate, toDate }
   */
  getDetails: async (employeeId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/v1/society/cash-payment/${employeeId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3. Submit Cash
   * POST /v1/society/cash-payment/:employeeId
   * @param {string} employeeId
   * @param {Object} data - { date, amountSubmitted, remarks }
   */
  submitCash: async (employeeId, data) => {
    try {
      const response = await axiosInstance.post(`/v1/society/cash-payment/${employeeId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default cashPaymentService;
