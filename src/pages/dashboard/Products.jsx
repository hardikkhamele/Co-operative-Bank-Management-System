import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Edit, Trash2, ChevronLeft, X, ChevronDown, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';

const Products = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProductData, setEditProductData] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const productsData = [
    { id: 1, model: 'iPhone 17', description: 'Lorem ipsum dolor sit', brand: 'Apple', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=iPhone&background=fff&color=374151' },
    { id: 2, model: 'iPhone 17 Plus', description: 'Lorem ipsum dolor sit', brand: 'Apple', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=iPhone&background=fff&color=374151' },
    { id: 3, model: 'iPhone 17 Pro', description: 'Lorem ipsum dolor sit', brand: 'Apple', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=iPhone&background=fff&color=374151' },
    { id: 4, model: 'iPhone 17 Pro Max', description: 'Lorem ipsum dolor sit', brand: 'Apple', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=iPhone&background=fff&color=374151' },
    { id: 5, model: 'iPhone 16', description: 'Lorem ipsum dolor sit', brand: 'Apple', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=iPhone&background=fff&color=374151' },
    { id: 6, model: 'Samsung 8 KG 5 Star', description: 'Lorem ipsum dolor sit', brand: 'Samsung', category: 'Washing Machine', image: 'https://ui-avatars.com/api/?name=Samsung&background=fff&color=374151' },
    { id: 7, model: 'Pixel 10', description: 'Lorem ipsum dolor sit', brand: 'Google Pixel', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=Pixel&background=fff&color=374151' },
    { id: 8, model: 'Pixel 11', description: 'Lorem ipsum dolor sit', brand: 'Google Pixel', category: 'Smart Phones', image: 'https://ui-avatars.com/api/?name=Pixel&background=fff&color=374151' },
  ];

  const filteredData = productsData.filter(row => {
    return row.model.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Card */}
      <PageHeader
        title="Products"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Product Management" },
          { label: "Products" }
        ]}
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
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
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm relative"
            >
              <SlidersHorizontal size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#225091] rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white">2</span>
            </button>

            {isFilterOpen && (
              <div className="absolute top-full mt-2 left-0 w-[320px] bg-[#f8f9fc] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.08)] border border-gray-100 p-5 z-20">
                 <div className="flex justify-between items-center mb-5">
                   <h3 className="text-[17px] font-semibold text-gray-800">Filter</h3>
                   <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                     <X size={22} />
                   </button>
                 </div>
                 
                 <div className="space-y-4">
                    <MultiSelectDropdown 
                       label="Category" 
                       options={['Smart Phones', 'Washing Machine', 'LED TVs']}
                    />
                 </div>

                 <div className="flex gap-3 mt-8">
                   <button className="flex-1 py-2.5 border-2 border-[#225091] text-[#225091] rounded-full font-medium hover:bg-[#225091]/5 transition-colors bg-white text-[15px]">
                     Reset Filter
                   </button>
                   <button className="flex-1 py-2.5 bg-[#225091] text-white rounded-full font-medium hover:bg-[#168f94] transition-colors text-[15px] shadow-sm">
                     Set Filter
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#225091] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm shadow-sm"
        >
          + Create Product
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px] text-center text-sm whitespace-nowrap">
          <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
            <tr>
              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-20">Sr.No.</th>
              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Models</th>
              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Product Description</th>
              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Brand</th>
              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Product Category</th>
              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-5 text-center text-[13px] text-gray-500 font-medium">{(page - 1) * limit + index + 1}</td>
                <td className="py-3.5 px-5 font-semibold text-gray-900 flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-2xs">
                    <img src={row.image} alt={row.model} className="w-full h-full object-contain" />
                  </div>
                  {row.model}
                </td>
                <td className="py-3.5 px-5 text-xs text-gray-600">{row.description}</td>
                <td className="py-3.5 px-5 text-xs text-gray-700 font-medium">{row.brand}</td>
                <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{row.category}</td>
                <td className="py-3.5 px-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setEditProductData(row)}
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

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalRecords={filteredData.length}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ProductModal 
          title="Create Product" 
          submitText="Create"
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editProductData && (
        <ProductModal 
          title="Edit Product" 
          submitText="Save Changes"
          initialData={editProductData}
          onClose={() => setEditProductData(null)}
        />
      )}
    </div>
  );
};

// Reusable Modal Component
const ProductModal = ({ title, submitText, onClose, initialData = null }) => {
  const [modelName, setModelName] = useState(initialData ? initialData.model : '');
  const [description, setDescription] = useState(initialData ? initialData.description : '');
  const [brand, setBrand] = useState(initialData ? initialData.brand : '');
  const [category, setCategory] = useState(initialData ? initialData.category : '');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!modelName.trim()) {
      toast.error("Model name is required.");
      return;
    }
    if (!brand) {
      toast.error("Please select a brand.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    toast.success(initialData ? "Product updated successfully!" : "Product created successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#f4f6fb] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
              <X size={24} />
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-[#225091] p-1 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                <img 
                  src={initialData?.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop"} 
                  alt="Product preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button type="button" className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-[#225091] text-white p-2 rounded-full border-2 border-white hover:bg-[#168f94] transition-colors shadow-md cursor-pointer">
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-2">Model Name *</label>
            <input
              type="text"
              placeholder="Enter model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm"
              required
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-2">Brand *</label>
            <div className="relative">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-gray-700"
                required
              >
                <option value="" disabled>Select Brand</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Google Pixel">Google Pixel</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-800 mb-2">Category *</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-gray-700"
                required
              >
                <option value="" disabled>Select Category</option>
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
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-[#225091] text-[#225091] bg-white hover:bg-teal-50 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#225091] hover:bg-[#168f94] text-white font-medium transition-colors cursor-pointer"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Custom Multi-Select Dropdown Component
const MultiSelectDropdown = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter(item => item !== opt));
    } else {
      setSelected([...selected, opt]);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center bg-white border px-4 py-3 rounded-lg text-gray-700 focus:outline-none transition-colors ${isOpen ? 'border-[#3b82f6]' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <span className="text-[15px] font-medium text-gray-700">{label}</span>
        <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-2 overflow-hidden">
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="w-4 h-4 rounded border-gray-400 text-[#225091] focus:ring-[#225091] cursor-pointer"
              />
              <span className="text-[15px] text-gray-800">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
