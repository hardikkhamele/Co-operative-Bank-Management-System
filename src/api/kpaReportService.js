import axiosInstance from './axiosConfig';

export const kpaReportService = {
  // 1. List Employee KPA Performance Metrics Overview
  // GET /api/v1/society/employees/hr/kpa-reports
  list: async (params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      try {
        const response = await axiosInstance.get('/v1/society/employees/hr/kpa-reports', { params: cleanParams });
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const response = await axiosInstance.get('/api/v1/society/employees/hr/kpa-reports', { params: cleanParams });
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.get('/v1/society/employees/kpa-reports', { params: cleanParams });
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

  // 2. Get Detailed KPA Targets vs Achievements
  // GET /api/v1/society/employees/hr/:id/kpa-reports/detail (Query: year, product, month)
  getDetail: async (id, params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      try {
        const response = await axiosInstance.get(`/v1/society/employees/hr/${id}/kpa-reports/detail`, { params: cleanParams });
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const response = await axiosInstance.get(`/api/v1/society/employees/hr/${id}/kpa-reports/detail`, { params: cleanParams });
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.get(`/v1/society/employees/${id}/kpa-reports/detail`, { params: cleanParams });
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

  // 3. Add New KPA Target
  // POST /api/v1/society/employees/hr/kpa-targets (or POST /hr/:id/kpa-targets)
  // Body: { employeeId, year, product, targetType, targetValue }
  addKpaTarget: async (data) => {
    try {
      try {
        const response = await axiosInstance.post('/v1/society/employees/hr/kpa-targets', data);
        return response.data;
      } catch (err) {
        if (err.response?.status === 404 && data?.employeeId) {
          try {
            const response = await axiosInstance.post(`/v1/society/employees/hr/${data.employeeId}/kpa-targets`, data);
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.post('/api/v1/society/employees/hr/kpa-targets', data);
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

  // 4. Update Existing KPA Target (Supports Upsert)
  // PUT /api/v1/society/employees/hr/kpa-targets (or PUT /hr/:id/kpa-targets)
  // Body: { employeeId, year, product, targetType, targetValue }
  updateKpaTarget: async (data) => {
    try {
      try {
        const response = await axiosInstance.put('/v1/society/employees/hr/kpa-targets', data);
        return response.data;
      } catch (err) {
        if (err.response?.status === 404 && data?.employeeId) {
          try {
            const response = await axiosInstance.put(`/v1/society/employees/hr/${data.employeeId}/kpa-targets`, data);
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.put('/api/v1/society/employees/hr/kpa-targets', data);
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

  // 5. Export KPA Reports to CSV
  // GET /api/v1/society/employees/hr/kpa-reports/export
  export: async (params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      try {
        const response = await axiosInstance.get('/v1/society/employees/hr/kpa-reports/export', {
          params: cleanParams,
          responseType: 'blob',
        });
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          const response = await axiosInstance.get('/api/v1/society/employees/hr/kpa-reports/export', {
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
};

export default kpaReportService;
