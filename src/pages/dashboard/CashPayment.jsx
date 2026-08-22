import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { Search, ChevronRight, ChevronLeft, SlidersHorizontal, ChevronDown, X, Eye, Download, Loader2, ArrowDownCircle , Table, FileSpreadsheet, FileText} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cashPaymentService } from '../../api/cashPaymentService';
import useBranchStore from '../../store/branchStore';

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
  
  const globalBranchId = useBranchStore(state => state.globalBranchId);
  
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
      if (globalBranchId) {
        params.branchId = globalBranchId;
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
  }, [page, limit, debouncedSearch, globalBranchId]);

  useEffect(() => {
    fetchCashPayments();
  }, [fetchCashPayments]);

  // Client-side filtering for designation if selected
  const displayedItems = items.filter(item => {
    if (filterDesignation.length > 0 && item.designation) {
      if (!filterDesignation.includes(item.designation)) return false;
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
  const tableRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const getSelectedDataFromTable = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const table = tableRef.current;
    
    // Headers (skip last action column)
    const ths = Array.from(table.querySelectorAll('thead th'));
    const headers = ths.slice(0, -1).map(th => th.innerText.trim().replace(/\n/g, ' '));

    // Rows (all rows)
    const trs = Array.from(table.querySelectorAll('tbody tr'));
    const rows = trs.map(tr => {
      const tds = Array.from(tr.querySelectorAll('td'));
      return tds.slice(0, -1).map(td => td.innerText.trim().replace(/\n/g, ' '));
    });

    return { headers, rows };
  };

  const exportToCSV = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => '"' + v.replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Export.csv';
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <table ref={tableRef}  border="1">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Export.xls';
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export</title></head><body>
      <table ref={tableRef} border="1">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      </body></html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Export.doc';
    link.click();
    setIsExportOpen(false);
  };

  return (
<div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">Payment</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Payment</span>
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
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm bg-white text-gray-800"
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
              {filterDesignation.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#225091] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {filterDesignation.length > 0 ? 1 : 0}
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
                              className="w-4 h-4 text-[#225091] rounded border-gray-300 focus:ring-[#225091]" 
                            />
                            <span className="text-sm font-medium text-gray-700">{desig}</span>
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
                      setPage(1);
                      setIsFilterOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-full border border-[#225091] text-[#225091] font-semibold text-sm hover:bg-teal-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-[#225091] text-white font-semibold text-sm hover:bg-[#154685] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Download size={18} />
              Export
              <ChevronDown size={16} />
            </button>
            
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-1">
                  <button onClick={exportToCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <Table size={16} className="text-green-600" />
                    Export to CSV
                  </button>
                  <button onClick={exportToExcel} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Export to Excel
                  </button>
                  <button onClick={exportToWord} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <FileText size={16} className="text-blue-600" />
                    Export to Word
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Employee Name</th>
                <th className="py-3.5 px-5 font-semibold">Designation</th>
                <th className="py-3.5 px-5 font-semibold">Total Cash Collection</th>
                <th className="py-3.5 px-5 font-semibold">Total Cash Submitted</th>
                <th className="py-3.5 px-5 font-semibold">Total Cash Pending</th>
                <th className="py-3.5 px-5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 size={20} className="animate-spin text-[#225091]" />
                      <span className="text-sm font-medium">Loading cash payment records...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500 font-medium text-sm">
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
                    <tr key={empId || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100 shadow-xs">
                            <img src={avatarUrl} alt={empName} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-gray-900 font-semibold text-sm">{empName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{designation}</td>
                      <td className="py-3.5 px-5 text-sm font-bold text-gray-900 tabular-nums">₹{formatCurrency(payment.totalCashCollection)}</td>
                      <td className="py-3.5 px-5 text-sm font-semibold text-emerald-600 tabular-nums">₹{formatCurrency(payment.totalCashSubmitted)}</td>
                      <td className="py-3.5 px-5 text-sm font-semibold tabular-nums">
                        <span className={`${Number(payment.totalCashPending) > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                          ₹{formatCurrency(payment.totalCashPending)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openSubmitModal(payment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-semibold text-xs transition-all shadow-xs"
                            title="Submit Cash"
                          >
                            <ArrowDownCircle size={13} />
                            <span>Submit Cash</span>
                          </button>
                          <button 
                            onClick={() => navigate(`/cash-payment/view/${empId}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs" 
                            title="View Employee Cash Details"
                          >
                            <Eye size={13} /> View
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-colors ${page === i ? 'bg-[#225091] text-white shadow-sm' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
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
                  Deposit cash collected by <span className="font-semibold text-[#225091]">{selectedEmployee?.employeeName || selectedEmployee?.name || 'Employee'}</span>
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800" 
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800 appearance-none font-medium" 
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea 
                  rows="3" 
                  placeholder="Enter remarks (e.g. Cash deposited successfully)..." 
                  value={submitForm.remarks}
                  onChange={(e) => setSubmitForm({ ...submitForm, remarks: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-[15px] text-gray-800 resize-none"
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
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-[14px] disabled:opacity-50"
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
