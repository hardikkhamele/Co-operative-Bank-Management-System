import axiosInstance from './axiosConfig';

/**
 * Systemic Investment Plan (SIP) Module API Service
 * Connects to Advita-Backend REST endpoints under /v1/sip (resolved to /api/v1/sip via axios baseURL)
 */
export const sipService = {
  /**
   * 3.1 Create SIP Scheme
   * Bank Owner defines a new daily SIP product with interest rate tiers and duration plans.
   * POST /api/v1/sip/schemes
   * @param {Object} data - Scheme creation payload
   */
  createScheme: async (data) => {
    const response = await axiosInstance.post('/v1/sip/schemes', data);
    return response.data;
  },

  /**
   * 3.2 Get All Active SIP Schemes
   * List all active SIP products for customer mobile display and branch agent offerings.
   * GET /api/v1/sip/schemes
   * @param {Object} params - Query parameters
   */
  getSchemes: async (params = {}) => {
    const response = await axiosInstance.get('/v1/sip/schemes', { params });
    return response.data;
  },

  /**
   * 3.3 Get SIP Scheme By ID
   * Fetch comprehensive scheme terms, duration tiers (1, 3, 6, 12 months), and investment limits.
   * GET /api/v1/sip/schemes/:id
   * @param {string} id - Scheme ObjectId
   */
  getSchemeById: async (id) => {
    const response = await axiosInstance.get(`/v1/sip/schemes/${id}`);
    return response.data;
  },

  /**
   * 3.4 Update SIP Scheme
   * Bank Owner modifies allowed investment amounts, interest rates, or custom ranges for an existing scheme.
   * PUT /api/v1/sip/schemes/:id
   * @param {string} id - Scheme ObjectId
   * @param {Object} data - Update payload
   */
  updateScheme: async (id, data) => {
    const response = await axiosInstance.put(`/v1/sip/schemes/${id}`, data);
    return response.data;
  },

  /**
   * 3.5 Update SIP Scheme Status
   * Bank Owner toggles scheme availability between ACTIVE and INACTIVE.
   * PATCH /api/v1/sip/schemes/:id/status
   * @param {string} id - Scheme ObjectId
   * @param {string} status - "ACTIVE" | "INACTIVE"
   */
  updateSchemeStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/v1/sip/schemes/${id}/status`, { status });
    return response.data;
  },

  /**
   * 4.1 Create Customer SIP (Bank Staff / Bank Owner)
   * Bank employee subscribes a customer to a daily SIP plan after checking active bank account & KYC.
   * POST /api/v1/sip/bank
   * @param {Object} data - { customerId, accountId, schemeId, branchId, frequency, durationMonths, amount }
   */
  createBankSip: async (data) => {
    const response = await axiosInstance.post('/v1/sip/bank', data);
    return response.data;
  },

  /**
   * 5.1 Get My SIP Subscriptions (Customer Portfolio View)
   * Customer / staff portfolio view of subscribed SIP accounts.
   * GET /api/v1/sip/my-sips
   */
  getMySips: async (params = {}) => {
    const response = await axiosInstance.get('/v1/sip/my-sips', { params });
    return response.data;
  },

  /**
   * 5.2 Get SIP Subscription By ID
   * Fetch detailed progress, next due date, maturity amount, and total invested amount.
   * GET /api/v1/sip/:id
   * @param {string} id - Subscription ObjectId
   */
  getSipById: async (id) => {
    const response = await axiosInstance.get(`/v1/sip/${id}`);
    return response.data;
  }
};

export default sipService;
