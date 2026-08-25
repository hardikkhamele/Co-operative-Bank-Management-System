import axiosInstance from './axiosConfig';

export const employeeService = {
  // 1. Create Employee (Transactional)
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/employees', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. List Employees
  list: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/employees', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Get Single Employee Details
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/society/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Update Complete Employee Profile
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/v1/society/employees/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Deactivate / Soft Delete or Permanent Delete Employee
  delete: async (id, options = {}) => {
    try {
      const response = await axiosInstance.delete(`/v1/society/employees/${id}`, { params: options });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5b. Restore Soft-Deleted Employee
  restore: async (id) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/restore`);
      return response.data;
    } catch (error) {
      // Fallback to POST if server prefers POST for restore
      if (error.response?.status === 404 || error.response?.status === 405) {
        const postRes = await axiosInstance.post(`/v1/society/employees/${id}/restore`);
        return postRes.data;
      }
      throw error;
    }
  },

  // 6. Transfer / Change Employee Role
  changeRole: async (id, roleId) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/role`, { roleId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 7. Transfer / Change Employee Branch
  changeBranch: async (id, branchId) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/branch`, { branchId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 8. HR Tab 1: Update Personal Details
  updatePersonalDetails: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/personal-details`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 9. HR Tab 2: Update Job Details
  updateJobDetails: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/job-details`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 10. HR Tab 3: Update Shift Settings
  updateShiftSettings: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/shift-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 11. HR Tab 4: Update Attendance Settings
  updateAttendanceSettings: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/attendance-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 12. HR Tab 5: Update WOFF / HOFF Settings
  updateWoffHoffSettings: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/woff-hoff-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 13. HR Tab 6: Update KRA Settings
  updateKraSettings: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/kra-settings`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Helper to update by section name
  updateSection: async (id, section, data) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/employees/${id}/${section}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
