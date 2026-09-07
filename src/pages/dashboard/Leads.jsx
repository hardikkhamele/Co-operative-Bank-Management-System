import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Search,
  ChevronDown,
  Eye,
  X,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Table,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Smartphone,
  Store,
  ExternalLink,
  FileCheck,
  IndianRupee,
  RefreshCw,
  User,
  MapPin,
  Calendar,
  Layers,
  Image as ImageIcon,
  RotateCcw,
  Filter,
  Building2,
} from "lucide-react";
import { leadService } from "../../api/leadService";
import PageHeader from "../../components/common/PageHeader";

const getStatusBadge = (status) => {
  const normalized = (status || "").toUpperCase();
  switch (normalized) {
    case "PENDING_APPROVAL":
    case "NEW":
    case "PENDING_DOWN_PAYMENT":
    case "PENDING":
    case "SUBMITTED":
    case "CALCULATE":
    case "SLABS":
    case "BANK_ACCOUNT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          <Clock size={11} /> {normalized === "PENDING_DOWN_PAYMENT" ? "Pending Down Payment" : normalized === "NEW" ? "New (Pending)" : "Pending Approval"}
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          <CheckCircle2 size={11} /> Approved
        </span>
      );
    case "PENDING_BRANCH_PAYMENT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/70 text-orange-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          <Clock size={11} /> Pending Settlement
        </span>
      );
    case "SETTLED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          <CheckCircle2 size={11} /> Settled
        </span>
      );
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          <CheckCircle2 size={11} /> Active
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          Completed
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
          <XCircle size={11} /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
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

const Leads = ({ leadType: propLeadType, systemTitle: propSystemTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve leadType from prop or pathname
  const path = location.pathname.toLowerCase();
  let currentLeadType = propLeadType;
  let resolvedTitle = propSystemTitle;

  if (!currentLeadType) {
    if (path.includes('/leads/customer') || path.includes('/leads/branch')) {
      currentLeadType = 'CUSTOMER';
      resolvedTitle = 'Customer';
    } else if (path.includes('/leads/merchant')) {
      currentLeadType = 'MERCHANT';
      resolvedTitle = 'Merchant';
    } else if (path.includes('/leads/sip')) {
      currentLeadType = 'SIP';
      resolvedTitle = 'Smart SIP';
    }
  } else if (!resolvedTitle) {
    if (currentLeadType === 'CUSTOMER' || currentLeadType === 'BRANCH') resolvedTitle = 'Customer';
    else if (currentLeadType === 'MERCHANT') resolvedTitle = 'Merchant';
    else if (currentLeadType === 'SIP') resolvedTitle = 'Smart SIP';
  }

  const isCustomerSystem = currentLeadType === 'CUSTOMER';
  const isMerchantSystem = currentLeadType === 'MERCHANT';

  // Read initial filter values from URL
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialDateFrom = searchParams.get("startDate") || searchParams.get("dateFrom") || "";
  const initialDateTo = searchParams.get("endDate") || searchParams.get("dateTo") || "";
  const initialPage = parseInt(searchParams.get("page"), 10) || 1;

  // Data states
  const [leads, setLeads] = useState([]);
  const [masterLeads, setMasterLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingLeads: 0,
    approvedLeads: 0,
    activeLeads: 0,
    completedLeads: 0,
    rejectedLeads: 0,
    totalBusinessVolume: 0,
    pendingSettlementLeads: 0,
    settledLeads: 0,
    pendingSettlementAmount: 0,
    totalSettledAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    page: initialPage,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  // Status Card Click Handler with Toggle
  const handleStatusCardClick = (statusKey) => {
    if (selectedStatus === statusKey) {
      setSelectedStatus(""); // Toggle off -> show all
    } else {
      setSelectedStatus(statusKey);
    }
    setPage(1);
  };

  // 1B. Manual Approve Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [leadToApprove, setLeadToApprove] = useState(null);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  // 1C. Manual Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [leadToReject, setLeadToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // 2B. Settle Merchant Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [leadToSettle, setLeadToSettle] = useState(null);
  const [settleTxnRef, setSettleTxnRef] = useState("");
  const [settleRemarks, setSettleRemarks] = useState("");
  const [settleSubmitting, setSettleSubmitting] = useState(false);

  // KYC Image Preview Modal
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // Quick Detail Drawer/Modal
  const [quickDetailLead, setQuickDetailLead] = useState(null);

  // Sync state changes to URL search params
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedStatus) params.status = selectedStatus;
    if (dateFrom) params.startDate = dateFrom;
    if (dateTo) params.endDate = dateTo;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedStatus,
    dateFrom,
    dateTo,
    page,
    setSearchParams,
  ]);

  // Sync URL changes from browser navigation
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "";
    const urlDateFrom = searchParams.get("startDate") || searchParams.get("dateFrom") || "";
    const urlDateTo = searchParams.get("endDate") || searchParams.get("dateTo") || "";
    const urlPage = parseInt(searchParams.get("page"), 10) || 1;

    if (urlSearch !== debouncedSearch) {
      setSearchTerm(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
    if (urlDateFrom !== dateFrom) setDateFrom(urlDateFrom);
    if (urlDateTo !== dateTo) setDateTo(urlDateTo);
    if (urlPage !== page) setPage(urlPage);
  }, [searchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch leads according to API
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus && selectedStatus !== 'ALL') {
        if (selectedStatus === 'PENDING_BRANCH_PAYMENT' || selectedStatus === 'PENDING_SETTLEMENT') {
          params.settlementStatus = 'PENDING_BRANCH_PAYMENT';
          params.status = 'PENDING_BRANCH_PAYMENT';
        } else if (selectedStatus === 'SETTLED_BY_BRANCH' || selectedStatus === 'SETTLED') {
          params.settlementStatus = 'SETTLED_BY_BRANCH';
          params.status = 'SETTLED_BY_BRANCH';
        } else if (selectedStatus === 'PENDING_APPROVAL') {
          params.status = 'PENDING_APPROVAL';
          params.approvalStatus = 'PENDING_APPROVAL';
        } else if (selectedStatus === 'APPROVED') {
          params.status = 'APPROVED';
          params.approvalStatus = 'APPROVED';
        } else if (selectedStatus === 'ACTIVE') {
          params.status = 'ACTIVE';
        } else {
          params.status = selectedStatus;
          params.approvalStatus = selectedStatus;
        }
      }
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      let res;
      if (isCustomerSystem) {
        // 1A. List Customer System Leads (GET /api/v1/employee/leads/customer-system)
        res = await leadService.listCustomerSystemLeads(params);
      } else if (isMerchantSystem) {
        // 2A. List Merchant System Leads (GET /api/v1/employee/leads/merchant-system)
        res = await leadService.listMerchantSystemLeads(params);
      } else {
        if (currentLeadType) params.leadType = currentLeadType;
        res = await leadService.list(params);
      }

      if (res && res.success) {
        const rawItems = Array.isArray(res.data) ? res.data : (res.data?.items || res.items || []);
        setLeads(rawItems);

        const apiStats = res.stats || res.data?.stats;
        if (apiStats && typeof apiStats === 'object' && Object.keys(apiStats).length > 0) {
          setStats(prev => {
            const isPrevAllZeros = !prev || (prev.totalLeads === 0 && prev.pendingLeads === 0 && prev.approvedLeads === 0);
            if (!selectedStatus || selectedStatus === 'ALL' || isPrevAllZeros) {
              return { 
                ...prev, 
                ...apiStats,
                pendingSettlementLeads: apiStats.pendingSettlementLeads ?? apiStats.pendingSettlement ?? 0,
                settledLeads: apiStats.settledLeads ?? apiStats.settled ?? 0,
                approvedLeads: apiStats.approvedLeads ?? 0,
                activeLeads: apiStats.activeLeads ?? 0,
                totalBusinessVolume: apiStats.totalBusinessVolume ?? 0,
                pendingSettlementAmount: apiStats.pendingSettlementAmount ?? 0,
                totalSettledAmount: apiStats.totalSettledAmount ?? 0
              };
            }
            return prev;
          });
        }

        // Store master list when unfiltered
        if (!selectedStatus || selectedStatus === 'ALL') {
          setMasterLeads(rawItems);
          if ((!apiStats || Object.keys(apiStats).length === 0) && rawItems.length > 0) {
            // Compute client fallback stats from unfiltered data
            setStats({
              totalLeads: rawItems.length,
              pendingLeads: rawItems.filter(l => (l.status || l.approvalStatus || '').toUpperCase().includes('PENDING') || (l.currentStep || '').toUpperCase() === 'SUBMITTED').length,
              approvedLeads: rawItems.filter(l => (l.status || l.approvalStatus || '').toUpperCase() === 'APPROVED').length,
              activeLeads: rawItems.filter(l => (l.status || '').toUpperCase() === 'ACTIVE').length,
              completedLeads: rawItems.filter(l => (l.status || '').toUpperCase() === 'COMPLETED').length,
              rejectedLeads: rawItems.filter(l => (l.status || '').toUpperCase() === 'REJECTED').length,
              pendingSettlementLeads: rawItems.filter(l => {
                const s = (l.settlementDetails?.settlementStatus || l.settlementStatus || l.status || '').toUpperCase();
                return s === 'PENDING_BRANCH_PAYMENT' || s.includes('PENDING');
              }).length,
              settledLeads: rawItems.filter(l => {
                const s = (l.settlementDetails?.settlementStatus || l.settlementStatus || l.status || '').toUpperCase();
                return s === 'SETTLED_BY_BRANCH' || s === 'SETTLED';
              }).length,
              pendingSettlementAmount: rawItems.filter(l => {
                const s = (l.settlementDetails?.settlementStatus || l.settlementStatus || l.status || '').toUpperCase();
                return s === 'PENDING_BRANCH_PAYMENT' || s.includes('PENDING');
              }).reduce((sum, l) => sum + (l.settlementDetails?.netDisbursalAmount || l.financialDetails?.totalLoanAmount || 0), 0),
              totalSettledAmount: rawItems.filter(l => {
                const s = (l.settlementDetails?.settlementStatus || l.settlementStatus || l.status || '').toUpperCase();
                return s === 'SETTLED_BY_BRANCH' || s === 'SETTLED';
              }).reduce((sum, l) => sum + (l.settlementDetails?.netDisbursalAmount || l.financialDetails?.totalLoanAmount || 0), 0),
              totalBusinessVolume: rawItems.reduce((acc, l) => acc + (l.financialDetails?.totalLoanAmount || l.productDetails?.productPrice || 0), 0),
            });
          }
        } else if (stats.totalLeads === 0) {
          // If refreshed with status in URL, fetch master stats in background
          (async () => {
            try {
              let masterRes;
              if (isCustomerSystem) masterRes = await leadService.listCustomerSystemLeads({ page: 1, limit: 100 });
              else if (isMerchantSystem) masterRes = await leadService.listMerchantSystemLeads({ page: 1, limit: 100 });
              if (masterRes && masterRes.success) {
                const mItems = Array.isArray(masterRes.data) ? masterRes.data : (masterRes.data?.items || []);
                setMasterLeads(mItems);
                if (masterRes.stats) {
                  setStats(masterRes.stats);
                } else if (mItems.length > 0) {
                  setStats({
                    totalLeads: mItems.length,
                    pendingLeads: mItems.filter(l => (l.status || l.approvalStatus || '').toUpperCase().includes('PENDING') || (l.currentStep || '').toUpperCase() === 'SUBMITTED').length,
                    approvedLeads: mItems.filter(l => (l.status || l.approvalStatus || '').toUpperCase() === 'APPROVED').length,
                    activeLeads: mItems.filter(l => (l.status || '').toUpperCase() === 'ACTIVE').length,
                    completedLeads: mItems.filter(l => (l.status || '').toUpperCase() === 'COMPLETED').length,
                    rejectedLeads: mItems.filter(l => (l.status || '').toUpperCase() === 'REJECTED').length,
                    pendingSettlementLeads: mItems.filter(l => (l.settlementDetails?.settlementStatus || '').toUpperCase().includes('PENDING')).length,
                    settledLeads: mItems.filter(l => (l.settlementDetails?.settlementStatus || l.status || '').toUpperCase() === 'SETTLED').length,
                    pendingSettlementAmount: mItems.filter(l => (l.settlementDetails?.settlementStatus || '').toUpperCase().includes('PENDING')).reduce((sum, l) => sum + (l.settlementDetails?.netDisbursalAmount || l.financialDetails?.totalLoanAmount || 0), 0),
                    totalSettledAmount: mItems.filter(l => (l.settlementDetails?.settlementStatus || '').toUpperCase() === 'SETTLED').reduce((sum, l) => sum + (l.settlementDetails?.netDisbursalAmount || l.financialDetails?.totalLoanAmount || 0), 0),
                    totalBusinessVolume: mItems.reduce((acc, l) => acc + (l.financialDetails?.totalLoanAmount || l.productDetails?.productPrice || 0), 0),
                  });
                }
              }
            } catch (e) {
              console.warn("Background master stats fetch error:", e);
            }
          })();
        }

        const metaObj = res.meta || res.pagination || res.data?.meta || res.data?.pagination || {};
        const totalRecords = metaObj.totalRecords ?? metaObj.total ?? rawItems.length;
        const totalPages = metaObj.totalPages ?? Math.ceil(totalRecords / (metaObj.limit || limit)) ?? 1;
        const currentPage = metaObj.page ?? page;

        setMeta({
          totalRecords,
          totalPages,
          page: currentPage,
          limit: metaObj.limit ?? limit,
          hasNextPage: metaObj.hasNextPage ?? (currentPage < totalPages),
          hasPrevPage: metaObj.hasPrevPage ?? (currentPage > 1),
        });
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
    dateFrom,
    dateTo,
    isCustomerSystem,
    isMerchantSystem,
    currentLeadType,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // 1B. Handle Manual Approve Customer Lead (POST /api/v1/employee/leads/:id/approve)
  const handleApproveCustomer = async (e) => {
    e.preventDefault();
    const leadId = leadToApprove?.loanId || leadToApprove?._id || leadToApprove?.id;
    if (!leadId) return;

    setApproveSubmitting(true);
    try {
      const res = await leadService.approveCustomerLead(leadId, {
        remarks: approveRemarks.trim() || "Manually verified income documents and approved by Branch Manager",
      });
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res.message || "Customer loan lead approved successfully!");
        setIsApproveModalOpen(false);
        setLeadToApprove(null);
        setApproveRemarks("");
        fetchLeads();
      } else {
        throw new Error(res.message || "Approval failed.");
      }
    } catch (err) {
      console.error("Failed to approve customer lead:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to approve lead.");
    } finally {
      setApproveSubmitting(false);
    }
  };

  // 1C. Handle Manual Reject Customer Lead (POST /api/v1/employee/leads/:id/reject)
  const handleRejectCustomer = async (e) => {
    e.preventDefault();
    const leadId = leadToReject?.loanId || leadToReject?._id || leadToReject?.id;
    if (!leadId) return;

    if (!rejectReason.trim()) {
      toast.warn("Please provide a reason for rejecting this loan request.");
      return;
    }

    setRejectSubmitting(true);
    try {
      const res = await leadService.rejectCustomerLead(leadId, {
        reason: rejectReason.trim(),
      });
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res.message || "Customer loan lead rejected.");
        setIsRejectModalOpen(false);
        setLeadToReject(null);
        setRejectReason("");
        fetchLeads();
      } else {
        throw new Error(res.message || "Rejection failed.");
      }
    } catch (err) {
      console.error("Failed to reject customer lead:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to reject lead.");
    } finally {
      setRejectSubmitting(false);
    }
  };

  // 2B. Handle Next-Day Merchant Settlement (POST /api/v1/employee/leads/:id/settle-merchant)
  const handleSettleMerchant = async (e) => {
    e.preventDefault();
    const leadId = leadToSettle?.loanId || leadToSettle?._id || leadToSettle?.id;
    if (!leadId) return;

    if (!settleTxnRef.trim()) {
      toast.warn("Please enter the Payment Transaction / UTR Reference number.");
      return;
    }

    setSettleSubmitting(true);
    try {
      const res = await leadService.settleMerchantLead(leadId, {
        paymentTxnRef: settleTxnRef.trim(),
        remarks: settleRemarks.trim() || "Next day loan disbursal paid to Merchant Bank Account",
      });
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res.message || "Merchant settlement executed successfully!");
        setIsSettleModalOpen(false);
        setLeadToSettle(null);
        setSettleTxnRef("");
        setSettleRemarks("");
        fetchLeads();
      } else {
        throw new Error(res.message || "Settlement failed.");
      }
    } catch (err) {
      console.error("Failed to settle merchant lead:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to execute settlement.");
    } finally {
      setSettleSubmitting(false);
    }
  };

  const tableRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExportOpen]);

  const getSelectedDataFromTable = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const table = tableRef.current;

    const ths = Array.from(table.querySelectorAll("thead th"));
    const headers = ths
      .slice(0, -1)
      .map((th) => th.innerText.trim().replace(/\n/g, " "));

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
    if (!headers.length || !rows.length) {
      toast.warning("No data available to export");
      return;
    }
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((v) => '"' + (v || "").replace(/"/g, '""') + '"').join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${resolvedTitle || 'Leads'}_Export.csv`;
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    if (!headers.length || !rows.length) {
      toast.warning("No data available to export");
      return;
    }
    const tableHtml = `
      <table border="1">
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
    link.download = `${resolvedTitle || 'Leads'}_Export.xls`;
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    if (!headers.length || !rows.length) {
      toast.warning("No data available to export");
      return;
    }
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${resolvedTitle || 'Leads'} Export</title></head><body>
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
    link.download = `${resolvedTitle || 'Leads'}_Export.doc`;
    link.click();
    setIsExportOpen(false);
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <PageHeader
          title={
            isCustomerSystem 
              ? "Customer Lead System" 
              : isMerchantSystem 
              ? "Merchant Lead System & Disbursals" 
              : `${resolvedTitle || 'Leads'} Management`
          }
          breadcrumbs={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "CRM Management" },
            { label: "Leads", to: "/leads" },
            ...(resolvedTitle ? [{ label: resolvedTitle }] : [])
          ]}
          showBack={true}
          backUrl={isCustomerSystem || isMerchantSystem ? "/leads" : "/dashboard"}
        />
      </div>

      {/* Dynamic Stats Cards directly from API stats object */}
      {stats && (
        <div className="mb-6">
          {isCustomerSystem ? (
            /* 1A. Customer System Stats */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
              <div
                onClick={() => handleStatusCardClick("")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${!selectedStatus ? "border-[#225091] ring-2 ring-[#225091]/20 bg-blue-50/20" : "border-gray-100 hover:border-gray-200"}`}
              >
                <span className="text-2xl font-black text-[#225091] leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-[#225091]/50" /> : (stats.totalLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                  Total Leads
                </span>
              </div>

              <div
                onClick={() => handleStatusCardClick("PENDING_APPROVAL")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "PENDING_APPROVAL" ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30" : "border-gray-100 hover:border-amber-200"}`}
              >
                <span className="text-2xl font-black text-amber-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-amber-500/50" /> : (stats.pendingLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider text-center">
                  Pending Approval
                </span>
                {selectedStatus === "PENDING_APPROVAL" && (
                  <span className="text-[9px] text-amber-600 font-semibold mt-0.5">Active Filter (click to clear)</span>
                )}
              </div>

              <div
                onClick={() => handleStatusCardClick("APPROVED")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "APPROVED" ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30" : "border-gray-100 hover:border-emerald-200"}`}
              >
                <span className="text-2xl font-black text-emerald-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-emerald-500/50" /> : (stats.approvedLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider text-center">
                  Approved
                </span>
                {selectedStatus === "APPROVED" && (
                  <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">Active Filter (click to clear)</span>
                )}
              </div>

              <div
                onClick={() => handleStatusCardClick("ACTIVE")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "ACTIVE" ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/30" : "border-gray-100 hover:border-cyan-200"}`}
              >
                <span className="text-2xl font-black text-cyan-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-cyan-500/50" /> : (stats.activeLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider text-center">
                  Active
                </span>
                {selectedStatus === "ACTIVE" && (
                  <span className="text-[9px] text-cyan-600 font-semibold mt-0.5">Active Filter (click to clear)</span>
                )}
              </div>

              <div
                onClick={() => handleStatusCardClick("COMPLETED")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "COMPLETED" ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30" : "border-gray-100 hover:border-indigo-200"}`}
              >
                <span className="text-2xl font-black text-indigo-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-indigo-500/50" /> : (stats.completedLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider text-center">
                  Completed
                </span>
                {selectedStatus === "COMPLETED" && (
                  <span className="text-[9px] text-indigo-600 font-semibold mt-0.5">Active Filter (click to clear)</span>
                )}
              </div>

              <div
                onClick={() => handleStatusCardClick("REJECTED")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "REJECTED" ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30" : "border-gray-100 hover:border-rose-200"}`}
              >
                <span className="text-2xl font-black text-rose-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-rose-500/50" /> : (stats.rejectedLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider text-center">
                  Rejected
                </span>
                {selectedStatus === "REJECTED" && (
                  <span className="text-[9px] text-rose-600 font-semibold mt-0.5">Active Filter (click to clear)</span>
                )}
              </div>

              <div className="bg-gradient-to-tr from-[#1b58a6] to-[#2563eb] rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-white">
                <span className="text-xl font-black leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={18} className="animate-spin text-white/70" /> : `₹${Number(stats.totalBusinessVolume || 0).toLocaleString('en-IN')}`}
                </span>
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider text-center">
                  Total Volume
                </span>
              </div>
            </div>
          ) : isMerchantSystem ? (
            /* 2A. Merchant System Stats */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div
                onClick={() => handleStatusCardClick("")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${!selectedStatus ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/20 bg-purple-50/20" : "border-gray-100 hover:border-purple-200"}`}
              >
                <span className="text-2xl font-black text-[#7c3aed] leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-[#7c3aed]/50" /> : (stats.totalLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                  Total Leads
                </span>
              </div>

              <div
                onClick={() => handleStatusCardClick("PENDING_BRANCH_PAYMENT")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "PENDING_BRANCH_PAYMENT" ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/30" : "border-gray-100 hover:border-orange-200"}`}
              >
                <span className="text-2xl font-black text-orange-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-orange-500/50" /> : (stats.pendingSettlementLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider text-center">
                  Pending Settlement
                </span>
                <span className="text-[10px] text-orange-500 font-semibold mt-0.5">
                  ₹{Number(stats.pendingSettlementAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div
                onClick={() => handleStatusCardClick("SETTLED_BY_BRANCH")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "SETTLED_BY_BRANCH" || selectedStatus === "SETTLED" ? "border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/30" : "border-gray-100 hover:border-teal-200"}`}
              >
                <span className="text-2xl font-black text-teal-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-teal-500/50" /> : (stats.settledLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider text-center">
                  Settled Leads
                </span>
                <span className="text-[10px] text-teal-600 font-semibold mt-0.5">
                  ₹{Number(stats.totalSettledAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div
                onClick={() => handleStatusCardClick("APPROVED")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "APPROVED" ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30" : "border-gray-100 hover:border-emerald-200"}`}
              >
                <span className="text-2xl font-black text-emerald-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-emerald-500/50" /> : (stats.approvedLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider text-center">
                  Approved
                </span>
              </div>

              <div
                onClick={() => handleStatusCardClick("ACTIVE")}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${selectedStatus === "ACTIVE" ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/30" : "border-gray-100 hover:border-cyan-200"}`}
              >
                <span className="text-2xl font-black text-cyan-600 leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={20} className="animate-spin text-cyan-500/50" /> : (stats.activeLeads ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider text-center">
                  Active
                </span>
              </div>

              <div className="bg-gradient-to-tr from-[#6b21a8] to-[#9333ea] rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-white">
                <span className="text-xl font-black leading-none mb-1">
                  {loading && stats.totalLeads === 0 ? <Loader2 size={18} className="animate-spin text-white/70" /> : `₹${Number(stats.totalBusinessVolume || 0).toLocaleString('en-IN')}`}
                </span>
                <span className="text-[10px] font-bold text-purple-100 uppercase tracking-wider text-center">
                  Total Volume
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Harmonized Filter Toolbar Card matching standard panel layout */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs space-y-3.5 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={
                isCustomerSystem 
                  ? "Search by Application ID, Customer Name, Phone, PAN, Aadhaar..." 
                  : isMerchantSystem 
                  ? "Search by Application ID, Shop Name, Merchant Name, Phone..." 
                  : "Search leads by customer name, phone, loan ID..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Controls Row */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Status Select */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer appearance-none"
              >
                <option value="">All Statuses</option>
                {isCustomerSystem ? (
                  <>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="ACTIVE">Active Loans</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                ) : isMerchantSystem ? (
                  <>
                    <option value="PENDING_BRANCH_PAYMENT">Pending Settlement</option>
                    <option value="SETTLED_BY_BRANCH">Settled Leads</option>
                    <option value="APPROVED">Approved Leads</option>
                    <option value="ACTIVE">Active Loans</option>
                  </>
                ) : (
                  <>
                    <option value="ACTIVE">Active Loans</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                )}
              </select>
              <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* From Date Filter */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                title="From Date (Start Date)"
                className="pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50/50 transition-all"
              />
              <Calendar size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
            </div>

            {/* To Date Filter */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                title="To Date (End Date)"
                className="pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50/50 transition-all"
              />
              <Calendar size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
            </div>

            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                title="Clear Dates"
                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer"
                title="Export Options"
              >
                <Download size={14} className="text-gray-500" />
                <span>Export</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Table size={15} className="text-gray-500" />
                    <span>Export to CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportToExcel}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Export to Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportToWord}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium border-t border-gray-100 mt-1 pt-1.5 cursor-pointer"
                  >
                    <FileText size={15} className="text-blue-600" />
                    <span>Export to Word</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reset Filters */}
            {(searchTerm || selectedStatus || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  setSelectedStatus("");
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                title="Reset All Filters"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Leads"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-[#225091]" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            ref={tableRef}
            className="w-full text-left border-collapse min-w-[1000px]"
          >
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-4 font-semibold">Application / Loan ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer & Contact</th>
                {isMerchantSystem ? (
                  <>
                    <th className="py-3.5 px-4 font-semibold">Merchant / Store</th>
                    <th className="py-3.5 px-4 font-semibold">Product & Price</th>
                    <th className="py-3.5 px-4 font-semibold">Loan Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Settlement Status</th>
                  </>
                ) : isCustomerSystem ? (
                  <>
                    <th className="py-3.5 px-4 font-semibold">Product & IMEI</th>
                    <th className="py-3.5 px-4 font-semibold">Financials & EMI</th>
                    <th className="py-3.5 px-4 font-semibold">KYC Photos</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                  </>
                ) : (
                  <>
                    <th className="py-3.5 px-4 font-semibold">Phone Number</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                  </>
                )}
                <th className="py-3.5 px-4 font-semibold text-center min-w-[210px] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={isCustomerSystem || isMerchantSystem ? "8" : "5"} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2
                        size={28}
                        className="animate-spin text-[#225091]"
                      />
                      <span className="text-sm font-medium">
                        Loading leads...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : leads && leads.length > 0 ? (
                leads.map((lead, idx) => {
                  const displaySrNo = (meta.page - 1) * meta.limit + idx + 1;
                  const leadId = lead.loanId || lead.id || lead._id;
                  const appId = lead.applicationId || lead.applicationNumber || (leadId ? `ADV-LN-${leadId.slice(-5).toUpperCase()}` : "—");
                  const createdDate = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
                  
                  // Extract Customer details from API
                  const cust = lead.customerDetails || lead.customer || {};
                  const custName = cust.fullName || lead.customerName || lead.name || "—";
                  const custPhone = cust.phoneNumber || lead.phoneNumber || "—";
                  const custPan = cust.panNumber || lead.panNumber || "—";
                  const custAadhaar = cust.aadhaarNumber || lead.aadhaarNumber || "—";

                  // Extract Product details from API
                  const prod = lead.productDetails || lead.product || {};
                  const prodBrand = prod.brandName || prod.brand || "—";
                  const prodModel = prod.modelName || prod.model || prod.productName || lead.productName || "—";
                  const prodImei = prod.imeiNumber || prod.imei || "—";
                  const prodPrice = prod.productPrice || prod.price || lead.productPrice || 0;

                  // Extract Financial details from API
                  const fin = lead.financialDetails || lead.loanInformation || {};
                  const totalLoan = fin.totalLoanAmount || fin.loanAmount || lead.totalLoanAmount || prodPrice;
                  const downPay = fin.downPayment || lead.downPayment || 0;
                  const monthlyEmi = fin.emiAmount || lead.emiAmount || 0;
                  const tenure = fin.tenureMonths || lead.tenureMonths || 6;

                  // Extract Merchant details from API
                  const merch = lead.merchantDetails || lead.merchant || {};
                  const shopName = merch.shopName || merch.storeName || lead.shopName || "Merchant Store";
                  const merchName = merch.merchantName || merch.name || "—";
                  const merchPhone = merch.phoneNumber || merch.phone || "—";
                  const merchBank = merch.bankName || "";

                  // Extract Settlement details from API
                  const sett = lead.settlementDetails || {};
                  const settStatus = sett.settlementStatus || (lead.status === 'SETTLED' ? 'SETTLED' : 'PENDING_BRANCH_PAYMENT');
                  const netDisbursal = sett.netDisbursalAmount || totalLoan;
                  const paymentRef = sett.paymentTxnRef || lead.paymentTxnRef || "";

                  const statusVal = lead.approvalStatus || lead.status || "PENDING_APPROVAL";
                  const isAutoApproved = lead.autoApproved === true;
                  const statusUpper = (statusVal || "").toUpperCase().trim();
                  const isFinalState = statusUpper === "APPROVED" || statusUpper === "REJECTED" || statusUpper === "COMPLETED";
                  const isPendingApproval = isCustomerSystem && !isFinalState;
                  const isPendingSettlement = settStatus === "PENDING_BRANCH_PAYMENT";

                  return (
                    <tr
                      key={leadId || idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Sr. No. */}
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {displaySrNo}
                      </td>

                      {/* Application / Loan ID */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-mono font-bold text-gray-900 block text-xs">
                            {appId}
                          </span>
                          {lead.loanId && (
                            <span className="text-[10px] font-mono text-gray-400 block truncate max-w-[130px]" title={lead.loanId}>
                              ID: {lead.loanId}
                            </span>
                          )}
                          {createdDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200/60 mt-1">
                              <Calendar size={10} className="text-gray-400" />
                              {createdDate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-[#225091] shrink-0">
                            {getInitials(custName)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-xs">
                              {custName}
                            </span>
                            <span className="text-[11px] font-mono text-gray-500 block">
                              {custPhone}
                            </span>
                            {custPan !== "—" && (
                              <span className="text-[10px] font-mono text-gray-400">
                                PAN: {custPan}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Customer System Columns */}
                      {isCustomerSystem && (
                        <>
                          {/* Product & IMEI */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-semibold text-gray-900 block text-xs">
                                {prodBrand !== "—" ? `${prodBrand} ` : ""}{prodModel}
                              </span>
                              <span className="text-[11px] font-mono text-gray-500 block">
                                IMEI: {prodImei}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 block">
                                ₹{Number(prodPrice).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </td>

                          {/* Financials & EMI */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">
                                ₹{Number(totalLoan).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-gray-400">Loan</span>
                              </span>
                              <span className="text-[11px] text-gray-600 block">
                                EMI: <strong className="text-gray-900">₹{Number(monthlyEmi).toLocaleString('en-IN')}</strong>/mo ({tenure}m)
                              </span>
                              {downPay > 0 && (
                                <span className="text-[10px] text-gray-400 block">
                                  DP: ₹{Number(downPay).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* KYC Photos */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {cust.livePhoto && (
                                <button
                                  type="button"
                                  onClick={() => { setPreviewImage(cust.livePhoto); setPreviewTitle(`${custName} - Live Photo`); }}
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-300 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer shadow-2xs relative group shrink-0"
                                  title="View Live Selfie Photo"
                                >
                                  <img src={cust.livePhoto} alt="Live" className="w-full h-full object-cover" />
                                </button>
                              )}
                              {cust.panImage && (
                                <button
                                  type="button"
                                  onClick={() => { setPreviewImage(cust.panImage); setPreviewTitle(`${custName} - PAN Card Image`); }}
                                  className="h-8 px-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 text-[11px] font-bold hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                                  title="View PAN Card Image"
                                >
                                  PAN
                                </button>
                              )}
                              {cust.aadhaarImage && (
                                <button
                                  type="button"
                                  onClick={() => { setPreviewImage(cust.aadhaarImage); setPreviewTitle(`${custName} - Aadhaar Card Image`); }}
                                  className="h-8 px-2 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200/80 hover:bg-cyan-100 text-[11px] font-bold hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                                  title="View Aadhaar Card Image"
                                >
                                  UID
                                </button>
                              )}
                              {!cust.livePhoto && !cust.panImage && !cust.aadhaarImage && (
                                <span className="text-[11px] text-gray-400 italic">No media</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              {getStatusBadge(statusVal)}
                              {isAutoApproved && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  <Sparkles size={10} /> Auto Approved
                                </span>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Merchant System Columns */}
                      {isMerchantSystem && (
                        <>
                          {/* Merchant / Store */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-gray-900 block text-xs flex items-center gap-1">
                                <Store size={12} className="text-[#7c3aed]" />
                                {shopName}
                              </span>
                              <span className="text-[11px] text-gray-600 block">
                                {merchName}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 block">
                                {merchPhone}
                              </span>
                              {merchBank && (
                                <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-100 mt-0.5 inline-block">
                                  {merchBank}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Product & Price */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-semibold text-gray-900 block text-xs">
                                {prodBrand !== "—" ? `${prodBrand} ` : ""}{prodModel}
                              </span>
                              <span className="text-[11px] font-bold text-gray-900">
                                ₹{Number(prodPrice).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </td>

                          {/* Loan Amount */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-900 text-xs">
                              ₹{Number(totalLoan).toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Settlement Status */}
                          <td className="py-3.5 px-4">
                            <div>
                              {getStatusBadge(settStatus)}
                              <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                                Disbursal: <strong>₹{Number(netDisbursal).toLocaleString('en-IN')}</strong>
                              </span>
                              {paymentRef && (
                                <span className="text-[9px] font-mono text-gray-400 block mt-0.5">
                                  Ref: {paymentRef}
                                </span>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Standard Columns */}
                      {!isCustomerSystem && !isMerchantSystem && (
                        <>
                          <td className="py-3.5 px-4 text-xs text-gray-600">
                            {lead.phoneNumber || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(lead.status)}
                          </td>
                        </>
                      )}

                      {/* Actions strictly based on APIs */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex justify-center items-center gap-1.5">
                          {/* 1B & 1C. Approve / Reject Actions for Customer Leads */}
                          {isCustomerSystem && isPendingApproval && (
                            <>
                              <button
                                type="button"
                                onClick={() => { setLeadToApprove(lead); setApproveRemarks(""); setIsApproveModalOpen(true); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                                title="Manually Approve Loan Application"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setLeadToReject(lead); setRejectReason(""); setIsRejectModalOpen(true); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 hover:border-rose-300 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                                title="Reject Loan Application"
                              >
                                <XCircle size={13} className="text-rose-600" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* 2B. Execute Settlement Action for Merchant Leads */}
                          {isMerchantSystem && isPendingSettlement && (
                            <button
                              type="button"
                              onClick={() => { setLeadToSettle(lead); setSettleTxnRef(""); setSettleRemarks(""); setIsSettleModalOpen(true); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 hover:border-purple-300 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                              title="Execute Next-Day Merchant Settlement"
                            >
                              <IndianRupee size={13} className="text-purple-600" />
                              <span>Settle Disbursal</span>
                            </button>
                          )}

                          {/* Quick Details View */}
                          <button
                            type="button"
                            onClick={() => setQuickDetailLead(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 hover:border-[#225091]/30 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye size={13} className="text-[#225091]" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isCustomerSystem || isMerchantSystem ? "8" : "5"} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={32} className="text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">
                        No {resolvedTitle ? `${resolvedTitle} ` : ""}leads found.
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your search query, status, or date range filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination Bar */}
        {!loading && meta.totalRecords > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-gray-50/30">
            <div className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{leads.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}</span> to{" "}
              <span className="font-bold text-gray-800">{Math.min(meta.page * meta.limit, meta.totalRecords)}</span> of{" "}
              <span className="font-bold text-gray-800">{meta.totalRecords}</span> Entries
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!meta.hasPrevPage || page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1,
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
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          meta.page === p
                            ? "bg-[#225091] text-white shadow-2xs"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={!meta.hasNextPage || page >= meta.totalPages || loading}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1B. Manual Approve Modal */}
      {isApproveModalOpen && leadToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 overflow-hidden flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Approve Customer Loan</h3>
                <p className="text-xs text-gray-500 font-mono">
                  {leadToApprove.applicationId || leadToApprove.applicationNumber || leadToApprove.loanId}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Applicant Name:</span>
                <span className="font-bold text-gray-900">{leadToApprove.customerDetails?.fullName || leadToApprove.customerName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Loan Amount:</span>
                <span className="font-bold text-emerald-700">₹{Number(leadToApprove.financialDetails?.totalLoanAmount || leadToApprove.totalLoanAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Product:</span>
                <span className="font-medium text-gray-800">{leadToApprove.productDetails?.brandName} {leadToApprove.productDetails?.modelName}</span>
              </div>
            </div>

            <form onSubmit={handleApproveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Manager Approval Remarks
                </label>
                <textarea
                  rows={3}
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  placeholder="e.g. Manually verified income documents and approved by Branch Manager"
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={approveSubmitting}
                  onClick={() => { setIsApproveModalOpen(false); setLeadToApprove(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {approveSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{approveSubmitting ? "Approving..." : "Confirm Approve"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1C. Manual Reject Modal */}
      {isRejectModalOpen && leadToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 overflow-hidden flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 font-bold">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Customer Loan</h3>
                <p className="text-xs text-gray-500 font-mono">
                  {leadToReject.applicationId || leadToReject.applicationNumber || leadToReject.loanId}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Applicant:</span>
                <span className="font-bold text-gray-900">{leadToReject.customerDetails?.fullName || leadToReject.customerName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requested Loan:</span>
                <span className="font-bold text-gray-900">₹{Number(leadToReject.financialDetails?.totalLoanAmount || leadToReject.totalLoanAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRejectCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. CIBIL score discrepancy and incomplete address proof"
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-gray-50/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={rejectSubmitting}
                  onClick={() => { setIsRejectModalOpen(false); setLeadToReject(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting || !rejectReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {rejectSubmitting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  <span>{rejectSubmitting ? "Rejecting..." : "Confirm Reject"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2B. Settle Merchant Modal */}
      {isSettleModalOpen && leadToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 overflow-hidden flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 font-bold">
                <Store size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Merchant Disbursal Settlement</h3>
                <p className="text-xs text-gray-500 font-mono">
                  {leadToSettle.applicationId || leadToSettle.applicationNumber || leadToSettle.loanId}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Merchant / Shop:</span>
                <span className="font-bold text-gray-900">{leadToSettle.merchantDetails?.shopName || "Merchant Partner"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Merchant Name:</span>
                <span className="font-medium text-gray-900">{leadToSettle.merchantDetails?.merchantName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Disbursal Amount:</span>
                <span className="font-bold text-purple-700 text-sm">
                  ₹{Number(leadToSettle.settlementDetails?.netDisbursalAmount || leadToSettle.financialDetails?.totalLoanAmount || leadToSettle.totalLoanAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSettleMerchant} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Transaction Ref / UTR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settleTxnRef}
                  onChange={(e) => setSettleTxnRef(e.target.value.toUpperCase())}
                  placeholder="e.g. UTR99283120485"
                  className="w-full p-2.5 text-xs font-mono font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Settlement Remarks
                </label>
                <textarea
                  rows={2}
                  value={settleRemarks}
                  onChange={(e) => setSettleRemarks(e.target.value)}
                  placeholder="e.g. Next day loan disbursal paid to Merchant HDFC Bank Account"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={settleSubmitting}
                  onClick={() => { setIsSettleModalOpen(false); setLeadToSettle(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settleSubmitting || !settleTxnRef.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {settleSubmitting ? <Loader2 size={14} className="animate-spin" /> : <IndianRupee size={14} />}
                  <span>{settleSubmitting ? "Settling..." : "Complete Settlement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Quick Lead Details Modal */}
      {quickDetailLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center font-bold">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Lead Details — {quickDetailLead.applicationId || quickDetailLead.applicationNumber || quickDetailLead.loanId}
                  </h3>
                  <div className="mt-0.5">{getStatusBadge(quickDetailLead.approvalStatus || quickDetailLead.status)}</div>
                </div>
              </div>
              <button
                onClick={() => setQuickDetailLead(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Customer Profile */}
              <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User size={14} className="text-[#225091]" /> Customer Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Full Name</span>
                    <span className="font-bold text-gray-900">{quickDetailLead.customerDetails?.fullName || quickDetailLead.customerName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Phone Number</span>
                    <span className="font-bold text-gray-900 font-mono">{quickDetailLead.customerDetails?.phoneNumber || quickDetailLead.phoneNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Gender / DOB</span>
                    <span className="font-semibold text-gray-800">{quickDetailLead.customerDetails?.gender || "—"} | {quickDetailLead.customerDetails?.dob || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">PAN Number</span>
                    <span className="font-mono font-bold text-gray-900">{quickDetailLead.customerDetails?.panNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Aadhaar Number</span>
                    <span className="font-mono font-bold text-gray-900">{quickDetailLead.customerDetails?.aadhaarNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Address</span>
                    <span className="font-medium text-gray-800 truncate block" title={quickDetailLead.customerDetails?.address}>{quickDetailLead.customerDetails?.address || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Product & Loan Breakdown */}
              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/80">
                <h4 className="font-bold text-[#225091] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Smartphone size={14} /> Product & Loan Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Brand & Model</span>
                    <span className="font-bold text-gray-900">{quickDetailLead.productDetails?.brandName} {quickDetailLead.productDetails?.modelName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Product Price</span>
                    <span className="font-bold text-gray-900">₹{Number(quickDetailLead.productDetails?.productPrice || quickDetailLead.productPrice || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Down Payment</span>
                    <span className="font-bold text-gray-900">₹{Number(quickDetailLead.financialDetails?.downPayment || quickDetailLead.downPayment || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Total Loan Amount</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{Number(quickDetailLead.financialDetails?.totalLoanAmount || quickDetailLead.totalLoanAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Monthly EMI</span>
                    <span className="font-bold text-gray-900">₹{Number(quickDetailLead.financialDetails?.emiAmount || quickDetailLead.emiAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Tenure</span>
                    <span className="font-bold text-gray-900">{quickDetailLead.financialDetails?.tenureMonths || quickDetailLead.tenureMonths || 6} Months</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[11px]">IMEI Number</span>
                    <span className="font-mono font-bold text-gray-800">{quickDetailLead.productDetails?.imeiNumber || "—"}</span>
                  </div>
                </div>
              </div>

              {/* KYC Media Preview in Modal */}
              {(quickDetailLead.customerDetails?.livePhoto || quickDetailLead.customerDetails?.panImage || quickDetailLead.customerDetails?.aadhaarImage) && (
                <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100/80">
                  <h4 className="font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ImageIcon size={14} /> KYC Verification Documents
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {quickDetailLead.customerDetails?.livePhoto && (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { setPreviewImage(quickDetailLead.customerDetails.livePhoto); setPreviewTitle("Live Selfie Photo"); }}
                          className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-400 hover:scale-105 transition-transform cursor-pointer shadow-xs"
                        >
                          <img src={quickDetailLead.customerDetails.livePhoto} alt="Live" className="w-full h-full object-cover" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-600">Live Selfie</span>
                      </div>
                    )}
                    {quickDetailLead.customerDetails?.panImage && (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { setPreviewImage(quickDetailLead.customerDetails.panImage); setPreviewTitle("PAN Card Image"); }}
                          className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-400 hover:scale-105 transition-transform cursor-pointer shadow-xs bg-gray-100 flex items-center justify-center"
                        >
                          <img src={quickDetailLead.customerDetails.panImage} alt="PAN" className="w-full h-full object-cover" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-600">PAN Card</span>
                      </div>
                    )}
                    {quickDetailLead.customerDetails?.aadhaarImage && (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { setPreviewImage(quickDetailLead.customerDetails.aadhaarImage); setPreviewTitle("Aadhaar Card Image"); }}
                          className="w-20 h-20 rounded-xl overflow-hidden border-2 border-cyan-400 hover:scale-105 transition-transform cursor-pointer shadow-xs bg-gray-100 flex items-center justify-center"
                        >
                          <img src={quickDetailLead.customerDetails.aadhaarImage} alt="Aadhaar" className="w-full h-full object-cover" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-600">Aadhaar Card</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Merchant Details & Bank Settlement if available */}
              {quickDetailLead.merchantDetails && (
                <div className="p-4 rounded-xl bg-purple-50/30 border border-purple-100">
                  <h4 className="font-bold text-[#7c3aed] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Store size={14} /> Merchant Partner & Settlement Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Store Name</span>
                      <span className="font-bold text-gray-900">{quickDetailLead.merchantDetails?.shopName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Merchant Name</span>
                      <span className="font-bold text-gray-900">{quickDetailLead.merchantDetails?.merchantName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Contact Phone</span>
                      <span className="font-mono font-bold text-gray-900">{quickDetailLead.merchantDetails?.phoneNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Bank Name</span>
                      <span className="font-semibold text-gray-900">{quickDetailLead.merchantDetails?.bankName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Account Number</span>
                      <span className="font-mono font-bold text-gray-900">{quickDetailLead.merchantDetails?.accountNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">IFSC Code</span>
                      <span className="font-mono font-bold text-gray-900">{quickDetailLead.merchantDetails?.ifscCode || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Settlement Status</span>
                      <span className="font-bold text-gray-900">{getStatusBadge(quickDetailLead.settlementDetails?.settlementStatus || "PENDING_BRANCH_PAYMENT")}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Net Disbursal Amount</span>
                      <span className="font-bold text-purple-700 text-sm">
                        ₹{Number(quickDetailLead.settlementDetails?.netDisbursalAmount || quickDetailLead.financialDetails?.totalLoanAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {quickDetailLead.settlementDetails?.paymentTxnRef && (
                      <div>
                        <span className="text-gray-400 block text-[11px]">Payment Transaction / UTR</span>
                        <span className="font-mono font-bold text-gray-900">{quickDetailLead.settlementDetails.paymentTxnRef}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuickDetailLead(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Photo Preview Modal with maximum z-index (sits on top of quickDetailLead and all other modals) */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 cursor-default relative z-10"
          >
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{previewTitle || "KYC Document Preview"}</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-black/5 overflow-auto">
              <img
                src={previewImage}
                alt={previewTitle || "KYC Document Preview"}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#225091] text-white text-xs font-bold hover:bg-[#163a6c] transition-colors shadow-xs"
              >
                <ExternalLink size={13} />
                <span>Open Full Size</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
