import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Building2, 
  Phone, 
  Mail, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  CalendarDays, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  User,
  Navigation
} from 'lucide-react';
import { toast } from 'react-toastify';
import TableWrapper from '../common/TableWrapper';
import { attendanceService } from '../../api/attendanceService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => 2020 + i);

export const SinglePersonAttendanceModal = ({
  isOpen,
  onClose,
  employeeId,
  initialMonth,
  initialYear,
  initialEmployee = null
}) => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(initialMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (initialMonth) setMonth(Number(initialMonth));
    if (initialYear) setYear(Number(initialYear));
  }, [initialMonth, initialYear]);

  const fetchReport = useCallback(async () => {
    if (!employeeId && !initialEmployee?.id && !initialEmployee?._id) return;
    const targetId = employeeId || initialEmployee?.id || initialEmployee?._id;
    setLoading(true);
    try {
      const res = await attendanceService.getSinglePersonReport({
        employeeId: targetId,
        month,
        year
      });

      if (res && (res.success || res.statusCode === 200)) {
        setReportData(res.data || res);
      } else {
        throw new Error(res?.message || 'Failed to fetch single person attendance report');
      }
    } catch (err) {
      console.error('Failed to load single person attendance report:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [employeeId, initialEmployee, month, year]);

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, fetchReport]);

  if (!isOpen) return null;

  const emp = reportData?.employee || initialEmployee || {};
  const monthlySummary = reportData?.monthlySummary || {};
  const dailySheet = Array.isArray(reportData?.dailySheet) ? reportData.dailySheet : [];
  const yearlySummary = reportData?.yearlySummary || {};
  const yearlyMatrix = Array.isArray(reportData?.yearlyMatrix) ? reportData.yearlyMatrix : [];

  const handleRedirectToGeoTag = (punchLocation, punchType = 'IN', punchTime = '') => {
    const lat = punchLocation?.latitude;
    const lng = punchLocation?.longitude;
    const address = punchLocation?.address || '';

    onClose();
    navigate('/geo-tagging', {
      state: {
        employeeId: emp.id || emp._id,
        employeeName: emp.fullName || emp.name,
        punchType,
        punchTime,
        punchLat: lat,
        punchLng: lng,
        punchAddress: address,
        from: '/attendance-report'
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#225091] text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
              <CalendarDays size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Individual Attendance Report</h2>
              <p className="text-xs text-blue-100/80">Monthly punch sheet, GPS coordinates, and 12-month matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* 1. Employee Profile & Month Selector Bar */}
          <div className="bg-[#f8fafd] border border-blue-100/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border-2 border-[#225091] overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs">
                {emp.profileImage ? (
                  <img src={emp.profileImage} alt={emp.fullName || emp.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-50 text-[#225091] font-bold text-lg flex items-center justify-center uppercase">
                    {(emp.fullName || emp.name || 'E').slice(0, 2)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-gray-900">{emp.fullName || emp.name || 'Employee'}</h3>
                  {emp.designation && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#225091] text-white">
                      {emp.designation}
                    </span>
                  )}
                  {emp.employeeCode && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-gray-200/80 text-gray-700">
                      {emp.employeeCode}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 mt-1.5 flex-wrap">
                  {emp.branchName && (
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 size={13} className="text-[#225091]" />
                      {emp.branchName}
                    </span>
                  )}
                  {emp.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-gray-400" />
                      {emp.phoneNumber}
                    </span>
                  )}
                  {emp.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-gray-400" />
                      {emp.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs flex-1 md:flex-none"
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx + 1}>{mName}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs flex-1 md:flex-none"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Monthly Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Days</span>
              <span className="text-base font-extrabold text-gray-800">{monthlySummary.totalDays || 0}</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">Present</span>
              <span className="text-base font-extrabold text-emerald-700">{monthlySummary.presentDays || 0}</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase block">Absent</span>
              <span className="text-base font-extrabold text-rose-700">{monthlySummary.absentDays || 0}</span>
            </div>
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase block">Half Days</span>
              <span className="text-base font-extrabold text-purple-700">{monthlySummary.halfDays || 0}</span>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-[#225091] uppercase block">Leave</span>
              <span className="text-base font-extrabold text-[#225091]">{monthlySummary.leaveDays || 0}</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase block">Late Days</span>
              <span className="text-base font-extrabold text-amber-700">{monthlySummary.lateDays || 0}</span>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase block">Total Hours</span>
              <span className="text-base font-extrabold text-indigo-700">{monthlySummary.formattedTotalWorkingHours || `${Math.round((monthlySummary.totalWorkingMinutes || 0) / 60)} hrs`}</span>
            </div>
            <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-teal-600 uppercase block">Attendance</span>
              <span className="text-base font-extrabold text-teal-700">{monthlySummary.attendancePercentage ?? 0}%</span>
            </div>
          </div>

          {/* 3. Daily Punch Log Table with Geolocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-[#225091]" />
                Daily Attendance & Punch Locations ({MONTH_NAMES[month - 1]} {year})
              </h4>
              <span className="text-xs text-gray-500 font-medium">
                Showing {dailySheet.length} days
              </span>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
              <TableWrapper minHeight="240px">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
                      <th className="py-3 px-3 text-center w-14 border-r border-white/20">Day</th>
                      <th className="py-3 px-3 text-center w-16 border-r border-white/20">Status</th>
                      <th className="py-3 px-3 text-center w-24 border-r border-white/20">Check-In</th>
                      <th className="py-3 px-3 text-center w-24 border-r border-white/20">Check-Out</th>
                      <th className="py-3 px-3 text-center w-24 border-r border-white/20">Working Hrs</th>
                      <th className="py-3 px-4 border-r border-white/20">Punch-In Location (GPS & Address)</th>
                      <th className="py-3 px-4">Punch-Out Location (GPS & Address)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-gray-400">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#225091] border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading attendance data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : dailySheet.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-gray-400">
                          No daily punch records found for this month.
                        </td>
                      </tr>
                    ) : (
                      dailySheet.map((item, idx) => {
                        const inLoc = item.punchInLocation || {};
                        const outLoc = item.punchOutLocation || {};
                        const inLat = inLoc.latitude || item.punchInLatitude;
                        const inLng = inLoc.longitude || item.punchInLongitude;
                        const outLat = outLoc.latitude || item.punchOutLatitude;
                        const outLng = outLoc.longitude || item.punchOutLongitude;

                        const hasInCoords = Boolean(inLat && inLng);
                        const hasOutCoords = Boolean(outLat && outLng);

                        const isPresent = item.statusCode === 'P' || item.status === 'PRESENT';
                        const isAbsent = item.statusCode === 'A' || item.status === 'ABSENT';
                        const isLeave = item.statusCode === 'L' || item.status === 'LEAVE';

                        return (
                          <tr key={item.day || item.date || idx} className="hover:bg-[#F4F8FD] transition-colors">
                            <td className="py-2.5 px-3 text-center">
                              <span className="font-bold text-gray-800">{item.day}</span>
                              <span className="text-[10px] text-gray-400 block font-normal">{item.dayName || ''}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                isAbsent ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                isLeave ? 'bg-blue-50 text-[#225091] border border-blue-200' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {item.statusCode || item.status || '—'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-semibold text-gray-800">
                              {item.punchIn || '—'}
                              {item.isLate && (
                                <span className="block text-[9px] text-amber-600 font-sans font-bold">Late</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-semibold text-gray-800">
                              {item.punchOut || '—'}
                              {item.isEarlyLeave && (
                                <span className="block text-[9px] text-rose-600 font-sans font-bold">Early</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-700 font-semibold">
                              {item.formattedWorkingHours || (item.workingMinutes ? `${Math.round(item.workingMinutes / 60)} hrs` : '—')}
                            </td>
                            
                            {/* Punch In Location */}
                            <td className="py-2.5 px-4">
                              {inLoc.address || hasInCoords ? (
                                <div className="flex items-start justify-between gap-2 max-w-[300px]">
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-gray-800 text-[11px] font-medium truncate" title={inLoc.address}>
                                      {inLoc.address || 'Location Recorded'}
                                    </span>
                                    {hasInCoords && (
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        {Number(inLat).toFixed(4)}, {Number(inLng).toFixed(4)}
                                      </span>
                                    )}
                                  </div>
                                  {hasInCoords && (
                                    <button
                                      type="button"
                                      onClick={() => handleRedirectToGeoTag(inLoc, 'IN', item.punchIn)}
                                      className="p-1 rounded-md text-[#225091] hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                                      title="View on Geo-Tagging Map"
                                    >
                                      <Navigation size={13} className="text-[#225091]" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 font-mono">—</span>
                              )}
                            </td>

                            {/* Punch Out Location */}
                            <td className="py-2.5 px-4">
                              {outLoc.address || hasOutCoords ? (
                                <div className="flex items-start justify-between gap-2 max-w-[300px]">
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-gray-800 text-[11px] font-medium truncate" title={outLoc.address}>
                                      {outLoc.address || 'Location Recorded'}
                                    </span>
                                    {hasOutCoords && (
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        {Number(outLat).toFixed(4)}, {Number(outLng).toFixed(4)}
                                      </span>
                                    )}
                                  </div>
                                  {hasOutCoords && (
                                    <button
                                      type="button"
                                      onClick={() => handleRedirectToGeoTag(outLoc, 'OUT', item.punchOut)}
                                      className="p-1 rounded-md text-[#225091] hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                                      title="View on Geo-Tagging Map"
                                    >
                                      <Navigation size={13} className="text-[#225091]" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 font-mono">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </TableWrapper>
            </div>
          </div>

          {/* 4. 12-Month Yearly Matrix Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                12-Month Yearly Matrix ({year})
              </h4>
              {yearlySummary.averageAttendancePercentage !== undefined && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Yearly Avg: {yearlySummary.formattedAverageAttendance || `${yearlySummary.averageAttendancePercentage}%`}
                  {yearlySummary.totalPresentDaysYear !== undefined && ` (${yearlySummary.totalPresentDaysYear} Days)`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTH_SHORT_NAMES.map((mCode, idx) => {
                const monthNum = idx + 1;
                const found = yearlyMatrix.find(m => m.month === monthNum || m.code === mCode);
                const presentDays = found?.presentDays ?? 0;
                const totalDaysInM = found?.daysInMonth ?? 30;
                const pct = found?.attendancePercentage ?? (totalDaysInM > 0 ? Math.round((presentDays / totalDaysInM) * 100) : 0);
                const isSelected = month === monthNum;

                return (
                  <div 
                    key={mCode}
                    onClick={() => setMonth(monthNum)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/80 border-[#225091] shadow-xs ring-1 ring-[#225091]' 
                        : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold text-gray-500 uppercase block">{mCode}</span>
                    <strong className="text-sm font-extrabold text-gray-900 block my-0.5">{presentDays} Days</strong>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full font-semibold text-xs text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default SinglePersonAttendanceModal;
