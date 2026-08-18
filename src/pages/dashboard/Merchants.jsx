import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Eye, Edit, Trash2, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { merchantService } from '../../api/merchantService';
import useBranchStore from '../../store/branchStore';

const mockMerchants = [
  { id: 1, shopName: 'Tech Haven', ownerName: 'Tony Stark', email: 'tony@techhaven.com', phone: '9876543210', status: 'ACTIVE' },
  { id: 2, shopName: 'Daily Needs Grocery', ownerName: 'Bruce Wayne', email: 'bruce@dailyneeds.com', phone: '8765432109', status: 'ACTIVE' },
  { id: 3, shopName: 'Fashion Forward', ownerName: 'Diana Prince', email: 'diana@fashionforward.com', phone: '7654321098', status: 'INACTIVE' },
];

const Merchants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const globalBranchId = useBranchStore(state => state.globalBranchId);
  
  const [merchants, setMerchants] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce search

  const fetchMerchants = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedStatus) params.status = selectedStatus;
      if (globalBranchId) params.branchId = globalBranchId;

      const response = await merchantService.getMerchants(params);
      if (response.success) {
        setMerchants(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        console.warn("Failed to fetch merchants, falling back to mock data");
        setMerchants(mockMerchants);
        setMeta({ page: 1, limit: 10, totalRecords: 3, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      }
    } catch (error) {
      console.error("Fetch merchants failed, falling back to mock data", error);
      // Fallback for when backend endpoint returns 502/404
      setMerchants(mockMerchants);
      setMeta({ page: 1, limit: 10, totalRecords: 3, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants(1);
  }, [debouncedSearch, selectedStatus, globalBranchId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchMerchants(newPage);
    }
  };

  const handleDeleteClick = (merchant) => {
    setMerchantToDelete(merchant);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!merchantToDelete) return;
    try {
      const merchantId = merchantToDelete._id || merchantToDelete.merchantId || merchantToDelete.id;
      const response = await merchantService.deleteMerchant(merchantId);
      if (response.success) {
        toast.success("Merchant deleted successfully.");
        fetchMerchants(meta.page);
      } else {
        toast.error(response.message || response.error || "Failed to delete merchant.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error deleting merchant.";
      toast.error(errorMsg);
    } finally {
      setIsDeleteModalOpen(false);
      setMerchantToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Merchant</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Partner Management</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Merchant</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Merchant"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all shadow-sm text-sm"
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
              {(selectedStatus) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(selectedStatus ? 1 : 0)}
                </span>
              )}
            </button>
            
            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute z-30 top-full left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-[#f8f9fb] border border-gray-200 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter Merchants</h3>
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
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white"
                    onClick={() => { setSelectedStatus(''); }}
                  >
                    Reset
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors text-sm shadow-sm"
                    onClick={() => { setIsFilterOpen(false); fetchMerchants(1); }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link 
          to="/merchant/create" 
          className="bg-[#1cabb1] hover:bg-[#168f94] text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center justify-center text-sm shadow-sm w-full sm:w-auto whitespace-nowrap"
        >
          + Add New Merchant
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr No</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Shop Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Owner Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Phone Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">Loading merchants...</td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">No merchants found.</td>
                </tr>
              ) : (
                merchants.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-600">{(meta.page - 1) * meta.limit + index + 1}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{row.shopName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-800">{row.ownerName || row.shopOwnerName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{row.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{row.phoneNumber || row.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        row.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <Link to={`/merchant/${row.id}/view`} className="text-gray-500 hover:text-[#1cabb1] transition-colors" title="View">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/merchant/${row.id}/edit`} className="text-gray-500 hover:text-[#5a5ce5] transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(row)}
                          className="text-red-400 hover:text-red-600 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && merchants.length > 0 && meta && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 bg-gray-50/30 mt-auto gap-4">
            <div>
              Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.totalRecords || merchants.length)} of {meta.totalRecords || merchants.length} entries
            </div>
            <div className="flex gap-2">
              <button 
                disabled={!meta.hasPrevPage}
                onClick={() => handlePageChange(meta.page - 1)}
                className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-md bg-[#1cabb1] text-white font-medium shadow-sm">
                {meta.page}
              </button>
              <button 
                disabled={!meta.hasNextPage}
                onClick={() => handlePageChange(meta.page + 1)}
                className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Delete Merchant</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-800">{merchantToDelete?.shopName}</span>?<br/>This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchants;
