import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Calendar, ChevronLeft, Component } from 'lucide-react';

const mockBranches = [];
const mockStates = [];
const mockEmployees = [];
const mockMonthlyAttendance = [];
const mockYearlyAttendance = [];

const MonthlyStatusBadge = ({ status }) => {
  let styles = '';
  let isPill = false;
  const upperStatus = (status || '').toUpperCase();

  switch (upperStatus) {
    case 'P':
      styles = 'text-[#32c965] border-[#32c965] bg-white';
      break;
    case 'P*':
      styles = 'text-[#f59e0b] border-[#f59e0b] bg-white';
      break;
    case 'A':
      styles = 'text-[#ff3d67] border-[#ff3d67] bg-white';
      break;
    case 'L':
      styles = 'text-[#225091] border-[#225091] bg-white';
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
      styles = 'text-[#32c965] border-[#32c965] bg-white';
  }

  const baseStyles = "inline-flex items-center justify-center border text-[11px] font-medium";
  const shapeStyles = isPill ? "px-2.5 py-1 rounded-full min-w-[36px]" : "w-8 h-8 rounded-full";

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

  // Filtered branches based on selected state
  const availableBranches = useMemo(() => {
    if (!selectedState) return mockBranches;
    return mockBranches.filter(b => b.state === selectedState);
  }, [selectedState]);

  // Filtered employee data
  const filteredDailyData = useMemo(() => {
    return mockEmployees.filter(emp => {
      if (selectedState && emp.state !== selectedState) return false;
      if (selectedBranch && emp.branchId !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesDesig = (emp.designation || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesig) return false;
      }
      return true;
    });
  }, [selectedState, selectedBranch, searchQuery]);

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
      case 'P': return 'text-[#32c965] border-[#32c965] bg-white';
      case 'P*': return 'text-[#f59e0b] border-[#f59e0b] bg-white';
      case 'L': return 'text-[#225091] border-[#225091] bg-white';
      case 'A': return 'text-[#ff3d67] border-[#ff3d67] bg-white';
      default: return 'text-gray-500 border-gray-400 bg-white';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Title */}
      <div className="flex items-center gap-3 mb-2 text-[#8b5cf6]">
        <Component size={28} className="fill-current" />
        <h1 className="text-3xl font-bold">Bank Attendance</h1>
      </div>

      {/* Breadcrumb Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h2 className="text-[22px] font-bold text-[#225091] mb-2">Attendance Report</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Attendance Report</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#225091]">Attendance Report</span>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Region Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Region (State)</label>
            <div className="relative">
              <select 
                value={selectedState}
                onChange={(e) => { 
                  setSelectedState(e.target.value); 
                  setSelectedBranch('');
                  setPage(1); 
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] appearance-none text-gray-700 text-[15px] bg-white"
              >
                <option value="">All Regions</option>
                {mockStates.map((state, i) => (
                  <option key={i} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Branch</label>
            <div className="relative">
              <select 
                value={selectedBranch}
                onChange={(e) => { 
                  setSelectedBranch(e.target.value); 
                  setPage(1); 
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] appearance-none text-gray-700 text-[15px] bg-white"
              >
                <option value="">All Branches</option>
                {availableBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.code ? `(${branch.code})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or designation" 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-[15px] text-gray-700 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-transparent flex flex-col w-full">
        <div className="pb-6 flex flex-col gap-6">
          {/* Toggle Tabs */}
          <div className="inline-flex bg-gray-200/60 rounded-xl p-1 self-start">
            <button 
              onClick={() => { setActiveTab('daily'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-md text-[15px] font-medium transition-colors ${activeTab === 'daily' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Calendar size={18} /> Daily
            </button>
            <button 
              onClick={() => { setActiveTab('monthly'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-md text-[15px] font-medium transition-colors ${activeTab === 'monthly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Calendar size={18} /> Monthly
            </button>
            <button 
              onClick={() => { setActiveTab('yearly'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-md text-[15px] font-medium transition-colors ${activeTab === 'yearly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Calendar size={18} /> Yearly
            </button>
          </div>

          {/* Daily Toolbar */}
          {activeTab === 'daily' && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Daily Attendance</h2>
              
              <div className="relative">
                <input 
                  type="date" 
                  value={referenceDate}
                  onChange={(e) => { setReferenceDate(e.target.value); setPage(1); }}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-[15px] text-gray-600 min-w-[160px] bg-white cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Monthly Toolbar */}
          {activeTab === 'monthly' && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Monthly Attendance</h2>
              
              <div className="relative">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-[15px] text-gray-600 appearance-none bg-white min-w-[130px] cursor-pointer"
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Yearly Toolbar */}
          {activeTab === 'yearly' && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Yearly Attendance</h2>
              
              <div className="relative">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-[15px] text-gray-600 appearance-none bg-white min-w-[120px] cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Daily Table */}
        {activeTab === 'daily' && (
          <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-700">
                  <th className="py-4 px-6 w-20 text-center">Sr.No.</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Punch In</th>
                  <th className="py-4 px-6">Punch Out</th>
                  <th className="py-4 px-6">Total Hrs</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-[15px] text-gray-600">
                {paginatedDailyData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 font-medium text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  paginatedDailyData.map((row, index) => (
                    <tr key={row.id || index} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                      <td className="py-4 px-6 text-center font-medium">{(page - 1) * limit + index + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {row.avatar ? (
                            <img 
                              src={row.avatar} 
                              alt={row.name} 
                              className="w-8 h-8 rounded-full object-cover border border-gray-100" 
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${row.avatarColor || 'bg-[#f4f2ff] text-[#225091]'}`}>
                              {row.initials || (row.name ? row.name.substring(0, 2).toUpperCase() : 'NA')}
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{row.designation || '—'}</td>
                      <td className="py-4 px-6">{row.punchIn || '—'}</td>
                      <td className="py-4 px-6">{row.punchOut || '—'}</td>
                      <td className="py-4 px-6">{row.totalHrs || '—'}</td>
                      <td className="py-4 px-6 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-[13px] font-medium ${getStatusBadgeStyle(row.status || 'A')}`}>
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
          <div className="flex flex-col w-full">
            <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
              <table className="w-full text-left border-collapse min-w-[max-content]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                    <th className="sticky left-0 z-20 bg-gray-50 py-4 px-6 w-20 border-r border-gray-200 whitespace-nowrap text-center">Sr.No.</th>
                    <th className="sticky left-20 z-20 bg-gray-50 py-4 px-6 min-w-[200px] border-r border-gray-200 whitespace-nowrap">Name</th>
                    {[...Array(31)].map((_, i) => (
                      <th key={i} className="py-4 px-3 text-center border-r border-gray-200 min-w-[50px]">{i + 1}</th>
                    ))}
                    <th className="py-4 px-4 text-center border-r border-gray-200">OT</th>
                    <th className="py-4 px-4 text-center border-r border-gray-200">Pay Days</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-gray-700 font-medium">
                  {mockMonthlyAttendance.map((row) => (
                    <tr key={row.id} className="group border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-4 px-6 text-center border-r border-gray-200">{row.id}</td>
                      <td className="sticky left-20 z-10 bg-white group-hover:bg-gray-50 py-4 px-6 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          {row.emp.avatar ? (
                            <img src={row.emp.avatar} alt={row.emp.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${row.emp.avatarColor || 'bg-gray-100 text-gray-600'}`}>
                              {row.emp.initials}
                            </div>
                          )}
                          <span className="font-medium text-gray-800 whitespace-nowrap">{row.emp.name}</span>
                        </div>
                      </td>
                      {[...Array(31)].map((_, i) => {
                        const dayStatus = row.days[i + 1] || 'P';
                        return (
                          <td key={i} className="py-3 px-2 text-center border-r border-gray-200">
                            <MonthlyStatusBadge status={dayStatus} />
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center border-r border-gray-200 font-medium">{row.summary.ot}</td>
                      <td className="py-3 px-4 text-center border-r border-gray-200 font-medium text-gray-700">{row.summary.payDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Yearly Table */}
        {activeTab === 'yearly' && (
          <div className="flex flex-col w-full">
            <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
              <table className="w-full text-left border-collapse min-w-[max-content]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                    <th className="sticky left-0 z-20 bg-gray-50 py-4 px-6 w-20 border-r border-gray-200 whitespace-nowrap text-center">Sr.No.</th>
                    <th className="sticky left-20 z-20 bg-gray-50 py-4 px-6 min-w-[200px] border-r border-gray-200 whitespace-nowrap">Name</th>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                      <th key={i} className="py-4 px-4 text-center border-r border-gray-200">{month}</th>
                    ))}
                    <th className="py-4 px-4 text-center border-r border-gray-200">P</th>
                    <th className="py-4 px-4 text-center border-r border-gray-200">A</th>
                    <th className="py-4 px-4 text-center border-r border-gray-200">L</th>
                    <th className="py-4 px-4 text-center border-r border-gray-200">OT</th>
                    <th className="py-4 px-4 text-center border-r border-gray-200">Pay Days</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-gray-700 font-medium">
                  {mockYearlyAttendance.map((row) => (
                    <tr key={row.id} className="group border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-4 px-6 text-center border-r border-gray-200">{row.id}</td>
                      <td className="sticky left-20 z-10 bg-white group-hover:bg-gray-50 py-4 px-6 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          {row.emp.avatar ? (
                            <img src={row.emp.avatar} alt={row.emp.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${row.emp.avatarColor || 'bg-gray-100 text-gray-600'}`}>
                              {row.emp.initials}
                            </div>
                          )}
                          <span className="font-medium text-gray-800 whitespace-nowrap">{row.emp.name}</span>
                        </div>
                      </td>
                      {[...Array(12)].map((_, i) => {
                        const monthData = row.months[i + 1] || { p: 0, a: 0, l: 0 };
                        return (
                          <td key={i} className="py-3 px-4 text-center border-r border-gray-200">
                            <div className="flex flex-col items-center justify-center gap-1">
                               <span className="text-[#32c965] font-bold">{monthData.p}</span>
                               <span className="text-[12px] font-medium text-gray-400">
                                  <span className="text-[#ff3d67]">{monthData.a}</span> - <span className="text-[#225091]">{monthData.l}</span>
                               </span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center border-r border-gray-200 text-[#32c965] font-medium">{row.summary.p}</td>
                      <td className="py-3 px-4 text-center border-r border-gray-200 text-[#ff3d67] font-medium">{row.summary.a}</td>
                      <td className="py-3 px-4 text-center border-r border-gray-200 text-[#225091] font-medium">{row.summary.l}</td>
                      <td className="py-3 px-4 text-center border-r border-gray-200 font-medium">{row.summary.ot}</td>
                      <td className="py-3 px-4 text-center border-r border-gray-200 font-medium text-gray-700">{row.summary.payDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Pagination and Legends */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between text-[13px] font-medium text-gray-500">
            <span>
              Showing {totalRecords > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} Entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                      className={`w-8 h-8 flex items-center justify-center rounded border font-bold transition-colors ${page === i ? 'border-[#225091] bg-[#225091] text-white shadow-sm' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
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
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Status Legends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center gap-x-6 gap-y-4">
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
