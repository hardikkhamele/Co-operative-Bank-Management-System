import axiosInstance from './axiosConfig';

/**
 * Advita ERP - Society Panel Profile API Service
 * Base Route Prefix: /api/v1/society/profile
 */
export const profileService = {
  /**
   * 1. View Profile
   * Fetch complete account profile, role, avatar & tenant details
   * GET /api/v1/society/profile
   */
  getProfile: async () => {
    const response = await axiosInstance.get('/v1/society/profile');
    return response.data;
  },

  /**
   * 2. Edit Profile
   * Update account personal details (Name, Email, Phone, Avatar)
   * Supports JSON body or Multipart/Form-Data (file upload)
   * PUT /api/v1/society/profile
   */
  updateProfile: async (data) => {
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await axiosInstance.put('/v1/society/profile', data, {
      headers,
    });
    return response.data;
  },

  /**
   * 3. Change Password
   * Validate old password & set new hashed password
   * POST /api/v1/society/profile/change-password
   */
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/v1/society/profile/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });
    return response.data;
  },
};

export default profileService;
