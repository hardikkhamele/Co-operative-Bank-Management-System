import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardCreditSettingsModal from '../../components/modals/CardCreditSettingsModal';
import { branchService } from '../../api/branchService';
import { validateEmail, validatePhone, validatePassword, validatePincode, sanitizeDigits, preventInvalidNumberKeys } from '../../utils/validation';

const Branch = () => {

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [filterState, setFilterState] = useState([]); // Array of selected states
  const [activeFilters, setActiveFilters] = useState([]); // Applied filters
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCardCreditModalOpen, setIsCardCreditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Create Modal State
  const [createStep, setCreateStep] = useState(1);
  const [editStep, setEditStep] = useState(1);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    branch: { name: '', code: '', email: '', phoneNumber: '', state: '', cardStock: 0, verificationCredits: 0, addressLine1: '', city: '', pincode: '' },
    manager: { fullName: '', email: '', phoneNumber: '', password: '', employeeCode: '' }
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeFilters.length > 0) params.state = activeFilters.join(','); // Assuming backend supports comma-separated or we just send the first
      
      const response = await branchService.list(params);
      if (response.success) {
        setBranches(response.data);
        setTotalPages(response.meta?.totalPages || response.pagination?.totalPages || response.data?.meta?.totalPages || response.data?.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
      setError("Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, debouncedSearch, activeFilters]);

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const applyFilters = () => {
    setActiveFilters(filterState);
    setPage(1);
    setIsFilterOpen(false);
  };
  
  const resetFilters = () => {
    setFilterState([]);
    setActiveFilters([]);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleCreateChange = (section, field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const submitCreateBranch = async () => {
    // Validate Branch Details
    const branchEmailErr = validateEmail(createForm.branch.email).error;
    if (branchEmailErr) {
      toast.error(`Branch Email: ${branchEmailErr}`);
      setCreateStep(1);
      return;
    }

    if (createForm.branch.phoneNumber) {
      const branchPhoneErr = validatePhone(createForm.branch.phoneNumber).error;
      if (branchPhoneErr) {
        toast.error(`Branch Phone: ${branchPhoneErr}`);
        setCreateStep(1);
        return;
      }
    }

    if (createForm.branch.pincode) {
      const pinErr = validatePincode(createForm.branch.pincode).error;
      if (pinErr) {
        toast.error(pinErr);
        setCreateStep(1);
        return;
      }
    }

    // Validate Manager Credentials
    const mgrEmailErr = validateEmail(createForm.manager.email).error;
    if (mgrEmailErr) {
      toast.error(`Manager Email: ${mgrEmailErr}`);
      return;
    }

    const passErr = validatePassword(createForm.manager.password, { minLength: 6 }).error;
    if (passErr) {
      toast.error(`Manager Password: ${passErr}`);
      return;
    }

    if (createForm.manager.phoneNumber) {
      const mgrPhoneErr = validatePhone(createForm.manager.phoneNumber).error;
      if (mgrPhoneErr) {
        toast.error(`Manager Phone: ${mgrPhoneErr}`);
        return;
      }
    }

    setCreateSubmitting(true);
    try {
      const nameParts = createForm.manager.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const payload = {
        branch: {
          name: createForm.branch.name,
          code: createForm.branch.code,
          email: createForm.branch.email,
          phoneNumber: createForm.branch.phoneNumber,
          state: createForm.branch.state,
          cardStock: Number(createForm.branch.cardStock) || 0,
          verificationCredits: Number(createForm.branch.verificationCredits) || 0,
          address: {
            addressLine1: createForm.branch.addressLine1,
            city: createForm.branch.city,
            state: createForm.branch.state,
            pincode: createForm.branch.pincode
          }
        },
        manager: {
          fullName: createForm.manager.fullName,
          firstName: firstName,
          lastName: lastName,
          email: createForm.manager.email,
          phoneNumber: createForm.manager.phoneNumber,
          password: createForm.manager.password,
          employeeCode: createForm.manager.employeeCode,
          personalDetails: {
            fullName: createForm.manager.fullName,
            firstName: firstName,
            lastName: lastName,
            email: createForm.manager.email,
            phoneNumber: createForm.manager.phoneNumber
          },
          jobDetails: {
            designation: "Branch Manager",
            department: "Management"
          },
          shiftSettings: {},
          attendanceSettings: {},
          woffHoffSettings: {},
          kraSettings: {}
        }
      };
      
      const response = await branchService.create(payload);
      if (response && response.success) {
        toast.success(response.message || "Branch and Branch Manager created successfully.");
      } else {
        toast.success("Branch created successfully!");
      }
      setIsCreateModalOpen(false);
      setCreateStep(1);
      setCreateForm({
        branch: { name: '', code: '', email: '', phoneNumber: '', state: '', cardStock: 0, verificationCredits: 0, addressLine1: '', city: '', pincode: '' },
        manager: { fullName: '', email: '', phoneNumber: '', password: '', employeeCode: '' }
      });
      fetchBranches();
    } catch (err) {
      console.error("Failed to create branch", err);
      if (err.response?.data?.details && err.response.data.details.length > 0) {
        toast.error(err.response.data.details[0].message);
      } else {
        toast.error(err.response?.data?.message || "Failed to create branch");
      }
    } finally {
      setCreateSubmitting(false);
    }
  };
  
  const handleOpenEdit = async (branch) => {
    try {
      let branchData = branch;
      try {
        const res = await branchService.getById(branch.id);
        if (res && res.success && res.data) {
          branchData = res.data;
        }
      } catch (err) {
        console.warn("Could not fetch detailed branch by id, using list item data", err);
      }

      // Try fetching manager profile
      let mgrProfile = null;
      try {
        const mgrRes = await branchService.getManagerProfile(branch.id);
        if (mgrRes && mgrRes.success && mgrRes.data) {
          mgrProfile = mgrRes.data;
        }
      } catch (err) {
        console.warn("Could not fetch manager profile for branch", err);
      }

      // Extract manager info from all possible representations
      const rawMgr = mgrProfile || branchData.manager || branchData.branchManager || branchData.managerUser || branch.branchManager || branch.manager || {};
      
      const mgrFullName = 
        rawMgr.fullName || 
        rawMgr.name || 
        rawMgr.personalDetails?.fullName || 
        rawMgr.user?.fullName || 
        rawMgr.user?.name || 
        branchData.managerName || 
        branch.managerName || 
        '';

      const mgrEmail = 
        rawMgr.email || 
        rawMgr.personalDetails?.email || 
        rawMgr.user?.email || 
        branchData.managerEmail || 
        branch.managerEmail || 
        '';

      const mgrPhone = 
        rawMgr.phoneNumber || 
        rawMgr.phone || 
        rawMgr.personalDetails?.phoneNumber || 
        rawMgr.user?.phoneNumber || 
        branchData.managerPhone || 
        branchData.managerPhoneNumber || 
        branch.managerPhone || 
        branch.managerPhoneNumber || 
        '';

      const mgrEmployeeCode = 
        rawMgr.employeeCode || 
        rawMgr.empCode || 
        rawMgr.code || 
        rawMgr.jobDetails?.employeeCode || 
        branchData.managerEmployeeCode || 
        branchData.managerCode || 
        branch.managerEmployeeCode || 
        branch.managerCode || 
        '';

      const normalized = {
        ...branchData,
        name: branchData.name || '',
        code: branchData.code || '',
        email: branchData.email || '',
        phoneNumber: branchData.phoneNumber || branchData.phone || '',
        state: branchData.state || '',
        cardStock: branchData.cardStock ?? 0,
        verificationCredits: branchData.verificationCredits ?? 0,
        address: {
          addressLine1: branchData.address?.addressLine1 || branchData.addressLine1 || '',
          city: branchData.address?.city || branchData.city || '',
          state: branchData.address?.state || branchData.state || '',
          pincode: branchData.address?.pincode || branchData.pincode || ''
        },
        manager: {
          fullName: mgrFullName,
          email: mgrEmail,
          phoneNumber: mgrPhone,
          employeeCode: mgrEmployeeCode,
          password: ''
        }
      };

      setSelectedBranch(normalized);
      setEditStep(1);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to open edit modal", err);
      toast.error("Failed to load branch details for editing");
    }
  };

  const submitEditBranch = async () => {
    if (!selectedBranch) return;
    setEditSubmitting(true);
    try {
      // 1. Update Branch Details
      const branchRes = await branchService.update(selectedBranch.id, {
        name: selectedBranch.name,
        code: selectedBranch.code,
        email: selectedBranch.email,
        phoneNumber: selectedBranch.phoneNumber,
        state: selectedBranch.state,
        cardStock: Number(selectedBranch.cardStock) || 0,
        verificationCredits: Number(selectedBranch.verificationCredits) || 0,
        address: {
          addressLine1: selectedBranch.address?.addressLine1 || '',
          city: selectedBranch.address?.city || '',
          state: selectedBranch.state || selectedBranch.address?.state || '',
          pincode: selectedBranch.address?.pincode || ''
        }
      });
      
      // 2. Prepare Manager Details
      const mName = selectedBranch.manager?.fullName?.trim() || '';
      const nameParts = mName.split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const managerPayload = {
        fullName: mName,
        firstName: fName,
        lastName: lName,
        email: selectedBranch.manager?.email || '',
        phoneNumber: selectedBranch.manager?.phoneNumber || '',
        employeeCode: selectedBranch.manager?.employeeCode || '',
      };
      if (selectedBranch.manager?.password && selectedBranch.manager.password.trim() !== '') {
        managerPayload.password = selectedBranch.manager.password.trim();
      }
      
      let managerUpdated = false;
      try {
        const managerRes = await branchService.updateManagerProfile(selectedBranch.id, managerPayload);
        if (managerRes && managerRes.success) {
          managerUpdated = true;
        }
      } catch (mgrErr) {
        console.warn("Could not update manager profile via endpoint 7", mgrErr);
      }
      
      if (branchRes && branchRes.success) {
        toast.success(managerUpdated ? "Branch and Manager updated successfully." : (branchRes.message || "Branch updated successfully."));
      } else {
        toast.success("Branch details saved successfully.");
      }
      
      setIsEditModalOpen(false);
      setEditStep(1);
      fetchBranches();
    } catch(err) {
      console.error(err);
      if (err.response?.data?.details && err.response.data.details.length > 0) {
        toast.error(err.response.data.details[0].message);
      } else {
        toast.error(err.response?.data?.message || "Failed to update branch");
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const submitDeleteBranch = async () => {
    if (!selectedBranch) return;
    try {
      const response = await branchService.delete(selectedBranch.id);
      if (response && response.success) {
        toast.success(response.message || "Branch deactivated successfully.");
      }
      setIsDeleteModalOpen(false);
      fetchBranches();
    } catch (err) {
      console.error("Failed to delete branch", err);
      toast.error(err.response?.data?.message || "Failed to delete branch");
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#225091] mb-2">Branch</h1>
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Region & Branch Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#225091]">Branch</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none bg-white w-full sm:w-auto"
            >
              <SlidersHorizontal size={18} />
              {activeFilters.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#225091] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {activeFilters.length}
                </span>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-[#f8f9fb] border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* State/UT Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'state' ? null : 'state')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">State/UT</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'state' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'state' && (
                      <div className="absolute z-30 bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {['Maharashtra', 'Delhi', 'Karnataka', 'Rajasthan', 'Gujarat'].map(opt => (
                          <label 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer"
                                checked={filterState.includes(opt)}
                                onChange={() => toggleFilter(setFilterState, opt)}
                              />
                              {filterState.includes(opt) && (
                                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#225091] text-[#225091] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm bg-white"
                    onClick={resetFilters}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors focus:outline-none text-sm shadow-sm"
                    onClick={applyFilters}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3">
          <button 
            onClick={() => setIsCardCreditModalOpen(true)}
            className="border-[1.5px] border-[#225091] text-[#225091] hover:bg-teal-50 bg-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            Card & Credit Settings
          </button>
          <button 
            onClick={() => { setCreateStep(1); setIsCreateModalOpen(true); }}
            className="bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            + Create Branch
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-400 text-[11px] uppercase tracking-wider font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Sr.No.</th>
                <th className="px-6 py-4 font-bold">Branch Name</th>
                <th className="px-6 py-4 font-bold">Branch Code</th>
                <th className="px-6 py-4 font-bold">State/UT</th>
                <th className="px-6 py-4 font-bold">Branch Manager</th>
                <th className="px-6 py-4 font-bold">EMI Card Available</th>
                <th className="px-6 py-4 font-bold">Verification Credit</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && branches.length === 0 ? null : branches.length === 0 ? (
                <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-500">No branches found.</td></tr>
              ) : (
                branches.map((branch, idx) => (
                  <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">{branch.srNo || ((page - 1) * 10 + idx + 1)}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{branch.name}</td>
                    <td className="px-6 py-4 text-gray-700">{branch.code}</td>
                    <td className="px-6 py-4 text-gray-700">{branch.state}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const managerData = branch.branchManager || branch.manager;
                        const mName = managerData?.fullName || managerData?.name || branch.managerName || managerData?.user?.name || managerData?.user?.fullName;
                        const mEmail = managerData?.email || branch.managerEmail || managerData?.user?.email;
                        return mName || mEmail ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-blue-100 text-blue-700 font-bold`}>
                              {getInitials(mName || mEmail)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-700 font-medium">{mName || 'Unnamed Manager'}</span>
                              <span className="text-xs text-gray-500">{mEmail || ''}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No Manager</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{branch.cardStock || 0}</td>
                    <td className="px-6 py-4 text-gray-700">{branch.verificationCredits || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${branch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {branch.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => handleOpenEdit(branch)}
                          className="text-gray-600 hover:text-gray-900 transition-colors" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedBranch(branch); setIsDeleteModalOpen(true); }}
                          className="text-red-500 hover:text-red-700 transition-colors" 
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
        {!loading && branches.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-800 font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#225091] text-[#225091] hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white font-medium shadow-sm">
                {page}
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#225091] text-[#225091] hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE BRANCH & MANAGER MODAL (TWO-STEP) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] mx-2 sm:mx-0">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1b2559]">
                {createStep === 1 ? "Step 1: Branch Details" : "Step 2: Manager Credentials"}
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {createStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Name *</label>
                      <input type="text" value={createForm.branch.name} onChange={e => handleCreateChange('branch', 'name', e.target.value)} placeholder="e.g. Mumbai Fort" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Code *</label>
                      <input type="text" value={createForm.branch.code} onChange={e => handleCreateChange('branch', 'code', e.target.value)} placeholder="e.g. MUM01" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email *</label>
                      <input type="email" value={createForm.branch.email} onChange={e => handleCreateChange('branch', 'email', e.target.value)} placeholder="Branch Email" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={createForm.branch.phoneNumber} 
                        onChange={e => handleCreateChange('branch', 'phoneNumber', sanitizeDigits(e.target.value, 10))} 
                        placeholder="10-digit Phone" 
                        maxLength={10}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Manager Name *</label>
                    <input type="text" value={createForm.manager.fullName} onChange={e => handleCreateChange('manager', 'fullName', e.target.value)} placeholder="Manager Full Name" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">State/UT *</label>
                    <select value={createForm.branch.state} onChange={e => handleCreateChange('branch', 'state', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm bg-white">
                      <option value="" disabled>Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Address Line 1</label>
                    <input type="text" value={createForm.branch.addressLine1} onChange={e => handleCreateChange('branch', 'addressLine1', e.target.value)} placeholder="Address" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">City</label>
                      <input type="text" value={createForm.branch.city} onChange={e => handleCreateChange('branch', 'city', e.target.value)} placeholder="City" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Pincode</label>
                      <input 
                        type="text" 
                        value={createForm.branch.pincode} 
                        onChange={e => handleCreateChange('branch', 'pincode', sanitizeDigits(e.target.value, 6))} 
                        placeholder="6-digit Pincode" 
                        maxLength={6}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                    Every new branch must have an assigned Branch Manager. Please provide their login credentials and basic info. HR configuration can be completed later.
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email Address (Login ID) *</label>
                    <input type="email" value={createForm.manager.email} onChange={e => handleCreateChange('manager', 'email', e.target.value)} placeholder="Manager Email" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Temporary Password *</label>
                    <div className="relative">
                      <input 
                        type={showManagerPassword ? "text" : "password"} 
                        value={createForm.manager.password} 
                        onChange={e => handleCreateChange('manager', 'password', e.target.value)} 
                        placeholder="Min 6 characters" 
                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowManagerPassword(!showManagerPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showManagerPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={createForm.manager.phoneNumber} 
                        onChange={e => handleCreateChange('manager', 'phoneNumber', sanitizeDigits(e.target.value, 10))} 
                        placeholder="10-digit Phone" 
                        maxLength={10}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Employee Code</label>
                      <input type="text" value={createForm.manager.employeeCode} onChange={e => handleCreateChange('manager', 'employeeCode', e.target.value)} placeholder="e.g. BM-001" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-6 pt-4 border-t border-gray-200 bg-white">
              {createStep === 1 ? (
                <div className="w-full flex justify-end gap-3">
                  <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                  <button 
                    onClick={() => setCreateStep(2)} 
                    disabled={!createForm.branch.name || !createForm.branch.code || !createForm.branch.state || !createForm.branch.email || !createForm.manager.fullName}
                    className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-between">
                  <button onClick={() => setCreateStep(1)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                    <button 
                      onClick={submitCreateBranch} 
                      disabled={createSubmitting || !createForm.manager.fullName || !createForm.manager.email || !createForm.manager.password}
                      className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center"
                    >
                      {createSubmitting ? 'Creating...' : 'Finish & Create'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-[#1b2559]">
                {editStep === 1 ? "Step 1: Branch Details" : "Step 2: Manager Credentials"}
              </h2>
              <button onClick={() => { setIsEditModalOpen(false); setEditStep(1); }} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {editStep === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Name *</label>
                      <input type="text" value={selectedBranch.name || ''} onChange={(e) => setSelectedBranch({...selectedBranch, name: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Code *</label>
                      <input type="text" value={selectedBranch.code || ''} onChange={(e) => setSelectedBranch({...selectedBranch, code: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email *</label>
                      <input type="email" value={selectedBranch.email || ''} onChange={(e) => setSelectedBranch({...selectedBranch, email: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number</label>
                      <input type="text" value={selectedBranch.phoneNumber || ''} onChange={(e) => setSelectedBranch({...selectedBranch, phoneNumber: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch Manager Name</label>
                    <input 
                      type="text" 
                      value={selectedBranch.manager?.fullName || ''} 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        manager: { ...(selectedBranch.manager || {}), fullName: e.target.value }
                      })} 
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">State/UT</label>
                    <select value={selectedBranch.state || ''} onChange={(e) => setSelectedBranch({...selectedBranch, state: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm bg-white">
                      <option value="" disabled>Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Address Line 1</label>
                    <input type="text" value={selectedBranch.address?.addressLine1 || ''} onChange={(e) => setSelectedBranch({...selectedBranch, address: { ...selectedBranch.address, addressLine1: e.target.value }})} placeholder="Address" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">City</label>
                      <input type="text" value={selectedBranch.address?.city || ''} onChange={(e) => setSelectedBranch({...selectedBranch, address: { ...selectedBranch.address, city: e.target.value }})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Pincode</label>
                      <input type="text" value={selectedBranch.address?.pincode || ''} onChange={(e) => setSelectedBranch({...selectedBranch, address: { ...selectedBranch.address, pincode: e.target.value }})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Email Address (Login ID) *</label>
                    <input 
                      type="email" 
                      value={selectedBranch.manager?.email || ''} 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        manager: { ...(selectedBranch.manager || {}), email: e.target.value }
                      })} 
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Temporary Password</label>
                    <input 
                      type="password" 
                      minLength={8} 
                      value={selectedBranch.manager?.password || ''} 
                      placeholder="Leave blank to keep current (Min 8 characters)" 
                      onChange={(e) => setSelectedBranch({
                        ...selectedBranch, 
                        manager: { ...(selectedBranch.manager || {}), password: e.target.value }
                      })} 
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Phone Number</label>
                      <input 
                        type="text" 
                        value={selectedBranch.manager?.phoneNumber || ''} 
                        onChange={(e) => setSelectedBranch({
                          ...selectedBranch, 
                          manager: { ...(selectedBranch.manager || {}), phoneNumber: e.target.value }
                        })} 
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Employee Code</label>
                      <input 
                        type="text" 
                        value={selectedBranch.manager?.employeeCode || ''} 
                        onChange={(e) => setSelectedBranch({
                          ...selectedBranch, 
                          manager: { ...(selectedBranch.manager || {}), employeeCode: e.target.value }
                        })} 
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#225091] text-sm" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center p-6 pt-4 border-t border-gray-200 bg-white">
              {editStep === 1 ? (
                <div className="w-full flex justify-end gap-3">
                  <button onClick={() => { setIsEditModalOpen(false); setEditStep(1); }} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                    Cancel
                  </button>
                  <button onClick={() => setEditStep(2)} className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm flex items-center gap-2">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-between">
                  <button onClick={() => setEditStep(1)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => { setIsEditModalOpen(false); setEditStep(1); }} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                      Cancel
                    </button>
                    <button 
                      onClick={submitEditBranch} 
                      disabled={editSubmitting}
                      className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                      {editSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Branch</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{selectedBranch.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedBranch(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDeleteBranch}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card & Credit Settings Modal */}
      <CardCreditSettingsModal 
        isOpen={isCardCreditModalOpen} 
        onClose={() => setIsCardCreditModalOpen(false)} 
      />
    </div>
  );
};

export default Branch;
