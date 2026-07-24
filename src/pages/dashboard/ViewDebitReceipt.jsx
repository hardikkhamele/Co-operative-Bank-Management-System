import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Download, Printer } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const mockReceipts = [
  { 
    id: 1, 
    receiptNo: 'DR-000123', 
    date: '20-Jul-2026', 
    bankName: 'SBI Branch', 
    address: 'Mumbai, Maharashtra',
    phone: '9876543210',
    accountNo: '38489745146', 
    amount: '892.56', 
    status: 'New', 
    glHead: '410105',
    glHeadName: 'Loan',
    narration: 'Lorem ipsum dolor sit amet consectetur. Hendrerit nulla maecenas ultrices duis. Placerat dictum condimentum odio.', 
    preparedBy: 'Darlene Robertson', 
    approvedBy: null, 
    rejectedBy: null,
    receivedBy: 'Cameron Williamson' 
  },
  { 
    id: 2, 
    receiptNo: 'DR-000124', 
    date: '20-Jul-2026', 
    bankName: 'HDFC Bank', 
    address: 'Mumbai, Maharashtra',
    phone: '9876543210',
    accountNo: '38489745148', 
    amount: '892.56', 
    status: 'Approved', 
    glHead: '410105',
    glHeadName: 'Loan',
    narration: 'Lorem ipsum dolor sit amet consectetur. Hendrerit nulla maecenas ultrices duis. Placerat dictum condimentum odio.', 
    preparedBy: 'Darlene Robertson', 
    approvedBy: 'Floyd Miles', 
    rejectedBy: null,
    receivedBy: 'Cameron Williamson' 
  },
  { 
    id: 3, 
    receiptNo: 'DR-000125', 
    date: '20-Jul-2026', 
    bankName: 'ICICI Bank', 
    address: 'Mumbai, Maharashtra',
    phone: '9876543210',
    accountNo: '38489745148', 
    amount: '892.56', 
    status: 'Rejected', 
    glHead: '410105',
    glHeadName: 'Loan',
    narration: 'Lorem ipsum dolor sit amet consectetur. Hendrerit nulla maecenas ultrices duis. Placerat dictum condimentum odio.', 
    preparedBy: 'Darlene Robertson', 
    approvedBy: null,
    rejectedBy: 'Floyd Miles', 
    receivedBy: 'Cameron Williamson' 
  },
];

const ViewDebitReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    // In a real app, fetch the receipt by ID from an API
    const found = mockReceipts.find(r => r.id === parseInt(id));
    if (found) {
      setReceipt(found);
    } else {
      // Fallback if not found in mock data
      setReceipt(mockReceipts[0]);
    }
  }, [id]);

  if (!receipt) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const handleAction = (newStatus) => {
    // In a real app, call API to update status
    setReceipt(prev => ({ ...prev, status: newStatus }));
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'New':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded">New</span>;
      case 'Approved':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-green-500 bg-green-50 border border-green-200 rounded">Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1b58a6] mb-2">View Receipt</h1>
          <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
            <Link to="/dashboard" className="hover:text-[#1b58a6] transition-colors">Dashboard</Link>
            <ChevronRight size={14} className="mx-1" />
            <span>Receipt Management</span>
            <ChevronRight size={14} className="mx-1" />
            <Link to="/debit" className="hover:text-[#1b58a6] transition-colors">Debit Receipt</Link>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-[#1cabb1]">View Receipt</span>
          </div>
        </div>
        {receipt.status !== 'New' && (
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors shadow-sm">
              <Download size={16} />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1cabb1] text-white hover:bg-[#168f94] rounded-lg font-semibold text-sm transition-colors shadow-sm">
              <Printer size={16} />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative pb-24">
        
        {/* Document Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-50 flex flex-col items-center justify-center shrink-0">
               {/* Simple Bank Icon */}
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-700">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
               </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{receipt.bankName}</h2>
              <p className="text-sm text-gray-600 mt-1">{receipt.address}</p>
              <p className="text-sm text-gray-600">{receipt.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">DEBIT RECEIPT</h3>
            <p className="text-sm text-gray-600 mt-2">Receipt No: <span className="font-semibold">{receipt.receiptNo}</span></p>
            <p className="text-sm text-gray-600 mt-0.5">Receipt Date: {receipt.date}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-10 py-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
             <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-gray-900 font-semibold">{receipt.preparedBy}</p>
             </div>
             <div className="flex flex-col md:items-end">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div>{getStatusBadge(receipt.status)}</div>
             </div>
             
             <div>
                <p className="text-sm text-gray-500 mb-1">Account Number</p>
                <p className="text-gray-900 font-semibold">{receipt.accountNo}</p>
             </div>
             <div className="md:text-right">
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="text-gray-900 font-semibold">{receipt.amount}</p>
             </div>
             
             <div>
                <p className="text-sm text-gray-500 mb-1">GL Head</p>
                <p className="text-gray-900 font-semibold">{receipt.glHead}</p>
             </div>
             <div className="md:text-right">
                <p className="text-sm text-gray-500 mb-1">GL Head Name</p>
                <p className="text-gray-900 font-semibold">{receipt.glHeadName}</p>
             </div>
           </div>
           
           <div className="mt-8">
              <p className="text-sm text-gray-500 mb-1">Narration</p>
              <p className="text-gray-800 text-sm leading-relaxed">
                {receipt.narration}
              </p>
           </div>
        </div>

        {/* Signatures Section */}
        <div className="px-10 pb-12 pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-gray-100 mx-10">
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-300"></div>
              <p className="text-sm text-gray-600 mt-3 font-medium mb-1">Prepared By</p>
              <p className="text-gray-500 text-sm truncate">
                 {receipt.preparedBy}
              </p>
           </div>
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-300"></div>
              <p className="text-sm text-gray-600 mt-3 font-medium mb-1">{receipt.status === 'Rejected' ? 'Rejected By' : 'Approved By'}</p>
              <p className="text-gray-500 text-sm truncate">
                 {receipt.status === 'Rejected' ? (receipt.rejectedBy || '') : (receipt.approvedBy || '')}
              </p>
           </div>
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-300"></div>
              <p className="text-sm text-gray-600 mt-3 font-medium mb-1">Received By</p>
              <p className="text-gray-500 text-sm truncate">
                 {receipt.receivedBy || ''}
              </p>
           </div>
        </div>

        {/* Actions for 'New' Status */}
        {receipt.status === 'New' && (
          <div className="absolute bottom-0 left-0 w-full p-4 flex justify-end gap-4 bg-white border-t border-gray-100">
             <button 
                onClick={() => handleAction('Rejected')}
                className="px-8 py-2 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 transition-colors text-sm"
             >
               Reject
             </button>
             <button 
                onClick={() => handleAction('Approved')}
                className="px-8 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-sm text-sm"
             >
               Accept
             </button>
          </div>
        )}
      </div>
      
      {/* Back Button */}
      <div>
        <button 
          onClick={() => navigate('/debit')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1b2559] font-medium transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Debit Receipts
        </button>
      </div>

    </div>
  );
};

export default ViewDebitReceipt;
