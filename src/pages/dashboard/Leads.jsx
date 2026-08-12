import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ChevronRight, Search, ChevronDown, Eye, Trash2, X, 
  SlidersHorizontal, Download, ChevronLeft, Loader2, AlertCircle 
} from 'lucide-react';
import { leadService } from '../../api/leadService';

const getStatusBadge = (status) => {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'NEW':
      return <span className="px-4 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold whitespace-nowrap">New</span>;
    case 'PENDING_DOWN_PAYMENT':
      return <span className="px-4 py-1.5 rounded-md bg-amber-50 border border-amber-300 text-amber-600 text-xs font-semibold whitespace-nowrap">Pending Down Payment</span>;
    case 'ACTIVE':
      return <span className="px-4 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[#5a5ce5] text-xs font-semibold whitespace-nowrap">Active</span>;
    case 'COMPLETED':
      return <span className="px-4 py-1.5 rounded-md bg-green-50 border border-green-400 text-[#00c950] text-xs font-semibold whitespace-nowrap">Completed</span>;
    case 'REJECTED':
      return <span className="px-4 py-1.5 rounded-md bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold whitespace-nowrap">Rejected</span>;
    default:
      return <span className="px-4 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold whitespace-nowrap">{status || 'N/A'}</span>;
  }
};

const getInitials = (name) => {
  if (!name) return 'LD';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Leads = () => {
  const navigate = useNavigate();

  // Data states
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    page: 1,
    limit: 8,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const res = await leadService.list(params);
      if (res && res.success) {
        setLeads(res.data || []);
        if (res.meta || res.pagination || res.data?.meta || res.data?.pagination) { setMeta(res.meta || res.pagination || res.data?.meta || res.data?.pagination); }
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      const errMsg = err.response?.data?.message || 'Failed to fetch leads.';
      toast.error(errMsg);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedStatus]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Export leads to CSV
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const params = {
        page,
        limit: 100, // Export maximum allowed records or current filters
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus;

      const blobData = await leadService.export(params);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Leads exported successfully.');
    } catch (err) {
      console.error('Failed to export leads:', err);
      const errMsg = err.response?.data?.message || 'Failed to export leads.';
      toast.error(errMsg);
    } finally {
      setExporting(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async () => {
    if (!leadToDelete?.id) return;
    setDeleteSubmitting(true);
    try {
      const res = await leadService.delete(leadToDelete.id);
      if (res && res.success) {
        toast.success(res.message || 'Lead deleted successfully.');
        setIsDeleteModalOpen(false);
        setLeadToDelete(null);
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
      const errMsg = err.response?.data?.message || 'Failed to delete lead.';
      toast.error(errMsg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleResetFilter = () => {
    setSelectedStatus('');
    setIsFilterOpen(false);
    setPage(1);
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    setPage(1);
  };

  const activeFiltersCount = selectedStatus ? 1 : 0;

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#1b7ef7] mb-2">Leads</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>CRM Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b7ef7]">Leads</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {/* Left Side: Search & Filter */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] sm:text-sm bg-white"
              placeholder="Search application no, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="relative w-[42px] h-[42px] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] transition-colors"
              title="Filter by status"
            >
              <SlidersHorizontal size={20} className="text-gray-500" />
              {activeFiltersCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1cabb1] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border-[1.5px] border-white">
                  {activeFiltersCount}
                </div>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 md:left-auto md:right-0 mt-2 w-72 bg-[#f8f9fb] border border-gray-100 rounded-2xl shadow-xl p-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-gray-800 text-[15px]">Filter Leads</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Status</label>
                    <div className="relative">
                      <div 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                        onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
                      >
                        <span className="text-gray-700 text-[13px]">
                          {selectedStatus ? selectedStatus.replace(/_/g, ' ') : 'All Statuses'}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </div>
                      {openStatusDropdown && (
                        <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto">
                          {[
                            { label: 'All Statuses', value: '' },
                            { label: 'New', value: 'NEW' },
                            { label: 'Pending Down Payment', value: 'PENDING_DOWN_PAYMENT' },
                            { label: 'Active', value: 'ACTIVE' },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Rejected', value: 'REJECTED' },
                          ].map(opt => (
                            <div 
                              key={opt.value} 
                              className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px] flex items-center justify-between ${selectedStatus === opt.value ? 'font-semibold text-[#1cabb1] bg-teal-50/50' : 'text-gray-700'}`}
                              onClick={() => {
                                setSelectedStatus(opt.value);
                                setOpenStatusDropdown(false);
                              }}
                            >
                              <span>{opt.label}</span>
                              {selectedStatus === opt.value && <span className="w-2 h-2 rounded-full bg-[#1cabb1]"></span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-xs"
                    onClick={handleResetFilter}
                  >
                    Reset
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-xs shadow-sm"
                    onClick={handleApplyFilter}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Export Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white py-2.5 px-6 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap w-full md:w-auto disabled:opacity-50"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr.No.</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Application Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Customer Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Phone Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Branch</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Created By</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Address</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="animate-spin text-[#1cabb1]" />
                      <span className="text-sm font-medium">Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : leads && leads.length > 0 ? (
                leads.map((lead, idx) => {
                  const displaySrNo = lead.srNo || ((page - 1) * limit + idx + 1);
                  return (
                    <tr key={lead.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">{displaySrNo}</td>
                      <td className="py-4 px-6 text-sm text-gray-800 font-semibold">{lead.applicationNumber || '—'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {lead.profileImage ? (
                            <img 
                              src={lead.profileImage} 
                              alt={lead.customerName || 'Lead'} 
                              className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-[#1cabb1]">
                              {getInitials(lead.customerName)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800">{lead.customerName || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{lead.phoneNumber || '—'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">{lead.branchName || '—'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{lead.createdByName || '—'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate" title={lead.address}>
                        {lead.address || '—'}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <Link 
                            to={`/leads/view/${lead.id}`} 
                            state={lead} 
                            className="p-1 text-gray-500 hover:text-[#1cabb1] transition-colors"
                            title="View Lead Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <button 
                            onClick={() => { setLeadToDelete(lead); setIsDeleteModalOpen(true); }}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={32} className="text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">No leads found.</p>
                      <p className="text-xs text-gray-400">Try adjusting your search query or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && meta.totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
          <div className="mb-4 sm:mb-0 font-medium">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.totalRecords)} of {meta.totalRecords} Entries
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={!meta.hasPrevPage && page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1)
              .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                    <button 
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        page === p 
                          ? 'bg-[#1cabb1] text-white shadow-sm' 
                          : 'border border-gray-200 text-[#1cabb1] hover:bg-teal-50 bg-white'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button 
              onClick={() => setPage(p => Math.min(p + 1, meta.totalPages))}
              disabled={!meta.hasNextPage && page >= meta.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Lead</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete lead <span className="font-semibold text-gray-700">{leadToDelete?.customerName || leadToDelete?.applicationNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={deleteSubmitting}
                onClick={() => { setIsDeleteModalOpen(false); setLeadToDelete(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                disabled={deleteSubmitting}
                onClick={handleDeleteLead}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
              >
                {deleteSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {deleteSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
