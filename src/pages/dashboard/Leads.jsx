import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  X,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Table,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { leadService } from "../../api/leadService";
import { creditReceiptService } from "../../api/creditReceiptService";
import { branchService } from "../../api/branchService";
import useBranchStore from "../../store/branchStore";

const getStatusBadge = (status) => {
  const normalized = (status || "").toUpperCase();
  switch (normalized) {
    case "NEW":
      return (
        <span className="px-4 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold whitespace-nowrap">
          New
        </span>
      );
    case "PENDING_DOWN_PAYMENT":
      return (
        <span className="px-4 py-1.5 rounded-md bg-amber-50 border border-amber-300 text-amber-600 text-xs font-semibold whitespace-nowrap">
          Pending Down Payment
        </span>
      );
    case "ACTIVE":
      return (
        <span className="px-4 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[#1B58A6] text-xs font-semibold whitespace-nowrap">
          Active
        </span>
      );
    case "COMPLETED":
      return (
        <span className="px-4 py-1.5 rounded-md bg-green-50 border border-green-400 text-[#00c950] text-xs font-semibold whitespace-nowrap">
          Completed
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-4 py-1.5 rounded-md bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold whitespace-nowrap">
          Rejected
        </span>
      );
    default:
      return (
        <span className="px-4 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold whitespace-nowrap">
          {status || "N/A"}
        </span>
      );
  }
};

const getInitials = (name) => {
  if (!name) return "LD";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Leads = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialBranchId = searchParams.get("branchId") || "";
  const initialState = searchParams.get("state") || "";
  const initialCity = searchParams.get("city") || "";
  const initialDateFrom = searchParams.get("dateFrom") || "";
  const initialDateTo = searchParams.get("dateTo") || "";
  const initialPage = parseInt(searchParams.get("page"), 10) || 1;

  // Data states
  const [leads, setLeads] = useState([]);
  // Stats State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(8);
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    page: initialPage,
    limit: 8,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [branchesList, setBranchesList] = useState([]);
  const [locationsData, setLocationsData] = useState({
    states: [],
    cities: [],
    stateCitiesMap: {},
  });
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [availableCities, setAvailableCities] = useState([]);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const globalBranchId = useBranchStore((state) => state.globalBranchId);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Sync state changes to URL search params
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedStatus) params.status = selectedStatus;
    if (selectedBranchId) params.branchId = selectedBranchId;
    if (selectedState) params.state = selectedState;
    if (selectedCity) params.city = selectedCity;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedStatus,
    selectedBranchId,
    selectedState,
    selectedCity,
    dateFrom,
    dateTo,
    page,
    setSearchParams,
  ]);

  // Sync URL changes from browser navigation (back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "";
    const urlBranchId = searchParams.get("branchId") || "";
    const urlState = searchParams.get("state") || "";
    const urlCity = searchParams.get("city") || "";
    const urlDateFrom = searchParams.get("dateFrom") || "";
    const urlDateTo = searchParams.get("dateTo") || "";
    const urlPage = parseInt(searchParams.get("page"), 10) || 1;

    if (urlSearch !== debouncedSearch) {
      setSearchTerm(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
    if (urlBranchId !== selectedBranchId) setSelectedBranchId(urlBranchId);
    if (urlState !== selectedState) setSelectedState(urlState);
    if (urlCity !== selectedCity) setSelectedCity(urlCity);
    if (urlDateFrom !== dateFrom) setDateFrom(urlDateFrom);
    if (urlDateTo !== dateTo) setDateTo(urlDateTo);
    if (urlPage !== page) setPage(urlPage);
  }, [searchParams]);

  useEffect(() => {
    const fetchBranchesList = async () => {
      try {
        const res = await branchService.getDropdownList();
        if (res && res.success) {
          setBranchesList(res.data || []);
        }
      } catch (err) {
        console.warn("Failed to fetch branches dropdown for Leads:", err);
      }
    };
    fetchBranchesList();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await leadService.getLocations();
        if (res && res.success) {
          const data = res.data || {};
          const states = data.states || [];
          const cities = data.cities || [];
          const stateCitiesMap = data.stateCitiesMap || {};
          setLocationsData({ states, cities, stateCitiesMap });
        }
      } catch (err) {
        console.warn("Failed to fetch leads locations:", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedState && locationsData.stateCitiesMap[selectedState]) {
      setAvailableCities(locationsData.stateCitiesMap[selectedState]);
    } else if (locationsData.cities && locationsData.cities.length > 0) {
      setAvailableCities(locationsData.cities);
    } else {
      setAvailableCities([]);
    }
  }, [selectedState, locationsData]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (selectedState) {
        params.state = selectedState;
      }

      if (selectedCity) {
        params.city = selectedCity;
      }

      if (dateFrom) {
        params.dateFrom = dateFrom;
      }

      if (dateTo) {
        params.dateTo = dateTo;
      }

      if (selectedBranchId) {
        params.branchId = selectedBranchId;
      } else if (globalBranchId) {
        params.branchId = globalBranchId;
      }

      const res = await leadService.list(params);
      if (res && res.success) {
        setLeads(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        } else if (res.data && res.data.stats) {
          setStats(res.data.stats);
        }
        if (
          res.meta ||
          res.pagination ||
          res.data?.meta ||
          res.data?.pagination
        ) {
          setMeta(
            res.meta ||
              res.pagination ||
              res.data?.meta ||
              res.data?.pagination,
          );
        }
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      const errMsg = err.response?.data?.message || "Failed to fetch leads.";
      toast.error(errMsg);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    selectedStatus,
    selectedBranchId,
    selectedState,
    selectedCity,
    dateFrom,
    dateTo,
    globalBranchId,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Export leads to CSV
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const params = {
        page,
        limit: 100, // Export maximum allowed records or current filters
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus;
      if (selectedBranchId) params.branchId = selectedBranchId;
      else if (globalBranchId) params.branchId = globalBranchId;
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const blobData = await leadService.export(params);
      const url = window.URL.createObjectURL(
        new Blob([blobData], { type: "text/csv;charset=utf-8;" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "leads.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Leads exported successfully.");
    } catch (err) {
      console.error("Failed to export leads:", err);
      const errMsg = err.response?.data?.message || "Failed to export leads.";
      toast.error(errMsg);
    } finally {
      setExporting(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async () => {
    if (!leadToDelete?.id) return;
    setDeleteSubmitting(true);
    try {
      const res = await leadService.delete(leadToDelete.id);
      if (res && res.success) {
        toast.success(res.message || "Lead deleted successfully.");
        setIsDeleteModalOpen(false);
        setLeadToDelete(null);
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
      const errMsg = err.response?.data?.message || "Failed to delete lead.";
      toast.error(errMsg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const tableRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const getSelectedDataFromTable = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const table = tableRef.current;

    // Headers (skip last action column)
    const ths = Array.from(table.querySelectorAll("thead th"));
    const headers = ths
      .slice(0, -1)
      .map((th) => th.innerText.trim().replace(/\n/g, " "));

    // Rows (all rows)
    const trs = Array.from(table.querySelectorAll("tbody tr"));
    const rows = trs.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"));
      return tds
        .slice(0, -1)
        .map((td) => td.innerText.trim().replace(/\n/g, " "));
    });

    return { headers, rows };
  };

  const exportToCSV = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((v) => '"' + v.replace(/"/g, '""') + '"').join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Export.csv";
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <table ref={tableRef}  border="1">
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `;
    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Export.xls";
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export</title></head><body>
      <table border="1">
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
      </body></html>
    `;
    const blob = new Blob([tableHtml], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Export.doc";
    link.click();
    setIsExportOpen(false);
  };

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-[#225091] m-0">Leads</h2>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link
            to="/dashboard"
            className="hover:text-gray-800 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>CRM Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#225091]">Leads</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div
            onClick={() => {
              setSelectedStatus("");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${!selectedStatus ? "border-[#225091] ring-1 ring-[#225091]" : "border-gray-100"}`}
          >
            <span className="text-[26px] font-bold text-[#225091] leading-none mb-1">
              {stats.totalLeads ?? stats.total ?? 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Total Leads
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("NEW");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "NEW" ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-100"}`}
          >
            <span className="text-[26px] font-bold text-blue-600 leading-none mb-1">
              {stats.newLeads ?? stats.new ?? 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              New Leads
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("PENDING_DOWN_PAYMENT");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "PENDING_DOWN_PAYMENT" ? "border-amber-500 ring-1 ring-amber-500" : "border-gray-100"}`}
          >
            <span className="text-[26px] font-bold text-amber-500 leading-none mb-1">
              {stats.pendingDownPaymentLeads ?? stats.pendingDownPayment ?? 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Pending Down Payment
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("ACTIVE");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "ACTIVE" ? "border-emerald-500 ring-1 ring-emerald-500" : "border-gray-100"}`}
          >
            <span className="text-[26px] font-bold text-emerald-500 leading-none mb-1">
              {stats.activeLeads ?? stats.active ?? 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Active Leads
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("COMPLETED");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "COMPLETED" ? "border-green-600 ring-1 ring-green-600" : "border-gray-100"}`}
          >
            <span className="text-[26px] font-bold text-green-600 leading-none mb-1">
              {stats.completedLeads ?? stats.completed ?? 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Completed
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("REJECTED");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "REJECTED" ? "border-red-500 ring-1 ring-red-500" : "border-gray-100"}`}
          >
            <span className="text-[26px] font-bold text-red-500 leading-none mb-1">
              {stats.rejectedLeads ?? stats.rejected ?? 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Rejected
            </span>
          </div>
        </div>
      )}

      {/* Action Bar & Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top Row: Search & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm bg-white text-gray-700"
                placeholder="Search application no, name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Export & Create */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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
                    <button
                      onClick={exportToCSV}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <Table size={16} className="text-green-600" />
                      Export to CSV
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <FileSpreadsheet size={16} className="text-green-600" />
                      Export to Excel
                    </button>
                    <button
                      onClick={exportToWord}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <FileText size={16} className="text-blue-600" />
                      Export to Word
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/leads/create"
              className="bg-[#225091] hover:bg-[#163a6c] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0 flex items-center gap-2"
            >
              + Create Lead
            </Link>
          </div>
        </div>

        {/* Bottom Row: Inline Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Filters:
            </span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm text-gray-700 min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="PENDING_DOWN_PAYMENT">Pending Down Payment</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm text-gray-700 min-w-[140px]"
          >
            <option value="">All Branches</option>
            {branchesList.map((b) => (
              <option key={b.id || b._id} value={b.id || b._id}>
                {b.name || b.branchName}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm text-gray-700 min-w-[140px]"
          >
            <option value="">All States</option>
            {locationsData.states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setPage(1);
            }}
            disabled={availableCities.length === 0}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm text-gray-700 min-w-[140px] disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm text-gray-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm text-gray-700"
            />
          </div>

          {(selectedStatus ||
            selectedBranchId ||
            selectedState ||
            selectedCity ||
            dateFrom ||
            dateTo) && (
            <button
              onClick={() => {
                setSelectedStatus("");
                setSelectedBranchId("");
                setDateFrom("");
                setDateTo("");
                setSelectedState("");
                setSelectedCity("");
                setPage(1);
              }}
              className="ml-auto px-4 py-2 rounded-lg text-[#225091] font-semibold hover:bg-blue-50 transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            ref={tableRef}
            className="w-full text-left border-collapse min-w-[1000px]"
          >
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Sr.No.
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Application Number
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Customer Name
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Phone Number
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Branch
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Employee Name
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Address
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">
                  Status
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2
                        size={32}
                        className="animate-spin text-[#1D4ED8]"
                      />
                      <span className="text-sm font-medium">
                        Loading leads...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : leads && leads.length > 0 ? (
                leads.map((lead, idx) => {
                  const displaySrNo = lead.srNo || (page - 1) * limit + idx + 1;
                  return (
                    <tr
                      key={lead.id || idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                        {displaySrNo}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800 font-semibold">
                        {lead.applicationNumber || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {lead.profileImage ? (
                            <img
                              src={lead.profileImage}
                              alt={lead.customerName || "Lead"}
                              className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-[#1D4ED8]">
                              {getInitials(lead.customerName)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800">
                            {lead.customerName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {lead.phoneNumber || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                        {lead.branchName || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {lead.createdByName || "—"}
                      </td>
                      <td
                        className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate"
                        title={lead.address}
                      >
                        {lead.address || "—"}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <Link
                            to={`/leads/view/${lead.id}`}
                            state={lead}
                            className="p-1 text-gray-500 hover:text-[#1D4ED8] transition-colors"
                            title="View Lead Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => {
                              setLeadToDelete(lead);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={32} className="text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">
                        No leads found.
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && meta.totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
          <div className="mb-4 sm:mb-0 font-medium">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, meta.totalRecords)} of {meta.totalRecords}{" "}
            Entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!meta.hasPrevPage && page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 transition-colors bg-white disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="px-1 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-[#1D4ED8] text-white shadow-sm"
                          : "border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 bg-white"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              disabled={!meta.hasNextPage && page >= meta.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 transition-colors bg-white disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete Lead
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete lead{" "}
              <span className="font-semibold text-gray-700">
                {leadToDelete?.customerName || leadToDelete?.applicationNumber}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={deleteSubmitting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setLeadToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                disabled={deleteSubmitting}
                onClick={handleDeleteLead}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
              >
                {deleteSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {deleteSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
