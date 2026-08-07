import axiosInstance from './axiosConfig';

export const cardCreditService = {
  // 1. Get Bank Wallet Dashboard (wallet metrics, recent purchases, recent transfers)
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/cards-credit/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Initiate Purchase (EMI Cards / Verification Credits / Both)
  initiatePurchase: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/cards-credit/purchase', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Check Payment Status by Order ID
  checkPaymentStatus: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/v1/society/cards-credit/payment-status/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Get Overall Credit Movement History (Audit logs for PURCHASE, ALLOCATION, DEDUCTION)
  getCreditHistory: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/cards-credit/history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Transfer / Allocate Stock to Branch
  transferStock: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/cards-credit/transfer', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 6. Get Transfer History (Bank to Branches)
  getTransferHistory: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/cards-credit/transfer-history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 7. Get Purchase History (Orders, transactions, invoices)
  getPurchaseHistory: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/cards-credit/purchase-history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 8. Get Branch-Specific Wallet Details
  getBranchWallet: async (branchId) => {
    try {
      const response = await axiosInstance.get(`/v1/society/cards-credit/branch-wallet/${branchId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 9. Consume Credit / Stock (Branch level usage during loan issuance / verification)
  consumeCredit: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/cards-credit/consume', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default cardCreditService;
