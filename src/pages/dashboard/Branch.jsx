import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockBranches = [
  { id: 1, srNo: 1, name: 'Mumbai Branch', regionName: 'Eastern Region', manager: 'Clark Kent', managerInitials: 'CK', managerBg: 'bg-purple-100 text-purple-600', totalEmployee: 123, avatar: 'https://ui-avatars.com/api/?name=Clark+Kent&background=random' },
  { id: 3, srNo: 3, name: 'Nagpur Branch', regionName: 'Eastern Region', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 145, avatar: '' },
  { id: 5, srNo: 5, name: 'Kolkata Branch', regionName: 'Eastern Region', manager: 'Steve Rogers', managerInitials: 'SR', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 181, avatar: '' },
  { id: 7, srNo: 7, name: 'Delhi Branch', regionName: 'Southern Region', manager: 'Scott Lang', managerInitials: 'SL', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 153, avatar: '' },
  { id: 8, srNo: 8, name: 'Chennai Branch', regionName: 'Central Region', manager: 'Peter Parker', managerInitials: 'PP', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 174, avatar: '' },
];

const Branch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [filterRegion, setFilterRegion] = useState([]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b7ef7] mb-2">Branch</h1>
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Region & Branch Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#5a5ce5]">Branch</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none"
            >
              <SlidersHorizontal size={18} />
              {filterRegion.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#5a5ce5] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {filterRegion.length}
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
                  {/* Region Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'region' ? null : 'region')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Region</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'region' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'region' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['Eastern Region', 'Western Region', 'Northern Region'].map(opt => (
                          <label 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors cursor-pointer"
                                checked={filterRegion.includes(opt)}
                                onChange={() => toggleFilter(setFilterRegion, opt)}
                              />
                              {filterRegion.includes(opt) && (
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
                    className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm bg-white"
                    onClick={() => setFilterRegion([])}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors focus:outline-none text-sm shadow-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-sm flex-shrink-0"
        >
          + Create Branch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9ff] text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sr.No.</th>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4">Region Name</th>
                <th className="px-6 py-4">Branch Manager</th>
                <th className="px-6 py-4">Total Employee</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{branch.srNo}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{branch.name}</td>
                  <td className="px-6 py-4 text-gray-700">{branch.regionName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {branch.srNo === 1 ? (
                         <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                           <img src={branch.avatar} alt={branch.manager} className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium shrink-0 ${branch.managerBg}`}>
                            {branch.managerInitials}
                         </div>
                      )}
                      <span className="text-gray-700">{branch.manager}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{branch.totalEmployee}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => { setSelectedBranch(branch); setIsEditModalOpen(true); }}
                        className="text-gray-600 hover:text-[#5a5ce5] transition-colors" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedBranch(branch); setIsDeleteModalOpen(true); }}
                        className="text-[#ff4c4c] hover:text-red-700 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-800 font-medium">
            Showing 1 to 5 of 5 Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Branch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
              <h2 className="text-[17px] font-bold text-[#1b2559]">Create Branch</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Branch Name</label>
                <input type="text" placeholder="Enter branch name" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Region</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm text-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="eastern">Eastern Region</option>
                    <option value="western">Western Region</option>
                    <option value="northern">Northern Region</option>
                    <option value="southern">Southern Region</option>
                    <option value="central">Central Region</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 mt-4 pt-4">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
              <h2 className="text-[17px] font-bold text-[#1b2559]">Edit Branch</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Branch Name</label>
                <input type="text" defaultValue={selectedBranch.name} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Region</label>
                <div className="relative">
                  <select defaultValue={selectedBranch.regionName} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-700 shadow-sm text-sm">
                    <option value="Eastern Region">Eastern Region</option>
                    <option value="Western Region">Western Region</option>
                    <option value="Northern Region">Northern Region</option>
                    <option value="Southern Region">Southern Region</option>
                    <option value="Central Region">Central Region</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 mt-4 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
                  Save Changes
                </button>
              </div>
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
                onClick={() => { setIsDeleteModalOpen(false); setSelectedBranch(null); }}
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

export default Branch;
