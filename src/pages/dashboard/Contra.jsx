import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockReceipts = [
  { id: 1, srNo: 1, receiptNo: 'CT-000123', name: 'Mamta Lodhi', glHead: '410105', glHeadName: 'Cash', accountNo: '38489745146', date: '20/07/2026', status: 'New' },
  { id: 2, srNo: 2, receiptNo: 'CT-000123', name: 'Hillery Moses', glHead: '410105', glHeadName: 'Cash', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
  { id: 3, srNo: 3, receiptNo: 'CT-000123', name: 'Mohd Hadi', glHead: '410105', glHeadName: 'Cash', accountNo: '38489745148', date: '20/07/2026', status: 'Rejected' },
  { id: 4, srNo: 4, receiptNo: 'CT-000123', name: 'Navjot Kaur', glHead: '410105', glHeadName: 'Investment', accountNo: '38489745148', date: '20/07/2026', status: 'New' },
  { id: 5, srNo: 5, receiptNo: 'CT-000123', name: 'Vishwas Patel', glHead: '410105', glHeadName: 'Bank', accountNo: '38489745148', date: '20/07/2026', status: 'New' },
  { id: 6, srNo: 6, receiptNo: 'CT-000123', name: 'Vikas Tiwari', glHead: '410105', glHeadName: 'Cash', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
  { id: 7, srNo: 7, receiptNo: 'CT-000123', name: 'Amardeep Singh', glHead: '410105', glHeadName: 'Bank', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
  { id: 8, srNo: 8, receiptNo: 'CT-000123', name: 'Shalini Jain', glHead: '410105', glHeadName: 'Investment', accountNo: '38489745148', date: '20/07/2026', status: 'Approved' },
];

const Contra = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  
  const [filterBranch, setFilterBranch] = useState([]);
  const [filterReceiptType, setFilterReceiptType] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
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
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded w-20">New</span>;
      case 'Approved':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-green-500 bg-green-50 border border-green-200 rounded w-20">Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center justify-center px-4 py-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded w-20">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-[#1b58a6] mb-2">Contra Receipt</h1>
        <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
          <Link to="/dashboard" className="hover:text-[#1b58a6] transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>Receipt Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1cabb1]">Contra Receipt</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none bg-white shadow-sm"
            >
              <SlidersHorizontal size={18} />
              {(filterBranch.length > 0 || filterReceiptType.length > 0 || dateFrom || dateTo) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1b58a6] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {(filterBranch.length > 0 ? 1 : 0) + (filterReceiptType.length > 0 ? 1 : 0) + ((dateFrom || dateTo) ? 1 : 0)}
                </span>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Branch Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'branch' ? null : 'branch')}
                    >
                      <span className="text-gray-500 text-[14px]">Branch</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'branch' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'branch' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 flex flex-col">
                        {['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1] cursor-pointer"
                              checked={filterBranch.includes(opt)}
                              onChange={() => toggleFilter(setFilterBranch, opt)}
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Receipt Type Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'receiptType' ? null : 'receiptType')}
                    >
                      <span className="text-gray-500 text-[14px]">Receipt Type</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'receiptType' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'receiptType' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 flex flex-col">
                        {['Bank', 'Cash', 'Investment'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1] cursor-pointer"
                              checked={filterReceiptType.includes(opt)}
                              onChange={() => toggleFilter(setFilterReceiptType, opt)}
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Pickers */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <input 
                         type="date" 
                         value={dateFrom}
                         onChange={(e) => setDateFrom(e.target.value)}
                         className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white" 
                       />
                    </div>
                    <div className="flex-1 relative">
                       <input 
                         type="date" 
                         value={dateTo}
                         onChange={(e) => setDateTo(e.target.value)}
                         className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] bg-white" 
                       />
                    </div>
                  </div>

                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm bg-white"
                    onClick={() => { setFilterBranch([]); setFilterReceiptType([]); setDateFrom(''); setDateTo(''); }}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors focus:outline-none text-sm shadow-sm"
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
            <Download size={16} />
            Export
          </button>
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
            <thead className="bg-[#f8f9fb] text-[#1b2559] font-bold border-b border-gray-100">
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
                  <td className="px-6 py-4 text-[#1b2559]">{receipt.name}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.glHead}</td>
                  <td className="px-6 py-4 text-[#1b2559]">{receipt.glHeadName}</td>
                  <td className="px-6 py-4 text-[#1b2559]">{receipt.accountNo}</td>
                  <td className="px-6 py-4 text-gray-700">{receipt.date}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(receipt.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/contra/view/${receipt.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedReceipt(receipt); setIsEditModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedReceipt(receipt); setIsDeleteModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors" 
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
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="text-sm text-gray-700 font-semibold">
            Showing 1 to 8 of 30 Entries
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors text-xs font-bold">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-bold shadow-sm text-xs">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">
              2
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold">
              3
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-teal-50 transition-colors text-xs font-bold">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f8f9fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 pb-4 bg-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1b2559]">Create Receipt</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Name</label>
                <input type="text" placeholder="Enter name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head</label>
                <input type="text" placeholder="Enter GL head" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head Name</label>
                <input type="text" placeholder="Enter GL head name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Account No.</label>
                <input type="text" placeholder="Enter account number" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Amount</label>
                <input type="number" placeholder="₹ Enter amount" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Note</label>
                <textarea rows="3" placeholder="Write any note" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 resize-none"></textarea>
              </div>
              
              <div className="flex justify-center items-center gap-4 mt-8 pt-4">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
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
          <div className="bg-[#f8f9fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 pb-4 bg-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1b2559]">Modify Receipt</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Name</label>
                <input type="text" defaultValue={selectedReceipt.name} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head</label>
                <input type="text" defaultValue={selectedReceipt.glHead} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">GL Head Name</label>
                <input type="text" defaultValue={selectedReceipt.glHeadName} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Account No.</label>
                <input type="text" defaultValue={selectedReceipt.accountNo} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Amount</label>
                <input type="number" defaultValue="892.56" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2559] mb-1.5">Note</label>
                <textarea rows="3" placeholder="Write any note" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] transition-all bg-white text-sm text-gray-700 resize-none"></textarea>
              </div>
              
              <div className="flex justify-center items-center gap-4 mt-8 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm">
                  Modify Receipt
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Receipt</h3>
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

export default Contra;
