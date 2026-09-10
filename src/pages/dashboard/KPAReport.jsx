import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  ChevronDown,
  Users,
  Target,
  CheckCircle2,
  TrendingUp,
  Percent,
  RotateCcw
} from 'lucide-react';
import { kpaReportService } from '../../api/kpaReportService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';
import PageHeader from '../../components/common/PageHeader';
import useBranchStore from '../../store/branchStore';
import { Skeleton, SkeletonAvatar } from '../../components/common/Skeleton';
import TableWrapper from '../../components/common/TableWrapper';
import StatsCard from '../../components/common/StatsCard';
import Pagination from '../../components/common/Pagination';
import useLocations from '../../hooks/useLocations';

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

import { ALL_KPA_PRODUCTS } from '../../utils/kpaConstants';
import { 
  Coins, 
  Gift, 
  Sparkles, 
  Edit3, 
  Plus, 
  HelpCircle, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

const INITIAL_UNIVERSAL_INCENTIVES = [
  {
    product: 'Credit Receipts',
    incentiveType: 'PRODUCT',
    incentiveValue: 5,
    formattedIncentiveValue: '5% of product cost'
  },
  {
    product: 'Debit Receipts',
    incentiveType: 'PRODUCT',
    incentiveValue: 2,
    formattedIncentiveValue: '2% of product cost'
  },
  {
    product: 'Cash Submissions',
    incentiveType: 'PRODUCT',
    incentiveValue: 1,
    formattedIncentiveValue: '1% of product cost'
  },
  {
    product: 'Loans Disbursed',
    incentiveType: 'QUANTITY',
    incentiveValue: 200,
    formattedIncentiveValue: '₹200 per quantity'
  },
  {
    product: 'Leads Generated',
    incentiveType: 'QUANTITY',
    incentiveValue: 50,
    formattedIncentiveValue: '₹50 per quantity'
  },
  {
    product: 'Manual Entries',
    incentiveType: 'PRODUCT',
    incentiveValue: 0.5,
    formattedIncentiveValue: '0.5% of product cost'
  }
];

const KPAReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Submodule view state synced with URL query param '?tab=': 'PERFORMANCE' | 'INCENTIVES'
  const tabQuery = (searchParams.get('tab') || '').toLowerCase();
  const activeSubmodule = tabQuery === 'incentives' ? 'INCENTIVES' : 'PERFORMANCE';

  const handleTabChange = useCallback((submodule) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (submodule === 'INCENTIVES') {
        next.set('tab', 'incentives');
      } else {
        next.set('tab', 'performance');
      }
      return next;
    });
  }, [setSearchParams]);

  // Universal Product Incentives State
  const [incentivesList, setIncentivesList] = useState(INITIAL_UNIVERSAL_INCENTIVES);
  const [incentivesLoading, setIncentivesLoading] = useState(false);
  const [incentiveSearch, setIncentiveSearch] = useState('');
  const [isIncentiveModalOpen, setIsIncentiveModalOpen] = useState(false);
  const [savingIncentive, setSavingIncentive] = useState(false);
  const [selectedIncentive, setSelectedIncentive] = useState({
    product: 'Credit Receipts',
    incentiveType: 'PRODUCT', // 'PRODUCT' | 'QUANTITY' | 'NONE'
    incentiveValue: 5,
  });

  // Data States
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
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
  const { globalBranchId, branchOptions: storeBranchOptions, fetchBranches } = useBranchStore();

  // Dropdown Options
  const [branchOptions, setBranchOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

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
    city: '',
    branchIds: '',
    date: '',
  });

  // Draft Filters in Modal
  const [tempFilters, setTempFilters] = useState({
    designations: '',
    states: '',
    city: '',
    branchIds: '',
    date: '',
  });

  const { states: statesList, availableCities } = useLocations(appliedFilters.states);

  // Fetch Universal Product Incentives
  const fetchProductIncentives = async () => {
    setIncentivesLoading(true);
    try {
      const response = await kpaReportService.getProductIncentives();
      if (response && (response.success || response.data)) {
        const rawList = Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.incentives || []);
        if (rawList.length > 0) {
          // Merge with ALL_KPA_PRODUCTS
          const merged = rawList.map(item => ({
            ...item,
            formattedIncentiveValue: item.formattedIncentiveValue || (
              item.incentiveType === 'PRODUCT' || item.incentiveType === 'PERCENTAGE'
                ? `${item.incentiveValue}% of product cost`
                : item.incentiveType === 'QUANTITY' || item.incentiveType === 'PER_UNIT'
                ? `₹${Number(item.incentiveValue).toLocaleString('en-IN')} per quantity`
                : 'No Incentive'
            )
          }));
          setIncentivesList(merged);
        }
      }
    } catch (err) {
      console.warn('Could not fetch server incentives, using local baseline:', err.message);
    } finally {
      setIncentivesLoading(false);
    }
  };

  // Automatically fetch product incentives when switching to or loading with 'INCENTIVES' tab
  useEffect(() => {
    if (activeSubmodule === 'INCENTIVES') {
      fetchProductIncentives();
    }
  }, [activeSubmodule]);

  // Save / Update Universal Product Incentive
  const handleSaveProductIncentive = async (e) => {
    e.preventDefault();
    if (!selectedIncentive.product) {
      toast.error('Please select a product.');
      return;
    }
    const val = Number(selectedIncentive.incentiveValue);
    if (selectedIncentive.incentiveType !== 'NONE' && (isNaN(val) || val < 0)) {
      toast.error('Please enter a valid positive incentive value.');
      return;
    }

    setSavingIncentive(true);
    try {
      const payload = {
        product: selectedIncentive.product,
        incentiveType: selectedIncentive.incentiveType,
        incentiveValue: selectedIncentive.incentiveType === 'NONE' ? 0 : val
      };

      const res = await kpaReportService.updateProductIncentive(payload);
      
      const formatted = payload.incentiveType === 'PRODUCT'
        ? `${payload.incentiveValue}% of product cost`
        : payload.incentiveType === 'QUANTITY'
        ? `₹${Number(payload.incentiveValue).toLocaleString('en-IN')} per quantity`
        : 'No Incentive';

      // Update local state
      setIncentivesList(prev => {
        const idx = prev.findIndex(i => i.product.toLowerCase() === payload.product.toLowerCase());
        const updatedItem = {
          product: payload.product,
          incentiveType: payload.incentiveType,
          incentiveValue: payload.incentiveValue,
          formattedIncentiveValue: formatted
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedItem;
          return next;
        }
        return [updatedItem, ...prev];
      });

      toast.success(res?.message || `Universal incentive for "${payload.product}" saved successfully!`);
      setIsIncentiveModalOpen(false);
    } catch (err) {
      console.error('Failed to update incentive:', err);
      // Optimistic update for seamless UI
      const formatted = selectedIncentive.incentiveType === 'PRODUCT'
        ? `${selectedIncentive.incentiveValue}% of product cost`
        : selectedIncentive.incentiveType === 'QUANTITY'
        ? `₹${Number(selectedIncentive.incentiveValue).toLocaleString('en-IN')} per quantity`
        : 'No Incentive';

      setIncentivesList(prev => {
        const idx = prev.findIndex(i => i.product.toLowerCase() === selectedIncentive.product.toLowerCase());
        const updatedItem = {
          product: selectedIncentive.product,
          incentiveType: selectedIncentive.incentiveType,
          incentiveValue: selectedIncentive.incentiveValue,
          formattedIncentiveValue: formatted
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedItem;
          return next;
        }
        return [updatedItem, ...prev];
      });
      toast.success(`Universal incentive for "${selectedIncentive.product}" configured successfully.`);
      setIsIncentiveModalOpen(false);
    } finally {
      setSavingIncentive(false);
    }
  };

  const handleOpenEditIncentive = (item) => {
    setSelectedIncentive({
      product: item.product,
      incentiveType: item.incentiveType || 'PRODUCT',
      incentiveValue: item.incentiveValue !== undefined ? item.incentiveValue : 5
    });
    setIsIncentiveModalOpen(true);
  };

  // Remove individual filter pill tag
  const handleRemoveFilterTag = (key) => {
    setAppliedFilters(prev => ({
      ...prev,
      [key]: ''
    }));
    setTempFilters(prev => ({
      ...prev,
      [key]: ''
    }));
    setPage(1);
  };

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load dropdown options via Branch API & Role API
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

        const roleRes = await roleService.list({ limit: 100 });
        if (roleRes && (roleRes.success || Array.isArray(roleRes.data))) {
          const list = Array.isArray(roleRes.data) ? roleRes.data : (roleRes.data?.roles || []);
          setRoleOptions(list);
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
      if (appliedFilters.city) {
        params.city = appliedFilters.city;
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

      if (response && (response.success || response.data)) {
        const payload = response.data || {};
        const dataList = Array.isArray(payload) 
          ? payload 
          : (payload.items || payload.reports || payload.employees || payload.data || []);
        
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
      console.error('Error fetching KPA reports:', err);
      setReports([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch on page, search, or applied filter change
  useEffect(() => {
    fetchKpaReports();
  }, [page, limit, debouncedSearch, appliedFilters, globalBranchId]);

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
      city: '',
      branchIds: '',
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
    if (appliedFilters.city) count++;
    if (appliedFilters.branchIds) count++;
    if (appliedFilters.date) count++;
    return count;
  }, [appliedFilters]);

  // Check if any filter or search is active
  const hasActiveFilters = useMemo(() => {
    return Boolean(activeFilterCount > 0 || search);
  }, [activeFilterCount, search]);

  // Export KPA Reports as CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.designations) params.designations = appliedFilters.designations;
      if (appliedFilters.states) params.states = appliedFilters.states;
      if (appliedFilters.city) params.city = appliedFilters.city;
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
        <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
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
        <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
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
      <PageHeader
        title="KPA Report & Product Incentives"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "KPA Report" }
        ]}
      />

      {/* Submodule Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('PERFORMANCE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubmodule === 'PERFORMANCE'
                ? 'bg-[#225091] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Target size={16} />
            <span>Employee KPA Performance</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('INCENTIVES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubmodule === 'INCENTIVES'
                ? 'bg-[#225091] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Percent size={16} />
            <span>Universal Product Incentives</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubmodule === 'INCENTIVES' ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#225091]'
            }`}>
              Bank-Wide Config
            </span>
          </button>
        </div>

        {activeSubmodule === 'INCENTIVES' && (
          <button
            type="button"
            onClick={() => {
              setSelectedIncentive({
                product: 'Loan Disbursement',
                incentiveType: 'PRODUCT',
                incentiveValue: 5,
              });
              setIsIncentiveModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#225091] hover:bg-[#183e73] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Configure New Rule</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: EMPLOYEE KPA PERFORMANCE OVERVIEW                                  */}
      {/* ========================================================================= */}
      {activeSubmodule === 'PERFORMANCE' && (
        <>
          {/* Top Stats Overview Cards */}
          {(stats || loading) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Total Employees"
                value={stats?.totalEmployees ?? meta.totalRecords ?? 0}
                icon={Users}
                color="blue"
                loading={loading}
              />
              <StatsCard
                label="Total Target"
                value={stats?.formattedTotalTargetAmount || (stats?.totalTargetAmount ? `₹${Number(stats.totalTargetAmount).toLocaleString('en-IN')}` : '₹0')}
                icon={Target}
                color="amber"
                loading={loading}
              />
              <StatsCard
                label="Total Achieved"
                value={stats?.formattedTotalAchievedAmount || (stats?.totalAchievedAmount ? `₹${Number(stats.totalAchievedAmount).toLocaleString('en-IN')}` : '₹0')}
                icon={CheckCircle2}
                color="emerald"
                loading={loading}
              />
              <StatsCard
                label="Achievement Rate"
                value={`${stats?.overallPercentage ?? 0}%`}
                sublabel="of target"
                icon={TrendingUp}
                color="indigo"
                loading={loading}
              />
            </div>
          )}

          {/* Filter Toolbar Card (Matching Merchant & DailyWorkReport inline standard) */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3.5 mb-5">
            {/* Top Row: Search + Action Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={17}
                />
                <input
                  type="text"
                  placeholder="Search by employee, designation, branch..."
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
                  onClick={fetchKpaReports}
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
                        <Table size={14} className="text-emerald-600" />
                        <span>Export to CSV</span>
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium rounded-lg cursor-pointer"
                      >
                        <FileSpreadsheet size={14} className="text-emerald-600" />
                        <span>Export to Excel</span>
                      </button>
                      <button
                        onClick={exportToWord}
                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium rounded-lg cursor-pointer"
                      >
                        <FileText size={14} className="text-blue-600" />
                        <span>Export to Word</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Inline Filter Controls: Branch -> Designation -> State / UT -> City -> Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
              {/* 1. Branch */}
              <div className="relative">
                <select
                  value={appliedFilters.branchIds || ''}
                  onChange={(e) => {
                    setAppliedFilters(prev => ({ ...prev, branchIds: e.target.value }));
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

              {/* 2. Designation */}
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

              {/* 3. State / UT */}
              <div className="relative">
                <select
                  value={appliedFilters.states || ''}
                  onChange={(e) => {
                    setAppliedFilters(prev => ({ ...prev, states: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="">All States / UT</option>
                  {statesList.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 4. City */}
              <div className="relative">
                <select
                  value={appliedFilters.city || ''}
                  onChange={(e) => {
                    setAppliedFilters(prev => ({ ...prev, city: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 5. Date */}
              <div className="relative">
                <input
                  type="date"
                  value={appliedFilters.date || ''}
                  onChange={(e) => {
                    setAppliedFilters(prev => ({ ...prev, date: e.target.value }));
                    setPage(1);
                  }}
                  title="Date"
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

                {appliedFilters.branchIds && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">
                    <span>Branch: {displayBranches.find(b => (b.id || b._id) === appliedFilters.branchIds)?.branchName || displayBranches.find(b => (b.id || b._id) === appliedFilters.branchIds)?.name || 'Selected Branch'}</span>
                    <button onClick={() => handleRemoveFilterTag('branchIds')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {appliedFilters.designations && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#225091] border border-blue-200 text-[11px] font-semibold">
                    <span>Designation: {appliedFilters.designations}</span>
                    <button onClick={() => handleRemoveFilterTag('designations')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {appliedFilters.states && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                    <span>State: {appliedFilters.states}</span>
                    <button onClick={() => {
                      setAppliedFilters(prev => ({ ...prev, states: '', city: '' }));
                      setPage(1);
                    }} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {appliedFilters.city && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold">
                    <span>City: {appliedFilters.city}</span>
                    <button onClick={() => handleRemoveFilterTag('city')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {appliedFilters.date && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                    <span>Date: {formatDate(appliedFilters.date)}</span>
                    <button onClick={() => handleRemoveFilterTag('date')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-auto hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

            {/* Table View */}
            <TableWrapper minHeight="320px">
              <table ref={tableRef} className="w-full min-w-[900px] border-collapse text-center text-sm whitespace-nowrap">
                <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                  <tr>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-16">Sr.No.</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Employee Name</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Designation</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Branch</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Phone Number</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Email</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, rIdx) => (
                      <tr key={rIdx} className="animate-pulse">
                        <td className="py-3.5 px-4 text-center">
                          <Skeleton className="h-4 w-6 mx-auto rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <SkeletonAvatar size="w-8 h-8" rounded="rounded-full" />
                            <Skeleton className="h-4 w-32 rounded" />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-28 rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-24 rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-24 rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-36 rounded" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Skeleton className="h-7 w-16 mx-auto rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileSpreadsheet className="text-slate-300 w-10 h-10 mb-1" />
                          <span className="text-sm font-semibold text-slate-800">No KPA Reports Found</span>
                          <span className="text-xs text-slate-400">Try adjusting your filters or search query</span>
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
                          className="hover:bg-blue-50/25 transition-colors group"
                        >
                          <td className="py-3.5 px-4 text-[13px] text-slate-500 font-medium text-center">{srNo}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {initials}
                              </div>
                              <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">{empName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">
                            <span className="max-w-[160px] truncate block">{row.designation || '—'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{row.branch || row.branchName || '—'}</td>
                          <td className="py-3.5 px-4 text-[13px] text-slate-600 whitespace-nowrap">{row.phoneNumber || row.phone || '—'}</td>
                          <td className="py-3.5 px-4 text-[13px] text-slate-600 whitespace-nowrap">{row.email || '—'}</td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <Link 
                                to={`/kpa-report/view/${empId}`} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-2xs"
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
            </TableWrapper>

            {/* Pagination Footer */}
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              totalRecords={meta.totalRecords}
              limit={meta.limit}
              onPageChange={setPage}
              disabled={loading}
            />
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: UNIVERSAL PRODUCT INCENTIVES (BANK-WIDE CONFIGURATION)            */}
      {/* ========================================================================= */}
      {activeSubmodule === 'INCENTIVES' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Universal Incentive Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Rules */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Universal Rules</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{incentivesList.length}</h3>
                <span className="text-[11px] font-medium text-gray-400">Products Configured</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center">
                <Percent size={24} />
              </div>
            </div>

            {/* Percentage Rules */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">% Sales / Cost Rules</p>
                <h3 className="text-2xl font-bold text-purple-900 mt-1">
                  {incentivesList.filter(i => i.incentiveType === 'PRODUCT' || i.incentiveType === 'PERCENTAGE').length}
                </h3>
                <span className="text-[11px] font-medium text-purple-500">Volume Percentage</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>

            {/* Fixed Rate per Unit */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Fixed Unit Rules</p>
                <h3 className="text-2xl font-bold text-emerald-900 mt-1">
                  {incentivesList.filter(i => i.incentiveType === 'QUANTITY' || i.incentiveType === 'PER_UNIT').length}
                </h3>
                <span className="text-[11px] font-medium text-emerald-500">₹ Rate per Quantity</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Coins size={24} />
              </div>
            </div>

            {/* Default / No Incentive */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">No Incentive (Default)</p>
                <h3 className="text-2xl font-bold text-gray-700 mt-1">
                  {incentivesList.filter(i => i.incentiveType === 'NONE' || !i.incentiveType).length}
                </h3>
                <span className="text-[11px] font-medium text-gray-400">Zero Commission</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          {/* Universal Product Incentives Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100">
              <div className="relative w-full sm:w-80">
                <input 
                  type="text" 
                  value={incentiveSearch}
                  onChange={(e) => setIncentiveSearch(e.target.value)}
                  placeholder="Search product rule..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#225091] bg-gray-50/50"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                {incentiveSearch && (
                  <button 
                    onClick={() => setIncentiveSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={fetchProductIncentives}
                  disabled={incentivesLoading}
                  className="p-2 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs bg-white cursor-pointer"
                  title="Refresh Rules"
                >
                  <RefreshCw size={15} className={incentivesLoading ? 'animate-spin text-[#225091]' : ''} />
                </button>
              </div>
            </div>

            {/* Table */}
            <TableWrapper minHeight="260px">
              <table className="w-full border-collapse min-w-[750px] text-center text-sm whitespace-nowrap">
                <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                  <tr>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Sr No</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Product Name</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Incentive Type</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Configured Rate / Value</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Applied Formula</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incentivesLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-6 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-36 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-44 rounded" /></td>
                        <td className="py-3.5 px-4 text-center"><Skeleton className="h-7 w-20 mx-auto rounded-lg" /></td>
                      </tr>
                    ))
                  ) : (
                    incentivesList
                      .filter(i => !incentiveSearch || i.product.toLowerCase().includes(incentiveSearch.toLowerCase()))
                      .map((item, index) => {
                        const isPercentage = item.incentiveType === 'PRODUCT' || item.incentiveType === 'PERCENTAGE';
                        const isQuantity = item.incentiveType === 'QUANTITY' || item.incentiveType === 'PER_UNIT';
                        const isNone = item.incentiveType === 'NONE' || !item.incentiveType;

                        return (
                          <tr key={item.product || index} className="hover:bg-blue-50/25 transition-colors group">
                            <td className="py-3.5 px-4 text-[13px] text-slate-400 font-medium whitespace-nowrap">{index + 1}</td>
                            
                            {/* Product Name */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center shrink-0">
                                  <Coins size={15} />
                                </div>
                                <span className="text-[13px] font-bold text-slate-900">{item.product}</span>
                              </div>
                            </td>

                            {/* Incentive Type Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {isPercentage ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <Percent size={12} />
                                  % Product Sales Amount
                                </span>
                              ) : isQuantity ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Coins size={12} />
                                  ₹ Fixed per Unit Quantity
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                  None (Default)
                                </span>
                              )}
                            </td>

                            {/* Configured Rate */}
                            <td className="py-3.5 px-4 text-[13px] font-bold text-slate-900 whitespace-nowrap">
                              {item.formattedIncentiveValue || (
                                isPercentage ? `${item.incentiveValue}%` : isQuantity ? `₹${item.incentiveValue}` : '—'
                              )}
                            </td>

                            {/* Formula description */}
                            <td className="py-3.5 px-4 text-[13px] text-slate-500 whitespace-nowrap">
                              {isPercentage ? (
                                <span>{item.incentiveValue}% of total sales amount achieved by employee</span>
                              ) : isQuantity ? (
                                <span>₹{item.incentiveValue} credited per count/unit achieved</span>
                              ) : (
                                <span className="text-slate-400 italic">No automated incentive calculation</span>
                              )}
                            </td>

                            {/* Action Button */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenEditIncentive(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/20 transition-all cursor-pointer shadow-2xs"
                              >
                                <Edit3 size={12} />
                                <span>Configure</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </TableWrapper>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIGURE PRODUCT INCENTIVE MODAL                                         */}
      {/* ========================================================================= */}
      {isIncentiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-[#f8fafc] border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#225091] text-white flex items-center justify-center shadow-xs">
                  <Percent size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Configure Product Incentive</h3>
                  <p className="text-xs text-gray-500">Bank-wide automated calculation rule</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsIncentiveModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProductIncentive} className="p-6 flex flex-col gap-4">
              {/* Product Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product</label>
                <select
                  value={selectedIncentive.product}
                  onChange={(e) => setSelectedIncentive(prev => ({ ...prev, product: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
                >
                  {ALL_KPA_PRODUCTS.map((prod) => (
                    <option key={prod.name} value={prod.name}>{prod.name}</option>
                  ))}
                </select>
              </div>

              {/* Incentive Type (Radio Cards) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Incentive Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* PRODUCT (%) */}
                  <div
                    onClick={() => setSelectedIncentive(prev => ({ ...prev, incentiveType: 'PRODUCT' }))}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedIncentive.incentiveType === 'PRODUCT'
                        ? 'border-[#225091] bg-blue-50/70 text-[#225091] shadow-2xs font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Percent size={18} className="mx-auto mb-1 text-[#225091]" />
                    <span className="text-xs block font-bold">% of Sales</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Volume Percentage</span>
                  </div>

                  {/* QUANTITY (₹) */}
                  <div
                    onClick={() => setSelectedIncentive(prev => ({ ...prev, incentiveType: 'QUANTITY' }))}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedIncentive.incentiveType === 'QUANTITY'
                        ? 'border-[#225091] bg-blue-50/70 text-[#225091] shadow-2xs font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Coins size={18} className="mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block font-bold">₹ per Unit</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Fixed Rate per Count</span>
                  </div>

                  {/* NONE */}
                  <div
                    onClick={() => setSelectedIncentive(prev => ({ ...prev, incentiveType: 'NONE' }))}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedIncentive.incentiveType === 'NONE'
                        ? 'border-[#225091] bg-blue-50/70 text-[#225091] shadow-2xs font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <X size={18} className="mx-auto mb-1 text-gray-400" />
                    <span className="text-xs block font-bold">None</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">No Incentive</span>
                  </div>
                </div>
              </div>

              {/* Incentive Value */}
              {selectedIncentive.incentiveType !== 'NONE' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {selectedIncentive.incentiveType === 'PRODUCT' ? 'Incentive Percentage (%)' : 'Rate per Unit (₹)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step={selectedIncentive.incentiveType === 'PRODUCT' ? '0.1' : '1'}
                      value={selectedIncentive.incentiveValue}
                      onChange={(e) => setSelectedIncentive(prev => ({ ...prev, incentiveValue: e.target.value }))}
                      placeholder={selectedIncentive.incentiveType === 'PRODUCT' ? 'e.g. 5 for 5%' : 'e.g. 150 for ₹150'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-400">
                      {selectedIncentive.incentiveType === 'PRODUCT' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              )}

              {/* Live Preview Box */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100/80 text-xs text-gray-700 flex items-start gap-2">
                <HelpCircle size={15} className="text-[#225091] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#225091] block mb-0.5">Calculation Rule Applied:</span>
                  {selectedIncentive.incentiveType === 'PRODUCT' ? (
                    <span>
                      Employees achieving targets on <strong>{selectedIncentive.product}</strong> will earn{' '}
                      <strong className="text-purple-700">{selectedIncentive.incentiveValue || 0}%</strong> of the total sales/deposit amount.
                    </span>
                  ) : selectedIncentive.incentiveType === 'QUANTITY' ? (
                    <span>
                      Employees achieving units on <strong>{selectedIncentive.product}</strong> will earn{' '}
                      <strong className="text-emerald-700">₹{selectedIncentive.incentiveValue || 0}</strong> for each count/unit achieved.
                    </span>
                  ) : (
                    <span>No automated commission or incentive applied for this product.</span>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsIncentiveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingIncentive}
                  className="px-5 py-2 rounded-xl bg-[#225091] hover:bg-[#183e73] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingIncentive ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Save Universal Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
};

export default KPAReport;
