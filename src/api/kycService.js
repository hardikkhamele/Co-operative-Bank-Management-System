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

const STORAGE_KEY = 'advita_kyc_verification_history';

/**
 * Retrieve local verification history
 */
const getLocalHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading KYC local storage:', e);
    return [];
  }
};

/**
 * Save or update a verification record in history
 */
const saveLocalRecord = (record) => {
  if (!record || !record.refid) return;
  try {
    const list = getLocalHistory();
    const existingIndex = list.findIndex((item) => item.refid === record.refid);
    const updatedRecord = {
      ...record,
      updatedAt: record.updatedAt || new Date().toISOString(),
      createdAt: record.createdAt || (existingIndex >= 0 ? list[existingIndex].createdAt : new Date().toISOString()),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...updatedRecord };
    } else {
      list.unshift(updatedRecord);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving KYC local record:', e);
  }
};

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
      if (response.data?.data?.refid) {
        saveLocalRecord({
          refid: response.data.data.refid,
          documentType: data.documentType,
          idNumber: data.idNumber,
          status: response.data.data.status || 'INITIATED',
          personalDetails: response.data.data.personalDetails || null,
          createdAt: new Date().toISOString(),
        });
      }
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
      if (response.data?.data) {
        const item = response.data.data;
        saveLocalRecord({
          refid: item.refid || data.refid,
          documentType: item.documentType || item.personalDetails?.documentType || 'AADHAAR',
          idNumber: item.idNumber || item.personalDetails?.aadhaarNumber || item.personalDetails?.panNumber,
          status: item.status || 'VERIFIED',
          personalDetails: item.personalDetails,
          verifiedAt: item.verifiedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
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
      if (response.data?.data) {
        const item = response.data.data;
        saveLocalRecord({
          _id: item._id,
          refid: item.refid || refid,
          documentType: item.documentType,
          idNumber: item.idNumber,
          status: item.status || 'VERIFIED',
          personalDetails: item.personalDetails,
          verifiedAt: item.verifiedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }
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
  },

  /**
   * Get KYC Verification History
   * @param {Object} [params]
   * @returns {Promise<Object>} List of verification sessions
   */
  getKycHistory: async (params = {}) => {
    let apiData = [];

    // Only attempt history endpoint if configured or silent fallback
    try {
      const res = await kycAxiosInstance.get('/v1/society/kyc-verification/history', { 
        params,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 404
      });
      if (res.status === 200 && res.data && (res.data.success || Array.isArray(res.data.data))) {
        const list = Array.isArray(res.data.data) 
          ? res.data.data 
          : (res.data.data?.verifications || res.data.verifications || res.data.data?.history || []);
        if (Array.isArray(list)) {
          apiData = list;
        }
      }
    } catch (err) {
      // Backend history endpoint not deployed yet - gracefully use client history
    }

    // Merge server data with local stored records (deduped by refid)
    const localList = getLocalHistory();
    const map = new Map();

    // Add local records first
    localList.forEach((item) => {
      if (item.refid) map.set(item.refid, item);
    });

    // Add / override with API data if present
    apiData.forEach((item) => {
      if (item.refid) {
        map.set(item.refid, { ...(map.get(item.refid) || {}), ...item });
      }
    });

    const combinedList = Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.verifiedAt || a.createdAt || a.updatedAt || 0);
      const dateB = new Date(b.verifiedAt || b.createdAt || b.updatedAt || 0);
      return dateB - dateA;
    });

    return {
      success: true,
      data: combinedList,
      totalCount: combinedList.length,
    };
  },

  /**
   * Save record helper
   */
  saveKycRecord: saveLocalRecord,

  /**
   * Get all cached local verification history
   */
  getLocalKycHistory: getLocalHistory,
};

export default kycService;
