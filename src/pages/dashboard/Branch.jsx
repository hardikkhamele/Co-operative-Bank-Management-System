import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardCreditSettingsModal from '../../components/modals/CardCreditSettingsModal';

const mockBranches = [
  { id: 1, srNo: 1, name: 'Mumbai Branch', state: 'Maharashtra', manager: 'Clark Kent', managerInitials: 'CK', managerBg: 'bg-purple-100 text-purple-600', emiCard: 123, verificationCredit: 123, avatar: 'https://ui-avatars.com/api/?name=Clark+Kent&background=random' },
  { id: 2, srNo: 2, name: 'Nagpur Branch', state: 'Maharashtra', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-100 text-gray-700 font-bold', emiCard: 145, verificationCredit: 145, avatar: '' },
  { id: 3, srNo: 3, name: 'Jaipur', state: 'Rajasthan', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-100 text-gray-700 font-bold', emiCard: 145, verificationCredit: 145, avatar: '' },
  { id: 4, srNo: 4, name: 'Bengaluru', state: 'Karnataka', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-100 text-gray-700 font-bold', emiCard: 145, verificationCredit: 145, avatar: '' },
  { id: 5, srNo: 5, name: 'Delhi', state: 'Delhi', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-100 text-gray-700 font-bold', emiCard: 145, verificationCredit: 145, avatar: '' },
];

const Branch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [filterState, setFilterState] = useState([]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCardCreditModalOpen, setIsCardCreditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b58a6] mb-2">Branch</h1>
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Region & Branch Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b58a6]">Branch</span>
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
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none bg-white"
            >
              <SlidersHorizontal size={18} />
              {filterState.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {filterState.length}
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
                      <div className="absolute z-30 bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['Maharashtra', 'Delhi', 'Karnataka'].map(opt => (
                          <label 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors cursor-pointer"
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
                    className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm bg-white"
                    onClick={() => { setFilterState([]); }}
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCardCreditModalOpen(true)}
            className="border-[1.5px] border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 bg-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            Card & Credit Settings
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            + Create Branch
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
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4">State/UT</th>
                <th className="px-6 py-4">Branch Manager</th>
                <th className="px-6 py-4">EMI Card Available</th>
                <th className="px-6 py-4">Verification Credit</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{branch.srNo}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{branch.name}</td>
                  <td className="px-6 py-4 text-gray-700">{branch.state}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {branch.srNo === 1 ? (
                         <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                           <img src={branch.avatar} alt={branch.manager} className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${branch.managerBg}`}>
                            {branch.managerInitials}
                         </div>
                      )}
                      <span className="text-gray-700">{branch.manager}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{branch.emiCard}</td>
                  <td className="px-6 py-4 text-gray-700">{branch.verificationCredit}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => { setSelectedBranch(branch); setIsEditModalOpen(true); }}
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
            <div className="flex justify-between items-center p-6 pb-2">
              <h2 className="text-xl font-bold text-[#1b2559]">Create Branch</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-5">
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Branch Name</label>
                <input type="text" placeholder="Enter branch name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563]" />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">State/UT</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-[#4b5563]">
                    <option value="" disabled selected>Select</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">EMI Card</label>
                <div className="relative">
                  <input type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m18 15-6-6-6 6"/></svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 -mt-1"><path d="m6 9 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Verification Credit</label>
                <div className="relative">
                  <input type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m18 15-6-6-6 6"/></svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 -mt-1"><path d="m6 9 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-4 mt-6 pt-4">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-bold hover:bg-teal-50 transition-colors text-[15px] bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[15px]">
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
            <div className="flex justify-between items-center p-6 pb-2">
              <h2 className="text-xl font-bold text-[#1b2559]">Edit Branch</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-5">
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Branch Name</label>
                <input type="text" defaultValue={selectedBranch.name} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563]" />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">State/UT</label>
                <div className="relative">
                  <select defaultValue={selectedBranch.state} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-[#4b5563]">
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">EMI Card</label>
                <div className="relative">
                  <input type="number" defaultValue={selectedBranch.emiCard} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m18 15-6-6-6 6"/></svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 -mt-1"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Verification Credit</label>
                <div className="relative">
                  <input type="number" defaultValue={selectedBranch.verificationCredit} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m18 15-6-6-6 6"/></svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 -mt-1"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-4 mt-6 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-bold hover:bg-teal-50 transition-colors text-[15px] bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[15px]">
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

      {/* Card & Credit Settings Modal */}
      <CardCreditSettingsModal 
        isOpen={isCardCreditModalOpen} 
        onClose={() => setIsCardCreditModalOpen(false)} 
      />
    </div>
  );
};

export default Branch;
