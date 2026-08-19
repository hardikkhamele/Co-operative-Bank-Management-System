import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, Calendar, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';
import { 
  validatePassword, 
  validatePhone, 
  validateEmail, 
  sanitizeDigits, 
  preventInvalidNumberKeys,
  validatePositiveNumber 
} from '../../utils/validation';

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic Options
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);

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
    fetchOptions();
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
    targets: [{ product: 'Fixed Deposit', targetValue: 2400000 }, { product: 'Loan Disbursement', targetValue: 2400000 }, { product: 'Savings Account', targetValue: 1200 }]
  });

  const handleCreate = async () => {
    if (!personalDetails.fullName?.trim()) {
      toast.error("Full Name is required.");
      setActiveTab('Personal Details');
      return;
    }

    const emailCheck = validateEmail(personalDetails.email);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error);
      setActiveTab('Personal Details');
      return;
    }

    const passCheck = validatePassword(personalDetails.password, { minLength: 6 });
    if (!passCheck.isValid) {
      toast.error(passCheck.error);
      setActiveTab('Personal Details');
      return;
    }

    if (personalDetails.phoneNumber) {
      const phoneCheck = validatePhone(personalDetails.phoneNumber, { required: false });
      if (!phoneCheck.isValid) {
        toast.error(phoneCheck.error);
        setActiveTab('Personal Details');
        return;
      }
    }

    if (!jobDetails.roleId || !jobDetails.branchId) {
      toast.error("Role and Branch are required in Job Details.");
      setActiveTab('Job Details');
      return;
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

  const tabs = ['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF & HOFF', 'KRA Settings'];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#4285F4] mb-2">Create Employee</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/employees" className="hover:text-gray-700">Employees</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[#1B58A6]">Create Employee</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab ? 'bg-[#e9e8fa] text-[#1b2559]' : 'text-gray-500 bg-white hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10">
        {activeTab === 'Personal Details' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">General Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={personalDetails.fullName} 
                  onChange={e => setPersonalDetails({...personalDetails, fullName: e.target.value})} 
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email *</label>
                <input 
                  type="email" 
                  value={personalDetails.email} 
                  onChange={e => setPersonalDetails({...personalDetails, email: e.target.value})} 
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={personalDetails.password} 
                    onChange={e => setPersonalDetails({...personalDetails, password: e.target.value})} 
                    placeholder="Minimum 6 characters"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
                <input 
                  type="tel" 
                  value={personalDetails.phoneNumber} 
                  onChange={e => setPersonalDetails({...personalDetails, phoneNumber: sanitizeDigits(e.target.value, 10)})} 
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                <select value={personalDetails.gender} onChange={e => setPersonalDetails({...personalDetails, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth</label>
                <input type="date" value={personalDetails.dateOfBirth} onChange={e => setPersonalDetails({...personalDetails, dateOfBirth: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
                <input type="text" value={personalDetails.address} onChange={e => setPersonalDetails({...personalDetails, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Job Details' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Employment Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Branch *</label>
                <select value={jobDetails.branchId} onChange={e => setJobDetails({...jobDetails, branchId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Department *</label>
                <select value={jobDetails.roleId} onChange={e => setJobDetails({...jobDetails, roleId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
                  <option value="">Select Department</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Designation</label>
                <input type="text" value={jobDetails.designation} onChange={e => setJobDetails({...jobDetails, designation: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                <input type="text" value={jobDetails.state} onChange={e => setJobDetails({...jobDetails, state: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Salary (Monthly)</label>
                <input type="number" min="0" value={jobDetails.salary} onChange={e => setJobDetails({...jobDetails, salary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Joining Date</label>
                <input type="date" value={jobDetails.joiningDate} onChange={e => setJobDetails({...jobDetails, joiningDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Probation Period (Months)</label>
                <input type="number" min="0" value={jobDetails.probationPeriodMonths} onChange={e => setJobDetails({...jobDetails, probationPeriodMonths: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Keeping other tabs simple for payload structure */}
        {activeTab === 'Shift & WOFF' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Shift</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch In Time</label>
                    <input type="time" value={shiftSettings.punchInTime} onChange={e => setShiftSettings({...shiftSettings, punchInTime: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch Out Time</label>
                    <input type="time" value={shiftSettings.punchOutTime} onChange={e => setShiftSettings({...shiftSettings, punchOutTime: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Weekly Off Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Off</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Weekly Off Day</label>
                    <select value={shiftSettings.weeklyOffDay} onChange={e => setShiftSettings({...shiftSettings, weeklyOffDay: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
                      <option value="">Select</option>
                      <option value="SUNDAY">Sunday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                    <input type="checkbox" checked={shiftSettings.weeklyOffPayable} onChange={e => setShiftSettings({...shiftSettings, weeklyOffPayable: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Weekly Off Payable</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={shiftSettings.variableWeeklyOff} onChange={e => setShiftSettings({...shiftSettings, variableWeeklyOff: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Variable Weekly Off</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={shiftSettings.secondWeeklyOff} onChange={e => setShiftSettings({...shiftSettings, secondWeeklyOff: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
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
                  <input type="number" min="0" value={shiftSettings.lateAllowedMins} onChange={e => setShiftSettings({...shiftSettings, lateAllowedMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.lateAllowedAsPerShift} onChange={e => setShiftSettings({...shiftSettings, lateAllowedAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Early Allowed (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.earlyAllowedMins} onChange={e => setShiftSettings({...shiftSettings, earlyAllowedMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.earlyAllowedAsPerShift} onChange={e => setShiftSettings({...shiftSettings, earlyAllowedAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Half Day (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.halfDayMins} onChange={e => setShiftSettings({...shiftSettings, halfDayMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.halfDayAsPerShift} onChange={e => setShiftSettings({...shiftSettings, halfDayAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Full Day (Mins)</label>
                  <input type="number" min="0" value={shiftSettings.fullDayMins} onChange={e => setShiftSettings({...shiftSettings, fullDayMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm mb-3" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shiftSettings.fullDayAsPerShift} onChange={e => setShiftSettings({...shiftSettings, fullDayAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
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
                        <input type="radio" name="punchType" value="SINGLE" checked={attendanceSettings.punchType === 'SINGLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                        <span className="text-sm text-gray-700">Single</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="DOUBLE" checked={attendanceSettings.punchType === 'DOUBLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                        <span className="text-sm text-gray-700">Double</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="punchType" value="MULTIPLE" checked={attendanceSettings.punchType === 'MULTIPLE'} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                        <span className="text-sm text-gray-700">Multiple</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">No Out-Punch Found — Action</label>
                    <select value={attendanceSettings.noOutPunchAction} onChange={e => setAttendanceSettings({...attendanceSettings, noOutPunchAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
                      <option value="">Select</option>
                      <option value="MARK_HALF_DAY">Mark Half Day</option>
                      <option value="MARK_ABSENT">Mark Absent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Present On WO / Holiday — Action</label>
                    <select value={attendanceSettings.presentOnWeeklyOffHolidayAction} onChange={e => setAttendanceSettings({...attendanceSettings, presentOnWeeklyOffHolidayAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
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
                      <input type="number" min="0" value={attendanceSettings.lateCutAllowedDays} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAllowedDays: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Action</label>
                      <select value={attendanceSettings.lateCutAction} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
                        <option value="">Select</option>
                        <option value="MARK_HALF_DAY">Mark Half Day</option>
                        <option value="MARK_ABSENT">Mark Absent</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                    <input type="checkbox" checked={attendanceSettings.lateCutAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, lateCutAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Late Cut Allowed</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.extraLateCutDeduction} onChange={e => setAttendanceSettings({...attendanceSettings, extraLateCutDeduction: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Extra Late Cut Deduction</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.additionalLateCutInLeaveBalance} onChange={e => setAttendanceSettings({...attendanceSettings, additionalLateCutInLeaveBalance: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
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
                      <input type="number" min="0" value={attendanceSettings.lunchAllowedMins} onChange={e => setAttendanceSettings({...attendanceSettings, lunchAllowedMins: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pb-3">
                      <input type="checkbox" checked={attendanceSettings.lunchAsPerShift} onChange={e => setAttendanceSettings({...attendanceSettings, lunchAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-sm font-medium text-gray-600">As Per Shift</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.lunchAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, lunchAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Lunch Allowed</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.earlyGoingAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, earlyGoingAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Early Going Allowed</span>
                  </label>
                </div>
              </div>

              {/* Overtime Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Overtime</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.overtimeAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, overtimeAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">Overtime Allowed</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={attendanceSettings.customOT} onChange={e => setAttendanceSettings({...attendanceSettings, customOT: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-sm font-medium text-gray-700">Custom OT</span>
                    </label>
                    <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={attendanceSettings.beforeOT} onChange={e => setAttendanceSettings({...attendanceSettings, beforeOT: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-sm font-medium text-gray-700">Before OT</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">OT Grace Period (Mins)</label>
                      <input type="number" min="0" value={attendanceSettings.gracePeriodMinutes} onChange={e => setAttendanceSettings({...attendanceSettings, gracePeriodMinutes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">1 Day OT Hrs</label>
                      <input type="number" min="0" value={attendanceSettings.oneDayOTHrs} onChange={e => setAttendanceSettings({...attendanceSettings, oneDayOTHrs: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                    <input type="checkbox" checked={attendanceSettings.otAsPerShift} onChange={e => setAttendanceSettings({...attendanceSettings, otAsPerShift: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                    <span className="text-sm font-medium text-gray-700">OT As Per Shift</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={attendanceSettings.considerOTAsCOFF} onChange={e => setAttendanceSettings({...attendanceSettings, considerOTAsCOFF: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
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
                  <input type="checkbox" checked={woffHoffSettings.woAbsentBefore} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAbsentBefore: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Absent Before Weekly Off</span>
                    <span className="block text-xs text-gray-500 mt-1">Mark Absent If Employee Absent The Day Before WO.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAbsentAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAbsentAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Absent After Weekly Off</span>
                    <span className="block text-xs text-gray-500 mt-1">Mark Absent If Employee Absent The Day After WO.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAbsentBeforeOrAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAbsentBeforeOrAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Absent Before Or After Weekly Off</span>
                    <span className="block text-xs text-gray-500 mt-1">Either Side Triggers WO Absent.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woAddWorkingHrs} onChange={e => setWoffHoffSettings({...woffHoffSettings, woAddWorkingHrs: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Add Working Hrs On Weekly Off Day</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woLateDeductionNotApplied} onChange={e => setWoffHoffSettings({...woffHoffSettings, woLateDeductionNotApplied: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Late Deduction Not Applied On WO If Present</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.woLWP} onChange={e => setWoffHoffSettings({...woffHoffSettings, woLWP: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">LWP</span>
                </label>
              </div>
            </div>

            {/* Sandwich Absence Rules — Holiday */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Sandwich Absence Rules — Holiday</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAbsentBefore} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAbsentBefore: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Absent Before Holiday</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAbsentAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAbsentAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Absent After Holiday</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAbsentBeforeAndAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAbsentBeforeAndAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Absent Before & After Holiday</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holAddWorkingHrs} onChange={e => setWoffHoffSettings({...woffHoffSettings, holAddWorkingHrs: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Add Working Hours On Holiday Day</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holLateDeductionNotApplied} onChange={e => setWoffHoffSettings({...woffHoffSettings, holLateDeductionNotApplied: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Late Deduction Not Applied On Holiday If Present</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.holLWP} onChange={e => setWoffHoffSettings({...woffHoffSettings, holLWP: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">LWP</span>
                </label>
              </div>
            </div>

            {/* Leave Between Holiday Or Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Leave Between Holiday Or Weekly Off</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.considerWOInLeave} onChange={e => setWoffHoffSettings({...woffHoffSettings, considerWOInLeave: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Consider "Weekly Off" In Leave Application</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.considerHolInLeave} onChange={e => setWoffHoffSettings({...woffHoffSettings, considerHolInLeave: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Consider "Holiday" In Leave Application</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.absentWOLeaveWOAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, absentWOLeaveWOAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Absent — WO — Leave = WO Absent</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.leaveWOAbsentWOAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, leaveWOAbsentWOAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Leave — WO — Absent = WO Absent</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.absentHolLeaveHolAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, absentHolLeaveHolAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                  <span className="text-sm font-medium text-gray-700">Absent — Holiday — Leave = Holiday Absent</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={woffHoffSettings.leaveHolAbsentHolAbsent} onChange={e => setWoffHoffSettings({...woffHoffSettings, leaveHolAbsentHolAbsent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
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
                      <input type="radio" name="leaveInCash" checked={woffHoffSettings.leaveInCash} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveInCash: true})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveInCash" checked={!woffHoffSettings.leaveInCash} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveInCash: false})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Leave Carry Forward</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveCarryForward" checked={woffHoffSettings.leaveCarryForward} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveCarryForward: true})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveCarryForward" checked={!woffHoffSettings.leaveCarryForward} onChange={() => setWoffHoffSettings({...woffHoffSettings, leaveCarryForward: false})} className="w-5 h-5 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
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
                      }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm">
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
                      }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] bg-white text-sm" />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => setKraSettings({...kraSettings, targets: [...kraSettings.targets, { product: '', targetValue: 0 }]})} className="text-[#1D4ED8] font-semibold text-sm hover:underline flex items-center gap-1">
                    <span>+</span> Add More Target
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Buttons */}
      <div className="flex justify-end gap-4 mt-2">
        <button onClick={() => navigate('/employees')} className="px-8 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors bg-white shadow-sm">
          Cancel
        </button>
        <button onClick={handleCreate} disabled={submitting} className="px-8 py-2.5 rounded-full bg-[#1D4ED8] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm disabled:opacity-50 flex items-center">
          {submitting ? 'Creating...' : 'Finish & Create'}
        </button>
      </div>
    </div>
  );
};

export default CreateEmployee;
