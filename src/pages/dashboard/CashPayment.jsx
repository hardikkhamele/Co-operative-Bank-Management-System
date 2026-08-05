import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye, Download, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cashPaymentService } from '../../api/cashPaymentService';

const CashPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [items, setItems] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [filterDesignation, setFilterDesignation] = useState([]);
  const [filterBranch, setFilterBranch] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1
  });

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Cash Payments from API
  const fetchCashPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await cashPaymentService.list(params);
      if (res && (res.success || res.statusCode === 200)) {
        const dataPayload = res.data || {};
        const itemsList = Array.isArray(dataPayload.items)
          ? dataPayload.items
          : Array.isArray(dataPayload)
          ? dataPayload
          : [];
        setItems(itemsList);
        if (dataPayload.meta) {
          setMeta(dataPayload.meta);
        } else {
          setMeta({
            page,
            limit,
            totalRecords: itemsList.length,
            totalPages: Math.ceil(itemsList.length / limit) || 1
          });
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch cash payments');
      }
    } catch (err) {
      console.error('Error fetching cash payments:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to load cash payments');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchCashPayments();
  }, [fetchCashPayments]);

  // Client-side filtering for designation and branch if selected
  const displayedItems = items.filter(item => {
    if (filterDesignation.length > 0 && item.designation) {
      if (!filterDesignation.includes(item.designation)) return false;
    }
    if (filterBranch.length > 0 && item.branch) {
      if (!filterBranch.includes(item.branch)) return false;
    }
    return true;
  });

  // Export to CSV
  const handleExport = () => {
    setExporting(true);
    try {
      const headers = ['Sr.No.', 'Employee ID', 'Employee Name', 'Designation', 'Total Cash Collection', 'Total Cash Submitted', 'Total Cash Pending'];
      const rows = displayedItems.map((item, idx) => [
        (page - 1) * limit + idx + 1,
        `"${item.employeeId || item._id || ''}"`,
        `"${item.employeeName || item.name || ''}"`,
        `"${item.designation || 'Onboarding Team'}"`,
        item.totalCashCollection || 0,
        item.totalCashSubmitted || 0,
        item.totalCashPending || 0
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `cash-payments-page-${page}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Cash payment records exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">Cash Payment</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <span>Payment Management</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Cash Payment</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm bg-white text-gray-800"
              placeholder="Search employee by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none bg-white"
              title="Filters"
            >
              <SlidersHorizontal size={18} />
              {(filterDesignation.length > 0 || filterBranch.length > 0) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(filterDesignation.length > 0 ? 1 : 0) + (filterBranch.length > 0 ? 1 : 0)}
                </span>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-[#f8f9fb] border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Designation Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'designation' ? null : 'designation')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Designation</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'designation' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'designation' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['Onboarding Team', 'Collection Executive', 'Branch Manager', 'Assistant Branch Manager'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors cursor-pointer"
                                checked={filterDesignation.includes(opt)}
                                onChange={() => toggleFilter(setFilterDesignation, opt)}
                              />
                              {filterDesignation.includes(opt) && (
                                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm bg-white"
                    onClick={() => { setFilterDesignation([]); setFilterBranch([]); }}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors focus:outline-none text-sm shadow-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting || displayedItems.length === 0}
            className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0 disabled:opacity-50"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f4f3fb] text-[#4b5563] font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sr.No.</th>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Total Cash<br/>Collection</th>
                <th className="px-6 py-4">Total Cash<br/>Submitted</th>
                <th className="px-6 py-4">Total Cash<br/>Pending</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 size={20} className="animate-spin text-[#1cabb1]" />
                      <span>Loading cash payment records...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">
                    No cash payment records found.
                  </td>
                </tr>
              ) : (
                displayedItems.map((payment, index) => {
                  const empId = payment.employeeId || payment._id || payment.id;
                  const empName = payment.employeeName || payment.name || 'Unnamed Employee';
                  const designation = payment.designation || 'Onboarding Team';
                  const avatarUrl = payment.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=random`;

                  return (
                    <tr key={empId || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100">
                            <img src={avatarUrl} alt={empName} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[#1b2559] font-semibold">{empName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{designation}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">₹{formatCurrency(payment.totalCashCollection)}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">₹{formatCurrency(payment.totalCashSubmitted)}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        <span className={`font-semibold ${Number(payment.totalCashPending) > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                          ₹{formatCurrency(payment.totalCashPending)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => navigate(`/cash-payment/view/${empId}`)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                            title="View Employee Cash Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-800 font-medium">
            Showing {displayedItems.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, meta.totalRecords || displayedItems.length)} of {meta.totalRecords || displayedItems.length} Entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>

            {(() => {
              const totalPages = meta.totalPages || 1;
              let startPage = Math.max(1, page - 2);
              let endPage = Math.min(totalPages, page + 2);
              if (endPage - startPage < 4) {
                if (startPage === 1) endPage = Math.min(5, totalPages);
                else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
              }
              const pageButtons = [];
              for (let i = startPage; i <= endPage; i++) {
                pageButtons.push(
                  <button 
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-colors ${page === i ? 'bg-[#1cabb1] text-white shadow-sm' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {i}
                  </button>
                );
              }
              return pageButtons;
            })()}

            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages || 1, p + 1))}
              disabled={page >= (meta.totalPages || 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashPayment;
