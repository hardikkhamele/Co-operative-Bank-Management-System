import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Camera, Calendar, ChevronDown, Eye, EyeOff, Check, Search, AlertCircle } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';
import { 
  validatePassword, 
  validatePhone, 
  validateEmail, 
  validateDOB,
  sanitizeDigits, 
  preventInvalidNumberKeys,
  validatePositiveNumber 
} from '../../utils/validation';

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
        if (bRes.success) setBranches(bRes.data);
        if (rRes.success) setRoles(rRes.data);
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
    punchInTime: '09:30', punchOutTime: '18:30', weeklyOffDay: 'SUNDAY', weeklyOffPayable: true,
    variableWeeklyOff: false, secondWeeklyOff: false,
    lateAllowedMins: 15, lateAllowedAsPerShift: false,
    earlyAllowedMins: 15, earlyAllowedAsPerShift: false,
    halfDayMins: 240, halfDayAsPerShift: false,
    fullDayMins: 480, fullDayAsPerShift: false
  });
  const [attendanceSettings, setAttendanceSettings] = useState({
    punchType: 'DOUBLE', noOutPunchAction: 'MARK_HALF_DAY', presentOnWeeklyOffHolidayAction: 'EXTRA_PAY',
    lateCutAllowedDays: 3, lateCutAction: 'MARK_HALF_DAY', lateCutAllowed: false, extraLateCutDeduction: false, additionalLateCutInLeaveBalance: false,
    lunchAllowedMins: 0, lunchAsPerShift: false, lunchAllowed: false, earlyGoingAllowed: false,
    overtimeAllowed: false, customOT: false, beforeOT: false, gracePeriodMinutes: 5, oneDayOTHrs: 4, otAsPerShift: false, considerOTAsCOFF: false
  });
  const [woffHoffSettings, setWoffHoffSettings] = useState({
    woAbsentBefore: true, woAbsentAfter: true, woAbsentBeforeOrAfter: false, woAddWorkingHrs: false, woLateDeductionNotApplied: false, woLWP: false,
    holAbsentBefore: false, holAbsentAfter: false, holAbsentBeforeAndAfter: false, holAddWorkingHrs: false, holLateDeductionNotApplied: false, holLWP: false,
    considerWOInLeave: true, considerHolInLeave: true, absentWOLeaveWOAbsent: true, leaveWOAbsentWOAbsent: false, absentHolLeaveHolAbsent: false, leaveHolAbsentHolAbsent: false,
    leaveInCash: true, leaveCarryForward: true
  });
  const [kraSettings, setKraSettings] = useState({
    year: new Date().getFullYear(),
    targets: [
      { product: 'Fixed Deposit', targetValue: 2400000 }, 
      { product: 'Loan Disbursement', targetValue: 2400000 }, 
      { product: 'Savings Account', targetValue: 1200 }
    ]
  });

  // Form Validation Errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const tabs = ['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF & HOFF', 'KRA Settings'];
  const currentTabIndex = tabs.indexOf(activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  // Single field validation
  const validateSingleField = (field, value) => {
    let errorMsg = null;

    switch (field) {
      case 'fullName':
        if (!value || !value.trim()) {
          errorMsg = 'Full Name is required.';
        } else if (value.trim().length < 2) {
          errorMsg = 'Full Name must be at least 2 characters.';
        }
        break;

      case 'email': {
        const emailCheck = validateEmail(value, { required: true });
        if (!emailCheck.isValid) errorMsg = emailCheck.error;
        break;
      }

      case 'password': {
        const passCheck = validatePassword(value, { minLength: 6, required: true, fieldName: 'Password' });
        if (!passCheck.isValid) errorMsg = passCheck.error;
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
          const dobCheck = validateDOB(value, { required: false });
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
          errorMsg = 'Department (Role) is required.';
        }
        break;

      case 'salary':
        if (value !== '') {
          const salaryCheck = validatePositiveNumber(value, 'Salary', { min: 0, required: false });
          if (!salaryCheck.isValid) errorMsg = salaryCheck.error;
        }
        break;

      case 'punchInTime':
        if (!value) errorMsg = 'Punch In Time is required.';
        break;

      case 'punchOutTime':
        if (!value) errorMsg = 'Punch Out Time is required.';
        break;

      case 'weeklyOffDay':
        if (!value) errorMsg = 'Weekly Off Day is required.';
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

  // Validate entire tab
  const validateTab = (tabName) => {
    const tabErrors = {};

    if (tabName === 'Personal Details') {
      const fields = [
        { name: 'fullName', val: personalDetails.fullName },
        { name: 'email', val: personalDetails.email },
        { name: 'password', val: personalDetails.password },
        { name: 'phoneNumber', val: personalDetails.phoneNumber },
        { name: 'dateOfBirth', val: personalDetails.dateOfBirth }
      ];
      fields.forEach(f => {
        const err = validateSingleField(f.name, f.val);
        if (err) tabErrors[f.name] = err;
      });
    } else if (tabName === 'Job Details') {
      const fields = [
        { name: 'branchId', val: jobDetails.branchId },
        { name: 'roleId', val: jobDetails.roleId },
        { name: 'salary', val: jobDetails.salary }
      ];
      fields.forEach(f => {
        const err = validateSingleField(f.name, f.val);
        if (err) tabErrors[f.name] = err;
      });
    } else if (tabName === 'Shift & WOFF') {
      const fields = [
        { name: 'punchInTime', val: shiftSettings.punchInTime },
        { name: 'punchOutTime', val: shiftSettings.punchOutTime },
        { name: 'weeklyOffDay', val: shiftSettings.weeklyOffDay }
      ];
      fields.forEach(f => {
        const err = validateSingleField(f.name, f.val);
        if (err) tabErrors[f.name] = err;
      });
    }

    return tabErrors;
  };

  // Real-time tab validity check for buttons
  const isTabValid = (tabName) => {
    switch (tabName) {
      case 'Personal Details': {
        const nameValid = !!personalDetails.fullName?.trim() && personalDetails.fullName.trim().length >= 2;
        const emailValid = validateEmail(personalDetails.email).isValid;
        const passValid = validatePassword(personalDetails.password, { minLength: 6 }).isValid;
        const phoneValid = !personalDetails.phoneNumber || validatePhone(personalDetails.phoneNumber, { required: false }).isValid;
        const dobValid = !personalDetails.dateOfBirth || validateDOB(personalDetails.dateOfBirth, { required: false }).isValid;
        return nameValid && emailValid && passValid && phoneValid && dobValid;
      }
      case 'Job Details': {
        const branchValid = !!jobDetails.branchId;
        const roleValid = !!jobDetails.roleId;
        const salaryValid = jobDetails.salary === '' || validatePositiveNumber(jobDetails.salary, 'Salary', { min: 0, required: false }).isValid;
        return branchValid && roleValid && salaryValid;
      }
      case 'Shift & WOFF': {
        return !!shiftSettings.punchInTime && !!shiftSettings.punchOutTime && !!shiftSettings.weeklyOffDay;
      }
      case 'Attendance':
      case 'WOFF & HOFF':
      case 'KRA Settings':
        return true;
      default:
        return false;
    }
  };

  const isCurrentTabValid = useMemo(() => isTabValid(activeTab), [
    activeTab,
    personalDetails,
    jobDetails,
    shiftSettings
  ]);

  const handleNext = () => {
    const currentTabErrors = validateTab(activeTab);
    if (Object.keys(currentTabErrors).length > 0) {
      const firstErrMsg = Object.values(currentTabErrors)[0];
      toast.error(firstErrMsg || "Please correct the errors in this section.");
      return;
    }

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
    // Validate all tabs from first to last
    const checkTabs = ['Personal Details', 'Job Details', 'Shift & WOFF'];
    for (const tabName of checkTabs) {
      const tabErrors = validateTab(tabName);
      if (Object.keys(tabErrors).length > 0) {
        setActiveTab(tabName);
        const firstErrMsg = Object.values(tabErrors)[0];
        toast.error(firstErrMsg || `Please complete ${tabName} correctly.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        personalDetails: { 
          ...personalDetails,
          fullName: personalDetails.fullName.trim(),
          email: personalDetails.email.trim(),
          phoneNumber: personalDetails.phoneNumber.trim()
        },
        jobDetails: {
          ...jobDetails,
          salary: Math.max(0, Number(jobDetails.salary) || 0),
          probationPeriodMonths: Math.max(0, Number(jobDetails.probationPeriodMonths) || 0)
        },
        shiftSettings: {
          punchInTime: shiftSettings.punchInTime,
          punchOutTime: shiftSettings.punchOutTime,
          weeklyOff: {
            day: shiftSettings.weeklyOffDay,
            payable: shiftSettings.weeklyOffPayable,
            variable: shiftSettings.variableWeeklyOff,
            secondWeeklyOff: shiftSettings.secondWeeklyOff
          },
          lateAllowedMinutes: shiftSettings.lateAllowedMins,
          lateAllowedAsPerShift: shiftSettings.lateAllowedAsPerShift,
          earlyAllowedMinutes: shiftSettings.earlyAllowedMins,
          earlyAllowedAsPerShift: shiftSettings.earlyAllowedAsPerShift,
          halfDayMinutes: shiftSettings.halfDayMins,
          halfDayAsPerShift: shiftSettings.halfDayAsPerShift,
          fullDayMinutes: shiftSettings.fullDayMins,
          fullDayAsPerShift: shiftSettings.fullDayAsPerShift
        },
        attendanceSettings: {
          punchType: attendanceSettings.punchType,
          noOutPunchAction: attendanceSettings.noOutPunchAction,
          presentOnWeeklyOffHolidayAction: attendanceSettings.presentOnWeeklyOffHolidayAction,
          lateCut: {
            allowedDays: attendanceSettings.lateCutAllowedDays,
            action: attendanceSettings.lateCutAction,
            allowed: attendanceSettings.lateCutAllowed,
            extraDeduction: attendanceSettings.extraLateCutDeduction,
            additionalInLeaveBalance: attendanceSettings.additionalLateCutInLeaveBalance
          },
          lunchAndEarlyGoing: {
            lunchAllowedMins: attendanceSettings.lunchAllowedMins,
            lunchAsPerShift: attendanceSettings.lunchAsPerShift,
            lunchAllowed: attendanceSettings.lunchAllowed,
            earlyGoingAllowed: attendanceSettings.earlyGoingAllowed
          },
          overtime: {
            allowed: attendanceSettings.overtimeAllowed,
            customOT: attendanceSettings.customOT,
            beforeOT: attendanceSettings.beforeOT,
            gracePeriodMinutes: Math.max(0, Number(attendanceSettings.gracePeriodMinutes) || 0),
            oneDayOTHrs: attendanceSettings.oneDayOTHrs,
            otAsPerShift: attendanceSettings.otAsPerShift,
            considerOTAsCOFF: attendanceSettings.considerOTAsCOFF
          }
        },
        woffHoffSettings: {
          ...woffHoffSettings
        },
        kraSettings: {
          year: Math.max(2000, Number(kraSettings.year)),
          targets: kraSettings.targets.map(t => ({ ...t, targetValue: Math.max(0, Number(t.targetValue) || 0) }))
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
              type="button"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-xl font-bold text-[#225091] m-0">Create Employee</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500 pl-[40px]">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/employees" className="hover:text-gray-700">Employees</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[#225091]">Create Employee</span>
          </div>
        </div>
      </div>

      {/* Stepper Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab;
          const isCompleted = isTabValid(tab) && currentTabIndex > idx;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive 
                  ? 'bg-[#225091] text-white border-[#225091] shadow-xs' 
                  : isCompleted 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70' 
                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive 
                  ? 'bg-white text-[#225091]' 
                  : isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {isCompleted ? '✓' : idx + 1}
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
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                <select value={personalDetails.gender} onChange={e => setPersonalDetails({...personalDetails, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
                <input type="text" value={personalDetails.address} onChange={e => setPersonalDetails({...personalDetails, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
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
                  Department <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={jobDetails.roleId} 
                  onChange={e => {
                    const val = e.target.value;
                    setJobDetails({...jobDetails, roleId: val});
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
                  <option value="">Select Department</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {errors.roleId && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.roleId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Designation</label>
                <input type="text" value={jobDetails.designation} onChange={e => setJobDetails({...jobDetails, designation: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                <StateDropdown 
                  value={jobDetails.state}
                  onChange={(val) => setJobDetails({...jobDetails, state: val})}
                  options={states}
                  loading={loadingStates}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Salary (Monthly)</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Joining Date</label>
                <input type="date" value={jobDetails.joiningDate} onChange={e => setJobDetails({...jobDetails, joiningDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Probation Period (Months)</label>
                <input type="number" min="0" value={jobDetails.probationPeriodMonths} onChange={e => setJobDetails({...jobDetails, probationPeriodMonths: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Shift & WOFF' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Shift</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch In Time</label>
                    <input 
                      type="time" 
                      value={shiftSettings.punchInTime} 
                      onChange={e => {
                        const val = e.target.value;
                        setShiftSettings({...shiftSettings, punchInTime: val});
                        if (touched.punchInTime || errors.punchInTime) validateSingleField('punchInTime', val);
                      }}
                      onBlur={() => {
                        setTouched(t => ({ ...t, punchInTime: true }));
                        validateSingleField('punchInTime', shiftSettings.punchInTime);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                        errors.punchInTime 
                          ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                          : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                      }`} 
                    />
                    {errors.punchInTime && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle size={13} /> {errors.punchInTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch Out Time</label>
                    <input 
                      type="time" 
                      value={shiftSettings.punchOutTime} 
                      onChange={e => {
                        const val = e.target.value;
                        setShiftSettings({...shiftSettings, punchOutTime: val});
                        if (touched.punchOutTime || errors.punchOutTime) validateSingleField('punchOutTime', val);
                      }}
                      onBlur={() => {
                        setTouched(t => ({ ...t, punchOutTime: true }));
                        validateSingleField('punchOutTime', shiftSettings.punchOutTime);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                        errors.punchOutTime 
                          ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                          : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                      }`} 
                    />
                    {errors.punchOutTime && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle size={13} /> {errors.punchOutTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Off Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Off</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Weekly Off Day</label>
                    <select 
                      value={shiftSettings.weeklyOffDay} 
                      onChange={e => {
                        const val = e.target.value;
                        setShiftSettings({...shiftSettings, weeklyOffDay: val});
                        if (touched.weeklyOffDay || errors.weeklyOffDay) validateSingleField('weeklyOffDay', val);
                      }}
                      onBlur={() => {
                        setTouched(t => ({ ...t, weeklyOffDay: true }));
                        validateSingleField('weeklyOffDay', shiftSettings.weeklyOffDay);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all ${
                        errors.weeklyOffDay 
                          ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                          : 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091]'
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="SUNDAY">Sunday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                    </select>
                    {errors.weeklyOffDay && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle size={13} /> {errors.weeklyOffDay}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                    <input type="checkbox" checked={shiftSettings.weeklyOffPayable} onChange={e => setShiftSettings({...shiftSettings, weeklyOffPayable: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Weekly Off Payable</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={shiftSettings.variableWeeklyOff} onChange={e => setShiftSettings({...shiftSettings, variableWeeklyOff: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Variable Weekly Off</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={shiftSettings.secondWeeklyOff} onChange={e => setShiftSettings({...shiftSettings, secondWeeklyOff: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Second Weekly Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Other Details Card */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Other Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Late Allowed (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.lateAllowedMins} onChange={e => setShiftSettings({...shiftSettings, lateAllowedMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.lateAllowedAsPerShift} onChange={e => setShiftSettings({...shiftSettings, lateAllowedAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Early Allowed (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.earlyAllowedMins} onChange={e => setShiftSettings({...shiftSettings, earlyAllowedMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.earlyAllowedAsPerShift} onChange={e => setShiftSettings({...shiftSettings, earlyAllowedAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Half Day (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.halfDayMins} onChange={e => setShiftSettings({...shiftSettings, halfDayMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.halfDayAsPerShift} onChange={e => setShiftSettings({...shiftSettings, halfDayAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Full Day (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.fullDayMins} onChange={e => setShiftSettings({...shiftSettings, fullDayMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.fullDayAsPerShift} onChange={e => setShiftSettings({...shiftSettings, fullDayAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Punch Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Punch</h3>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Punch Type</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="SINGLE" checked={attendanceSettings.punchType === 'SINGLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                        <span className="text-sm text-gray-700">Single</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="DOUBLE" checked={attendanceSettings.punchType === 'DOUBLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                        <span className="text-sm text-gray-700">Double</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="MULTIPLE" checked={attendanceSettings.punchType === 'MULTIPLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                        <span className="text-sm text-gray-700">Multiple</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">No Out-Punch Found — Action</label>
                    <select value={attendanceSettings.noOutPunchAction} onChange={e => setAttendanceSettings({...attendanceSettings, noOutPunchAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                      <option value="">Select</option>
                      <option value="MARK_HALF_DAY">Mark Half Day</option>
                      <option value="MARK_ABSENT">Mark Absent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Present On WO / Holiday — Action</label>
                    <select value={attendanceSettings.presentOnWeeklyOffHolidayAction} onChange={e => setAttendanceSettings({...attendanceSettings, presentOnWeeklyOffHolidayAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                      <option value="">Select</option>
                      <option value="EXTRA_PAY">Extra Pay</option>
                      <option value="COMPENSATORY_OFF">Compensatory Off</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Late Cut Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Late Cut</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Allowed Days</label>
                      <input type="number" min="0" value={attendanceSettings.lateCutAllowedDays} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAllowedDays: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Action</label>
                      <select value={attendanceSettings.lateCutAction} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                        <option value="">Select</option>
                        <option value="MARK_HALF_DAY">Mark Half Day</option>
                        <option value="MARK_ABSENT">Mark Absent</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                    <input type="checkbox" checked={attendanceSettings.lateCutAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Late Cut Allowed</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.extraLateCutDeduction} onChange={e => setAttendanceSettings({...attendanceSettings, extraLateCutDeduction: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Extra Late Cut Deduction</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.additionalLateCutInLeaveBalance} onChange={e => setAttendanceSettings({...attendanceSettings, additionalLateCutInLeaveBalance: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Additional Late Cut In Leave Balance</span>
                  </label>
                </div>
              </div>

              {/* Lunch & Early Going Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Lunch & Early Going</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-end mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Lunch Allowed Mins</label>
                      <input type="number" min="0" value={attendanceSettings.lunchAllowedMins} onChange={e => setAttendanceSettings({...attendanceSettings, lunchAllowedMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pb-3">
                      <input type="checkbox" checked={attendanceSettings.lunchAsPerShift} onChange={e => setAttendanceSettings({...attendanceSettings, lunchAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.lunchAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, lunchAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Lunch Allowed</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.earlyGoingAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, earlyGoingAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Early Going Allowed</span>
                  </label>
                </div>
              </div>

              {/* Overtime Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Overtime</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.overtimeAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, overtimeAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Overtime Allowed</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={attendanceSettings.customOT} onChange={e => setAttendanceSettings({...attendanceSettings, customOT: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm font-medium text-gray-700">Custom OT</span>
                    </label>
                    <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={attendanceSettings.beforeOT} onChange={e => setAttendanceSettings({...attendanceSettings, beforeOT: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm font-medium text-gray-700">Before OT</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">OT Grace Period (Mins)</label>
                      <input type="number" min="0" value={attendanceSettings.gracePeriodMinutes} onChange={e => setAttendanceSettings({...attendanceSettings, gracePeriodMinutes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">1 Day OT Hrs</label>
                      <input type="number" min="0" value={attendanceSettings.oneDayOTHrs} onChange={e => setAttendanceSettings({...attendanceSettings, oneDayOTHrs: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                    <input type="checkbox" checked={attendanceSettings.otAsPerShift} onChange={e => setAttendanceSettings({...attendanceSettings, otAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">OT As Per Shift</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.considerOTAsCOFF} onChange={e => setAttendanceSettings({...attendanceSettings, considerOTAsCOFF: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                    <span className="text-sm font-medium text-gray-700">Consider OT As COFF</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}
        
        {activeTab === 'WOFF & HOFF' && (
          <div className="space-y-6">
            {/* Sandwich Absence Rules — Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Sandwich Absence Rules — Weekly Off</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAbsentBefore} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAbsentBefore: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Absent Before Weekly Off</span>
                    <span className="block text-xs text-gray-500 mt-1">Mark Absent If Employee Absent The Day Before WO.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAbsentAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAbsentAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Absent After Weekly Off</span>
                    <span className="block text-xs text-gray-500 mt-1">Mark Absent If Employee Absent The Day After WO.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAbsentBeforeOrAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAbsentBeforeOrAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Absent Before Or After Weekly Off</span>
                    <span className="block text-xs text-gray-500 mt-1">Either Side Triggers WO Absent.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAddWorkingHrs} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAddWorkingHrs: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Add Working Hrs On Weekly Off Day</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woLateDeductionNotApplied} onChange={e => setWoffHoffSettings({...woffHoffSettings, woLateDeductionNotApplied: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Late Deduction Not Applied On WO If Present</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woLWP} onChange={e => setWoffHoffSettings({...woffHoffSettings, woLWP: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">LWP</span>
                </label>
              </div>
            </div>

            {/* Sandwich Absence Rules — Holiday */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Sandwich Absence Rules — Holiday</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAbsentBefore} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAbsentBefore: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Absent Before Holiday</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAbsentAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAbsentAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Absent After Holiday</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAbsentBeforeAndAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAbsentBeforeAndAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Absent Before & After Holiday</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAddWorkingHrs} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAddWorkingHrs: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Add Working Hours On Holiday Day</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holLateDeductionNotApplied} onChange={e => setWoffHoffSettings({...woffHoffSettings, holLateDeductionNotApplied: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Late Deduction Not Applied On Holiday If Present</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holLWP} onChange={e => setWoffHoffSettings({...woffHoffSettings, holLWP: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">LWP</span>
                </label>
              </div>
            </div>

            {/* Leave Between Holiday Or Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Leave Between Holiday Or Weekly Off</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.considerWOInLeave} onChange={e => setWoffHoffSettings({...woffHoffSettings, considerWOInLeave: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Consider "Weekly Off" In Leave Application</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.considerHolInLeave} onChange={e => setWoffHoffSettings({...woffHoffSettings, considerHolInLeave: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Consider "Holiday" In Leave Application</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.absentWOLeaveWOAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, absentWOLeaveWOAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Absent — WO — Leave = WO Absent</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.leaveWOAbsentWOAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, leaveWOAbsentWOAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Leave — WO — Absent = WO Absent</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.absentHolLeaveHolAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, absentHolLeaveHolAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Absent — Holiday — Leave = Holiday Absent</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.leaveHolAbsentHolAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, leaveHolAbsentHolAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" />
                  <span className="text-sm font-medium text-gray-700">Leave — Holiday — Absent = Holiday Absent</span>
                </label>
              </div>
            </div>

            {/* Leave Settings */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Leave Settings</h3>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Leave In Cash</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveInCash" checked={woffHoffSettings.leaveInCash} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveInCash: true})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveInCash" checked={!woffHoffSettings.leaveInCash} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveInCash: false})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Leave Carry Forward</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveCarryForward" checked={woffHoffSettings.leaveCarryForward} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveCarryForward: true})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveCarryForward" checked={!woffHoffSettings.leaveCarryForward} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveCarryForward: false})} className="w-5 h-5 text-[#225091] focus:ring-[#225091]" />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'KRA Settings' && (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">KRA Settings (Yearly)</h3>
              
              <div className="flex flex-col gap-6">
                {kraSettings.targets.map((target, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Product</label>
                      <select value={target.product} onChange={e => {
                        const newTargets = [...kraSettings.targets];
                        newTargets[index].product = e.target.value;
                        setKraSettings({...kraSettings, targets: newTargets});
                      }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm">
                        <option value="">Select Product</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                        <option value="Loan Disbursement">Loan Disbursement</option>
                        <option value="Savings Account">Savings Account</option>
                        <option value="Current Account">Current Account</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Target</label>
                      <input type="number" min="0" value={target.targetValue} onChange={e => {
                        const newTargets = [...kraSettings.targets];
                        newTargets[index].targetValue = e.target.value;
                        setKraSettings({...kraSettings, targets: newTargets});
                      }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-sm" />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => setKraSettings({...kraSettings, targets: [...kraSettings.targets, { product: '', targetValue: 0 }]})} className="text-[#225091] font-semibold text-sm hover:underline flex items-center gap-1">
                    <span>+</span> Add More Target
                  </button>
                </div>
              </div>
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
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors bg-white shadow-xs"
            >
              Cancel
            </button>
          ) : (
            <button 
              type="button"
              onClick={handlePrevious} 
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors bg-white shadow-xs"
            >
              <ArrowLeft size={16} /> Previous
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isLastTab ? (
            <button 
              type="button"
              onClick={handleNext} 
              disabled={!isCurrentTabValid} 
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                isCurrentTabValid
                  ? 'bg-[#225091] hover:bg-[#163a6c] text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
              }`}
              title={!isCurrentTabValid ? "Please fill all required fields to proceed" : "Go to next step"}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleCreate} 
              disabled={submitting} 
              className="px-8 py-2.5 rounded-xl bg-[#225091] text-white font-bold hover:bg-[#163a6c] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
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
