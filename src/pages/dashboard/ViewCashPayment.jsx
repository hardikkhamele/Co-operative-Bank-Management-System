import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Wallet, 
  ArrowDownCircle, 
  X, 
  Loader2, 
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cashPaymentService } from '../../api/cashPaymentService';

const ViewCashPayment = () => {
  const { id } = useParams(); // employeeId
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState({
    totalCashCollection: 0,
    totalCashSubmitted: 0,
    totalCashPending: 0
  });
  const [history, setHistory] = useState([]);
  
  // Date Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1
  });

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const todayISO = new Date().toISOString().split('T')[0];
  const [submitForm, setSubmitForm] = useState({
    date: todayISO,
    amountSubmitted: '',
    remarks: ''
  });

  // Fetch Details from API
  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const params = {
        page,
        limit
      };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await cashPaymentService.getDetails(id, params);
      if (res && (res.success || res.statusCode === 200)) {
        const data = res.data || {};
        setEmployee(data.employee || null);
        setSummary(data.summary || {
          totalCashCollection: 0,
          totalCashSubmitted: 0,
          totalCashPending: 0
        });
        const historyList = Array.isArray(data.history) ? data.history : [];
        setHistory(historyList);
        if (res.meta || res.pagination || res.data?.meta || res.data?.pagination) { setMeta(res.meta || res.pagination || res.data?.meta || res.data?.pagination); } else {
          setMeta({
            page,
            limit,
            totalRecords: historyList.length,
            totalPages: Math.ceil(historyList.length / limit) || 1
          });
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch cash payment details');
      }
    } catch (err) {
      console.error('Error fetching cash payment details:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [id, page, limit, fromDate, toDate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle Cash Submission
  const handleSubmitCash = async (e) => {
    e.preventDefault();
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
        remarks: submitForm.remarks.trim()
      };

      const res = await cashPaymentService.submitCash(id, payload);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res?.message || 'Cash deposited successfully!');
        setIsSubmitModalOpen(false);
        setSubmitForm({
          date: todayISO,
          amountSubmitted: '',
          remarks: ''
        });
        // Re-fetch updated summary and history
        fetchDetails();
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

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const empName = employee?.employeeName || employee?.name || employee?.fullName || 'Employee Details';
  const empDesignation = employee?.designation || 'Onboarding Team';
  const empPhone = employee?.phone || employee?.mobileNumber || employee?.contactNumber || '—';
  const empEmail = employee?.email || '—';
  const empBranch = employee?.branch || employee?.branchName || 'Main Branch';
  const avatarUrl = employee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=random`;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">View Details</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to="/cash-payment" className="hover:text-[#1b2559] transition-colors">Cash Payment</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">View Details</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-gray-50 bg-gray-100">
          <img src={avatarUrl} alt={empName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1">
          <h2 className="text-xl font-bold text-[#1b2559]">{empName}</h2>
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mt-1 mb-3 w-max">
            {empDesignation}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Phone size={16} className="text-[#1cabb1]" />
              <span>{empPhone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={16} className="text-[#1cabb1]" />
              <span>{empEmail}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-[#1cabb1]" />
              <span>{empBranch}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1b84ff] rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet size={64} />
          </div>
          <span className="text-sm font-semibold opacity-90 z-10 mb-2">Total Cash Collected</span>
          <span className="text-3xl font-bold z-10">₹{formatCurrency(summary.totalCashCollection)}</span>
        </div>
        
        <div className="bg-[#17c653] rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <ArrowDownCircle size={64} />
          </div>
          <span className="text-sm font-semibold opacity-90 z-10 mb-2">Total Cash Submitted</span>
          <span className="text-3xl font-bold z-10">₹{formatCurrency(summary.totalCashSubmitted)}</span>
        </div>
        
        <div className="bg-[#ff8f00] rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign size={64} />
          </div>
          <span className="text-sm font-semibold opacity-90 z-10 mb-2">Total Cash Pending</span>
          <span className="text-3xl font-bold z-10">₹{formatCurrency(summary.totalCashPending)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-[#1b58a6] hover:bg-[#154685] text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm"
        >
          Submit Cash
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#1b2559]">Cash Submit History</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm text-[#4b5563] bg-white font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm text-[#4b5563] bg-white font-medium"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); setPage(1); }}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset Date Filter"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f4f3fb] text-[#4b5563] font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sr. No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount Submitted</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 size={20} className="animate-spin text-[#1cabb1]" />
                      <span>Loading submission history...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500 font-medium">
                    No cash submission history found.
                  </td>
                </tr>
              ) : (
                history.map((item, index) => {
                  const itemId = item._id || item.id || index;
                  const itemAmount = item.amountSubmitted !== undefined ? item.amountSubmitted : item.amount;
                  return (
                    <tr key={itemId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{formatDate(item.date)}</td>
                      <td className="px-6 py-4 text-emerald-700 font-bold">₹{formatCurrency(itemAmount)}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-normal min-w-[300px]">
                        {item.remarks || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-semibold text-[#1b2559]">
            Showing {history.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, meta.totalRecords || history.length)} of {meta.totalRecords || history.length} Entries
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors disabled:opacity-40"
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors ${page === i ? 'bg-[#1cabb1] text-white shadow-sm border border-[#1cabb1]' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
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
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Cash Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">Submit Cash</h2>
                <p className="text-xs text-gray-500 mt-0.5">Deposit cash collected by <span className="font-semibold text-[#1cabb1]">{empName}</span></p>
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

export default ViewCashPayment;
