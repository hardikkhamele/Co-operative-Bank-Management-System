import axiosInstance from './axiosConfig';

export const verificationService = {
  /**
   * Check CIBIL / Experian Credit Score & Report
   * Endpoint: POST /api/v1/society/cibil-score
   * Permission: credit_score.create
   * 
   * @param {Object} data
   * @param {string} data.fullName - Full name of the applicant (Required)
   * @param {string} data.dob - Date of birth (Required: DD/MM/YYYY or YYYY-MM-DD)
   * @param {string} data.pan - PAN card number (Required: 10-char alphanumeric)
   * @param {string} [data.mobileNumber] - Mobile / Phone number (10 digits)
   * @returns {Promise<Object>} API response with creditReport, score and details
   */
  checkCibilScore: async ({ fullName, dob, pan, mobile, phoneNumber, phone, mobileNumber }) => {
    const phoneVal = (mobileNumber || mobile || phoneNumber || phone || '').toString().trim();
    const payload = {
      mobileNumber: phoneVal,
      pan: pan?.trim()?.toUpperCase(),
      fullName: fullName?.trim(),
      dob,
    };

    const response = await axiosInstance.post('/v1/society/cibil-score', payload);
    return response.data;
  },

  /**
   * Get CIBIL Report History List
   * Endpoint: GET /api/v1/society/cibil-score
   * Permission: credit_score.view
   * 
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Records per page
   * @param {string} [params.search] - Search by PAN, Full Name, Mobile, or RequestId
   * @param {string} [params.status] - Filter by status: completed, processing, failed, pending
   * @param {string} [params.startDate] - Start date range filter (YYYY-MM-DD)
   * @param {string} [params.endDate] - End date range filter (YYYY-MM-DD)
   * @returns {Promise<Object>} API response with items and pagination
   */
  getHistory: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/cibil-score', { params });
    return response.data;
  },

  /**
   * Get CIBIL Report Detail by ID
   * Endpoint: GET /api/v1/society/cibil-score/:id
   * Permission: credit_score.view
   * 
   * @param {string} id - MongoDB Document ID (_id) OR UUID requestId
   * @returns {Promise<Object>} API response with full reportJson, pdfUrl, and applicant info
   */
  getReportById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/cibil-score/${id}`);
    return response.data;
  },
};

export default verificationService;
