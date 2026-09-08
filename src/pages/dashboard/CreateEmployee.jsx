import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Camera, Calendar, ChevronDown, Eye, EyeOff, Check, Search, AlertCircle, Shield, Clock, CalendarDays, Award, Trash2, Plus } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';
import PageHeader from '../../components/common/PageHeader';
import { 
  validatePassword, 
  validatePhone, 
  validateEmail, 
  validateDOB,
  sanitizeDigits, 
  preventInvalidNumberKeys,
  validatePositiveNumber 
} from '../../utils/validation';
import { 
  ALL_KPA_PRODUCTS, 
  deriveKpaGoals, 
  getRecommendedProductsForRole 
} from '../../utils/kpaConstants';

const INDIAN_STATES_FALLBACK = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Custom Downward, Small-Scrollable Searchable State Dropdown
const StateDropdown = ({ value, onChange, options, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center bg-white border px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${
          isOpen ? 'border-[#225091] ring-1 ring-[#225091]' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {value || (loading ? 'Loading states...' : 'Select State')}
        </span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
          {/* Quick Search */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search state..."
                autoFocus
                className="w-full pl-8 pr-6 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] text-gray-700"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Small Scrollable State List */}
          <div className="max-h-44 overflow-y-auto py-1 divide-y divide-gray-50">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-center text-gray-400">
                No states found
              </div>
            ) : (
              filteredOptions.map((st) => {
                const isSelected = value === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onChange(st);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-[#225091]/10 text-[#225091] font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{st}</span>
                    {isSelected && <Check size={14} className="text-[#225091]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic Options
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [states, setStates] = useState(INDIAN_STATES_FALLBACK);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          branchService.list({ limit: 100 }),
          roleService.list({ limit: 100 })
        ]);
        if (bRes && bRes.success) {
          const bList = Array.isArray(bRes.data) ? bRes.data : (bRes.data?.branches || bRes.data?.items || bRes.data?.data || []);
          setBranches(bList);
        }
        if (rRes && rRes.success) {
          const rList = Array.isArray(rRes.data) ? rRes.data : (rRes.data?.roles || rRes.data?.items || rRes.data?.data || []);
          setRoles(rList);
        }
      } catch (err) {
        console.error("Failed to fetch options", err);
      }
    };

    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await fetch('https://api.countrystatecity.in/v1/countries/IN/states', {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const stateNames = data.map(item => (typeof item === 'string' ? item : item.name)).sort((a, b) => a.localeCompare(b));
            setStates(stateNames);
          }
        }
      } catch (err) {
        console.warn("Could not fetch states from countrystatecity API, using fallback list.", err);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchOptions();
    fetchStates();
  }, []);

  // Form States
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '', gender: '', dateOfBirth: '', phoneNumber: '', email: '', password: '', address: ''
  });
  const [jobDetails, setJobDetails] = useState({
    roleId: '', branchId: '', designation: '', state: '', salary: '', joiningDate: '', probationPeriodMonths: 6
  });
  const [shiftSettings, setShiftSettings] = useState({
    punchInTime: '09:30',
    punchOutTime: '18:30',
    weeklyOffDay: 'SUNDAY',
    lateAllowedMins: 15,
    earlyAllowedMins: 15
  });
  const [attendanceSettings, setAttendanceSettings] = useState({
    punchType: 'DOUBLE',
    noOutPunchAction: 'MARK_HALF_DAY',
    lateCutAction: 'MARK_HALF_DAY',
    overtimeAllowed: false
  });
  const [woffHoffSettings, setWoffHoffSettings] = useState({
    sandwichWeeklyOff: true,
    sandwichHoliday: true,
    considerWOInLeave: true,
    considerHolInLeave: true
  });
  const [kraSettings, setKraSettings] = useState({
    year: new Date().getFullYear(),
    targets: [
      { product: '', targetValue: '' }
    ]
  });

  // Active Role and Recommended KPA Products
  const activeRoleName = useMemo(() => {
    const selectedRole = roles.find(r => (r.id || r._id) === jobDetails.roleId);
    return selectedRole?.name || selectedRole?.roleName || jobDetails.designation || '';
  }, [roles, jobDetails.roleId, jobDetails.designation]);

  const roleRecommendedProducts = useMemo(() => {
    return getRecommendedProductsForRole(activeRoleName);
  }, [activeRoleName]);

  // Automatically sync KPA targets to the role's assigned products
  useEffect(() => {
    if (roleRecommendedProducts && roleRecommendedProducts.length > 0) {
      setKraSettings(prev => {
        const updatedTargets = roleRecommendedProducts.map(rec => {
          const existing = prev.targets?.find(t => t.product === rec.product);
          return {
            product: rec.product,
            targetType: rec.targetType || 'AMOUNT',
            targetValue: existing?.targetValue !== undefined && existing?.targetValue !== '' ? existing.targetValue : (rec.defaultTarget ?? 0)
          };
        });
        return {
          ...prev,
          targets: updatedTargets
        };
      });
    }
  }, [roleRecommendedProducts]);

  // Form Validation Errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const tabs = ['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF & HOFF', 'KRA Settings'];
  const currentTabIndex = tabs.indexOf(activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  // Single field validation for mandatory fields only
  const validateSingleField = (field, value) => {
    let errorMsg = null;

    switch (field) {
      case 'fullName':
        if (!value || !value.trim()) {
          errorMsg = 'Full Name is required.';
        }
        break;

      case 'email': {
        if (!value || !value.trim()) {
          errorMsg = 'Email is required.';
        } else {
          const emailCheck = validateEmail(value, { required: true });
          if (!emailCheck.isValid) errorMsg = emailCheck.error;
        }
        break;
      }

      case 'password': {
        if (!value) {
          errorMsg = 'Password is required.';
        } else if (value.length < 6) {
          errorMsg = 'Password must be at least 6 characters.';
        }
        break;
      }

      case 'phoneNumber': {
        if (value) {
          const phoneCheck = validatePhone(value, { required: false });
          if (!phoneCheck.isValid) errorMsg = phoneCheck.error;
        }
        break;
      }

      case 'dateOfBirth': {
        if (value) {
          const dobCheck = validateDOB(value, { minAge: 18, maxAge: 100, required: false });
          if (!dobCheck.isValid) errorMsg = dobCheck.error;
        }
        break;
      }

      case 'branchId':
        if (!value) {
          errorMsg = 'Branch is required.';
        }
        break;

      case 'roleId':
        if (!value) {
          errorMsg = 'Role is required.';
        }
        break;

      default:
        break;
    }

    setErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[field] = errorMsg;
      } else {
        delete updated[field];
      }
      return updated;
    });

    return errorMsg;
  };

  const handleNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreate = async () => {
    // 1. Validate Personal Details (Mandatory)
    if (!personalDetails.fullName?.trim()) {
      setActiveTab('Personal Details');
      toast.error("Full Name is required.");
      return;
    }
    if (!personalDetails.email?.trim()) {
      setActiveTab('Personal Details');
      toast.error("Email is required.");
      return;
    }
    const emailCheck = validateEmail(personalDetails.email, { required: true });
    if (!emailCheck.isValid) {
      setActiveTab('Personal Details');
      toast.error(emailCheck.error);
      return;
    }
    if (!personalDetails.password) {
      setActiveTab('Personal Details');
      toast.error("Password is required.");
      return;
    }
    if (personalDetails.password.length < 6) {
      setActiveTab('Personal Details');
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (personalDetails.phoneNumber) {
      const phoneCheck = validatePhone(personalDetails.phoneNumber, { required: false });
      if (!phoneCheck.isValid) {
        setActiveTab('Personal Details');
        toast.error(phoneCheck.error);
        return;
      }
    }
    if (personalDetails.dateOfBirth) {
      const dobCheck = validateDOB(personalDetails.dateOfBirth, { minAge: 18, maxAge: 100, required: false });
      if (!dobCheck.isValid) {
        setActiveTab('Personal Details');
        toast.error(dobCheck.error);
        return;
      }
    }

    // 2. Validate Job Details (Mandatory)
    if (!jobDetails.branchId) {
      setActiveTab('Job Details');
      toast.error("Please select a Branch.");
      return;
    }
    if (!jobDetails.roleId) {
      setActiveTab('Job Details');
      toast.error("Please select a Role.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        personalDetails: { 
          fullName: personalDetails.fullName.trim(),
          email: personalDetails.email.trim(),
          password: personalDetails.password,
          phoneNumber: personalDetails.phoneNumber.trim(),
          gender: personalDetails.gender || undefined,
          dateOfBirth: personalDetails.dateOfBirth || undefined,
          address: personalDetails.address.trim() || undefined
        },
        jobDetails: {
          roleId: jobDetails.roleId,
          branchId: jobDetails.branchId,
          designation: jobDetails.designation.trim() || undefined,
          state: jobDetails.state || undefined,
          salary: Math.max(0, Number(jobDetails.salary) || 0),
          joiningDate: jobDetails.joiningDate || undefined,
          probationPeriodMonths: Math.max(0, Number(jobDetails.probationPeriodMonths) || 6)
        },
        shiftSettings: {
          punchInTime: shiftSettings.punchInTime || '09:30',
          punchOutTime: shiftSettings.punchOutTime || '18:30',
          weeklyOff: {
            day: shiftSettings.weeklyOffDay || 'SUNDAY',
            payable: true,
            variable: false,
            secondWeeklyOff: false
          },
          lateAllowedMinutes: Number(shiftSettings.lateAllowedMins) || 15,
          earlyAllowedMinutes: Number(shiftSettings.earlyAllowedMins) || 15,
          halfDayMinutes: 240,
          fullDayMinutes: 480
        },
        attendanceSettings: {
          punchType: attendanceSettings.punchType || 'DOUBLE',
          noOutPunchAction: attendanceSettings.noOutPunchAction || 'MARK_HALF_DAY',
          presentOnWeeklyOffHolidayAction: 'EXTRA_PAY',
          lateCut: {
            allowedDays: 3,
            action: attendanceSettings.lateCutAction || 'MARK_HALF_DAY',
            allowed: true,
            extraDeduction: false,
            additionalInLeaveBalance: false
          },
          lunchAndEarlyGoing: {
            lunchAllowedMins: 0,
            lunchAsPerShift: false,
            lunchAllowed: false,
            earlyGoingAllowed: false
          },
          overtime: {
            allowed: !!attendanceSettings.overtimeAllowed,
            customOT: false,
            beforeOT: false,
            gracePeriodMinutes: 5,
            oneDayOTHrs: 4,
            otAsPerShift: false,
            considerOTAsCOFF: false
          }
        },
        woffHoffSettings: {
          woAbsentBefore: !!woffHoffSettings.sandwichWeeklyOff,
          woAbsentAfter: !!woffHoffSettings.sandwichWeeklyOff,
          woAbsentBeforeOrAfter: false,
          woAddWorkingHrs: false,
          woLateDeductionNotApplied: false,
          woLWP: false,
          holAbsentBefore: !!woffHoffSettings.sandwichHoliday,
          holAbsentAfter: !!woffHoffSettings.sandwichHoliday,
          holAbsentBeforeAndAfter: false,
          holAddWorkingHrs: false,
          holLateDeductionNotApplied: false,
          holLWP: false,
          considerWOInLeave: !!woffHoffSettings.considerWOInLeave,
          considerHolInLeave: !!woffHoffSettings.considerHolInLeave,
          absentWOLeaveWOAbsent: true,
          leaveWOAbsentWOAbsent: false,
          absentHolLeaveHolAbsent: false,
          leaveHolAbsentHolAbsent: false,
          leaveInCash: true,
          leaveCarryForward: true
        },
        kraSettings: {
          year: Math.max(2000, Number(kraSettings.year) || new Date().getFullYear()),
          targets: kraSettings.targets
            .filter(t => t.product && t.product.trim())
            .map(t => ({ product: t.product, targetValue: Math.max(0, Number(t.targetValue) || 0) }))
        }
      };

      const response = await employeeService.create(payload);
      if (response.success) {
        toast.success("Employee created successfully!");
        navigate('/employees');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create employee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <PageHeader
        title="Create Employee"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: 'Create Employee' }
        ]}
        showBack={true}
        backUrl="/employees"
      />

      {/* Stepper Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                isActive 
                  ? 'bg-[#225091] text-white border-[#225091] shadow-xs' 
                  : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive ? 'bg-white text-[#225091]' : 'bg-gray-100 text-gray-600'
              }`}>
                {idx + 1}
              </span>
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-2">
        {activeTab === 'Personal Details' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">General Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={personalDetails.fullName} 
                  onChange={e => {
                    const val = e.target.value;
                    setPersonalDetails({...personalDetails, fullName: val});
                    if (touched.fullName || errors.fullName) validateSingleField('fullName', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, fullName: true }));
                    validateSingleField('fullName', personalDetails.fullName);
                  }}
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.fullName 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`} 
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.fullName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  value={personalDetails.email} 
                  onChange={e => {
                    const val = e.target.value;
                    setPersonalDetails({...personalDetails, email: val});
                    if (touched.email || errors.email) validateSingleField('email', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, email: true }));
                    validateSingleField('email', personalDetails.email);
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.email 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`} 
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={personalDetails.password} 
                    onChange={e => {
                      const val = e.target.value;
                      setPersonalDetails({...personalDetails, password: val});
                      if (touched.password || errors.password) validateSingleField('password', val);
                    }}
                    onBlur={() => {
                      setTouched(t => ({ ...t, password: true }));
                      validateSingleField('password', personalDetails.password);
                    }}
                    placeholder="Minimum 6 characters"
                    className={`w-full pl-4 pr-10 py-3 rounded-xl border bg-white text-sm transition-all ${
                      errors.password 
                        ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                        : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                    }`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.password}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Phone
                </label>
                <input 
                  type="tel" 
                  value={personalDetails.phoneNumber} 
                  onChange={e => {
                    const val = sanitizeDigits(e.target.value, 10);
                    setPersonalDetails({...personalDetails, phoneNumber: val});
                    if (touched.phoneNumber || errors.phoneNumber) validateSingleField('phoneNumber', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, phoneNumber: true }));
                    validateSingleField('phoneNumber', personalDetails.phoneNumber);
                  }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.phoneNumber 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`} 
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Gender
                </label>
                <select value={personalDetails.gender} onChange={e => setPersonalDetails({...personalDetails, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Date Of Birth
                </label>
                <input 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  value={personalDetails.dateOfBirth} 
                  onChange={e => {
                    const val = e.target.value;
                    setPersonalDetails({...personalDetails, dateOfBirth: val});
                    if (touched.dateOfBirth || errors.dateOfBirth) validateSingleField('dateOfBirth', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, dateOfBirth: true }));
                    validateSingleField('dateOfBirth', personalDetails.dateOfBirth);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.dateOfBirth 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`} 
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.dateOfBirth}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Address
                </label>
                <input type="text" value={personalDetails.address} onChange={e => setPersonalDetails({...personalDetails, address: e.target.value})} placeholder="Enter residential address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Job Details' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Employment Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Branch <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={jobDetails.branchId} 
                  onChange={e => {
                    const val = e.target.value;
                    setJobDetails({...jobDetails, branchId: val});
                    if (touched.branchId || errors.branchId) validateSingleField('branchId', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, branchId: true }));
                    validateSingleField('branchId', jobDetails.branchId);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.branchId 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.branchId && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.branchId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={jobDetails.roleId} 
                  onChange={e => {
                    const val = e.target.value;
                    const selectedRole = roles.find(r => r.id === val);
                    setJobDetails(prev => ({
                      ...prev, 
                      roleId: val,
                      designation: prev.designation || selectedRole?.name || ''
                    }));

                    // Auto-seed recommended KPA targets matching selected role
                    if (selectedRole?.name) {
                      const recommended = getRecommendedProductsForRole(selectedRole.name);
                      if (recommended && recommended.length > 0) {
                        setKraSettings(prev => ({
                          ...prev,
                          targets: recommended.map(rec => ({
                            product: rec.product,
                            targetType: rec.targetType || 'AMOUNT',
                            targetValue: rec.defaultTarget ?? 0
                          }))
                        }));
                      }
                    }
                    if (touched.roleId || errors.roleId) validateSingleField('roleId', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, roleId: true }));
                    validateSingleField('roleId', jobDetails.roleId);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.roleId 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {errors.roleId && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.roleId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  State
                </label>
                <StateDropdown 
                  value={jobDetails.state}
                  onChange={(val) => setJobDetails({...jobDetails, state: val})}
                  options={states}
                  loading={loadingStates}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Salary (Monthly)
                </label>
                <input 
                  type="number" 
                  min="0" 
                  value={jobDetails.salary} 
                  onChange={e => {
                    const val = e.target.value;
                    setJobDetails({...jobDetails, salary: val});
                    if (touched.salary || errors.salary) validateSingleField('salary', val);
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, salary: true }));
                    validateSingleField('salary', jobDetails.salary);
                  }}
                  placeholder="₹ Monthly salary"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                    errors.salary 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                  }`} 
                />
                {errors.salary && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.salary}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Joining Date
                </label>
                <input type="date" value={jobDetails.joiningDate} onChange={e => setJobDetails({...jobDetails, joiningDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Probation Period (Months)
                </label>
                <input type="number" min="0" value={jobDetails.probationPeriodMonths} onChange={e => setJobDetails({...jobDetails, probationPeriodMonths: e.target.value})} placeholder="Default: 6 months" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Shift & WOFF' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Timing Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="text-[#225091]" size={20} />
                  <h3 className="text-lg font-bold text-gray-800">Shift Timings (Optional)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch In Time (Optional)</label>
                    <input 
                      type="time" 
                      value={shiftSettings.punchInTime} 
                      onChange={e => setShiftSettings({...shiftSettings, punchInTime: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch Out Time (Optional)</label>
                    <input 
                      type="time" 
                      value={shiftSettings.punchOutTime} 
                      onChange={e => setShiftSettings({...shiftSettings, punchOutTime: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Off Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarDays className="text-[#225091]" size={20} />
                  <h3 className="text-lg font-bold text-gray-800">Weekly Off (Optional)</h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Weekly Off Day (Optional)</label>
                  <select 
                    value={shiftSettings.weeklyOffDay} 
                    onChange={e => setShiftSettings({...shiftSettings, weeklyOffDay: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm"
                  >
                    <option value="SUNDAY">Sunday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grace Period Card */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Grace Period Rules (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Late Allowed (Minutes) (Optional)</label>
                  <input type="number" min="0" value={shiftSettings.lateAllowedMins} onChange={e => setShiftSettings({...shiftSettings, lateAllowedMins: e.target.value})} placeholder="Default: 15 mins" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Early Allowed (Minutes) (Optional)</label>
                  <input type="number" min="0" value={shiftSettings.earlyAllowedMins} onChange={e => setShiftSettings({...shiftSettings, earlyAllowedMins: e.target.value})} placeholder="Default: 15 mins" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Punch Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Punch Mode (Optional)</h3>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Punch Type (Optional)</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="SINGLE" checked={attendanceSettings.punchType === 'SINGLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-4 h-4 text-[#225091] focus:ring-[#225091]" />
                        <span className="text-sm text-gray-700">Single Punch</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="DOUBLE" checked={attendanceSettings.punchType === 'DOUBLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-4 h-4 text-[#225091] focus:ring-[#225091]" />
                        <span className="text-sm text-gray-700">Double Punch (In / Out)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">No Out-Punch Found Action (Optional)</label>
                    <select value={attendanceSettings.noOutPunchAction} onChange={e => setAttendanceSettings({...attendanceSettings, noOutPunchAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                      <option value="MARK_HALF_DAY">Mark Half Day</option>
                      <option value="MARK_ABSENT">Mark Absent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Late Cut & Overtime Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Attendance Policies (Optional)</h3>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Late Cut Action (Optional)</label>
                    <select value={attendanceSettings.lateCutAction} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                      <option value="MARK_HALF_DAY">Mark Half Day</option>
                      <option value="MARK_ABSENT">Mark Absent</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors mt-1">
                    <input type="checkbox" checked={attendanceSettings.overtimeAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, overtimeAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 block">Overtime Allowed (Optional)</span>
                      <span className="text-xs text-gray-500">Enable overtime calculation for extra working hours</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}
        
        {activeTab === 'WOFF & HOFF' && (
          <div className="space-y-6">
            {/* Sandwich Rules */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Sandwich Absence Rules (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.sandwichWeeklyOff} onChange={e => setWoffHoffSettings({...woffHoffSettings, sandwichWeeklyOff: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">Sandwich Rule on Weekly Off (Optional)</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Mark absent on Weekly Off if absent on adjacent days.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.sandwichHoliday} onChange={e => setWoffHoffSettings({...woffHoffSettings, sandwichHoliday: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">Sandwich Rule on Holiday (Optional)</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Mark absent on Holiday if absent on adjacent days.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Leave Integration */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Leave Rules (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.considerWOInLeave} onChange={e => setWoffHoffSettings({...woffHoffSettings, considerWOInLeave: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">Consider "Weekly Off" In Leave Application (Optional)</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Include weekly off days in total leave count.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.considerHolInLeave} onChange={e => setWoffHoffSettings({...woffHoffSettings, considerHolInLeave: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">Consider "Holiday" In Leave Application (Optional)</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Include declared holidays in total leave count.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'KRA Settings' && (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6 shadow-xs bg-white">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Award className="text-[#225091]" size={20} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Role KPA Performance Targets (Yearly)</h3>
                    {activeRoleName ? (
                      <p className="text-xs text-[#225091] font-medium mt-0.5">
                        Assigned products for: <span className="font-bold underline">{activeRoleName}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        Please select a role in Job Details to load assigned KPA products.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-600">Fiscal Year:</label>
                  <input 
                    type="number" 
                    value={kraSettings.year} 
                    onChange={e => setKraSettings({...kraSettings, year: e.target.value})} 
                    className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#225091] focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white"
                  />
                </div>
              </div>
              
              {!activeRoleName ? (
                <div className="p-8 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200 mt-4">
                  <Award className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm font-semibold text-gray-700">No Role Selected</p>
                  <p className="text-xs text-gray-500 mt-1">Please select a Role in the Job Details tab to automatically display the assigned KPA products.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  {kraSettings.targets.map((target, index) => {
                    const derived = deriveKpaGoals(target.targetValue);
                    const isAmount = target.targetType === 'AMOUNT';

                    const formatVal = (v) => {
                      const formatted = Number(v).toLocaleString('en-IN');
                      return isAmount ? `₹${formatted}` : formatted;
                    };

                    return (
                      <div key={index} className="bg-gray-50/70 p-5 rounded-xl border border-gray-100 flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-6 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{target.product}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isAmount ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                }`}>
                                  {isAmount ? '₹ AMOUNT TARGET' : '🔢 COUNT TARGET'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-6">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Annual Target ({isAmount ? '₹ Value' : 'Total Count'})
                            </label>
                            <input 
                              type="number" 
                              min="0" 
                              value={target.targetValue} 
                              onChange={e => {
                                const newTargets = [...kraSettings.targets];
                                newTargets[index].targetValue = e.target.value;
                                setKraSettings({...kraSettings, targets: newTargets});
                              }} 
                              placeholder={isAmount ? "e.g. 1200000" : "e.g. 50"}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm font-semibold text-gray-800" 
                            />
                          </div>
                        </div>

                        {/* Derived Milestones Preview */}
                        <div className="bg-white border border-slate-200/70 rounded-lg p-3 flex items-center justify-between gap-2 text-xs text-gray-600 flex-wrap">
                          <span className="font-semibold text-gray-500">Derived Milestones:</span>
                          <span className="text-gray-500">Daily: <b className="text-gray-900">{formatVal(derived.daily)}</b></span>
                          <span className="text-gray-500">Weekly: <b className="text-gray-900">{formatVal(derived.weekly)}</b></span>
                          <span className="text-gray-500">Monthly: <b className="text-gray-900">{formatVal(derived.monthly)}</b></span>
                          <span className="text-emerald-700">Yearly: <b className="text-emerald-800">{formatVal(derived.yearly)}</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Buttons */}
      <div className="flex justify-between items-center mt-2">
        <div>
          {isFirstTab ? (
            <button 
              type="button"
              onClick={() => navigate('/employees')} 
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors bg-white shadow-xs cursor-pointer text-sm"
            >
              Cancel
            </button>
          ) : (
            <button 
              type="button"
              onClick={handlePrevious} 
              className="group flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all bg-white shadow-xs cursor-pointer text-sm active:scale-[0.98]"
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> Previous
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isLastTab ? (
            <button 
              type="button"
              onClick={handleNext} 
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm bg-[#225091] hover:bg-[#163a6c] text-white cursor-pointer"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleCreate} 
              disabled={submitting} 
              className="px-8 py-2.5 rounded-xl bg-[#225091] text-white font-bold hover:bg-[#163a6c] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer text-sm"
            >
              {submitting ? 'Creating Employee...' : 'Finish & Create'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;
