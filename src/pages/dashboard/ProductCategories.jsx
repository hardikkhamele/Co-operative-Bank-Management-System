import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Edit, Trash2, ChevronLeft, X, Camera } from 'lucide-react';

const ProductCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);

  const categoriesData = [
    { id: 1, name: 'Smart Phones', brands: 12, models: 108, products: 1200, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=64&h=64&fit=crop&auto=format' },
    { id: 2, name: 'ACs', brands: 13, models: 117, products: 1300, image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=64&h=64&fit=crop&auto=format' },
    { id: 3, name: 'Refrigerators', brands: 18, models: 194, products: 1800, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=64&h=64&fit=crop&auto=format' },
    { id: 4, name: 'LED TVs', brands: 9, models: 137, products: 900, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=64&h=64&fit=crop&auto=format' },
    { id: 5, name: 'Air Coolers', brands: 9, models: 137, products: 900, image: 'https://images.unsplash.com/photo-1595058778385-a740702d7cc1?w=64&h=64&fit=crop&auto=format' },
    { id: 6, name: 'Washing Machine', brands: 9, models: 137, products: 900, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=64&h=64&fit=crop&auto=format' },
    { id: 7, name: 'Smart Watch', brands: 9, models: 137, products: 900, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=64&h=64&fit=crop&auto=format' },
    { id: 8, name: 'Power Backup', brands: 13, models: 175, products: 1300, image: 'https://images.unsplash.com/photo-1594943917849-c0953a3118cd?w=64&h=64&fit=crop&auto=format' },
  ];

  const filteredData = categoriesData.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Product Categories</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Product Management</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Product Categories</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all shadow-sm"
          />
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#1cabb1] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm shadow-sm"
        >
          + Create Category
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50/50 text-gray-700 text-sm font-semibold border-b border-gray-200">
              <th className="py-4 px-6 text-center w-20">Sr.No.</th>
              <th className="py-4 px-6">Product Category</th>
              <th className="py-4 px-6">Total Brands</th>
              <th className="py-4 px-6">Total Models</th>
              <th className="py-4 px-6">Total Products</th>
              <th className="py-4 px-6 text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm text-gray-600">
                <td className="py-4 px-6 text-center">{index + 1}</td>
                <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1">
                    <img src={row.image} alt={row.name} className="w-full h-full object-contain rounded-sm" />
                  </div>
                  {row.name}
                </td>
                <td className="py-4 px-6">{row.brands}</td>
                <td className="py-4 px-6">{row.models}</td>
                <td className="py-4 px-6">{row.products}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setEditCategoryData(row)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
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
      <div className="flex items-center justify-between text-sm text-gray-500 shrink-0">
        <div>Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of 30 Entries</div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white border border-[#1cabb1] shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors shadow-sm">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors shadow-sm">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CategoryModal 
          title="Create Category" 
          submitText="Create"
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editCategoryData && (
        <CategoryModal 
          title="Edit Category" 
          submitText="Save Changes"
          initialData={editCategoryData}
          onClose={() => setEditCategoryData(null)}
        />
      )}
    </div>
  );
};

// Reusable Modal Component
const CategoryModal = ({ title, submitText, onClose, initialData = null }) => {
  const [categoryName, setCategoryName] = useState(initialData ? initialData.name : '');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#f4f6fb] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-[#1cabb1] p-1 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                <img 
                  src={initialData?.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop"} 
                  alt="Category preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-[#1cabb1] text-white p-2 rounded-full border-2 border-white hover:bg-[#168f94] transition-colors shadow-md">
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-800 mb-2">Category Name</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm"
            />
          </div>

          <div className="flex justify-end items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] bg-white hover:bg-teal-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white font-medium transition-colors"
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
