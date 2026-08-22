import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  ChevronRight, Calendar, Phone, Mail, Lock, MapPin, Clock, Check, 
  AlertCircle, Fingerprint, Map, Banknote, UserCircle, ThumbsUp, 
  ArrowLeftRight, ShieldCheck, Briefcase, Building2, Award, 
  Loader2, BadgeCheck, X
, ArrowLeft} from 'lucide-react';
import { employeeService } from '../../api/employeeService';

const InfoCard = ({ icon: Icon, title, value }) => (
  <div className="bg-[#fafafa] rounded-xl p-4 flex items-center gap-4 border border-gray-100/60">
    <div className="text-[#225091] shrink-0 bg-white p-2.5 rounded-lg shadow-2xs border border-gray-100">
      <Icon size={20} strokeWidth={2} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[13px] text-gray-500 font-medium mb-0.5">{title}</span>
      <span className="text-[14px] text-gray-800 font-semibold truncate">{value || '—'}</span>
    </div>
  </div>
);

const CheckCard = ({ label, active = true }) => (
  <div className={`rounded-xl p-4 flex items-center gap-3 border ${active ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-[#fafafa] border-gray-100 text-gray-400'}`}>
    <div className={`shrink-0 p-1.5 rounded-full ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
      {active ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={2.5} />}
    </div>
    <span className="text-[14px] font-semibold">{label}</span>
  </div>
);

const ViewEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await employeeService.getById(id);
        if (res && (res.success || res.statusCode === 200) && res.data) {
          setEmployee(res.data);
        } else if (res && res.data) {
          setEmployee(res.data);
        } else if (res && res.fullName) {
          setEmployee(res);
        } else {
          setErrorMsg(res?.message || 'Employee not found');
        }
      } catch (err) {
        console.error("Failed to load employee details:", err);
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    const num = Number(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getInitials = (name) => {
    if (!name) return 'EM';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={32} className="animate-spin text-[#225091]" />
        <span className="text-gray-500 font-medium text-sm">Loading employee details...</span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-gray-800 mb-1">Employee Details Unavailable</h2>
        <p className="text-sm text-gray-500 mb-4">{errorMsg || 'Could not retrieve employee information.'}</p>
        <Link to="/employees" className="inline-flex items-center px-4 py-2 bg-[#225091] text-white rounded-lg font-semibold text-sm hover:bg-[#16949a] transition-colors">
          Back to Employee List
        </Link>
      </div>
    );
  }

  // Nested Safe Properties
  const personal = employee.personalDetails || {};
  const job = employee.jobDetails || {};
  const shift = employee.shiftSettings || {};
  const attendance = employee.attendanceSettings || {};
  const woffHoff = employee.woffHoffSettings || {};
  const kra = employee.kraSettings || {};
  const role = employee.role || {};
  const branch = employee.branch || {};

  const empName = employee.fullName || personal.fullName || employee.firstName || 'Employee';
  const empCode = employee.employeeCode || employee.employeeId || '—';
  const empDesignation = employee.designation || job.designation || role.name || 'Employee';
  const empDepartment = employee.department || job.department || personal.department || 'Loans & Disbursals';
  const empStatus = employee.status || 'ACTIVE';

  const profileImg = personal.profileImage || employee.profileImage;
  const avatarUrl = profileImg 
    ? (profileImg.startsWith('http') ? profileImg : `http://localhost:5000${profileImg}`)
    : null;

  const tabs = ['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF / HOFF', 'KRA Settings'];

  return (
    <div className="flex flex-col gap-5 w-full font-sans antialiased pb-16">
      {/* Header section with Breadcrumbs */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer"
              type="button"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="text-xl font-bold text-[#225091] tracking-tight m-0">Employee Profile</h1>
          </div>
          <div className="flex items-center text-xs font-medium text-slate-500 pl-1">
            <Link to="/dashboard" className="hover:text-[#225091] transition-colors">Dashboard</Link>
            <ChevronRight size={13} className="mx-1 text-slate-400" />
            <span>HR Operations</span>
            <ChevronRight size={13} className="mx-1 text-slate-400" />
            <Link to="/employees" className="hover:text-[#225091] transition-colors">Employees</Link>
            <ChevronRight size={13} className="mx-1 text-slate-400" />
            <span className="text-[#225091] font-semibold">{empName}</span>
          </div>
        </div>

        <Link
          to={`/employees/edit/${id}`}
          className="bg-[#225091] hover:bg-[#1a3f73] active:scale-[0.99] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-xs flex items-center gap-2 text-xs tracking-normal cursor-pointer"
        >
          <Award size={14} />
          <span>Edit Profile</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6">
        {/* Profile Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-xl border-2 border-[#225091] overflow-hidden bg-gradient-to-tr from-[#225091] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={empName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(empName)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{empName}</h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                  empStatus === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${empStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {empStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-[#225091] border border-blue-200/80 text-xs font-semibold rounded-md">
                  {empDesignation}
                </span>
                <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-semibold rounded-md border border-slate-200">
                  ID: {empCode}
                </span>
                <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium rounded-md">
                  {empDepartment}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Info Box */}
          <div className="bg-slate-50/80 rounded-xl p-4 px-6 flex flex-wrap gap-6 items-center border border-slate-200/80">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Shift Timings</span>
              <span className="text-xs text-slate-800 font-semibold">{shift.punchInTime || '09:30'} - {shift.punchOutTime || '18:30'}</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Weekly Off</span>
              <span className="text-xs text-slate-800 font-semibold">{shift.weeklyOff?.day || employee.weeklyOff || 'SUNDAY'}</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Date of Joining</span>
              <span className="text-xs text-slate-800 font-semibold">{formatDate(job.joiningDate || employee.joiningDate)}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 border-b border-slate-100 pb-4 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#225091] text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'Personal Details' && (
            <div className="space-y-6">
              <h2 className="text-[18px] font-bold text-[#1b2559]">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon={UserCircle} title="Full Name" value={personal.fullName || empName} />
                <InfoCard icon={UserCircle} title="Gender" value={personal.gender || employee.gender || '—'} />
                <InfoCard icon={Calendar} title="Date Of Birth" value={formatDate(personal.dob || personal.dateOfBirth || employee.dateOfBirth)} />
                <InfoCard icon={Phone} title="Phone Number" value={personal.phoneNumber || employee.phoneNumber || '—'} />
                <InfoCard icon={Mail} title="Email Address" value={personal.email || employee.email || '—'} />
                <InfoCard icon={Lock} title="Password" value="••••••••" />
                <InfoCard icon={MapPin} title="Residential Address" value={personal.address || employee.address || '—'} />
                <InfoCard icon={Building2} title="Office Address" value={personal.officeAddress || employee.officeAddress || '—'} />
                <InfoCard icon={Award} title="Blood Group" value={personal.bloodGroup || employee.bloodGroup || '—'} />
                <InfoCard icon={Clock} title="Duty Hours" value={personal.dutyHours || employee.dutyHours || `${shift.punchInTime || '09:30'} to ${shift.punchOutTime || '18:30'}`} />
                <InfoCard icon={Calendar} title="Weekly Off" value={personal.weeklyOff || employee.weeklyOff || shift.weeklyOff?.day || 'SUNDAY'} />
                <InfoCard icon={Briefcase} title="Department" value={personal.department || empDepartment} />
              </div>
            </div>
          )}

          {/* TAB 2: JOB DETAILS */}
          {activeTab === 'Job Details' && (
            <div className="space-y-6">
              <h2 className="text-[18px] font-bold text-[#1b2559]">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon={Briefcase} title="Designation" value={job.designation || empDesignation} />
                <InfoCard icon={Building2} title="Department" value={job.department || empDepartment} />
                <InfoCard icon={MapPin} title="Branch" value={branch.name ? `${branch.name} (${branch.code || ''})` : '—'} />
                <InfoCard icon={Map} title="State" value={job.state || branch.state || employee.state || '—'} />
                <InfoCard icon={Banknote} title="Monthly Salary" value={formatCurrency(job.salary !== undefined ? job.salary : employee.salary)} />
                <InfoCard icon={Calendar} title="Joining Date" value={formatDate(job.joiningDate || employee.joiningDate)} />
                <InfoCard icon={Clock} title="Probation Period" value={`${job.probationPeriodMonths ?? employee.probationPeriod ?? 0} Months`} />
                <InfoCard icon={ShieldCheck} title="Employee Code / ID" value={empCode} />
                <InfoCard icon={UserCircle} title="Assigned Role" value={role.name || empDesignation} />
              </div>

              {role.permissions && role.permissions.length > 0 && (
                <div className="mt-6 bg-[#fafafa] p-5 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-[#1b2559] mb-3">Role Permissions</h3>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHIFT & WOFF */}
          {activeTab === 'Shift & WOFF' && (
            <div className="space-y-8">
              <h2 className="text-[18px] font-bold text-[#1b2559]">Shift & Weekly Off</h2>
              
              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Shift Timing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Clock} title="Punch In Time" value={shift.punchInTime || '09:30'} />
                  <InfoCard icon={Clock} title="Punch Out Time" value={shift.punchOutTime || '18:30'} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Weekly Off Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Calendar} title="Weekly Off Day" value={shift.weeklyOff?.day || employee.weeklyOff || 'SUNDAY'} />
                  <CheckCard label="Weekly Off Payable" active={Boolean(shift.weeklyOff?.payable ?? true)} />
                  <CheckCard label="Variable Weekly Off" active={Boolean(shift.weeklyOff?.variable)} />
                  <CheckCard 
                    label={`Second Weekly Off ${shift.weeklyOff?.secondWeeklyOff ? `(${shift.weeklyOff?.secondWeeklyOffDay || 'SATURDAY'})` : ''}`} 
                    active={Boolean(shift.weeklyOff?.secondWeeklyOff)} 
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Punctuality & Tolerance Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Clock} title="Late Allowed" value={`${shift.lateAllowedMinutes ?? shift.lateAllowedMins ?? 0} Mins ${shift.lateAllowedAsPerShift ? '(As Per Shift)' : ''}`} />
                  <InfoCard icon={Clock} title="Early Allowed" value={`${shift.earlyAllowedMinutes ?? shift.earlyAllowedMins ?? 0} Mins ${shift.earlyAllowedAsPerShift ? '(As Per Shift)' : ''}`} />
                  <InfoCard icon={Clock} title="Half Day Threshold" value={`${shift.halfDayMinutes ?? shift.halfDayMins ?? 240} Mins (${((shift.halfDayMinutes ?? 240)/60).toFixed(1)} hrs) ${shift.halfDayAsPerShift ? '(As Per Shift)' : ''}`} />
                  <InfoCard icon={Clock} title="Full Day Threshold" value={`${shift.fullDayMinutes ?? shift.fullDayMins ?? 480} Mins (${((shift.fullDayMinutes ?? 480)/60).toFixed(1)} hrs) ${shift.fullDayAsPerShift ? '(As Per Shift)' : ''}`} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE */}
          {activeTab === 'Attendance' && (
            <div className="space-y-8">
              <h2 className="text-[18px] font-bold text-[#1b2559]">Attendance Settings</h2>
              
              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Punch Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard icon={ThumbsUp} title="Punch Type" value={attendance.punchType || 'DOUBLE'} />
                  <InfoCard icon={AlertCircle} title="No Out-Punch Action" value={attendance.noOutPunchAction?.replace(/_/g, ' ') || 'MARK HALF DAY'} />
                  <InfoCard icon={Clock} title="Present On WO / Holiday Action" value={attendance.presentOnWeeklyOffHolidayAction?.replace(/_/g, ' ') || 'EXTRA PAY'} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Late Cut Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Calendar} title="Allowed Late Days" value={`${attendance.lateCut?.allowedDays ?? 3} Days`} />
                  <InfoCard icon={ArrowLeftRight} title="Late Cut Action" value={attendance.lateCut?.action?.replace(/_/g, ' ') || 'MARK HALF DAY'} />
                  <CheckCard label="Late Cut Deduction Enabled" active={Boolean(attendance.lateCut?.enabled)} />
                  <CheckCard label="Extra Late Cut Deduction" active={Boolean(attendance.lateCut?.extraLateCutDeduction || attendance.lateCut?.extraDeduction)} />
                  <CheckCard label="Additional Late Cut In Leave Balance" active={Boolean(attendance.lateCut?.additionalLateCutInLeaveBalance || attendance.lateCut?.additionalInLeaveBalance)} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Lunch & Early Leaving</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Clock} title="Lunch Allowed" value={`${attendance.lunchAndEarlyGoing?.lunchAllowedMinutes ?? attendance.lunchAndEarlyGoing?.lunchAllowedMins ?? 0} Mins ${attendance.lunchAndEarlyGoing?.lunchAsPerShift ? '(As Per Shift)' : ''}`} />
                  <CheckCard label="Lunch Allowed" active={Boolean(attendance.lunchAndEarlyGoing?.lunchAllowed)} />
                  <CheckCard label="Early Going Allowed" active={Boolean(attendance.lunchAndEarlyGoing?.earlyGoingAllowed)} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Overtime (OT) Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckCard label="Overtime Allowed" active={Boolean(attendance.overtime?.allowed)} />
                  <CheckCard label="Custom OT" active={Boolean(attendance.overtime?.customOT)} />
                  <CheckCard label="Before Shift OT" active={Boolean(attendance.overtime?.beforeOT)} />
                  <InfoCard icon={Clock} title="OT Grace Period" value={`${attendance.overtime?.gracePeriodMinutes ?? 5} Mins`} />
                  <InfoCard icon={Clock} title="1 Day Max OT" value={`${attendance.overtime?.oneDayOTHrs ?? 4} Hours`} />
                  <CheckCard label="OT As Per Shift" active={Boolean(attendance.overtime?.asPerShift || attendance.overtime?.otAsPerShift)} />
                  <CheckCard label="Consider OT As Comp-Off (COFF)" active={Boolean(attendance.overtime?.considerAsCompOff || attendance.overtime?.considerOTAsCOFF)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WOFF / HOFF */}
          {activeTab === 'WOFF / HOFF' && (
            <div className="space-y-8">
              <h2 className="text-[18px] font-bold text-[#1b2559]">WOFF & HOFF Sandwich Rules</h2>
              
              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Sandwich Absence Rules - Weekly Off</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckCard label="Absent Before Weekly Off" active={Boolean(woffHoff.weeklyOffRules?.absentBefore ?? woffHoff.woAbsentBefore)} />
                  <CheckCard label="Absent After Weekly Off" active={Boolean(woffHoff.weeklyOffRules?.absentAfter ?? woffHoff.woAbsentAfter)} />
                  <CheckCard label="Absent Before Or After Weekly Off" active={Boolean(woffHoff.weeklyOffRules?.absentBeforeOrAfter ?? woffHoff.woAbsentBeforeOrAfter)} />
                  <CheckCard label="Add Working Hours On Weekly Off Day" active={Boolean(woffHoff.weeklyOffRules?.addWorkingHours ?? woffHoff.woAddWorkingHrs)} />
                  <CheckCard label="Late Deduction Not Applied On WO If Present" active={Boolean(woffHoff.weeklyOffRules?.ignoreLateDeductionIfPresent ?? woffHoff.woLateDeductionNotApplied)} />
                  <CheckCard label="Leave Without Pay (LWP)" active={Boolean(woffHoff.weeklyOffRules?.lwp ?? woffHoff.woLWP)} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Sandwich Absence Rules - Holidays</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckCard label="Absent Before Holiday" active={Boolean(woffHoff.holidayRules?.absentBefore ?? woffHoff.holAbsentBefore)} />
                  <CheckCard label="Absent After Holiday" active={Boolean(woffHoff.holidayRules?.absentAfter ?? woffHoff.holAbsentAfter)} />
                  <CheckCard label="Absent Before & After Holiday" active={Boolean(woffHoff.holidayRules?.absentBeforeAndAfter ?? woffHoff.holAbsentBeforeAndAfter)} />
                  <CheckCard label="Add Working Hours On Holiday Day" active={Boolean(woffHoff.holidayRules?.addWorkingHours ?? woffHoff.holAddWorkingHrs)} />
                  <CheckCard label="Late Deduction Not Applied On Holiday If Present" active={Boolean(woffHoff.holidayRules?.ignoreLateDeductionIfPresent ?? woffHoff.holLateDeductionNotApplied)} />
                  <CheckCard label="Leave Without Pay (LWP)" active={Boolean(woffHoff.holidayRules?.lwp ?? woffHoff.holLWP)} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Leave Bridge Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckCard label='Consider "Weekly Off" In Leave Application' active={Boolean(woffHoff.leaveBridgeRules?.considerWeeklyOffInLeave ?? woffHoff.considerWOInLeave)} />
                  <CheckCard label='Consider "Holiday" In Leave Application' active={Boolean(woffHoff.leaveBridgeRules?.considerHolidayInLeave ?? woffHoff.considerHolInLeave)} />
                  <CheckCard label="Absent — WO — Leave = WO Absent" active={Boolean(woffHoff.leaveBridgeRules?.absentWeeklyOffLeaveMarksWeeklyOffAbsent ?? woffHoff.absentWOLeaveWOAbsent)} />
                  <CheckCard label="Leave — WO — Absent = WO Absent" active={Boolean(woffHoff.leaveBridgeRules?.leaveWeeklyOffAbsentMarksWeeklyOffAbsent ?? woffHoff.leaveWOAbsentWOAbsent)} />
                  <CheckCard label="Absent — Holiday — Leave = Holiday Absent" active={Boolean(woffHoff.leaveBridgeRules?.absentHolidayLeaveMarksHolidayAbsent ?? woffHoff.absentHolLeaveHolAbsent)} />
                  <CheckCard label="Leave — Holiday — Absent = Holiday Absent" active={Boolean(woffHoff.leaveBridgeRules?.leaveHolidayAbsentMarksHolidayAbsent ?? woffHoff.leaveHolAbsentHolAbsent)} />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1b2559] mb-3">Leave Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Banknote} title="Leave Encashment Allowed" value={(woffHoff.leaveSettings?.leaveEncashmentAllowed ?? woffHoff.leaveInCash) ? 'Yes' : 'No'} />
                  <InfoCard icon={Calendar} title="Leave Carry Forward Allowed" value={(woffHoff.leaveSettings?.carryForwardAllowed ?? woffHoff.leaveCarryForward) ? 'Yes' : 'No'} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KRA SETTINGS */}
          {activeTab === 'KRA Settings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[18px] font-bold text-[#1b2559]">KRA & Targets ({kra.year || 2026})</h2>
              </div>
              
              <div className="bg-[#f8f9fc] rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="text-[15px] font-bold text-[#1b2559]">Target List</h3>
                </div>
                
                <div className="overflow-x-auto px-4 pb-6">
                  <table className="w-full text-left border-collapse min-w-[650px] bg-white rounded-xl overflow-hidden shadow-2xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#f4f3fb] text-[14px] text-[#1b2559] font-bold">
                        <th className="py-4 px-6 font-bold w-24">Sr. No.</th>
                        <th className="py-4 px-6 font-bold">Product Name</th>
                        <th className="py-4 px-6 font-bold">Type</th>
                        <th className="py-4 px-6 font-bold text-right">Daily</th>
                        <th className="py-4 px-6 font-bold text-right">Weekly</th>
                        <th className="py-4 px-6 font-bold text-right">Monthly</th>
                        <th className="py-4 px-6 font-bold text-right">Yearly Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!kra.targets || kra.targets.length === 0) ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-gray-500 font-medium">
                            No KRA targets assigned for this employee.
                          </td>
                        </tr>
                      ) : (
                        kra.targets.map((target, index) => {
                          const yearly = Number(target.targetValue) || 0;
                          const monthly = yearly / 12;
                          const weekly = yearly / 52;
                          const daily = yearly / 300;
                          const isAmount = target.targetType === 'AMOUNT' || yearly >= 10000;

                          const formatVal = (val) => {
                            const formatted = Math.round(val).toLocaleString('en-IN');
                            return isAmount ? `₹${formatted}` : formatted;
                          };

                          return (
                            <tr key={index} className="border-b border-gray-50 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6 font-medium text-gray-500">{index + 1}</td>
                              <td className="py-4 px-6 text-[#1b2559] font-bold">{target.product}</td>
                              <td className="py-4 px-6">
                                <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                                  {target.targetType || 'AMOUNT'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right font-medium">{formatVal(daily)}</td>
                              <td className="py-4 px-6 text-right font-medium">{formatVal(weekly)}</td>
                              <td className="py-4 px-6 text-right font-medium">{formatVal(monthly)}</td>
                              <td className="py-4 px-6 text-right font-bold text-emerald-700">{formatVal(yearly)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
