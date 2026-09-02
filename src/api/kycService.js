import axiosInstance from './axiosConfig';

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
   * 4.1 Initiate KYC Verification Session
   * Method: POST /v1/society/kyc-verification/initiate
   * Permission: kyc.create
   * 
   * @param {Object} data
   * @param {string} data.documentType - AADHAAR or PAN
   * @param {string} data.idNumber - Document identifier number
   * @param {boolean} [data.consent] - Consent flag
   * @param {string} data.redirectUrl - Client side landing URL
   * @returns {Promise<Object>} API response
   */
  initiateKyc: async (data) => {
    const response = await axiosInstance.post('/v1/society/kyc-verification/initiate', data);
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
  },

  /**
   * 4.2 Complete KYC Verification
   * Method: POST /v1/society/kyc-verification/complete
   * Permission: kyc.create
   * 
   * @param {Object} data
   * @param {string} data.refid - Reference ID of the session
   * @returns {Promise<Object>} API response
   */
  completeKyc: async (data) => {
    const response = await axiosInstance.post('/v1/society/kyc-verification/complete', data);
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
  },

  /**
   * 4.3 Get KYC Report
   * Method: GET /v1/society/kyc-verification/report/:refid
   * Permission: kyc.view
   * 
   * @param {string} refid - Reference ID of the session
   * @returns {Promise<Object>} API response
   */
  getKycReport: async (refid) => {
    const response = await axiosInstance.get(`/v1/society/kyc-verification/report/${refid}`);
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
  },

  /**
   * 4.4 Download KYC PDF Report
   * Method: GET /v1/society/kyc-verification/report/:refid/download-pdf/:documentType
   * Permission: kyc.view
   * 
   * @param {string} refid - Reference ID of the session
   * @param {string} documentType - AADHAAR or PAN
   * @returns {Promise<Blob>} PDF Blob data
   */
  downloadKycPdf: async (refid, documentType) => {
    const response = await axiosInstance.get(`/v1/society/kyc-verification/report/${refid}/download-pdf/${documentType}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * 4.5 Get KYC Verification History
   * Method: GET /v1/society/kyc-verification/history
   * Permission: kyc.view
   * 
   * @param {Object} [params]
   * @param {number} [params.page=1] - Page number (min 1)
   * @param {number} [params.limit=10] - Records per page (min 1, max 100)
   * @param {string} [params.search] - Case-insensitive search on refid, idNumber, or parsed name/ID numbers
   * @param {string} [params.requestById] - Filter by target user ID (24-Hex String ObjectId)
   * @param {string} [params.createdBy] - Filter by creator employee/user ID (24-Hex String ObjectId)
   * @param {string} [params.documentType] - Filter by document type ('AADHAAR' | 'PAN')
   * @param {string} [params.status] - Filter by status ('INITIATED' | 'VERIFIED' | 'FAILED' | 'EXPIRED')
   * @param {string} [params.startDate] - Start timestamp ISO string (e.g. 2026-01-01T00:00:00.000Z)
   * @param {string} [params.endDate] - End timestamp ISO string (e.g. 2026-12-31T23:59:59.999Z)
   * @returns {Promise<Object>} Standard API response: { success, statusCode, message, data: { items, pagination } }
   */
  getKycHistory: async (params = {}) => {
    try {
      const cleanParams = {};
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.documentType && params.documentType !== 'ALL') cleanParams.documentType = params.documentType;
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.startDate) cleanParams.startDate = params.startDate;
      if (params.endDate) cleanParams.endDate = params.endDate;
      if (params.requestById) cleanParams.requestById = params.requestById;
      if (params.createdBy) cleanParams.createdBy = params.createdBy;

      const response = await axiosInstance.get('/v1/society/kyc-verification/history', { params: cleanParams });
      
      const payload = response.data || {};
      const dataObj = payload.data || {};
      
      let items = [];
      if (Array.isArray(dataObj.items)) {
        items = dataObj.items;
      } else if (Array.isArray(dataObj)) {
        items = dataObj;
      } else if (Array.isArray(payload.items)) {
        items = payload.items;
      }

      const pagination = dataObj.pagination || payload.pagination || {
        total: items.length,
        page: cleanParams.page || 1,
        limit: cleanParams.limit || 10,
        totalPages: Math.ceil(items.length / (cleanParams.limit || 10)) || 1,
      };

      return {
        success: payload.success ?? true,
        statusCode: payload.statusCode || 200,
        message: payload.message || 'KYC verification history retrieved successfully.',
        data: {
          items,
          pagination,
        },
      };
    } catch (error) {
      console.warn('KYC History API error, falling back to cached local storage:', error.message);
      const localList = getLocalHistory();
      return {
        success: false,
        isFallback: true,
        data: {
          items: localList,
          pagination: {
            total: localList.length,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: Math.ceil(localList.length / (params.limit || 10)) || 1,
          },
        },
        error: error.response?.data || error.message,
      };
    }
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
