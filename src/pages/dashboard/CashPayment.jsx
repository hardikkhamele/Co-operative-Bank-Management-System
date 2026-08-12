import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, SlidersHorizontal, ChevronDown, X, Eye, Download, Loader2, ArrowDownCircle } from 'lucide-react';
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

  // Submit Cash Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const todayISO = new Date().toISOString().split('T')[0];
  const [submitForm, setSubmitForm] = useState({
    date: todayISO,
    amountSubmitted: '',
    remarks: ''
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
        if (res.meta || res.pagination || res.data?.meta || res.data?.pagination) { setMeta(res.meta || res.pagination || res.data?.meta || res.data?.pagination); } else {
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

  // Open Submit Cash Modal
  const openSubmitModal = (employee) => {
    setSelectedEmployee(employee);
    setSubmitForm({
      date: todayISO,
      amountSubmitted: '',
      remarks: ''
    });
    setIsSubmitModalOpen(true);
  };

  // Handle Cash Submission
  const handleSubmitCash = async (e) => {
    e.preventDefault();
    const empId = selectedEmployee?.employeeId || selectedEmployee?._id || selectedEmployee?.id;
    if (!empId) {
      toast.error('Employee ID is missing');
      return;
    }
    if (!submitForm.date) {
      toast.error('Please select a date');
      return;
    }
    const amount = Number(submitForm.amountSubmitted);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid submission amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date: submitForm.date,
        amountSubmitted: amount,
        remarks: submitForm.remarks.trim() || 'Cash deposited successfully'
      };

      const res = await cashPaymentService.submitCash(empId, payload);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res?.message || 'Cash deposited successfully!');
        setIsSubmitModalOpen(false);
        setSelectedEmployee(null);
        setSubmitForm({
          date: todayISO,
          amountSubmitted: '',
          remarks: ''
        });
        // Re-fetch cash payments
        fetchCashPayments();
      } else {
        throw new Error(res?.message || 'Failed to submit cash');
      }
    } catch (err) {
      console.error('Error submitting cash:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit cash');
    } finally {
      setSubmitting(false);
    }
  };

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
                      <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-3">
                        {['Onboarding Team', 'Branch Manager', 'Collection Officer', 'Field Agent'].map((desig) => (
                          <label key={desig} className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={filterDesignation.includes(desig)}
                              onChange={() => toggleFilter(setFilterDesignation, desig)}
                              className="w-4 h-4 text-[#1cabb1] rounded border-gray-300 focus:ring-[#1cabb1]" 
                            />
                            <span className="text-sm font-medium text-gray-700">{desig}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Branch Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'branch' ? null : 'branch')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Branch</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'branch' ? 'rotate-180' : ''}`} />
                    </div>

                    {openFilterDropdown === 'branch' && (
                      <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-3">
                        {['Main Branch', 'North Zone Branch', 'South Zone Branch', 'East Zone Branch'].map((br) => (
                          <label key={br} className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={filterBranch.includes(br)}
                              onChange={() => toggleFilter(setFilterBranch, br)}
                              className="w-4 h-4 text-[#1cabb1] rounded border-gray-300 focus:ring-[#1cabb1]" 
                            />
                            <span className="text-sm font-medium text-gray-700">{br}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setFilterDesignation([]);
                      setFilterBranch([]);
                      setIsFilterOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold text-sm hover:bg-teal-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-[#1b58a6] text-white font-semibold text-sm hover:bg-[#154685] transition-colors"
                  >
                    Apply
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
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openSubmitModal(payment)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs transition-colors"
                            title="Submit Cash"
                          >
                            <ArrowDownCircle size={14} />
                            <span>Submit Cash</span>
                          </button>
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
              <ChevronLeft size={16} />
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

      {/* Quick Submit Cash Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">Submit Cash</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deposit cash collected by <span className="font-semibold text-[#1cabb1]">{selectedEmployee?.employeeName || selectedEmployee?.name || 'Employee'}</span>
                </p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitCash} className="p-6 pt-4 space-y-4">
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  required
                  value={submitForm.date}
                  onChange={(e) => setSubmitForm({ ...submitForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required
                  min="1"
                  step="any"
                  placeholder="Enter Amount (e.g. 5000)"
                  value={submitForm.amountSubmitted}
                  onChange={(e) => setSubmitForm({ ...submitForm, amountSubmitted: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800 appearance-none font-medium" 
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea 
                  rows="3" 
                  placeholder="Enter remarks (e.g. Cash deposited successfully)..." 
                  value={submitForm.remarks}
                  onChange={(e) => setSubmitForm({ ...submitForm, remarks: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800 resize-none"
                ></textarea>
              </div>
              
              <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-[14px] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Cash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashPayment;
