import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockReceipts = [
  { id: 1, srNo: 1, receiptNo: 'CR-000123', name: 'Mamta Lodhi', glHead: '410105', glHeadName: 'Loan', acNo: '36489745148', date: '20/07/2026', status: 'New' },
  { id: 2, srNo: 2, receiptNo: 'CR-000123', name: 'Hillery Moses', glHead: '410105', glHeadName: 'Loan', acNo: '36489745148', date: '20/07/2026', status: 'Approved' },
  { id: 3, srNo: 3, receiptNo: 'CR-000123', name: 'Mohd Hadi', glHead: '410105', glHeadName: 'Loan', acNo: '36489745148', date: '20/07/2026', status: 'Rejected' },
  { id: 4, srNo: 4, receiptNo: 'CR-000123', name: 'Navjot Kaur', glHead: '410105', glHeadName: 'Loan', acNo: '36489745148', date: '20/07/2026', status: 'New' },
  { id: 5, srNo: 5, receiptNo: 'CR-000123', name: 'Vishwas Patel', glHead: '410105', glHeadName: 'Daily Deposit', acNo: '36489745148', date: '20/07/2026', status: 'New' },
  { id: 6, srNo: 6, receiptNo: 'CR-000123', name: 'Vikas Tiwari', glHead: '410105', glHeadName: 'Daily Agent Collection', acNo: '36489745148', date: '20/07/2026', status: 'Approved' },
  { id: 7, srNo: 7, receiptNo: 'CR-000123', name: 'Amardeep Singh', glHead: '410105', glHeadName: 'Monthly RD', acNo: '36489745148', date: '20/07/2026', status: 'Approved' },
];

const Credit = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterBranch, setFilterBranch] = useState([]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'New':
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-yellow-600 bg-yellow-100 rounded-full">New</span>;
      case 'Approved':
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-[#1cabb1] bg-teal-50 rounded-full border border-teal-100">Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold text-red-500 bg-red-50 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">Credit Receipt</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <span>Receipt Management</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Credit Receipt</span>
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
              {(filterStatus.length > 0 || filterBranch.length > 0) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(filterStatus.length > 0 ? 1 : 0) + (filterBranch.length > 0 ? 1 : 0)}
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
                  {/* Status Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'status' ? null : 'status')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Status</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'status' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'status' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['New', 'Approved', 'Rejected'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors cursor-pointer"
                                checked={filterStatus.includes(opt)}
                                onChange={() => toggleFilter(setFilterStatus, opt)}
                              />
                              {filterStatus.includes(opt) && (
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
                        {['Mumbai Branch', 'Nagpur Branch', 'Railway Branch'].map(opt => (
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
                    onClick={() => { setFilterStatus([]); setFilterBranch([]); }}
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
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm flex-shrink-0"
          >
            + Create Receipt
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
                <th className="px-6 py-4">Receipt No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">GL Head</th>
                <th className="px-6 py-4">GL Head Name</th>
                <th className="px-6 py-4">A/C No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{receipt.srNo}</td>
                  <td className="px-6 py-4 text-[#1b2559] font-semibold">{receipt.receiptNo}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.name}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.glHead}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.glHeadName}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.acNo}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.date}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(receipt.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => navigate(`/credit/view/${receipt.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedReceipt(receipt); setIsEditModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedReceipt(receipt); setIsDeleteModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
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
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2">
              <h2 className="text-xl font-bold text-[#1b2559]">Create Receipt</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-5">
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Bank Name</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-[#4b5563]">
                    <option value="" disabled selected>Select Bank</option>
                    <option value="SBI Branch">SBI Branch</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Account No.</label>
                <input type="text" placeholder="Enter Account Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563]" />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Amount</label>
                <input type="number" placeholder="Enter Amount" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Note</label>
                <textarea rows="3" placeholder="Add Note" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] resize-none"></textarea>
              </div>
              
              <div className="flex justify-end items-center gap-4 mt-6 pt-4">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-bold hover:bg-teal-50 transition-colors text-[15px] bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[15px]">
                  Create Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Receipt Modal */}
      {isEditModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2">
              <h2 className="text-xl font-bold text-[#1b2559]">Modify Receipt</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-5">
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Bank Name</label>
                <div className="relative">
                  <select defaultValue={selectedReceipt.bankName} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-[15px] text-[#4b5563]">
                    <option value="SBI Branch">SBI Branch</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Account No.</label>
                <input type="text" defaultValue={selectedReceipt.accountNo} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563]" />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Amount</label>
                <input type="number" defaultValue={selectedReceipt.amount} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#1b2559] mb-2">Note</label>
                <textarea rows="3" placeholder="Add Note" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] resize-none">Receipt modifications.</textarea>
              </div>
              
              <div className="flex justify-end items-center gap-4 mt-6 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-bold hover:bg-teal-50 transition-colors text-[15px] bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#168f94] transition-colors shadow-sm text-[15px]">
                  Update Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Receipt</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete receipt <span className="font-semibold text-gray-700">{selectedReceipt.receiptNo}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedReceipt(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedReceipt(null); }}
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

export default Credit;
