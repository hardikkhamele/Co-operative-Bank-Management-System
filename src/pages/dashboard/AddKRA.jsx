import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

const AddKRA = () => {
  const navigate = useNavigate();
  const [kraRows, setKraRows] = useState([
    { id: 1, product: 'Fixed Deposit', target: '₹5,00,000' },
    { id: 2, product: 'Loan Disbursement', target: '₹3,00,000' },
    { id: 3, product: 'Savings Account', target: '₹200' },
  ]);

  const handleAddRow = () => {
    const newId = kraRows.length > 0 ? Math.max(...kraRows.map(r => r.id)) + 1 : 1;
    setKraRows([...kraRows, { id: newId, product: '', target: '' }]);
  };

  const handleRowChange = (id, field, value) => {
    setKraRows(kraRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSave = () => {
    // Save logic would go here
    navigate(-1);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Add New KRA</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <Link to="/daily-work-report" className="hover:text-gray-800 transition-colors">Daily Work Report</Link>
          <ChevronRight size={14} className="mx-1" />
          <span onClick={() => navigate(-1)} className="hover:text-gray-800 transition-colors cursor-pointer">View Report</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1b58a6]">Add New KRA</span>
        </div>
      </div>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=Clark+Kent&background=F3E8FF&color=9333EA&size=100`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-gray-800">Clark Kent</h2>
            <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[12px] font-bold w-max">
              Branch Manager
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Phone size={16} className="text-[#1cabb1]" /> 98765 43210
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Mail size={16} className="text-[#1cabb1]" /> example@gmail.com
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <MapPin size={16} className="text-[#1cabb1]" /> Mumbai Branch
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden p-8">
        <h2 className="text-[18px] font-bold text-gray-800 mb-6">Add New KRA for FY 2027</h2>
        
        <div className="flex flex-col gap-6">
          {kraRows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-700">Product</label>
                <select 
                  value={row.product}
                  onChange={(e) => handleRowChange(row.id, 'product', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none"
                >
                  <option value="">Select Product</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                  <option value="Loan Disbursement">Loan Disbursement</option>
                  <option value="Savings Account">Savings Account</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-700">Target</label>
                <input 
                  type="text" 
                  value={row.target}
                  onChange={(e) => handleRowChange(row.id, 'target', e.target.value)}
                  placeholder="e.g. ₹5,00,000"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#1cabb1]"
                />
              </div>
            </div>
          ))}
          
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={handleAddRow}
              className="text-[#1cabb1] hover:text-[#159a9f] text-[14px] font-semibold flex items-center gap-1 transition-colors"
            >
              + Add More Target
            </button>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-4 mt-2">
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 text-[14px] font-semibold transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white text-[14px] font-semibold transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>

    </div>
  );
};

export default AddKRA;
