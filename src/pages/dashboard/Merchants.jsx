import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Eye, Edit, Trash2, X } from 'lucide-react';

const mockMerchants = [
  { id: 1, shopName: 'Tech Haven', ownerName: 'Tony Stark', email: 'tony@techhaven.com', phone: '9876543210' },
  { id: 2, shopName: 'Daily Needs Grocery', ownerName: 'Bruce Wayne', email: 'bruce@dailyneeds.com', phone: '8765432109' },
  { id: 3, shopName: 'Fashion Forward', ownerName: 'Diana Prince', email: 'diana@fashionforward.com', phone: '7654321098' },
];

const Merchants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);

  const filteredData = mockMerchants.filter(row => {
    return row.shopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           row.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteClick = (merchant) => {
    setMerchantToDelete(merchant);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    setMerchantToDelete(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Merchant</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Partner Management</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Merchant</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Merchant"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all shadow-sm"
            />
          </div>
        </div>

        <Link 
          to="/merchant/create" 
          className="bg-[#1cabb1] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm shadow-sm"
        >
          + Add New Merchant
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr No</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Shop Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Owner Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Phone Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-600">{index + 1}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-800">{row.shopName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-800">{row.ownerName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{row.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{row.phone}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <Link to="/merchant/view" className="text-gray-800 hover:text-blue-500 transition-colors" title="View">
                        <Eye size={18} />
                      </Link>
                      <Link to="/merchant/edit" className="text-gray-800 hover:text-blue-500 transition-colors" title="Edit">
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-500 hover:text-red-600 transition-colors" 
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
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30 mt-auto">
          <div>Showing 1 to {filteredData.length} of {filteredData.length} entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium">Previous</button>
            <button className="px-3 py-1 rounded-md bg-[#1cabb1] text-white font-medium">1</button>
            <button className="px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium">Next</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Delete Merchant</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Are you sure you want to delete <span className="font-bold text-gray-800">{merchantToDelete?.shopName}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors text-sm shadow-sm shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchants;
