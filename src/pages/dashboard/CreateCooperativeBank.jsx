import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadCloud, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { 
  validateEmail, 
  validatePhone, 
  validateIFSC, 
  validateAccountNumber, 
  validatePassword, 
  sanitizeDigits, 
  sanitizeIFSC 
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
        <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#225091] transition-colors">
          <UploadCloud size={24} />
          <span className="text-xs font-medium">Click to upload (PDF/Image)</span>
        </div>
      </div>
    </div>
  );
};

const CreateCooperativeBank = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    authorizedPerson: '',
    email: '',
    alternateEmail: '',
    phoneNumber: '',
    mobileNumber: '',
    password: '',
    accountBankName: '',
    accountNumber: '',
    ifsc: '',
    accountHolderName: ''
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

    const passErr = validatePassword(formData.password, { minLength: 6 }).error;
    if (passErr) {
      toast.error(passErr);
      return;
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

    toast.success("Co-operative Bank created successfully!");
    navigate('/co-operative-bank');
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <PageHeader
        title="Create Co-operative Bank"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Partner Management' },
          { label: 'Co-operative Bank', to: '/co-operative-bank' },
          { label: 'Create' }
        ]}
        showBack={true}
        backUrl="/co-operative-bank"
      />

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
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Authorized Person *</label>
              <input 
                type="text" 
                value={formData.authorizedPerson}
                onChange={e => handleChange('authorizedPerson', e.target.value)}
                placeholder="Enter authorized person name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Enter primary email" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Mail ID (Alternate/Contact)</label>
              <input 
                type="email" 
                value={formData.alternateEmail}
                onChange={e => handleChange('alternateEmail', e.target.value)}
                placeholder="Enter alternate mail ID" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
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
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
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
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
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
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
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
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account number</label>
              <input 
                type="text" 
                value={formData.accountNumber}
                onChange={e => handleChange('accountNumber', sanitizeDigits(e.target.value, 18))}
                placeholder="Enter account number (9-18 digits)" 
                maxLength={18}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">IFSC</label>
              <input 
                type="text" 
                value={formData.ifsc}
                onChange={e => handleChange('ifsc', sanitizeIFSC(e.target.value))}
                placeholder="11-character IFSC (e.g. HDFC0000123)" 
                maxLength={11}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] uppercase" 
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account Holder Name</label>
              <input 
                type="text" 
                value={formData.accountHolderName}
                onChange={e => handleChange('accountHolderName', e.target.value)}
                placeholder="Enter account holder name" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Documents Upload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FileUploadField label="Registration Certificate" id="reg-cert" />
            <FileUploadField label="Company PAN" id="comp-pan" />
            <FileUploadField label="Board Resolution" id="board-res" />
            <FileUploadField label="GST / Declaration" id="gst-decl" />
            <FileUploadField label="Director KYC (Aadhar, PAN etc.)" id="dir-kyc" />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link to="/co-operative-bank" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px]">
            Cancel
          </Link>
          <button type="submit" className="px-8 py-3 rounded-xl bg-[#225091] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] cursor-pointer">
            Save & Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCooperativeBank;
