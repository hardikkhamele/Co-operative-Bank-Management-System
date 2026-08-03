import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Calendar, Phone, Mail, Lock, MapPin, Clock, Check, AlertCircle, Fingerprint, Map, Banknote, UserCircle, ThumbsUp, ArrowLeftRight } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';

const InfoCard = ({ icon: Icon, title, value }) => (
  <div className="bg-[#fafafa] rounded-xl p-4 flex items-center gap-4">
    <div className="text-[#1cabb1] shrink-0">
      <Icon size={20} strokeWidth={2} />
    </div>
    <div className="flex flex-col">
      <span className="text-[13px] text-gray-500 font-medium mb-0.5">{title}</span>
      <span className="text-[14px] text-gray-800 font-semibold">{value || '-'}</span>
    </div>
  </div>
);

const CheckCard = ({ label }) => (
  <div className="bg-[#fafafa] rounded-xl p-4 flex items-center gap-3">
    <div className="text-[#1cabb1] shrink-0">
      <Check size={18} strokeWidth={2.5} />
    </div>
    <span className="text-[14px] font-semibold text-gray-800">{label}</span>
  </div>
);

const ViewEmployee = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await employeeService.getById(id);
        console.log('RES:', res);
        if (res.success && res.data) {
          setEmployee(res.data);
        } else {
          setErrorMsg(JSON.stringify(res));
          if (res && !res.success && res.data) { setEmployee(res.data); }
          if (res && res.fullName) { setEmployee(res); }
        }
      } catch (err) {
        console.error("Failed to load employee", err);
        setErrorMsg(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading employee details...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-red-500">Employee not found. Debug Info: {errorMsg}</div>;
  }

  const tabs = ['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF / HOFF', 'KRA Settings'];

  const getInitials = (name) => {
    if (!name) return 'EM';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getBoolValue = (val) => val ? 'Yes' : 'No';

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header section with Breadcrumbs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Staff Details</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">HR Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/employees" className="hover:text-gray-700">Employee</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Employee Details</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[#1cabb1] overflow-hidden bg-[#f4f2ff] flex items-center justify-center shrink-0">
              {employee.profileImage ? (
                <img src={`http://localhost:5000${employee.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#5a5ce5]">{getInitials(employee.fullName)}</span>
              )}
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#1b2559] mb-1.5">{employee.fullName}</h2>
              <span className="inline-block px-3 py-1 bg-[#6366f1] text-white text-[11px] font-medium rounded-full">
                {employee.type === 'MANAGER' ? 'Branch Manager' : (employee.designation || employee.role?.name || 'Employee')}
              </span>
            </div>
          </div>
          
          {/* Quick Info Box */}
          <div className="bg-[#f4f5f9] rounded-xl p-4 flex gap-8">
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500 font-medium mb-1">Shift</span>
              <span className="text-[14px] text-gray-800 font-bold">{employee.shiftSettings?.punchInTime || '10:00'}-{employee.shiftSettings?.punchOutTime || '21:00'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500 font-medium mb-1">Weekly Off</span>
              <span className="text-[14px] text-gray-800 font-bold">{employee.shiftSettings?.weeklyOffDays?.join(', ') || 'Sun'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500 font-medium mb-1">Joined</span>
              <span className="text-[14px] text-gray-800 font-bold">{employee.joiningDate ? employee.joiningDate.substring(0, 10) : '-'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-100 pb-6 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium text-[14px] whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-[#eef2ff] text-[#4f46e5]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'Personal Details' && (
            <div>
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={UserCircle} title="Gender" value={employee.gender} />
                <InfoCard icon={Calendar} title="Date Of Birth" value={employee.dateOfBirth ? employee.dateOfBirth.substring(0, 10) : ''} />
                <InfoCard icon={Phone} title="Phone" value={employee.phoneNumber} />
                <InfoCard icon={Mail} title="Email" value={employee.email} />
                <InfoCard icon={Lock} title="Password" value="••••••••" />
                <InfoCard icon={MapPin} title="Address" value={employee.address} />
              </div>
            </div>
          )}

          {activeTab === 'Job Details' && (
            <div>
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Map} title="State" value={employee.state} />
                <InfoCard icon={MapPin} title="Branch" value={employee.branch?.name} />
                <InfoCard icon={Banknote} title="Salary" value={`Rs. ${employee.salary || '0'}/-`} />
                <InfoCard icon={Calendar} title="Joining Date" value={employee.joiningDate ? employee.joiningDate.substring(0, 10) : ''} />
                <InfoCard icon={Calendar} title="Probation Period" value={`${employee.probationPeriod || 0} Months`} />
              </div>
            </div>
          )}

          {activeTab === 'Shift & WOFF' && (
            <div className="space-y-8">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-2">Shift & Woff</h2>
              
              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Shift</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Clock} title="Punch In Time" value={employee.shiftSettings?.punchInTime} />
                  <InfoCard icon={Clock} title="Punch Out Time" value={employee.shiftSettings?.punchOutTime} />
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Weekly Off</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Calendar} title="Weekly Off Days" value={employee.shiftSettings?.weeklyOffDays?.join(', ')} />
                  {employee.shiftSettings?.weeklyOffPayable && <CheckCard label="Weekly Of Payable" />}
                  {employee.shiftSettings?.variableWeeklyOff && <CheckCard label="Variable Weekly Off" />}
                  {employee.shiftSettings?.secondWeeklyOff && <CheckCard label="Second weekly off" />}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Other Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Clock} title="Late Allowed (Mins)" value={`${employee.shiftSettings?.lateAllowedMins || 0} ${employee.shiftSettings?.lateAllowedAsPerShift ? '(As Per Shift)' : ''}`} />
                  <InfoCard icon={Clock} title="Early Allowed (Min)" value={`${employee.shiftSettings?.earlyAllowedMins || 0} ${employee.shiftSettings?.earlyAllowedAsPerShift ? '(As Per Shift)' : ''}`} />
                  <InfoCard icon={Clock} title="Half Day (Min)" value={`${employee.shiftSettings?.halfDayMins || 0} ${employee.shiftSettings?.halfDayAsPerShift ? '(As Per Shift)' : ''}`} />
                  <InfoCard icon={Clock} title="Full Day (Min)" value={`${employee.shiftSettings?.fullDayMins || 0} ${employee.shiftSettings?.fullDayAsPerShift ? '(As Per Shift)' : ''}`} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="space-y-8">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-2">Attendance</h2>
              
              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Punch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={ThumbsUp} title="Punch Type" value={
                    employee.attendanceSettings?.punchType === 'SINGLE' ? 'Single' :
                    employee.attendanceSettings?.punchType === 'DOUBLE' ? 'Double' :
                    employee.attendanceSettings?.punchType === 'MULTIPLE' ? 'Multiple' : '—'
                  } />
                  <InfoCard icon={AlertCircle} title="No Out- Punch Found - Action" value={
                    employee.attendanceSettings?.noOutPunchAction === 'MARK_HALF_DAY' ? 'Mark Half Day' :
                    employee.attendanceSettings?.noOutPunchAction === 'MARK_ABSENT' ? 'Mark Absent' : '—'
                  } />
                  <InfoCard icon={Clock} title="Present On Wo / Holiday - Action" value={
                    employee.attendanceSettings?.presentOnWeeklyOffHolidayAction === 'EXTRA_PAY' ? 'Extra Pay' :
                    employee.attendanceSettings?.presentOnWeeklyOffHolidayAction === 'COMPENSATORY_OFF' ? 'Mark as COFF' : '—'
                  } />
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Late Cut</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Calendar} title="Allowed Day" value={employee.attendanceSettings?.lateCut?.allowedDays} />
                  <InfoCard icon={ArrowLeftRight} title="Action" value={
                    employee.attendanceSettings?.lateCut?.action === 'MARK_HALF_DAY' ? 'Half Day' :
                    employee.attendanceSettings?.lateCut?.action === 'MARK_ABSENT' ? 'Absent' : '—'
                  } />
                  {employee.attendanceSettings?.lateCut?.allowed && <CheckCard label="Late Cut Allowed" />}
                  {employee.attendanceSettings?.lateCut?.extraDeduction && <CheckCard label="Extra Late Cut Deduction" />}
                  {employee.attendanceSettings?.lateCut?.additionalInLeaveBalance && <CheckCard label="Additional Late Cut In Leave Balance" />}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Overtime</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Clock} title="Lunch Allowed (Mins)" value={`${employee.attendanceSettings?.lunchAndEarlyGoing?.lunchAllowedMins || 0} ${employee.attendanceSettings?.lunchAndEarlyGoing?.lunchAsPerShift ? '(As Per Shift)' : ''}`} />
                  {employee.attendanceSettings?.lunchAndEarlyGoing?.lunchAllowed && <CheckCard label="Lunch Allowed" />}
                  {employee.attendanceSettings?.lunchAndEarlyGoing?.earlyGoingAllowed && <CheckCard label="Early Going Allowed" />}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Lunch & Early Going</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.attendanceSettings?.overtime?.allowed && <CheckCard label="Overtime Allowed" />}
                  {employee.attendanceSettings?.overtime?.customOT && <CheckCard label="Custom OT" />}
                  {employee.attendanceSettings?.overtime?.beforeOT && <CheckCard label="Before OT" />}
                  <InfoCard icon={Clock} title="OT Grace Period (Mins)" value={employee.attendanceSettings?.overtime?.gracePeriodMinutes} />
                  <InfoCard icon={Clock} title="1 day OT Hrs" value={employee.attendanceSettings?.overtime?.oneDayOTHrs} />
                  {employee.attendanceSettings?.overtime?.otAsPerShift && <CheckCard label="OT As Per Shift" />}
                  {employee.attendanceSettings?.overtime?.considerOTAsCOFF && <CheckCard label="Consider OT As COFF" />}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WOFF / HOFF' && (
            <div className="space-y-8">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-2">WOFF & HOFF</h2>
              
              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Sandwich Absence Rules - Weekly Off</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.woffHoffSettings?.woAbsentBefore && <CheckCard label="Absent Before Weekly Off" />}
                  {employee.woffHoffSettings?.woAbsentAfter && <CheckCard label="Absent After Weekly Off" />}
                  {employee.woffHoffSettings?.woAbsentBeforeOrAfter && <CheckCard label="Absent Before Or After Weekly Off" />}
                  {employee.woffHoffSettings?.woAddWorkingHrs && <CheckCard label="Add Working Hrs On Weekly Off Day" />}
                  {employee.woffHoffSettings?.woLateDeductionNotApplied && <CheckCard label="Late Deduction Not Applied On WO If Present" />}
                  {employee.woffHoffSettings?.woLWP && <CheckCard label="LWP" />}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Sandwich Absence Rules - Holidays</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.woffHoffSettings?.holAbsentBefore && <CheckCard label="Absent Before Holiday" />}
                  {employee.woffHoffSettings?.holAbsentAfter && <CheckCard label="Absent After Holiday" />}
                  {employee.woffHoffSettings?.holAbsentBeforeAndAfter && <CheckCard label="Absent Before & After Holiday" />}
                  {employee.woffHoffSettings?.holAddWorkingHrs && <CheckCard label="Add Working Hours On Holiday Day" />}
                  {employee.woffHoffSettings?.holLateDeductionNotApplied && <CheckCard label="Late Deduction Not Applied On Holiday If Present" />}
                  {employee.woffHoffSettings?.holLWP && <CheckCard label="LWP" />}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Leave Between Holiday Or Weekly Off</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.woffHoffSettings?.considerWOInLeave && <CheckCard label='Consider "Weekly Off" In Leave Application' />}
                  {employee.woffHoffSettings?.considerHolInLeave && <CheckCard label='Consider "Holiday" In Leave Application' />}
                  {employee.woffHoffSettings?.absentWOLeaveWOAbsent && <CheckCard label="Absent — WO — Leave = WO Absent" />}
                  {employee.woffHoffSettings?.leaveWOAbsentWOAbsent && <CheckCard label="Leave — WO — Absent = WO Absent" />}
                  {employee.woffHoffSettings?.absentHolLeaveHolAbsent && <CheckCard label="Absent — Holiday — Leave = Holiday Absent" />}
                  {employee.woffHoffSettings?.leaveHolAbsentHolAbsent && <CheckCard label="Leave — Holiday — Absent = Holiday Absent" />}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-4">Leave Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Banknote} title="Leave In Cash" value={employee.woffHoffSettings?.leaveInCash ? 'Yes' : 'No'} />
                  <InfoCard icon={Calendar} title="Leave Carry Forward" value={employee.woffHoffSettings?.leaveCarryForward ? 'Yes' : 'No'} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'KRA Settings' && (
            <div className="space-y-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-4">KRA Settings</h2>
              
              <div className="bg-[#f8f9fc] rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="text-[15px] font-bold text-[#1b2559]">Target List</h3>
                </div>
                
                <div className="overflow-x-auto px-2 pb-6">
                  <table className="w-full text-left border-collapse min-w-[600px] bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-gray-100 text-[14px] text-[#1b2559] font-bold">
                        <th className="py-4 px-6 font-semibold w-24">Sr. No.</th>
                        <th className="py-4 px-6 font-semibold">Product</th>
                        <th className="py-4 px-6 font-semibold">Daily</th>
                        <th className="py-4 px-6 font-semibold">Weekly</th>
                        <th className="py-4 px-6 font-semibold">Monthly</th>
                        <th className="py-4 px-6 font-semibold">Yearly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!employee.kraSettings?.targets || employee.kraSettings.targets.length === 0) ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-500">No targets found.</td>
                        </tr>
                      ) : (
                        employee.kraSettings.targets.map((target, index) => {
                          const yearly = Number(target.targetValue) || 0;
                          const monthly = yearly / 12;
                          const weekly = monthly / 4;
                          const daily = weekly / 5;

                          // Helper to format values with optional rupee symbol if it looks like a currency amount
                          // Using a heuristic: if yearly > 10000, we prepend ₹, otherwise not.
                          const formatVal = (val) => {
                            const formatted = val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                            return yearly >= 10000 ? `₹${formatted}` : formatted;
                          };

                          return (
                            <tr key={index} className="border-b border-gray-50 text-[14px] text-[#4b5563]">
                              <td className="py-4 px-6 text-center">{index + 1}</td>
                              <td className="py-4 px-6 text-[#1b2559] font-medium">{target.product}</td>
                              <td className="py-4 px-6">{formatVal(daily)}</td>
                              <td className="py-4 px-6">{formatVal(weekly)}</td>
                              <td className="py-4 px-6">{formatVal(monthly)}</td>
                              <td className="py-4 px-6">{formatVal(yearly)}</td>
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
