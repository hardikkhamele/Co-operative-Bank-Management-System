import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Download, Printer, Loader2, XCircle, CheckCircle, X } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { debitReceiptService } from '../../api/debitReceiptService';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/common/PageHeader';

const ViewDebitReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Reject & Preview modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const authRole = useAuthStore((state) => state.role);
  const authUser = useAuthStore((state) => state.user);
  const rawRole =
    authRole?.code ||
    authRole?.name ||
    authRole ||
    authUser?.role?.code ||
    authUser?.role?.name ||
    authUser?.role ||
    "";
  const roleString = (typeof rawRole === "string" ? rawRole : "").toUpperCase();
  const canApprove =
    !roleString ||
    roleString.includes("OWNER") ||
    roleString.includes("MANAGER") ||
    roleString.includes("ACCOUNTANT") ||
    roleString.includes("CA") ||
    roleString.includes("ADMIN");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await debitReceiptService.getById(id);
        if (res && res.success && res.data) {
          setReceipt(res.data);
        } else {
          throw new Error(res?.message || 'Receipt not found');
        }
      } catch (err) {
        console.warn('Could not fetch debit receipt details from API:', err.message);
        toast.error(err.message || 'Failed to load receipt details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      const receiptId = receipt?._id || receipt?.id || id;
      const res = await debitReceiptService.approve(receiptId);
      toast.success(res?.message || 'Debit receipt approved successfully.');
      setReceipt(prev => ({
        ...prev,
        status: 'APPROVED',
        rejectionReason: null,
        approvedBy: res?.data?.approvedBy || 'Branch Manager / Owner'
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to approve receipt');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async (e) => {
    if (e) e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setUpdating(true);
    try {
      const receiptId = receipt?._id || receipt?.id || id;
      const res = await debitReceiptService.reject(receiptId, rejectionReason.trim());
      toast.success(res?.message || 'Debit receipt rejected successfully.');
      setIsRejectModalOpen(false);
      setReceipt(prev => ({
        ...prev,
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        rejectedBy: res?.data?.rejectedBy || 'Branch Manager / Owner'
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reject receipt');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
      case 'NEW':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">PENDING</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-bold text-[#225091] bg-teal-50 border border-teal-200 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-full">REJECTED</span>;
      default:
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="w-full p-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 size={32} className="animate-spin text-[#225091]" />
        <span className="font-medium">Loading debit receipt details...</span>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="w-full p-12 text-center text-gray-500">
        <p className="text-lg font-semibold mb-4">Receipt not found.</p>
        <button 
          onClick={() => navigate('/debit')}
          className="px-6 py-2 bg-[#225091] text-white rounded-full font-medium"
        >
          Back to Debit Receipts
        </button>
      </div>
    );
  }

  const receiptDate = receipt.date ? (receipt.date.includes('T') ? receipt.date.split('T')[0] : receipt.date) : '—';
  const customerName = receipt.name || receipt.preparedBy || '—';
  const accountNumber = receipt.accountNumber || receipt.acNo || '—';
  const isPending = ['NEW', 'PENDING'].includes((receipt.status || '').toUpperCase());

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header and Breadcrumb */}
      <PageHeader
        title="View Debit Receipt"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Receipt Management' },
          { label: 'Debit Receipt', to: '/debit' },
          { label: 'View Receipt' }
        ]}
        showBack={true}
        backUrl="/debit"
        className="print:hidden"
      >
        {isPending && canApprove ? (
          <>
            <button 
              type="button"
              disabled={updating}
              onClick={() => {
                setRejectionReason('');
                setIsRejectModalOpen(true);
              }}
              className="px-5 py-2 rounded-full border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <XCircle size={14} />
              <span>Reject</span>
            </button>
            <button 
              type="button"
              disabled={updating}
              onClick={handleApprove}
              className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm text-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              <span>Approve Receipt</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([JSON.stringify(receipt, null, 2)], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `Debit-Receipt-${receipt.receiptNo || id}.json`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-[#225091] hover:bg-[#1b427b] text-white rounded-full font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </>
        )}
      </PageHeader>

      {/* Main Receipt Voucher */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative pb-24">
        
        {/* Document Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#225091]/10 rounded-xl flex flex-col items-center justify-center shrink-0 text-[#225091]">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
               </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{receipt.bankName || 'Advita Co-operative Bank'}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{receipt.branchName ? `${receipt.branchName}, ` : ''}{receipt.address || receipt.city || 'Central Office, Maharashtra'}</p>
              <p className="text-sm text-gray-600">{receipt.phone || '+91 98765 43210'}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-[#225091]">DEBIT RECEIPT</h3>
            <p className="text-sm text-gray-600 mt-2">Receipt No: <span className="font-bold text-[#1b2559]">{receipt.receiptNo || 'DR-000001'}</span></p>
            <p className="text-sm text-gray-600 mt-0.5">Receipt Date: <span className="font-medium text-gray-800">{receiptDate}</span></p>
          </div>
        </div>

        {/* Rejection Alert Banner */}
        {receipt.status === 'REJECTED' && (
          <div className="mx-10 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <XCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-rose-800">Receipt Rejected</h4>
              <p className="text-sm text-rose-700 mt-1">
                <span className="font-semibold">Rejection Reason: </span>
                {receipt.rejectionReason || 'No specific reason provided.'}
              </p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="px-10 py-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
             <div>
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">Customer / Payee Name</p>
                <p className="text-gray-900 font-semibold text-[16px]">{customerName}</p>
             </div>
             <div className="flex flex-col md:items-end">
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">Status</p>
                <div>{getStatusBadge(receipt.status)}</div>
             </div>
             
             <div>
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">Account Number</p>
                <p className="text-gray-900 font-mono font-bold text-[15px]">{accountNumber}</p>
             </div>
             <div className="md:text-right">
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">GL Head Code</p>
                <p className="text-gray-900 font-semibold">{receipt.glHead || '410105'}</p>
             </div>
             
             <div>
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">GL Head Name</p>
                <p className="text-gray-900 font-semibold">{receipt.glHeadName || 'Loan'}</p>
             </div>
             <div className="md:text-right">
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">Amount</p>
                <p className="text-gray-900 font-bold text-[16px]">{receipt.formattedAmount || (receipt.amount ? `₹${receipt.amount}` : '—')}</p>
             </div>
           </div>
           
           <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs uppercase font-bold text-gray-400 mb-1.5">Narration / Note</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                {receipt.narration || `Debit receipt debited under ${receipt.glHeadName || 'Loan'} from Account No. ${accountNumber}.`}
              </p>
           </div>

           {receipt.image && (
             <div className="mt-6 pt-6 border-t border-gray-100">
               <p className="text-xs uppercase font-bold text-gray-400 mb-2">Attached Receipt Document</p>
               <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 inline-block max-w-sm">
                 <img
                   src={receipt.image}
                   alt="Receipt attachment"
                   className="max-h-48 w-auto rounded-lg object-contain border border-gray-200 shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                   onClick={() => setPreviewImageUrl(receipt.image)}
                 />
                 <p className="text-[11px] text-gray-500 mt-1.5 text-center font-medium">Click to expand preview</p>
               </div>
             </div>
           )}
        </div>

        {/* Signatures Section */}
        <div className="px-10 pb-12 pt-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-gray-100 mx-10">
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-300"></div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3 mb-1">Prepared By</p>
              <p className="text-gray-800 text-sm font-medium truncate">
                 {customerName}
              </p>
           </div>
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-300"></div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3 mb-1">
                {(receipt.status || '').toUpperCase() === 'REJECTED' ? 'Rejected By' : 'Approved By'}
              </p>
              <p className="text-gray-800 text-sm font-medium truncate">
                 {(receipt.status || '').toUpperCase() === 'REJECTED' 
                   ? (receipt.rejectedBy || 'Branch Manager') 
                   : (receipt.approvedBy || (isPending ? 'Pending Approval' : 'Branch Manager'))}
              </p>
           </div>
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-300"></div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3 mb-1">Received By</p>
              <p className="text-gray-800 text-sm font-medium truncate">
                 {receipt.receivedBy || 'Cashier / Officer'}
              </p>
           </div>
        </div>

        {/* Actions for Pending Status & Authorized Roles */}
        {isPending && canApprove && (
          <div className="w-full p-6 flex justify-end gap-4 bg-gray-50 border-t border-gray-100 print:hidden">
             <button 
                type="button"
                disabled={updating}
                onClick={() => {
                  setRejectionReason('');
                  setIsRejectModalOpen(true);
                }}
                className="px-8 py-2.5 rounded-xl border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 font-semibold transition-colors text-sm disabled:opacity-50 flex items-center gap-2 shadow-xs"
             >
               <XCircle size={16} />
               Reject
             </button>
             <button 
                type="button"
                disabled={updating}
                onClick={handleApprove}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
             >
               {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
               Approve Receipt
             </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <XCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Reject Debit Receipt
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Please specify the mandatory reason for rejecting receipt{" "}
              <span className="font-semibold text-gray-700">
                {receipt.receiptNo || "DR-000001"}
              </span>.
            </p>
            <form onSubmit={handleReject}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid account number provided for ledger transfer"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-gray-800 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || !rejectionReason.trim()}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Confirm Reject"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Panel Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Debit Receipt Document Preview</h3>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-gray-50 rounded-xl my-3">
              <img
                src={previewImageUrl}
                alt="Debit Receipt Document"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDebitReceipt;
