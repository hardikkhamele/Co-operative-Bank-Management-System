import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  validateEmail, 
  validatePhone, 
  validateIFSC, 
  validateAccountNumber, 
  validatePassword, 
  sanitizeDigits, 
  sanitizeIFSC 
} from '../../utils/validation';

const FileUploadField = ({ label, id, initialFile }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-semibold text-gray-800">{label}</label>
      <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-[#1D4ED8] rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer group">
        <input 
          type="file" 
          id={id} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="image/*,.pdf"
        />
        <div className="flex flex-col items-center gap-1 text-[#1D4ED8] transition-colors">
          <CheckCircle2 size={24} className="text-[#32c965]" />
          <span className="text-xs font-medium text-gray-700">{initialFile}</span>
          <span className="text-[10px] text-gray-500">Click to change</span>
        </div>
      </div>
    </div>
  );
};

const EditCooperativeBank = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    bankName: 'Mumbai District Central Co-op Bank',
    authorizedPerson: 'John Doe',
    email: 'contact@mdccb.com',
    alternateEmail: 'support@mdccb.com',
    phoneNumber: '02222610115',
    mobileNumber: '9876543210',
    password: '',
    accountBankName: 'HDFC Bank',
    accountNumber: '50100432890123',
    ifsc: 'HDFC0000123',
    accountHolderName: 'Mumbai District Central Co-op Bank'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.bankName.trim()) {
      toast.error("Please enter bank name");
      return;
    }
    if (!formData.authorizedPerson.trim()) {
      toast.error("Please enter authorized person name");
      return;
    }

    const emailErr = validateEmail(formData.email).error;
    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    if (formData.alternateEmail) {
      const altEmailErr = validateEmail(formData.alternateEmail).error;
      if (altEmailErr) {
        toast.error(`Alternate Email: ${altEmailErr}`);
        return;
      }
    }

    if (formData.phoneNumber) {
      const phoneErr = validatePhone(formData.phoneNumber, { required: false }).error;
      if (phoneErr) {
        toast.error(`Phone Number: ${phoneErr}`);
        return;
      }
    }

    const mobileErr = validatePhone(formData.mobileNumber).error;
    if (mobileErr) {
      toast.error(`Mobile Number: ${mobileErr}`);
      return;
    }

    if (formData.password) {
      const passErr = validatePassword(formData.password, { minLength: 6 }).error;
      if (passErr) {
        toast.error(passErr);
        return;
      }
    }

    if (formData.accountNumber) {
      const accErr = validateAccountNumber(formData.accountNumber).error;
      if (accErr) {
        toast.error(accErr);
        return;
      }
    }

    if (formData.ifsc) {
      const ifscErr = validateIFSC(formData.ifsc).error;
      if (ifscErr) {
        toast.error(ifscErr);
        return;
      }
    }

    toast.success("Co-operative Bank updated successfully!");
    navigate('/co-operative-bank');
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Edit Co-operative Bank</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Partner Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/co-operative-bank" className="hover:text-gray-700">Co-operative Bank</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#1B58A6]">Edit</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">General Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Bank Name *</label>
              <input 
                type="text" 
                value={formData.bankName}
                onChange={e => handleChange('bankName', e.target.value)}
                placeholder="Enter bank name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Authorized Person *</label>
              <input 
                type="text" 
                value={formData.authorizedPerson}
                onChange={e => handleChange('authorizedPerson', e.target.value)}
                placeholder="Enter authorized person name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Enter email" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Mail ID (Alternate/Contact)</label>
              <input 
                type="email" 
                value={formData.alternateEmail}
                onChange={e => handleChange('alternateEmail', e.target.value)}
                placeholder="Enter alternate mail ID" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phoneNumber}
                onChange={e => handleChange('phoneNumber', sanitizeDigits(e.target.value, 10))}
                placeholder="10-digit Phone number" 
                maxLength={10}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Mobile Number *</label>
              <input 
                type="tel" 
                value={formData.mobileNumber}
                onChange={e => handleChange('mobileNumber', sanitizeDigits(e.target.value, 10))}
                placeholder="10-digit Mobile number" 
                maxLength={10}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Change password (leave empty to keep current)" 
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
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

        {/* Bank Details */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Bank Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Bank Name</label>
              <input 
                type="text" 
                value={formData.accountBankName}
                onChange={e => handleChange('accountBankName', e.target.value)}
                placeholder="Enter bank name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account number</label>
              <input 
                type="text" 
                value={formData.accountNumber}
                onChange={e => handleChange('accountNumber', sanitizeDigits(e.target.value, 18))}
                placeholder="Enter account number" 
                maxLength={18}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">IFSC</label>
              <input 
                type="text" 
                value={formData.ifsc}
                onChange={e => handleChange('ifsc', sanitizeIFSC(e.target.value))}
                placeholder="Enter IFSC code" 
                maxLength={11}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px] uppercase" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account Holder Name</label>
              <input 
                type="text" 
                value={formData.accountHolderName}
                onChange={e => handleChange('accountHolderName', e.target.value)}
                placeholder="Enter account holder name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Documents Upload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FileUploadField label="Registration Certificate" id="reg-cert" initialFile="reg_cert_2023.pdf" />
            <FileUploadField label="Company PAN" id="comp-pan" initialFile="pan_card.jpg" />
            <FileUploadField label="Board Resolution" id="board-res" initialFile="board_res.pdf" />
            <FileUploadField label="GST / Declaration" id="gst-decl" initialFile="gst_doc.pdf" />
            <FileUploadField label="Director KYC (Aadhar, PAN etc.)" id="dir-kyc" initialFile="dir_kyc_aadhar.pdf" />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link to="/co-operative-bank" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px]">
            Cancel
          </Link>
          <button type="submit" className="px-8 py-3 rounded-xl bg-[#1D4ED8] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px]">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCooperativeBank;
