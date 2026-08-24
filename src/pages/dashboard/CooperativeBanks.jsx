import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

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
      <PageHeader
        title="Co-operative Banks"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Partner Management" },
          { label: "Co-operative Bank" }
        ]}
      />

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Bank Name</th>
                <th className="py-3.5 px-5 font-semibold">Email</th>
                <th className="py-3.5 px-5 font-semibold">Phone Number</th>
                <th className="py-3.5 px-5 font-semibold">Mobile Number</th>
                <th className="py-3.5 px-5 font-semibold">Authorized Person</th>
                <th className="py-3.5 px-5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3.5 px-5 text-sm font-semibold text-gray-900">{row.name}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.email}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.phone}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.mobile}</td>
                    <td className="py-3.5 px-5 text-sm text-gray-800 font-medium">{row.authorizedPerson || row.ubo || '—'}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to="/co-operative-bank/view" 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs" 
                          title="View"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <Link 
                          to="/co-operative-bank/edit" 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs" 
                          title="Edit"
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(row)} 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs" 
                          title="Delete"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 text-sm font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                        <Search size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">No banks found</p>
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
