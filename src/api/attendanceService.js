import axiosInstance from './axiosConfig';

export const attendanceService = {
  getAttendanceFilters: async (state) => {
    try {
      const params = {};
      if (state) params.state = state;
      const response = await axiosInstance.get('/v1/society/attendance-report/filters', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAttendanceReport: async (params) => {
    try {
      const response = await axiosInstance.get('/v1/society/attendance-report', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
