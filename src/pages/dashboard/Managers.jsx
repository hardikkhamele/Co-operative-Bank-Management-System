import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, ChevronDown, RefreshCw, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { branchService } from '../../api/branchService';
import { Skeleton } from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';
import useLocations from '../../hooks/useLocations';

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { states, availableCities } = useLocations(selectedState);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);



  // Fetch Managers from Branch API
  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (selectedStatus) params.status = selectedStatus;

      const res = await branchService.list(params);
      if (res) {
        const rawList = res.data || res.branches || [];
        const branchList = Array.isArray(rawList) ? rawList : (rawList.branches || rawList.items || rawList.data || []);
        
        // Transform branch objects into manager presentation rows
        const managerRows = branchList.map((branch, idx) => {
          const mgr = branch.branchManager || branch.manager || {};
          const mgrName = mgr.fullName || mgr.name || branch.managerName || 'Assigned Manager';
          const initials = mgrName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BM';
          
          return {
            id: branch.id || branch._id || `branch-${idx}`,
            branchId: branch.id || branch._id,
            branchName: branch.name || branch.branchName || 'Main Branch',
            branchCode: branch.code || branch.branchCode || '—',
            state: branch.state || branch.address?.state || '—',
            city: branch.city || branch.address?.city || '—',
            name: mgrName,
            email: mgr.email || branch.email || '—',
            phoneNumber: mgr.phoneNumber || mgr.phone || branch.phoneNumber || '—',
            type: mgr.jobDetails?.designation || 'Branch Manager',
            status: branch.status || 'ACTIVE',
            initials: initials,
            rawManager: mgr,
            rawBranch: branch
          };
        });

        setManagers(managerRows);

        const paginationMeta = res.meta || res.pagination || {
          totalRecords: managerRows.length,
          totalPages: Math.max(1, Math.ceil(managerRows.length / limit)),
          hasNextPage: false,
          hasPrevPage: page > 1
        };

        setMeta({
          totalRecords: paginationMeta.totalRecords ?? managerRows.length,
          totalPages: paginationMeta.totalPages ?? 1,
          hasNextPage: Boolean(paginationMeta.hasNextPage),
          hasPrevPage: Boolean(paginationMeta.hasPrevPage)
        });
      } else {
        setManagers([]);
      }
    } catch (err) {
      console.error("Failed to load managers:", err);
      toast.error("Could not retrieve branch managers list.");
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedState, selectedCity, selectedStatus]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleDeleteClick = (managerRow) => {
    setBranchToDelete(managerRow);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    setDeleting(true);
    try {
      await branchService.delete(branchToDelete.branchId);
      toast.success("Branch and Manager deactivated successfully.");
      setIsDeleteModalOpen(false);
      setBranchToDelete(null);
      fetchManagers();
    } catch (err) {
      console.error("Error deleting branch:", err);
      toast.error(err.response?.data?.message || "Failed to deactivate branch.");
    } finally {
      setDeleting(false);
    }
  };

  const activeFilterCount = (selectedState ? 1 : 0) + (selectedCity ? 1 : 0) + (selectedStatus ? 1 : 0);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Card */}
      <PageHeader
        title="Branch Managers"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Branch Management", to: "/branch" },
          { label: "Managers" }
        ]}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
            <input
              type="text"
              placeholder="Search manager, branch, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] shadow-2xs text-gray-700"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Popover Trigger */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs relative cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <SlidersHorizontal size={17} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-[#225091] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 w-[300px] bg-white rounded-2xl shadow-xl p-5 border border-gray-100 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Filter Managers</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">State / Region</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedCity('');
                        setPage(1);
                      }}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
                    >
                      <option value="">All States</option>
                      {states.map((st, i) => (
                        <option key={i} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
                    >
                      <option value="">All Cities</option>
                      {availableCities.map((ct, i) => (
                        <option key={i} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedState('');
                      setSelectedCity('');
                      setSelectedStatus('');
                      setPage(1);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 text-xs transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => {
                      setPage(1);
                      setIsFilterOpen(false);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#225091] text-white font-semibold hover:bg-[#1b437c] text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button 
            onClick={fetchManagers}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={17} className={loading ? "animate-spin text-[#225091]" : ""} />
          </button>
        </div>

        <Link 
          to="/branch" 
          className="bg-[#225091] hover:bg-[#1a4179] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          + Create Branch & Manager
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px] text-center text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-16">Sr.No.</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Manager Name</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Designation</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Region</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Contact Details</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-28">Status</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-5 text-center"><Skeleton className="h-4 w-6 mx-auto rounded" /></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-28 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="py-4 px-5 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                    <td className="py-4 px-5 text-center"><Skeleton className="h-7 w-20 mx-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : managers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 text-sm font-medium">
                    No branch managers found.
                  </td>
                </tr>
              ) : (
                managers.map((manager, idx) => (
                  <tr key={manager.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-center text-[13px] text-gray-500 font-medium">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {manager.initials}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{manager.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-700 font-medium">
                      {manager.type}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-700 font-semibold">
                      {manager.branchName} <span className="text-gray-400 font-normal font-mono text-[11px]">({manager.branchCode})</span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">
                      {manager.state}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-800 font-medium">{manager.phoneNumber}</span>
                        <span className="text-[11px] text-gray-500">{manager.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                        manager.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                          : 'bg-rose-50 text-rose-700 border-rose-200/60'
                      }`}>
                        {manager.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link 
                          to={`/managers/view/${manager.branchId}`}
                          state={manager}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-2xs cursor-pointer"
                          title="View Full HR Profile"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <Link 
                          to={`/managers/edit/${manager.branchId}`}
                          state={manager}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-2xs cursor-pointer"
                          title="Edit HR Settings"
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(manager)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs cursor-pointer"
                          title="Deactivate Branch"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={meta.totalPages}
        totalRecords={meta.totalRecords}
        limit={limit}
        onPageChange={setPage}
        disabled={loading}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border border-gray-100 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">Deactivate Branch?</h3>
            
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to deactivate <strong className="text-gray-800">{branchToDelete?.branchName}</strong>?<br />
              This will disable access for its manager.
            </p>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Managers;
