import React from 'react';
import { Edit } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const PriceSettings = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      {/* Header Card */}
      <PageHeader
        title="Price Settings"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Settings" },
          { label: "Price Settings" }
        ]}
      />

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">EMI Card Price</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price (Rs.)</label>
            <input 
              type="text" 
              defaultValue="500" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sell Price (Rs.)</label>
            <input 
              type="text" 
              defaultValue="600" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-6">Verification Credit Price</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price (Rs.)</label>
            <input 
              type="text" 
              defaultValue="20" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sell Price (Rs.)</label>
            <input 
              type="text" 
              defaultValue="25" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2.5 bg-[#225091] hover:bg-[#1a3d6d] text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
            <Edit size={16} />
            <span>Update Prices</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSettings;
