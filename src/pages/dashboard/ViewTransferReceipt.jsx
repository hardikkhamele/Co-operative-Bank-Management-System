import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Download, Printer, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { transferReceiptService } from '../../api/transferReceiptService';

const ViewTransferReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await transferReceiptService.getById(id);
        if (res && res.success && res.data) {
          setReceipt(res.data);
        } else {
          throw new Error(res?.message || 'Receipt not found');
        }
      } catch (err) {
        console.warn('Could not fetch transfer receipt details from API:', err.message);
        toast.error(err.message || 'Failed to load receipt details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleAction = async (newStatus) => {
    setUpdating(true);
    try {
      const receiptId = receipt?._id || receipt?.id || id;
      const res = await transferReceiptService.update(receiptId, { status: newStatus });
      toast.success(res?.message || `Receipt ${newStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      setReceipt(prev => ({
        ...prev,
        status: newStatus,
        approvedBy: newStatus === 'APPROVED' ? 'Admin / Manager' : null,
        rejectedBy: newStatus === 'REJECTED' ? 'Admin / Manager' : null
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update receipt status');
      setReceipt(prev => ({ ...prev, status: newStatus }));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'NEW':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-full">NEW</span>;
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
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 size={32} className="animate-spin text-[#225091]" />
        <span className="font-medium">Loading transfer receipt details...</span>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p className="text-lg font-semibold mb-4">Receipt not found.</p>
        <button 
          onClick={() => navigate('/transfer')}
          className="px-6 py-2 bg-[#225091] text-white rounded-full font-medium"
        >
          Back to Transfer Receipts
        </button>
      </div>
    );
  }

  const receiptDate = receipt.date ? (receipt.date.includes('T') ? receipt.date.split('T')[0] : receipt.date) : '—';
  const customerName = receipt.name || receipt.preparedBy || '—';
  const accountNumber = receipt.accountNumber || receipt.acNo || '—';
  const isNew = (receipt.status || '').toUpperCase() === 'NEW';

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => navigate('/transfer')}
              className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-[#225091]">View Receipt</h1>
          </div>
          <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide pl-[40px]">
            <Link to="/dashboard" className="hover:text-[#225091] transition-colors">Dashboard</Link>
            <ChevronRight size={14} className="mx-1" />
            <span>Receipt Management</span>
            <ChevronRight size={14} className="mx-1" />
            <Link to="/transfer" className="hover:text-[#225091] transition-colors">Transfer Receipt</Link>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-[#225091]">View Receipt</span>
          </div>
        </div>
        {!isNew && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              <Download size={16} />
              Download
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-[#225091] text-white hover:bg-[#168f94] rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Main Receipt Voucher */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative pb-24">
        
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
              <p className="text-sm text-gray-600 mt-0.5">{receipt.address || 'Central Office, Maharashtra'}</p>
              <p className="text-sm text-gray-600">{receipt.phone || '+91 98765 43210'}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-[#225091]">TRANSFER RECEIPT</h3>
            <p className="text-sm text-gray-600 mt-2">Receipt No: <span className="font-bold text-[#1b2559]">{receipt.receiptNo || 'TR-000001'}</span></p>
            <p className="text-sm text-gray-600 mt-0.5">Receipt Date: <span className="font-medium text-gray-800">{receiptDate}</span></p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-10 py-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
             <div>
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">Customer / Initiator Name</p>
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
                <p className="text-gray-900 font-semibold">{receipt.glHeadName || 'Daily Deposit'}</p>
             </div>
             <div className="md:text-right">
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">Amount</p>
                <p className="text-gray-900 font-bold text-[16px]">{receipt.amount ? `₹${receipt.amount}` : '—'}</p>
             </div>
           </div>
           
           <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs uppercase font-bold text-gray-400 mb-1.5">Narration / Note</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                {receipt.narration || `Transfer receipt posted for GL head ${receipt.glHeadName || 'Daily Deposit'} on Account No. ${accountNumber}.`}
              </p>
           </div>
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
                   : (receipt.approvedBy || (isNew ? 'Pending Approval' : 'Branch Manager'))}
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

        {/* Actions for 'NEW' Status */}
        {isNew && (
          <div className="absolute bottom-0 left-0 w-full p-4 flex justify-end gap-4 bg-white border-t border-gray-100 print:hidden">
             <button 
                type="button"
                disabled={updating}
                onClick={() => handleAction('REJECTED')}
                className="px-8 py-2.5 rounded-full border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
             >
               {updating && <Loader2 size={16} className="animate-spin" />}
               Reject
             </button>
             <button 
                type="button"
                disabled={updating}
                onClick={() => handleAction('APPROVED')}
                className="px-8 py-2.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
             >
               {updating && <Loader2 size={16} className="animate-spin" />}
               Approve Receipt
             </button>
          </div>
        )}
      </div>
      
      

    </div>
  );
};

export default ViewTransferReceipt;
