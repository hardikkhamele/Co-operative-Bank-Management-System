import axiosInstance from './axiosConfig';

export const inventoryService = {
  // ============================================
  // 0. STATS & OVERVIEW APIs
  // ============================================
  getOverviewStats: async () => {
    const response = await axiosInstance.get('/v1/society/inventory/stats/overview');
    return response.data;
  },
  getCentralStats: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/stats/central', { params });
    return response.data;
  },
  getBranchStats: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/stats/branch', { params });
    return response.data;
  },

  // ============================================
  // 1. CATALOG APIs (Categories, Subcategories, Items)
  // ============================================
  createCategory: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/categories', data);
    return response.data;
  },
  getCategories: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/categories', { params });
    return response.data;
  },
  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/categories/${id}`);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/inventory/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/inventory/categories/${id}`);
    return response.data;
  },

  createSubcategory: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/subcategories', data);
    return response.data;
  },
  getSubcategories: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/subcategories', { params });
    return response.data;
  },
  getSubcategoryById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/subcategories/${id}`);
    return response.data;
  },
  updateSubcategory: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/inventory/subcategories/${id}`, data);
    return response.data;
  },
  deleteSubcategory: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/inventory/subcategories/${id}`);
    return response.data;
  },

  createItem: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/items', data);
    return response.data;
  },
  getItems: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/items', { params });
    return response.data;
  },
  getItemById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/items/${id}`);
    return response.data;
  },
  updateItem: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/inventory/items/${id}`, data);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/inventory/items/${id}`);
    return response.data;
  },

  // ============================================
  // 2. VENDOR APIs
  // ============================================
  createVendor: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/vendors', data);
    return response.data;
  },
  getVendors: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/vendors', { params });
    return response.data;
  },
  getVendorById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/vendors/${id}`);
    return response.data;
  },
  updateVendor: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/inventory/vendors/${id}`, data);
    return response.data;
  },
  deleteVendor: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/inventory/vendors/${id}`);
    return response.data;
  },

  // ============================================
  // 3. CENTRAL STOCK APIs
  // ============================================
  createCentralWarehouse: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/central', data);
    return response.data;
  },
  getCentralWarehouses: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/central', { params });
    return response.data;
  },
  getCentralWarehouseById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/central/${id}`);
    return response.data;
  },
  updateCentralWarehouse: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/inventory/central/${id}`, data);
    return response.data;
  },
  deleteCentralWarehouse: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/inventory/central/${id}`);
    return response.data;
  },
  getCentralStock: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/stock/central', { params });
    return response.data;
  },
  receiveStock: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/stock/central/receive', data);
    return response.data;
  },

  // ============================================
  // 4. REQUISITIONS & ISSUES APIs
  // ============================================
  createRequisition: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/requests', data);
    return response.data;
  },
  getRequisitions: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/requests', { params });
    return response.data;
  },
  getRequisitionById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/requests/${id}`);
    return response.data;
  },
  cancelRequisition: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/requests/${id}/cancel`, data);
    return response.data;
  },
  approveRequisition: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/branch/requests/${id}/approve`, data);
    return response.data;
  },
  rejectRequisition: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/branch/requests/${id}/reject`, data);
    return response.data;
  },
  fulfillRequisition: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/branch/requests/${id}/fulfill`, data);
    return response.data;
  },
  directIssueStock: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/branch/issues/direct', data);
    return response.data;
  },

  // ============================================
  // 5. INTER-LOCATION TRANSFER APIs
  // ============================================
  createTransfer: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/transfers', data);
    return response.data;
  },
  approveTransfer: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/transfers/${id}/approve`, data);
    return response.data;
  },
  dispatchTransfer: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/transfers/${id}/dispatch`, data);
    return response.data;
  },
  receiveTransfer: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/transfers/${id}/receive`, data);
    return response.data;
  },

  // ============================================
  // 6. ASSET LIFECYCLE APIs
  // ============================================
  getAssets: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/assets', { params });
    return response.data;
  },
  getMyAssets: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/my-assets', { params });
    return response.data;
  },
  getAssetById: async (id) => {
    const response = await axiosInstance.get(`/v1/society/inventory/assets/${id}`);
    return response.data;
  },
  assignAsset: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/assets/assign', data);
    return response.data;
  },
  returnAsset: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/return`, data);
    return response.data;
  },
  reportAssetDamage: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/report-damage`, data);
    return response.data;
  },
  completeAssetRepair: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/repair-complete`, data);
    return response.data;
  },
  requestAssetDisposal: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/request-disposal`, data);
    return response.data;
  },
  approveAssetDisposal: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/approve-disposal`, data);
    return response.data;
  },
  reportAssetLost: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/report-lost`, data);
    return response.data;
  },
  recoverAsset: async (id, data) => {
    const response = await axiosInstance.post(`/v1/society/inventory/assets/${id}/recover`, data);
    return response.data;
  },

  // ============================================
  // 7. STOCK ADJUSTMENT APIs
  // ============================================
  createStockAdjustment: async (data) => {
    const response = await axiosInstance.post('/v1/society/inventory/stock-adjustments', data);
    return response.data;
  },
  getStockAdjustments: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/stock-adjustments', { params });
    return response.data;
  },
  approveStockAdjustment: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/stock-adjustments/${id}/approve`, data);
    return response.data;
  },
  rejectStockAdjustment: async (id, data = {}) => {
    const response = await axiosInstance.post(`/v1/society/inventory/stock-adjustments/${id}/reject`, data);
    return response.data;
  },
  updateStockAdjustment: async (id, data) => {
    const response = await axiosInstance.put(`/v1/society/inventory/stock-adjustments/${id}`, data);
    return response.data;
  },
  deleteStockAdjustment: async (id) => {
    const response = await axiosInstance.delete(`/v1/society/inventory/stock-adjustments/${id}`);
    return response.data;
  },

  // ============================================
  // 8. LOGS & TRANSACTIONS
  // ============================================
  getTransactions: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/inventory/transactions', { params });
    return response.data;
  }
};

export default inventoryService;
