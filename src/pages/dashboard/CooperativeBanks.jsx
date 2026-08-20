import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Eye, Edit, Trash2, X, ArrowLeft } from 'lucide-react';

const mockBanks = [];

const CooperativeBanks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);

  const filteredData = mockBanks.filter(row => {
    return row.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteClick = (bank) => {
    setBankToDelete(bank);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    setBankToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#225091] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shrink-0 shadow-sm"
          type="button"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-[22px] font-bold text-[#225091] m-0">Co-operative Banks</h1>
          <div className="flex items-center text-[12px] font-medium text-gray-500 mt-1">
            <Link to="/dashboard" className="hover:text-[#225091] transition-colors">Dashboard</Link>
            <ChevronRight size={14} className="mx-1 text-gray-400" />
            <span className="hover:text-[#225091] transition-colors cursor-pointer">Partner Management</span>
            <ChevronRight size={14} className="mx-1 text-gray-400" />
            <span className="text-[#225091]">Co-operative Bank</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-5">
        {/* Left Side: Inline Filters */}
        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="flex flex-col gap-1.5 w-full sm:w-[260px]">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Search Bank</label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Bank Name, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-[13px] font-medium bg-white shadow-sm text-gray-700"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 justify-end">
          <Link 
            to="/co-operative-bank/create" 
            className="flex items-center gap-1.5 px-5 py-2 bg-[#225091] text-white rounded-full font-bold text-[13px] hover:bg-[#163a6c] transition-colors shadow-[0_2px_10px_rgba(34,80,145,0.25)]"
          >
            <span className="text-lg leading-none mb-0.5">+</span> Add New Bank
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-gray-100">
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Sr.No.</th>
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Bank Name</th>
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Mobile Number</th>
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Authorized Person</th>
                <th className="py-3.5 px-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3 px-5 text-[13px] text-gray-700 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-800 font-bold">{row.name}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">{row.email}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">{row.phone}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">{row.mobile}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-800 font-semibold">{row.authorizedPerson || row.ubo || '—'}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-center gap-3">
                        <Link to="/co-operative-bank/view" className="text-gray-400 hover:text-[#225091] transition-colors" title="View"><Eye size={16} strokeWidth={2.5}/></Link>
                        <Link to="/co-operative-bank/edit" className="text-gray-400 hover:text-emerald-500 transition-colors" title="Edit"><Edit size={16} strokeWidth={2.5}/></Link>
                        <button onClick={() => handleDeleteClick(row)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} strokeWidth={2.5}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Search size={24} className="text-gray-300" />
                      </div>
                      <p className="text-[13px] font-semibold text-gray-800">No banks found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
          <div className="text-[12px] text-gray-500 font-medium">
            Showing <span className="font-semibold text-gray-700">{filteredData.length > 0 ? 1 : 0}</span> to <span className="font-semibold text-gray-700">{filteredData.length}</span> of <span className="font-semibold text-gray-700">{filteredData.length}</span> entries
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Bank</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-800">{bankToDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CooperativeBanks;
