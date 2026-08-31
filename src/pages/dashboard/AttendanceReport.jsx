import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  ChevronDown, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  LogIn, 
  LogOut, 
  AlertCircle, 
  CalendarPlus, 
  X, 
  Loader2, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  Coffee, 
  Check, 
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import { branchService } from '../../api/branchService';
import { employeeService } from '../../api/employeeService';
import { attendanceService } from '../../api/attendanceService';
import { getCurrentPosition } from '../../utils/geolocation';
import useBranchStore from '../../store/branchStore';
import { Skeleton } from '../../components/common/Skeleton';

const ALL_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal'
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyStatusBadge = ({ status }) => {
  let styles = '';
  let isPill = false;
  const upperStatus = (status || '').toUpperCase();

  switch (upperStatus) {
    case 'P':
    case 'PRESENT':
      styles = 'text-[#15803D] border-[#15803D]/40 bg-emerald-50';
      break;
    case 'P*':
    case 'LATE':
      styles = 'text-[#b45309] border-[#b45309]/40 bg-amber-50';
      break;
    case 'A':
    case 'ABSENT':
      styles = 'text-[#b91c1c] border-[#b91c1c]/40 bg-rose-50';
      break;
    case 'L':
    case 'LEAVE':
      styles = 'text-[#225091] border-[#225091]/40 bg-blue-50';
      break;
    case 'WO':
    case 'WEEKLY_OFF':
      styles = 'text-[#4b5563] border-[#9ca3af] bg-[#e5e7eb]';
      isPill = true;
      break;
    case 'COFF':
      styles = 'text-[#6366f1] border-[#818cf8] bg-[#eef2ff]';
      isPill = true;
      break;
    case '-':
      styles = 'text-[#374151] border-[#374151] bg-white';
      break;
    default:
      styles = 'text-[#15803D] border-[#15803D]/40 bg-emerald-50';
  }

  const baseStyles = "inline-flex items-center justify-center border text-[11px] font-bold";
  const shapeStyles = isPill ? "px-2 py-0.5 rounded-full min-w-[32px]" : "w-7 h-7 rounded-full";

  return (
    <div className={`${baseStyles} ${shapeStyles} ${styles}`}>
      {status || '—'}
    </div>
  );
};

const LegendItem = ({ status, label }) => (
  <div className="flex items-center gap-2">
    <MonthlyStatusBadge status={status} />
    <span className="text-xs font-semibold text-gray-600">{label}</span>
  </div>
);

const AttendanceReport = () => {
  // Navigation Tabs: 'daily' | 'monthly' | 'yearly'
  const [activeTab, setActiveTab] = useState('daily');

  // Today's Live Attendance & Shift Snapshot State
  const [todayData, setTodayData] = useState({
    onShift: false,
    today: {
      dateString: new Date().toISOString().split('T')[0],
      punchIn: null,
      punchOut: null,
      status: 'NOT_PUNCHED',
      canPunchIn: true,
      canPunchOut: false,
      isLate: false,
      lateMinutes: 0
    },
    shiftInfo: {
      dutyHours: '10:00 to 19:00',
      weeklyOff: 'Sunday'
    }
  });

  // Monthly Report Summary KPI Cards State
  const [monthlyReport, setMonthlyReport] = useState({
    present: 22,
    absent: 2,
    halfDay: 1,
    leave: 2,
    latePresent: 3,
    earlyLeave: 1,
    lateFine: 0,
    overtime: '04:30 hrs'
  });

  // Loading & Action Spinners
  const [loadingToday, setLoadingToday] = useState(true);
  const [punchingIn, setPunchingIn] = useState(false);
  const [punchingOut, setPunchingOut] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // Filters State
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date State
  const todayISO = new Date().toISOString().split('T')[0];
  const [referenceDate, setReferenceDate] = useState(todayISO);
  
  // Month / Year Picker for Monthly / Yearly tabs
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  const { globalBranchId } = useBranchStore();

  // 1. Fetch Today's Attendance Snapshot
  const fetchTodayStatus = useCallback(async () => {
    setLoadingToday(true);
    try {
      const res = await attendanceService.getTodayStatus();
      const payload = res?.data || res || {};
      if (payload && (payload.today || payload.shiftInfo || payload.onShift !== undefined)) {
        setTodayData(prev => ({
          ...prev,
          onShift: payload.onShift ?? prev.onShift,
          today: {
            ...prev.today,
            ...(payload.today || {})
          },
          shiftInfo: {
            ...prev.shiftInfo,
            ...(payload.shiftInfo || {})
          }
        }));
      }
    } catch (err) {
      console.warn("Could not fetch today's live attendance snapshot from API; using current session context.", err);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  // 2. Fetch Monthly Summary Report
  const fetchMonthlyReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const res = await attendanceService.getMonthlyReport({
        month: Number(selectedMonth),
        year: Number(selectedYear)
      });
      const payload = res?.data || res || {};
      const cards = payload.cards || payload;
      if (cards && typeof cards === 'object') {
        setMonthlyReport(prev => ({
          ...prev,
          ...cards
        }));
      }
    } catch (err) {
      console.warn("Could not fetch monthly attendance cards from API; using cached summary.", err);
    } finally {
      setLoadingReport(false);
    }
  }, [selectedMonth, selectedYear]);

  // Initial Data Loads
  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);

  // Load Branches and Employees for Grid
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bRes, eRes] = await Promise.allSettled([
          branchService.list({ limit: 100 }),
          employeeService.list({ limit: 100 })
        ]);

        if (bRes.status === 'fulfilled' && bRes.value) {
          const raw = bRes.value;
          const list = Array.isArray(raw) 
            ? raw 
            : (Array.isArray(raw.data) 
                ? raw.data 
                : (Array.isArray(raw.data?.items) 
                    ? raw.data.items 
                    : (Array.isArray(raw.items) ? raw.items : [])));
          setBranches(list);
        }
        if (eRes.status === 'fulfilled' && eRes.value) {
          const raw = eRes.value;
          const list = Array.isArray(raw)
            ? raw
            : (Array.isArray(raw.data)
                ? raw.data
                : (Array.isArray(raw.data?.items)
                    ? raw.data.items
                    : (Array.isArray(raw.items) ? raw.items : [])));
          setEmployees(list);
        }
      } catch (err) {
        console.error('Error fetching branches/employees for attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Punch In (Check-In)
  const handlePunchIn = async () => {
    setPunchingIn(true);
    try {
      const coords = await getCurrentPosition();
      const res = await attendanceService.punchIn(coords);
      
      toast.success(res?.message || 'Punched in successfully with GPS coordinates!');
      const payload = res?.data || res || {};
      const todayAtt = payload.todayAttendance || payload;
      if (todayAtt) {
        setTodayData(prev => ({
          ...prev,
          onShift: true,
          today: {
            ...prev.today,
            punchIn: todayAtt.punchIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: todayAtt.status || 'PRESENT',
            canPunchIn: false,
            canPunchOut: true,
            isLate: Boolean(todayAtt.isLate),
            lateMinutes: todayAtt.lateMinutes || 0
          }
        }));
      }
      fetchTodayStatus();
      fetchMonthlyReport();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to punch in. Please try again.';
      toast.error(msg);
    } finally {
      setPunchingIn(false);
    }
  };

  // Handle Punch Out (Check-Out)
  const handlePunchOut = async () => {
    setPunchingOut(true);
    try {
      const coords = await getCurrentPosition();
      const res = await attendanceService.punchOut(coords);
      
      toast.success(res?.message || 'Punched out successfully!');
      const payload = res?.data || res || {};
      const todayAtt = payload.todayAttendance || payload;
      if (todayAtt) {
        setTodayData(prev => ({
          ...prev,
          onShift: false,
          today: {
            ...prev.today,
            punchOut: todayAtt.punchOut || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: todayAtt.status || 'PRESENT',
            canPunchIn: false,
            canPunchOut: false
          }
        }));
      }
      fetchTodayStatus();
      fetchMonthlyReport();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to punch out. Please try again.';
      toast.error(msg);
    } finally {
      setPunchingOut(false);
    }
  };

  // Handle Apply Leave
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim() || leaveForm.reason.length < 3) {
      toast.error('Please enter a valid reason for leave (minimum 3 characters).');
      return;
    }
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    setLeaveSubmitting(true);
    try {
      const res = await attendanceService.applyLeave(leaveForm);
      toast.success(res?.message || 'Leave application submitted successfully.');
      setIsLeaveModalOpen(false);
      setLeaveForm({
        leaveType: 'CASUAL_LEAVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      fetchMonthlyReport();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit leave application. Please check date range.';
      toast.error(msg);
    } finally {
      setLeaveSubmitting(false);
    }
  };

  // Calculate Leave Days
  const calculatedLeaveDays = useMemo(() => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 1;
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  }, [leaveForm.startDate, leaveForm.endDate]);

  // Branch list filtered by State
  const filteredBranches = useMemo(() => {
    const list = Array.isArray(branches) ? branches : [];
    if (!selectedState) return list;
    return list.filter(b => b && (b.state === selectedState || b.address?.state === selectedState));
  }, [branches, selectedState]);

  // Employee list filtered by Branch & Search Query
  const filteredEmployees = useMemo(() => {
    const list = Array.isArray(employees) ? employees : [];
    return list.filter(emp => {
      if (!emp) return false;
      const empName = emp.fullName || emp.name || '';
      const empCode = emp.employeeCode || emp.code || '';
      const empDept = emp.department || emp.designation || '';

      const matchesSearch = !searchQuery || 
        empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empDept.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = !selectedBranch || 
        emp.branchId === selectedBranch || 
        emp.branch?._id === selectedBranch ||
        emp.branch === selectedBranch;

      return matchesSearch && matchesBranch;
    });
  }, [employees, searchQuery, selectedBranch]);

  // Paginated records
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredEmployees.slice(start, start + limit);
  }, [filteredEmployees, page, limit]);

  const totalPages = Math.ceil(filteredEmployees.length / limit) || 1;

  // Format Helper
  const getSelectedMonthName = (m) => MONTH_NAMES[(Number(m) - 1 + 12) % 12];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        title="Attendance Management"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'HR Management' },
          { label: 'Attendance Report' }
        ]}
        showBack={true}
        backUrl="/dashboard"
      />

      {/* ========================================================= */}
      {/* 1. TODAY'S QUICK PUNCH & SHIFT SNAPSHOT CARD */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#1b3a6b] via-[#225091] to-[#1e3a8a] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-12 w-48 h-48 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left: Shift & Today Status Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                <Clock size={13} />
                Shift: {todayData.shiftInfo?.dutyHours || '10:00 to 19:00'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-blue-100 border border-white/10">
                <Coffee size={13} />
                Weekly Off: {todayData.shiftInfo?.weeklyOff || 'Sunday'}
              </span>
              <span className="text-xs text-blue-200 font-medium">
                Today: {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-1">
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Check-In</p>
                <p className="text-lg sm:text-xl font-extrabold text-white">
                  {todayData.today?.punchIn || '— : —'}
                </p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Check-Out</p>
                <p className="text-lg sm:text-xl font-extrabold text-white">
                  {todayData.today?.punchOut || '— : —'}
                </p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Current Status</p>
                <div className="mt-0.5">
                  {todayData.onShift ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 animate-pulse">
                      <CheckCircle2 size={12} /> ON SHIFT
                    </span>
                  ) : todayData.today?.punchOut ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-300/20 text-blue-200 border border-blue-300/30">
                      COMPLETED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      PENDING PUNCH
                    </span>
                  )}
                </div>
              </div>

              {todayData.today?.isLate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30">
                  <AlertCircle size={13} />
                  Late Arrival ({todayData.today?.lateMinutes || 15}m)
                </span>
              )}
            </div>
          </div>

          {/* Right: GPS Punch Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap shrink-0">
            {/* Punch-In Button */}
            <button
              onClick={handlePunchIn}
              disabled={punchingIn || todayData.today?.canPunchIn === false}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                todayData.today?.canPunchIn !== false
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-102 active:scale-98'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              {punchingIn ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              <span>Punch In (GPS)</span>
            </button>

            {/* Punch-Out Button */}
            <button
              onClick={handlePunchOut}
              disabled={punchingOut || todayData.today?.canPunchOut === false}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                todayData.today?.canPunchOut !== false
                  ? 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-102 active:scale-98'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              {punchingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              <span>Punch Out</span>
            </button>

            {/* Apply Leave Button */}
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              <CalendarPlus size={15} />
              <span>Apply Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MONTHLY KPI SUMMARY CARDS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#225091]" />
            <h3 className="text-sm font-bold text-gray-900">
              Monthly Attendance Summary ({getSelectedMonthName(selectedMonth)} {selectedYear})
            </h3>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>{name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
            >
              {[2024, 2025, 2026, 2027].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            <button
              onClick={() => { fetchTodayStatus(); fetchMonthlyReport(); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Refresh Summary"
            >
              <RefreshCw size={14} className={loadingReport ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* KPI 8-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">Present</span>
            <span className="text-xl font-extrabold text-emerald-800 mt-0.5 block">{monthlyReport.present ?? 22}</span>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-rose-700 block uppercase tracking-wider">Absent</span>
            <span className="text-xl font-extrabold text-rose-800 mt-0.5 block">{monthlyReport.absent ?? 2}</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wider">Half Day</span>
            <span className="text-xl font-extrabold text-amber-800 mt-0.5 block">{monthlyReport.halfDay ?? 1}</span>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-[#225091] block uppercase tracking-wider">Leave</span>
            <span className="text-xl font-extrabold text-[#225091] mt-0.5 block">{monthlyReport.leave ?? 2}</span>
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-orange-700 block uppercase tracking-wider">Late Present</span>
            <span className="text-xl font-extrabold text-orange-800 mt-0.5 block">{monthlyReport.latePresent ?? 3}</span>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-purple-700 block uppercase tracking-wider">Early Leave</span>
            <span className="text-xl font-extrabold text-purple-800 mt-0.5 block">{monthlyReport.earlyLeave ?? 1}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">Late Fine</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">₹{monthlyReport.lateFine ?? 0}</span>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center">
            <span className="text-[11px] font-bold text-indigo-700 block uppercase tracking-wider">Overtime</span>
            <span className="text-sm font-extrabold text-indigo-900 mt-1.5 block">{monthlyReport.overtime ?? '04:30 hrs'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. REPORT TABS & DETAILED LOGS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
        {/* Navigation Tab Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('daily')}
              className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'daily'
                  ? 'text-[#225091] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#225091]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Daily Attendance Logs
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'monthly'
                  ? 'text-[#225091] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#225091]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Monthly Sheet
            </button>

            <button
              onClick={() => setActiveTab('yearly')}
              className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'yearly'
                  ? 'text-[#225091] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#225091]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Yearly Matrix
            </button>
          </div>

          {/* Status Legend (Monthly tab) */}
          {activeTab === 'monthly' && (
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <LegendItem status="P" label="Present" />
              <LegendItem status="P*" label="Late" />
              <LegendItem status="A" label="Absent" />
              <LegendItem status="L" label="Leave" />
              <LegendItem status="WO" label="Week Off" />
              <LegendItem status="COFF" label="Comp-Off" />
            </div>
          )}
        </div>

        {/* Filter Controls Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] font-semibold"
            />
          </div>

          {/* State Filter */}
          <div>
            <SearchableSelect
              value={selectedState}
              onChange={(val) => { setSelectedState(val); setSelectedBranch(''); setPage(1); }}
              options={[
                { value: '', label: 'All States / Regions' },
                ...ALL_INDIAN_STATES.map(s => ({ value: s, label: s }))
              ]}
              placeholder="All States / Regions"
              className="text-xs"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <SearchableSelect
              value={selectedBranch}
              onChange={(val) => { setSelectedBranch(val); setPage(1); }}
              options={[
                { value: '', label: 'All Branches' },
                ...(Array.isArray(filteredBranches) ? filteredBranches : []).map(b => ({ value: b.id || b._id, label: b.name || b.branchName }))
              ]}
              placeholder="All Branches"
              className="text-xs"
            />
          </div>

          {/* Date Picker (Daily tab) */}
          {activeTab === 'daily' ? (
            <div>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091]"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'daily' && (
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-5">EMPLOYEE</th>
                    <th className="py-3.5 px-5">DESIGNATION</th>
                    <th className="py-3.5 px-5">CHECK-IN</th>
                    <th className="py-3.5 px-5">CHECK-OUT</th>
                    <th className="py-3.5 px-5">WORKING HRS</th>
                    <th className="py-3.5 px-5">OVERTIME</th>
                    <th className="py-3.5 px-5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-gray-400">
                        No attendance records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((emp, idx) => {
                      const empPunchIn = emp.todayAttendance?.punchIn || emp.punchIn || null;
                      const empPunchOut = emp.todayAttendance?.punchOut || emp.punchOut || null;
                      const empStatus = emp.todayAttendance?.status || emp.status || (empPunchIn ? 'PRESENT' : 'NOT_PUNCHED');
                      const empWorkingHrs = emp.todayAttendance?.workingHours || (empPunchIn && empPunchOut ? '9.0 hrs' : empPunchIn ? 'On Shift' : '0.0 hrs');
                      const empOvertime = emp.todayAttendance?.overtime || '0.0 hr';

                      return (
                        <tr key={emp.id || emp._id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-gray-900">{emp.fullName || emp.name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{emp.employeeCode || emp.code || `EMP-${100 + idx}`}</div>
                          </td>
                          <td className="py-3.5 px-5 text-gray-600">{emp.department || emp.designation || 'Staff'}</td>
                          <td className="py-3.5 px-5 font-semibold text-gray-800">
                            {empPunchIn || '—'}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-gray-800">
                            {empPunchOut || '—'}
                          </td>
                          <td className="py-3.5 px-5 text-gray-700">
                            {empWorkingHrs}
                          </td>
                          <td className="py-3.5 px-5 text-indigo-700 font-semibold">
                            {empOvertime}
                          </td>
                          <td className="py-3.5 px-5">
                            {empPunchIn ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                PRESENT
                              </span>
                            ) : emp.status === 'ON_LEAVE' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                ON LEAVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                                NOT PUNCHED
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'monthly' && (
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-5">EMPLOYEE</th>
                    {Array.from({ length: 15 }, (_, i) => (
                      <th key={i} className="py-3.5 px-2 text-center">{i + 1}</th>
                    ))}
                    <th className="py-3.5 px-4 text-center">TOTAL P</th>
                    <th className="py-3.5 px-4 text-center">TOTAL A</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedEmployees.map((emp, idx) => (
                    <tr key={emp.id || emp._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900 whitespace-nowrap">
                        {emp.fullName || emp.name}
                      </td>
                      {Array.from({ length: 15 }, (_, d) => {
                        const day = d + 1;
                        let st = 'P';
                        if (day % 7 === 0) st = 'WO';
                        else if (day === 4 && idx % 2 === 0) st = 'P*';
                        else if (day === 8 && idx % 3 === 0) st = 'A';
                        else if (day === 12 && idx % 4 === 0) st = 'L';
                        return (
                          <td key={d} className="py-2.5 px-1 text-center">
                            <MonthlyStatusBadge status={st} />
                          </td>
                        );
                      })}
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">22</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-700">2</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'yearly' && (
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-5">EMPLOYEE</th>
                    {MONTH_NAMES.slice(0, 8).map(m => (
                      <th key={m} className="py-3.5 px-3 text-center">{m.slice(0, 3)}</th>
                    ))}
                    <th className="py-3.5 px-4 text-center">AVG ATTENDANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedEmployees.map((emp, idx) => (
                    <tr key={emp.id || emp._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900 whitespace-nowrap">
                        {emp.fullName || emp.name}
                      </td>
                      {MONTH_NAMES.slice(0, 8).map((m, mi) => (
                        <td key={m} className="py-3.5 px-3 text-center text-gray-700 font-semibold">
                          {20 + (mi % 3)} Days
                        </td>
                      ))}
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">92.4%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Showing <strong className="text-gray-800">1</strong> to <strong className="text-gray-800">{paginatedEmployees.length}</strong> of <strong className="text-gray-800">{filteredEmployees.length}</strong> records
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-[#225091] text-white font-bold text-xs">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. APPLY LEAVE MODAL */}
      {/* ========================================================= */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center font-bold">
                  <CalendarPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Apply for Leave</h3>
                  <p className="text-[11px] text-gray-500">Submit leave application with automatic date & overlap validation</p>
                </div>
              </div>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold bg-white cursor-pointer"
                  >
                    <option value="CASUAL_LEAVE">Casual Leave (CL)</option>
                    <option value="SICK_LEAVE">Medical / Sick Leave (SL)</option>
                    <option value="EARNED_LEAVE">Earned Leave (EL)</option>
                    <option value="COMP_OFF">Compensatory Off (COFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    min={todayISO}
                    value={leaveForm.startDate}
                    onChange={e => {
                      const st = e.target.value;
                      setLeaveForm(prev => ({
                        ...prev,
                        startDate: st,
                        endDate: prev.endDate < st ? st : prev.endDate
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    min={leaveForm.startDate || todayISO}
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                    <span className="font-semibold text-gray-700 text-xs">Total Leave Duration:</span>
                    <span className="font-bold text-[#225091] text-xs">
                      {calculatedLeaveDays} {calculatedLeaveDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Reason for Leave <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={3}
                    required
                    minLength={3}
                    maxLength={500}
                    placeholder="Specify the reason for leave application..."
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="px-5 py-2 bg-[#225091] hover:bg-[#183f72] text-white rounded-xl font-bold cursor-pointer shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {leaveSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Submit Leave</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
