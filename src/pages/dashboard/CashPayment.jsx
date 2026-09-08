import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  X, 
  Eye, 
  Download, 
  Loader2, 
  ArrowDownCircle, 
  RotateCcw,
  Table, 
  FileSpreadsheet, 
  FileText,
  Calendar,
  Building2,
  MapPin,
  Coins
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cashPaymentService } from '../../api/cashPaymentService';
import { branchService } from '../../api/branchService';
import useBranchStore from '../../store/branchStore';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Skeleton, SkeletonTableRow } from '../../components/common/Skeleton';

// Comprehensive Indian States and Prominent Cities Map
const INDIAN_STATES_WITH_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Durg", "Jagdalpur", "Ambikapur"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Bharuch"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Baddi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Sopore"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Kalaburagi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Andrott"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Mira-Bhayandar", "Amravati", "Kolhapur", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Panvel"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Batala", "Pathankot", "Moga"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Nagercoil"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Ayodhya"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur", "Dankuni"]
};

const statesList = Object.keys(INDIAN_STATES_WITH_CITIES).sort((a, b) => a.localeCompare(b));

const CashPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalCashCollection: 0,
    totalCashSubmitted: 0,
    totalCashPending: 0,
    formattedTotalCashCollection: '₹0',
    formattedTotalCashSubmitted: '₹0',
    formattedTotalCashPending: '₹0'
  });
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Available Branches List
  const [branchOptions, setBranchOptions] = useState([]);
  const globalBranchId = useBranchStore(state => state.globalBranchId);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1
  });

  // Submit Cash Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const todayISO = new Date().toISOString().split('T')[0];
  const [submitForm, setSubmitForm] = useState({
    date: todayISO,
    amountSubmitted: '',
    remarks: ''
  });

  // Export State
  const tableRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Available cities for selected state
  const availableCities = useMemo(() => {
    if (!selectedState) return [];
    return INDIAN_STATES_WITH_CITIES[selectedState] || [];
  }, [selectedState]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchTerm || 
    selectedBranchId || 
    selectedState || 
    selectedCity || 
    startDate || 
    endDate
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await branchService.list({ limit: 100 });
        if (res && res.success) {
          const bList = Array.isArray(res.data) 
            ? res.data 
            : (res.data?.branches || res.data?.items || res.data?.data || []);
          setBranchOptions(bList);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      }
    };
    loadBranches();
  }, []);

  // Fetch Cash Payments & Staff Summary from API
  const fetchCashPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      // Location & Branch Filters
      const activeBranch = selectedBranchId || globalBranchId;
      if (activeBranch) {
        params.branchId = activeBranch;
      }
      if (selectedState) {
        params.state = selectedState;
      }
      if (selectedCity) {
        params.city = selectedCity;
      }

      // Date Range Filters
      if (startDate) {
        params.startDate = startDate;
        params.fromDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
        params.toDate = endDate;
      }

      const res = await cashPaymentService.list(params);
      if (res && (res.success || res.statusCode === 200)) {
        const dataPayload = res.data || {};
        
        // Extract stats
        if (dataPayload.stats) {
          setStats(dataPayload.stats);
        }

        // Extract items
        const itemsList = Array.isArray(dataPayload.items)
          ? dataPayload.items
          : Array.isArray(dataPayload)
          ? dataPayload
          : [];
        setItems(itemsList);

        // Extract pagination meta
        const metaPayload = res.meta || res.pagination || dataPayload.meta || dataPayload.pagination;
        if (metaPayload) {
          setMeta({
            page: Number(metaPayload.page) || page,
            limit: Number(metaPayload.limit) || limit,
            totalRecords: Number(metaPayload.totalRecords ?? metaPayload.total ?? itemsList.length),
            totalPages: Number((metaPayload.totalPages ?? metaPayload.pages ?? Math.ceil((metaPayload.totalRecords || itemsList.length) / limit)) || 1)
          });
        } else {
          setMeta({
            page,
            limit,
            totalRecords: itemsList.length,
            totalPages: Math.ceil(itemsList.length / limit) || 1
          });
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch cash payments');
      }
    } catch (err) {
      console.error('Error fetching cash payments:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to load cash payments');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedBranchId, globalBranchId, selectedState, selectedCity, startDate, endDate]);

  useEffect(() => {
    fetchCashPayments();
  }, [fetchCashPayments]);

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedBranchId('');
    setSelectedState('');
    setSelectedCity('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Open Submit Cash Modal
  const openSubmitModal = (employee) => {
    setSelectedEmployee(employee);
    setSubmitForm({
      date: todayISO,
      amountSubmitted: '',
      remarks: ''
    });
    setIsSubmitModalOpen(true);
  };

  // Handle Cash Submission
  const handleSubmitCash = async (e) => {
    e.preventDefault();
    const empId = selectedEmployee?.employeeId || selectedEmployee?.userId || selectedEmployee?._id || selectedEmployee?.id;
    if (!empId) {
      toast.error('Employee ID is missing');
      return;
    }
    if (!submitForm.date) {
      toast.error('Please select a date');
      return;
    }
    const amount = Number(submitForm.amountSubmitted);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid submission amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date: submitForm.date,
        amountSubmitted: amount,
        remarks: submitForm.remarks.trim() || 'Cash deposited successfully'
      };

      const res = await cashPaymentService.submitCash(empId, payload);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res?.message || 'Cash deposited successfully!');
        setIsSubmitModalOpen(false);
        setSelectedEmployee(null);
        setSubmitForm({
          date: todayISO,
          amountSubmitted: '',
          remarks: ''
        });
        // Re-fetch cash payments and update summary
        fetchCashPayments();
      } else {
        throw new Error(res?.message || 'Failed to submit cash');
      }
    } catch (err) {
      console.error('Error submitting cash:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit cash');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN');
  };

  // Export handlers
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
    link.download = `Cash-Payments-${todayISO}.csv`;
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <table border="1">
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
    link.download = `Cash-Payments-${todayISO}.xls`;
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Cash Payments Export</title></head><body>
      <table border="1">
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
    link.download = `Cash-Payments-${todayISO}.doc`;
    link.click();
    setIsExportOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans antialiased pb-16">
      {/* 1. Header Card */}
      <PageHeader
        title="Cash Payment Management"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Payment Operations" },
          { label: "Cash Payments" }
        ]}
        showBack={false}
        backUrl="/dashboard"
      />

      {/* 2. Top Stats Overview (4 Centered KPI Cards Matching Employee Standard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Staff Handlers */}
        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-[#225091] mb-1">
            <span className="text-[26px] font-bold leading-none font-heading">
              {meta.totalRecords || items.length}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            STAFF HANDLERS
          </span>
        </div>

        {/* Card 2: Total Cash Collected */}
        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-1 text-gray-900 mb-1">
            <span className="text-[24px] font-bold leading-none font-heading">
              {stats.formattedTotalCashCollection || `₹${formatCurrency(stats.totalCashCollection)}`}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            TOTAL CASH COLLECTED
          </span>
        </div>

        {/* Card 3: Total Cash Submitted */}
        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-1 text-emerald-600 mb-1">
            <span className="text-[24px] font-bold leading-none font-heading">
              {stats.formattedTotalCashSubmitted || `₹${formatCurrency(stats.totalCashSubmitted)}`}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            TOTAL CASH SUBMITTED
          </span>
        </div>

        {/* Card 4: Total Pending Cash */}
        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            <span className="text-[24px] font-bold leading-none font-heading">
              {stats.formattedTotalCashPending || `₹${formatCurrency(stats.totalCashPending)}`}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            TOTAL PENDING CASH
          </span>
        </div>
      </div>

      {/* 3. Filter Toolbar Card (Matching Employee Filter Standards) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4.5 shadow-2xs space-y-3.5">
        {/* Top Controls: Search Bar + Date Range + Reset Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search employee name or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-gray-50/70 hover:bg-gray-50 focus:bg-white text-xs font-medium text-gray-800 placeholder-gray-400 transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Range Inputs & Reset */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Start Date */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="pl-3 pr-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs cursor-pointer"
                title="From Date"
              />
            </div>

            <span className="text-xs text-gray-400 font-semibold">to</span>

            {/* End Date */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="pl-3 pr-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs cursor-pointer"
                title="To Date"
              />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all text-xs font-semibold shadow-2xs bg-white cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={13} className="text-gray-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Inline Filter Controls: Branch -> State -> City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          {/* 1. Branch Filter */}
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

          {/* 2. State / Region Filter */}
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

          {/* 3. City Filter (Cascading) */}
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
              {searchTerm && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedBranchId && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Branch: {branchOptions.find(b => (b.id || b._id) === selectedBranchId)?.name || selectedBranchId}
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
              {(startDate || endDate) && (
                <span className="bg-blue-50 text-[#225091] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  Date: {startDate || '...'} to {endDate || '...'}
                  <button onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-[#225091] hover:underline font-bold text-[11px] cursor-pointer ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center w-16">
                  Sr.No.
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Branch & Location
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">
                  Collected
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">
                  Submitted
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">
                  Pending
                </th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} columns={8} />
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Coins size={36} className="text-gray-300 stroke-[1.5]" />
                      <span className="text-sm font-medium text-gray-500">No cash payment records found</span>
                      <span className="text-xs text-gray-400">Try adjusting your search or location filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const empId = item.employeeId || item.userId || item._id || item.id;
                  const collected = Number(item.totalCashCollection) || 0;
                  const submitted = Number(item.totalCashSubmitted) || 0;
                  const pending = Number(item.totalCashPending) || 0;

                  return (
                    <tr key={empId || idx} className="hover:bg-blue-50/30 transition-colors group">
                      {/* Sr No */}
                      <td className="py-3.5 px-4 text-center font-medium text-gray-500 text-xs">
                        {(page - 1) * limit + idx + 1}
                      </td>

                      {/* Staff Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] font-bold text-xs flex items-center justify-center uppercase shrink-0 border border-blue-100">
                            {(item.employeeName || item.name || 'S').slice(0, 2)}
                          </div>
                          <div>
                            <Link 
                              to={`/cash-payment/${empId}`}
                              className="font-bold text-gray-800 text-xs hover:text-[#225091] transition-colors line-clamp-1"
                            >
                              {item.employeeName || item.name || 'Unknown Staff'}
                            </Link>
                            <span className="text-[11px] text-gray-400 block">
                              {item.phoneNumber || item.email || empId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700 text-xs flex items-center gap-1">
                            <Building2 size={12} className="text-gray-400 shrink-0" />
                            {item.branchName || 'Main Branch'}
                          </span>
                          {(item.city || item.state) && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-gray-400 shrink-0" />
                              {[item.city, item.state].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-semibold">
                          {item.designation || 'Staff Member'}
                        </span>
                      </td>

                      {/* Cash Collected */}
                      <td className="py-3.5 px-4 text-right font-bold text-gray-800 text-xs">
                        ₹{formatCurrency(collected)}
                      </td>

                      {/* Cash Submitted */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 text-xs">
                        ₹{formatCurrency(submitted)}
                      </td>

                      {/* Pending Cash */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pending > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          ₹{formatCurrency(pending)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details */}
                          <Link
                            to={`/cash-payment/${empId}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                            title="View Staff Ledger & Payment History"
                          >
                            <Eye size={15} />
                          </Link>

                          {/* Submit Cash */}
                          <button
                            onClick={() => openSubmitModal(item)}
                            className="px-2.5 py-1 bg-[#225091] hover:bg-[#183f72] text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Deposit Collected Cash"
                          >
                            <ArrowDownCircle size={12} />
                            Deposit
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

        {/* 5. Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{items.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="font-bold text-gray-800">
              {Math.min(page * limit, meta.totalRecords || items.length)}
            </span>{' '}
            of <span className="font-bold text-gray-800">{meta.totalRecords || items.length}</span> staff handlers
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: Math.min(5, meta.totalPages || 1) }, (_, i) => {
              let pageNum;
              const totalP = meta.totalPages || 1;
              if (totalP <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalP - 2) {
                pageNum = totalP - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                    page === pageNum
                      ? 'bg-[#225091] text-white shadow-2xs'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(meta.totalPages || 1, p + 1))}
              disabled={page >= (meta.totalPages || 1) || loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Deposit Cash Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-800 text-[16px]">
                  Deposit Cash to Society Vault
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Staff: <span className="font-semibold text-gray-700">{selectedEmployee?.employeeName || selectedEmployee?.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  setSelectedEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitCash} className="p-6 space-y-4">
              {/* Outstanding Pending Info Banner */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Current Pending Cash:</span>
                <span className="font-bold text-[#225091] text-sm">
                  ₹{formatCurrency(selectedEmployee?.totalCashPending || 0)}
                </span>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Deposit Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={todayISO}
                  value={submitForm.date}
                  onChange={(e) => setSubmitForm({ ...submitForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-xs font-medium text-gray-800 bg-white"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Amount Submitted (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="Enter submitted cash amount"
                    value={submitForm.amountSubmitted}
                    onChange={(e) => setSubmitForm({ ...submitForm, amountSubmitted: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-xs font-bold text-gray-800 bg-white"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Remarks / Receipt Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Deposited cash to Head Office cash counter"
                  value={submitForm.remarks}
                  onChange={(e) => setSubmitForm({ ...submitForm, remarks: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-xs font-medium text-gray-800 bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#225091] hover:bg-[#183f72] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Depositing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle size={14} />
                      <span>Confirm Deposit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashPayment;
