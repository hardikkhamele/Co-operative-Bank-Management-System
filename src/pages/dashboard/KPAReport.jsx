import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ChevronRight, 
  Search, 
  Download, 
  ChevronLeft, 
  Eye, 
  SlidersHorizontal, 
  X, 
  Calendar,
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  Table,
  FileText,
  ChevronDown
} from 'lucide-react';
import { kpaReportService } from '../../api/kpaReportService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';
import useBranchStore from '../../store/branchStore';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const DEFAULT_DESIGNATIONS = [
  'Branch Manager',
  'Assistant Branch Manager',
  'Loan Executive',
  'Collection Executive',
  'Senior Clerk',
  'Clerk',
  'Cashier',
  'Accountant',
  'Field Officer',
];

const KPAReport = () => {

  // Data States
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    totalRecords: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const globalBranchId = useBranchStore(state => state.globalBranchId);

  // Dropdown Options
  const [branchOptions, setBranchOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    designations: '',
    states: '',
    branchIds: '',
    date: '',
  });

  // Draft Filters in Modal
  const [tempFilters, setTempFilters] = useState({
    designations: '',
    states: '',
    branchIds: '',
    date: '',
  });

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load dropdown options for Branch and Roles
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [branchRes, roleRes] = await Promise.allSettled([
          branchService.list({ limit: 100 }),
          roleService.list({ limit: 100 }),
        ]);

        if (branchRes.status === 'fulfilled' && branchRes.value?.success) {
          setBranchOptions(branchRes.value.data || []);
        }
        if (roleRes.status === 'fulfilled' && roleRes.value?.success) {
          setRoleOptions(roleRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Fetch KPA Overview List
  const fetchKpaReports = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (appliedFilters.designations) {
        params.designations = appliedFilters.designations;
      }
      if (appliedFilters.states) {
        params.states = appliedFilters.states;
      }
      if (appliedFilters.branchIds) {
        params.branchIds = appliedFilters.branchIds;
      } else if (globalBranchId) {
        params.branchId = globalBranchId;
      }
      if (appliedFilters.date) {
        params.date = appliedFilters.date;
      }

      const response = await kpaReportService.list(params);

      if (response && (response.success || Array.isArray(response.data))) {
        const dataList = Array.isArray(response.data) ? response.data : (response.data?.reports || response.data?.employees || []);
        setReports(dataList);

        const paginationMeta = response.meta || response.pagination || {
          totalRecords: dataList.length,
          limit,
          page,
          totalPages: Math.max(1, Math.ceil(dataList.length / limit)),
          hasNextPage: false,
          hasPrevPage: page > 1,
        };

        setMeta({
          totalRecords: paginationMeta.totalRecords ?? dataList.length,
          limit: paginationMeta.limit ?? limit,
          page: paginationMeta.page ?? page,
          totalPages: paginationMeta.totalPages ?? 1,
          hasNextPage: Boolean(paginationMeta.hasNextPage),
          hasPrevPage: Boolean(paginationMeta.hasPrevPage),
        });
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching KPA reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch on page, search, or applied filter change
  useEffect(() => {
    fetchKpaReports();
  }, [page, debouncedSearch, appliedFilters, globalBranchId]);

  // Open Filter modal and sync temp filters
  const handleOpenFilterModal = () => {
    setTempFilters({ ...appliedFilters });
    setIsFilterOpen(true);
  };

  // Apply filters
  const handleApplyFilter = () => {
    setAppliedFilters({ ...tempFilters });
    setPage(1);
    setIsFilterOpen(false);
  };

  // Reset filters
  const handleResetFilter = () => {
    const reset = {
      designations: '',
      states: '',
      branchIds: '',
      date: '',
    };
    setTempFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
    setIsFilterOpen(false);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.designations) count++;
    if (appliedFilters.states) count++;
    if (appliedFilters.branchIds) count++;
    if (appliedFilters.date) count++;
    return count;
  }, [appliedFilters]);

  // Export KPA Reports as CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.designations) params.designations = appliedFilters.designations;
      if (appliedFilters.states) params.states = appliedFilters.states;
      if (appliedFilters.branchIds) params.branchIds = appliedFilters.branchIds;
      else if (globalBranchId) params.branchId = globalBranchId;
      if (appliedFilters.date) params.date = appliedFilters.date;

      const blobData = await kpaReportService.export(params);

      const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kpa_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('KPA report exported successfully!');
    } catch (err) {
      console.error('Export KPA report error:', err);
      toast.error('Failed to export KPA report CSV.');
    } finally {
      setExporting(false);
    }
  };

  // Pagination bounds calculation
  const startRecord = meta.totalRecords > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const endRecord = Math.min(meta.page * meta.limit, meta.totalRecords);

  // Generate pagination items
  const renderPaginationButtons = () => {
    const total = meta.totalPages || 1;
    const current = meta.page || 1;
    const pages = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`ellipsis-${idx}`} className="text-gray-400 px-1 font-bold">
            ...
          </span>
        );
      }
      return (
        <button
          key={`page-${p}`}
          onClick={() => setPage(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
            p === current
              ? 'bg-[#225091] text-white shadow-sm'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      );
    });
  };
  const tableRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const getSelectedDataFromTable = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const table = tableRef.current;
    
    // Headers (skip last action column)
    const ths = Array.from(table.querySelectorAll('thead th'));
    const headers = ths.slice(0, -1).map(th => th.innerText.trim().replace(/\n/g, ' '));

    // Rows (all rows)
    const trs = Array.from(table.querySelectorAll('tbody tr'));
    const rows = trs.map(tr => {
      const tds = Array.from(tr.querySelectorAll('td'));
      return tds.slice(0, -1).map(td => td.innerText.trim().replace(/\n/g, ' '));
    });

    return { headers, rows };
  };

  const exportToCSV = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => '"' + v.replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Export.csv';
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <table ref={tableRef} border="1">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Export.xls';
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export</title></head><body>
      <table ref={tableRef} border="1">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      </body></html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Export.doc';
    link.click();
    setIsExportOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#225091] mb-3">KPA Report</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#225091]">KPA Report</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-[320px]">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee, designation, branch..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#225091] bg-gray-50/50"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Trigger Button */}
            <button 
              onClick={handleOpenFilterModal}
              className="relative w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm shrink-0 bg-white"
              title="Filter Reports"
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchKpaReports}
              disabled={loading}
              className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm shrink-0 bg-white"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-[#225091]' : ''} />
            </button>
          </div>
          
          {/* Export Report Button */}
          <div className="relative flex-shrink-0">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Download size={18} />
              Export
              <ChevronDown size={16} />
            </button>
            
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-1">
                  <button onClick={exportToCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <Table size={16} className="text-green-600" />
                    Export to CSV
                  </button>
                  <button onClick={exportToExcel} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Export to Excel
                  </button>
                  <button onClick={exportToWord} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <FileText size={16} className="text-blue-600" />
                    Export to Word
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display Bar */}
        {activeFilterCount > 0 && (
          <div className="px-6 py-3 bg-teal-50/50 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap text-[13px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-700">Active Filters:</span>
              {appliedFilters.designations && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  Designation: {appliedFilters.designations}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, designations: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.states && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  State: {appliedFilters.states}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, states: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.branchIds && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  Branch: {branchOptions.find(b => (b.id === appliedFilters.branchIds || b._id === appliedFilters.branchIds))?.branchName || branchOptions.find(b => (b.id === appliedFilters.branchIds || b._id === appliedFilters.branchIds))?.name || appliedFilters.branchIds}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, branchIds: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.date && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  Date: {appliedFilters.date}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, date: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilter}
              className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto min-h-[320px] relative">
          <table ref={tableRef} className="w-full min-w-[900px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold text-left whitespace-nowrap">Employee Name</th>
                <th className="py-3.5 px-5 font-semibold text-left whitespace-nowrap">Designation</th>
                <th className="py-3.5 px-5 font-semibold text-left whitespace-nowrap">Branch</th>
                <th className="py-3.5 px-5 font-semibold text-left whitespace-nowrap">Phone Number</th>
                <th className="py-3.5 px-5 font-semibold text-left whitespace-nowrap">Email</th>
                <th className="py-3.5 px-5 font-semibold text-center whitespace-nowrap w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#225091]" size={24} />
                      <span className="text-sm font-medium">Loading KPA employee reports...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="text-gray-300 w-10 h-10 mb-1" />
                      <span className="text-sm font-semibold text-gray-800">No KPA Reports Found</span>
                      <span className="text-xs text-gray-400">Try adjusting your filters or search query</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((row, index) => {
                  const empId = row.id || row._id || `emp-${index}`;
                  const empName = row.employeeName || row.fullName || row.name || '—';
                  const initials = empName !== '—' 
                    ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                    : 'E';
                  const srNo = row.srNo || ((meta.page - 1) * meta.limit + index + 1);

                  return (
                    <tr 
                      key={empId} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{srNo}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{empName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">
                        <span className="max-w-[160px] truncate block">{row.designation || '—'}</span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.branch || row.branchName || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.phoneNumber || row.phone || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.email || '—'}</td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center">
                          <Link 
                            to={`/kpa-report/view/${empId}`} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs"
                            title="View KPA Targets Detail"
                          >
                            <Eye size={13} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] font-medium text-gray-500">
            Showing {startRecord} to {endRecord} of {meta.totalRecords} entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={meta.page <= 1 || loading}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {renderPaginationButtons()}

            <button 
              onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))}
              disabled={meta.page >= meta.totalPages || loading}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#225091]" />
                <h3 className="text-[18px] font-bold text-gray-800">Filter KPA Reports</h3>
              </div>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              
              {/* Designation Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Designation</label>
                <select 
                  value={tempFilters.designations}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, designations: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white appearance-none"
                >
                  <option value="">All Designations</option>
                  {roleOptions.length > 0 ? (
                    roleOptions.map((role) => (
                      <option key={role.id || role._id || role.name} value={role.name || role.roleName}>
                        {role.name || role.roleName}
                      </option>
                    ))
                  ) : (
                    DEFAULT_DESIGNATIONS.map((desig) => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))
                  )}
                </select>
              </div>

              {/* State / UT Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">State / UT</label>
                <select 
                  value={tempFilters.states}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, states: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white appearance-none"
                >
                  <option value="">All States / UT</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Branch Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Branch</label>
                <select 
                  value={tempFilters.branchIds}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, branchIds: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white appearance-none"
                >
                  <option value="">All Branches</option>
                  {branchOptions.map((branch) => {
                    const bId = branch.id || branch._id;
                    const bName = branch.branchName || branch.name || `Branch #${bId}`;
                    return (
                      <option key={bId} value={bId}>
                        {bName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={tempFilters.date}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white" 
                  />
                  <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={handleResetFilter}
                className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-[14px] font-bold transition-colors"
              >
                Reset Filter
              </button>
              <button 
                onClick={handleApplyFilter}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#225091] hover:bg-[#159a9f] text-white text-[14px] font-bold transition-colors shadow-sm"
              >
                Set Filter
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KPAReport;
