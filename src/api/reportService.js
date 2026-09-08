import axiosInstance from './axiosConfig';

export const reportService = {
  // 1. Get Report Catalog
  // GET /v1/society/reports/catalog?category=...
  getCatalog: async (params = {}) => {
    const response = await axiosInstance.get('/v1/society/reports/catalog', { params });
    return response.data;
  },

  // 2. Generate / View Report Data
  // GET /v1/society/reports/:reportType?startDate=...&endDate=...&page=...
  getReportData: async (reportType, params = {}) => {
    const response = await axiosInstance.get(`/v1/society/reports/${reportType}`, { params });
    return response.data;
  },

  // 3. Export Report (CSV / PDF)
  // GET /v1/society/reports/:reportType/export?format=csv|pdf&startDate=...
  exportReport: async (reportType, params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get(`/v1/society/reports/${reportType}/export`, {
      params,
      responseType: 'blob',
    });

    // Create a blob URL and trigger browser download
    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;';
    const blob = new Blob([response.data], { type: mimeType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute(
      'download',
      `society-report-${String(reportType).toLowerCase()}-${dateStr}.${format}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  },
};

export default reportService;
