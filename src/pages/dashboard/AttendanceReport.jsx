import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Calendar, ChevronLeft, ChevronRight, RefreshCw, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { branchService } from '../../api/branchService';
import { employeeService } from '../../api/employeeService';
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

const MonthlyStatusBadge = ({ status }) => {
  let styles = '';
  let isPill = false;
  const upperStatus = (status || '').toUpperCase();

  switch (upperStatus) {
    case 'P':
      styles = 'text-[#15803D] border-[#15803D]/40 bg-emerald-50';
      break;
    case 'P*':
      styles = 'text-[#b45309] border-[#b45309]/40 bg-amber-50';
      break;
    case 'A':
      styles = 'text-[#b91c1c] border-[#b91c1c]/40 bg-rose-50';
      break;
    case 'L':
      styles = 'text-[#225091] border-[#225091]/40 bg-blue-50';
      break;
    case 'WO':
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
    <span className="text-[13px] font-semibold text-gray-600">{label}</span>
  </div>
);

const AttendanceReport = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedState, setSelectedState] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date State
  const todayISO = new Date().toISOString().split('T')[0];
  const [referenceDate, setReferenceDate] = useState(todayISO);
  
  // Month / Year Picker for Monthly / Yearly tabs
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  const { globalBranchId } = useBranchStore();

  // Load Branches and Employees
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bRes, eRes] = await Promise.allSettled([
          branchService.list({ limit: 100 }),
          employeeService.list({ limit: 100 })
        ]);

        if (bRes.status === 'fulfilled' && bRes.value) {
          const rawB = bRes.value.data || bRes.value.branches || bRes.value;
          const bList = Array.isArray(rawB) ? rawB : (rawB?.branches || rawB?.items || rawB?.data || []);
          setBranches(bList);
        }

        if (eRes.status === 'fulfilled' && eRes.value) {
          const rawE = eRes.value.data || eRes.value.employees || eRes.value;
          const eList = Array.isArray(rawE) ? rawE : (rawE?.employees || rawE?.items || rawE?.data || []);
          setEmployees(eList);
        }
      } catch (err) {
        console.error("Failed to load attendance report dependencies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered branches based on selected state
  const availableBranches = useMemo(() => {
    if (!selectedState) return branches;
    return branches.filter(b => b.state === selectedState);
  }, [selectedState, branches]);

  // Transformed employee attendance data
  const transformedAttendanceData = useMemo(() => {
    return employees.map((emp, index) => {
      const branchObj = branches.find(b => (b.id || b._id) === (emp.branchId || emp.branch?._id || emp.branch?.id));
      const branchName = branchObj?.name || emp.branch?.name || emp.branchName || 'Main Branch';
      const branchState = branchObj?.state || emp.branch?.state || emp.state || 'Maharashtra';
      const empName = emp.fullName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Employee ${index + 1}`;
      const empDesig = emp.jobDetails?.designation || emp.designation || 'Staff Officer';
      
      // Deterministic mock status for rich visual preview
      const hash = (index + (new Date(referenceDate).getDate() || 1)) % 10;
      const status = hash === 0 ? 'A' : hash === 1 ? 'L' : hash === 2 ? 'P*' : 'P';
      const punchIn = status === 'A' ? '—' : status === 'P*' ? '09:45 AM' : '09:00 AM';
      const punchOut = status === 'A' ? '—' : '06:00 PM';
      const totalHrs = status === 'A' ? '—' : status === 'P*' ? '8h 15m' : '9h 00m';

      // Monthly days mapping
      const days = {};
      for (let d = 1; d <= 31; d++) {
        const dayOfWeek = (d + index) % 7;
        if (dayOfWeek === 0) days[d] = 'WO';
        else if ((d + index) % 15 === 0) days[d] = 'A';
        else if ((d + index) % 11 === 0) days[d] = 'L';
        else if ((d + index) % 9 === 0) days[d] = 'P*';
        else days[d] = 'P';
      }

      // Yearly months mapping
      const months = {};
      for (let m = 1; m <= 12; m++) {
        months[m] = {
          p: Math.max(18, 24 - (index % 3)),
          a: (index + m) % 3,
          l: (index + m) % 2
        };
      }

      return {
        id: emp.id || emp._id || index + 1,
        name: empName,
        designation: empDesig,
        branchId: emp.branchId || emp.branch?._id || emp.branch?.id,
        branchName: branchName,
        state: branchState,
        avatar: emp.avatar || emp.profileImage || null,
        punchIn,
        punchOut,
        totalHrs,
        status,
        days,
        summary: {
          ot: `${(index % 4) * 2}h`,
          payDays: 28 - (index % 3),
          p: 270 - (index % 10),
          a: 12 + (index % 5),
          l: 14 + (index % 4)
        }
      };
    });
  }, [employees, branches, referenceDate]);

  // Filtered employee data
  const filteredDailyData = useMemo(() => {
    return transformedAttendanceData.filter(emp => {
      if (selectedState && emp.state !== selectedState) return false;
      if (selectedBranch && emp.branchId !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesDesig = (emp.designation || '').toLowerCase().includes(q);
        const matchesBranch = (emp.branchName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesig && !matchesBranch) return false;
      }
      return true;
    });
  }, [transformedAttendanceData, selectedState, selectedBranch, searchQuery]);

  const totalRecords = filteredDailyData.length;
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const paginatedDailyData = filteredDailyData.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'P': return 'text-[#15803D] border-[#15803D]/40 bg-emerald-50';
      case 'P*': return 'text-[#b45309] border-[#b45309]/40 bg-amber-50';
      case 'L': return 'text-[#225091] border-[#225091]/40 bg-blue-50';
      case 'A': return 'text-[#b91c1c] border-[#b91c1c]/40 bg-rose-50';
      default: return 'text-gray-500 border-gray-400 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <PageHeader
        title="Attendance Report"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'HR Management' },
          { label: 'Attendance Report' }
        ]}
      />

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Region Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Region (State)</label>
            <div className="relative">
              <select 
                value={selectedState}
                onChange={(e) => { 
                  setSelectedState(e.target.value); 
                  setSelectedBranch('');
                  setPage(1); 
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] appearance-none text-gray-700 text-sm bg-white cursor-pointer"
              >
                <option value="">All Regions</option>
                {ALL_INDIAN_STATES.map((state, i) => (
                  <option key={i} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Branch</label>
            <div className="relative">
              <select 
                value={selectedBranch}
                onChange={(e) => { 
                  setSelectedBranch(e.target.value); 
                  setPage(1); 
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] appearance-none text-gray-700 text-sm bg-white cursor-pointer"
              >
                <option value="">All Branches</option>
                {availableBranches.map((branch) => (
                  <option key={branch.id || branch._id} value={branch.id || branch._id}>
                    {branch.name} {branch.code ? `(${branch.code})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or designation" 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm text-gray-700 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-5 w-full">
        {/* Toggle Tabs & Date Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="inline-flex bg-slate-100 rounded-xl p-1 shrink-0">
            <button 
              onClick={() => { setActiveTab('daily'); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'daily' ? 'bg-white shadow-xs text-[#225091]' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Calendar size={15} /> Daily
            </button>
            <button 
              onClick={() => { setActiveTab('monthly'); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'monthly' ? 'bg-white shadow-xs text-[#225091]' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Calendar size={15} /> Monthly
            </button>
            <button 
              onClick={() => { setActiveTab('yearly'); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'yearly' ? 'bg-white shadow-xs text-[#225091]' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Calendar size={15} /> Yearly
            </button>
          </div>

          {/* Date Picker Toolbars */}
          {activeTab === 'daily' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date:</span>
              <input 
                type="date" 
                value={referenceDate}
                onChange={(e) => { setReferenceDate(e.target.value); setPage(1); }}
                className="px-3.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-xs font-semibold text-gray-700 bg-white cursor-pointer shadow-2xs"
              />
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Month:</span>
              <div className="relative">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-3.5 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-xs font-semibold text-gray-700 appearance-none bg-white min-w-[120px] cursor-pointer shadow-2xs"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {activeTab === 'yearly' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Year:</span>
              <div className="relative">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-3.5 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-xs font-semibold text-gray-700 appearance-none bg-white min-w-[100px] cursor-pointer shadow-2xs"
                >
                  {['2026', '2025', '2024', '2023'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Daily Table */}
        {activeTab === 'daily' && (
          <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
                <tr>
                  <th className="py-3.5 px-5 w-20 text-center font-semibold">Sr.No.</th>
                  <th className="py-3.5 px-5 font-semibold">Name</th>
                  <th className="py-3.5 px-5 font-semibold">Designation</th>
                  <th className="py-3.5 px-5 font-semibold">Branch</th>
                  <th className="py-3.5 px-5 font-semibold">Punch In</th>
                  <th className="py-3.5 px-5 font-semibold">Punch Out</th>
                  <th className="py-3.5 px-5 font-semibold">Total Hrs</th>
                  <th className="py-3.5 px-5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, rIdx) => (
                    <tr key={rIdx} className="animate-pulse">
                      <td className="py-4 px-5 text-center"><Skeleton className="h-4 w-6 mx-auto rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-32 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="py-4 px-5 text-center"><Skeleton className="h-7 w-7 rounded-full mx-auto" /></td>
                    </tr>
                  ))
                ) : paginatedDailyData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 font-medium text-gray-500 text-sm">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  paginatedDailyData.map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 text-center text-[13px] text-gray-500 font-medium">{(page - 1) * limit + index + 1}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {row.avatar ? (
                            <img 
                              src={row.avatar} 
                              alt={row.name} 
                              className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-xs" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-50 text-[#225091] border border-blue-100 shadow-xs">
                              {(row.name ? row.name.substring(0, 2).toUpperCase() : 'EM')}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900 text-sm">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.designation || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.branchName || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.punchIn || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.punchOut || '—'}</td>
                      <td className="py-3.5 px-5 text-sm font-semibold text-gray-800 tabular-nums">{row.totalHrs || '—'}</td>
                      <td className="py-3.5 px-5 text-center">
                        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold shadow-2xs ${getStatusBadgeStyle(row.status || 'A')}`}>
                          {row.status || 'A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Monthly Table */}
        {activeTab === 'monthly' && (
          <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[max-content]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600">
                  <th className="sticky left-0 z-20 bg-gray-50 py-3.5 px-4 w-16 border-r border-gray-200 whitespace-nowrap text-center">Sr.No.</th>
                  <th className="sticky left-16 z-20 bg-gray-50 py-3.5 px-4 min-w-[180px] border-r border-gray-200 whitespace-nowrap">Name</th>
                  {[...Array(31)].map((_, i) => (
                    <th key={i} className="py-3 px-2 text-center border-r border-gray-100 min-w-[42px] text-[11px]">{i + 1}</th>
                  ))}
                  <th className="py-3.5 px-4 text-center border-r border-gray-200">OT</th>
                  <th className="py-3.5 px-4 text-center">Pay Days</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-700 font-medium">
                {paginatedDailyData.length === 0 ? (
                  <tr>
                    <td colSpan="35" className="text-center py-12 text-gray-400 font-medium">No records found.</td>
                  </tr>
                ) : (
                  paginatedDailyData.map((row, idx) => (
                    <tr key={row.id || idx} className="border-b border-gray-100 hover:bg-slate-50/70 transition-colors">
                      <td className="sticky left-0 z-10 bg-white py-3 px-4 text-center border-r border-gray-200 text-xs font-semibold text-gray-500">{(page - 1) * limit + idx + 1}</td>
                      <td className="sticky left-16 z-10 bg-white py-3 px-4 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-xs truncate max-w-[150px]">{row.name}</span>
                        </div>
                      </td>
                      {[...Array(31)].map((_, i) => {
                        const dayStatus = row.days?.[i + 1] || 'P';
                        return (
                          <td key={i} className="py-2.5 px-1 text-center border-r border-gray-100">
                            <MonthlyStatusBadge status={dayStatus} />
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-center border-r border-gray-200 text-xs font-bold text-gray-700">{row.summary?.ot || '0h'}</td>
                      <td className="py-2.5 px-4 text-center text-xs font-bold text-emerald-700">{row.summary?.payDays || 30}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Yearly Table */}
        {activeTab === 'yearly' && (
          <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[max-content]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600">
                  <th className="sticky left-0 z-20 bg-gray-50 py-3.5 px-4 w-16 border-r border-gray-200 whitespace-nowrap text-center">Sr.No.</th>
                  <th className="sticky left-16 z-20 bg-gray-50 py-3.5 px-4 min-w-[180px] border-r border-gray-200 whitespace-nowrap">Name</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                    <th key={i} className="py-3.5 px-3 text-center border-r border-gray-100 min-w-[55px] text-[11px]">{month}</th>
                  ))}
                  <th className="py-3.5 px-3 text-center border-r border-gray-100 text-emerald-700">P</th>
                  <th className="py-3.5 px-3 text-center border-r border-gray-100 text-rose-700">A</th>
                  <th className="py-3.5 px-3 text-center border-r border-gray-100 text-blue-700">L</th>
                  <th className="py-3.5 px-3 text-center border-r border-gray-100">OT</th>
                  <th className="py-3.5 px-4 text-center">Pay Days</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-700 font-medium">
                {paginatedDailyData.length === 0 ? (
                  <tr>
                    <td colSpan="18" className="text-center py-12 text-gray-400 font-medium">No records found.</td>
                  </tr>
                ) : (
                  paginatedDailyData.map((row, idx) => (
                    <tr key={row.id || idx} className="border-b border-gray-100 hover:bg-slate-50/70 transition-colors">
                      <td className="sticky left-0 z-10 bg-white py-3 px-4 text-center border-r border-gray-200 text-xs font-semibold text-gray-500">{(page - 1) * limit + idx + 1}</td>
                      <td className="sticky left-16 z-10 bg-white py-3 px-4 border-r border-gray-200">
                        <span className="font-semibold text-gray-900 text-xs truncate max-w-[150px]">{row.name}</span>
                      </td>
                      {[...Array(12)].map((_, i) => {
                        const monthData = (row.months && row.months[i + 1]) || { p: 24, a: 1, l: 1 };
                        return (
                          <td key={i} className="py-3 px-2 text-center border-r border-gray-100">
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-emerald-600 font-bold text-xs">{monthData.p}</span>
                              <span className="text-[10px] text-gray-400">
                                <span className="text-rose-500">{monthData.a}</span> - <span className="text-blue-500">{monthData.l}</span>
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-center border-r border-gray-100 text-emerald-600 font-bold text-xs">{row.summary?.p || 260}</td>
                      <td className="py-3 px-3 text-center border-r border-gray-100 text-rose-600 font-bold text-xs">{row.summary?.a || 10}</td>
                      <td className="py-3 px-3 text-center border-r border-gray-100 text-blue-600 font-bold text-xs">{row.summary?.l || 12}</td>
                      <td className="py-3 px-3 text-center border-r border-gray-100 text-xs font-bold text-gray-700">{row.summary?.ot || '0h'}</td>
                      <td className="py-3 px-4 text-center text-xs font-bold text-emerald-700">{row.summary?.payDays || 28}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination and Legends */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-medium text-gray-500">
            <span>
              Showing {totalRecords > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} Entries
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              
              {(() => {
                let startPage = Math.max(1, page - 2);
                let endPage = Math.min(totalPages, page + 2);
                if (endPage - startPage < 4) {
                  if (startPage === 1) endPage = Math.min(5, totalPages);
                  else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
                }
                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button 
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${page === i ? 'bg-[#225091] text-white shadow-xs' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
              
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Status Legends */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <LegendItem status="P" label="Present" />
            <LegendItem status="P*" label="Present (Late)" />
            <LegendItem status="A" label="Absent" />
            <LegendItem status="WO" label="Weekly Off" />
            <LegendItem status="COFF" label="Compensatory Off" />
            <LegendItem status="L" label="Leave" />
            <LegendItem status="-" label="Not Applicable" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
