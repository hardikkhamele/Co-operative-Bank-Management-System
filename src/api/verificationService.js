import axios from 'axios';
import useAuthStore from '../store/authStore';
import useLoadingStore from '../store/loadingStore';

// Dedicated Verification API Base URL (Shared for CIBIL & KYC, defaults to Production https://api.advitacredit.com)
let cibilBaseUrl = import.meta.env.VITE_VERIFICATION_API_URL || import.meta.env.VITE_CIBIL_API_URL || import.meta.env.VITE_KYC_API_URL || import.meta.env.VITE_API_URL || 'https://api.advitacredit.com';
if (!cibilBaseUrl.match(/\/api\/?$/)) {
  cibilBaseUrl = cibilBaseUrl.endsWith('/') ? `${cibilBaseUrl}api` : `${cibilBaseUrl}/api`;
}

const cibilAxiosInstance = axios.create({
  baseURL: cibilBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if available & optionally trigger global loader
cibilAxiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
cibilAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const res = await axios.post(`${cibilBaseUrl}/v1/society/auth/refresh`, {
            refreshToken,
          });

          if (res.data && res.data.success && res.data.data) {
            const newAccessToken = res.data.data.accessToken || res.data.data.tokens?.accessToken || res.data.data.token;
            const newRefreshToken = res.data.data.refreshToken || res.data.data.tokens?.refreshToken || null;

            useAuthStore.getState().setTokens({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            });

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return cibilAxiosInstance(originalRequest);
          }
        } catch (refreshErr) {
          console.warn('CIBIL token refresh failed:', refreshErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const verificationService = {
  /**
   * Check CIBIL / Experian Credit Score & Report
   * Endpoint: POST https://api.advitacredit.com/api/v1/society/cibil-score
   * 
   * @param {Object} data
   * @param {string} data.fullName - Full name of the applicant (Required)
   * @param {string} data.dob - Date of birth (Required: DD/MM/YYYY or YYYY-MM-DD)
   * @param {string} data.pan - PAN card number (Required: 10-char alphanumeric)
   * @param {string} [data.mobileNumber] - Mobile / Phone number (10 digits)
   * @param {string} [data.mobile] - Alias for mobileNumber
   * @param {string} [data.phoneNumber] - Alias for mobileNumber
   * @param {string} [data.phone] - Alias for mobileNumber
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

      const response = await cibilAxiosInstance.post('/v1/society/cibil-score', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default verificationService;
