import axiosInstance from './axiosConfig';

export const kycService = {
  /**
   * Initiate KYC Verification Session
   * @param {Object} data
   * @param {string} data.documentType - AADHAAR or PAN
   * @param {string} data.idNumber - Document identifier number
   * @param {boolean} [data.consent] - Consent flag
   * @param {string} data.redirectUrl - Client side landing URL
   * @returns {Promise<Object>} API response
   */
  initiateKyc: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/kyc-verification/initiate', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Complete KYC Verification
   * @param {Object} data
   * @param {string} data.refid - Reference ID of the session
   * @returns {Promise<Object>} API response
   */
  completeKyc: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/kyc-verification/complete', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get KYC Report
   * @param {string} refid - Reference ID of the session
   * @returns {Promise<Object>} API response
   */
  getKycReport: async (refid) => {
    try {
      const response = await axiosInstance.get(`/v1/society/kyc-verification/report/${refid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download KYC PDF Report
   * @param {string} refid - Reference ID of the session
   * @param {string} documentType - AADHAAR or PAN
   * @returns {Promise<Blob>} PDF Blob data
   */
  downloadKycPdf: async (refid, documentType) => {
    try {
      const response = await axiosInstance.get(`/v1/society/kyc-verification/report/${refid}/download-pdf/${documentType}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default kycService;
