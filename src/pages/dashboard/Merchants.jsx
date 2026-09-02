import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Search, Eye, Edit, Trash2, X, SlidersHorizontal, 
  ChevronDown, Download, Table, FileSpreadsheet, FileText, Loader2, 
  Store, Users, UserCheck, UserX, ShieldAlert, Archive, RotateCcw,
  CheckCircle2, AlertTriangle, Building2, MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import { merchantService } from '../../api/merchantService';
import { branchService } from '../../api/branchService';
import useBranchStore from '../../store/branchStore';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Skeleton } from '../../components/common/Skeleton';

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
  const navigate = useNavigate();
  const tableRef = useRef(null);
  
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
  const [activeStatCard, setActiveStatCard] = useState('ALL');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const { globalBranchId, branchOptions, fetchBranches } = useBranchStore();
  
  // Locations Data (State and City mapping)
  const [locationsData, setLocationsData] = useState({
    states: ALL_INDIAN_STATES,
    cities: [],
    stateCitiesMap: {}
  });

  // Pagination State
  const [page, setPage] = useState(1);
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
      return locationsData.cities && locationsData.cities.length > 0
        ? locationsData.cities
        : [];
    }
    const fromDictionary = INDIAN_STATES_WITH_CITIES[selectedState] || [];
    const fromApi = (locationsData.stateCitiesMap && locationsData.stateCitiesMap[selectedState]) || [];
    const combined = Array.from(new Set([...fromDictionary, ...fromApi])).sort((a, b) => a.localeCompare(b));
    return combined.length > 0 ? combined : (locationsData.cities || []);
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
  const fetchMerchants = async (pageNo = page) => {
    setLoading(true);
    try {
      const params = { page: pageNo, limit };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      
      // Status and Deleted filter handling
      if (selectedStatus && selectedStatus !== 'ALL' && selectedStatus !== 'DELETED') {
        params.status = selectedStatus;
      }
      
      if (includeDeleted || selectedStatus === 'DELETED') {
        params.isDeleted = true;
      } else {
        params.isDeleted = false;
      }
      
      if (selectedBranchId) params.branchId = selectedBranchId;
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;

      const response = await merchantService.list(params);
      if (response && (response.success || response.data)) {
        const payload = response.data || response;
        const rawList = payload.items || payload.merchants || payload.data || (Array.isArray(payload) ? payload : []);
        setMerchants(Array.isArray(rawList) ? rawList : []);

        if (payload.stats) {
          setStats(payload.stats);
        } else if (response.stats) {
          setStats(response.stats);
        }

        const metaObj = payload.meta || payload.pagination || response.meta || { 
          page: pageNo, 
          limit, 
          totalRecords: Array.isArray(rawList) ? rawList.length : 0, 
          totalPages: Math.ceil((Array.isArray(rawList) ? rawList.length : 0) / limit) || 1,
          hasNextPage: false,
          hasPrevPage: pageNo > 1
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
  };

  useEffect(() => {
    fetchMerchants(page);
  }, [page, debouncedSearch, selectedStatus, selectedBranchId, selectedState, selectedCity, includeDeleted]);

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
    setSelectedBranchId(globalBranchId || '');
    setSelectedState('');
    setSelectedCity('');
    setIncludeDeleted(false);
    setActiveStatCard('ALL');
    setPage(1);
  };

  const hasActiveFilters = Boolean(debouncedSearch.trim()) || Boolean(selectedStatus) || Boolean(selectedBranchId && selectedBranchId !== globalBranchId) || Boolean(selectedState) || Boolean(selectedCity) || includeDeleted || activeStatCard !== 'ALL';

  // Lifecycle Action Handlers
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
      />

      {/* Top Stat Overview Cards (Matching Employee module layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Total Merchants */}
        <div
          onClick={() => {
            setActiveStatCard('ALL');
            setSelectedStatus('');
            setIncludeDeleted(false);
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === 'ALL' && !selectedStatus && !includeDeleted
              ? 'border-[#225091] ring-2 ring-[#225091]/10 bg-blue-50/20'
              : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 text-[#225091] mb-1">
            <Store size={18} />
            <span className="text-[24px] font-bold leading-none tabular-nums">
              {stats.totalMerchants}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Total Merchants
          </span>
        </div>

        {/* Card 2: Active Merchants */}
        <div
          onClick={() => {
            setActiveStatCard('ACTIVE');
            setSelectedStatus('ACTIVE');
            setIncludeDeleted(false);
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === 'ACTIVE' || selectedStatus === 'ACTIVE'
              ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20'
              : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <UserCheck size={18} />
            <span className="text-[24px] font-bold leading-none tabular-nums">
              {stats.activeMerchants}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Active Merchants
          </span>
        </div>

        {/* Card 3: Soft-Deleted Merchants */}
        <div
          onClick={() => {
            setActiveStatCard('DELETED');
            setSelectedStatus('DELETED');
            setIncludeDeleted(true);
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === 'DELETED' || selectedStatus === 'DELETED' || includeDeleted
              ? 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-50/20'
              : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <Archive size={18} />
            <span className="text-[24px] font-bold leading-none tabular-nums">
              {stats.deletedMerchants}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Soft-Deleted
          </span>
        </div>
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

        {/* Bottom Inline Filter Controls: Status -> Branch -> State -> City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
          {/* 1. Status Filter */}
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
              <option value="">All Statuses (Active & Inactive)</option>
              <option value="ACTIVE">Active Merchants</option>
              <option value="INACTIVE">Inactive Merchants</option>
              <option value="BLOCKED">Blocked Merchants</option>
              <option value="DELETED">Soft-Deleted</option>
              <option value="ALL">All (Including Deleted)</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 2. Branch Filter */}
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

          {/* 3. State / Region Filter */}
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
              disabled={Boolean(selectedState && availableCities.length === 0)}
              disabledPlaceholder="No cities available"
              onChange={(val) => {
                setSelectedCity(val);
                setPage(1);
              }}
              options={[
                { value: '', label: selectedState ? `All Cities in ${selectedState}` : 'All Cities' },
                ...availableCities.map((ct) => ({ value: ct, label: ct }))
              ]}
              placeholder={selectedState ? `All Cities in ${selectedState}` : 'All Cities'}
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Shop Name</th>
                <th className="py-3.5 px-5 font-semibold">Owner Name</th>
                <th className="py-3.5 px-5 font-semibold">Email</th>
                <th className="py-3.5 px-5 font-semibold">Phone Number</th>
                <th className="py-3.5 px-5 font-semibold">Branch</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-5"><Skeleton className="h-4 w-6 rounded" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-28 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-3.5 w-36 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-3.5 w-24 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-3.5 w-24 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Skeleton className="h-6 w-14 rounded-lg" />
                        <Skeleton className="h-6 w-14 rounded-lg" />
                        <Skeleton className="h-6 w-16 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : merchants && merchants.length > 0 ? (
                merchants.map((row, idx) => {
                  const srNo = (meta.page - 1) * (meta.limit || 10) + idx + 1;
                  const rowId = row.id || row._id || row.merchantId;
                  const isDeleted = Boolean(
                    row.isDeleted === true ||
                    row.deleted === true ||
                    row.deletedAt ||
                    (typeof row.status === 'string' && (row.status.toUpperCase() === 'DELETED' || row.status.toUpperCase() === 'DEACTIVATED')) ||
                    activeStatCard === 'DELETED' ||
                    selectedStatus === 'DELETED'
                  );
                  const statusStr = (row.status || (isDeleted ? 'DELETED' : 'ACTIVE')).toUpperCase();

                  return (
                    <tr key={rowId || idx} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{row.srNo || srNo}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 shadow-2xs">
                            <Store size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 block">{row.shopName || row.name || '—'}</span>
                            {row.gstinNumber && <span className="text-[11px] text-gray-400 font-mono">GST: {row.gstinNumber}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-sm font-semibold text-gray-800">{row.ownerName || row.shopOwnerName || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.email || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.phoneNumber || row.phone || '—'}</td>
                      <td className="py-3.5 px-5 text-xs font-semibold text-gray-700">{row.branchName || row.branch?.name || '—'}</td>
                      <td className="py-3.5 px-5">
                        {isDeleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 uppercase tracking-wide">
                            Deleted
                          </span>
                        ) : statusStr === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wide">
                            Active
                          </span>
                        ) : statusStr === 'BLOCKED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60 uppercase tracking-wide">
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link 
                            to={`/merchant/${rowId}/view`} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 border border-[#225091]/15 transition-all shadow-2xs" 
                            title="View Merchant"
                          >
                            <Eye size={13} /> View
                          </Link>

                          {!isDeleted ? (
                            <>
                              <Link 
                                to={`/merchant/${rowId}/edit`} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-2xs" 
                                title="Edit Merchant"
                              >
                                <Edit size={13} /> Edit
                              </Link>
                              <button 
                                onClick={() => {
                                  setMerchantToDelete(row);
                                  setIsDeleteModalOpen(true);
                                }} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs cursor-pointer" 
                                title="Soft Delete Merchant"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setMerchantToRestore(row);
                                  setIsRestoreModalOpen(true);
                                }} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all shadow-2xs cursor-pointer" 
                                title="Restore Merchant Account"
                              >
                                <RotateCcw size={13} /> Restore
                              </button>
                              <button 
                                onClick={() => {
                                  setMerchantToPermanent(row);
                                  setIsPermanentModalOpen(true);
                                }} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 transition-all shadow-2xs cursor-pointer" 
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
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Search size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">No merchants found</p>
                      <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search query or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
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
    </div>
  );
};

export default Merchants;
