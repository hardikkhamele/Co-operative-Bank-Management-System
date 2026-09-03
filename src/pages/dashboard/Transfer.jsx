import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit,
  Trash2,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  X,
  Eye,
  Download,
  Loader2,
  Table,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { toast } from "react-toastify";
import { transferReceiptService } from "../../api/transferReceiptService";
import useBranchStore from "../../store/branchStore";
import PageHeader from "../../components/common/PageHeader";
import { Skeleton, SkeletonTableRow } from "../../components/common/Skeleton";
import { isBankOwner, canApproveReceipts } from "../../utils/roleUtils";
import ReceiptImageUpload from "../../components/common/ReceiptImageUpload";

const GL_HEAD_OPTIONS = [
  { code: "410105", name: "Daily Deposit" },
  { code: "410106", name: "Daily Agent Collection" },
  { code: "410107", name: "Loan" },
  { code: "410108", name: "Monthly RD" },
  { code: "410109", name: "Savings Account" },
  { code: "410110", name: "Current Account" },
  { code: "410111", name: "Fixed Deposit" },
  { code: "410112", name: "Recurring Deposit" },
];

const Transfer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialState = searchParams.get("state") || "";
  const initialCity = searchParams.get("city") || "";
  const initialDateFrom = searchParams.get("dateFrom") || "";
  const initialDateTo = searchParams.get("dateTo") || "";
  const initialPage = parseInt(searchParams.get("page"), 10) || 1;

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [receipts, setReceipts] = useState([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [locationsData, setLocationsData] = useState({
    states: [],
    stateCityMap: {},
  });
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [availableCities, setAvailableCities] = useState([]);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const globalBranchId = useBranchStore((state) => state.globalBranchId);

  // Pagination State
  const [page, setPage] = useState(initialPage);
  const limit = 10;
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    page: initialPage,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Sync state changes to URL search params
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedStatus) params.status = selectedStatus;
    if (selectedState) params.state = selectedState;
    if (selectedCity) params.city = selectedCity;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedStatus,
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
    if (urlState !== selectedState) setSelectedState(urlState);
    if (urlCity !== selectedCity) setSelectedCity(urlCity);
    if (urlDateFrom !== dateFrom) setDateFrom(urlDateFrom);
    if (urlDateTo !== dateTo) setDateTo(urlDateTo);
    if (urlPage !== page) setPage(urlPage);
  }, [searchParams]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    receipt: null,
    reason: "",
  });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const authRole = useAuthStore((state) => state.role);
  const authUser = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const canApprove = canApproveReceipts(authRole, authUser, permissions);

  // Form State for Create
  const todayISO = new Date().toISOString().split("T")[0];
  const [createForm, setCreateForm] = useState({
    name: "",
    glHead: "410105",
    glHeadName: "Daily Deposit",
    accountNumber: "",
    date: todayISO,
    status: "PENDING",
    file: null,
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState({
    name: "",
    glHead: "410105",
    glHeadName: "Daily Deposit",
    accountNumber: "",
    date: todayISO,
    status: "NEW",
    file: null,
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await transferReceiptService.getLocations();
        const data = res.data || res;
        const states = data.states || data.availableStates || [];
        const stateCityMap = data.stateCitiesMap || {};
        setLocationsData({ states, stateCityMap });
      } catch (err) {
        console.warn("Failed to fetch locations:", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedState && locationsData.stateCityMap[selectedState]) {
      setAvailableCities(locationsData.stateCityMap[selectedState]);
    } else {
      setAvailableCities([]);
    }
  }, [selectedState, locationsData]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Receipts from live API with fallback
  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus.toUpperCase();
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (globalBranchId) params.branchId = globalBranchId;

      const res = await transferReceiptService.list(params);
      if (res && res.success) {
        const listData = Array.isArray(res.data)
          ? res.data
          : res.data?.items || res.data?.receipts || [];
        setReceipts(listData);
        if (res.data && res.data.stats) {
          setStats(res.data.stats);
        } else if (res.stats) {
          setStats(res.stats);
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
        } else {
          setMeta({
            totalRecords: listData.length,
            totalPages: Math.ceil(listData.length / limit) || 1,
            page,
            limit,
            hasNextPage: false,
            hasPrevPage: false,
          });
        }
      } else {
        throw new Error(res?.message || "Failed to retrieve transfer receipts");
      }
    } catch (err) {
      console.warn("Live transfer-receipts API call error:", err.message);
      setReceipts([]);
      setMeta({
        totalRecords: 0,
        totalPages: 1,
        page,
        limit,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    selectedStatus,
    dateFrom,
    dateTo,
    selectedState,
    selectedCity,
    globalBranchId,
  ]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Handle Create Transfer Receipt

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this receipt?"))
      return;
    try {
      setLoading(true);
      const res = await transferReceiptService.approve(id);
      toast.success(res?.message || "Approved successfully");
      fetchReceipts();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to approve",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await transferReceiptService.reject(
        receiptToReject,
        rejectionReason.trim(),
      );
      toast.success(res?.message || "Rejected successfully");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setReceiptToReject(null);
      fetchReceipts();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to reject",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!createForm.accountNumber.trim()) {
      toast.error("Please enter account number");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", createForm.name.trim());
      formData.append("glHead", createForm.glHead);
      formData.append("glHeadName", createForm.glHeadName);
      formData.append("accountNumber", createForm.accountNumber.trim());
      formData.append("date", createForm.date);
      formData.append("status", "PENDING");
      if (globalBranchId) {
        formData.append("branchId", globalBranchId);
      }
      if (createForm.file) {
        formData.append("document", createForm.file);
      }

      const res = await transferReceiptService.create(formData);
      toast.success(res?.message || "Transfer Receipt created successfully!");
      setIsCreateModalOpen(false);
      setCreateForm({
        name: "",
        glHead: "410105",
        glHeadName: "Daily Deposit",
        accountNumber: "",
        date: todayISO,
        status: "PENDING",
        file: null,
      });
      fetchReceipts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to create transfer receipt",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (receipt) => {
    setSelectedReceipt(receipt);
    setEditForm({
      name: receipt.name || "",
      glHead: receipt.glHead || "410105",
      glHeadName: receipt.glHeadName || "Daily Deposit",
      accountNumber: receipt.accountNumber || receipt.acNo || "",
      date: receipt.date ? receipt.date.split("T")[0] : todayISO,
      status: (receipt.status || "NEW").toUpperCase(),
      file: null,
    });
    setIsEditModalOpen(true);
  };

  // Handle Update Transfer Receipt
  const handleUpdateReceipt = async (e) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    setSubmitting(true);
    try {
      const receiptId = selectedReceipt._id || selectedReceipt.id;
      const formData = new FormData();
      formData.append("name", editForm.name.trim());
      formData.append("glHead", editForm.glHead);
      formData.append("glHeadName", editForm.glHeadName);
      formData.append("accountNumber", editForm.accountNumber.trim());
      formData.append("date", editForm.date);
      if (globalBranchId) {
        formData.append("branchId", globalBranchId);
      }
      if (editForm.file) {
        formData.append("document", editForm.file);
      }

      const res = await transferReceiptService.update(receiptId, formData);
      toast.success(res?.message || "Receipt updated successfully.");
      setIsEditModalOpen(false);
      setSelectedReceipt(null);
      fetchReceipts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update transfer receipt",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Transfer Receipt
  const handleDeleteReceipt = async () => {
    if (!selectedReceipt) return;

    setSubmitting(true);
    try {
      const receiptId = selectedReceipt._id || selectedReceipt.id;
      const res = await transferReceiptService.delete(receiptId);
      toast.success(res?.message || "Transfer Receipt deleted successfully.");
      setIsDeleteModalOpen(false);
      setSelectedReceipt(null);
      fetchReceipts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete transfer receipt",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus.toUpperCase();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (globalBranchId) params.branchId = globalBranchId;

      const data = await transferReceiptService.exportCsv(params);

      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transfer-receipts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Transfer Receipts exported successfully!");
    } catch (err) {
      console.warn(
        "Export API error, generating client-side CSV:",
        err.message,
      );
      const headers = [
        "Sr.No.",
        "Receipt No",
        "Name",
        "GL Head",
        "GL Head Name",
        "Account Number",
        "Date",
        "Status",
      ];
      const rows = receipts.map((r, idx) => [
        (page - 1) * limit + idx + 1,
        `"${r.receiptNo || ""}"`,
        `"${r.name || ""}"`,
        `"${r.glHead || ""}"`,
        `"${r.glHeadName || ""}"`,
        `"${r.accountNumber || r.acNo || ""}"`,
        `"${r.date || ""}"`,
        `"${r.status || ""}"`,
      ]);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "transfer-receipts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Transfer Receipts exported successfully!");
    } finally {
      setExporting(false);
    }
  };

  const handleApproveReceipt = async (receipt) => {
    const receiptId = receipt._id || receipt.id;
    if (!receiptId) return;
    setActionLoadingId(receiptId);
    try {
      const res = await transferReceiptService.approve(receiptId);
      toast.success(res?.message || "Transfer receipt approved successfully.");
      setReceipts((prev) =>
        prev.map((r) =>
          (r._id || r.id) === receiptId
            ? { ...r, status: "APPROVED", rejectionReason: null }
            : r
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to approve transfer receipt");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (receipt) => {
    setRejectModal({
      isOpen: true,
      receipt,
      reason: "",
    });
  };

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    const receiptId = rejectModal.receipt?._id || rejectModal.receipt?.id;
    if (!receiptId) return;

    if (!rejectModal.reason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await transferReceiptService.reject(receiptId, rejectModal.reason.trim());
      toast.success(res?.message || "Transfer receipt rejected successfully.");
      setReceipts((prev) =>
        prev.map((r) =>
          (r._id || r.id) === receiptId
            ? { ...r, status: "REJECTED", rejectionReason: rejectModal.reason.trim() }
            : r
        )
      );
      setRejectModal({ isOpen: false, receipt: null, reason: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to reject transfer receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
      case "NEW":
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
            PENDING
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
            APPROVED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-rose-700 bg-rose-50 rounded-full border border-rose-200">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
            PENDING
          </span>
        );
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
      <table ref={tableRef} border="1">
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
    <div className="w-full max-w-none space-y-6">
      {/* Header and Breadcrumb */}
      <PageHeader
        title="Transfer Receipt"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Receipt Management" },
          { label: "Transfer Receipt" }
        ]}
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => {
              setSelectedStatus("");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${!selectedStatus ? "border-[#225091]" : "border-gray-100"}`}
          >
            <span className="text-[28px] font-bold text-[#225091] leading-none mb-1">
              {stats.totalReceipts || 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Receipts
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("APPROVED");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "APPROVED" ? "border-emerald-500" : "border-gray-100"}`}
          >
            <span className="text-[28px] font-bold text-emerald-500 leading-none mb-1">
              {stats.approvedReceipts || 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Approved Receipts
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("PENDING");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "PENDING" ? "border-amber-500" : "border-gray-100"}`}
          >
            <span className="text-[28px] font-bold text-amber-500 leading-none mb-1">
              {stats.pendingReceipts || 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Pending Receipts
            </span>
          </div>

          <div
            onClick={() => {
              setSelectedStatus("REJECTED");
              setPage(1);
            }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "REJECTED" ? "border-red-500" : "border-gray-100"}`}
          >
            <span className="text-[28px] font-bold text-red-500 leading-none mb-1">
              {stats.rejectedReceipts || 0}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Rejected Receipts
            </span>
          </div>
        </div>
      )}

      {/* Action Bar & Filters */}
      <div className="flex flex-col gap-4 mb-4">
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
                placeholder="Search by name, receipt, or account"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Action Buttons: Export & Create */}
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => {
                setCreateForm({
                  name: "",
                  glHead: "410105",
                  glHeadName: "Loan",
                  accountNumber: "",
                  date: todayISO,
                  status: "PENDING",
                });
                setIsCreateModalOpen(true);
              }}
              className="bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
            >
              + Create Receipt
            </button>
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
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
            disabled={!selectedState}
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
            selectedState ||
            selectedCity ||
            dateFrom ||
            dateTo) && (
            <button
              onClick={() => {
                setSelectedStatus("");
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            ref={tableRef}
            className="w-full text-left text-sm whitespace-nowrap"
          >
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Receipt No</th>
                <th className="py-3.5 px-5 font-semibold">Name</th>
                <th className="py-3.5 px-5 font-semibold">Branch Name</th>
                <th className="py-3.5 px-5 font-semibold">City</th>
                <th className="py-3.5 px-5 font-semibold">GL Head</th>
                <th className="py-3.5 px-5 font-semibold">GL Head Name</th>
                <th className="py-3.5 px-5 font-semibold">A/C No.</th>
                <th className="py-3.5 px-5 font-semibold">Date</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                {canApprove && (
                  <th className="py-3.5 px-5 font-semibold text-center">Approve / Reject</th>
                )}
                <th className="py-3.5 px-5 font-semibold">Image</th>
                <th className="py-3.5 px-5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={canApprove ? 13 : 12} />
                ))
              ) : receipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={canApprove ? 13 : 12}
                    className="text-center py-10 font-medium text-gray-500 text-sm"
                  >
                    No transfer receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map((receipt, index) => {
                  const receiptId = receipt._id || receipt.id;
                  const formattedDate = receipt.date
                    ? receipt.date.includes("T")
                      ? receipt.date.split("T")[0]
                      : receipt.date
                    : "—";
                  const status = (receipt.status || "PENDING").toUpperCase();
                  const isPending = status === "PENDING" || status === "NEW";

                  return (
                    <tr
                      key={receiptId || index}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">
                        {receipt.srNo || (page - 1) * limit + index + 1}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-[#1b2559] font-semibold">
                        {receipt.receiptNo ||
                          `TR-${String(index + 1).padStart(6, "0")}`}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-gray-900 font-semibold">
                        {receipt.name}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">
                        {receipt.branchName || "—"}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">
                        {receipt.city || "—"}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">
                        {receipt.glHead}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">
                        {receipt.glHeadName}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-700 font-mono font-medium">
                        {receipt.accountNumber || receipt.acNo}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">
                        {formattedDate}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-5">
                        {status === "APPROVED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            APPROVED
                          </span>
                        )}
                        {status === "REJECTED" && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 w-fit">
                              REJECTED
                            </span>
                            {receipt.rejectionReason && (
                              <span className="text-[11px] text-rose-600 mt-1 truncate max-w-[150px]" title={receipt.rejectionReason}>
                                Reason: {receipt.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Approve / Reject Toggle Column (Visible exclusively to Bank Owner) */}
                      {canApprove && (
                        <td className="py-3.5 px-5 text-center">
                          <div className="inline-flex items-center p-0.5 bg-gray-100/90 rounded-lg border border-gray-200/80 shadow-2xs">
                            {/* Approve Toggle Option */}
                            <button
                              type="button"
                              disabled={!isPending || actionLoadingId === receiptId}
                              onClick={() => isPending && handleApproveReceipt(receipt)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                status === "APPROVED"
                                  ? "bg-emerald-600 text-white shadow-xs cursor-not-allowed opacity-90"
                                  : isPending
                                  ? "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                  : "text-gray-400 cursor-not-allowed opacity-40"
                              }`}
                              title={
                                status === "APPROVED"
                                  ? "Approved (Locked)"
                                  : isPending
                                  ? "Click to Approve Receipt"
                                  : "Disabled"
                              }
                            >
                              {actionLoadingId === receiptId ? (
                                <Loader2 size={12} className="animate-spin text-emerald-600" />
                              ) : (
                                <CheckCircle size={12} className={status === "APPROVED" ? "text-white" : "text-emerald-600"} />
                              )}
                              <span>Approve</span>
                            </button>

                            {/* Reject Toggle Option */}
                            <button
                              type="button"
                              disabled={!isPending || actionLoadingId === receiptId}
                              onClick={() => isPending && handleOpenRejectModal(receipt)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                status === "REJECTED"
                                  ? "bg-rose-600 text-white shadow-xs cursor-not-allowed opacity-90"
                                  : isPending
                                  ? "text-gray-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                  : "text-gray-400 cursor-not-allowed opacity-40"
                              }`}
                              title={
                                status === "REJECTED"
                                  ? "Rejected (Locked)"
                                  : isPending
                                  ? "Click to Reject & Enter Reason"
                                  : "Disabled"
                              }
                            >
                              <XCircle size={12} className={status === "REJECTED" ? "text-white" : "text-rose-600"} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 px-5">
                        {receipt.image ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImageUrl(receipt.image)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-[#225091] bg-blue-50 hover:bg-blue-100 transition-colors shadow-xs cursor-pointer"
                          >
                            <Eye size={13} /> View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              navigate(`/transfer/view/${receiptId}`)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs"
                            title="View Receipt"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={() => openEditModal(receipt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs"
                            title="Edit Receipt"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setIsDeleteModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs"
                            title="Delete Receipt"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Showing {receipts.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, meta.totalRecords || receipts.length)} of{" "}
            {meta.totalRecords || receipts.length} Entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>

            {(() => {
              const totalPages = meta.totalPages || 1;
              let startPage = Math.max(1, page - 2);
              let endPage = Math.min(totalPages, page + 2);
              if (endPage - startPage < 4) {
                if (startPage === 1) endPage = Math.min(5, totalPages);
                else if (endPage === totalPages)
                  startPage = Math.max(1, totalPages - 4);
              }
              const pageButtons = [];
              for (let i = startPage; i <= endPage; i++) {
                pageButtons.push(
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-colors ${page === i ? "bg-[#225091] text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    {i}
                  </button>,
                );
              }
              return pageButtons;
            })()}

            <button
              onClick={() =>
                setPage((p) => Math.min(meta.totalPages || 1, p + 1))
              }
              disabled={page >= (meta.totalPages || 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3.3 Create Transfer Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[540px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-200/60 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">
                  Create Transfer Receipt
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Generate a new TR- receipt for transfer transaction
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <form
              onSubmit={handleCreateReceipt}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vishwas Patel"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                    GL Head Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 410105"
                    value={createForm.glHead}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, glHead: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                    GL Head Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={createForm.glHeadName}
                      onChange={(e) => {
                        const selectedOption = GL_HEAD_OPTIONS.find(
                          (o) => o.name === e.target.value,
                        );
                        setCreateForm({
                          ...createForm,
                          glHeadName: e.target.value,
                          glHead: selectedOption
                            ? selectedOption.code
                            : createForm.glHead,
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-[15px] text-gray-800"
                    >
                      {GL_HEAD_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 36489745148"
                  value={createForm.accountNumber}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                  Receipt Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={createForm.date}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800"
                />
              </div>

              <div>
                <ReceiptImageUpload
                  file={createForm.file}
                  onChange={(newFile) =>
                    setCreateForm({ ...createForm, file: newFile })
                  }
                />
              </div>

              <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#225091] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[14px] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Creating..." : "Create Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.5 Update Transfer Receipt Modal */}
      {isEditModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[540px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-200/60 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">
                  Modify Transfer Receipt
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Receipt:{" "}
                  <span className="font-semibold text-[#225091]">
                    {selectedReceipt.receiptNo}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <form
              onSubmit={handleUpdateReceipt}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                    GL Head Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.glHead}
                    onChange={(e) =>
                      setEditForm({ ...editForm, glHead: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                    GL Head Name
                  </label>
                  <div className="relative">
                    <select
                      value={editForm.glHeadName}
                      onChange={(e) => {
                        const selectedOption = GL_HEAD_OPTIONS.find(
                          (o) => o.name === e.target.value,
                        );
                        setEditForm({
                          ...editForm,
                          glHeadName: e.target.value,
                          glHead: selectedOption
                            ? selectedOption.code
                            : editForm.glHead,
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-[15px] text-gray-800"
                    >
                      {GL_HEAD_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={editForm.accountNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, accountNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">
                    Post-Edit Status
                  </label>
                  <div className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-[13px] font-semibold text-amber-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Resets to PENDING
                  </div>
                </div>
              </div>

              <div>
                <ReceiptImageUpload
                  file={editForm.file}
                  existingImageUrl={selectedReceipt?.image}
                  onChange={(newFile) =>
                    setEditForm({ ...editForm, file: newFile })
                  }
                />
              </div>

              <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#225091] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[14px] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Saving..." : "Update Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.6 Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete Transfer Receipt
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete transfer receipt{" "}
              <span className="font-semibold text-gray-700">
                {selectedReceipt.receiptNo || "selected receipt"}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-gray-700">
                {selectedReceipt.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteReceipt}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Panel Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Receipt Document Preview</h3>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-gray-50 rounded-xl my-3">
              <img
                src={previewImageUrl}
                alt="Transfer Receipt Document"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Receipt Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle size={22} />
                <h3 className="text-lg font-bold text-gray-900">Reject Transfer Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, receipt: null, reason: "" })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-gray-500">Receipt No:</span>
                  <span className="font-bold text-[#1b2559]">{rejectModal.receipt?.receiptNo || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Customer:</span>
                  <span className="font-semibold text-gray-800">{rejectModal.receipt?.name || "—"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="e.g. Duplicate receipt, incorrect account number, invalid attachment..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm text-gray-800 resize-none"
                />
              </div>

              {/* Quick reason suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Duplicate entry",
                  "Incorrect account number",
                  "Amount mismatch",
                  "Invalid document",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRejectModal({ ...rejectModal, reason: tag })}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700 border border-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, receipt: null, reason: "" })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  <span>{submitting ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;
