import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  X,
  Users,
  UserCheck,
  UserX,
  UserCog,
  RotateCcw,
  Loader2,
  Archive,
  AlertTriangle,
  ShieldAlert,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import { employeeService } from "../../api/employeeService";
import { roleService } from "../../api/roleService";
import { branchService } from "../../api/branchService";
import useBranchStore from "../../store/branchStore";
import PageHeader from "../../components/common/PageHeader";
import SearchableSelect from "../../components/common/SearchableSelect";
import { Skeleton, SkeletonAvatar } from "../../components/common/Skeleton";
import TableWrapper from "../../components/common/TableWrapper";
import StatsCard from "../../components/common/StatsCard";
import Pagination from "../../components/common/Pagination";

// Comprehensive Indian States and Prominent Cities Map
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

const Employees = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  // Data State
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persistent Global Overview Stats
  const [overviewStats, setOverviewStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    managers: 0,
    softDeleted: 0,
  });

  // Active Stat Card Filter ('ALL' | 'ACTIVE' | 'INACTIVE' | 'MANAGERS' | 'DELETED')
  const [activeStatCard, setActiveStatCard] = useState("ALL");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [includeBranchManagers, setIncludeBranchManagers] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Dropdown Options State
  const [roleOptions, setRoleOptions] = useState([]);
  const [apiLocations, setApiLocations] = useState({ states: [], cities: [], locations: [] });
  const { globalBranchId, branchOptions, fetchBranches } = useBranchStore();

  // Modals & Action States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [employeeToRestore, setEmployeeToRestore] = useState(null);

  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [employeeToPermanentDelete, setEmployeeToPermanentDelete] = useState(null);

  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load branch list if not already available
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Sync selected branch with global branch selector
  useEffect(() => {
    setSelectedBranchId(globalBranchId || "");
  }, [globalBranchId]);

  // Fetch Available Cities & States from Backend API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await branchService.getAvailableLocations();
        if (res && res.success && res.data) {
          setApiLocations({
            states: res.data.states || [],
            cities: res.data.cities || [],
            locations: res.data.locations || []
          });
        }
      } catch (err) {
        console.warn("Failed to fetch available locations from API, fallback to branch data:", err);
      }
    };
    fetchLocations();
  }, []);

  // Compute States list from API locations or fallback to branchOptions
  const statesList = useMemo(() => {
    if (apiLocations.states && apiLocations.states.length > 0) {
      return apiLocations.states;
    }
    const statesSet = new Set();
    (branchOptions || []).forEach((b) => {
      const bState = (b.state || b.address?.state || b.branchState || "").trim();
      if (bState) statesSet.add(bState);
    });
    return Array.from(statesSet).sort();
  }, [apiLocations.states, branchOptions]);

  // Available cities for the selected state
  const availableCities = useMemo(() => {
    if (selectedState) {
      const foundLoc = (apiLocations.locations || []).find(
        (loc) => loc.state?.trim().toLowerCase() === selectedState.trim().toLowerCase()
      );
      if (foundLoc && foundLoc.cities && foundLoc.cities.length > 0) {
        return foundLoc.cities;
      }
      const cSet = new Set();
      (branchOptions || []).forEach((b) => {
        const bState = (b.state || b.address?.state || b.branchState || "").trim().toLowerCase();
        const bCity = (b.city || b.address?.city || b.branchCity || "").trim();
        if (bState === selectedState.trim().toLowerCase() && bCity) {
          cSet.add(bCity);
        }
      });
      return Array.from(cSet).sort();
    }
    return apiLocations.cities || [];
  }, [selectedState, apiLocations, branchOptions]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Roles for Filter Dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleRes = await roleService.list({ limit: 100 });
        if (roleRes && roleRes.success) {
          const list = Array.isArray(roleRes.data)
            ? roleRes.data
            : roleRes.data?.items || [];
          setRoleOptions(list);
        }
      } catch (err) {
        console.warn("Failed to load roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // Fetch Persistent Global Stats for the Society (Society-Wide Staff Metrics)
  const fetchGlobalStats = useCallback(async () => {
    try {
      const response = await employeeService.list({
        page: 1,
        limit: 1,
        includeBranchManagers: true,
        includeStats: true,
        includeDeleted: true,
        status: "ALL",
      });
      if (response && response.success && response.stats) {
        const totalEmp = response.stats.totalEmployees ?? response.stats.total ?? 0;
        const totalAct = response.stats.totalActive ?? response.stats.active ?? 0;
        const totalInact = response.stats.totalInactive !== undefined 
          ? response.stats.totalInactive 
          : Math.max(0, totalEmp - totalAct);

        setOverviewStats({
          total: totalEmp,
          active: totalAct,
          inactive: totalInact,
          managers: response.stats.totalBranchManagers ?? response.stats.managers ?? 0,
          softDeleted: response.stats.totalSoftDeleted ?? 0,
          genderRatio: response.stats.genderRatio || null,
          newHiresThisMonth: response.stats.newHiresThisMonth ?? 0,
          upcomingBirthdaysThisMonth: response.stats.upcomingBirthdaysThisMonth ?? 0,
          departmentWise: response.stats.departmentWise || null,
          totalMonthlySalaryBudget: response.stats.totalMonthlySalaryBudget ?? 0,
          averageSalary: response.stats.averageSalary ?? 0
        });
      }
    } catch (err) {
      console.warn("Failed to fetch global employee stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  // Fetch Paginated / Filtered Employees from Backend API
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isFilterDeletedOnly = activeStatCard === "DELETED" || selectedStatus === "DELETED";

      const params = {
        page: (activeStatCard === "MANAGERS" || activeStatCard === "DELETED") ? 1 : page,
        limit: (activeStatCard === "MANAGERS" || activeStatCard === "DELETED") ? 50 : limit,
        includeBranchManagers: true,
        includeStats: true,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedBranchId && selectedBranchId !== "ALL") {
        params.branchId = selectedBranchId;
      }

      if (selectedRoleId && selectedRoleId !== "BRANCH_MANAGER") {
        params.roleId = selectedRoleId;
      }
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;

      // Handle Deleted and Status filtering precisely
      if (isFilterDeletedOnly) {
        params.isDeleted = true;
        params.status = "DELETED";
        params.includeDeleted = true;
      } else if (includeDeleted || selectedStatus === "ALL") {
        params.includeDeleted = true;
        if (selectedStatus === "ALL") {
          params.status = "ALL";
        }
      } else if (activeStatCard === "ACTIVE" || selectedStatus === "ACTIVE") {
        params.status = "ACTIVE";
      } else if (selectedStatus) {
        params.status = selectedStatus.toUpperCase();
      }

      const response = await employeeService.list(params);
      if (response && response.success) {
        let listData = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.employees || response.items || [];

        // Client-side filtering fallback to guarantee proper rendering on UI
        if (activeStatCard === "ACTIVE" || selectedStatus === "ACTIVE") {
          listData = listData.filter(e => !e.isDeleted && !e.deletedAt && (e.status || "ACTIVE").toUpperCase() === "ACTIVE");
        } else if (activeStatCard === "MANAGERS" || selectedRoleId === "BRANCH_MANAGER") {
          listData = listData.filter(e =>
            e.type === "BRANCH_MANAGER" ||
            e.type === "MANAGER" ||
            e.isBranchManager ||
            e.role?.code === "BRANCH_MANAGER" ||
            e.role?.code === "MANAGER" ||
            (e.designation && e.designation.toLowerCase().includes("manager")) ||
            (e.role?.name && e.role.name.toLowerCase().includes("manager"))
          );
        } else if (activeStatCard === "DELETED" || selectedStatus === "DELETED") {
          // Backend has already filtered the soft-deleted records. Do not drop records that have status 'INACTIVE'.
          listData = listData.filter(e => e.isDeleted || e.deletedAt || e.status === "DELETED" || e.status === "INACTIVE" || Boolean(activeStatCard === "DELETED"));
        }

        setEmployees(listData);

        const meta =
          response.meta ||
          response.pagination ||
          response.data?.meta ||
          response.data?.pagination ||
          {};

        const effectiveTotal = (activeStatCard === "MANAGERS" || activeStatCard === "DELETED")
          ? listData.length
          : (meta.totalRecords || listData.length);

        setTotalPages(Math.max(1, Math.ceil(effectiveTotal / limit)));
        setTotalRecords(effectiveTotal);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      if (err.response?.status === 502) {
        setError("Backend server is temporarily unreachable (502 Bad Gateway). Please try again shortly.");
      } else {
        setError("Failed to load employees list.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    globalBranchId,
    selectedBranchId,
    selectedRoleId,
    selectedState,
    selectedCity,
    selectedStatus,
    includeBranchManagers,
    includeDeleted,
    activeStatCard,
    roleOptions,
  ]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Action Click Triggers
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleRestoreClick = (employee) => {
    setEmployeeToRestore(employee);
    setIsRestoreModalOpen(true);
  };

  const handlePermanentDeleteClick = (employee) => {
    setEmployeeToPermanentDelete(employee);
    setIsPermanentDeleteModalOpen(true);
  };

  // Confirm Soft Delete / Deactivate
  const confirmDeactivate = async () => {
    if (!employeeToDelete) return;
    try {
      setIsActionLoading(true);
      await employeeService.delete(employeeToDelete.id || employeeToDelete._id);
      toast.success("Employee deactivated successfully");
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
      fetchGlobalStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate employee");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Confirm Restore Soft-Deleted Employee
  const confirmRestore = async () => {
    if (!employeeToRestore) return;
    try {
      setIsActionLoading(true);
      await employeeService.restore(employeeToRestore.id || employeeToRestore._id);
      toast.success("Employee restored successfully");
      setIsRestoreModalOpen(false);
      setEmployeeToRestore(null);
      fetchEmployees();
      fetchGlobalStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restore employee");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Confirm Permanent Hard Delete
  const confirmPermanentDelete = async () => {
    if (!employeeToPermanentDelete) return;
    try {
      setIsActionLoading(true);
      await employeeService.delete(employeeToPermanentDelete.id || employeeToPermanentDelete._id, {
        permanent: true,
        isPermanent: true,
        force: true
      });
      toast.success("Employee permanently deleted");
      setIsPermanentDeleteModalOpen(false);
      setEmployeeToPermanentDelete(null);
      fetchEmployees();
      fetchGlobalStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to permanently delete employee");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatName = (name) => {
    if (!name) return "Employee";
    return name
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formatEmpCode = (code, id) => {
    if (code && code.length <= 12) return code;
    if (id && id.length === 24) return `EMP-${id.substring(18, 24).toUpperCase()}`;
    return code || id || "—";
  };

  const getInitials = (name) => {
    if (!name) return "E";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("");
    setSelectedRoleId("");
    setSelectedBranchId("");
    setSelectedState("");
    setSelectedCity("");
    setActiveStatCard("ALL");
    setIncludeBranchManagers(true);
    setIncludeDeleted(false);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(selectedStatus) ||
    Boolean(selectedRoleId) ||
    Boolean(selectedBranchId) ||
    Boolean(selectedState) ||
    Boolean(selectedCity) ||
    activeStatCard !== "ALL" ||
    includeDeleted ||
    !includeBranchManagers;

  return (
    <div className="w-full max-w-none space-y-6 pb-12">
      {/* Top Header Card */}
      <PageHeader
        title="Society Employees"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "Employees" }
        ]}
        showBack={false}
        backUrl="/dashboard"
      >
        <Link
          to="/employees/create"
          className="bg-[#225091] hover:bg-[#1b427b] text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 hover:shadow"
        >
          + Add Staff
        </Link>
      </PageHeader>
      {/* Top Stats Cards Grid (4 Cards: Total, Active, Managers, Soft-Deleted) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
        <StatsCard
          label="Total Staff"
          value={overviewStats.total}
          icon={Users}
          color="blue"
          isActive={activeStatCard === "ALL" && !selectedStatus && !selectedRoleId}
          onClick={() => {
            setActiveStatCard("ALL");
            setSelectedStatus("");
            setSelectedRoleId("");
            setIncludeDeleted(false);
            setPage(1);
          }}
        />
        <StatsCard
          label="Active Staff"
          value={overviewStats.active}
          icon={UserCheck}
          color="emerald"
          isActive={activeStatCard === "ACTIVE"}
          onClick={() => {
            if (activeStatCard === "ACTIVE") {
              setActiveStatCard("ALL");
              setSelectedStatus("");
            } else {
              setActiveStatCard("ACTIVE");
              setSelectedStatus("ACTIVE");
              setIncludeDeleted(false);
            }
            setPage(1);
          }}
        />
        <StatsCard
          label="Branch Managers"
          value={overviewStats.managers}
          icon={UserCog}
          color="purple"
          isActive={activeStatCard === "MANAGERS"}
          onClick={() => {
            if (activeStatCard === "MANAGERS") {
              setActiveStatCard("ALL");
              setSelectedRoleId("");
            } else {
              setActiveStatCard("MANAGERS");
              setSelectedRoleId("");
            }
            setPage(1);
          }}
        />
        <StatsCard
          label="Soft-Deleted"
          value={overviewStats.softDeleted}
          icon={Archive}
          color="rose"
          isActive={activeStatCard === "DELETED" || selectedStatus === "DELETED"}
          onClick={() => {
            if (activeStatCard === "DELETED") {
              setActiveStatCard("ALL");
              setSelectedStatus("");
              setIncludeDeleted(false);
            } else {
              setActiveStatCard("DELETED");
              setSelectedStatus("DELETED");
              setIncludeDeleted(true);
            }
            setPage(1);
          }}
        />
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 space-y-3.5">
        {/* Top Search & Reset Row */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, employee code, email, phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Include Managers Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/80 hover:bg-gray-100/70 transition-colors">
              <input
                type="checkbox"
                checked={includeBranchManagers}
                onChange={(e) => {
                  setIncludeBranchManagers(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#225091] focus:ring-[#225091] border-gray-300"
              />
              <span>Include Managers</span>
            </label>

            {/* Include Deleted Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/80 hover:bg-gray-100/70 transition-colors">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#225091] focus:ring-[#225091] border-gray-300"
              />
              <span>Include Deleted</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Bottom Inline Filter Controls: Status -> Role -> Branch -> State -> City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
          
          {/* 1. Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val);
                if (val === "ACTIVE") {
                  setActiveStatCard("ACTIVE");
                  setIncludeDeleted(false);
                } else if (val === "INACTIVE") {
                  setActiveStatCard("INACTIVE");
                  setIncludeDeleted(false);
                } else if (val === "DELETED") {
                  setActiveStatCard("DELETED");
                  setIncludeDeleted(true);
                } else if (val === "ALL") {
                  setActiveStatCard("ALL");
                  setIncludeDeleted(true);
                } else {
                  setActiveStatCard("ALL");
                  setIncludeDeleted(false);
                }
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Statuses (Active & Inactive)</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="INACTIVE">Inactive / Deactivated</option>
              <option value="DELETED">Soft-Deleted Staff</option>
              <option value="ALL">All (Including Deleted)</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 2. Department / Role Filter */}
          <div className="relative">
            <select
              value={selectedRoleId}
              onChange={(e) => {
                setSelectedRoleId(e.target.value);
                setPage(1);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Roles / Depts</option>
              <option value="BRANCH_MANAGER">Branch Manager</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* 3. Branch Filter (Independent) */}
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
                  {b.name}
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
                setSelectedCity("");
                setPage(1);
              }}
              options={[
                { value: "", label: "All States / Regions" },
                ...statesList.map((s) => ({ value: s, label: s }))
              ]}
              placeholder="All States / Regions"
              searchPlaceholder="Search state or region..."
              className="text-xs"
            />
          </div>

          {/* 5. City Filter (Connected to State) */}
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
                { value: "", label: selectedState ? `All Cities in ${selectedState}` : "All Cities" },
                ...availableCities.map((c) => ({ value: c, label: c }))
              ]}
              placeholder={selectedState ? `All Cities in ${selectedState}` : "All Cities"}
              searchPlaceholder="Search city..."
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Indicator Tag for Soft-Deleted or Include-Deleted */}
      {(activeStatCard === "DELETED" || selectedStatus === "DELETED" || includeDeleted) && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 px-4 py-2.5 rounded-xl text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-rose-600 shrink-0" />
            <span className="font-semibold">
              {activeStatCard === "DELETED" || selectedStatus === "DELETED"
                ? "Currently Viewing: Soft-Deleted / Archived Employees Only"
                : "Currently Viewing: All Employees (Including Soft-Deleted)"}
            </span>
            <span className="bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
              {totalRecords} records
            </span>
          </div>
          <button
            onClick={() => {
              setActiveStatCard("ALL");
              setSelectedStatus("");
              setIncludeDeleted(false);
              setPage(1);
            }}
            className="text-rose-700 hover:text-rose-900 font-semibold underline text-xs cursor-pointer shrink-0"
          >
            Switch to Active Staff
          </button>
        </div>
      )}

      {/* Main Employees Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 overflow-hidden flex flex-col">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full border-collapse min-w-[880px] text-center text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-16">Sr.No.</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Employee</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Emp Code</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Designation / Role</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch, State & City</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && employees.length === 0 ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-8 rounded" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <SkeletonAvatar size="w-9 h-9" rounded="rounded-xl" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32 rounded" />
                          <Skeleton className="h-3 w-40 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-24 rounded" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-2.5 w-20 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-10 text-center text-rose-600 text-sm font-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-14 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <span className="font-semibold text-gray-700">
                        No employees found
                      </span>
                      <span className="text-xs text-gray-400">
                        Try adjusting your search or active filters
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((row, index) => {
                  const isSoftDeleted = Boolean(
                    row.isDeleted ||
                    row.deleted ||
                    row.deletedAt ||
                    row.status === "DELETED" ||
                    row.status === "DEACTIVATED" ||
                    activeStatCard === "DELETED" ||
                    selectedStatus === "DELETED"
                  );
                  
                  return (
                    <tr
                      key={row.id || index}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSoftDeleted ? "bg-rose-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">
                        {row.srNo || (page - 1) * limit + index + 1}
                      </td>

                      {/* Employee Profile */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                            isSoftDeleted
                              ? "bg-rose-50 border-rose-200 text-rose-600"
                              : "bg-blue-50 border-blue-100 text-[#225091]"
                          }`}>
                            {getInitials(row.fullName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 text-sm">
                              {formatName(row.fullName)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {row.email || "-"}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {row.phoneNumber || ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Employee Code & Badge */}
                      <td className="py-3.5 px-5">
                        <span className="text-gray-800 font-mono font-semibold text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {formatEmpCode(row.employeeCode || row.employeeId, row.id)}
                        </span>
                        {row.type === "BRANCH_MANAGER" || row.type === "MANAGER" || row.role?.code === "BRANCH_MANAGER" || row.role?.code === "MANAGER" ? (
                          <div className="text-[10px] bg-purple-50 border border-purple-200/60 text-purple-700 font-semibold px-2 py-0.5 rounded-full inline-block mt-1">
                            Branch Manager
                          </div>
                        ) : null}
                      </td>

                      {/* Designation / Department */}
                      <td className="py-3.5 px-5 text-xs text-gray-700 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {row.designation || row.role?.name || "-"}
                          </span>
                          {row.department && (
                            <span className="text-[11px] text-gray-400">
                              {row.department}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Branch, State & City */}
                      <td className="py-3.5 px-5 text-xs text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {row.branch?.name || row.branchName || "—"}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {[
                              row.branch?.city || row.city || row.branchCity || row.branch?.address?.city,
                              row.branch?.state || row.state || row.branchState || row.branch?.address?.state,
                            ]
                              .filter(Boolean)
                              .join(", ") ||
                              row.branch?.code ||
                              "—"}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-5">
                        {isSoftDeleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide bg-rose-50 text-rose-700 border-rose-200/60">
                            DELETED
                          </span>
                        ) : row.status === "INACTIVE" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide bg-amber-50 text-amber-700 border-amber-200/60">
                            INACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide bg-emerald-50 text-emerald-700 border-emerald-200/60">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Actions Column (Contextual for Active vs Deleted) */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/employees/view/${row.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-2xs cursor-pointer"
                            title="View Employee Profile"
                          >
                            <Eye size={13} /> View
                          </button>

                          {isSoftDeleted ? (
                            <>
                              {/* Restore Soft-Deleted Employee Button */}
                              <button
                                onClick={() => handleRestoreClick(row)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all shadow-2xs cursor-pointer"
                                title="Restore / Reactivate Employee"
                              >
                                <RotateCcw size={13} /> Restore
                              </button>

                              {/* Permanent Delete Button */}
                              <button
                                onClick={() => handlePermanentDeleteClick(row)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs cursor-pointer"
                                title="Permanently Delete Employee"
                              >
                                <Trash2 size={13} /> Hard Delete
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit Staff Profile Button */}
                              <button
                                onClick={() => navigate(`/employees/edit/${row.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-2xs cursor-pointer"
                                title="Edit Staff"
                              >
                                <Edit size={13} /> Edit
                              </button>

                              {/* Deactivate / Soft Delete Button */}
                              <button
                                onClick={() => handleDeleteClick(row)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs cursor-pointer"
                                title="Deactivate Employee (Soft Delete)"
                              >
                                <Trash2 size={13} /> Deactivate
                              </button>
                            </>
                          )}
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
        {!loading && employees.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={10}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* 1. Deactivate / Soft Delete Modal */}
      {isDeleteModalOpen && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <Archive size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Deactivate Employee
              </h3>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Are you sure you want to deactivate{" "}
                <span className="font-semibold text-gray-800">
                  {employeeToDelete.fullName}
                </span>
                ? This will mark them as soft-deleted. You can restore them anytime.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEmployeeToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={confirmDeactivate}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-sm text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deactivating...</span>
                  </>
                ) : (
                  <span>Deactivate Staff</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Restore Soft-Deleted Employee Modal */}
      {isRestoreModalOpen && employeeToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <RotateCcw size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Restore Employee
              </h3>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Restore and reactivate{" "}
                <span className="font-semibold text-gray-800">
                  {employeeToRestore.fullName}
                </span>
                ? Their status will be set to Active and access will be re-enabled.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setEmployeeToRestore(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={confirmRestore}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <span>Restore Staff</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Permanent Hard Delete Modal */}
      {isPermanentDeleteModalOpen && employeeToPermanentDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Permanently Delete Employee
              </h3>
              <p className="text-rose-600 text-xs mt-1 font-semibold leading-relaxed">
                CAUTION: This hard delete action cannot be undone!
              </p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                All records, attendance logs, and account linkages for{" "}
                <span className="font-semibold text-gray-800">
                  {employeeToPermanentDelete.fullName}
                </span>{" "}
                will be permanently wiped from the database.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => {
                  setIsPermanentDeleteModalOpen(false);
                  setEmployeeToPermanentDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={confirmPermanentDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-sm text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Hard Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
