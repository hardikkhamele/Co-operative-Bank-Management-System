import axiosInstance from './axiosConfig';

export const dashboardService = {
  // 1. Fetch Society Dashboard Stats Cards
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Fetch Total Revenue Monthly Comparison Chart
  getRevenueChart: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/dashboard/revenue-chart', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Fetch Loan Distributed Category Chart
  getLoanDistributedChart: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/dashboard/loan-distributed-chart', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Fetch Services Sales Contribution Stats
  getServicesStats: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/dashboard/services-stats', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dashboardService;
