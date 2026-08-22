import axiosInstance from './axiosConfig';

const postPdfRequest = async (path, data) => {
  try {
    try {
      const response = await axiosInstance.post(path, data, {
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback with/without /api prefix
        const alternatePath = path.startsWith('/v1/') ? `/api${path}` : path.replace('/api/', '/');
        const response = await axiosInstance.post(alternatePath, data, {
          responseType: 'blob',
        });
        return response.data;
      }
      // If error returned JSON blob (e.g. 422 or 400), try to parse it
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          err.response.data = json;
        } catch {
          // ignore
        }
      }
      throw err;
    }
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        error.response.data = json;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

export const letterService = {
  // 1. Offer Letter PDF
  // POST /api/v1/society/employees/hr/letters/offer
  // Body: { employeeId, designation }
  generateOfferLetter: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/offer', data);
  },

  // 2. Employment Confirmation Letter PDF
  // POST /api/v1/society/employees/hr/letters/confirmation
  // Body: { employeeId, confirmationDate, designation }
  generateConfirmationLetter: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/confirmation', data);
  },

  // 3. Performance Review Letter PDF
  // POST /api/v1/society/employees/hr/letters/performance
  // Body: { employeeId, letterText }
  generatePerformanceLetter: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/performance', data);
  },

  // 4. Promotion Letter PDF
  // POST /api/v1/society/employees/hr/letters/promotion
  // Body: { employeeId, promotedToDesignation, promotionDate }
  generatePromotionLetter: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/promotion', data);
  },

  // 5. Branch Transfer Letter PDF
  // POST /api/v1/society/employees/hr/letters/transfer
  // Body: { employeeId, transferToBranchId, transferDate }
  generateTransferLetter: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/transfer', data);
  },

  // 6. Monthly Salary Slip PDF
  // POST /api/v1/society/employees/hr/letters/salary-slip
  // Body: { employeeId, fromMonth, toMonth }
  generateSalarySlip: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/salary-slip', data);
  },

  // 7. Salary Increment Revision PDF
  // POST /api/v1/society/employees/hr/letters/salary-increment
  // Body: { employeeId, newSalary, effectiveDate }
  generateSalaryIncrement: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/salary-increment', data);
  },

  // 8. Termination Letter PDF
  // POST /api/v1/society/employees/hr/letters/termination
  // Body: { employeeId, terminationDate, reason, noticePeriodDays, handoverTo }
  generateTerminationLetter: async (data) => {
    return await postPdfRequest('/v1/society/employees/hr/letters/termination', data);
  },
};

export default letterService;
