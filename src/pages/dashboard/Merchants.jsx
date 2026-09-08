import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Search, Eye, Edit, Trash2, X, 
  ChevronDown, Download, Table, FileSpreadsheet, FileText, Loader2, 
  Store, UserCheck, Archive, RotateCcw,
  CheckCircle2, AlertTriangle, Clock, XCircle, AlertCircle,
  Mail, Phone, Building2, MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import { merchantService } from '../../api/merchantService';
import { branchService } from '../../api/branchService';
import useBranchStore from '../../store/branchStore';
import useAuthStore from '../../store/authStore';
import usePermission from '../../hooks/usePermission';
import { canApproveMerchantOnboarding, isBankOwner } from '../../utils/roleUtils';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Skeleton } from '../../components/common/Skeleton';
import TableWrapper from '../../components/common/TableWrapper';
import StatsCard from '../../components/common/StatsCard';

// Comprehensive Indian States and Prominent Cities Map for fallback
const INDIAN_STATES_WITH_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Durg", "Jagdalpur", "Ambikapur"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Dwarka", "Rohini"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Bharuch"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Baddi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Dharwad", "Mangaluru", "Belagavi", "Davangere", "Ballari", "Kalaburagi", "Shivamogga", "Tumakuru", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Palakkad", "Kottayam", "Malappuram"],
  "Ladakh": ["Leh", "Kargil"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Jalgaon", "Nanded", "Satara", "Sangli"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Greater Noida", "Ghaziabad", "Prayagraj", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Mathura", "Ayodhya"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital", "Rudrapur"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Bardhaman", "Kharagpur", "Malda", "Baharampur", "Habra"]
};

const ALL_INDIAN_STATES = Object.keys(INDIAN_STATES_WITH_CITIES).sort((a, b) => a.localeCompare(b));

const Merchants = () => {
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL
  const initialStatusParam = (searchParams.get('status') || searchParams.get('filter') || '').toUpperCase();
  const initialApprovalStatus = (searchParams.get('approvalStatus') || '').toUpperCase();
  const initialSearch = searchParams.get('search') || '';
  const initialBranchId = searchParams.get('branchId') || '';
  const initialState = searchParams.get('state') || '';
  const initialCity = searchParams.get('city') || '';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const initialStatCard = ['ACTIVE', 'DELETED', 'INACTIVE', 'BLOCKED'].includes(initialStatusParam)
    ? initialStatusParam
    : 'ALL';
  const initialStatus = ['ACTIVE', 'DELETED', 'INACTIVE', 'BLOCKED'].includes(initialStatusParam)
    ? initialStatusParam
    : '';
  const initialIncludeDeleted = initialStatusParam === 'DELETED';
  
  // Data State
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // Overview Stats
  const [stats, setStats] = useState({
    totalMerchants: 0,
    activeMerchants: 0,
    inactiveMerchants: 0,
    blockedMerchants: 0,
    deletedMerchants: 0
  });

  // Active Stat Card Filter ('ALL' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DELETED')
  const [activeStatCard, setActiveStatCard] = useState(initialStatCard);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState(initialApprovalStatus);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted);

  // Permissions & Roles Access Control: Bank Owner, Society Admin, Branch Manager
  const authRole = useAuthStore((state) => state.role);
  const authUser = useAuthStore((state) => state.user);
  const authPermissions = useAuthStore((state) => state.permissions);
  const { canApproveMerchant: hookCanApprove } = usePermission();

  const canApproveMerchant = useMemo(() => {
    return (
      canApproveMerchantOnboarding(authRole, authUser, authPermissions || []) ||
      isBankOwner(authRole, authUser) ||
      hookCanApprove
    );
  }, [authRole, authUser, authPermissions, hookCanApprove]);

  const { globalBranchId, branchOptions, fetchBranches } = useBranchStore();
  
  // Locations Data (State and City mapping)
  const [locationsData, setLocationsData] = useState({
    states: ALL_INDIAN_STATES,
    cities: [],
    stateCitiesMap: {}
  });

  // Pagination State
  const [page, setPage] = useState(initialPage);
  const limit = 10;
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modals State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [merchantToRestore, setMerchantToRestore] = useState(null);
  const [isPermanentModalOpen, setIsPermanentModalOpen] = useState(false);
  const [merchantToPermanent, setMerchantToPermanent] = useState(null);

  // Approval / Rejection Workflow Modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [merchantToApprove, setMerchantToApprove] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [merchantToReject, setMerchantToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [viewReasonModal, setViewReasonModal] = useState({ open: false, merchant: null });

  const [actionLoading, setActionLoading] = useState(false);

  // Load branches & locations
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (globalBranchId) {
      setSelectedBranchId(globalBranchId);
    }
  }, [globalBranchId]);

  // Sync filter states to URL search params
  useEffect(() => {
    const params = {};
    if (selectedStatus && selectedStatus !== 'ALL') {
      params.status = selectedStatus;
    } else if (activeStatCard && activeStatCard !== 'ALL') {
      params.status = activeStatCard;
    }
    if (selectedApprovalStatus && selectedApprovalStatus !== 'ALL') {
      params.approvalStatus = selectedApprovalStatus;
    }
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedBranchId && selectedBranchId !== globalBranchId) params.branchId = selectedBranchId;
    if (selectedState) params.state = selectedState;
    if (selectedCity) params.city = selectedCity;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [
    activeStatCard,
    selectedStatus,
    selectedApprovalStatus,
    debouncedSearch,
    selectedBranchId,
    globalBranchId,
    selectedState,
    selectedCity,
    page,
    setSearchParams,
  ]);

  // Sync URL changes from browser back/forward navigation
  useEffect(() => {
    const urlStatus = (searchParams.get('status') || searchParams.get('filter') || '').toUpperCase();
    if (urlStatus === 'DELETED') {
      setActiveStatCard(prev => prev !== 'DELETED' ? 'DELETED' : prev);
      setSelectedStatus(prev => prev !== 'DELETED' ? 'DELETED' : prev);
      setIncludeDeleted(true);
    } else if (['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(urlStatus)) {
      setActiveStatCard(prev => prev !== urlStatus ? urlStatus : prev);
      setSelectedStatus(prev => prev !== urlStatus ? urlStatus : prev);
      setIncludeDeleted(false);
    } else if (!urlStatus) {
      setActiveStatCard(prev => prev !== 'ALL' ? 'ALL' : prev);
      setSelectedStatus(prev => prev !== '' ? '' : prev);
      setIncludeDeleted(false);
    }
    const urlApproval = (searchParams.get('approvalStatus') || '').toUpperCase();
    setSelectedApprovalStatus(prev => prev !== urlApproval ? urlApproval : prev);
  }, [searchParams]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await branchService.getAvailableLocations();
        const data = res?.data || res || {};
        const apiStates = Array.isArray(data?.states) ? data.states : (Array.isArray(data?.availableStates) ? data.availableStates : []);
        const apiCities = Array.isArray(data?.cities) ? data.cities : [];
        const rawMap = data?.stateCitiesMap || data?.stateCityMap || {};
        const stateCityMap = (typeof rawMap === 'object' && rawMap !== null) ? rawMap : {};
        const combinedStates = Array.from(new Set([...apiStates, ...ALL_INDIAN_STATES])).sort((a, b) => a.localeCompare(b));
        setLocationsData({ 
          states: combinedStates.length > 0 ? combinedStates : ALL_INDIAN_STATES, 
          cities: apiCities,
          stateCitiesMap: stateCityMap 
        });
      } catch (err) {
        console.warn("Failed to fetch locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // States List
  const statesList = useMemo(() => {
    if (locationsData.states && locationsData.states.length > 0) {
      return locationsData.states;
    }
    return ALL_INDIAN_STATES;
  }, [locationsData.states]);

  // Cascading Available Cities for the Selected State
  const availableCities = useMemo(() => {
    if (!selectedState) {
      return [];
    }
    const fromDictionary = INDIAN_STATES_WITH_CITIES[selectedState] || [];
    const fromApi = (locationsData.stateCitiesMap && locationsData.stateCitiesMap[selectedState]) || [];
    const combined = Array.from(new Set([...fromDictionary, ...fromApi])).sort((a, b) => a.localeCompare(b));
    return combined;
  }, [selectedState, locationsData]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Merchants
  const fetchMerchants = useCallback(async (pageNo = page) => {
    setLoading(true);
    try {
      const params = { page: pageNo, limit };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      
      // Status and Deleted filter handling
      if (selectedStatus && selectedStatus !== 'ALL' && selectedStatus !== 'DELETED') {
        params.status = selectedStatus;
      }
      
      // Approval Status filter
      if (selectedApprovalStatus && selectedApprovalStatus !== 'ALL') {
        params.approvalStatus = selectedApprovalStatus;
      }

      if (includeDeleted || selectedStatus === 'DELETED' || activeStatCard === 'DELETED') {
        params.isDeleted = true;
        params.status = 'DELETED';
      }
      
      if (selectedBranchId && selectedBranchId !== 'ALL') params.branchId = selectedBranchId;
      if (selectedState && selectedState !== 'ALL') params.state = selectedState;
      if (selectedCity && selectedCity !== 'ALL') params.city = selectedCity;

      const response = await merchantService.list(params);
      if (response && (response.success || response.data || Array.isArray(response))) {
        const payload = response.data || response;
        const rawList = 
          (Array.isArray(payload) ? payload : null) ||
          payload.items || 
          payload.merchants || 
          payload.data || 
          payload.merchantList ||
          (Array.isArray(response) ? response : null) || 
          [];
        setMerchants(Array.isArray(rawList) ? rawList : []);

        const statsObj = payload.stats || response.stats || payload.data?.stats;
        if (statsObj) {
          setStats(statsObj);
        }

        const rawMeta = payload.meta || payload.pagination || response.meta || payload.data?.meta;
        const total = Number(
          rawMeta?.totalRecords ?? 
          rawMeta?.total ?? 
          payload.totalRecords ?? 
          payload.total ?? 
          payload.count ?? 
          (Array.isArray(rawList) ? rawList.length : 0)
        );
        const metaObj = { 
          page: Number(rawMeta?.page || payload.page || pageNo), 
          limit: Number(rawMeta?.limit || payload.limit || limit), 
          totalRecords: total, 
          totalPages: Number(rawMeta?.totalPages || payload.totalPages || Math.ceil(total / limit) || 1),
          hasNextPage: Boolean(rawMeta?.hasNextPage),
          hasPrevPage: Boolean(rawMeta?.hasPrevPage || pageNo > 1)
        };
        setMeta(metaObj);
      } else {
        setMerchants([]);
        setMeta({ page: 1, limit, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      }
    } catch (error) {
      console.warn("Fetch merchants error:", error);
      setMerchants([]);
      setMeta({ page: 1, limit, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedStatus, selectedApprovalStatus, includeDeleted, activeStatCard, selectedBranchId, selectedState, selectedCity]);

  useEffect(() => {
    fetchMerchants(page);
  }, [fetchMerchants, page]);

  const handlePageChange = (newPage) => {
    const totalPages = meta.totalPages || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedStatus('');
    setSelectedApprovalStatus('');
    setSelectedBranchId(globalBranchId || '');
    setSelectedState('');
    setSelectedCity('');
    setIncludeDeleted(false);
    setActiveStatCard('ALL');
    setPage(1);
  };

  const hasActiveFilters = Boolean(debouncedSearch.trim()) || Boolean(selectedStatus) || Boolean(selectedApprovalStatus) || Boolean(selectedBranchId && selectedBranchId !== globalBranchId) || Boolean(selectedState) || Boolean(selectedCity) || includeDeleted || activeStatCard !== 'ALL';

  // Lifecycle & Approval Action Handlers
  const handleApproveMerchant = async () => {
    if (!merchantToApprove) return;
    const targetId = merchantToApprove.id || merchantToApprove._id || merchantToApprove.merchantId;
    setActionLoading(true);
    try {
      const res = await merchantService.approve(targetId);
      toast.success(res?.message || `Merchant "${merchantToApprove.shopName || 'Partner'}" approved successfully!`);
      setIsApproveModalOpen(false);
      setMerchantToApprove(null);
      fetchMerchants(page);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error(err.response?.data?.message || 'Failed to approve merchant onboarding.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMerchant = async () => {
    if (!merchantToReject) return;
    if (!rejectionReason.trim()) {
      setRejectReasonError('Please provide a reason for rejecting this merchant onboarding.');
      return;
    }
    const targetId = merchantToReject.id || merchantToReject._id || merchantToReject.merchantId;
    setActionLoading(true);
    try {
      const res = await merchantService.reject(targetId, rejectionReason.trim());
      toast.success(res?.message || `Merchant "${merchantToReject.shopName || 'Partner'}" onboarding rejected.`);
      setIsRejectModalOpen(false);
      setMerchantToReject(null);
      setRejectionReason('');
      setRejectReasonError('');
      fetchMerchants(page);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.response?.data?.message || 'Failed to reject merchant onboarding.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleSoftDelete = async () => {
    if (!merchantToDelete) return;
    setActionLoading(true);
    try {
      const id = merchantToDelete.id || merchantToDelete._id || merchantToDelete.merchantId;
      const res = await merchantService.softDelete(id);
      toast.success(res?.message || "Merchant account soft-deleted successfully.");
      setIsDeleteModalOpen(false);
      setMerchantToDelete(null);
      fetchMerchants(page);
    } catch (error) {
      console.error("Soft delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to soft-delete merchant.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!merchantToRestore) return;
    setActionLoading(true);
    try {
      const id = merchantToRestore.id || merchantToRestore._id || merchantToRestore.merchantId;
      const res = await merchantService.restore(id);
      toast.success(res?.message || "Merchant account restored successfully.");
      setIsRestoreModalOpen(false);
      setMerchantToRestore(null);
      fetchMerchants(page);
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error(error.response?.data?.message || "Failed to restore merchant.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!merchantToPermanent) return;
    setActionLoading(true);
    try {
      const id = merchantToPermanent.id || merchantToPermanent._id || merchantToPermanent.merchantId;
      const res = await merchantService.permanentDelete(id);
      toast.success(res?.message || "Merchant permanently deleted.");
      setIsPermanentModalOpen(false);
      setMerchantToPermanent(null);
      fetchMerchants(page);
    } catch (error) {
      console.error("Permanent delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to permanently delete merchant.");
    } finally {
      setActionLoading(false);
    }
  };

  // Export Utilities
  const getSelectedDataFromTable = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const table = tableRef.current;
    const ths = Array.from(table.querySelectorAll('thead th'));
    const headers = ths.slice(0, -1).map(th => th.innerText.trim().replace(/\n/g, ' '));
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
      ...rows.map(row => row.map(v => '"' + (v || '').replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Merchants.csv';
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <table border="1">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Merchants.xls';
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Merchants Export</title></head><body>
      <table border="1">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      </body></html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Merchants.doc';
    link.click();
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header and Breadcrumb */}
      <PageHeader
        title="Merchants"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Partner Management" },
          { label: "Merchants" }
        ]}
        showBack={false}
        backUrl="/dashboard"
      />

      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatsCard
          layout="centered"
          label="Total Merchants"
          value={stats.totalMerchants}
          color="blue"
          isActive={activeStatCard === 'ALL' && !selectedStatus && !includeDeleted}
          onClick={() => {
            setActiveStatCard('ALL');
            setSelectedStatus('');
            setIncludeDeleted(false);
            setPage(1);
          }}
        />
        <StatsCard
          layout="centered"
          label="Active Merchants"
          value={stats.activeMerchants}
          color="emerald"
          isActive={activeStatCard === 'ACTIVE' || selectedStatus === 'ACTIVE'}
          onClick={() => {
            setActiveStatCard('ACTIVE');
            setSelectedStatus('ACTIVE');
            setIncludeDeleted(false);
            setPage(1);
          }}
        />
        <StatsCard
          layout="centered"
          label="Soft-Deleted"
          value={stats.deletedMerchants}
          color="rose"
          isActive={activeStatCard === 'DELETED' || selectedStatus === 'DELETED' || includeDeleted}
          onClick={() => {
            setActiveStatCard('DELETED');
            setSelectedStatus('DELETED');
            setIncludeDeleted(true);
            setPage(1);
          }}
        />
      </div>

      {/* Filter Toolbar Card (Matching Employee & Branch standard) */}
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
              placeholder="Search by shop name, owner, email, phone, GSTIN, PAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Include Deleted Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors shadow-2xs">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#225091] focus:ring-[#225091] border-gray-300 cursor-pointer"
              />
              <span>Include Deleted</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                  >
                    <Table size={15} className="text-gray-500" />
                    <span>Export to CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Export to Excel</span>
                  </button>
                  <button
                    onClick={exportToWord}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium border-t border-gray-100 mt-1 pt-1.5"
                  >
                    <FileText size={15} className="text-blue-600" />
                    <span>Export to Word</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add New Merchant */}
            <Link 
              to="/merchant/create" 
              className="flex items-center gap-1.5 px-4.5 py-2 bg-[#225091] hover:bg-[#183f72] text-white rounded-xl font-bold text-xs transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <span>+ Add New Merchant</span>
            </Link>
          </div>
        </div>

        {/* Bottom Inline Filter Controls: Status -> Approval -> Branch -> State -> City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
          {/* 1. Account Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val);
                if (val === 'DELETED') {
                  setIncludeDeleted(true);
                  setActiveStatCard('DELETED');
                } else {
                  setIncludeDeleted(false);
                  setActiveStatCard(val || 'ALL');
                }
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DELETED">Soft-Deleted</option>
              <option value="ALL">All (Inc. Deleted)</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 2. Onboarding Approval Status Filter */}
          <div className="relative">
            <select
              value={selectedApprovalStatus}
              onChange={(e) => {
                setSelectedApprovalStatus(e.target.value);
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Approvals</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 3. Branch Filter */}
          <div className="relative">
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Branches</option>
              {(branchOptions || []).map((b) => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.name || b.branchName}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 4. State / Region Filter */}
          <div>
            <SearchableSelect
              value={selectedState}
              onChange={(val) => {
                setSelectedState(val);
                setSelectedCity('');
                setPage(1);
              }}
              options={[
                { value: '', label: 'All States / Regions' },
                ...statesList.map((st) => ({ value: st, label: st }))
              ]}
              placeholder="All States / Regions"
              searchPlaceholder="Search state or region..."
              className="text-xs"
            />
          </div>

          {/* 4. City Filter (Connected to State) */}
          <div>
            <SearchableSelect
              value={selectedCity}
              disabled={!selectedState || availableCities.length === 0}
              disabledPlaceholder={!selectedState ? "Select State first" : "No cities available"}
              onChange={(val) => {
                setSelectedCity(val);
                setPage(1);
              }}
              options={[
                { value: '', label: selectedState ? `All Cities in ${selectedState}` : 'All Cities' },
                ...availableCities.map((ct) => ({ value: ct, label: ct }))
              ]}
              placeholder={selectedState ? `All Cities in ${selectedState}` : 'Select State first'}
              searchPlaceholder="Search city..."
              className="text-xs"
            />
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-600 text-[11px]">Active:</span>
              {selectedStatus && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Status: {selectedStatus}
                  <button onClick={() => { setSelectedStatus(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedApprovalStatus && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Approval: {selectedApprovalStatus === 'PENDING' ? 'Pending Approval' : selectedApprovalStatus}
                  <button onClick={() => { setSelectedApprovalStatus(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedBranchId && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Branch: {(branchOptions || []).find(b => (b.id || b._id) === selectedBranchId)?.name || 'Selected Branch'}
                  <button onClick={() => { setSelectedBranchId(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedState && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  State: {selectedState}
                  <button onClick={() => { setSelectedState(''); setSelectedCity(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  City: {selectedCity}
                  <button onClick={() => { setSelectedCity(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {includeDeleted && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Showing Deleted
                  <button onClick={() => { setIncludeDeleted(false); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Search: "{debouncedSearch}"
                  <button onClick={() => { setSearchTerm(''); setDebouncedSearch(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 overflow-hidden flex flex-col">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50/80 border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap text-center w-14">#</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap min-w-[230px]">Shop / Business</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap min-w-[180px]">Owner Name</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap min-w-[200px]">Contact Info</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap min-w-[190px]">Branch & Location</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap text-center min-w-[130px]">Approval</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap text-center min-w-[110px]">Status</th>
                <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap text-center min-w-[220px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-4 text-center"><Skeleton className="h-4 w-6 mx-auto rounded" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32 rounded" />
                          <Skeleton className="h-3 w-20 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-3.5 w-36 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                    <td className="py-4 px-5 text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Skeleton className="h-7 w-14 rounded-lg" />
                        <Skeleton className="h-7 w-16 rounded-lg" />
                        <Skeleton className="h-7 w-14 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : merchants && merchants.length > 0 ? (
                merchants.map((row, idx) => {
                  const srNo = (meta.page - 1) * (meta.limit || 10) + idx + 1;
                  const rowId = row.id || row._id || row.merchantId;
                  
                  // Shop & Business Name
                  const shopName = row.shopName || row.businessName || row.name || row.merchantName || row.tradeName || '—';
                  const gstin = row.gstinNumber || row.gstNumber || row.gstin || row.gst || '';
                  const category = row.category || row.businessCategory || row.shopCategory || '';
                  
                  // Owner Info
                  const ownerName = row.ownerName || row.shopOwnerName || row.fullName || row.owner?.fullName || row.owner?.name || row.user?.fullName || row.user?.name || row.contactPerson || row.name || '—';
                  const email = row.email || row.businessEmail || row.ownerEmail || row.owner?.email || row.user?.email || row.contactEmail || '';
                  const phone = row.phoneNumber || row.phone || row.mobileNumber || row.mobile || row.owner?.phoneNumber || row.owner?.phone || row.user?.phoneNumber || row.user?.phone || '';
                  
                  // Branch & Location
                  const branchName = row.branchName || row.branch?.name || row.branch?.branchName || row.branchId?.name || (typeof row.branch === 'string' ? row.branch : null) || '—';
                  const city = row.city || row.address?.city || row.branch?.city || row.branchCity || '';
                  const state = row.state || row.address?.state || row.branch?.state || row.branchState || '';
                  const locationStr = [city, state].filter(Boolean).join(', ');

                  // Soft Deleted Evaluation
                  const isDeleted = Boolean(
                    row.isDeleted === true ||
                    row.deleted === true ||
                    row.deletedAt ||
                    (typeof row.status === 'string' && (row.status.toUpperCase() === 'DELETED' || row.status.toUpperCase() === 'DEACTIVATED')) ||
                    activeStatCard === 'DELETED' ||
                    selectedStatus === 'DELETED'
                  );
                  const statusStr = (
                    row.status || 
                    (row.isActive === true ? 'ACTIVE' : (row.isActive === false ? 'INACTIVE' : (isDeleted ? 'DELETED' : 'ACTIVE')))
                  ).toUpperCase();

                  // Approval Status Evaluation
                  const approvalStatusUpper = (
                    row.approvalStatus || 
                    row.approval_status ||
                    (row.rejectionReason ? 'REJECTED' : (row.isApproved === true ? 'APPROVED' : 'PENDING'))
                  ).toUpperCase();

                  return (
                    <tr key={rowId || idx} className="hover:bg-slate-50/70 transition-colors group">
                      {/* 1. Sr. No. */}
                      <td className="py-3.5 px-4 text-[13px] text-gray-500 font-medium text-center">{row.srNo || srNo}</td>
                      
                      {/* 2. Shop / Business */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 shadow-2xs">
                            <Store size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[13.5px] font-bold text-gray-900 block truncate" title={shopName}>
                              {shopName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {gstin ? (
                                <span className="text-[10px] text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/60" title={`GSTIN: ${gstin}`}>
                                  GST: {gstin}
                                </span>
                              ) : null}
                              {category ? (
                                <span className="text-[10px] text-blue-700 bg-blue-50/70 font-semibold px-1.5 py-0.5 rounded border border-blue-100">
                                  {category}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Owner Name */}
                      <td className="py-3.5 px-5">
                        <span className="text-[13px] font-semibold text-gray-800 block">{ownerName}</span>
                        {row.panNumber || row.aadhaarNumber ? (
                          <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                            {row.panNumber ? `PAN: ${row.panNumber}` : `UID: ****${String(row.aadhaarNumber).slice(-4)}`}
                          </span>
                        ) : null}
                      </td>

                      {/* 4. Contact Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1 text-xs">
                          {phone ? (
                            <a href={`tel:${phone}`} className="text-gray-700 font-semibold flex items-center gap-1.5 hover:text-[#225091] transition-colors">
                              <Phone size={11} className="text-gray-400 shrink-0" />
                              <span>{phone}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 flex items-center gap-1.5"><Phone size={11} className="text-gray-300" /> —</span>
                          )}
                          {email ? (
                            <a href={`mailto:${email}`} className="text-gray-500 flex items-center gap-1.5 hover:text-[#225091] transition-colors truncate max-w-[190px]" title={email}>
                              <Mail size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate">{email}</span>
                            </a>
                          ) : null}
                        </div>
                      </td>

                      {/* 5. Branch & Location */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Building2 size={13} className="text-[#225091] shrink-0" />
                            <span>{branchName}</span>
                          </span>
                          {locationStr ? (
                            <span className="text-[11px] text-gray-500 flex items-center gap-1 ml-4" title={locationStr}>
                              <MapPin size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{locationStr}</span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                      
                      {/* 6. Approval Status */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        {approvalStatusUpper === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                            <CheckCircle2 size={13} /> Approved
                          </span>
                        ) : approvalStatusUpper === 'REJECTED' ? (
                          <button
                            type="button"
                            onClick={() => setViewReasonModal({ open: true, merchant: row })}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                            title="Click to view rejection reason"
                          >
                            <XCircle size={13} /> Rejected
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                            <Clock size={13} className="animate-pulse" /> Pending
                          </span>
                        )}
                      </td>

                      {/* 7. Account Status */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        {isDeleted ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 uppercase tracking-wider">
                            Deleted
                          </span>
                        ) : statusStr === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : statusStr === 'BLOCKED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      
                      {/* 8. Action */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <Link 
                            to={`/merchant/${rowId}/view`} 
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 border border-[#225091]/15 transition-all shadow-2xs" 
                            title="View Merchant Profile"
                          >
                            <Eye size={13} /> View
                          </Link>

                          {!isDeleted ? (
                            <>
                              {/* Quick Approve / Reject for Authorized Bank Owner, Society Admin, Branch Manager */}
                              {canApproveMerchant && (
                                <>
                                  {approvalStatusUpper !== 'APPROVED' && (
                                    <button 
                                      onClick={() => {
                                        setMerchantToApprove(row);
                                        setIsApproveModalOpen(true);
                                      }} 
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 transition-all shadow-2xs cursor-pointer" 
                                      title={approvalStatusUpper === 'REJECTED' ? "Re-Approve Merchant Onboarding" : "Approve Merchant Onboarding"}
                                    >
                                      <CheckCircle2 size={13} /> {approvalStatusUpper === 'REJECTED' ? 'Re-Approve' : 'Approve'}
                                    </button>
                                  )}

                                  {approvalStatusUpper !== 'REJECTED' && (
                                    <button 
                                      onClick={() => {
                                        setMerchantToReject(row);
                                        setRejectionReason('');
                                        setRejectReasonError('');
                                        setIsRejectModalOpen(true);
                                      }} 
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs cursor-pointer" 
                                      title="Reject Merchant Onboarding"
                                    >
                                      <XCircle size={13} /> Reject
                                    </button>
                                  )}
                                </>
                              )}

                              <Link 
                                to={`/merchant/${rowId}/edit`} 
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-2xs" 
                                title="Edit Merchant"
                              >
                                <Edit size={13} /> Edit
                              </Link>
                              <button 
                                onClick={() => {
                                  setMerchantToDelete(row);
                                  setIsDeleteModalOpen(true);
                                }} 
                                className="inline-flex items-center gap-1 p-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all shadow-2xs cursor-pointer" 
                                title="Delete Merchant"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setMerchantToRestore(row);
                                  setIsRestoreModalOpen(true);
                                }} 
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all shadow-2xs cursor-pointer" 
                                title="Restore Merchant Account"
                              >
                                <RotateCcw size={13} /> Restore
                              </button>
                              <button 
                                onClick={() => {
                                  setMerchantToPermanent(row);
                                  setIsPermanentModalOpen(true);
                                }} 
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 transition-all shadow-2xs cursor-pointer" 
                                title="Permanent Hard Delete"
                              >
                                <AlertTriangle size={13} /> Hard Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-blue-50 text-[#225091] rounded-2xl flex items-center justify-center mb-3 border border-blue-100 shadow-2xs">
                        <Store size={24} />
                      </div>
                      <p className="text-base font-bold text-gray-900">No merchants found</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        {debouncedSearch || selectedBranchId || selectedStatus || selectedApprovalStatus
                          ? "No merchant leads match your currently applied search or filter criteria."
                          : "No merchant partners have been onboarded yet."}
                      </p>
                      {(debouncedSearch || selectedBranchId || selectedStatus || selectedApprovalStatus) && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 px-4 py-2 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#183f72] transition-colors shadow-2xs cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrapper>
        
        {/* Pagination Footer */}
        {!loading && merchants && merchants.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto bg-gray-50/40">
            <div className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-semibold text-gray-800">{page}</span> of{" "}
              <span className="font-semibold text-gray-800">{meta.totalPages || 1}</span> (
              <span className="font-semibold text-gray-800">{meta.totalRecords || merchants.length}</span> total entries)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-[#225091] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer shadow-2xs"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 bg-[#225091] text-white text-xs font-bold rounded-full shadow-2xs">
                {page}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= (meta.totalPages || 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-[#225091] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer shadow-2xs"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Soft Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Soft Delete Merchant</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-gray-900">{merchantToDelete?.shopName || 'this merchant'}</span>? Their user login account will be disabled. You can restore them anytime.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleSoftDelete} 
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Deleting...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Restore Confirmation Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <RotateCcw size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restore Merchant Account</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Restore <span className="font-bold text-gray-900">{merchantToRestore?.shopName || 'this merchant'}</span>? This will re-activate their login credentials and mark their status as <span className="text-emerald-600 font-bold">ACTIVE</span>.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => setIsRestoreModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleRestore} 
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Restoring...' : 'Restore Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Permanent Hard Delete Confirmation Modal */}
      {isPermanentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center border-2 border-red-200 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-lg font-black text-red-600 mb-2">Permanent Hard Delete</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              <strong className="text-red-700 block mb-1 font-bold">WARNING: IRREVERSIBLE ACTION</strong>
              This will permanently delete <span className="font-bold text-gray-900">{merchantToPermanent?.shopName || 'this merchant'}</span> and their linked User account from the database.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => setIsPermanentModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handlePermanentDelete} 
                className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Hard Deleting...' : 'Permanent Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Approve Merchant Onboarding Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Approve Merchant Onboarding</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to approve onboarding for <strong className="text-gray-900 font-bold">{merchantToApprove?.shopName || 'this merchant'}</strong>?
            </p>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 mb-6 text-left text-xs text-emerald-900 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 size={14} className="shrink-0" />
                This action will:
              </p>
              <ul className="list-disc list-inside text-[11px] text-emerald-700 space-y-0.5 ml-1">
                <li>Update approval status to <strong>APPROVED</strong></li>
                <li>Set account profile status to <strong>ACTIVE</strong></li>
                <li>Enable linked merchant user account for login access</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setMerchantToApprove(null);
                }} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleApproveMerchant} 
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Approving...' : 'Confirm & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reject Merchant Onboarding Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Merchant Onboarding</h3>
                <p className="text-xs text-gray-500 truncate max-w-[280px]">
                  {merchantToReject?.shopName || 'Merchant Partner'}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Rejecting this onboarding lead will mark the profile as <strong>INACTIVE</strong> and record the rejection reason.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Rejection Reason <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-gray-400 font-normal">{rejectionReason.length} chars</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectReasonError) setRejectReasonError('');
                }}
                placeholder="e.g. Incomplete GST and business proof verification."
                className={`w-full p-3 rounded-xl border text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                  rejectReasonError 
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20' 
                    : 'border-gray-200 focus:ring-[#225091]/20 focus:border-[#225091] bg-gray-50/50 focus:bg-white'
                }`}
              />
              {rejectReasonError && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {rejectReasonError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setMerchantToReject(null);
                  setRejectionReason('');
                  setRejectReasonError('');
                }} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleRejectMerchant} 
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. View Rejection Reason Modal */}
      {viewReasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Rejection Details</h3>
                  <p className="text-[11px] text-gray-400">{viewReasonModal.merchant?.shopName}</p>
                </div>
              </div>
              <button
                onClick={() => setViewReasonModal({ open: false, merchant: null })}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-900 leading-relaxed font-medium">
                {viewReasonModal.merchant?.rejectionReason || 'No detailed reason specified.'}
              </div>

              {viewReasonModal.merchant?.rejectedAt && (
                <p className="text-[11px] text-gray-500">
                  Rejected on: <strong className="text-gray-700 font-semibold">{new Date(viewReasonModal.merchant.rejectedAt).toLocaleString('en-IN')}</strong>
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewReasonModal({ open: false, merchant: null })}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchants;
