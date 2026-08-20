import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { inventoryService } from '../../api/inventoryService';
import { preventInvalidNumberKeys } from '../../utils/validation';

const CreateInventory = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assets: '',
    quantity: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assets.trim()) {
      toast.error('Asset name is required.');
      return;
    }

    if (formData.assets.trim().length > 150) {
      toast.error('Asset name cannot exceed 150 characters.');
      return;
    }

    if (formData.quantity === '' || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      toast.error('Please enter a valid non-negative quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        assets: formData.assets.trim(),
        quantity: Math.floor(Number(formData.quantity))
      };

      const response = await inventoryService.create(payload);
      if (response && (response.success || response.statusCode === 201)) {
        toast.success(response.message || 'Inventory added successfully.');
        navigate('/inventory');
      } else {
        toast.success('Inventory added successfully.');
        navigate('/inventory');
      }
    } catch (err) {
      console.error('Failed to create inventory:', err);
      const errMsg = err.response?.data?.message || 'Failed to add inventory item.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Breadcrumb Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 relative">
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            type="button"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-[22px] font-bold text-[#225091] m-0">Add Inventory</h1>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-500 pl-[40px]">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="hover:text-gray-800 transition-colors">CRM Management</span>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <Link to="/inventory" className="hover:text-gray-800 transition-colors">Inventory</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="text-[#225091]">Add Inventory</span>
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
                  name="assets"
                  maxLength={150}
                  value={formData.assets}
                  onChange={handleChange}
                  placeholder="Enter asset name (e.g., Computer, Laptop)" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                  required
                />
                <span className="text-[11px] text-gray-400 text-right">{formData.assets.length}/150</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-gray-700">Quantity *</label>
                <input 
                  type="number" 
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  onKeyDown={preventInvalidNumberKeys}
                  placeholder="Enter quantity (e.g., 1800)" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-[#225091] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{submitting ? 'Saving...' : 'Save'}</span>
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
