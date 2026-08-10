import axiosInstance from './axiosConfig';

export const leadService = {
  // 1. List Leads
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/leads', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Export Leads as CSV
  export: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/leads/export', {
        params,
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 3. Get Lead Details by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/leads/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Delete Lead (Soft Delete)
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/leads/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Get Lead Loan Details / Metadata (Employee Loan Endpoint)
  getLoanDetails: async (loanId) => {
    try {
      const response = await axiosInstance.get(`/v1/employee/loans/${loanId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 6. Check Eligible EMI Slabs
  getEligibleSlabs: async (productPrice) => {
    try {
      const response = await axiosInstance.get('/v1/employee/loans/slabs', {
        params: { productPrice },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 7. Preview / Calculate EMI Breakdown
  calculateEmiBreakdown: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/employee/loans/calculate', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 8. Add Repayment Bank Account (Mandate Setup - API 14)
  addRepaymentBankAccount: async (leadId, data) => {
    try {
      const response = await axiosInstance.post(`/v1/employee/loans/${leadId}/bank-account`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 9. Request Disbursal Authorization OTP (API 15)
  sendDisbursalOtp: async (leadId) => {
    try {
      const response = await axiosInstance.post(`/v1/employee/loans/${leadId}/send-disbursal-otp`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 10. Submit Disbursal OTP & Digital Signature (Setup EMI - API 16)
  setupEmi: async (leadId, data) => {
    try {
      const response = await axiosInstance.post(`/v1/employee/loans/${leadId}/setup-emi`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default leadService;
