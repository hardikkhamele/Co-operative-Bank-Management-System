import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, Clock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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

const CreateManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [branches, setBranches] = useState([]);

  // Form States for creation
  const [personal, setPersonal] = useState({
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    password: '',
    address: '',
    employeeCode: '',
    branchId: ''
  });

  const [job, setJob] = useState({
    designation: 'Branch Manager',
    department: 'Branch Operations',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
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

  // Load branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.getDropdownList();
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          setBranches(list);
          if (list.length > 0 && !personal.branchId) {
            setPersonal(prev => ({ ...prev, branchId: list[0].id || list[0].branchId || '' }));
          }
        }
      } catch (err) {
        console.error("Failed to load branches for manager creation:", err);
      }
    };
    fetchBranches();
  }, []);

  const handleCreate = async () => {
    if (!personal.fullName.trim()) {
      setActiveTab('personal');
      toast.error("Manager full name is required.");
      return;
    }
    const emailErr = validateEmail(personal.email).error;
    if (emailErr) {
      setActiveTab('personal');
      toast.error(emailErr);
      return;
    }
    const phoneErr = validatePhone(personal.phoneNumber).error;
    if (phoneErr) {
      setActiveTab('personal');
      toast.error(phoneErr);
      return;
    }
    if (personal.password) {
      const passErr = validatePassword(personal.password, { minLength: 6 }).error;
      if (passErr) {
        setActiveTab('personal');
        toast.error(passErr);
        return;
      }
    }

    setSubmitting(true);
    try {
      const selectedBranchObj = branches.find(b => (b.id || b.branchId) === personal.branchId);

      const payload = {
        branch: {
          name: selectedBranchObj?.name || selectedBranchObj?.branchName || `${personal.fullName}'s Branch`,
          code: selectedBranchObj?.code || `BM-${Date.now().toString().slice(-4)}`,
          email: personal.email,
          phoneNumber: personal.phoneNumber,
          state: selectedBranchObj?.state || 'Maharashtra',
          cardStock: 100,
          verificationCredits: 50,
          address: {
            addressLine1: personal.address || 'Branch Office',
            city: selectedBranchObj?.city || 'Mumbai',
            state: selectedBranchObj?.state || 'Maharashtra',
            pincode: '400001'
          }
        },
        manager: {
          fullName: personal.fullName,
          email: personal.email,
          phoneNumber: personal.phoneNumber,
          password: personal.password || 'Password@123',
          employeeCode: personal.employeeCode || `BM-${Date.now().toString().slice(-4)}`,
          personalDetails: personal,
          jobDetails: {
            ...job,
            salary: Number(job.salary) || 0
          },
          shiftSettings: shift,
          attendanceSettings: attendance,
          woffHoffSettings: woffHoff,
          kraSettings: kra
        }
      };

      await branchService.create(payload);
      toast.success("Branch Manager and Branch created successfully!");
      navigate('/branch');
    } catch (err) {
      console.error("Failed to create manager:", err);
      toast.error(err.response?.data?.message || "Failed to create manager.");
    } finally {
      setSubmitting(false);
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
        title="Create Branch Manager"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Branch Management', to: '/branch' },
          { label: 'Create Manager' }
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={personal.password}
                    onChange={e => setPersonal(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter secure password" 
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Weekly Off Day</label>
                <select 
                  value={shift.weeklyOff}
                  onChange={e => setShift(prev => ({ ...prev, weeklyOff: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-sm text-gray-800 bg-white cursor-pointer"
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4. Attendance Tab */}
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
            </div>
          </div>
        )}

        {/* 5. WOFF / HOFF Tab */}
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
            </div>
          </div>
        )}

        {/* 6. KRA Tab */}
        {activeTab === 'kra' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">KRA Target Settings</h3>
            
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

                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Target Value (₹)</label>
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
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-800 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
          <Link 
            to="/branch"
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </Link>
          <button 
            onClick={handleCreate}
            disabled={submitting}
            className="bg-[#225091] hover:bg-[#173b6a] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> {submitting ? "Creating Manager..." : "Create Branch Manager"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateManager;
