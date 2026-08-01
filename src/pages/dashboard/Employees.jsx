import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, Eye, Edit, Trash2, ChevronLeft, X, ChevronDown, Calendar } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';

const Employees = () => {
  const navigate = useNavigate();
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filter/Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Dropdown Options State (fetched from APIs)
  const [branchOptions, setBranchOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  
  // Selected Filters
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Branches and Roles for Filters
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [branchRes, roleRes] = await Promise.all([
          branchService.list({ limit: 100 }), // Get max possible for filter dropdown
          roleService.list({ limit: 100 })
        ]);
        if (branchRes.success) setBranchOptions(branchRes.data);
        if (roleRes.success) setRoleOptions(roleRes.data);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        includeBranchManagers: true
      };
      
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedBranchId) params.branchId = selectedBranchId;
      if (selectedRoleId) params.roleId = selectedRoleId;
      if (selectedStatus) params.status = selectedStatus;
      
      const response = await employeeService.list(params);
      if (response.success) {
        setEmployees(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalRecords(response.pagination?.totalRecords || 0);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch, selectedBranchId, selectedRoleId, selectedStatus]);

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await employeeService.delete(employeeToDelete.id);
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete employee");
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const resetFilters = () => {
    setSelectedBranchId('');
    setSelectedRoleId('');
    setSelectedStatus('');
    setPage(1);
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 shrink-0">
        <h1 className="text-2xl font-bold text-[#1b58a6] mb-2">Employees</h1>
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="hover:text-gray-900 transition-colors">HR Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b58a6]">Employee</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all shadow-sm text-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm relative focus:outline-none"
            >
              <SlidersHorizontal size={18} />
              {(selectedBranchId || selectedRoleId || selectedStatus) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1b58a6] rounded-full border border-white"></span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 w-72 bg-[#f4f3fb] rounded-2xl shadow-2xl flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 pb-3">
                  <h2 className="text-xl font-bold text-[#1b2559]">Filter</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors focus:outline-none">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-5 pt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select 
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm"
                    >
                      <option value="">All Branches</option>
                      {branchOptions.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm"
                    >
                      <option value="">All Roles</option>
                      {roleOptions.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white text-sm"
                    >
                      <option value="">All</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-5 pt-2 flex gap-3">
                  <button 
                    onClick={resetFilters}
                    className="flex-1 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors bg-white text-sm focus:outline-none"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm focus:outline-none"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Link 
          to="/employees/create"
          className="bg-[#1cabb1] hover:bg-[#168f94] text-white px-5 py-2.5 rounded-full font-semibold transition-colors shadow-sm flex items-center gap-2 text-sm shrink-0"
        >
          + Add Staff
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f4f3fb] text-[#4b5563] text-sm font-bold border-b border-gray-100">
                <th className="py-4 px-6">Sr.No.</th>
                <th className="py-4 px-6">Employee Name</th>
                <th className="py-4 px-6">Emp Code</th>
                <th className="py-4 px-6">Designation</th>
                <th className="py-4 px-6">Branch</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500">Loading employees...</td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="py-8 text-center text-red-500">{error}</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500">No employees found.</td></tr>
              ) : (
                employees.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm group">
                    <td className="py-4 px-6 text-gray-600">{row.srNo || ((page - 1) * 10 + index + 1)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {getInitials(row.fullName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{row.fullName}</span>
                          <span className="text-xs text-gray-500">{row.email}</span>
                          <span className="text-xs text-gray-500">{row.phoneNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 font-medium">{row.employeeCode || '-'}</span>
                      {row.type === 'MANAGER' && (
                        <div className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-block mt-1">Branch Manager</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-medium">{row.designation || (row.role?.name || '-')}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex flex-col">
                        <span>{row.branch?.name || '-'}</span>
                        <span className="text-xs text-gray-400">{row.branch?.code || ''}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {row.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/employees/view/${row.id}`)}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/employees/edit/${row.id}`)}
                          className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(row)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
        {!loading && employees.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <div className="text-sm text-gray-500 font-medium">
              Showing page {page} of {totalPages} ({totalRecords} total entries)
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm border border-[#1cabb1]">
                {page}
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Employee</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{employeeToDelete.fullName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setEmployeeToDelete(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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

export default Employees;
