import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      {/* Header Card */}
      <PageHeader
        title="Add Inventory"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'CRM Management' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Add Inventory' }
        ]}
        showBack={true}
        backUrl="/inventory"
      />

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
                className="bg-[#225091] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Save Inventory
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/inventory')}
                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-[15px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInventory;
