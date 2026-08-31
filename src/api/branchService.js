import axiosInstance from './axiosConfig';

export const branchService = {
  // 1. Create Branch & Manager Atomically
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/branches', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. List All Branches
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/branches', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Get Single Branch Details
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/branches/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Update Branch Details
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/branches/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Soft Delete / Deactivate Branch
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/branches/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 6. Get Branch Manager Profile (All 6 HR Tabs)
  getManagerProfile: async (branchId) => {
    try {
      const response = await axiosInstance.get(`/v1/society/branches/${branchId}/manager`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 7. Complete Update for Branch Manager
  updateManagerProfile: async (branchId, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/branches/${branchId}/manager`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 8. Update Personal Details
  updateManagerPersonalDetails: async (branchId, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/branches/${branchId}/manager/personal-details`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 9. Update Job Details
  updateManagerJobDetails: async (branchId, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/branches/${branchId}/manager/job-details`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 10. Update Shift Settings
  updateManagerShiftSettings: async (branchId, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/branches/${branchId}/manager/shift-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 11. Update Attendance Settings
  updateManagerAttendanceSettings: async (branchId, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/branches/${branchId}/manager/attendance-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 12. Update WOFF/HOFF Settings
  updateManagerWoffHoffSettings: async (branchId, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/branches/${branchId}/manager/woff-hoff-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 13. Update KRA Settings
  updateManagerKraSettings: async (branchId, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/branches/${branchId}/manager/kra-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 14. Get Branch Dropdown List
  getDropdownList: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/branches/dropdown');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 15. Get Available Cities & States Dropdown
  getAvailableLocations: async () => {
    try {
      try {
        const response = await axiosInstance.get('/v1/society/branches/available-locations');
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const response = await axiosInstance.get('/v1/society/branches/cities-states');
            return response.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              const response = await axiosInstance.get('/v1/society/branches/locations');
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

export default branchService;
