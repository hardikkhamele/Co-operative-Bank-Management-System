import axiosInstance from './axiosConfig';

export const societyCustomerService = {
  // 1. Paginated list of society customers & merchants with summary stats
  list: async (params) => {
    const response = await axiosInstance.get('/v1/society/customers', { params });
    return response.data;
  },

  // 2. Detailed member view (full loans, pigmy, EMI card, bank details)
  getById: async (id, params) => {
    const response = await axiosInstance.get(`/v1/society/customers/${id}`, { params });
    return response.data;
  },

  // 3. Active members dropdown selection list
  getDropdown: async () => {
    const response = await axiosInstance.get('/v1/society/customers/dropdown');
    return response.data;
  },
};
