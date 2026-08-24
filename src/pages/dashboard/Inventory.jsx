import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ChevronRight, Search, SlidersHorizontal, Edit, Trash2, 
  ChevronDown, X, ChevronLeft, Download, Plus, Loader2, AlertCircle 
, Table, FileSpreadsheet, FileText} from 'lucide-react';
import { inventoryService } from '../../api/inventoryService';
import PageHeader from '../../components/common/PageHeader';

const Inventory = () => {

  const navigate = useNavigate();

  // Inventory data & loading states
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filter drawer & options
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterMinQuantity, setFilterMinQuantity] = useState('');
  const [filterMaxQuantity, setFilterMaxQuantity] = useState('');
  const [filterSortBy, setFilterSortBy] = useState('createdAt');
  const [filterSortOrder, setFilterSortOrder] = useState('desc');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ assets: '', quantity: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Inventory List
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy: filterSortBy,
        sortOrder: filterSortOrder,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (filterMinQuantity !== '' && !isNaN(Number(filterMinQuantity))) {
        params.minQuantity = Number(filterMinQuantity);
      }

      if (filterMaxQuantity !== '' && !isNaN(Number(filterMaxQuantity))) {
        params.maxQuantity = Number(filterMaxQuantity);
      }

      const response = await inventoryService.list(params);
      if (response && response.success) {
        setInventory(response.data || []);
        if (response.meta || response.pagination || response.data?.meta || response.data?.pagination) { setMeta(response.meta || response.pagination || response.data?.meta || response.data?.pagination); }
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
      const errMsg = err.response?.data?.message || 'Failed to fetch inventory records.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterMinQuantity, filterMaxQuantity, filterSortBy, filterSortOrder]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (filterMinQuantity !== '') count++;
    if (filterMaxQuantity !== '') count++;
    if (filterSortBy !== 'createdAt' || filterSortOrder !== 'desc') count++;
    setActiveFiltersCount(count);
  }, [filterMinQuantity, filterMaxQuantity, filterSortBy, filterSortOrder]);

  // Handle CSV Export
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        sortBy: filterSortBy,
        sortOrder: filterSortOrder,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filterMinQuantity !== '' && !isNaN(Number(filterMinQuantity))) params.minQuantity = Number(filterMinQuantity);
      if (filterMaxQuantity !== '' && !isNaN(Number(filterMaxQuantity))) params.maxQuantity = Number(filterMaxQuantity);

      const blobData = await inventoryService.export(params);
      
      // Trigger browser download
      const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Inventory exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export inventory CSV.');
    } finally {
      setExporting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      assets: item.assets || item.asset || '',
      quantity: item.quantity !== undefined ? item.quantity : '',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Form
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editFormData.assets.trim()) {
      toast.error('Asset name is required.');
      return;
    }

    if (editFormData.quantity === '' || isNaN(Number(editFormData.quantity)) || Number(editFormData.quantity) < 0) {
      toast.error('Please enter a valid non-negative quantity.');
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        assets: editFormData.assets.trim(),
        quantity: Number(editFormData.quantity),
      };

      const response = await inventoryService.update(editingItem.id || editingItem._id, payload);
      if (response && response.success) {
        toast.success(response.message || 'Inventory updated successfully.');
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error('Update error:', err);
      const errMsg = err.response?.data?.message || 'Failed to update inventory item.';
      toast.error(errMsg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteSubmitting(true);
    try {
      const response = await inventoryService.delete(itemToDelete.id || itemToDelete._id);
      if (response && response.success) {
        toast.success(response.message || 'Inventory deleted successfully.');
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        
        // If we deleted the only item on the last page, move back a page
        if (inventory.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchInventory();
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      const errMsg = err.response?.data?.message || 'Failed to delete inventory item.';
      toast.error(errMsg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterMinQuantity('');
    setFilterMaxQuantity('');
    setFilterSortBy('createdAt');
    setFilterSortOrder('desc');
    setPage(1);
  };

  const startEntry = meta.totalRecords === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endEntry = Math.min(meta.page * meta.limit, meta.totalRecords);
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
<div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      
      {/* Breadcrumb Card */}
      <PageHeader
        title="Inventory"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "CRM Management" },
          { label: "Inventory" }
        ]}
      />

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by asset name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091] transition-shadow"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center w-[42px] h-[42px] rounded-lg border transition-colors relative ${
                activeFiltersCount > 0 
                  ? 'bg-teal-50 border-[#225091] text-[#225091]' 
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title="Filters"
            >
              <SlidersHorizontal size={18} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#225091] text-white text-[10px] font-bold w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-white shadow">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-[320px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center p-5 pb-3 border-b border-gray-100 bg-[#f8f7fc]">
                  <h2 className="text-lg font-bold text-[#1b2559]">Filter Inventory</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-5 space-y-4 text-sm">
                  {/* Min / Max Quantity */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Quantity Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number"
                        min="0"
                        placeholder="Min Qty"
                        value={filterMinQuantity}
                        onChange={(e) => setFilterMinQuantity(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                      />
                      <input 
                        type="number"
                        min="0"
                        placeholder="Max Qty"
                        value={filterMaxQuantity}
                        onChange={(e) => setFilterMaxQuantity(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Sort By</label>
                    <select
                      value={filterSortBy}
                      onChange={(e) => setFilterSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="assets">Asset Name</option>
                      <option value="quantity">Quantity</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Sort Order</label>
                    <select
                      value={filterSortOrder}
                      onChange={(e) => setFilterSortOrder(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                    >
                      <option value="desc">Descending (High to Low / Newest)</option>
                      <option value="asc">Ascending (Low to High / Oldest)</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-5 pt-2 flex gap-3 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors bg-white text-xs"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => {
                      setIsFilterOpen(false);
                      setPage(1);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-xs"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
          <Link 
            to="/inventory/create"
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#225091] hover:bg-[#159a9f] text-white rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add Inventory</span>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold w-1/2">Assets</th>
                <th className="py-3.5 px-5 font-semibold">Quantity</th>
                <th className="py-3.5 px-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[#225091]" />
                      <span className="text-sm font-medium">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={28} className="text-gray-400" />
                      <p className="font-semibold text-gray-800 text-sm">No inventory items found</p>
                      <p className="text-xs text-gray-400">
                        {debouncedSearch || activeFiltersCount > 0 
                          ? 'Try adjusting your search or filter criteria.' 
                          : 'Click "+ Add Inventory" to add your first asset.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                inventory.map((item, index) => {
                  const itemId = item.id || item._id;
                  const assetName = item.assets || item.asset || '—';
                  const displayQuantity = Number(item.quantity || 0).toLocaleString();
                  const displaySrNo = item.srNo || (startEntry + index);

                  return (
                    <tr key={itemId || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{displaySrNo}</td>
                      <td className="py-3.5 px-5 text-sm text-gray-900 font-semibold">{assetName}</td>
                      <td className="py-3.5 px-5 text-sm font-bold text-gray-800 tabular-nums">{displayQuantity}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs" 
                            title="Edit"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs" 
                            title="Delete"
                          >
                            <Trash2 size={13} /> Delete
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

        {/* Pagination Footer */}
        {!loading && meta.totalRecords > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] font-semibold text-gray-700">
              Showing {startEntry} to {endEntry} of {meta.totalRecords} Entries
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage && page <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && <span className="text-gray-400 px-1">...</span>}
                      <button 
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${
                          page === pageNum 
                            ? 'bg-[#225091] text-white shadow-sm' 
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button 
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNextPage && page >= meta.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Inventory Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f4f3fb]">
              <h2 className="text-[17px] font-bold text-gray-800">Edit Inventory Details</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200/50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-gray-700">Asset Name *</label>
                  <input 
                    type="text" 
                    maxLength={150}
                    value={editFormData.assets}
                    onChange={(e) => setEditFormData({ ...editFormData, assets: e.target.value })}
                    placeholder="Enter asset name (e.g., Computer, Laptop)" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                    required
                  />
                  <span className="text-[11px] text-gray-400 text-right">{editFormData.assets.length}/150</span>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-gray-700">Quantity *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    placeholder="Enter quantity (e.g., 1800)" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={editSubmitting}
                    className="flex-1 bg-[#225091] hover:bg-[#159a9f] text-white py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {editSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    <span>{editSubmitting ? 'Updating...' : 'Update'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Inventory Item</h3>
                <p className="text-sm text-gray-500">Are you sure you want to delete this asset?</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl mb-6 border border-gray-100 text-sm">
              <div className="font-semibold text-gray-800">{itemToDelete.assets || itemToDelete.asset}</div>
              <div className="text-xs text-gray-500 mt-1">Quantity: {Number(itemToDelete.quantity || 0).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{deleteSubmitting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
