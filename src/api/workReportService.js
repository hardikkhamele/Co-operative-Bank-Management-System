import axiosInstance from './axiosConfig';

export const workReportService = {
  // 1. Log Daily Work Report
  // POST /api/v1/society/employees/hr/work-reports
  // Body: { date, tasksCompleted, hoursSpent }
  create: async (data) => {
    try {
      try {
        const response = await axiosInstance.post('/v1/society/employees/hr/work-reports', data);
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const response = await axiosInstance.post('/api/v1/society/employees/hr/work-reports', data);
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.post('/v1/society/employees/work-reports', data);
              return response.data;
            }
            throw err2;
          }
        }
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },

  // 2. List Daily Work Reports (Paginated & Filtered)
  // GET /api/v1/society/employees/hr/work-reports
  // Query: page, limit, startDate, endDate, branchId, employeeId, search
  list: async (params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      try {
        const response = await axiosInstance.get('/v1/society/employees/hr/work-reports', { params: cleanParams });
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const response = await axiosInstance.get('/api/v1/society/employees/hr/work-reports', { params: cleanParams });
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.get('/v1/society/employees/work-reports', { params: cleanParams });
              return response.data;
            }
            throw err2;
          }
        }
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },

  // 3. Export Daily Work Reports (CSV)
  // GET /api/v1/society/employees/hr/work-reports/export
  export: async (params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      try {
        const response = await axiosInstance.get('/v1/society/employees/hr/work-reports/export', {
          params: cleanParams,
          responseType: 'blob',
        });
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          const response = await axiosInstance.get('/api/v1/society/employees/hr/work-reports/export', {
            params: cleanParams,
            responseType: 'blob',
          });
          return response.data;
        }
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },

  // 6. List Important Employee Dates (Birthdays & Anniversaries)
  // GET /api/v1/society/employees/hr/important-dates
  // Query: month, year
  getImportantDates: async (params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      try {
        const response = await axiosInstance.get('/v1/society/employees/hr/important-dates', { params: cleanParams });
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const response = await axiosInstance.get('/api/v1/society/employees/hr/important-dates', { params: cleanParams });
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.get('/v1/society/important-dates', { params: cleanParams });
              return response.data;
            }
            throw err2;
          }
        }
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default workReportService;
