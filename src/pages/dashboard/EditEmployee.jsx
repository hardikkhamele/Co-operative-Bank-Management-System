import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Camera, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [loading, setLoading] = useState(true);
  const [submittingTab, setSubmittingTab] = useState(null);
  
  // Dynamic Options
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [empRes, bRes, rRes] = await Promise.all([
          employeeService.getById(id),
          branchService.list({ limit: 100 }),
          roleService.list({ limit: 100 })
        ]);

        if (bRes.success) setBranches(bRes.data);
        if (rRes.success) setRoles(rRes.data);

        if (empRes.success && empRes.data) {
          const emp = empRes.data;
          
          setPersonalDetails({
            fullName: emp.fullName || '',
            gender: emp.gender || '',
            dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.substring(0, 10) : '',
            phoneNumber: emp.phoneNumber || '',
            email: emp.email || '',
            password: '', // Don't prefill password
            address: emp.address || ''
          });
          
          setJobDetails({
            roleId: emp.roleId || '',
            branchId: emp.branchId || '',
            designation: emp.designation || '',
            state: emp.state || '',
            salary: emp.salary || '',
            joiningDate: emp.joiningDate ? emp.joiningDate.substring(0, 10) : '',
            probationPeriodMonths: emp.probationPeriodMonths || 6
          });

          if (emp.shiftSettings) {
            setShiftSettings({
              punchInTime: emp.shiftSettings.punchInTime || '09:30',
              punchOutTime: emp.shiftSettings.punchOutTime || '18:30',
              weeklyOffDay: emp.shiftSettings.weeklyOff?.day || 'SUNDAY',
              weeklyOffPayable: emp.shiftSettings.weeklyOff?.payable ?? true
            });
          }

          if (emp.attendanceSettings) {
            setAttendanceSettings({
              punchType: emp.attendanceSettings.punchType || 'DOUBLE',
              noOutPunchAction: emp.attendanceSettings.noOutPunchAction || 'MARK_HALF_DAY',
              presentOnWeeklyOffHolidayAction: emp.attendanceSettings.presentOnWeeklyOffHolidayAction || 'EXTRA_PAY',
              overtimeAllowed: emp.attendanceSettings.overtime?.allowed ?? false,
              gracePeriodMinutes: emp.attendanceSettings.overtime?.gracePeriodMinutes || 0
            });
          }

          if (emp.woffHoffSettings) {
            setWoffHoffSettings({
              absentBefore: emp.woffHoffSettings.weeklyOffRules?.absentBefore ?? true,
              absentAfter: emp.woffHoffSettings.weeklyOffRules?.absentAfter ?? false,
              leaveEncashmentAllowed: emp.woffHoffSettings.leaveSettings?.leaveEncashmentAllowed ?? true,
              carryForwardAllowed: emp.woffHoffSettings.leaveSettings?.carryForwardAllowed ?? true
            });
          }

          if (emp.kraSettings) {
            setKraSettings({
              year: emp.kraSettings.year || new Date().getFullYear(),
              targets: emp.kraSettings.targets?.length ? emp.kraSettings.targets : [{ product: 'Home Loan', targetType: 'AMOUNT', targetValue: 5000000 }]
            });
          }
        }
      } catch (err) {
        console.error("Failed to load data", err);
        toast.error("Failed to load employee details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const savePersonalDetails = async () => {
    setSubmittingTab('Personal Details');
    try {
      const payload = { ...personalDetails };
      if (!payload.password) delete payload.password; // Don't send empty password
      await employeeService.updatePersonalDetails(id, payload);
      toast.success('Personal details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update personal details');
    } finally {
      setSubmittingTab(null);
    }
  };

  const saveJobDetails = async () => {
    setSubmittingTab('Job Details');
    try {
      const payload = {
        ...jobDetails,
        salary: Math.max(0, Number(jobDetails.salary) || 0),
        probationPeriodMonths: Math.max(0, Number(jobDetails.probationPeriodMonths) || 0)
      };
      
      // Update specific relations if they changed
      if (payload.roleId) await employeeService.changeRole(id, payload.roleId);
      if (payload.branchId) await employeeService.changeBranch(id, payload.branchId);
      
      delete payload.roleId;
      delete payload.branchId;
      
      await employeeService.updateJobDetails(id, payload);
      toast.success('Job details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job details');
    } finally {
      setSubmittingTab(null);
    }
  };

  const saveShiftSettings = async () => {
    setSubmittingTab('Shift & WOFF');
    try {
      const payload = {
        punchInTime: shiftSettings.punchInTime,
        punchOutTime: shiftSettings.punchOutTime,
        weeklyOff: {
          day: shiftSettings.weeklyOffDay,
          payable: shiftSettings.weeklyOffPayable
        }
      };
      await employeeService.updateShiftSettings(id, payload);
      toast.success('Shift settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shift settings');
    } finally {
      setSubmittingTab(null);
    }
  };

  const saveAttendanceSettings = async () => {
    setSubmittingTab('Attendance');
    try {
      const payload = {
        punchType: attendanceSettings.punchType,
        noOutPunchAction: attendanceSettings.noOutPunchAction,
        presentOnWeeklyOffHolidayAction: attendanceSettings.presentOnWeeklyOffHolidayAction,
        overtime: {
          allowed: attendanceSettings.overtimeAllowed,
          gracePeriodMinutes: Math.max(0, Number(attendanceSettings.gracePeriodMinutes) || 0)
        }
      };
      await employeeService.updateAttendanceSettings(id, payload);
      toast.success('Attendance settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance settings');
    } finally {
      setSubmittingTab(null);
    }
  };

  const saveWoffHoffSettings = async () => {
    setSubmittingTab('WOFF & HOFF');
    try {
      const payload = {
        weeklyOffRules: { absentBefore: woffHoffSettings.absentBefore, absentAfter: woffHoffSettings.absentAfter },
        leaveSettings: { leaveEncashmentAllowed: woffHoffSettings.leaveEncashmentAllowed, carryForwardAllowed: woffHoffSettings.carryForwardAllowed }
      };
      await employeeService.updateWoffHoffSettings(id, payload);
      toast.success('WOFF/HOFF settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update WOFF/HOFF settings');
    } finally {
      setSubmittingTab(null);
    }
  };

  const saveKraSettings = async () => {
    setSubmittingTab('KRA Settings');
    try {
      const payload = {
        year: Math.max(2000, Number(kraSettings.year)),
        targets: kraSettings.targets.map(t => ({ ...t, targetValue: Math.max(0, Number(t.targetValue) || 0) }))
      };
      await employeeService.updateKraSettings(id, payload);
      toast.success('KRA settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update KRA settings');
    } finally {
      setSubmittingTab(null);
    }
  };

  const tabs = ['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF & HOFF', 'KRA Settings'];

  if (loading) {
    return <div className="text-center p-10 text-gray-500">Loading employee details...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#4285F4] mb-2">Edit Employee</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/employees" className="hover:text-gray-700">Employees</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[#5a5ce5]">Edit Employee</span>
          </div>
        </div>
        <button onClick={() => navigate('/employees')} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
          Back to List
        </button>
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Change Password (Optional)</label>
                <input type="text" placeholder="Leave blank to keep current" value={personalDetails.password} onChange={e => setPersonalDetails({...personalDetails, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm" />
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
            <div className="mt-8 flex justify-end">
              <button onClick={savePersonalDetails} disabled={submittingTab === 'Personal Details'} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50">
                {submittingTab === 'Personal Details' ? 'Saving...' : 'Save Personal Details'}
              </button>
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
            <div className="mt-8 flex justify-end">
              <button onClick={saveJobDetails} disabled={submittingTab === 'Job Details'} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50">
                {submittingTab === 'Job Details' ? 'Saving...' : 'Save Job Details'}
              </button>
            </div>
          </div>
        )}

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
            <div className="mt-8 flex justify-end">
              <button onClick={saveShiftSettings} disabled={submittingTab === 'Shift & WOFF'} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50">
                {submittingTab === 'Shift & WOFF' ? 'Saving...' : 'Save Shift Settings'}
              </button>
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
            <div className="mt-8 flex justify-end">
              <button onClick={saveAttendanceSettings} disabled={submittingTab === 'Attendance'} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50">
                {submittingTab === 'Attendance' ? 'Saving...' : 'Save Attendance Settings'}
              </button>
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
            <div className="mt-8 flex justify-end">
              <button onClick={saveWoffHoffSettings} disabled={submittingTab === 'WOFF & HOFF'} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50">
                {submittingTab === 'WOFF & HOFF' ? 'Saving...' : 'Save WOFF/HOFF Rules'}
              </button>
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
            <div className="mt-8 flex justify-end">
              <button onClick={saveKraSettings} disabled={submittingTab === 'KRA Settings'} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50">
                {submittingTab === 'KRA Settings' ? 'Saving...' : 'Save KRA Targets'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditEmployee;
