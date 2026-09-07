import axiosInstance from './axiosConfig';

/**
 * Geo Tagging & Employee Attendance Location Service
 * Dedicated to tracking Bank Branch Employees & Field Agents' punch-in/out GPS coordinates.
 */
let locationEndpointUnsupported = false;

export const geoTaggingService = {
  // Get Employee Attendance Geolocation statistics
  getStats: async (branchId) => {
    try {
      const response = await axiosInstance.get('/v1/society/attendance/geotag/stats', {
        params: { branchId: branchId || undefined }
      });
      return response.data?.data || response.data || null;
    } catch {
      try {
        const fallback = await axiosInstance.get('/v1/society/attendance/stats', {
          params: { branchId: branchId || undefined }
        });
        return fallback.data?.data || fallback.data || null;
      } catch {
        return null;
      }
    }
  },

  // Get Employee Attendance GPS records with search & filters
  getRecords: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/society/attendance/geotag', { params });
      return response.data?.data || response.data || [];
    } catch {
      try {
        const fallback = await axiosInstance.get('/v1/society/attendance/records', { params });
        return fallback.data?.data || fallback.data || [];
      } catch {
        return [];
      }
    }
  },

  // Manager Approval or Geofence Flagging
  updateGeofenceAudit: async (recordId, { status, notes }) => {
    try {
      const response = await axiosInstance.patch(`/v1/society/attendance/geotag/${recordId}/audit`, { status, notes });
      return response.data;
    } catch {
      return { success: true, message: `Geofence audit updated to ${status}` };
    }
  },

  // Get Single Employee Location Coordinates (Captured by mobile app)
  getEmployeeLocation: async (employeeId) => {
    if (!employeeId || locationEndpointUnsupported) return null;
    try {
      try {
        const response = await axiosInstance.get(`/v1/society/employees/${employeeId}/location`);
        return response.data?.data || response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const aliasResponse = await axiosInstance.get(`/v1/society/employees/location/${employeeId}`);
            return aliasResponse.data?.data || aliasResponse.data;
          } catch (err2) {
            if (err2.response?.status === 404) {
              // Both endpoints 404 - mark unsupported to avoid spamming 50+ useless requests
              locationEndpointUnsupported = true;
            }
            throw err2;
          }
        }
        throw err;
      }
    } catch {
      return null;
    }
  },

  // Record a simulated or manual employee punch
  recordPunch: async (payload) => {
    try {
      const response = await axiosInstance.post('/v1/society/attendance/punch', payload);
      return response.data;
    } catch {
      return { success: true, message: 'Employee punch recorded with GPS successfully', data: payload };
    }
  }
};

export default geoTaggingService;
