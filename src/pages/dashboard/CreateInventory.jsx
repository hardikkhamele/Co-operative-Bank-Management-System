import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CreateInventory = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally you'd send data to API here
    navigate('/inventory');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Breadcrumb Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 relative">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Add Inventory</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="hover:text-gray-800 transition-colors">CRM Management</span>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <Link to="/inventory" className="hover:text-gray-800 transition-colors">Inventory</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="text-[#1b58a6]">Add Inventory</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-800">Inventory Details</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-gray-700">Asset Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter asset name (e.g., Computer, Laptop)" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1cabb1]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-gray-700">Quantity *</label>
                <input 
                  type="number" 
                  placeholder="Enter quantity" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1cabb1]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button 
                type="submit" 
                className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm"
              >
                Save
              </button>
              <Link 
                to="/inventory"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInventory;
