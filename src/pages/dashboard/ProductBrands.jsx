import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Edit, Trash2, ChevronLeft, X, ChevronDown, Camera } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const ProductBrands = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editBrandData, setEditBrandData] = useState(null);

  const brandsData = [
    { id: 1, name: 'Apple', category: 'Smart Phones', models: 12, products: 108, image: 'https://ui-avatars.com/api/?name=Apple&background=fff&color=374151' },
    { id: 2, name: 'Huawei', category: 'Smart Phones', models: 13, products: 117, image: 'https://ui-avatars.com/api/?name=Huawei&background=fff&color=374151' },
    { id: 3, name: 'Samsung', category: 'Smart Phones', models: 18, products: 194, image: 'https://ui-avatars.com/api/?name=Samsung&background=fff&color=374151' },
    { id: 4, name: 'Xiaomi', category: 'Smart Phones', models: 9, products: 137, image: 'https://ui-avatars.com/api/?name=Xiaomi&background=fff&color=374151' },
    { id: 5, name: 'Oppo', category: 'Smart Phones', models: 9, products: 137, image: 'https://ui-avatars.com/api/?name=Oppo&background=fff&color=374151' },
    { id: 6, name: 'Samsung', category: 'Washing Machine', models: 9, products: 137, image: 'https://ui-avatars.com/api/?name=Samsung&background=fff&color=374151' },
    { id: 7, name: 'Google Pixel', category: 'Smart Phones', models: 9, products: 137, image: 'https://ui-avatars.com/api/?name=Google+Pixel&background=fff&color=374151' },
    { id: 8, name: 'Motorola', category: 'Smart Phones', models: 13, products: 175, image: 'https://ui-avatars.com/api/?name=Motorola&background=fff&color=374151' },
  ];

  const filteredData = brandsData.filter(row => {
    return row.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Card */}
      <PageHeader
        title="Product Brands"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Product Management" },
          { label: "Product Sub-Categories" }
        ]}
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-sm"
          />
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#225091] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm shadow-sm"
        >
          + Create Brand
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
            <tr>
              <th className="py-3.5 px-5 text-center w-20 font-semibold">Sr.No.</th>
              <th className="py-3.5 px-5 font-semibold">Brands</th>
              <th className="py-3.5 px-5 font-semibold">Product Category</th>
              <th className="py-3.5 px-5 font-semibold">Total Models</th>
              <th className="py-3.5 px-5 font-semibold">Total Products</th>
              <th className="py-3.5 px-5 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-5 text-center text-[13px] text-gray-500 font-medium">{index + 1}</td>
                <td className="py-3.5 px-5 font-semibold text-gray-900 flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-2xs">
                    <img src={row.image} alt={row.name} className="w-full h-full object-contain" />
                  </div>
                  {row.name}
                </td>
                <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.category}</td>
                <td className="py-3.5 px-5 text-xs text-gray-600 font-medium tabular-nums">{row.models}</td>
                <td className="py-3.5 px-5 text-xs text-gray-600 font-medium tabular-nums">{row.products}</td>
                <td className="py-3.5 px-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setEditBrandData(row)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs"
                    >
                      <Trash2 size={13} /> Delete
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
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white border border-[#225091] shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <BrandModal 
          title="Create Brand" 
          submitText="Create"
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editBrandData && (
        <BrandModal 
          title="Edit Brand" 
          submitText="Save Changes"
          initialData={editBrandData}
          onClose={() => setEditBrandData(null)}
        />
      )}
    </div>
  );
};

// Reusable Modal Component
const BrandModal = ({ title, submitText, onClose, initialData = null }) => {
  const [brandName, setBrandName] = useState(initialData ? initialData.name : '');
  const [category, setCategory] = useState(initialData ? initialData.category : '');

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
              <div className="w-24 h-24 rounded-full border-2 border-[#225091] p-1 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                <img 
                  src={initialData?.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop"} 
                  alt="Brand preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-[#225091] text-white p-2 rounded-full border-2 border-white hover:bg-[#168f94] transition-colors shadow-md">
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-2">Brand Name</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-800 mb-2">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-gray-700"
              >
                <option value="" disabled>Select</option>
                <option value="Smart Phones">Smart Phones</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="ACs">ACs</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-[#225091] text-[#225091] bg-white hover:bg-teal-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#225091] hover:bg-[#168f94] text-white font-medium transition-colors"
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBrands;
