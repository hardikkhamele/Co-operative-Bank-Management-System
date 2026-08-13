import axiosInstance from './axiosConfig';

export const verificationService = {
  /**
   * Check CIBIL / Experian Credit Score
   * Endpoint: POST /api/v1/society/cibil-score
   * 
   * @param {Object} data
   * @param {string} data.fullName - Full name of the applicant (Required)
   * @param {string} data.dob - Date of birth (Required: YYYY-MM-DD)
   * @param {string} data.pan - PAN card number (Required: 10-char alphanumeric)
   * @param {string} [data.mobile] - Mobile / Phone number (10 digits)
   * @param {string} [data.phoneNumber] - Phone number alias
   * @returns {Promise<Object>} API response with creditReport, score and history
   */
  checkCibilScore: async ({ fullName, dob, pan, mobile, phoneNumber, phone, mobileNumber }) => {
    try {
      const phoneVal = (mobileNumber || mobile || phoneNumber || phone || '').toString().trim();
      const payload = {
        mobileNumber: phoneVal,
        pan: pan?.trim()?.toUpperCase(),
        fullName: fullName?.trim(),
        dob,
      };

      const response = await axiosInstance.post('/v1/society/cibil-score', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default verificationService;
