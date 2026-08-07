import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, UploadCloud, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  validateEmail, 
  validatePhone, 
  validateAadhaar, 
  validatePAN, 
  validateGSTIN, 
  validatePassword, 
  sanitizeDigits, 
  sanitizePAN, 
  sanitizeGSTIN 
} from '../../utils/validation';

const FileUploadField = ({ label, id }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-semibold text-gray-800">{label}</label>
      <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
        <input 
          type="file" 
          id={id} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="image/*,.pdf"
        />
        <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#1cabb1] transition-colors">
          <UploadCloud size={24} />
          <span className="text-xs font-medium">Click to upload (PDF/Image)</span>
        </div>
      </div>
    </div>
  );
};

const CreateMerchant = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopOwnerName: '',
    email: '',
    phoneNumber: '',
    aadharNumber: '',
    panNumber: '',
    gstin: '',
    password: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.shopName.trim()) {
      toast.error("Please enter shop name");
      return;
    }
    if (!formData.shopOwnerName.trim()) {
      toast.error("Please enter shop owner name");
      return;
    }

    const emailErr = validateEmail(formData.email).error;
    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    const phoneErr = validatePhone(formData.phoneNumber).error;
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }

    if (formData.aadharNumber) {
      const aadharErr = validateAadhaar(formData.aadharNumber).error;
      if (aadharErr) {
        toast.error(aadharErr);
        return;
      }
    }

    if (formData.panNumber) {
      const panErr = validatePAN(formData.panNumber).error;
      if (panErr) {
        toast.error(panErr);
        return;
      }
    }

    if (formData.gstin) {
      const gstinErr = validateGSTIN(formData.gstin).error;
      if (gstinErr) {
        toast.error(gstinErr);
        return;
      }
    }

    const passErr = validatePassword(formData.password, { minLength: 6 }).error;
    if (passErr) {
      toast.error(passErr);
      return;
    }

    toast.success("Merchant created successfully!");
    navigate('/merchant');
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Create Merchant</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Partner Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/merchant" className="hover:text-gray-700">Merchant</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Create</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">General Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Shop Name *</label>
              <input 
                type="text" 
                value={formData.shopName}
                onChange={e => handleChange('shopName', e.target.value)}
                placeholder="Enter shop name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Shop Owner Name *</label>
              <input 
                type="text" 
                value={formData.shopOwnerName}
                onChange={e => handleChange('shopOwnerName', e.target.value)}
                placeholder="Enter owner name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Enter email address" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Phone Number *</label>
              <input 
                type="tel" 
                value={formData.phoneNumber}
                onChange={e => handleChange('phoneNumber', sanitizeDigits(e.target.value, 10))}
                placeholder="10-digit Phone Number" 
                maxLength={10}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Owner Aadhar Number</label>
              <input 
                type="text" 
                value={formData.aadharNumber}
                onChange={e => handleChange('aadharNumber', sanitizeDigits(e.target.value, 12))}
                placeholder="12-digit Aadhar Number" 
                maxLength={12}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Owner PAN Number</label>
              <input 
                type="text" 
                value={formData.panNumber}
                onChange={e => handleChange('panNumber', sanitizePAN(e.target.value))}
                placeholder="10-character PAN (e.g. ABCDE1234F)" 
                maxLength={10}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px] uppercase" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">GSTIN Number</label>
              <input 
                type="text" 
                value={formData.gstin}
                onChange={e => handleChange('gstin', sanitizeGSTIN(e.target.value))}
                placeholder="15-character GSTIN" 
                maxLength={15}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px] uppercase" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Min 6 characters" 
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Documents Upload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FileUploadField label="Owner Aadhar" id="aadhar-upload" />
            <FileUploadField label="Owner PAN" id="pan-upload" />
            <FileUploadField label="Shop Registration Certificate" id="reg-cert-upload" />
            <FileUploadField label="GST Certificate" id="gst-cert-upload" />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link to="/merchant" className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px]">
            Cancel
          </Link>
          <button type="submit" className="px-8 py-3 rounded-full bg-[#1cabb1] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px]">
            Save & Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMerchant;
