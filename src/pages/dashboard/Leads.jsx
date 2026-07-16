import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Eye, Edit, Trash2, X, SlidersHorizontal } from 'lucide-react';

const mockLeads = [
  { id: 1, appId: 'LN1234567890', name: 'Clark Kent', initials: 'CK', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', phone: '9876543210', address: '1901 Thornridge Ci...', status: 'New' },
  { id: 2, appId: 'LN1234567890', name: 'Tony Stark', initials: 'TS', avatar: '', phone: '9876543210', address: '4517 Washington...', status: 'Active' },
  { id: 3, appId: 'LN1234567890', name: 'Bruce Wayne', initials: 'BW', avatar: '', phone: '9876543210', address: '3891 Ranchview D...', status: 'Completed' },
  { id: 4, appId: 'LN1234567890', name: 'Barry Allen', initials: 'BA', avatar: '', phone: '9876543210', address: '4140 Parker Rd. All...', status: 'Rejected' },
  { id: 5, appId: 'LN1234567890', name: 'Steve Rogers', initials: 'SR', avatar: '', phone: '9876543210', address: '8502 Preston Rd. I...', status: 'Active' },
  { id: 6, appId: 'LN1234567890', name: 'Scott Lang', initials: 'SL', avatar: '', phone: '9876543210', address: '8502 Preston Rd. I...', status: 'New' },
  { id: 7, appId: 'LN1234567890', name: 'Scott Lang', initials: 'SL', avatar: '', phone: '9876543210', address: '2118 Thornridge Ci...', status: 'New' },
  { id: 8, appId: 'LN1234567890', name: 'Peter Parker', initials: 'PP', avatar: '', phone: '9876543210', address: '6391 Elgin St. Celi...', status: 'Completed' },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'New':
      return <span className="px-5 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold">New</span>;
    case 'Active':
      return <span className="px-5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[#5a5ce5] text-xs font-semibold">Active</span>;
    case 'Completed':
      return <span className="px-5 py-1.5 rounded-md bg-transparent border border-green-400 text-[#00c950] text-xs font-semibold">Completed</span>;
    case 'Rejected':
      return <span className="px-5 py-1.5 rounded-md bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold">Rejected</span>;
    default:
      return null;
  }
};

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterRegion, setFilterRegion] = useState([]);
  const [filterBranch, setFilterBranch] = useState([]);

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#1b7ef7] mb-2">Leads</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Lead Management</span>
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
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="relative w-[42px] h-[42px] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] transition-colors"
            >
              <SlidersHorizontal size={20} className="text-gray-500" />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#5a5ce5] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border-[1.5px] border-white">2</div>
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 md:left-auto md:right-0 mt-2 w-72 bg-[#f8f9fb] border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-gray-800 text-[15px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'status' ? null : 'status')}
                    >
                      <span className="text-gray-500 text-[13px]">Status</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    {openFilterDropdown === 'status' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                        {['New', 'Active', 'Completed'].map(opt => (
                          <div 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleFilter(setFilterStatus, opt)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${filterStatus.includes(opt) ? 'border-[#1cabb1] bg-[#1cabb1]' : 'border-gray-500 bg-white'}`}>
                              {filterStatus.includes(opt) && <div className="w-2 h-2 bg-transparent border-b-2 border-r-2 border-white transform rotate-45 mb-0.5"></div>}
                            </div>
                            <span className="text-[13px] text-gray-700">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'region' ? null : 'region')}
                    >
                      <span className="text-gray-500 text-[13px]">Region</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    {openFilterDropdown === 'region' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                        {['Eastern Region', 'Western Region', 'Northern Region'].map(opt => (
                          <div 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleFilter(setFilterRegion, opt)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${filterRegion.includes(opt) ? 'border-[#1cabb1] bg-[#1cabb1]' : 'border-gray-500 bg-white'}`}>
                              {filterRegion.includes(opt) && <div className="w-2 h-2 bg-transparent border-b-2 border-r-2 border-white transform rotate-45 mb-0.5"></div>}
                            </div>
                            <span className="text-[13px] text-gray-700">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Branch Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'branch' ? null : 'branch')}
                    >
                      <span className="text-gray-500 text-[13px]">Branch</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    {openFilterDropdown === 'branch' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                        {['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch'].map(opt => (
                          <div 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleFilter(setFilterBranch, opt)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${filterBranch.includes(opt) ? 'border-[#1cabb1] bg-[#1cabb1]' : 'border-gray-500 bg-white'}`}>
                              {filterBranch.includes(opt) && <div className="w-2 h-2 bg-transparent border-b-2 border-r-2 border-white transform rotate-45 mb-0.5"></div>}
                            </div>
                            <span className="text-[13px] text-gray-700">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-xs"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-xs shadow-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add Lead Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <Link 
            to="/leads/create"
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white py-2.5 px-6 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap w-full md:w-auto text-center"
          >
            + Create Leads
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr.No.</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Application Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Customer Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Phone Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Address</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockLeads.map((lead, idx) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{lead.appId}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {lead.avatar ? (
                        <img src={lead.avatar} alt={lead.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {lead.initials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-800">{lead.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{lead.phone}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{lead.address}</td>
                  <td className="py-4 px-6">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <Link to="/leads/view" state={lead} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <Eye size={18} />
                      </Link>
                      <Link to="/leads/edit" state={lead} className="text-gray-500 hover:text-[#5a5ce5] transition-colors">
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => { setLeadToDelete(lead); setIsDeleteModalOpen(true); }}
                        className="text-[#ff3d67] hover:text-[#e02e55] transition-colors"
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
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
        <div className="mb-4 sm:mb-0 font-medium">
          Showing 1 to 8 of 30 Entries
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white font-medium">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white font-medium">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Add Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {/* Form Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
                <input type="email" placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone</label>
                <input type="tel" placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Status</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Source</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Ads">Ads</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Region</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Branch</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="b1">Branch 1</option>
                    <option value="b2">Branch 2</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-[#f4f3fb] border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="py-2 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white font-medium transition-colors"
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Lead</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{leadToDelete?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setLeadToDelete(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsDeleteModalOpen(false); setLeadToDelete(null); }}
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

export default Leads;
