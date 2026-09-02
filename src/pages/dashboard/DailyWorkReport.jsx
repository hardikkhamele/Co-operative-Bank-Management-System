import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  IndianRupee,
  Table,
  ChevronDown,
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  RotateCcw
} from 'lucide-react';
import { workReportService } from '../../api/workReportService';
import { branchService } from '../../api/branchService';
import { employeeService } from '../../api/employeeService';
import { roleService } from '../../api/roleService';
import PageHeader from '../../components/common/PageHeader';
import useAuthStore from '../../store/authStore';
import useBranchStore from '../../store/branchStore';
import { Skeleton, SkeletonAvatar } from '../../components/common/Skeleton';
import { ALL_KPA_PRODUCTS } from '../../utils/kpaConstants';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal'
];

const DEFAULT_DESIGNATIONS = [
  'Branch Manager', 'Assistant Branch Manager', 'Loan Executive',
  'Collection Executive', 'Senior Clerk', 'Clerk', 'Cashier',
  'Accountant', 'Field Officer', 'Receipt Management Executive'
];

const AVAILABLE_PRODUCTS = [
  'Credit Receipts',
  'Debit Receipts',
  'Cash Submissions',
  'Loans Disbursed',
  'Leads Generated',
  'Manual Entries'
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
};

const formatAmount = (row) => {
  if (!row) return '₹0';
  if (row.formattedAmount) return row.formattedAmount;
  if (row.amount !== undefined && row.amount !== null && row.amount !== '') {
    const num = Number(row.amount);
    if (!isNaN(num)) return `₹${num.toLocaleString('en-IN')}`;
  }
  return '₹0';
};

const DailyWorkReport = () => {
  const { user } = useAuthStore();
  const tableRef = useRef(null);

  // Data States
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
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
  const { globalBranchId, branchOptions: storeBranchOptions, fetchBranches } = useBranchStore();

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

  // Fetch branches from store
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Combined branch options from API & store
  const displayBranches = useMemo(() => {
    if (branchOptions.length > 0) return branchOptions;
    if (storeBranchOptions && storeBranchOptions.length > 0) return storeBranchOptions;
    return [];
  }, [branchOptions, storeBranchOptions]);

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

  // Load dropdown options via Branch API, Role API, and Employee API
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        let branches = [];
        try {
          const bRes = await branchService.getDropdownList();
          if (bRes && bRes.success && Array.isArray(bRes.data)) {
            branches = bRes.data;
          }
        } catch (e) {
          console.warn("Dropdown list endpoint failed, attempting fallback branchService.list()...", e);
        }

        if (branches.length === 0) {
          try {
            const bRes = await branchService.list({ limit: 100 });
            if (bRes && bRes.success) {
              branches = Array.isArray(bRes.data)
                ? bRes.data
                : (bRes.data?.branches || bRes.data?.items || []);
            }
          } catch (e) {
            console.warn("branchService.list() error:", e);
          }
        }

        if (branches.length > 0) {
          setBranchOptions(branches);
        }

        const [roleRes, empRes] = await Promise.allSettled([
          roleService.list({ limit: 100 }),
          employeeService.list({ limit: 100 }),
        ]);

        if (roleRes.status === 'fulfilled' && roleRes.value?.success) {
          const list = roleRes.value.data || [];
          setRoleOptions(Array.isArray(list) ? list : (list.roles || []));
        }
        if (empRes.status === 'fulfilled' && (empRes.value?.success || Array.isArray(empRes.value?.data))) {
          const list = Array.isArray(empRes.value.data) ? empRes.value.data : (empRes.value.data?.employees || []);
          setEmployeeOptions(list);
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
      } else if (globalBranchId) {
        params.branchId = globalBranchId;
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
      
      if (response && (response.success || response.data)) {
        const payload = response.data || {};
        const dataList = Array.isArray(payload) 
          ? payload 
          : (payload.items || payload.reports || payload.workReports || payload.data || []);
        
        setReports(dataList);

        if (payload.stats) {
          setStats(payload.stats);
        } else if (response.stats) {
          setStats(response.stats);
        }

        const paginationMeta = payload.meta || response.meta || response.pagination || {
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
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching daily work reports:', err);
      setReports([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch on filter/page/search change
  useEffect(() => {
    fetchWorkReports();
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
      branchId: '',
      employeeId: '',
      startDate: '',
      endDate: '',
      date: '',
    };
    setTempFilters(reset);
    setAppliedFilters(reset);
    setSearch('');
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

  // Check if any filter or search is active
  const hasActiveFilters = useMemo(() => {
    return Boolean(activeFilterCount > 0 || search);
  }, [activeFilterCount, search]);

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
      console.error('Error logging work report:', err);
      toast.error(err.response?.data?.message || 'Failed to log work report.');
    } finally {
      setSubmittingLog(false);
    }
  };

  // Export handlers
  const getSelectedDataFromTable = () => {
    const headers = ['Sr.No.', 'Employee Name', 'Designation', 'Branch', 'Product / KPI Area', 'Amount', 'Source', 'Remarks', 'Date'];
    const rows = reports.map((row, idx) => {
      const sr = row.srNo || ((meta.page - 1) * meta.limit + idx + 1);
      const isAuto = Boolean(row.isAutoGenerated || (row.sourceModule && row.sourceModule !== 'MANUAL'));
      const src = row.sourceModule || (isAuto ? 'AUTO' : 'MANUAL');
      return [
        sr,
        row.employeeName || row.name || '—',
        row.designation || '—',
        row.branch || row.branchName || '—',
        row.product || row.tasksCompleted || '—',
        formatAmount(row),
        src,
        row.remarks || '—',
        formatDate(row.date)
      ];
    });
    return { headers, rows };
  };

  const exportToCSV = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(i => `"${i}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Daily_Work_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  // Calculate Stat Display Values
  const totalReportsCount = stats?.totalWorkReports ?? meta.totalRecords ?? reports.length;
  const totalAmountDisplay = stats?.formattedTotalAmount || (stats?.totalAmount !== undefined ? `₹${Number(stats.totalAmount).toLocaleString('en-IN')}` : '₹0');
  const autoGenCount = stats?.autoGeneratedCount ?? reports.filter(r => r.isAutoGenerated || (r.sourceModule && r.sourceModule !== 'MANUAL')).length;
  const manualCount = stats?.manualCount ?? (totalReportsCount - autoGenCount);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header Card */}
      <PageHeader
        title="Daily Work Report"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "Daily Work Report" }
        ]}
      >
        <button 
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 bg-[#225091] hover:bg-[#183c6d] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Log Work Report</span>
        </button>
      </PageHeader>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Work Reports</p>
            <h3 className="text-2xl font-black text-[#1b2559] tabular-nums">{totalReportsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>

        {/* Card 2: Total Achievement Amount */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Achieved Amount</p>
            <h3 className="text-2xl font-black text-emerald-600 tabular-nums">{totalAmountDisplay}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Card 3: Auto-Generated */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Auto-Generated</p>
            <h3 className="text-2xl font-black text-amber-600 tabular-nums">{autoGenCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Zap size={22} />
          </div>
        </div>

        {/* Card 4: Manual Count */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Manual Entries</p>
            <h3 className="text-2xl font-black text-indigo-600 tabular-nums">{manualCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card (Matching Merchant submodule inline standard) */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3.5">
        {/* Top Row: Search + Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={17}
            />
            <input
              type="text"
              placeholder="Search by employee, branch, product, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={fetchWorkReports}
              disabled={loading}
              className="p-2.5 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs bg-white cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-[#225091]' : ''} />
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-colors text-xs shadow-2xs border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <Download size={15} />
                <span>Export</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 p-1.5">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium rounded-lg cursor-pointer"
                  >
                    <Table size={14} className="text-gray-500" />
                    <span>Export to CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Log Daily Work Entry Button */}
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-[#225091] hover:bg-[#183f72] text-white rounded-xl font-bold text-xs transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>Log Daily Work</span>
            </button>
          </div>
        </div>

        {/* Bottom Inline Filter Controls: Branch -> Employee -> Designation -> Start Date -> End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
          {/* 1. Branch */}
          <div className="relative">
            <select
              value={appliedFilters.branchId || appliedFilters.branchIds || ''}
              onChange={(e) => {
                setAppliedFilters(prev => ({ ...prev, branchId: e.target.value, branchIds: e.target.value }));
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Branches</option>
              {displayBranches.map((branch) => {
                const bId = branch.id || branch._id;
                const bName = branch.branchName || branch.name || `Branch #${bId}`;
                return <option key={bId} value={bId}>{bName}</option>;
              })}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 2. Employee */}
          <div className="relative">
            <select
              value={appliedFilters.employeeId || ''}
              onChange={(e) => {
                setAppliedFilters(prev => ({ ...prev, employeeId: e.target.value }));
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Employees</option>
              {employeeOptions.map(e => (
                <option key={e.id || e._id} value={e.id || e._id}>
                  {e.fullName || e.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 3. Designation */}
          <div className="relative">
            <select
              value={appliedFilters.designations || ''}
              onChange={(e) => {
                setAppliedFilters(prev => ({ ...prev, designations: e.target.value }));
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Designations</option>
              {roleOptions.length > 0 ? (
                roleOptions.map((role) => (
                  <option key={role.id || role._id || role.name} value={role.name || role.roleName}>
                    {role.name || role.roleName}
                  </option>
                ))
              ) : (
                DEFAULT_DESIGNATIONS.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))
              )}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 4. Start Date */}
          <div className="relative">
            <input
              type="date"
              value={appliedFilters.startDate || ''}
              onChange={(e) => {
                setAppliedFilters(prev => ({ ...prev, startDate: e.target.value }));
                setPage(1);
              }}
              title="Start Date"
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs cursor-pointer"
            />
          </div>

          {/* 5. End Date */}
          <div className="relative">
            <input
              type="date"
              value={appliedFilters.endDate || ''}
              onChange={(e) => {
                setAppliedFilters(prev => ({ ...prev, endDate: e.target.value }));
                setPage(1);
              }}
              title="End Date"
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs cursor-pointer"
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-100 flex items-center flex-wrap gap-2 text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1 mr-1">
              Active:
            </span>

            {(appliedFilters.branchId || appliedFilters.branchIds) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">
                <span>Branch: {displayBranches.find(b => (b.id === (appliedFilters.branchId || appliedFilters.branchIds) || b._id === (appliedFilters.branchId || appliedFilters.branchIds)))?.branchName || displayBranches.find(b => (b.id === (appliedFilters.branchId || appliedFilters.branchIds) || b._id === (appliedFilters.branchId || appliedFilters.branchIds)))?.name || 'Selected Branch'}</span>
                <button onClick={() => setAppliedFilters(prev => ({ ...prev, branchId: '', branchIds: '' }))} className="hover:text-rose-600 cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}

            {appliedFilters.employeeId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                <span>Employee: {employeeOptions.find(e => (e.id === appliedFilters.employeeId || e._id === appliedFilters.employeeId))?.fullName || 'Selected Employee'}</span>
                <button onClick={() => setAppliedFilters(prev => ({ ...prev, employeeId: '' }))} className="hover:text-rose-600 cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}

            {appliedFilters.designations && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#225091] border border-blue-200 text-[11px] font-semibold">
                <span>Designation: {appliedFilters.designations}</span>
                <button onClick={() => setAppliedFilters(prev => ({ ...prev, designations: '' }))} className="hover:text-rose-600 cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}

            {appliedFilters.startDate && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                <span>From: {formatDate(appliedFilters.startDate)}</span>
                <button onClick={() => setAppliedFilters(prev => ({ ...prev, startDate: '' }))} className="hover:text-rose-600 cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}

            {appliedFilters.endDate && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                <span>To: {formatDate(appliedFilters.endDate)}</span>
                <button onClick={() => setAppliedFilters(prev => ({ ...prev, endDate: '' }))} className="hover:text-rose-600 cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilter}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-auto hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

        {/* Table View */}
        <div className="overflow-x-auto min-h-[300px] relative">
          <table ref={tableRef} className="w-full min-w-[900px] text-left border-collapse">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold text-center w-16">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Employee Name</th>
                <th className="py-3.5 px-5 font-semibold">Designation</th>
                <th className="py-3.5 px-5 font-semibold">Branch</th>
                <th className="py-3.5 px-5 font-semibold">Product / KPI Area</th>
                <th className="py-3.5 px-5 font-semibold">Amount / Target</th>
                <th className="py-3.5 px-5 font-semibold">Source</th>
                <th className="py-3.5 px-5 font-semibold">Remarks</th>
                <th className="py-3.5 px-5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-5 text-center"><Skeleton className="h-4 w-6 mx-auto rounded" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-6 w-28 rounded-full" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-5 w-20 rounded-md" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20 rounded" /></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="text-gray-300 w-10 h-10 mb-1" />
                      <span className="text-sm font-semibold text-gray-800">No Daily Work Reports Found</span>
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
                  const taskText = row.product || row.tasksCompleted || row.productName || '—';
                  const remarkText = row.remarks || (row.tasksCompleted && row.product ? row.tasksCompleted : '') || '—';
                  const isAuto = Boolean(row.isAutoGenerated || (row.sourceModule && row.sourceModule !== 'MANUAL'));
                  const sourceModule = (row.sourceModule || (isAuto ? 'AUTO' : 'MANUAL')).toUpperCase();

                  return (
                    <tr 
                      key={row.id || row._id || index} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-center text-[13px] text-gray-500 font-medium">{srNo}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap block">{empName}</span>
                            {row.employeeCode && (
                              <span className="text-[10px] text-gray-400 font-mono">({row.employeeCode})</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.designation || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.branch || row.branchName || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-800 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {taskText}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-sm font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                        {formatAmount(row)}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {isAuto ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60" title={`Auto Logged via ${sourceModule}`}>
                            <Zap size={11} className="text-amber-600" />
                            <span>Auto: {sourceModule}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
                            Manual Entry
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-500 max-w-xs truncate" title={remarkText}>
                        {remarkText}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
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
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
          <div>
            Showing {reports.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, meta.totalRecords)} of {meta.totalRecords} Entries
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={meta.page <= 1 || loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="px-3 py-1 bg-[#225091] text-white rounded-lg font-bold text-xs shadow-2xs">
              {page} / {meta.totalPages || 1}
            </span>

            <button 
              onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))}
              disabled={meta.page >= meta.totalPages || loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>



      {/* Log Work Report Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus size={18} className="text-[#225091]" />
                Log Daily Work Report
              </h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogWorkReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Employee *</label>
                <select 
                  value={logFormData.employeeId}
                  onChange={(e) => setLogFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 bg-white"
                  required
                >
                  <option value="">Select Employee</option>
                  {employeeOptions.map(e => (
                    <option key={e.id || e._id} value={e.id || e._id}>
                      {e.fullName || e.name} ({e.branch?.name || e.branchName || 'Branch'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Product / Task *</label>
                <select 
                  value={logFormData.product}
                  onChange={(e) => setLogFormData(prev => ({ ...prev, product: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 bg-white"
                  required
                >
                  {AVAILABLE_PRODUCTS.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
                  <input 
                    type="number"
                    value={logFormData.amount}
                    onChange={(e) => setLogFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="e.g. 50000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date *</label>
                  <input 
                    type="date"
                    value={logFormData.date}
                    onChange={(e) => setLogFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Remarks / Details</label>
                <textarea 
                  value={logFormData.remarks}
                  onChange={(e) => setLogFormData(prev => ({ ...prev, remarks: e.target.value, tasksCompleted: e.target.value }))}
                  placeholder="Enter remarks or details about the work done..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 bg-white"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  disabled={submittingLog}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingLog}
                  className="flex-1 py-2.5 px-4 bg-[#225091] hover:bg-[#193e6f] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submittingLog ? "Submitting..." : "Log Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DailyWorkReport;
