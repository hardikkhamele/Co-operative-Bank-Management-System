import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Building2,
  CreditCard,
  ShieldCheck,
  Users,
  Store,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { branchService } from '../../api/branchService';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Skeleton, SkeletonTable } from '../../components/common/Skeleton';
import TableWrapper from '../../components/common/TableWrapper';
import StatsCard from '../../components/common/StatsCard';
import Pagination from '../../components/common/Pagination';
import useLocations from '../../hooks/useLocations';
import { validateEmail, validatePhone, validatePassword, validatePincode, sanitizeDigits, preventInvalidNumberKeys } from '../../utils/validation';

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

const Branch = () => {
  const tableRef = useRef(null);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Search & Filter State
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Location data from dedicated credit-receipts locations API for filter
  const { states: filterStates, availableCities: filterCities } = useLocations(selectedState);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Locations Data (State and City mapping)
  const [locationsData, setLocationsData] = useState({
    states: ALL_INDIAN_STATES,
    cities: [],
    stateCitiesMap: {}
  });

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
        console.warn("Failed to fetch available locations for branches:", err);
        setLocationsData({ states: ALL_INDIAN_STATES, cities: [], stateCitiesMap: {} });
      }
    };
    fetchLocations();
  }, []);

  // Available States List
  const statesList = useMemo(() => {
    if (locationsData.states && locationsData.states.length > 0) {
      return locationsData.states;
    }
    return ALL_INDIAN_STATES;
  }, [locationsData.states]);

  // Helper to get cities for any state (combining dictionary and API)
  const getCitiesForState = (stateName) => {
    if (!stateName) return [];
    const fromDictionary = INDIAN_STATES_WITH_CITIES[stateName] || [];
    const fromApi = (locationsData.stateCitiesMap && locationsData.stateCitiesMap[stateName]) || [];
    const combined = Array.from(new Set([...fromDictionary, ...fromApi])).sort((a, b) => a.localeCompare(b));
    return combined;
  };

  // Cascading Available Cities for the Selected State Filter
  const availableCities = useMemo(() => {
    if (!selectedState) return [];
    return getCitiesForState(selectedState);
  }, [selectedState, locationsData]);
  
  // Create Modal State
  const [createStep, setCreateStep] = useState(1);
  const [editStep, setEditStep] = useState(1);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [showEditManagerPassword, setShowEditManagerPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    branch: { name: '', code: '', email: '', phoneNumber: '', state: '', cardStock: 0, verificationCredits: 0, addressLine1: '', city: '', pincode: '' },
    manager: { fullName: '', email: '', phoneNumber: '', password: '', employeeCode: '' }
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      
      const response = await branchService.list(params);
      let branchList = [];
      if (response) {
        if (Array.isArray(response)) {
          branchList = response;
        } else if (Array.isArray(response.data)) {
          branchList = response.data;
        } else if (Array.isArray(response.data?.branches)) {
          branchList = response.data.branches;
        } else if (Array.isArray(response.data?.items)) {
          branchList = response.data.items;
        } else if (Array.isArray(response.data?.data)) {
          branchList = response.data.data;
        } else if (Array.isArray(response.branches)) {
          branchList = response.branches;
        } else if (Array.isArray(response.items)) {
          branchList = response.items;
        }
        
        if (response.data?.stats) {
          setStats(response.data.stats);
        } else if (response.stats) {
          setStats(response.stats);
        }

        const total = 
          response.meta?.totalPages || 
          response.pagination?.totalPages || 
          response.data?.meta?.totalPages || 
          response.data?.pagination?.totalPages || 
          response.data?.totalPages || 
          response.totalPages || 
          1;
        setTotalPages(total);
      }
      setBranches(branchList);
    } catch (err) {
      console.error("Failed to fetch branches", err);
      setError("Failed to load branches.");
      setBranches([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, debouncedSearch, selectedState, selectedCity]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedState('');
    setSelectedCity('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(debouncedSearch.trim()) || Boolean(selectedState) || Boolean(selectedCity);

  const handleCreateChange = (section, field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const validateCreateStep1 = () => {
    const branchName = createForm.branch.name?.trim() || '';
    if (!branchName) {
      toast.error('Branch Name is required');
      return false;
    }
    if (branchName.length > 200) {
      toast.error('Branch Name must not exceed 200 characters');
      return false;
    }

    const branchCode = createForm.branch.code?.trim() || '';
    if (!branchCode) {
      toast.error('Branch Code is required');
      return false;
    }
    if (branchCode.length > 20) {
      toast.error('Branch Code must not exceed 20 characters');
      return false;
    }

    const branchEmail = createForm.branch.email?.trim() || '';
    if (!branchEmail) {
      toast.error('Branch Email is required');
      return false;
    }
    const branchEmailErr = validateEmail(branchEmail).error;
    if (branchEmailErr) {
      toast.error(`Branch Email: ${branchEmailErr}`);
      return false;
    }

    const branchPhone = createForm.branch.phoneNumber?.trim() || '';
    if (!branchPhone) {
      toast.error('Branch Phone: Phone number is required');
      return false;
    }
    const branchPhoneErr = validatePhone(branchPhone, { fieldName: 'Branch Phone' }).error;
    if (branchPhoneErr) {
      toast.error(branchPhoneErr);
      return false;
    }

    const managerName = createForm.manager.fullName?.trim() || '';
    if (!managerName) {
      toast.error('Branch Manager Name is required');
      return false;
    }
    if (managerName.length > 200) {
      toast.error('Branch Manager Name must not exceed 200 characters');
      return false;
    }

    if (!createForm.branch.state?.trim()) {
      toast.error('State/UT is required');
      return false;
    }

    if (createForm.branch.addressLine1 && createForm.branch.addressLine1.length > 200) {
      toast.error('Address must not exceed 200 characters');
      return false;
    }

    if (createForm.branch.pincode && createForm.branch.pincode.trim()) {
      const pinErr = validatePincode(createForm.branch.pincode, { required: false }).error;
      if (pinErr) {
        toast.error(pinErr);
        return false;
      }
    }

    return true;
  };

  const handleNextCreateStep = () => {
    if (validateCreateStep1()) {
      // If manager email is not set, optionally suggest branch email or leave empty
      if (!createForm.manager.phoneNumber && createForm.branch.phoneNumber) {
        handleCreateChange('manager', 'phoneNumber', createForm.branch.phoneNumber);
      }
      setCreateStep(2);
    }
  };

  const submitCreateBranch = async () => {
    // Validate Step 1 first
    if (!validateCreateStep1()) {
      setCreateStep(1);
      return;
    }

    // Validate Manager Credentials (Step 2)
    const mgrEmail = createForm.manager.email?.trim() || '';
    if (!mgrEmail) {
      toast.error('Manager Email is required');
      return;
    }
    const mgrEmailErr = validateEmail(mgrEmail).error;
    if (mgrEmailErr) {
      toast.error(`Manager Email: ${mgrEmailErr}`);
      return;
    }

    const mgrPassword = createForm.manager.password || '';
    if (!mgrPassword) {
      toast.error('Manager Temporary Password is required');
      return;
    }
    const passErr = validatePassword(mgrPassword, { minLength: 6, fieldName: 'Manager Password' }).error;
    if (passErr) {
      toast.error(passErr);
      return;
    }

    const mgrPhone = createForm.manager.phoneNumber?.trim() || '';
    if (!mgrPhone) {
      toast.error('Manager Phone: Phone number is required');
      return;
    }
    const mgrPhoneErr = validatePhone(mgrPhone, { fieldName: 'Manager Phone' }).error;
    if (mgrPhoneErr) {
      toast.error(mgrPhoneErr);
      return;
    }

    setCreateSubmitting(true);
    try {
      const nameParts = createForm.manager.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const payload = {
        branch: {
          name: createForm.branch.name,
          code: createForm.branch.code,
          email: createForm.branch.email,
          phoneNumber: createForm.branch.phoneNumber,
          state: createForm.branch.state,
          cardStock: Number(createForm.branch.cardStock) || 0,
          verificationCredits: Number(createForm.branch.verificationCredits) || 0,
          address: {
            addressLine1: createForm.branch.addressLine1,
            city: createForm.branch.city,
            state: createForm.branch.state,
            pincode: createForm.branch.pincode
          }
        },
        manager: {
          fullName: createForm.manager.fullName,
          firstName: firstName,
          lastName: lastName,
          email: createForm.manager.email,
          phoneNumber: createForm.manager.phoneNumber,
          password: createForm.manager.password,
          ...(createForm.manager.employeeCode ? { employeeCode: createForm.manager.employeeCode } : {}),
          personalDetails: {
            fullName: createForm.manager.fullName,
            firstName: firstName,
            lastName: lastName,
            email: createForm.manager.email,
            phoneNumber: createForm.manager.phoneNumber
          },
          jobDetails: {
            designation: "Branch Manager",
            department: "Management"
          },
          shiftSettings: {},
          attendanceSettings: {},
          woffHoffSettings: {},
          kraSettings: {}
        }
      };
      
      const response = await branchService.create(payload);
      if (response && response.success) {
        toast.success(response.message || "Branch and Branch Manager created successfully.");
      } else {
        toast.success("Branch created successfully!");
      }
      setIsCreateModalOpen(false);
      setCreateStep(1);
      setCreateForm({
        branch: { name: '', code: '', email: '', phoneNumber: '', state: '', cardStock: 0, verificationCredits: 0, addressLine1: '', city: '', pincode: '' },
        manager: { fullName: '', email: '', phoneNumber: '', password: '', employeeCode: '' }
      });
      fetchBranches();
    } catch (err) {
      console.error("Failed to create branch", err);
      if (err.response?.data?.details && err.response.data.details.length > 0) {
        toast.error(err.response.data.details[0].message);
      } else {
        toast.error(err.response?.data?.message || "Failed to create branch");
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (branch, initialStep = 1) => {
    try {
      let branchData = branch;
      try {
        const res = await branchService.getById(branch.id || branch._id);
        if (res && res.success && res.data) {
          branchData = res.data;
        } else if (res && res.data) {
          branchData = res.data;
        }
      } catch (err) {
        console.warn("Could not fetch detailed branch by id, using list item data", err);
      }

      // Try fetching manager profile
      let mgrProfile = null;
      try {
        const mgrRes = await branchService.getManagerProfile(branch.id || branch._id);
        if (mgrRes && mgrRes.success && mgrRes.data) {
          mgrProfile = mgrRes.data;
        }
      } catch (err) {
        console.warn("Could not fetch manager profile for branch", err);
      }

      const rawMgr = mgrProfile || branchData.manager || branchData.branchManager || branchData.managerUser || branch.branchManager || branch.manager || {};
      const rawUser = rawMgr.user || {};

      const mgrFullName = 
        rawMgr.fullName || 
        rawMgr.name || 
        rawMgr.personalDetails?.fullName || 
        rawUser.fullName || 
        rawUser.name || 
        branchData.managerName || 
        branch.managerName || 
        '';

      const mgrEmail = 
        rawMgr.email || 
        rawMgr.personalDetails?.email || 
        rawUser.email || 
        branchData.managerEmail || 
        branch.managerEmail || 
        '';

      const mgrPhone = 
        rawMgr.phoneNumber || 
        rawMgr.phone || 
        rawMgr.personalDetails?.phoneNumber || 
        rawUser.phoneNumber || 
        rawUser.phone || 
        branchData.managerPhone || 
        branchData.managerPhoneNumber || 
        branch.managerPhone || 
        branch.managerPhoneNumber || 
        '';

      const mgrEmployeeCode = 
        rawMgr.employeeCode || 
        rawMgr.empCode || 
        rawMgr.code || 
        rawMgr.jobDetails?.employeeCode || 
        branchData.managerEmployeeCode || 
        branchData.managerCode || 
        branch.managerEmployeeCode || 
        branch.managerCode || 
        '';

      const normalized = {
        ...branchData,
        id: branchData.id || branchData._id || branch.id || branch._id,
        name: branchData.name || '',
        code: branchData.code || '',
        email: branchData.email || '',
        phoneNumber: branchData.phoneNumber || branchData.phone || '',
        state: branchData.state || '',
        cardStock: branchData.cardStock ?? 0,
        verificationCredits: branchData.verificationCredits ?? 0,
        address: {
          addressLine1: branchData.address?.addressLine1 || branchData.addressLine1 || '',
          city: branchData.address?.city || branchData.city || '',
          state: branchData.address?.state || branchData.state || '',
          pincode: branchData.address?.pincode || branchData.pincode || ''
        },
        manager: {
          fullName: mgrFullName,
          email: mgrEmail,
          phoneNumber: mgrPhone,
          employeeCode: mgrEmployeeCode,
          password: ''
        }
      };

      setSelectedBranch(normalized);
      setEditStep(initialStep);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to open edit modal", err);
      toast.error("Failed to load branch details for editing");
    }
  };

  const submitEditBranch = async () => {
    if (!selectedBranch) return;
    if (!selectedBranch.phoneNumber) {
      toast.error('Branch Phone: Phone number is required');
      setEditStep(1);
      return;
    }
    const editBranchPhoneErr = validatePhone(selectedBranch.phoneNumber).error;
    if (editBranchPhoneErr) {
      toast.error(`Branch Phone: ${editBranchPhoneErr}`);
      setEditStep(1);
      return;
    }
    if (selectedBranch.manager?.phoneNumber) {
      const editMgrPhoneErr = validatePhone(selectedBranch.manager.phoneNumber).error;
      if (editMgrPhoneErr) {
        toast.error(`Manager Phone: ${editMgrPhoneErr}`);
        setEditStep(2);
        return;
      }
    }

    setEditSubmitting(true);
    try {
      // 1. Update Branch Details
      const branchRes = await branchService.update(selectedBranch.id, {
        name: selectedBranch.name,
        code: selectedBranch.code,
        email: selectedBranch.email,
        phoneNumber: selectedBranch.phoneNumber,
        state: selectedBranch.state,
        cardStock: Number(selectedBranch.cardStock) || 0,
        verificationCredits: Number(selectedBranch.verificationCredits) || 0,
        address: {
          addressLine1: selectedBranch.address?.addressLine1 || '',
          city: selectedBranch.address?.city || '',
          state: selectedBranch.state || selectedBranch.address?.state || '',
          pincode: selectedBranch.address?.pincode || ''
        }
      });
      
      // 2. Prepare Manager Details
      const mName = selectedBranch.manager?.fullName?.trim() || '';
      const nameParts = mName.split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const managerPayload = {
        fullName: mName,
        firstName: fName,
        lastName: lName,
        email: selectedBranch.manager?.email || '',
        phoneNumber: selectedBranch.manager?.phoneNumber || '',
        ...(selectedBranch.manager?.employeeCode ? { employeeCode: selectedBranch.manager.employeeCode } : {}),
      };
      if (selectedBranch.manager?.password && selectedBranch.manager.password.trim() !== '') {
        managerPayload.password = selectedBranch.manager.password.trim();
      }
      
      let managerUpdated = false;
      try {
        const managerRes = await branchService.updateManagerProfile(selectedBranch.id, managerPayload);
        if (managerRes && managerRes.success) {
          managerUpdated = true;
        }
      } catch (mgrErr) {
        console.warn("Could not update manager profile via endpoint 7", mgrErr);
      }
      
      if (branchRes && branchRes.success) {
        toast.success(managerUpdated ? "Branch and Manager updated successfully." : (branchRes.message || "Branch updated successfully."));
      } else {
        toast.success("Branch details saved successfully.");
      }
      
      setIsEditModalOpen(false);
      setEditStep(1);
      fetchBranches();
    } catch(err) {
      console.error(err);
      if (err.response?.data?.details && err.response.data.details.length > 0) {
        toast.error(err.response.data.details[0].message);
      } else {
        toast.error(err.response?.data?.message || "Failed to update branch");
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const submitDeleteBranch = async () => {
    if (!selectedBranch) return;
    try {
      const response = await branchService.delete(selectedBranch.id);
      if (response && response.success) {
        toast.success(response.message || "Branch deactivated successfully.");
      }
      setIsDeleteModalOpen(false);
      fetchBranches();
    } catch (err) {
      console.error("Failed to delete branch", err);
      toast.error(err.response?.data?.message || "Failed to delete branch");
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <PageHeader
        title="Branch"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Region & Branch Management" },
          { label: "Branch" }
        ]}
        showBack={false}
        backUrl="/dashboard"
      />

      {/* 5 Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatsCard
          layout="centered"
          label="Total Branches"
          value={stats?.totalBranches ?? branches.length}
          color="blue"
        />
        <StatsCard
          layout="centered"
          label="Available Card Stock"
          value={stats?.availableCardStock !== undefined ? stats.availableCardStock.toLocaleString('en-IN') : 0}
          color="emerald"
        />
        <StatsCard
          layout="centered"
          label="Verification Credits"
          value={stats?.availableVerificationCredits !== undefined ? stats.availableVerificationCredits.toLocaleString('en-IN') : 0}
          color="amber"
        />
        <StatsCard
          layout="centered"
          label="Total Staff"
          value={stats?.totalEmployees !== undefined ? stats.totalEmployees.toLocaleString('en-IN') : 0}
          color="indigo"
        />
        <StatsCard
          layout="centered"
          label="Total Merchants"
          value={stats?.totalMerchants !== undefined ? stats.totalMerchants.toLocaleString('en-IN') : 0}
          color="purple"
        />
      </div>

      {/* Filter Toolbar Card (Matching Employee module standard) */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3.5">
        {/* Top Search & Action Row */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={17}
            />
            <input
              type="text"
              placeholder="Search by branch name, code, email, phone, city..."
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
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={() => { setCreateStep(1); setIsCreateModalOpen(true); }}
              className="bg-[#225091] hover:bg-[#183f72] text-white px-4.5 py-2.5 rounded-xl font-bold transition-all text-xs shadow-2xs flex-shrink-0 cursor-pointer"
            >
              + Create Branch
            </button>
          </div>
        </div>

        {/* Bottom Inline Filter Controls: State -> City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          {/* 1. State / Region Filter */}
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
                ...filterStates.map((st) => ({ value: st, label: st }))
              ]}
              placeholder="All States / Regions"
              searchPlaceholder="Search state or region..."
              className="text-xs"
            />
          </div>

          {/* 2. City Filter */}
          <div>
            <SearchableSelect
              value={selectedCity}
              onChange={(val) => {
                setSelectedCity(val);
                setPage(1);
              }}
              options={[
                { value: '', label: selectedState ? `All Cities in ${selectedState}` : 'All Cities' },
                ...filterCities.map((ct) => ({ value: ct, label: ct }))
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
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full border-collapse min-w-[900px] text-center text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-16">Sr.No.</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch Name</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch Code</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">State/UT</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch Manager</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">EMI Card Available</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Verification Credit</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-5"><Skeleton className="h-4 w-6 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24 rounded" />
                          <Skeleton className="h-2.5 w-32 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-12 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-12 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : !Array.isArray(branches) || branches.length === 0 ? (
                <tr><td colSpan="9" className="py-10 px-5 text-center text-gray-500 text-sm font-medium">No branches found.</td></tr>
              ) : (
                branches.map((branch, idx) => (
                  <tr key={branch.id || branch._id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{branch.srNo || ((page - 1) * 10 + idx + 1)}</td>
                    <td className="py-3.5 px-5 text-sm text-gray-900 font-semibold">{branch.name}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-mono font-medium">{branch.code}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">{branch.state}</td>
                    <td className="py-3.5 px-5">
                      {(() => {
                        const managerData = branch.branchManager || branch.manager;
                        const mName = managerData?.fullName || managerData?.name || branch.managerName || managerData?.user?.name || managerData?.user?.fullName;
                        const mEmail = managerData?.email || branch.managerEmail || managerData?.user?.email;
                        const bId = branch.id || branch._id;
                        return mName || mEmail ? (
                          <Link 
                            to={`/managers/view/${bId}`}
                            state={{ branch, manager: managerData }}
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group cursor-pointer"
                            title="View Branch Manager Profile"
                          >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 bg-blue-50 text-[#225091] font-bold border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                              {getInitials(mName || mEmail)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-xs group-hover:text-[#225091] transition-colors">{mName || 'Unnamed Manager'}</span>
                              <span className="text-[11px] text-gray-500">{mEmail || ''}</span>
                            </div>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(branch, 2)}
                            className="text-xs text-[#225091] hover:underline font-semibold cursor-pointer"
                          >
                            + Assign Manager
                          </button>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-5 text-sm font-semibold text-gray-800 tabular-nums">{branch.cardStock || 0}</td>
                    <td className="py-3.5 px-5 text-sm font-semibold text-gray-800 tabular-nums">{branch.verificationCredits || 0}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border uppercase tracking-wide ${branch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-rose-50 text-rose-700 border-rose-200/60'}`}>
                        {branch.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link 
                          to={`/managers/view/${branch.id || branch._id}`}
                          state={{ branch }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-all shadow-2xs cursor-pointer"
                          title="View Manager Details"
                        >
                          <Eye size={12} /> View
                        </Link>
                        <button 
                          onClick={() => handleOpenEdit(branch)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-2xs cursor-pointer" 
                          title="Edit Branch"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => { setSelectedBranch(branch); setIsDeleteModalOpen(true); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs cursor-pointer" 
                          title="Delete Branch"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        
        {/* Pagination */}
        {!loading && Array.isArray(branches) && branches.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalRecords={stats?.totalBranches || branches.length}
            limit={10}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* CREATE BRANCH & MANAGER MODAL (TWO-STEP) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] mx-2 sm:mx-0">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1b2559]">
                {createStep === 1 ? "Step 1: Branch Details" : "Step 2: Manager Credentials"}
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {createStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Name *</label>
                      <input 
                        type="text" 
                        value={createForm.branch.name} 
                        onChange={e => handleCreateChange('branch', 'name', e.target.value.slice(0, 200))} 
                        placeholder="e.g. Mumbai Fort" 
                        maxLength={200}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Code *</label>
                      <input 
                        type="text" 
                        value={createForm.branch.code} 
                        onChange={e => handleCreateChange('branch', 'code', e.target.value.toUpperCase().slice(0, 20))} 
                        placeholder="e.g. MUM01" 
                        maxLength={20}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm uppercase font-mono" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email *</label>
                      <input 
                        type="email" 
                        value={createForm.branch.email} 
                        onChange={e => handleCreateChange('branch', 'email', e.target.value)} 
                        placeholder="Branch Email" 
                        maxLength={100}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number *</label>
                      <input 
                        type="tel" 
                        inputMode="numeric"
                        value={createForm.branch.phoneNumber} 
                        onChange={e => handleCreateChange('branch', 'phoneNumber', sanitizeDigits(e.target.value, 10))} 
                        onKeyDown={preventInvalidNumberKeys}
                        placeholder="10-digit Phone" 
                        maxLength={10}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Manager Name *</label>
                    <input 
                      type="text" 
                      value={createForm.manager.fullName} 
                      onChange={e => handleCreateChange('manager', 'fullName', e.target.value.slice(0, 200))} 
                      placeholder="Manager Full Name" 
                      maxLength={200}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">State/UT *</label>
                      <SearchableSelect
                        value={createForm.branch.state}
                        onChange={(newState) => {
                          handleCreateChange('branch', 'state', newState);
                          const cities = getCitiesForState(newState);
                          if (createForm.branch.city && !cities.includes(createForm.branch.city)) {
                            handleCreateChange('branch', 'city', '');
                          }
                        }}
                        options={locationsData?.states || ALL_INDIAN_STATES}
                        placeholder="Select State"
                        searchPlaceholder="Search state..."
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">City</label>
                      <SearchableSelect
                        value={createForm.branch.city}
                        onChange={(newCity) => handleCreateChange('branch', 'city', newCity)}
                        options={getCitiesForState(createForm.branch.state)}
                        placeholder="Select City"
                        disabledPlaceholder="Select State First"
                        disabled={!createForm.branch.state}
                        searchPlaceholder="Search city..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Address</label>
                    <input 
                      type="text" 
                      value={createForm.branch.addressLine1} 
                      onChange={e => handleCreateChange('branch', 'addressLine1', e.target.value.slice(0, 200))} 
                      placeholder="Address Line 1" 
                      maxLength={200}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Pincode</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={createForm.branch.pincode} 
                      onChange={e => handleCreateChange('branch', 'pincode', sanitizeDigits(e.target.value, 6))} 
                      onKeyDown={preventInvalidNumberKeys}
                      placeholder="6-digit Pincode" 
                      maxLength={6}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                    Every new branch must have an assigned Branch Manager. Please provide their login credentials and basic info. HR configuration can be completed later.
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email Address (Login ID) *</label>
                    <input 
                      type="email" 
                      value={createForm.manager.email} 
                      onChange={e => handleCreateChange('manager', 'email', e.target.value)} 
                      placeholder="Manager Email" 
                      maxLength={100}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Temporary Password *</label>
                    <div className="relative">
                      <input 
                        type={showManagerPassword ? "text" : "password"} 
                        value={createForm.manager.password} 
                        onChange={e => handleCreateChange('manager', 'password', e.target.value)} 
                        placeholder="Min 6 characters" 
                        maxLength={50}
                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowManagerPassword(!showManagerPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      >
                        {showManagerPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number *</label>
                    <input 
                      type="tel" 
                      inputMode="numeric"
                      value={createForm.manager.phoneNumber} 
                      onChange={e => handleCreateChange('manager', 'phoneNumber', sanitizeDigits(e.target.value, 10))} 
                      onKeyDown={preventInvalidNumberKeys}
                      placeholder="10-digit Phone" 
                      maxLength={10}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-6 pt-4 border-t border-gray-200 bg-white">
              {createStep === 1 ? (
                <div className="w-full flex justify-end gap-3">
                  <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer">Cancel</button>
                  <button 
                    onClick={handleNextCreateStep} 
                    disabled={!createForm.branch.name || !createForm.branch.code || !createForm.branch.state || !createForm.branch.email || !createForm.manager.fullName}
                    className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-between">
                  <button onClick={() => setCreateStep(1)} className="group px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm flex items-center gap-2 active:scale-[0.98] cursor-pointer">
                    <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> Back
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer">Cancel</button>
                    <button 
                      onClick={submitCreateBranch} 
                      disabled={createSubmitting || !createForm.manager.fullName || !createForm.manager.email || !createForm.manager.password}
                      className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center cursor-pointer"
                    >
                      {createSubmitting ? 'Creating...' : 'Finish & Create'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-[#1b2559]">
                {editStep === 1 ? "Step 1: Branch Details" : "Step 2: Manager Credentials"}
              </h2>
              <button onClick={() => { setIsEditModalOpen(false); setEditStep(1); }} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {editStep === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Name *</label>
                      <input type="text" value={selectedBranch.name || ''} onChange={(e) => setSelectedBranch({...selectedBranch, name: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Code *</label>
                      <input type="text" value={selectedBranch.code || ''} onChange={(e) => setSelectedBranch({...selectedBranch, code: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email *</label>
                      <input type="email" value={selectedBranch.email || ''} onChange={(e) => setSelectedBranch({...selectedBranch, email: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number *</label>
                      <input 
                        type="tel" 
                        maxLength={10}
                        value={selectedBranch.phoneNumber || ''} 
                        onChange={(e) => setSelectedBranch({...selectedBranch, phoneNumber: sanitizeDigits(e.target.value, 10)})} 
                        placeholder="10-digit Phone"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Manager Name</label>
                    <input 
                      type="text" 
                      value={selectedBranch.manager?.fullName || ''} 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        manager: { ...(selectedBranch.manager || {}), fullName: e.target.value }
                      })} 
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  {/* State/UT and City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">State/UT</label>
                      <SearchableSelect
                        value={selectedBranch.state || ''}
                        onChange={(newState) => {
                          const cities = getCitiesForState(newState);
                          const currentCity = selectedBranch.address?.city;
                          setSelectedBranch({
                            ...selectedBranch, 
                            state: newState,
                            address: { 
                              ...(selectedBranch.address || {}), 
                              state: newState,
                              city: (currentCity && !cities.includes(currentCity)) ? '' : currentCity
                            }
                          });
                        }}
                        options={locationsData?.states || ALL_INDIAN_STATES}
                        placeholder="Select State"
                        searchPlaceholder="Search state..."
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">City</label>
                      <SearchableSelect
                        value={selectedBranch.address?.city || ''}
                        onChange={(newCity) => setSelectedBranch({
                          ...selectedBranch,
                          address: { ...(selectedBranch.address || {}), city: newCity }
                        })}
                        options={getCitiesForState(selectedBranch.state)}
                        placeholder="Select City"
                        disabledPlaceholder="Select State First"
                        disabled={!selectedBranch.state}
                        searchPlaceholder="Search city..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Address</label>
                    <input 
                      type="text" 
                      value={selectedBranch.address?.addressLine1 || ''} 
                      onChange={(e) => setSelectedBranch({...selectedBranch, address: { ...(selectedBranch.address || {}), addressLine1: e.target.value }})} 
                      placeholder="Address Line 1" 
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Pincode</label>
                    <input 
                      type="text" 
                      value={selectedBranch.address?.pincode || ''} 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        address: { ...(selectedBranch.address || {}), pincode: sanitizeDigits(e.target.value, 6) }
                      })} 
                      placeholder="6-digit Pincode"
                      maxLength={6}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email Address (Login ID) *</label>
                    <input 
                      type="email" 
                      value={selectedBranch.manager?.email || ''} 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        manager: { ...(selectedBranch.manager || {}), email: e.target.value }
                      })} 
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Temporary Password</label>
                    <div className="relative">
                      <input 
                        type={showEditManagerPassword ? "text" : "password"} 
                        minLength={8} 
                        value={selectedBranch.manager?.password || ''} 
                        placeholder="Leave blank to keep current (Min 8 characters)" 
                        onChange={(e) => setSelectedBranch({
                          ...selectedBranch, 
                          manager: { ...(selectedBranch.manager || {}), password: e.target.value }
                        })} 
                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditManagerPassword(!showEditManagerPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        title={showEditManagerPassword ? "Hide password" : "Show password"}
                      >
                        {showEditManagerPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number *</label>
                    <input 
                      type="tel" 
                      maxLength={10}
                      value={selectedBranch.manager?.phoneNumber || ''} 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        manager: { ...(selectedBranch.manager || {}), phoneNumber: sanitizeDigits(e.target.value, 10) }
                      })} 
                      placeholder="10-digit Phone"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center p-6 pt-4 border-t border-gray-200 bg-white">
              {editStep === 1 ? (
                <div className="w-full flex justify-end gap-3">
                  <button onClick={() => { setIsEditModalOpen(false); setEditStep(1); }} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                    Cancel
                  </button>
                  <button onClick={() => setEditStep(2)} className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm flex items-center gap-2">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-between">
                  <button onClick={() => setEditStep(1)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => { setIsEditModalOpen(false); setEditStep(1); }} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                      Cancel
                    </button>
                    <button 
                      onClick={submitEditBranch} 
                      disabled={editSubmitting}
                      className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                      {editSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Branch</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{selectedBranch.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedBranch(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDeleteBranch}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branch;
