import axiosInstance from './axiosConfig';

export const attendanceService = {
  /**
   * 1. Get Today Attendance Status & Shift Details
   * GET /api/v1/society/attendance/today
   */
  getTodayStatus: async () => {
    try {
      const response = await axiosInstance.get('/v1/society/attendance/today');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2. Punch-In (Check-In) with Geolocation
   * POST /api/v1/society/attendance/punch-in
   * @param {Object} data { latitude, longitude, address }
   */
  punchIn: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/attendance/punch-in', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 3. Punch-Out (Check-Out)
   * POST /api/v1/society/attendance/punch-out
   * @param {Object} data { latitude, longitude, address }
   */
  punchOut: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/attendance/punch-out', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 4. Get Monthly Attendance Report Summary
   * GET /api/v1/society/attendance/report?month=8&year=2026
   * @param {Object} params { month, year }
   */
  getMonthlyReport: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/attendance/report', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 5. Apply Leave Request
   * POST /api/v1/society/attendance/leave
   * @param {Object} data { leaveType, startDate, endDate, reason }
   */
  applyLeave: async (data) => {
    try {
      const response = await axiosInstance.post('/v1/society/attendance/leave', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default attendanceService;
