import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockCashPayments = [
  { id: 1, srNo: 1, employeeName: 'Clark Kent', avatar: 'https://ui-avatars.com/api/?name=Clark+Kent&background=random', designation: 'Collection Executive', branch: 'Mumbai Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 2, srNo: 2, employeeName: 'Tony Stark', avatar: 'https://ui-avatars.com/api/?name=Tony+Stark&background=random', designation: 'Collection Executive', branch: 'Mumbai Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 3, srNo: 3, employeeName: 'Bruce Wayne', avatar: 'https://ui-avatars.com/api/?name=Bruce+Wayne&background=random', designation: 'Collection Executive', branch: 'Jaipur Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 4, srNo: 4, employeeName: 'Barry Allen', avatar: 'https://ui-avatars.com/api/?name=Barry+Allen&background=random', designation: 'Collection Executive', branch: 'Nagpur Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 5, srNo: 5, employeeName: 'Steve Rogers', avatar: 'https://ui-avatars.com/api/?name=Steve+Rogers&background=random', designation: 'Collection Executive', branch: 'Delhi Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 6, srNo: 6, employeeName: 'Clint Barton', avatar: 'https://ui-avatars.com/api/?name=Clint+Barton&background=random', designation: 'Collection Executive', branch: 'Nagpur Branch', totalCollection: '41,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 7, srNo: 7, employeeName: 'Scott Lang', avatar: 'https://ui-avatars.com/api/?name=Scott+Lang&background=random', designation: 'Collection Executive', branch: 'Delhi Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
  { id: 8, srNo: 8, employeeName: 'Peter Parker', avatar: 'https://ui-avatars.com/api/?name=Peter+Parker&background=random', designation: 'Collection Executive', branch: 'Nagpur Branch', totalCollection: '42,000', totalSubmitted: '42,000', totalPending: '42,000' },
];

const CashPayment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  
  const [filterDesignation, setFilterDesignation] = useState([]);
  const [filterBranch, setFilterBranch] = useState([]);
  
  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">Cash Payment</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <span>Cash Payment</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Cash Payment</span>
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
              {(filterDesignation.length > 0 || filterBranch.length > 0) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(filterDesignation.length > 0 ? 1 : 0) + (filterBranch.length > 0 ? 1 : 0)}
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
                  {/* Designation Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'designation' ? null : 'designation')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Designation</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'designation' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'designation' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['Human Resource', 'Branch Manager', 'Assistant Branch Manager'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors cursor-pointer"
                                checked={filterDesignation.includes(opt)}
                                onChange={() => toggleFilter(setFilterDesignation, opt)}
                              />
                              {filterDesignation.includes(opt) && (
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
                  
                  {/* Branch Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'branch' ? null : 'branch')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Branch</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'branch' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'branch' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors cursor-pointer"
                                checked={filterBranch.includes(opt)}
                                onChange={() => toggleFilter(setFilterBranch, opt)}
                              />
                              {filterBranch.includes(opt) && (
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
                    onClick={() => { setFilterDesignation([]); setFilterBranch([]); }}
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
            className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            <Download size={18} />
            Export
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
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Total Cash<br/>Collection</th>
                <th className="px-6 py-4">Total Cash<br/>Submitted</th>
                <th className="px-6 py-4">Total Cash<br/>Pending</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockCashPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{payment.srNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src={payment.avatar} alt={payment.employeeName} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[#1b2559] font-semibold">{payment.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{payment.designation}</td>
                  <td className="px-6 py-4 text-gray-700">{payment.branch}</td>
                  <td className="px-6 py-4 text-gray-700">₹{payment.totalCollection}</td>
                  <td className="px-6 py-4 text-gray-700">₹{payment.totalSubmitted}</td>
                  <td className="px-6 py-4 text-gray-700">₹{payment.totalPending}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => navigate(`/cash-payment/view/${payment.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                        title="View"
                      >
                        <Eye size={16} />
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
            Showing 1 to 8 of 30 Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashPayment;
