import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, Calendar, ChevronDown } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [submitting, setSubmitting] = useState(false);

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
    punchInTime: '09:30', punchOutTime: '18:30', weeklyOffDay: 'SUNDAY', weeklyOffPayable: true
  });
  const [attendanceSettings, setAttendanceSettings] = useState({
    punchType: 'DOUBLE', noOutPunchAction: 'MARK_HALF_DAY', presentOnWeeklyOffHolidayAction: 'EXTRA_PAY', overtimeAllowed: false, gracePeriodMinutes: 0
  });
  const [woffHoffSettings, setWoffHoffSettings] = useState({
    absentBefore: true, absentAfter: false, leaveEncashmentAllowed: true, carryForwardAllowed: true
  });
  const [kraSettings, setKraSettings] = useState({
    year: new Date().getFullYear(),
    targets: [{ product: 'Home Loan', targetType: 'AMOUNT', targetValue: 5000000 }]
  });

  const handleCreate = async () => {
    if (!personalDetails.fullName || !personalDetails.email || !personalDetails.password) {
      alert("Name, Email, and Password are required in Personal Details.");
      setActiveTab('Personal Details');
      return;
    }
    if (!jobDetails.roleId || !jobDetails.branchId) {
      alert("Role and Branch are required in Job Details.");
      setActiveTab('Job Details');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        personalDetails: { ...personalDetails },
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
            payable: shiftSettings.weeklyOffPayable
          }
        },
        attendanceSettings: {
          punchType: attendanceSettings.punchType,
          noOutPunchAction: attendanceSettings.noOutPunchAction,
          presentOnWeeklyOffHolidayAction: attendanceSettings.presentOnWeeklyOffHolidayAction,
          overtime: {
            allowed: attendanceSettings.overtimeAllowed,
            gracePeriodMinutes: Math.max(0, Number(attendanceSettings.gracePeriodMinutes) || 0)
          }
        },
        woffHoffSettings: {
          weeklyOffRules: { absentBefore: woffHoffSettings.absentBefore, absentAfter: woffHoffSettings.absentAfter },
          leaveSettings: { leaveEncashmentAllowed: woffHoffSettings.leaveEncashmentAllowed, carryForwardAllowed: woffHoffSettings.carryForwardAllowed }
        },
        kraSettings: {
          year: Math.max(2000, Number(kraSettings.year)),
          targets: kraSettings.targets.map(t => ({ ...t, targetValue: Math.max(0, Number(t.targetValue) || 0) }))
        }
      };

      const response = await employeeService.create(payload);
      if (response.success) {
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
            <span className="text-[#5a5ce5]">Create Employee</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/employees')} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={submitting} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center">
            {submitting ? 'Creating...' : 'Finish & Create'}
          </button>
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
                <input type="text" value={personalDetails.fullName} onChange={e => setPersonalDetails({...personalDetails, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email *</label>
                <input type="email" value={personalDetails.email} onChange={e => setPersonalDetails({...personalDetails, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password *</label>
                <input type="text" value={personalDetails.password} onChange={e => setPersonalDetails({...personalDetails, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
                <input type="text" value={personalDetails.phoneNumber} onChange={e => setPersonalDetails({...personalDetails, phoneNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                <select value={personalDetails.gender} onChange={e => setPersonalDetails({...personalDetails, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm">
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth</label>
                <input type="date" value={personalDetails.dateOfBirth} onChange={e => setPersonalDetails({...personalDetails, dateOfBirth: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
                <input type="text" value={personalDetails.address} onChange={e => setPersonalDetails({...personalDetails, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
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
                <select value={jobDetails.branchId} onChange={e => setJobDetails({...jobDetails, branchId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Role *</label>
                <select value={jobDetails.roleId} onChange={e => setJobDetails({...jobDetails, roleId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm">
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Designation</label>
                <input type="text" value={jobDetails.designation} onChange={e => setJobDetails({...jobDetails, designation: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                <input type="text" value={jobDetails.state} onChange={e => setJobDetails({...jobDetails, state: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Salary (Monthly)</label>
                <input type="number" min="0" value={jobDetails.salary} onChange={e => setJobDetails({...jobDetails, salary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Joining Date</label>
                <input type="date" value={jobDetails.joiningDate} onChange={e => setJobDetails({...jobDetails, joiningDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Probation Period (Months)</label>
                <input type="number" min="0" value={jobDetails.probationPeriodMonths} onChange={e => setJobDetails({...jobDetails, probationPeriodMonths: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Keeping other tabs simple for payload structure */}
        {activeTab === 'Shift & WOFF' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Shift Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Punch In Time</label>
                <input type="time" value={shiftSettings.punchInTime} onChange={e => setShiftSettings({...shiftSettings, punchInTime: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Punch Out Time</label>
                <input type="time" value={shiftSettings.punchOutTime} onChange={e => setShiftSettings({...shiftSettings, punchOutTime: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Weekly Off Day</label>
                <select value={shiftSettings.weeklyOffDay} onChange={e => setShiftSettings({...shiftSettings, weeklyOffDay: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm">
                  <option value="SUNDAY">Sunday</option>
                  <option value="SATURDAY">Saturday</option>
                  <option value="MONDAY">Monday</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <input type="checkbox" checked={shiftSettings.weeklyOffPayable} onChange={e => setShiftSettings({...shiftSettings, weeklyOffPayable: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" />
                <label className="text-sm font-semibold text-gray-800">Is Weekly Off Payable?</label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Punch Type</label>
                <select value={attendanceSettings.punchType} onChange={e => setAttendanceSettings({...attendanceSettings, punchType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm">
                  <option value="SINGLE">Single Punch</option>
                  <option value="DOUBLE">Double Punch</option>
                  <option value="MULTIPLE">Multiple Punch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Missing Out Punch Action</label>
                <select value={attendanceSettings.noOutPunchAction} onChange={e => setAttendanceSettings({...attendanceSettings, noOutPunchAction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm">
                  <option value="MARK_HALF_DAY">Mark Half Day</option>
                  <option value="MARK_ABSENT">Mark Absent</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <input type="checkbox" checked={attendanceSettings.overtimeAllowed} onChange={e => setAttendanceSettings({...attendanceSettings, overtimeAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" />
                <label className="text-sm font-semibold text-gray-800">Overtime Allowed?</label>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'WOFF & HOFF' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">WOFF / HOFF Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={woffHoffSettings.absentBefore} onChange={e => setWoffHoffSettings({...woffHoffSettings, absentBefore: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" />
                  <span className="text-sm font-semibold text-gray-800">Deduct if Absent Before WOFF</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={woffHoffSettings.absentAfter} onChange={e => setWoffHoffSettings({...woffHoffSettings, absentAfter: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" />
                  <span className="text-sm font-semibold text-gray-800">Deduct if Absent After WOFF</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={woffHoffSettings.leaveEncashmentAllowed} onChange={e => setWoffHoffSettings({...woffHoffSettings, leaveEncashmentAllowed: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" />
                  <span className="text-sm font-semibold text-gray-800">Leave Encashment Allowed</span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'KRA Settings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">KRA Targets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Year</label>
                <input type="number" min="2000" value={kraSettings.year} onChange={e => setKraSettings({...kraSettings, year: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Product Name</label>
                <input type="text" value={kraSettings.targets[0].product} onChange={e => {
                  const t = [...kraSettings.targets];
                  t[0].product = e.target.value;
                  setKraSettings({...kraSettings, targets: t});
                }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Target Amount</label>
                <input type="number" min="0" value={kraSettings.targets[0].targetValue} onChange={e => {
                  const t = [...kraSettings.targets];
                  t[0].targetValue = e.target.value;
                  setKraSettings({...kraSettings, targets: t});
                }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEmployee;
