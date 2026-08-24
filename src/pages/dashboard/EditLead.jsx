import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { 
  validatePhone, 
  validatePAN, 
  validateAadhaar, 
  validatePincode, 
  sanitizeDigits, 
  sanitizePAN 
} from '../../utils/validation';

const EditLead = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const leadData = location.state || {};

  const [formData, setFormData] = useState({
    fullName: leadData.name || 'Amit Dutta',
    gender: leadData.gender || 'male',
    dob: leadData.dob || '1996-01-01',
    mobileNumber: leadData.phone || '9876543210',
    panNumber: leadData.pan || 'ABCDE1234F',
    aadhaarNumber: leadData.aadhaar || '123456789012',
    pinCode: leadData.pinCode || '411061',
    termsAccepted: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select a gender.");
      return;
    }
    if (!formData.dob) {
      toast.error("Date of Birth is required.");
      return;
    }
    const phoneErr = validatePhone(formData.mobileNumber).error;
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }
    const panErr = validatePAN(formData.panNumber).error;
    if (panErr) {
      toast.error(panErr);
      return;
    }
    const aadharErr = validateAadhaar(formData.aadhaarNumber).error;
    if (aadharErr) {
      toast.error(aadharErr);
      return;
    }
    const pinErr = validatePincode(formData.pinCode).error;
    if (pinErr) {
      toast.error(pinErr);
      return;
    }
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    toast.success("Lead updated successfully!");
    navigate('/leads');
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans antialiased pb-16">
      {/* Header Card */}
      <PageHeader
        title="Edit Lead"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Lead Management' },
          { label: 'Leads', to: '/leads' },
          { label: 'Edit Lead' }
        ]}
        showBack={true}
        backUrl="/leads"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSave}>
          {/* Basic Information */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[#225091] mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name (As Per PAN Card) *</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Gender *</label>
                <div className="relative">
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm" 
                    required
                  >
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
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-gray-700" 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Mobile Number *</label>
                <input 
                  type="tel" 
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: sanitizeDigits(e.target.value, 10) })}
                  placeholder="10-digit mobile number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Number *</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: sanitizePAN(e.target.value) })}
                  placeholder="e.g. ABCDE1234F" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm uppercase" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-[#225091] mb-2" />
                  <span className="text-sm font-medium text-gray-800">pan_card_front.jpg</span>
                  <span className="text-xs text-gray-500 mt-1">Click to replace</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Number *</label>
                <input 
                  type="tel" 
                  maxLength={12}
                  placeholder="12-digit Aadhaar number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: sanitizeDigits(e.target.value, 12) })}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-[#225091] mb-2" />
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Current Residential PIN Code *</label>
                <input 
                  type="tel" 
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: sanitizeDigits(e.target.value, 6) })}
                  placeholder="6-digit PIN code" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
                  required 
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#225091] focus:ring-[#225091]" 
                required 
              />
              <label htmlFor="terms" className="text-[15px] text-gray-600 leading-relaxed cursor-pointer">
                I have read, understand, and hereby accept the Advita product application <br/>
                <a href="#" className="text-red-500 hover:underline">Terms and Conditions</a>.
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-4 pt-6 mt-4 border-t border-gray-100">
            <Link
              to="/leads"
              className="px-8 py-2.5 rounded-full border-2 border-[#225091] text-[#225091] bg-white hover:bg-teal-50 font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#225091] hover:bg-[#168f94] text-white font-semibold transition-colors shadow-sm"
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
