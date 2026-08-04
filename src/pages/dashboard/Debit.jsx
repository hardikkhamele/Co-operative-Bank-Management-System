<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { debitReceiptService } from '../../api/receiptService';
import { toast } from 'react-toastify';
=======
import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockReceipts = [
  { id: 1, srNo: 1, receiptNo: 'DR-000123', name: 'Mamta Lodhi', glHead: '410105', glHeadName: 'Loan', accountNo: '38489745146', date: '20/07/2026', status: 'New' },
  { id: 2, srNo: 2, receiptNo: 'DR-000123', name: 'Hillery Moses', glHead: '410105', glHeadName: 'Loan', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
  { id: 3, srNo: 3, receiptNo: 'DR-000123', name: 'Mohd Hadi', glHead: '410105', glHeadName: 'Loan', accountNo: '38489745148', date: '20/07/2026', status: 'Rejected' },
  { id: 4, srNo: 4, receiptNo: 'DR-000123', name: 'Navjot Kaur', glHead: '410105', glHeadName: 'Loan', accountNo: '38489745148', date: '20/07/2026', status: 'New' },
  { id: 5, srNo: 5, receiptNo: 'DR-000123', name: 'Vishwas Patel', glHead: '410105', glHeadName: 'Daily Deposit', accountNo: '38489745148', date: '20/07/2026', status: 'New' },
  { id: 6, srNo: 6, receiptNo: 'DR-000123', name: 'Vikas Tiwari', glHead: '410105', glHeadName: 'Daily Agent Collection', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
  { id: 7, srNo: 7, receiptNo: 'DR-000123', name: 'Amardeep Singh', glHead: '410105', glHeadName: 'Monthly RD', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
  { id: 8, srNo: 8, receiptNo: 'DR-000123', name: 'Shalini Jain', glHead: '410105', glHeadName: 'Fixed Deposit', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
];
>>>>>>> origin/main

const Debit = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  
<<<<<<< HEAD
  const [filterStatus, setFilterStatus] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // API state
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const limit = 8;
  
=======
  const [filterBranch, setFilterBranch] = useState([]);
  const [filterReceiptType, setFilterReceiptType] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
>>>>>>> origin/main
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

<<<<<<< HEAD
  // Form state
  const [formData, setFormData] = useState({
    name: '', glHead: '', glHeadName: '', accountNumber: '', date: '', status: 'NEW'
  });

=======
>>>>>>> origin/main
  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

<<<<<<< HEAD
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus.length > 0 ? filterStatus.join(',') : undefined;
      const response = await debitReceiptService.getAll({ 
        page, limit, search: searchTerm, status: statusParam, 
        dateFrom: dateFrom || undefined, 
        dateTo: dateTo || undefined
      });
      if (response.success) {
        setReceipts(response.data.docs || response.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalEntries(response.data.totalDocs || response.data.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch receipts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, searchTerm, filterStatus, dateFrom, dateTo]);

  const handleCreate = async () => {
    try {
      const res = await debitReceiptService.create(formData);
      if (res.success) {
        toast.success('Receipt created successfully');
        setIsCreateModalOpen(false);
        fetchReceipts();
        setFormData({ name: '', glHead: '', glHeadName: '', accountNumber: '', date: '', status: 'NEW' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create receipt');
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await debitReceiptService.update(selectedReceipt._id || selectedReceipt.id, formData);
      if (res.success) {
        toast.success('Receipt updated successfully');
        setIsEditModalOpen(false);
        fetchReceipts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update receipt');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await debitReceiptService.delete(selectedReceipt._id || selectedReceipt.id);
      if (res.success) {
        toast.success('Receipt deleted successfully');
        setIsDeleteModalOpen(false);
        fetchReceipts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete receipt');
    }
  };

  const handleExport = async () => {
    try {
      const statusParam = filterStatus.length > 0 ? filterStatus.join(',') : undefined;
      const res = await debitReceiptService.export({ 
        search: searchTerm, 
        status: statusParam, 
        dateFrom: dateFrom || undefined, 
        dateTo: dateTo || undefined 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'debit-receipts.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error('Failed to export receipts');
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'NEW':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded w-20">New</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-green-500 bg-green-50 border border-green-200 rounded w-20">Approved</span>;
      case 'REJECTED':
=======
  const getStatusBadge = (status) => {
    switch(status) {
      case 'New':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded w-20">New</span>;
      case 'Approved':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-green-500 bg-green-50 border border-green-200 rounded w-20">Approved</span>;
      case 'Rejected':
>>>>>>> origin/main
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded w-20">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-[#1b58a6] mb-2">Debit Receipt</h1>
        <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
          <Link to="/dashboard" className="hover:text-[#1b58a6] transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>Receipt Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1cabb1]">Debit Receipt</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none bg-white shadow-sm"
            >
              <SlidersHorizontal size={18} />
<<<<<<< HEAD
              {(filterStatus.length > 0 || dateFrom || dateTo) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(filterStatus.length > 0 ? 1 : 0) + ((dateFrom || dateTo) ? 1 : 0)}
=======
              {(filterBranch.length > 0 || filterReceiptType.length > 0 || dateFrom || dateTo) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(filterBranch.length > 0 ? 1 : 0) + (filterReceiptType.length > 0 ? 1 : 0) + ((dateFrom || dateTo) ? 1 : 0)}
>>>>>>> origin/main
                </span>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
<<<<<<< HEAD
                  {/* Status Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'status' ? null : 'status')}
                    >
                      <span className="text-gray-500 text-[14px]">Status</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'status' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'status' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 flex flex-col">
                        {['NEW', 'APPROVED', 'REJECTED'].map(opt => (
=======
                  {/* Branch Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'branch' ? null : 'branch')}
                    >
                      <span className="text-gray-500 text-[14px]">Branch</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'branch' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'branch' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 flex flex-col">
                        {['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch'].map(opt => (
>>>>>>> origin/main
                          <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1] cursor-pointer"
<<<<<<< HEAD
                              checked={filterStatus.includes(opt)}
                              onChange={() => toggleFilter(setFilterStatus, opt)}
=======
                              checked={filterBranch.includes(opt)}
                              onChange={() => toggleFilter(setFilterBranch, opt)}
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Receipt Type Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'receiptType' ? null : 'receiptType')}
                    >
                      <span className="text-gray-500 text-[14px]">Receipt Type</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'receiptType' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'receiptType' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 flex flex-col">
                        {['Savings', 'Current', 'Monthly RD'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1] cursor-pointer"
                              checked={filterReceiptType.includes(opt)}
                              onChange={() => toggleFilter(setFilterReceiptType, opt)}
>>>>>>> origin/main
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Pickers */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <input 
                         type="date" 
                         value={dateFrom}
                         onChange={(e) => setDateFrom(e.target.value)}
                         className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white" 
                       />
                    </div>
                    <div className="flex-1 relative">
                       <input 
                         type="date" 
                         value={dateTo}
                         onChange={(e) => setDateTo(e.target.value)}
                         className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white" 
                       />
                    </div>
                  </div>

                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm bg-white"
<<<<<<< HEAD
                    onClick={() => { setFilterStatus([]); setDateFrom(''); setDateTo(''); }}
=======
                    onClick={() => { setFilterBranch([]); setFilterReceiptType([]); setDateFrom(''); setDateTo(''); }}
>>>>>>> origin/main
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors focus:outline-none text-sm shadow-sm"
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
<<<<<<< HEAD
            onClick={handleExport}
=======
>>>>>>> origin/main
            className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            <Download size={16} />
            Export
          </button>
          <button 
<<<<<<< HEAD
            onClick={() => { setFormData({ name: '', glHead: '', glHeadName: '', accountNumber: '', date: '', status: 'NEW' }); setIsCreateModalOpen(true); }}
=======
            onClick={() => setIsCreateModalOpen(true)}
>>>>>>> origin/main
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
            <thead className="bg-[#f8f9fb] text-[#1b2559] font-bold border-b border-gray-100">
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
<<<<<<< HEAD
              {loading ? (
                <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : receipts.length === 0 ? (
                <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-500">No receipts found</td></tr>
              ) : (
                receipts.map((receipt, index) => (
                  <tr key={receipt._id || receipt.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">{(page - 1) * limit + index + 1}</td>
                    <td className="px-6 py-4 text-[#1b2559] font-semibold">{receipt.receiptNumber || (receipt._id || receipt.id)?.substring(0,8)}</td>
                    <td className="px-6 py-4 text-[#1b2559]">{receipt.name}</td>
                    <td className="px-6 py-4 text-gray-700">{receipt.glHead}</td>
                    <td className="px-6 py-4 text-[#1b2559]">{receipt.glHeadName}</td>
                    <td className="px-6 py-4 text-[#1b2559]">{receipt.accountNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{receipt.date ? new Date(receipt.date).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(receipt.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/debit/view/${receipt._id || receipt.id}`)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => { 
                            setSelectedReceipt(receipt); 
                            setFormData({
                              name: receipt.name || '',
                              glHead: receipt.glHead || '',
                              glHeadName: receipt.glHeadName || '',
                              accountNumber: receipt.accountNumber || '',
                              date: receipt.date ? new Date(receipt.date).toISOString().split('T')[0] : '',
                              status: receipt.status || 'NEW'
                            });
                            setIsEditModalOpen(true); 
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedReceipt(receipt); setIsDeleteModalOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
=======
              {mockReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{receipt.srNo}</td>
                  <td className="px-6 py-4 text-[#1b2559] font-semibold">{receipt.receiptNo}</td>
                  <td className="px-6 py-4 text-[#1b2559]">{receipt.name}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.glHead}</td>
                  <td className="px-6 py-4 text-[#1b2559]">{receipt.glHeadName}</td>
                  <td className="px-6 py-4 text-[#1b2559]">{receipt.accountNo}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.date}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(receipt.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/debit/view/${receipt.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedReceipt(receipt); setIsEditModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedReceipt(receipt); setIsDeleteModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
>>>>>>> origin/main
            </tbody>
          </table>
        </div>
        
<<<<<<< HEAD
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="text-sm text-gray-700 font-semibold">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalEntries)} of {totalEntries} Entries
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors text-xs font-bold disabled:opacity-50">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-bold shadow-sm text-xs">
              {page}
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors text-xs font-bold disabled:opacity-50">
=======
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="text-sm text-gray-700 font-semibold">
            Showing 1 to 8 of 30 Entries
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors text-xs font-bold">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-bold shadow-sm text-xs">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">
              2
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">
              3
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors text-xs font-bold">
>>>>>>> origin/main
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f8f9fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 bg-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1b2559]">Create Receipt</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
<<<<<<< HEAD
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter Name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head</label>
                  <input type="text" value={formData.glHead} onChange={(e) => setFormData({...formData, glHead: e.target.value})} placeholder="Enter GL Head" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head Name</label>
                  <input type="text" value={formData.glHeadName} onChange={(e) => setFormData({...formData, glHeadName: e.target.value})} placeholder="Enter GL Head Name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Account No.</label>
                <input type="text" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} placeholder="Enter Account Number" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700">
                  <option value="NEW">New</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
=======
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Enter GL head name</label>
                <input type="text" placeholder="Enter GL head name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Account No.</label>
                <input type="text" placeholder="Enter account number" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Amount</label>
                <input type="number" placeholder="₹ Enter amount" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Note</label>
                <textarea rows="3" placeholder="Write any note" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 resize-none"></textarea>
>>>>>>> origin/main
              </div>
              
              <div className="flex justify-center items-center gap-4 mt-8">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white">
                  Cancel
                </button>
<<<<<<< HEAD
                <button onClick={handleCreate} className="px-8 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
=======
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
>>>>>>> origin/main
                  Create Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Receipt Modal */}
      {isEditModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f8f9fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 bg-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1b2559]">Modify Receipt</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
<<<<<<< HEAD
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter Name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head</label>
                  <input type="text" value={formData.glHead} onChange={(e) => setFormData({...formData, glHead: e.target.value})} placeholder="Enter GL Head" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head Name</label>
                  <input type="text" value={formData.glHeadName} onChange={(e) => setFormData({...formData, glHeadName: e.target.value})} placeholder="Enter GL Head Name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Account No.</label>
                <input type="text" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} placeholder="Enter Account Number" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700">
                  <option value="NEW">New</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
=======
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Enter GL head name</label>
                <input type="text" defaultValue={selectedReceipt.glHeadName} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Account No.</label>
                <input type="text" defaultValue={selectedReceipt.accountNo} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Amount</label>
                <input type="number" defaultValue="892.56" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Note</label>
                <textarea rows="3" placeholder="Write any note" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 resize-none"></textarea>
>>>>>>> origin/main
              </div>
              
              <div className="flex justify-center items-center gap-4 mt-8">
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white">
                  Cancel
                </button>
<<<<<<< HEAD
                <button onClick={handleUpdate} className="px-8 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
=======
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
>>>>>>> origin/main
                  Modify Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Receipt</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete receipt <span className="font-semibold text-gray-700">{selectedReceipt.receiptNo}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedReceipt(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
<<<<<<< HEAD
                onClick={handleDelete}
=======
                onClick={() => { setIsDeleteModalOpen(false); setSelectedReceipt(null); }}
>>>>>>> origin/main
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Debit;
