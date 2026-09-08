import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  X, 
  Loader2, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  Coffee, 
  Check, 
  ArrowRight,
  Briefcase,
  Building2,
  Users,
  Percent,
  CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import StatsCard from '../../components/common/StatsCard';
import SearchableSelect from '../../components/common/SearchableSelect';
import { branchService } from '../../api/branchService';
import { attendanceService } from '../../api/attendanceService';
import { getCurrentPosition } from '../../utils/geolocation';
import useBranchStore from '../../store/branchStore';
import { Skeleton, SkeletonTableRow } from '../../components/common/Skeleton';

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

const MONTH_SHORT_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => 2020 + i); // 2020 to 2035

const MonthlyStatusBadge = ({ status }) => {
  let styles = '';
  let isPill = false;
  const upperStatus = (status || '').toUpperCase().trim();

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
    case 'HD':
    case 'HALF_DAY':
      styles = 'text-[#7c3aed] border-[#7c3aed]/40 bg-purple-50';
      break;
    case 'WO':
    case 'WEEKLY_OFF':
      styles = 'text-[#4b5563] border-[#9ca3af] bg-[#e5e7eb]';
      isPill = true;
      break;
    case 'COFF':
    case 'COMP_OFF':
      styles = 'text-[#6366f1] border-[#818cf8] bg-[#eef2ff]';
      isPill = true;
      break;
    case '-':
    case '—':
    case '':
      styles = 'text-gray-300 border-gray-200 bg-gray-50/50';
      break;
    default:
      styles = 'text-[#15803D] border-[#15803D]/40 bg-emerald-50';
  }

  const baseStyles = "inline-flex items-center justify-center border text-[11px] font-bold";
  const shapeStyles = isPill ? "px-1.5 py-0.5 rounded-full min-w-[28px]" : "w-6 h-6 rounded-full";

  return (
    <div className={`${baseStyles} ${shapeStyles} ${styles}`} title={upperStatus || 'Not Recorded'}>
      {upperStatus || '—'}
    </div>
  );
};

const LegendItem = ({ status, label }) => (
  <div className="flex items-center gap-1.5">
    <MonthlyStatusBadge status={status} />
    <span className="text-xs font-semibold text-gray-600">{label}</span>
  </div>
);

const AttendanceReport = () => {
  const tableRef = useRef(null);
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

  // Monthly Report Summary KPI Cards State (Top snapshot)
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

  // Filters & State Options (Section 1.1 /filters API)
  const [apiStates, setApiStates] = useState([]);
  const [apiBranches, setApiBranches] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Date State for Daily Tab
  const todayISO = new Date().toISOString().split('T')[0];
  const [referenceDate, setReferenceDate] = useState(todayISO);
  
  // Month / Year Picker for Monthly / Yearly tabs
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Section 1.2: Daily Attendance Report Data State
  const [reportItems, setReportItems] = useState([]);
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState({
    totalRecords: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Section 5: Monthly Attendance Sheet Data State
  const [monthlySheetData, setMonthlySheetData] = useState({
    month: 8,
    year: 2026,
    monthName: 'August 2026',
    daysInMonth: 31,
    summaryStats: {
      totalEmployees: 0,
      totalPresentDays: 0,
      totalAbsentDays: 0,
      totalLeaveDays: 0,
      totalHalfDays: 0,
      averageAttendancePercentage: 0
    },
    items: [],
    meta: {
      totalRecords: 0,
      limit: 10,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
  const [loadingMonthlySheet, setLoadingMonthlySheet] = useState(false);
  const [monthlyPage, setMonthlyPage] = useState(1);

  // Section 6: Yearly Attendance Matrix Data State
  const [yearlyMatrixData, setYearlyMatrixData] = useState({
    year: new Date().getFullYear(),
    selectedMonth: null,
    summaryStats: {
      totalEmployees: 0,
      averageAttendancePercentage: 0,
      formattedAverageAttendance: '0%'
    },
    items: [],
    meta: {
      totalRecords: 0,
      limit: 10,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
  const [loadingYearlyMatrix, setLoadingYearlyMatrix] = useState(false);
  const [yearlyPage, setYearlyPage] = useState(1);
  const [yearlyMonthFilter, setYearlyMonthFilter] = useState(''); // '' for all months, or 1..12

  const { globalBranchId } = useBranchStore();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      setMonthlyPage(1);
      setYearlyPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Fetch Today's Attendance Snapshot (Self / Shift details)
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

  // 2. Fetch Monthly KPI Summary Cards
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

  // 3. Section 1.1: Fetch Attendance Filter Options (States & Branches)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const params = {};
      if (selectedState) {
        params.state = selectedState;
      }
      const res = await attendanceService.getReportFilters(params);
      if (res && (res.success || res.statusCode === 200)) {
        const data = res.data || {};
        if (Array.isArray(data.states) && data.states.length > 0) {
          setApiStates(data.states);
        }
        if (Array.isArray(data.branches)) {
          setApiBranches(data.branches);
        }
      }
    } catch (err) {
      console.warn("Could not load filters from attendance-report/filters API; falling back to branch service list.", err);
      try {
        const bRes = await branchService.list({ limit: 100 });
        if (bRes && bRes.success) {
          const list = Array.isArray(bRes.data) 
            ? bRes.data 
            : (bRes.data?.branches || bRes.data?.items || []);
          setApiBranches(list);
        }
      } catch (e) {
        console.error("Fallback branch list error:", e);
      }
    }
  }, [selectedState]);

  // 4. Section 1.2: Fetch Daily Attendance Report Data
  const fetchDailyAttendanceReport = useCallback(async () => {
    if (activeTab !== 'daily') return;
    setLoadingReportData(true);
    try {
      const params = {
        period: 'DAILY',
        page,
        limit,
        date: referenceDate
      };

      if (selectedState) params.state = selectedState;
      const activeBranch = selectedBranch || globalBranchId;
      if (activeBranch) params.branchId = activeBranch;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await attendanceService.getAttendanceReport(params);
      if (res && (res.success || res.statusCode === 200)) {
        const items = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.items) ? res.data.items : []);
        setReportItems(items);

        const metaPayload = res.meta || res.pagination || res.data?.meta;
        if (metaPayload) {
          setMeta({
            totalRecords: Number(metaPayload.totalRecords ?? items.length),
            limit: Number(metaPayload.limit ?? limit),
            page: Number(metaPayload.page ?? page),
            totalPages: Number((metaPayload.totalPages ?? Math.ceil(items.length / limit)) || 1),
            hasNextPage: Boolean(metaPayload.hasNextPage),
            hasPrevPage: Boolean(metaPayload.hasPrevPage)
          });
        } else {
          setMeta({
            totalRecords: items.length,
            limit,
            page,
            totalPages: Math.ceil(items.length / limit) || 1,
            hasNextPage: page < Math.ceil(items.length / limit),
            hasPrevPage: page > 1
          });
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch attendance report');
      }
    } catch (err) {
      console.error('Error fetching attendance report:', err);
      setReportItems([]);
    } finally {
      setLoadingReportData(false);
    }
  }, [activeTab, page, limit, selectedState, selectedBranch, globalBranchId, debouncedSearch, referenceDate]);

  // 5. Section 5: Fetch All Employee Monthly Attendance Sheet Data
  const fetchMonthlySheet = useCallback(async () => {
    if (activeTab !== 'monthly') return;
    setLoadingMonthlySheet(true);
    try {
      const params = {
        month: Number(selectedMonth),
        year: Number(selectedYear),
        page: monthlyPage,
        limit: 10
      };

      if (selectedState) params.state = selectedState;
      const activeBranch = selectedBranch || globalBranchId;
      if (activeBranch) params.branchId = activeBranch;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await attendanceService.getMonthlySheet(params);
      if (res && (res.success || res.statusCode === 200)) {
        const dataPayload = res.data || {};
        const items = Array.isArray(dataPayload.items) 
          ? dataPayload.items 
          : (Array.isArray(dataPayload) ? dataPayload : []);
        
        const daysInMonth = Number(dataPayload.daysInMonth) || new Date(selectedYear, selectedMonth, 0).getDate();

        setMonthlySheetData({
          month: dataPayload.month || selectedMonth,
          year: dataPayload.year || selectedYear,
          monthName: dataPayload.monthName || `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
          daysInMonth,
          summaryStats: dataPayload.summaryStats || {
            totalEmployees: items.length,
            totalPresentDays: 0,
            totalAbsentDays: 0,
            totalLeaveDays: 0,
            totalHalfDays: 0,
            averageAttendancePercentage: 0
          },
          items,
          meta: dataPayload.meta || res.meta || {
            totalRecords: items.length,
            limit: 10,
            page: monthlyPage,
            totalPages: Math.ceil(items.length / 10) || 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      } else {
        throw new Error(res?.message || 'Failed to fetch monthly attendance sheet');
      }
    } catch (err) {
      console.error('Error fetching monthly attendance sheet:', err);
      // Fallback empty data structure
      setMonthlySheetData(prev => ({
        ...prev,
        items: [],
        daysInMonth: new Date(selectedYear, selectedMonth, 0).getDate()
      }));
    } finally {
      setLoadingMonthlySheet(false);
    }
  }, [activeTab, selectedMonth, selectedYear, monthlyPage, selectedState, selectedBranch, globalBranchId, debouncedSearch]);

  // 6. Section 6: Fetch All Employee Yearly Attendance Matrix Data
  const fetchYearlyMatrix = useCallback(async () => {
    if (activeTab !== 'yearly') return;
    setLoadingYearlyMatrix(true);
    try {
      const params = {
        year: Number(selectedYear),
        page: yearlyPage,
        limit: 10
      };

      if (yearlyMonthFilter) {
        params.month = Number(yearlyMonthFilter);
      }
      if (selectedState) params.state = selectedState;
      const activeBranch = selectedBranch || globalBranchId;
      if (activeBranch) params.branchId = activeBranch;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await attendanceService.getYearlyMatrix(params);
      if (res && (res.success || res.statusCode === 200)) {
        const dataPayload = res.data || {};
        const items = Array.isArray(dataPayload.items)
          ? dataPayload.items
          : (Array.isArray(dataPayload) ? dataPayload : []);

        setYearlyMatrixData({
          year: dataPayload.year || selectedYear,
          selectedMonth: dataPayload.selectedMonth !== undefined ? dataPayload.selectedMonth : (yearlyMonthFilter ? Number(yearlyMonthFilter) : null),
          summaryStats: dataPayload.summaryStats || {
            totalEmployees: items.length,
            averageAttendancePercentage: 0,
            formattedAverageAttendance: '0%'
          },
          items,
          meta: dataPayload.meta || res.meta || {
            totalRecords: items.length,
            limit: 10,
            page: yearlyPage,
            totalPages: Math.ceil(items.length / 10) || 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      } else {
        throw new Error(res?.message || 'Failed to fetch yearly attendance matrix');
      }
    } catch (err) {
      console.error('Error fetching yearly attendance matrix:', err);
      setYearlyMatrixData(prev => ({
        ...prev,
        items: [],
        meta: {
          totalRecords: 0,
          limit: 10,
          page: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      }));
    } finally {
      setLoadingYearlyMatrix(false);
    }
  }, [activeTab, selectedYear, yearlyMonthFilter, yearlyPage, selectedState, selectedBranch, globalBranchId, debouncedSearch]);

  // Initial and reactive effects
  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyAttendanceReport();
    } else if (activeTab === 'monthly') {
      fetchMonthlySheet();
    } else if (activeTab === 'yearly') {
      fetchYearlyMatrix();
    }
  }, [activeTab, fetchDailyAttendanceReport, fetchMonthlySheet, fetchYearlyMatrix]);

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
      fetchMonthlyReport();
      if (activeTab === 'daily') fetchDailyAttendanceReport();
      if (activeTab === 'monthly') fetchMonthlySheet();
      if (activeTab === 'yearly') fetchYearlyMatrix();
    } catch (err) {
      console.error('Punch in error:', err);
      toast.error(err.response?.data?.message || err.message || 'Punch in failed. Ensure location permissions are enabled.');
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
            status: todayAtt.status || 'COMPLETED',
            canPunchOut: false
          }
        }));
      }
      fetchMonthlyReport();
      if (activeTab === 'daily') fetchDailyAttendanceReport();
      if (activeTab === 'monthly') fetchMonthlySheet();
      if (activeTab === 'yearly') fetchYearlyMatrix();
    } catch (err) {
      console.error('Punch out error:', err);
      toast.error(err.response?.data?.message || err.message || 'Punch out failed.');
    } finally {
      setPunchingOut(false);
    }
  };

  // Combined States List
  const mergedStatesList = useMemo(() => {
    if (apiStates.length > 0) return apiStates;
    return ALL_INDIAN_STATES;
  }, [apiStates]);

  const getSelectedMonthName = (monthNum) => MONTH_NAMES[monthNum - 1] || 'Current Month';

  return (
    <div className="w-full flex flex-col gap-6 font-sans antialiased pb-16">
      <PageHeader
        title="Attendance Report"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "Attendance Report" }
        ]}
        showBack={false}
        backUrl="/dashboard"
      />

      {/* ========================================================= */}
      {/* 1. TOP QUICK PUNCH & LIVE SHIFT SNAPSHOT CARD */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-[#225091] via-[#1b3f72] to-[#122e54] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Employee Shift & Live Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20 flex items-center gap-1.5">
                <Clock size={13} />
                Shift: {todayData.shiftInfo?.dutyHours || '10:00 to 19:00'}
              </span>
              <span className="text-xs text-white/80 font-medium">
                Off: <strong className="text-white">{todayData.shiftInfo?.weeklyOff || 'Sunday'}</strong>
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Society Attendance Operations</span>
              {todayData.onShift ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ON SHIFT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/70 border border-white/15">
                  OFF SHIFT
                </span>
              )}
            </h2>

            {/* Check-In / Check-Out Badges */}
            <div className="flex items-center gap-4 text-xs font-medium text-white/90 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <LogIn size={14} className="text-emerald-400" />
                <span>Punch-In:</span>
                <strong className="text-white font-mono">{todayData.today?.punchIn || 'Not Recorded'}</strong>
              </div>

              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <LogOut size={14} className="text-amber-400" />
                <span>Punch-Out:</span>
                <strong className="text-white font-mono">{todayData.today?.punchOut || 'Not Recorded'}</strong>
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
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setPage(1);
                setMonthlyPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>{name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setPage(1);
                setMonthlyPage(1);
                setYearlyPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
            >
              {YEAR_OPTIONS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            <button
              onClick={() => { 
                fetchTodayStatus(); 
                fetchMonthlyReport(); 
                if (activeTab === 'daily') fetchDailyAttendanceReport();
                if (activeTab === 'monthly') fetchMonthlySheet(); 
                if (activeTab === 'yearly') fetchYearlyMatrix();
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Refresh Summary"
            >
              <RefreshCw size={14} className={loadingReport || loadingMonthlySheet || loadingYearlyMatrix || loadingReportData ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* KPI 8-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatsCard
            layout="centered"
            color="emerald"
            label="Present"
            value={monthlyReport.present ?? 22}
          />
          <StatsCard
            layout="centered"
            color="rose"
            label="Absent"
            value={monthlyReport.absent ?? 2}
          />
          <StatsCard
            layout="centered"
            color="amber"
            label="Half Day"
            value={monthlyReport.halfDay ?? 1}
          />
          <StatsCard
            layout="centered"
            color="blue"
            label="Leave"
            value={monthlyReport.leave ?? 2}
          />
          <StatsCard
            layout="centered"
            color="amber"
            label="Late Present"
            value={monthlyReport.latePresent ?? 3}
          />
          <StatsCard
            layout="centered"
            color="purple"
            label="Early Leave"
            value={monthlyReport.earlyLeave ?? 1}
          />
          <StatsCard
            layout="centered"
            color="gray"
            label="Late Fine"
            value={`₹${monthlyReport.lateFine ?? 0}`}
          />
          <StatsCard
            layout="centered"
            color="indigo"
            label="Overtime"
            value={monthlyReport.overtime ?? '04:30 hrs'}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SECTION 1 & 5: ATTENDANCE REPORT & MONTHLY MATRIX */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
        {/* Navigation Tab Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => { setActiveTab('daily'); setPage(1); }}
              className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'daily'
                  ? 'text-[#225091] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#225091]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Daily Attendance Logs
            </button>

            <button
              onClick={() => { setActiveTab('monthly'); setMonthlyPage(1); }}
              className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'monthly'
                  ? 'text-[#225091] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#225091]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Monthly Sheet
            </button>

            <button
              onClick={() => { setActiveTab('yearly'); setYearlyPage(1); }}
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
            <div className="flex items-center gap-3.5 flex-wrap text-xs">
              <LegendItem status="P" label="Present" />
              <LegendItem status="P*" label="Late" />
              <LegendItem status="A" label="Absent" />
              <LegendItem status="L" label="Leave" />
              <LegendItem status="HD" label="Half Day" />
              <LegendItem status="WO" label="Week Off" />
              <LegendItem status="COFF" label="Comp-Off" />
            </div>
          )}
        </div>

        {/* Section 1.1 Filter Controls Toolbar (State, Branch, Search, Date/Period) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input
              type="text"
              placeholder="Search employee, code, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] font-semibold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* State Filter (Section 1.1) */}
          <div>
            <SearchableSelect
              value={selectedState}
              onChange={(val) => { 
                setSelectedState(val); 
                setSelectedBranch(''); 
                setPage(1); 
                setMonthlyPage(1);
                setYearlyPage(1);
              }}
              options={[
                { value: '', label: 'All States / Regions' },
                ...mergedStatesList.map(s => ({ value: s, label: s }))
              ]}
              placeholder="All States / Regions"
              searchPlaceholder="Search state..."
              className="text-xs"
            />
          </div>

          {/* Branch Filter (Section 1.1 Scoped by state) */}
          <div>
            <SearchableSelect
              value={selectedBranch}
              onChange={(val) => { 
                setSelectedBranch(val); 
                setPage(1); 
                setMonthlyPage(1);
                setYearlyPage(1);
              }}
              options={[
                { value: '', label: 'All Branches' },
                ...apiBranches.map(b => ({ 
                  value: b.id || b._id, 
                  label: b.name ? `${b.name}${b.code ? ` (${b.code})` : ''}` : (b.branchName || b.id) 
                }))
              ]}
              placeholder="All Branches"
              searchPlaceholder="Search branch..."
              className="text-xs"
            />
          </div>

          {/* Date Picker (Daily tab) or Month/Year for Monthly or Year/Month for Yearly */}
          {activeTab === 'daily' ? (
            <div className="relative">
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => {
                  setReferenceDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer"
              />
            </div>
          ) : activeTab === 'monthly' ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setMonthlyPage(1);
                }}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setMonthlyPage(1);
                }}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white cursor-pointer"
              >
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setYearlyPage(1);
                }}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white cursor-pointer"
              >
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={yearlyMonthFilter}
                onChange={(e) => {
                  setYearlyMonthFilter(e.target.value);
                  setYearlyPage(1);
                }}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white cursor-pointer"
              >
                <option value="">All Months</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m.slice(0, 3)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Section 5: Monthly Sheet Aggregated Summary Ribbon */}
        {activeTab === 'monthly' && monthlySheetData.summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#225091]" />
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase">Employees</span>
                <strong className="text-gray-900 font-bold text-sm">{monthlySheetData.summaryStats.totalEmployees || monthlySheetData.items.length}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase">Present Days</span>
                <strong className="text-emerald-700 font-bold text-sm">{monthlySheetData.summaryStats.totalPresentDays || 0}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase">Absent Days</span>
                <strong className="text-rose-700 font-bold text-sm">{monthlySheetData.summaryStats.totalAbsentDays || 0}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coffee size={16} className="text-amber-600" />
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase">Leave Days</span>
                <strong className="text-amber-700 font-bold text-sm">{monthlySheetData.summaryStats.totalLeaveDays || 0}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Percent size={16} className="text-indigo-600" />
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase">Avg Attendance</span>
                <strong className="text-indigo-700 font-bold text-sm">{monthlySheetData.summaryStats.averageAttendancePercentage ?? 0}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Yearly Matrix Aggregated Summary Ribbon */}
        {activeTab === 'yearly' && yearlyMatrixData.summaryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 border border-blue-100/80 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#225091] flex items-center justify-center font-bold shrink-0">
                <Users size={18} />
              </div>
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase tracking-wider">Total Employees</span>
                <strong className="text-gray-900 font-bold text-base">
                  {yearlyMatrixData.summaryStats.totalEmployees || yearlyMatrixData.items.length}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Percent size={18} />
              </div>
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase tracking-wider">Average Attendance</span>
                <strong className="text-emerald-700 font-bold text-base">
                  {yearlyMatrixData.summaryStats.formattedAverageAttendance || `${yearlyMatrixData.summaryStats.averageAttendancePercentage ?? 0}%`}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                <CalendarDays size={18} />
              </div>
              <div>
                <span className="text-gray-500 font-medium block text-[10px] uppercase tracking-wider">Evaluation Period</span>
                <strong className="text-indigo-900 font-bold text-base">
                  {selectedYear} {yearlyMonthFilter ? `(${MONTH_NAMES[Number(yearlyMonthFilter) - 1]})` : '(Full Year)'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
          <TableWrapper minHeight="360px">
            {/* TAB 1: DAILY LOGS (Section 1.2) */}
            {activeTab === 'daily' && (
              <table ref={tableRef} className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap text-center w-14">SR.NO.</th>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">EMPLOYEE</th>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">DESIGNATION</th>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">CHECK-IN</th>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">CHECK-OUT</th>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">WORKING HRS</th>
                    <th className="py-3.5 px-4 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loadingReportData ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <SkeletonTableRow key={idx} columns={7} />
                    ))
                  ) : reportItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users size={32} className="text-gray-300 stroke-[1.5]" />
                          <span className="text-sm font-medium text-gray-500">No attendance records found</span>
                          <span className="text-xs text-gray-400">No staff attendance logged for the selected date and filters</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reportItems.map((emp, idx) => {
                      const empSrNo = emp.srNo ?? ((page - 1) * limit + idx + 1);
                      const empPunchIn = emp.punchIn || null;
                      const empPunchOut = emp.punchOut || null;
                      const empTotalHrs = emp.totalHrs || (empPunchIn && empPunchOut ? '8 hrs' : empPunchIn ? 'On Shift' : null);
                      const empStatus = (emp.status || (empPunchIn ? 'P' : 'A')).toUpperCase();

                      return (
                        <tr key={emp.id || emp._id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-center font-bold text-gray-500">
                            {empSrNo}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {emp.profileImage ? (
                                <img 
                                  src={emp.profileImage} 
                                  alt={emp.name} 
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] font-bold text-xs flex items-center justify-center uppercase shrink-0 border border-blue-100">
                                  {(emp.name || 'E').slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900">{emp.name}</div>
                                {emp.id && (
                                  <div className="text-[10px] text-gray-400 font-mono">ID: {emp.id.slice(-6)}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-gray-600 font-semibold">
                            {emp.designation || 'Staff'}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-gray-800 font-mono">
                            {empPunchIn || '—'}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-gray-800 font-mono">
                            {empPunchOut || '—'}
                          </td>
                          <td className="py-3.5 px-5 text-gray-700 font-semibold">
                            {empTotalHrs || '—'}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {empStatus === 'P' || empStatus === 'PRESENT' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                PRESENT
                              </span>
                            ) : empStatus === 'L' || empStatus === 'LEAVE' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#225091] border border-blue-200">
                                ON LEAVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                ABSENT
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

            {/* TAB 2: MONTHLY SHEET (Section 5: /api/v1/society/attendance/sheet) */}
            {activeTab === 'monthly' && (
              <table ref={tableRef} className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80 sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4 sticky left-0 bg-[#F8FAFC] z-20 shadow-xs min-w-[180px]">
                      EMPLOYEE
                    </th>
                    {Array.from({ length: monthlySheetData.daysInMonth || 31 }, (_, i) => (
                      <th key={i} className="py-3.5 px-1.5 text-center font-mono font-bold text-[11px] min-w-[34px]">
                        {i + 1}
                      </th>
                    ))}
                    <th className="py-3.5 px-3 text-center font-bold text-emerald-700 min-w-[48px]">P</th>
                    <th className="py-3.5 px-3 text-center font-bold text-rose-700 min-w-[48px]">A</th>
                    <th className="py-3.5 px-3 text-center font-bold text-[#225091] min-w-[48px]">L</th>
                    <th className="py-3.5 px-3 text-center font-bold text-purple-700 min-w-[48px]">HD</th>
                    <th className="py-3.5 px-3 text-center font-bold text-indigo-700 min-w-[60px]">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loadingMonthlySheet ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <SkeletonTableRow key={idx} columns={(monthlySheetData.daysInMonth || 31) + 6} />
                    ))
                  ) : monthlySheetData.items.length === 0 ? (
                    <tr>
                      <td colSpan={(monthlySheetData.daysInMonth || 31) + 6} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CalendarDays size={32} className="text-gray-300 stroke-[1.5]" />
                          <span className="text-sm font-medium text-gray-500">No monthly attendance records found</span>
                          <span className="text-xs text-gray-400">Try selecting another month or adjusting your branch/state filters</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    monthlySheetData.items.map((emp, idx) => {
                      const totalDays = monthlySheetData.daysInMonth || 31;
                      const summary = emp.summary || {};
                      const presentCount = summary.presentDays ?? 0;
                      const absentCount = summary.absentDays ?? 0;
                      const leaveCount = summary.leaveDays ?? 0;
                      const halfDayCount = summary.halfDays ?? 0;
                      const percentage = summary.attendancePercentage !== undefined 
                        ? `${summary.attendancePercentage}%` 
                        : (totalDays > 0 ? `${Math.round((presentCount / totalDays) * 100)}%` : '—');

                      return (
                        <tr key={emp.id || emp._id || idx} className="hover:bg-slate-50/60 transition-colors">
                          {/* Employee Info Sticky Column */}
                          <td className="py-3 px-4 font-bold text-gray-900 sticky left-0 bg-white hover:bg-slate-50/90 transition-colors z-10 shadow-xs">
                            <div className="flex flex-col">
                              <span className="line-clamp-1 text-gray-900 font-bold">{emp.employeeName || emp.name}</span>
                              <span className="text-[10px] text-gray-400 font-normal">{emp.employeeCode || emp.designation || 'Staff'}</span>
                            </div>
                          </td>

                          {/* Days Columns (1 to daysInMonth) */}
                          {Array.from({ length: totalDays }, (_, d) => {
                            const dayNum = d + 1;
                            const statusStr = emp.daysMap?.[String(dayNum)] || emp.daysMap?.[dayNum] || emp.days?.find(item => item.day === dayNum)?.statusCode || '—';

                            return (
                              <td key={dayNum} className="py-2 px-1 text-center">
                                <MonthlyStatusBadge status={statusStr} />
                              </td>
                            );
                          })}

                          {/* Summary Counters */}
                          <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            {presentCount}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-rose-700 bg-rose-50/30">
                            {absentCount}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-[#225091] bg-blue-50/30">
                            {leaveCount}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-purple-700 bg-purple-50/30">
                            {halfDayCount}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-indigo-700 bg-indigo-50/30">
                            {percentage}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 3: YEARLY MATRIX (Section 6: /api/v1/society/attendance/yearly-matrix) */}
            {activeTab === 'yearly' && (
              <table ref={tableRef} className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80 sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-3 text-center w-12 sticky left-0 bg-[#F8FAFC] z-20">SR.NO.</th>
                    <th className="py-3.5 px-4 sticky left-12 bg-[#F8FAFC] z-20 shadow-xs min-w-[200px]">
                      EMPLOYEE
                    </th>
                    {MONTH_SHORT_NAMES.map((mCode, idx) => {
                      const isMonthFiltered = (yearlyMonthFilter && Number(yearlyMonthFilter) === idx + 1) || 
                                              (yearlyMatrixData.selectedMonth === idx + 1);
                      return (
                        <th 
                          key={mCode} 
                          className={`py-3.5 px-2 text-center font-mono font-bold text-[11px] min-w-[68px] ${
                            isMonthFiltered ? 'bg-blue-100/70 text-[#225091]' : ''
                          }`}
                        >
                          {mCode}
                        </th>
                      );
                    })}
                    <th className="py-3.5 px-3 text-center font-bold text-slate-800 min-w-[90px]">TOTAL PRESENT</th>
                    <th className="py-3.5 px-4 text-center font-bold text-emerald-700 min-w-[95px]">AVG ATTENDANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loadingYearlyMatrix ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <SkeletonTableRow key={idx} columns={15} />
                    ))
                  ) : yearlyMatrixData.items.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CalendarDays size={32} className="text-gray-300 stroke-[1.5]" />
                          <span className="text-sm font-medium text-gray-500">No yearly attendance records found</span>
                          <span className="text-xs text-gray-400">Try selecting another year or adjusting branch/state filters</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    yearlyMatrixData.items.map((emp, idx) => {
                      const empSrNo = emp.srNo ?? ((yearlyPage - 1) * 10 + idx + 1);
                      const avgPercentageStr = emp.formattedAverageAttendance || 
                        (emp.averageAttendancePercentage !== undefined ? `${emp.averageAttendancePercentage}%` : '—');
                      const numericAvg = typeof emp.averageAttendancePercentage === 'number'
                        ? emp.averageAttendancePercentage
                        : parseFloat(emp.formattedAverageAttendance || '0');

                      let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      if (numericAvg < 50) {
                        badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                      } else if (numericAvg < 75) {
                        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                      } else if (numericAvg < 90) {
                        badgeColor = 'bg-blue-50 text-[#225091] border-blue-200';
                      }

                      return (
                        <tr key={emp.id || emp._id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-3 text-center font-bold text-gray-500 sticky left-0 bg-white hover:bg-slate-50/90 z-10">
                            {empSrNo}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900 sticky left-12 bg-white hover:bg-slate-50/90 transition-colors z-10 shadow-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-[#225091] font-bold text-[11px] flex items-center justify-center uppercase shrink-0 border border-blue-100">
                                {(emp.employeeName || emp.name || 'E').slice(0, 2)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-gray-900 font-bold truncate max-w-[140px] text-xs">
                                  {emp.employeeName || emp.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-normal">
                                  {emp.employeeCode && (
                                    <span className="font-mono text-gray-500 bg-gray-100 px-1 rounded-xs">{emp.employeeCode}</span>
                                  )}
                                  <span className="truncate max-w-[90px]">{emp.designation || 'Staff'}</span>
                                  {emp.branchName && (
                                    <span className="text-gray-400">• {emp.branchName}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 12 Months Columns */}
                          {MONTH_SHORT_NAMES.map((mCode, mIdx) => {
                            const monthNumber = mIdx + 1;
                            const isMonthFiltered = (yearlyMonthFilter && Number(yearlyMonthFilter) === monthNumber) || 
                                                    (yearlyMatrixData.selectedMonth === monthNumber);
                            
                            // Check monthsMap or months array
                            let displayVal = emp.monthsMap?.[mCode];
                            if (!displayVal && Array.isArray(emp.months)) {
                              const found = emp.months.find(m => m.code === mCode || m.month === monthNumber);
                              if (found) {
                                displayVal = found.formatted || (found.presentDays !== undefined ? `${found.presentDays} Days` : null);
                              }
                            }
                            if (!displayVal) displayVal = '0 Days';

                            const isPresent = displayVal !== '0 Days' && displayVal !== '0' && displayVal !== '0 days';

                            return (
                              <td 
                                key={mCode} 
                                className={`py-3 px-2 text-center text-xs transition-colors ${
                                  isMonthFiltered ? 'bg-blue-50/50 font-bold' : ''
                                }`}
                              >
                                {isPresent ? (
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/60 shadow-2xs whitespace-nowrap">
                                    {displayVal}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-normal text-[11px] whitespace-nowrap">
                                    {displayVal}
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          {/* Total Present Days */}
                          <td className="py-3 px-3 text-center font-extrabold text-slate-800 bg-slate-50/50 whitespace-nowrap">
                            {emp.totalPresentDaysYear !== undefined ? `${emp.totalPresentDaysYear} Days` : '—'}
                          </td>

                          {/* Average Attendance */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeColor}`}>
                              {avgPercentageStr}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </TableWrapper>

          {/* Table Footer with Pagination */}
          <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            {activeTab === 'daily' ? (
              <>
                <div>
                  Showing <strong className="text-gray-800">{reportItems.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                  <strong className="text-gray-800">
                    {Math.min(page * limit, meta.totalRecords || reportItems.length)}
                  </strong> of <strong className="text-gray-800">{meta.totalRecords || reportItems.length}</strong> staff records
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1 || loadingReportData}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-[#225091] text-white font-bold text-xs">
                    {page} / {meta.totalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(meta.totalPages || 1, p + 1))}
                    disabled={page >= (meta.totalPages || 1) || loadingReportData}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : activeTab === 'monthly' ? (
              <>
                <div>
                  Showing <strong className="text-gray-800">{monthlySheetData.items.length > 0 ? (monthlyPage - 1) * 10 + 1 : 0}</strong> to{' '}
                  <strong className="text-gray-800">
                    {Math.min(monthlyPage * 10, monthlySheetData.meta.totalRecords || monthlySheetData.items.length)}
                  </strong> of <strong className="text-gray-800">{monthlySheetData.meta.totalRecords || monthlySheetData.items.length}</strong> staff records
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMonthlyPage(p => Math.max(1, p - 1))}
                    disabled={monthlyPage <= 1 || loadingMonthlySheet}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-[#225091] text-white font-bold text-xs">
                    {monthlyPage} / {monthlySheetData.meta.totalPages || 1}
                  </span>
                  <button
                    onClick={() => setMonthlyPage(p => Math.min(monthlySheetData.meta.totalPages || 1, p + 1))}
                    disabled={monthlyPage >= (monthlySheetData.meta.totalPages || 1) || loadingMonthlySheet}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  Showing <strong className="text-gray-800">{yearlyMatrixData.items.length > 0 ? (yearlyPage - 1) * 10 + 1 : 0}</strong> to{' '}
                  <strong className="text-gray-800">
                    {Math.min(yearlyPage * 10, yearlyMatrixData.meta.totalRecords || yearlyMatrixData.items.length)}
                  </strong> of <strong className="text-gray-800">{yearlyMatrixData.meta.totalRecords || yearlyMatrixData.items.length}</strong> staff records
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setYearlyPage(p => Math.max(1, p - 1))}
                    disabled={yearlyPage <= 1 || loadingYearlyMatrix}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-[#225091] text-white font-bold text-xs">
                    {yearlyPage} / {yearlyMatrixData.meta.totalPages || 1}
                  </span>
                  <button
                    onClick={() => setYearlyPage(p => Math.min(yearlyMatrixData.meta.totalPages || 1, p + 1))}
                    disabled={yearlyPage >= (yearlyMatrixData.meta.totalPages || 1) || loadingYearlyMatrix}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
