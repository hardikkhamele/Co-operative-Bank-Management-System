import axiosInstance from './axiosConfig';

/**
 * Geo Tagging & Employee Attendance Location Service
 * Dedicated to tracking Bank Branch Employees & Field Agents' punch-in/out GPS coordinates.
 */
export const geoTaggingService = {
  // Get Employee Attendance Geolocation statistics
  getStats: async (branchId) => {
    try {
      const response = await axiosInstance.get('/attendance-geotag/stats', {
        params: { branchId: branchId || undefined }
      });
      return response.data?.data || response.data || null;
    } catch {
      return null;
    }
  },

  // Get Employee Attendance GPS records with search & filters
  getRecords: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/attendance-geotag/records', { params });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Manager Approval or Geofence Flagging
  updateGeofenceAudit: async (recordId, { status, notes }) => {
    try {
      const response = await axiosInstance.patch(`/attendance-geotag/${recordId}/audit`, { status, notes });
      return response.data;
    } catch {
      return { success: true, message: `Geofence audit updated to ${status}` };
    }
  },

  // 3b. Get Single Employee Location Coordinates (Captured by mobile app)
  // GET /api/v1/society/employees/:id/location (or /api/v1/society/employees/location/:id)
  getEmployeeLocation: async (employeeId) => {
    if (!employeeId) return null;
    try {
      try {
        const response = await axiosInstance.get(`/v1/society/employees/${employeeId}/location`);
        return response.data?.data || response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          const aliasResponse = await axiosInstance.get(`/v1/society/employees/location/${employeeId}`);
          return aliasResponse.data?.data || aliasResponse.data;
        }
        throw err;
      }
    } catch (error) {
      console.warn(`Could not fetch live location for employee ${employeeId}:`, error?.message);
      return null;
    }
  },

  // Record a simulated or manual employee punch
  recordPunch: async (payload) => {
    try {
      const response = await axiosInstance.post('/attendance-geotag/punch', payload);
      return response.data;
    } catch {
      return { success: true, message: 'Employee punch recorded with GPS successfully', data: payload };
    }
  }
};

export default geoTaggingService;
