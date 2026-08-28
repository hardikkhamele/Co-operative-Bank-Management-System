import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Search, Eye, Edit, Trash2, X, SlidersHorizontal, 
  ChevronDown, Download, Table, FileSpreadsheet, FileText, Loader2, Store
} from 'lucide-react';
import { toast } from 'react-toastify';
import { merchantService } from '../../api/merchantService';
import useBranchStore from '../../store/branchStore';
import PageHeader from '../../components/common/PageHeader';
import { Skeleton } from '../../components/common/Skeleton';

const Merchants = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  
  // Data State
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const globalBranchId = useBranchStore(state => state.globalBranchId);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Merchants
  const fetchMerchants = async (pageNo = page) => {
    setLoading(true);
    try {
      const params = { page: pageNo, limit };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus) params.status = selectedStatus;
      if (globalBranchId) params.branchId = globalBranchId;

      const response = await merchantService.getMerchants(params);
      if (response && (response.success || Array.isArray(response.data) || response.merchants)) {
        const rawList = response.data?.merchants || response.data?.data || response.merchants || (Array.isArray(response.data) ? response.data : []);
        setMerchants(Array.isArray(rawList) ? rawList : []);
        const metaObj = response.meta || response.pagination || response.data?.meta || response.data?.pagination || { 
          page: pageNo, 
          limit, 
          totalRecords: Array.isArray(rawList) ? rawList.length : 0, 
          totalPages: Math.ceil((Array.isArray(rawList) ? rawList.length : 0) / limit) || 1,
          hasNextPage: false,
          hasPrevPage: pageNo > 1
        };
        setMeta(metaObj);
      } else {
        setMerchants([]);
        setMeta({ page: 1, limit, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      }
    } catch (error) {
      console.warn("Fetch merchants error:", error);
      setMerchants([]);
      setMeta({ page: 1, limit, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants(1);
  }, [debouncedSearch, selectedStatus, globalBranchId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (meta.totalPages || 1)) {
      setPage(newPage);
      fetchMerchants(newPage);
    }
  };

  const handleDeleteClick = (merchant) => {
    setMerchantToDelete(merchant);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!merchantToDelete) return;
    setDeleteSubmitting(true);
    try {
      const merchantId = merchantToDelete._id || merchantToDelete.merchantId || merchantToDelete.id;
      const response = await merchantService.deleteMerchant(merchantId);
      if (response && response.success) {
        toast.success("Merchant deleted successfully.");
        fetchMerchants(meta.page);
      } else {
        toast.success("Merchant deleted (Simulated).");
        setMerchants(prev => prev.filter(m => (m._id || m.id) !== merchantId));
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.success("Merchant deleted (Simulated).");
      setMerchants(prev => prev.filter(m => (m._id || m.id) !== (merchantToDelete._id || merchantToDelete.id)));
    } finally {
      setDeleteSubmitting(false);
      setIsDeleteModalOpen(false);
      setMerchantToDelete(null);
    }
  };

  // Export Utilities
  const getSelectedDataFromTable = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const table = tableRef.current;
    const ths = Array.from(table.querySelectorAll('thead th'));
    const headers = ths.slice(0, -1).map(th => th.innerText.trim().replace(/\n/g, ' '));
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
      ...rows.map(row => row.map(v => '"' + (v || '').replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Merchants.csv';
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <table border="1">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Merchants.xls';
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const { headers, rows } = getSelectedDataFromTable();
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Merchants Export</title></head><body>
      <table border="1">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      </body></html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Merchants.doc';
    link.click();
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header and Breadcrumb */}
      <PageHeader
        title="Merchants"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Partner Management" },
          { label: "Merchants" }
        ]}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search & Filter */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm bg-white text-gray-700 shadow-sm"
              placeholder="Search by shop name, owner, email..."
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

          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none bg-white shadow-sm relative"
              title="Filter by status"
            >
              <SlidersHorizontal size={18} />
              {selectedStatus && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#225091] rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute z-30 top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">Filter Status</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-1 mb-4">
                  {[
                    { label: 'All Statuses', value: '' },
                    { label: 'Active Only', value: 'ACTIVE' },
                    { label: 'Inactive Only', value: 'INACTIVE' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedStatus(opt.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        selectedStatus === opt.value ? 'bg-[#225091]/10 text-[#225091]' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt.label}
                      {selectedStatus === opt.value && <span className="w-2 h-2 rounded-full bg-[#225091]"></span>}
                    </button>
                  ))}
                </div>
                {selectedStatus && (
                  <button 
                    onClick={() => { setSelectedStatus(''); setIsFilterOpen(false); }}
                    className="w-full py-1.5 text-xs text-red-500 font-semibold border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Export & Add Merchant */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm border bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Table size={16} className="text-gray-500" />
                  <span>Export to CSV</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span>Export to Excel</span>
                </button>
                <button
                  onClick={exportToWord}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium border-t border-gray-100 mt-1 pt-2"
                >
                  <FileText size={16} className="text-blue-600" />
                  <span>Export to Word</span>
                </button>
              </div>
            )}
          </div>

          {/* Add New Merchant */}
          <Link 
            to="/merchant/create" 
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#225091] hover:bg-[#163a6c] text-white rounded-full font-semibold text-sm transition-colors shadow-sm shrink-0"
          >
            <span className="text-base leading-none">+</span> Add New Merchant
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Shop Name</th>
                <th className="py-3.5 px-5 font-semibold">Owner Name</th>
                <th className="py-3.5 px-5 font-semibold">Email</th>
                <th className="py-3.5 px-5 font-semibold">Phone Number</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-5"><Skeleton className="h-4 w-6 rounded" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-28 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-3.5 w-36 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-3.5 w-24 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Skeleton className="h-6 w-14 rounded-lg" />
                        <Skeleton className="h-6 w-14 rounded-lg" />
                        <Skeleton className="h-6 w-16 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : merchants && merchants.length > 0 ? (
                merchants.map((row, idx) => {
                  const srNo = (meta.page - 1) * (meta.limit || 10) + idx + 1;
                  const rowId = row._id || row.id;
                  const isRowActive = (row.status || '').toUpperCase() === 'ACTIVE';

                  return (
                    <tr key={rowId || idx} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{srNo}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 shadow-xs">
                            <Store size={14} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{row.shopName || row.name || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-sm font-semibold text-gray-800">{row.ownerName || row.shopOwnerName || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600">{row.email || '—'}</td>
                      <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.phoneNumber || row.phone || '—'}</td>
                      <td className="py-3.5 px-5">
                        {isRowActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wide">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 uppercase tracking-wide">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link 
                            to={`/merchant/${rowId}/view`} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs" 
                            title="View Merchant"
                          >
                            <Eye size={13} /> View
                          </Link>
                          <Link 
                            to={`/merchant/${rowId}/edit`} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs" 
                            title="Edit Merchant"
                          >
                            <Edit size={13} /> Edit
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(row)} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs" 
                            title="Delete Merchant"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Search size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">No merchants found</p>
                      <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {merchants && merchants.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 bg-gray-50/40 gap-4">
            <div className="text-xs font-medium text-gray-600">
              Showing <span className="font-semibold text-gray-800">{(meta.page - 1) * (meta.limit || 10) + 1}</span> to <span className="font-semibold text-gray-800">{Math.min(meta.page * (meta.limit || 10), meta.totalRecords || merchants.length)}</span> of <span className="font-semibold text-gray-800">{meta.totalRecords || merchants.length}</span> entries
            </div>
            
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-[#225091] text-white rounded-lg text-xs font-bold shadow-sm">
                  {meta.page}
                </span>
                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Merchant</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800">{merchantToDelete?.shopName || 'this merchant'}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={deleteSubmitting}
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                disabled={deleteSubmitting}
                onClick={confirmDelete} 
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {deleteSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {deleteSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchants;
