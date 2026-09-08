import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft,  
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
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { Skeleton, SkeletonTableRow } from '../../components/common/Skeleton';

const ViewCashPayment = () => {
  const navigate = useNavigate();
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
      console.warn('Could not fetch cash payment details from server; using fallback view:', err);
      // Fallback state to prevent UI crash
      setEmployee(prev => prev || {
        employeeName: 'Staff Member',
        employeeId: id,
        designation: 'Loan Executive',
        branchName: 'Main Branch'
      });
      setSummary(prev => prev || {
        totalCashCollection: 0,
        totalCashSubmitted: 0,
        totalCashPending: 0
      });
      setHistory([]);
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
      <PageHeader
        title="View Details"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Payment', to: '/cash-payment' },
          { label: 'View Details' }
        ]}
        showBack={true}
        backUrl="/cash-payment"
      />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 overflow-hidden">
        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-gray-50 bg-gray-100">
          <img src={avatarUrl} alt={empName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[#1b2559] truncate" title={empName}>{empName}</h2>
          <div 
            className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mt-1 mb-3 w-max max-w-full truncate"
            title={empDesignation}
          >
            {empDesignation}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium min-w-0">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={`Phone: ${empPhone}`}>
              <Phone size={16} className="text-[#225091] shrink-0" />
              <span className="truncate font-mono">{empPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate max-w-[240px]" title={`Email: ${empEmail}`}>
              <Mail size={16} className="text-[#225091] shrink-0" />
              <span className="truncate">{empEmail}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={`Branch: ${empBranch}`}>
              <MapPin size={16} className="text-[#225091] shrink-0" />
              <span className="truncate">{empBranch}</span>
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
          className="bg-[#225091] hover:bg-[#154685] text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm"
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
                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm text-[#4b5563] bg-white font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm text-[#4b5563] bg-white font-medium"
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
          <table className="w-full text-sm whitespace-nowrap text-center">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Sr. No.</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Amount Submitted</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={4} />
                ))
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
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          totalRecords={meta.totalRecords || history.length}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      {/* Submit Cash Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">Submit Cash</h2>
                <p className="text-xs text-gray-500 mt-0.5">Deposit cash collected by <span className="font-semibold text-[#225091]">{empName}</span></p>
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

export default ViewCashPayment;
