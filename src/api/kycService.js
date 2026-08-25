import axios from 'axios';
import useAuthStore from '../store/authStore';

// Dedicated KYC API URL configured via env (Shared for CIBIL & KYC, defaults to Production https://api.advitacredit.com)
let kycBaseUrl = import.meta.env.VITE_VERIFICATION_API_URL || import.meta.env.VITE_KYC_API_URL || import.meta.env.VITE_CIBIL_API_URL || import.meta.env.VITE_API_URL || 'https://api.advitacredit.com';
if (!kycBaseUrl.match(/\/api\/?$/)) {
  kycBaseUrl = kycBaseUrl.endsWith('/') ? `${kycBaseUrl}api` : `${kycBaseUrl}/api`;
}

const kycAxiosInstance = axios.create({
  baseURL: kycBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if available
kycAxiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with 401 token refresh
kycAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const res = await axios.post(`${kycBaseUrl}/v1/society/auth/refresh`, {
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
            return kycAxiosInstance(originalRequest);
          }
        } catch (refreshErr) {
          console.warn('KYC token refresh failed, session expired:', refreshErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

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
      const response = await kycAxiosInstance.post('/v1/society/kyc-verification/initiate', data);
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
      const response = await kycAxiosInstance.post('/v1/society/kyc-verification/complete', data);
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
      const response = await kycAxiosInstance.get(`/v1/society/kyc-verification/report/${refid}`);
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
      const response = await kycAxiosInstance.get(`/v1/society/kyc-verification/report/${refid}/download-pdf/${documentType}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default kycService;
