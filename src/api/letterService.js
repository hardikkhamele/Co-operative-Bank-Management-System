import axiosInstance from './axiosConfig';

/**
 * Helper to perform letter generation requests
 * Supports both JSON response (metadata + S3 fileUrl) and direct binary PDF stream.
 */
const postLetterRequest = async (path, data, options = {}) => {
  const { format = 'json' } = options;
  const isJson = format === 'json';

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: isJson ? 'application/json' : 'application/pdf',
    },
    params: isJson ? { format: 'json' } : {},
    responseType: isJson ? 'json' : 'blob',
  };

  try {
    const response = await axiosInstance.post(path, data, config);
    return response.data;
  } catch (err) {
    // If backend returned a JSON error inside a blob
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        err.response.data = json;
      } catch {
        // ignore parse error
      }
    }
    throw err;
  }
};

export const letterService = {
  // 1. Offer / Appointment Letter API
  // POST /api/v1/society/employees/hr/letters/offer
  // Body: { employeeId, candidateName, designation, joiningDate, annualSalary }
  generateOfferLetter: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/offer', data, options);
  },

  // 2. Employment Confirmation Letter API
  // POST /api/v1/society/employees/hr/letters/confirmation
  // Body: { employeeId, probationStartDate, probationEndDate, confirmationDate, noticePeriodDays }
  generateConfirmationLetter: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/confirmation', data, options);
  },

  // 3. Performance Appraisal Letter API
  // POST /api/v1/society/employees/hr/letters/performance
  // Body: { employeeId, reviewPeriod, overallRating, managerComments, appraisalOutcome, kraRatings: [...] }
  generatePerformanceLetter: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/performance', data, options);
  },

  // 4. Promotion Letter API
  // POST /api/v1/society/employees/hr/letters/promotion
  // Body: { employeeId, newRole }
  generatePromotionLetter: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/promotion', data, options);
  },

  // 5. Transfer Letter API
  // POST /api/v1/society/employees/hr/letters/transfer
  // Body: { employeeId, transferToBranchId, effectiveDate, reportingDate }
  generateTransferLetter: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/transfer', data, options);
  },

  // 6. Salary Increment Letter API
  // POST /api/v1/society/employees/hr/letters/salary-increment
  // Body: { employeeId, reviewPeriod, effectiveDate, incrementPercentage, currentCtc, revisedCtc }
  generateSalaryIncrement: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/salary-increment', data, options);
  },

  // 7. Monthly Salary Slip API
  // POST /api/v1/society/employees/hr/letters/salary-slip
  // Body: { employeeId, salaryDate, payDate, payPeriod, workingDays, presentDays, paidDays, lopDays, accountNumber, earnings: [...], deductions: [...], employerContributions: [...] }
  generateSalarySlip: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/salary-slip', data, options);
  },

  // 8. Termination Letter API
  // POST /api/v1/society/employees/hr/letters/termination
  // Body: { employeeId, terminationDate, reason, noticePeriodDays, handoverTo }
  generateTerminationLetter: async (data, options = {}) => {
    return await postLetterRequest('/v1/society/employees/hr/letters/termination', data, options);
  },

  // Unified Dispatcher Method
  generate: async (payload, options = {}) => {
    const { letterType, ...data } = payload;
    const normType = (letterType || '').toLowerCase().trim();

    if (normType.includes('offer')) {
      return await letterService.generateOfferLetter(data, options);
    } else if (normType.includes('confirmation')) {
      return await letterService.generateConfirmationLetter(data, options);
    } else if (normType.includes('performance') || normType.includes('appraisal')) {
      return await letterService.generatePerformanceLetter(data, options);
    } else if (normType.includes('promotion')) {
      return await letterService.generatePromotionLetter(data, options);
    } else if (normType.includes('transfer')) {
      return await letterService.generateTransferLetter(data, options);
    } else if (normType.includes('increment')) {
      return await letterService.generateSalaryIncrement(data, options);
    } else if (normType.includes('slip') || normType.includes('salary slip')) {
      return await letterService.generateSalarySlip(data, options);
    } else if (normType.includes('termination')) {
      return await letterService.generateTerminationLetter(data, options);
    } else {
      throw new Error(`Unsupported letter type: ${letterType}`);
    }
  },
};

export default letterService;
