import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ChevronRight, 
  Search, 
  Download, 
  ChevronLeft, 
  SlidersHorizontal, 
  X, 
  Calendar, 
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  Clock,
  Plus,
  FileText,
  User,
  Package,
  IndianRupee
} from 'lucide-react';
import { workReportService } from '../../api/workReportService';
import { branchService } from '../../api/branchService';
import { employeeService } from '../../api/employeeService';
import { roleService } from '../../api/roleService';
import useAuthStore from '../../store/authStore';

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

const AVAILABLE_PRODUCTS = [
  'Loan Disbursement',
  'Fixed Deposit',
  'Recurring Deposit',
  'Savings Account',
  'Current Account',
  'Insurance Policy',
  'Gold Loan',
  'Other',
];

const DailyWorkReport = () => {
  const { user } = useAuthStore();

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

  // Log Work Report Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logFormData, setLogFormData] = useState({
    employeeId: '',
    product: 'Loan Disbursement',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    tasksCompleted: '',
    hoursSpent: 8,
    remarks: '',
  });

  // Dropdown Options
  const [branchOptions, setBranchOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    designations: '',
    states: '',
    branchIds: '',
    branchId: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    date: '',
  });

  // Draft Filters in Modal
  const [tempFilters, setTempFilters] = useState({
    designations: '',
    states: '',
    branchIds: '',
    branchId: '',
    employeeId: '',
    startDate: '',
    endDate: '',
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

  // Load dropdown options for Branch, Roles, and Employees
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [branchRes, roleRes, empRes] = await Promise.allSettled([
          branchService.list({ limit: 100 }),
          roleService.list({ limit: 100 }),
          employeeService.list({ limit: 100 }),
        ]);

        if (branchRes.status === 'fulfilled' && branchRes.value?.success) {
          setBranchOptions(branchRes.value.data || []);
        }
        if (roleRes.status === 'fulfilled' && roleRes.value?.success) {
          setRoleOptions(roleRes.value.data || []);
        }
        if (empRes.status === 'fulfilled' && (empRes.value?.success || Array.isArray(empRes.value?.data))) {
          const list = Array.isArray(empRes.value.data) ? empRes.value.data : (empRes.value.data?.employees || []);
          setEmployeeOptions(list);
          // Pre-select first employee if not set
          if (list.length > 0) {
            setLogFormData(prev => ({
              ...prev,
              employeeId: prev.employeeId || list[0].id || list[0]._id,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Set default employeeId from user if logged in employee
  useEffect(() => {
    if (user && (user.employeeId || user.id || user._id) && !logFormData.employeeId) {
      setLogFormData(prev => ({
        ...prev,
        employeeId: user.employeeId || user.id || user._id,
      }));
    }
  }, [user]);

  // Fetch Daily Work Reports
  const fetchWorkReports = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (appliedFilters.startDate) {
        params.startDate = appliedFilters.startDate;
      }
      if (appliedFilters.endDate) {
        params.endDate = appliedFilters.endDate;
      }
      if (appliedFilters.branchId || appliedFilters.branchIds) {
        params.branchId = appliedFilters.branchId || appliedFilters.branchIds;
      }
      if (appliedFilters.employeeId) {
        params.employeeId = appliedFilters.employeeId;
      }
      if (appliedFilters.designations) {
        params.designations = appliedFilters.designations;
      }
      if (appliedFilters.states) {
        params.states = appliedFilters.states;
      }
      if (appliedFilters.date) {
        params.date = appliedFilters.date;
      }

      const response = await workReportService.list(params);
      
      if (response && (response.success || Array.isArray(response.data))) {
        const dataList = Array.isArray(response.data) ? response.data : (response.data?.reports || []);
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
      console.error('Error fetching daily work reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch on filter/page/search change
  useEffect(() => {
    fetchWorkReports();
  }, [page, debouncedSearch, appliedFilters]);

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
      branchId: '',
      employeeId: '',
      startDate: '',
      endDate: '',
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
    if (appliedFilters.branchIds || appliedFilters.branchId) count++;
    if (appliedFilters.employeeId) count++;
    if (appliedFilters.startDate) count++;
    if (appliedFilters.endDate) count++;
    if (appliedFilters.date) count++;
    return count;
  }, [appliedFilters]);

  // Handle Log Work Report Submit (POST /api/v1/society/employees/hr/work-reports)
  const handleLogWorkReport = async (e) => {
    e.preventDefault();
    if (!logFormData.employeeId) {
      toast.error('Please select an employee.');
      return;
    }
    if (!logFormData.product?.trim()) {
      toast.error('Please specify the product.');
      return;
    }
    if (logFormData.amount === '' || isNaN(Number(logFormData.amount)) || Number(logFormData.amount) < 0) {
      toast.error('Please enter a valid achievement amount.');
      return;
    }

    setSubmittingLog(true);
    try {
      const payload = {
        employeeId: logFormData.employeeId,
        product: logFormData.product.trim(),
        amount: Number(logFormData.amount),
        date: logFormData.date || new Date().toISOString().slice(0, 10),
        remarks: logFormData.remarks?.trim() || logFormData.tasksCompleted?.trim() || 'Work report logged.',
        tasksCompleted: logFormData.tasksCompleted?.trim() || logFormData.remarks?.trim() || 'Work report logged.',
        hoursSpent: Number(logFormData.hoursSpent) || 8,
      };

      const res = await workReportService.create(payload);
      if (res && (res.success || res.data)) {
        toast.success(res.message || 'Work report logged successfully!');
        setIsLogModalOpen(false);
        setLogFormData({
          employeeId: employeeOptions[0]?.id || employeeOptions[0]?._id || '',
          product: 'Loan Disbursement',
          amount: '',
          date: new Date().toISOString().slice(0, 10),
          tasksCompleted: '',
          hoursSpent: 8,
          remarks: '',
        });
        fetchWorkReports();
      } else {
        toast.error(res?.message || 'Failed to log work report.');
      }
    } catch (err) {
      console.error('Log work report error:', err);
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Error submitting work report.';
      toast.error(msg);
    } finally {
      setSubmittingLog(false);
    }
  };

  // Export Daily Work Reports as CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
      if (appliedFilters.branchId || appliedFilters.branchIds) params.branchId = appliedFilters.branchId || appliedFilters.branchIds;
      if (appliedFilters.employeeId) params.employeeId = appliedFilters.employeeId;
      if (appliedFilters.designations) params.designations = appliedFilters.designations;
      if (appliedFilters.states) params.states = appliedFilters.states;
      if (appliedFilters.date) params.date = appliedFilters.date;

      const blobData = await workReportService.export(params);
      
      const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily_work_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Daily work reports exported successfully!');
    } catch (err) {
      console.error('Export daily work reports error:', err);
      toast.error('Failed to export daily work reports CSV.');
    } finally {
      setExporting(false);
    }
  };

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format Amount or Metric Helper
  const formatAmount = (report) => {
    if (report.formattedAmount) return report.formattedAmount;
    if (report.amount !== undefined && report.amount !== null && report.amount !== '') {
      const num = Number(report.amount);
      if (!isNaN(num)) {
        return `₹${num.toLocaleString('en-IN')}`;
      }
      return report.amount;
    }
    if (report.hoursSpent !== undefined && report.hoursSpent !== null) {
      return `${report.hoursSpent} hrs`;
    }
    return '—';
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
              ? 'bg-[#1cabb1] text-white shadow-sm'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Daily Work Report</h1>
          <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
            <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
            <ChevronRight size={14} className="mx-1" />
            <span>HR Management</span>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-[#1b58a6]">Daily Work Report</span>
          </div>
        </div>

        {/* Log Work Report Button */}
        <button 
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm self-start sm:self-center"
        >
          <Plus size={18} />
          <span>Log Work Report</span>
        </button>
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
                placeholder="Search employee, branch, product..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#1cabb1] bg-gray-50/50"
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
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1b58a6] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchWorkReports}
              disabled={loading}
              className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm shrink-0 bg-white"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-[#1cabb1]' : ''} />
            </button>
          </div>
          
          {/* Export Report Button */}
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>

        {/* Active Filters Display Bar */}
        {activeFilterCount > 0 && (
          <div className="px-6 py-3 bg-teal-50/50 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap text-[13px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-700">Active Filters:</span>
              {appliedFilters.startDate && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  From: {formatDate(appliedFilters.startDate)}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, startDate: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.endDate && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  To: {formatDate(appliedFilters.endDate)}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, endDate: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              {(appliedFilters.branchId || appliedFilters.branchIds) && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  Branch: {branchOptions.find(b => (b.id === (appliedFilters.branchId || appliedFilters.branchIds) || b._id === (appliedFilters.branchId || appliedFilters.branchIds)))?.branchName || branchOptions.find(b => (b.id === (appliedFilters.branchId || appliedFilters.branchIds) || b._id === (appliedFilters.branchId || appliedFilters.branchIds)))?.name || (appliedFilters.branchId || appliedFilters.branchIds)}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, branchId: '', branchIds: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.employeeId && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  Employee: {employeeOptions.find(e => (e.id === appliedFilters.employeeId || e._id === appliedFilters.employeeId))?.fullName || employeeOptions.find(e => (e.id === appliedFilters.employeeId || e._id === appliedFilters.employeeId))?.name || appliedFilters.employeeId}
                  <button onClick={() => setAppliedFilters(prev => ({ ...prev, employeeId: '' }))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
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
              {appliedFilters.date && (
                <span className="bg-white text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  Date: {formatDate(appliedFilters.date)}
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fb]">
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap w-20">Sr.No.</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Employee Name</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Designation</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Branch</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Product / Tasks</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Amount / Hours</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Remarks / Details</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-[#1cabb1]" size={32} />
                      <span className="text-sm font-medium">Loading daily work reports...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="text-gray-300 w-12 h-12 mb-1" />
                      <span className="text-base font-semibold text-gray-700">No Daily Work Reports Found</span>
                      <span className="text-xs text-gray-400">Try logging a work report or adjusting filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((row, index) => {
                  const empName = row.employeeName || row.fullName || row.name || '—';
                  const initials = empName !== '—' 
                    ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                    : 'E';
                  const srNo = row.srNo || ((meta.page - 1) * meta.limit + index + 1);
                  const taskText = row.tasksCompleted || row.product || row.productName || '—';
                  const remarkText = row.remarks || (row.tasksCompleted && row.product ? row.tasksCompleted : '') || '—';

                  return (
                    <tr 
                      key={row.id || row._id || index} 
                      className={`border-b border-gray-50 hover:bg-teal-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="py-4 px-6 text-[14px] text-gray-600 font-medium">{srNo}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <span className="text-[14px] font-semibold text-gray-800 whitespace-nowrap">{empName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[14px] text-gray-600">{row.designation || '—'}</td>
                      <td className="py-4 px-6 text-[14px] text-gray-600">{row.branch || row.branchName || '—'}</td>
                      <td className="py-4 px-6 text-[14px] text-gray-700 font-medium max-w-xs truncate" title={taskText}>
                        {taskText}
                      </td>
                      <td className="py-4 px-6 text-[14px] text-gray-800 font-semibold">{formatAmount(row)}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-500 max-w-xs truncate" title={remarkText}>
                        {remarkText}
                      </td>
                      <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>{formatDate(row.date)}</span>
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

      {/* Log Work Report Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#1cabb1]" />
                <h3 className="text-[18px] font-bold text-gray-800">Log Daily Work Report</h3>
              </div>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleLogWorkReport}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                
                {/* Employee Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                    <User size={14} className="text-[#1cabb1]" /> Employee *
                  </label>
                  <select 
                    required
                    value={logFormData.employeeId}
                    onChange={(e) => setLogFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white"
                  >
                    <option value="">Select Employee</option>
                    {employeeOptions.map((emp) => {
                      const empId = emp.id || emp._id;
                      const empName = emp.fullName || emp.name || `Employee #${empId}`;
                      const empBranch = emp.branchName || emp.branch?.name ? ` (${emp.branchName || emp.branch?.name})` : '';
                      return (
                        <option key={empId} value={empId}>
                          {empName}{empBranch}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Product / Service */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                    <Package size={14} className="text-[#1cabb1]" /> Product / Category *
                  </label>
                  <select 
                    required
                    value={logFormData.product}
                    onChange={(e) => setLogFormData(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white"
                  >
                    {AVAILABLE_PRODUCTS.map((prod) => (
                      <option key={prod} value={prod}>{prod}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-[#1cabb1]" /> Achievement Amount (₹) *
                  </label>
                  <input 
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={logFormData.amount}
                    onChange={(e) => setLogFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="e.g. 200000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white"
                  />
                </div>

                {/* Date and Hours row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Date *</label>
                    <div className="relative">
                      <input 
                        type="date"
                        required
                        value={logFormData.date}
                        onChange={(e) => setLogFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white"
                      />
                      <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Hours Spent */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Hours Spent</label>
                    <input 
                      type="number"
                      min="1"
                      max="24"
                      step="0.5"
                      value={logFormData.hoursSpent}
                      onChange={(e) => setLogFormData(prev => ({ ...prev, hoursSpent: e.target.value }))}
                      placeholder="e.g. 8"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white"
                    />
                  </div>
                </div>

                {/* Tasks Completed & Remarks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Tasks Completed & Remarks</label>
                  <textarea 
                    rows={3}
                    value={logFormData.tasksCompleted}
                    onChange={(e) => setLogFormData(prev => ({ 
                      ...prev, 
                      tasksCompleted: e.target.value,
                      remarks: e.target.value 
                    }))}
                    placeholder="e.g. Completed target documentation and verified loan files."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white resize-none"
                  ></textarea>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-[14px] font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingLog}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white text-[14px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submittingLog ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#1cabb1]" />
                <h3 className="text-[18px] font-bold text-gray-800">Filter Reports</h3>
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
              
              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Start Date</label>
                  <input 
                    type="date" 
                    value={tempFilters.startDate}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">End Date</label>
                  <input 
                    type="date" 
                    value={tempFilters.endDate}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white" 
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Branch</label>
                <select 
                  value={tempFilters.branchId || tempFilters.branchIds}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, branchId: e.target.value, branchIds: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none"
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

              {/* Employee Filter */}
              {employeeOptions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Employee</label>
                  <select 
                    value={tempFilters.employeeId}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none"
                  >
                    <option value="">All Employees</option>
                    {employeeOptions.map((emp) => {
                      const empId = emp.id || emp._id;
                      const empName = emp.fullName || emp.name || `Employee #${empId}`;
                      return (
                        <option key={empId} value={empId}>
                          {empName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Designation Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Designation</label>
                <select 
                  value={tempFilters.designations}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, designations: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none"
                >
                  <option value="">All States / UT</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
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
                className="flex-1 px-4 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white text-[14px] font-bold transition-colors shadow-sm"
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

export default DailyWorkReport;
