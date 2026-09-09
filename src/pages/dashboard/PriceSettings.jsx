import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { validatePositiveNumber } from '../../utils/validation';

const PriceSettings = () => {
  const [prices, setPrices] = useState({
    emiCostPrice: '500',
    emiSellPrice: '600',
    creditCostPrice: '20',
    creditSellPrice: '25'
  });

  const handleChange = (field, value) => {
    setPrices(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePrices = (e) => {
    e.preventDefault();

    const emiCostCheck = validatePositiveNumber(prices.emiCostPrice, 'EMI Card Cost Price', { min: 0 });
    if (!emiCostCheck.isValid) {
      toast.error(emiCostCheck.error);
      return;
    }

    const emiSellCheck = validatePositiveNumber(prices.emiSellPrice, 'EMI Card Sell Price', { min: 0 });
    if (!emiSellCheck.isValid) {
      toast.error(emiSellCheck.error);
      return;
    }

    const creditCostCheck = validatePositiveNumber(prices.creditCostPrice, 'Verification Credit Cost Price', { min: 0 });
    if (!creditCostCheck.isValid) {
      toast.error(creditCostCheck.error);
      return;
    }

    const creditSellCheck = validatePositiveNumber(prices.creditSellPrice, 'Verification Credit Sell Price', { min: 0 });
    if (!creditSellCheck.isValid) {
      toast.error(creditSellCheck.error);
      return;
    }

    toast.success("Prices updated successfully!");
  };

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
      <form onSubmit={handleUpdatePrices} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">EMI Card Price</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price (Rs.)</label>
            <input 
              type="number"
              min="0"
              step="any"
              value={prices.emiCostPrice}
              onChange={(e) => handleChange('emiCostPrice', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sell Price (Rs.)</label>
            <input 
              type="number"
              min="0"
              step="any"
              value={prices.emiSellPrice}
              onChange={(e) => handleChange('emiSellPrice', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-6">Verification Credit Price</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price (Rs.)</label>
            <input 
              type="number"
              min="0"
              step="any"
              value={prices.creditCostPrice}
              onChange={(e) => handleChange('creditCostPrice', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sell Price (Rs.)</label>
            <input 
              type="number"
              min="0"
              step="any"
              value={prices.creditSellPrice}
              onChange={(e) => handleChange('creditSellPrice', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="px-6 py-2.5 bg-[#225091] hover:bg-[#1a3d6d] text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
            <Edit size={16} />
            <span>Update Prices</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PriceSettings;
