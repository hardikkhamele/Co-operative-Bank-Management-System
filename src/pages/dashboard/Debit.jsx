import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye, Download, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { debitReceiptService } from '../../api/debitReceiptService';

const fallbackReceipts = [
  { id: '1', _id: '1', srNo: 1, receiptNo: 'DR-000001', name: 'Hillery Moses', glHead: '410105', glHeadName: 'Loan', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'APPROVED' },
  { id: '2', _id: '2', srNo: 2, receiptNo: 'DR-000002', name: 'Mamta Lodhi', glHead: '410105', glHeadName: 'Loan', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'NEW' },
  { id: '3', _id: '3', srNo: 3, receiptNo: 'DR-000003', name: 'Mohd Hadi', glHead: '410105', glHeadName: 'Loan', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'REJECTED' },
  { id: '4', _id: '4', srNo: 4, receiptNo: 'DR-000004', name: 'Navjot Kaur', glHead: '410105', glHeadName: 'Loan', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'NEW' },
  { id: '5', _id: '5', srNo: 5, receiptNo: 'DR-000005', name: 'Vishwas Patel', glHead: '410105', glHeadName: 'Daily Deposit', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'NEW' },
  { id: '6', _id: '6', srNo: 6, receiptNo: 'DR-000006', name: 'Vikas Tiwari', glHead: '410105', glHeadName: 'Daily Agent Collection', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'APPROVED' },
  { id: '7', _id: '7', srNo: 7, receiptNo: 'DR-000007', name: 'Amardeep Singh', glHead: '410105', glHeadName: 'Monthly RD', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'APPROVED' },
  { id: '8', _id: '8', srNo: 8, receiptNo: 'DR-000008', name: 'Shalini Jain', glHead: '410105', glHeadName: 'Fixed Deposit', accountNumber: '36489745148', acNo: '36489745148', date: '2026-07-20', status: 'APPROVED' },
];

const GL_HEAD_OPTIONS = [
  { code: '410105', name: 'Loan' },
  { code: '410106', name: 'Daily Deposit' },
  { code: '410107', name: 'Daily Agent Collection' },
  { code: '410108', name: 'Monthly RD' },
  { code: '410109', name: 'Savings Account' },
  { code: '410110', name: 'Current Account' },
  { code: '410111', name: 'Fixed Deposit' },
  { code: '410112', name: 'Recurring Deposit' }
];

const Debit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [receipts, setReceipts] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 8;
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    page: 1,
    limit: 8,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create
  const todayISO = new Date().toISOString().split('T')[0];
  const [createForm, setCreateForm] = useState({
    name: '',
    glHead: '410105',
    glHeadName: 'Loan',
    accountNumber: '',
    date: todayISO,
    status: 'APPROVED'
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState({
    name: '',
    glHead: '410105',
    glHeadName: 'Loan',
    accountNumber: '',
    date: todayISO,
    status: 'APPROVED'
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Receipts from live API with fallback
  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus.toUpperCase();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await debitReceiptService.list(params);
      if (res && res.success) {
        const listData = Array.isArray(res.data) ? res.data : (res.data?.receipts || []);
        setReceipts(listData);
        if (res.meta || res.pagination || res.data?.meta || res.data?.pagination) { setMeta(res.meta || res.pagination || res.data?.meta || res.data?.pagination); } else {
          setMeta({
            totalRecords: listData.length,
            totalPages: Math.ceil(listData.length / limit) || 1,
            page,
            limit,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } else {
        throw new Error(res?.message || 'Failed to retrieve debit receipts');
      }
    } catch (err) {
      console.warn('Live debit-receipts API call fallback:', err.message);
      let filtered = [...fallbackReceipts];
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        filtered = filtered.filter(r => 
          r.name.toLowerCase().includes(q) || 
          r.receiptNo.toLowerCase().includes(q) ||
          (r.accountNumber && r.accountNumber.includes(q)) ||
          (r.glHeadName && r.glHeadName.toLowerCase().includes(q))
        );
      }
      if (selectedStatus) {
        filtered = filtered.filter(r => r.status?.toUpperCase() === selectedStatus.toUpperCase());
      }
      if (dateFrom) {
        filtered = filtered.filter(r => r.date >= dateFrom);
      }
      if (dateTo) {
        filtered = filtered.filter(r => r.date <= dateTo);
      }
      setReceipts(filtered.slice((page - 1) * limit, page * limit));
      setMeta({
        totalRecords: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
        page,
        limit,
        hasNextPage: page * limit < filtered.length,
        hasPrevPage: page > 1
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Handle Create Debit Receipt
  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!createForm.accountNumber.trim()) {
      toast.error('Please enter account number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        glHead: createForm.glHead,
        glHeadName: createForm.glHeadName,
        accountNumber: createForm.accountNumber.trim(),
        date: createForm.date,
        status: createForm.status.toUpperCase()
      };
      
      const res = await debitReceiptService.create(payload);
      toast.success(res?.message || 'Debit Receipt created successfully!');
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        glHead: '410105',
        glHeadName: 'Loan',
        accountNumber: '',
        date: todayISO,
        status: 'APPROVED'
      });
      fetchReceipts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create debit receipt');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (receipt) => {
    setSelectedReceipt(receipt);
    setEditForm({
      name: receipt.name || '',
      glHead: receipt.glHead || '410105',
      glHeadName: receipt.glHeadName || 'Loan',
      accountNumber: receipt.accountNumber || receipt.acNo || '',
      date: receipt.date ? receipt.date.split('T')[0] : todayISO,
      status: (receipt.status || 'APPROVED').toUpperCase()
    });
    setIsEditModalOpen(true);
  };

  // Handle Update Debit Receipt
  const handleUpdateReceipt = async (e) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    setSubmitting(true);
    try {
      const receiptId = selectedReceipt._id || selectedReceipt.id;
      const payload = {
        name: editForm.name.trim(),
        glHead: editForm.glHead,
        glHeadName: editForm.glHeadName,
        accountNumber: editForm.accountNumber.trim(),
        date: editForm.date,
        status: editForm.status.toUpperCase()
      };

      const res = await debitReceiptService.update(receiptId, payload);
      toast.success(res?.message || 'Receipt updated successfully.');
      setIsEditModalOpen(false);
      setSelectedReceipt(null);
      fetchReceipts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update debit receipt');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Debit Receipt
  const handleDeleteReceipt = async () => {
    if (!selectedReceipt) return;

    setSubmitting(true);
    try {
      const receiptId = selectedReceipt._id || selectedReceipt.id;
      const res = await debitReceiptService.delete(receiptId);
      toast.success(res?.message || 'Debit Receipt deleted successfully.');
      setIsDeleteModalOpen(false);
      setSelectedReceipt(null);
      fetchReceipts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete debit receipt');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus.toUpperCase();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await debitReceiptService.exportCsv(params);
      
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'debit-receipts.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Debit Receipts exported successfully!');
    } catch (err) {
      console.warn('Export API error, generating client-side CSV:', err.message);
      const headers = ['Sr.No.', 'Receipt No', 'Name', 'GL Head', 'GL Head Name', 'Account Number', 'Date', 'Status'];
      const rows = receipts.map((r, idx) => [
        (page - 1) * limit + idx + 1,
        `"${r.receiptNo || ''}"`,
        `"${r.name || ''}"`,
        `"${r.glHead || ''}"`,
        `"${r.glHeadName || ''}"`,
        `"${r.accountNumber || r.acNo || ''}"`,
        `"${r.date || ''}"`,
        `"${r.status || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'debit-receipts.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Debit Receipts exported successfully!');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'NEW':
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-yellow-700 bg-yellow-100/80 rounded-full border border-yellow-200">New</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-[#1cabb1] bg-teal-50 rounded-full border border-teal-100">Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-red-500 bg-red-50 rounded-full border border-red-100">Rejected</span>;
      default:
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-gray-600 bg-gray-100 rounded-full border border-gray-200">{status || 'APPROVED'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">Debit Receipt</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <span>Receipt Management</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Debit Receipt</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm bg-white text-gray-700"
              placeholder="Search by name, receipt, or account"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Popover Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none bg-white"
              title="Filters"
            >
              <SlidersHorizontal size={18} />
              {(selectedStatus || dateFrom || dateTo) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(selectedStatus ? 1 : 0) + (dateFrom || dateTo ? 1 : 0)}
                </span>
              )}
            </button>
            
            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute z-30 top-full left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-[#f8f9fb] border border-gray-200 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter Debit Receipts</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm text-gray-700"
                    >
                      <option value="">All Statuses</option>
                      <option value="NEW">New</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">From Date</label>
                    <input 
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">To Date</label>
                    <input 
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm text-gray-700"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white"
                    onClick={() => { setSelectedStatus(''); setDateFrom(''); setDateTo(''); }}
                  >
                    Reset
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors text-sm shadow-sm"
                    onClick={() => { setIsFilterOpen(false); setPage(1); }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Export & Create */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0 disabled:opacity-50"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button 
            onClick={() => { setCreateForm({ name: '', glHead: '410105', glHeadName: 'Loan', accountNumber: '', date: todayISO, status: 'NEW' }); setIsCreateModalOpen(true); }}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            + Create Receipt
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
                <th className="px-6 py-4">Receipt No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">GL Head</th>
                <th className="px-6 py-4">GL Head Name</th>
                <th className="px-6 py-4">A/C No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 size={20} className="animate-spin text-[#1cabb1]" />
                      <span>Loading debit receipts...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 font-medium text-gray-500">
                    No debit receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map((receipt, index) => {
                  const receiptId = receipt._id || receipt.id;
                  const formattedDate = receipt.date ? (
                    receipt.date.includes('T') ? receipt.date.split('T')[0] : receipt.date
                  ) : '—';

                  return (
                    <tr key={receiptId || index} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">{receipt.srNo || (page - 1) * limit + index + 1}</td>
                      <td className="px-6 py-4 text-[#1b2559] font-bold">{receipt.receiptNo || `DR-${String(index + 1).padStart(6, '0')}`}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{receipt.name}</td>
                      <td className="px-6 py-4 text-gray-700">{receipt.glHead}</td>
                      <td className="px-6 py-4 text-gray-700">{receipt.glHeadName}</td>
                      <td className="px-6 py-4 text-gray-700 font-mono">{receipt.accountNumber || receipt.acNo}</td>
                      <td className="px-6 py-4 text-gray-700">{formattedDate}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(receipt.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5">
                          <button 
                            onClick={() => navigate(`/debit/view/${receiptId}`)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                            title="View Receipt"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => openEditModal(receipt)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                            title="Edit Receipt"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => { setSelectedReceipt(receipt); setIsDeleteModalOpen(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" 
                            title="Delete Receipt"
                          >
                            <Trash2 size={16} />
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
          <div className="text-sm text-gray-600 font-medium">
            Showing {receipts.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, meta.totalRecords || receipts.length)} of {meta.totalRecords || receipts.length} Entries
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

      {/* 2.3 Create Debit Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[540px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-200/60 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">Create Debit Receipt</h2>
                <p className="text-xs text-gray-500 mt-0.5">Generate a new DR- receipt for customer</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleCreateReceipt} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Customer Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Hillery Moses" 
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">GL Head Code <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 410105" 
                    value={createForm.glHead}
                    onChange={(e) => setCreateForm({ ...createForm, glHead: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">GL Head Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={createForm.glHeadName}
                      onChange={(e) => {
                        const selectedOption = GL_HEAD_OPTIONS.find(o => o.name === e.target.value);
                        setCreateForm({
                          ...createForm,
                          glHeadName: e.target.value,
                          glHead: selectedOption ? selectedOption.code : createForm.glHead
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-gray-800"
                    >
                      {GL_HEAD_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Account Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 36489745148" 
                  value={createForm.accountNumber}
                  onChange={(e) => setCreateForm({ ...createForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800 font-mono" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Receipt Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Initial Status</label>
                  <div className="relative">
                    <select 
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-gray-800 font-medium"
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="NEW">NEW</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[14px] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Creating...' : 'Create Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2.5 Update Debit Receipt Modal */}
      {isEditModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[540px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-200/60 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">Modify Debit Receipt</h2>
                <p className="text-xs text-gray-500 mt-0.5">Receipt: <span className="font-semibold text-[#1cabb1]">{selectedReceipt.receiptNo}</span></p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleUpdateReceipt} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Customer Name</label>
                <input 
                  type="text" 
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">GL Head Code</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.glHead}
                    onChange={(e) => setEditForm({ ...editForm, glHead: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">GL Head Name</label>
                  <div className="relative">
                    <select 
                      value={editForm.glHeadName}
                      onChange={(e) => {
                        const selectedOption = GL_HEAD_OPTIONS.find(o => o.name === e.target.value);
                        setEditForm({
                          ...editForm,
                          glHeadName: e.target.value,
                          glHead: selectedOption ? selectedOption.code : editForm.glHead
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-gray-800"
                    >
                      {GL_HEAD_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Account Number</label>
                <input 
                  type="text" 
                  required
                  value={editForm.accountNumber}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800 font-mono" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Receipt Date</label>
                  <input 
                    type="date" 
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Status</label>
                  <div className="relative">
                    <select 
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-gray-800 font-semibold"
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="NEW">NEW</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[14px] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Saving...' : 'Update Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2.6 Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Debit Receipt</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete debit receipt <span className="font-semibold text-gray-700">{selectedReceipt.receiptNo || 'selected receipt'}</span> for <span className="font-semibold text-gray-700">{selectedReceipt.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setSelectedReceipt(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteReceipt}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Debit;
