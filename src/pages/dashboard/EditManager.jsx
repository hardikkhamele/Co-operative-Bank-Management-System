import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Camera, ChevronDown, Clock, Eye, EyeOff, Save, RefreshCw, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { branchService } from '../../api/branchService';
import { 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  sanitizeDigits, 
  preventInvalidNumberKeys 
} from '../../utils/validation';
import { ALL_KPA_PRODUCTS } from '../../utils/kpaConstants';

const EditManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const branchId = id || location.state?.branchId || location.state?.id || '';

  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States for all 6 HR Sections
  const [personal, setPersonal] = useState({
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    password: '',
    address: '',
    employeeCode: ''
  });

  const [job, setJob] = useState({
    designation: 'Branch Manager',
    department: 'Branch Operations',
    salary: '',
    joiningDate: '',
    probationPeriodMonths: 6
  });

  const [shift, setShift] = useState({
    punchInTime: '09:30',
    punchOutTime: '18:30',
    lateAllowedMinutes: 15,
    halfDayMinutes: 240,
    fullDayMinutes: 480,
    weeklyOff: 'Sunday'
  });

  const [attendance, setAttendance] = useState({
    punchMode: 'DOUBLE',
    noOutPunchAction: 'MARK_HALF_DAY',
    presentOnHolidayAction: 'MARK_COFF',
    overtimeAllowed: true,
    lateCutAllowed: true,
    earlyGoingAllowed: true
  });

  const [woffHoff, setWoffHoff] = useState({
    sandwichWeeklyOff: true,
    sandwichHoliday: true,
    holidayEncashment: false,
    includeWoInLeave: true,
    includeHolidayInLeave: true,
    compOffAllowed: true
  });

  const [kra, setKra] = useState({
    year: 2026,
    targets: [
      { product: 'Loan Disbursement', targetType: 'AMOUNT', targetValue: 1000000 },
      { product: 'Deposit Collection', targetType: 'AMOUNT', targetValue: 500000 }
    ]
  });

  // Load Manager Profile
  useEffect(() => {
    const fetchManager = async () => {
      if (!branchId) return;
      setLoading(true);
      try {
        const res = await branchService.getManagerProfile(branchId);
        if (res && (res.success || res.data)) {
          const data = res.data || res;
          const mgr = data.manager || data.rawManager || data;
          const p = mgr.personalDetails || mgr;
          const j = mgr.jobDetails || {};
          const s = mgr.shiftSettings || {};
          const a = mgr.attendanceSettings || {};
          const w = mgr.woffHoffSettings || {};
          const k = mgr.kraSettings || {};

          setPersonal({
            fullName: p.fullName || mgr.fullName || mgr.name || '',
            gender: (p.gender || 'MALE').toUpperCase(),
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
            phoneNumber: p.phoneNumber || mgr.phoneNumber || mgr.phone || '',
            email: p.email || mgr.email || '',
            password: '',
            address: p.address?.addressLine1 || p.address || '',
            employeeCode: mgr.employeeCode || ''
          });

          setJob({
            designation: j.designation || 'Branch Manager',
            department: j.department || 'Branch Operations',
            salary: j.salary || '',
            joiningDate: j.joiningDate ? j.joiningDate.split('T')[0] : '',
            probationPeriodMonths: j.probationPeriodMonths || 6
          });

          if (Object.keys(s).length > 0) {
            const rawWo = s.weeklyOff;
            const woString = typeof rawWo === 'object' && rawWo !== null ? rawWo.day || 'Sunday' : (Array.isArray(rawWo) ? rawWo[0] : (rawWo || 'Sunday'));
            setShift(prev => ({ ...prev, ...s, weeklyOff: woString }));
          }
          if (Object.keys(a).length > 0) {
            setAttendance(prev => ({ ...prev, ...a }));
          }
          if (Object.keys(w).length > 0) {
            setWoffHoff(prev => ({ ...prev, ...w }));
          }
          if (Object.keys(k).length > 0 && Array.isArray(k.targets)) {
            setKra({ year: k.year || 2026, targets: k.targets });
          }
        }
      } catch (err) {
        console.error("Failed to load manager profile for editing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [branchId]);

  // Section-by-section save handlers
  const handleSaveSection = async (sectionKey) => {
    if (!branchId) {
      toast.error("Invalid Branch ID.");
      return;
    }

    setSaving(true);
    try {
      if (sectionKey === 'personal') {
        if (!personal.fullName.trim()) {
          toast.error("Manager full name is required.");
          setSaving(false);
          return;
        }
        const emailErr = validateEmail(personal.email).error;
        if (emailErr) {
          toast.error(emailErr);
          setSaving(false);
          return;
        }
        const phoneErr = validatePhone(personal.phoneNumber).error;
        if (phoneErr) {
          toast.error(phoneErr);
          setSaving(false);
          return;
        }
        if (personal.password) {
          const passErr = validatePassword(personal.password, { minLength: 6 }).error;
          if (passErr) {
            toast.error(passErr);
            setSaving(false);
            return;
          }
        }

        await branchService.updateManagerPersonalDetails(branchId, personal);
        toast.success("Personal details updated successfully!");
      } 
      else if (sectionKey === 'job') {
        await branchService.updateManagerJobDetails(branchId, {
          ...job,
          salary: Number(job.salary) || 0
        });
        toast.success("Job details updated successfully!");
      } 
      else if (sectionKey === 'shift') {
        await branchService.updateManagerShiftSettings(branchId, shift);
        toast.success("Shift & Timing settings updated successfully!");
      } 
      else if (sectionKey === 'attendance') {
        await branchService.updateManagerAttendanceSettings(branchId, attendance);
        toast.success("Attendance settings updated successfully!");
      } 
      else if (sectionKey === 'woff') {
        await branchService.updateManagerWoffHoffSettings(branchId, woffHoff);
        toast.success("WOFF & HOFF rules updated successfully!");
      } 
      else if (sectionKey === 'kra') {
        await branchService.updateManagerKraSettings(branchId, kra);
        toast.success("KRA Target settings updated successfully!");
      }
    } catch (err) {
      console.error(`Failed to update manager ${sectionKey}:`, err);
      toast.error(err.response?.data?.message || `Failed to update ${sectionKey} details.`);
    } finally {
      setSaving(false);
    }
  };

  // Full Profile Save
  const handleSaveAll = async () => {
    if (!branchId) {
      toast.error("Invalid Branch ID.");
      return;
    }

    if (!personal.fullName.trim()) {
      setActiveTab('personal');
      toast.error("Manager full name is required.");
      return;
    }

    setSaving(true);
    try {
      const fullPayload = {
        fullName: personal.fullName,
        email: personal.email,
        phoneNumber: personal.phoneNumber,
        password: personal.password || undefined,
        employeeCode: personal.employeeCode,
        personalDetails: personal,
        jobDetails: {
          ...job,
          salary: Number(job.salary) || 0
        },
        shiftSettings: shift,
        attendanceSettings: attendance,
        woffHoffSettings: woffHoff,
        kraSettings: kra
      };

      await branchService.updateManagerProfile(branchId, fullPayload);
      toast.success("Branch Manager profile updated completely!");
      navigate('/branch');
    } catch (err) {
      console.error("Failed to update full manager profile:", err);
      toast.error(err.response?.data?.message || "Failed to update manager profile.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'job', label: 'Job Details' },
    { id: 'shift', label: 'Shift & Timings' },
    { id: 'attendance', label: 'Attendance Rules' },
    { id: 'woff', label: 'WOFF & HOFF' },
    { id: 'kra', label: 'KRA Targets' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans antialiased pb-16">
      {/* Header Card */}
      <PageHeader
        title="Edit Branch Manager"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Branch Management', to: '/branch' },
          { label: 'Edit Manager' }
        ]}
        showBack={true}
        backUrl={location.state?.from || "/branch"}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white text-[#225091] shadow-2xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Personal Details Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Personal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={personal.fullName}
                  onChange={e => setPersonal(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter manager full name" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Gender</label>
                <select 
                  value={personal.gender}
                  onChange={e => setPersonal(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  value={personal.dateOfBirth}
                  onChange={e => setPersonal(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Employee Code</label>
                <input 
                  type="text" 
                  value={personal.employeeCode}
                  onChange={e => setPersonal(prev => ({ ...prev, employeeCode: e.target.value }))}
                  placeholder="e.g. BM-MUM-101" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  value={personal.phoneNumber}
                  maxLength={10}
                  onKeyDown={preventInvalidNumberKeys}
                  onChange={e => setPersonal(prev => ({ ...prev, phoneNumber: sanitizeDigits(e.target.value) }))}
                  placeholder="10-digit phone number" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address *</label>
                <input 
                  type="email" 
                  value={personal.email}
                  onChange={e => setPersonal(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="manager@societybank.com" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Reset Password (Optional)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={personal.password}
                    onChange={e => setPersonal(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave blank to keep unchanged" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Residential Address</label>
                <input 
                  type="text" 
                  value={personal.address}
                  onChange={e => setPersonal(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter full address" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => handleSaveSection('personal')}
                disabled={saving}
                className="bg-[#225091] hover:bg-[#193e6f] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} /> Save Personal Details
              </button>
            </div>
          </div>
        )}

        {/* 2. Job Details Tab */}
        {activeTab === 'job' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Job Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Designation</label>
                <input 
                  type="text" 
                  value={job.designation}
                  onChange={e => setJob(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Department</label>
                <input 
                  type="text" 
                  value={job.department}
                  onChange={e => setJob(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Salary (₹ Monthly)</label>
                <input 
                  type="number" 
                  value={job.salary}
                  onKeyDown={preventInvalidNumberKeys}
                  onChange={e => setJob(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g. 75000" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Joining Date</label>
                <input 
                  type="date" 
                  value={job.joiningDate}
                  onChange={e => setJob(prev => ({ ...prev, joiningDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Probation Period (Months)</label>
                <input 
                  type="number" 
                  value={job.probationPeriodMonths}
                  onChange={e => setJob(prev => ({ ...prev, probationPeriodMonths: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => handleSaveSection('job')}
                disabled={saving}
                className="bg-[#225091] hover:bg-[#193e6f] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} /> Save Job Details
              </button>
            </div>
          </div>
        )}

        {/* 3. Shift Settings Tab */}
        {activeTab === 'shift' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Shift & Timings Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Punch In Time</label>
                <input 
                  type="time" 
                  value={shift.punchInTime}
                  onChange={e => setShift(prev => ({ ...prev, punchInTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Punch Out Time</label>
                <input 
                  type="time" 
                  value={shift.punchOutTime}
                  onChange={e => setShift(prev => ({ ...prev, punchOutTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Late Allowed Grace (Minutes)</label>
                <input 
                  type="number" 
                  value={shift.lateAllowedMinutes}
                  onChange={e => setShift(prev => ({ ...prev, lateAllowedMinutes: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Half Day Threshold (Minutes)</label>
                <input 
                  type="number" 
                  value={shift.halfDayMinutes}
                  onChange={e => setShift(prev => ({ ...prev, halfDayMinutes: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Weekly Off Day</label>
                <select 
                  value={Array.isArray(shift.weeklyOff) ? shift.weeklyOff[0] : (shift.weeklyOff || 'Sunday')}
                  onChange={e => setShift(prev => ({ ...prev, weeklyOff: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer"
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Friday">Friday</option>
                  <option value="Monday">Monday</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => handleSaveSection('shift')}
                disabled={saving}
                className="bg-[#225091] hover:bg-[#193e6f] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} /> Save Shift Settings
              </button>
            </div>
          </div>
        )}

        {/* 4. Attendance Settings Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Attendance & Penalty Rules</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Punch Mode</label>
                <select 
                  value={attendance.punchMode}
                  onChange={e => setAttendance(prev => ({ ...prev, punchMode: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer"
                >
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE (In & Out)</option>
                  <option value="MULTIPLE">MULTIPLE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">No Out-Punch Action</label>
                <select 
                  value={attendance.noOutPunchAction}
                  onChange={e => setAttendance(prev => ({ ...prev, noOutPunchAction: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer"
                >
                  <option value="MARK_HALF_DAY">Mark Half Day</option>
                  <option value="MARK_ABSENT">Mark Absent</option>
                  <option value="NO_ACTION">No Action</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="overtimeAllowed"
                  checked={attendance.overtimeAllowed}
                  onChange={e => setAttendance(prev => ({ ...prev, overtimeAllowed: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091] cursor-pointer"
                />
                <label htmlFor="overtimeAllowed" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Enable Overtime Compensation
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="lateCutAllowed"
                  checked={attendance.lateCutAllowed}
                  onChange={e => setAttendance(prev => ({ ...prev, lateCutAllowed: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091] cursor-pointer"
                />
                <label htmlFor="lateCutAllowed" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Apply Late Cut Deduction Policy
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => handleSaveSection('attendance')}
                disabled={saving}
                className="bg-[#225091] hover:bg-[#193e6f] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} /> Save Attendance Settings
              </button>
            </div>
          </div>
        )}

        {/* 5. WOFF & HOFF Tab */}
        {activeTab === 'woff' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Weekly Off & Holiday Rules</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={woffHoff.sandwichWeeklyOff}
                  onChange={e => setWoffHoff(prev => ({ ...prev, sandwichWeeklyOff: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                />
                <span className="text-xs font-bold text-gray-800">Sandwich Absence on Weekly Off</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={woffHoff.sandwichHoliday}
                  onChange={e => setWoffHoff(prev => ({ ...prev, sandwichHoliday: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                />
                <span className="text-xs font-bold text-gray-800">Sandwich Absence on Holidays</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={woffHoff.holidayEncashment}
                  onChange={e => setWoffHoff(prev => ({ ...prev, holidayEncashment: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                />
                <span className="text-xs font-bold text-gray-800">Allow Holiday Encashment</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={woffHoff.compOffAllowed}
                  onChange={e => setWoffHoff(prev => ({ ...prev, compOffAllowed: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                />
                <span className="text-xs font-bold text-gray-800">Enable Compensatory Off Entitlement</span>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => handleSaveSection('woff')}
                disabled={saving}
                className="bg-[#225091] hover:bg-[#193e6f] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} /> Save WOFF / HOFF Rules
              </button>
            </div>
          </div>
        )}

        {/* 6. KRA Settings Tab */}
        {activeTab === 'kra' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">KRA Target Targets</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Year:</span>
                <select 
                  value={kra.year}
                  onChange={e => setKra(prev => ({ ...prev, year: Number(e.target.value) }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 bg-white"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {kra.targets.map((tgt, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-slate-50 border border-gray-100 rounded-xl">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Product</label>
                    <select 
                      value={tgt.product}
                      onChange={e => {
                        const val = e.target.value;
                        setKra(prev => {
                          const updated = [...prev.targets];
                          updated[idx].product = val;
                          return { ...prev, targets: updated };
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-800 bg-white"
                    >
                      {ALL_KPA_PRODUCTS.map(p => {
                        const pName = typeof p === 'object' && p !== null ? p.name : p;
                        return (
                          <option key={pName} value={pName}>{pName}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-32">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Target Type</label>
                    <select 
                      value={tgt.targetType}
                      onChange={e => {
                        const val = e.target.value;
                        setKra(prev => {
                          const updated = [...prev.targets];
                          updated[idx].targetType = val;
                          return { ...prev, targets: updated };
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-800 bg-white"
                    >
                      <option value="AMOUNT">AMOUNT (₹)</option>
                      <option value="COUNT">COUNT</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Target Value</label>
                    <input 
                      type="number" 
                      value={tgt.targetValue}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setKra(prev => {
                          const updated = [...prev.targets];
                          updated[idx].targetValue = val;
                          return { ...prev, targets: updated };
                        });
                      }}
                      placeholder="e.g. 500000"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-800 bg-white"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setKra(prev => ({
                        ...prev,
                        targets: prev.targets.filter((_, i) => i !== idx)
                      }));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center mt-2 sm:mt-5"
                    title="Remove Target"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button 
                type="button"
                onClick={() => {
                  setKra(prev => ({
                    ...prev,
                    targets: [...prev.targets, { product: 'Loan Disbursement', targetType: 'AMOUNT', targetValue: 500000 }]
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#225091] bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Product Target
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => handleSaveSection('kra')}
                disabled={saving}
                className="bg-[#225091] hover:bg-[#193e6f] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} /> Save KRA Targets
              </button>
            </div>
          </div>
        )}

        {/* Global Save All Bar */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
          <Link 
            to="/branch"
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </Link>
          <button 
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-[#225091] hover:bg-[#173b6a] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> {saving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditManager;
