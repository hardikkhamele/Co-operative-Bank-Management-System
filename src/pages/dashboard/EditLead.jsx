import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, ChevronDown, Upload } from 'lucide-react';

const EditLead = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const leadData = location.state || {};

  const [aadhaarNumber, setAadhaarNumber] = useState(leadData.aadhaar || '1234 5678 9012');
  const [fullName, setFullName] = useState(leadData.name || 'Amit Dutta');
  const [mobileNumber, setMobileNumber] = useState(leadData.phone || '9876543210');
  const [pinCode, setPinCode] = useState(leadData.pinCode || '411061');

  const handleSave = (e) => {
    e.preventDefault();
    navigate('/leads');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Edit Lead</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Lead Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/leads" className="hover:text-gray-700">Leads</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Edit Lead</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSave}>
          {/* Basic Information */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name (As Per PAN Card)</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                <div className="relative">
                  <select defaultValue="male" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-700 shadow-sm" required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth</label>
                <div className="relative">
                  <input type="text" defaultValue="01/01/1996" placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter mobile number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Identity Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Number</label>
                <input type="text" defaultValue="ABCDE1234F" placeholder="Enter PAN Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-[#1cabb1] mb-2" />
                  <span className="text-sm font-medium text-gray-800">pan_card_front.jpg</span>
                  <span className="text-xs text-gray-500 mt-1">Click to replace</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Number</label>
                <input 
                  type="text" 
                  placeholder="Enter Aadhaar Number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-[#1cabb1] mb-2" />
                  <span className="text-sm font-medium text-gray-800">aadhaar_card.jpg</span>
                  <span className="text-xs text-gray-500 mt-1">Click to replace</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Consent */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Address Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Current Residential PIN Code</label>
                <input 
                  type="text" 
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter 6-digit current residential PIN code" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                  required 
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" defaultChecked required />
              <label htmlFor="terms" className="text-[15px] text-gray-600 leading-relaxed">
                I have read, understand, and hereby accept the Advita product application <br/>
                <a href="#" className="text-red-500 hover:underline">Terms and Conditions</a>.
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-4 pt-6 mt-4 border-t border-gray-100">
            <Link
              to="/leads"
              className="px-8 py-2.5 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] bg-white hover:bg-teal-50 font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white font-semibold transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLead;
