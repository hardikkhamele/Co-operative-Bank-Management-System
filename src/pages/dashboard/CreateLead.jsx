import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft,  ChevronRight, Calendar, ChevronDown, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  validatePhone, 
  validatePAN, 
  validateAadhaar, 
  validatePincode, 
  sanitizeDigits, 
  sanitizePAN 
} from '../../utils/validation';

const CreateLead = () => {
  const navigate = useNavigate();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = Get OTP, 2 = Enter OTP, 3 = Confirm Address
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    mobileNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    pinCode: '',
    termsAccepted: false
  });
  const [modalAadhaar, setModalAadhaar] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const handleNext = (e) => {
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

    setModalAadhaar(formData.aadhaarNumber);
    setIsOtpModalOpen(true);
    setOtpStep(1);
  };

  const handleGetOtp = () => {
    const aadharErr = validateAadhaar(modalAadhaar).error;
    if (aadharErr) {
      toast.error(aadharErr);
      return;
    }
    toast.success("OTP sent to Aadhaar linked mobile number.");
    setOtpStep(2);
  };

  const handleVerifyOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      toast.error("Please enter complete 6-digit OTP.");
      return;
    }
    toast.success("Aadhaar verified successfully!");
    setOtpStep(3);
  };

  const handleOtpDigitChange = (val, index) => {
    const clean = sanitizeDigits(val, 1);
    const newOtp = [...otpDigits];
    newOtp[index] = clean;
    setOtpDigits(newOtp);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <div className="flex items-center gap-3 mb-2">
            <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            type="button"
          >
            <ArrowLeft size={16} /> Back
          </button>
            <h1 className="text-xl font-bold text-[#225091] m-0">Create Lead</h1>
          </div>
        <div className="flex items-center text-sm text-gray-500 pl-[40px]">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Lead Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/leads" className="hover:text-gray-700">Leads</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#225091]">Create Lead</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleNext}>
          {/* Basic Information */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name (As Per PAN Card) *</label>
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth *</label>
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
                  placeholder="10-digit mobile number" 
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: sanitizeDigits(e.target.value, 10) })}
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
                  placeholder="e.g. ABCDE1234F" 
                  maxLength={10}
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: sanitizePAN(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm uppercase" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Upload Image (jpg, jpeg, png, pdf)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Number *</label>
                <input 
                  type="tel" 
                  placeholder="12-digit Aadhaar number" 
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: sanitizeDigits(e.target.value, 12) })}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Upload Image (jpg, jpeg, png, pdf)</span>
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
                  placeholder="6-digit PIN code" 
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: sanitizeDigits(e.target.value, 6) })}
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
              Next
            </button>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center p-4 bg-[#225091] text-white">
              <button onClick={() => setIsOtpModalOpen(false)} className="mr-3 text-white hover:text-gray-200 transition-colors">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h2 className="text-lg font-semibold">Add customer</h2>
            </div>
            
            <div className="p-6">
              {otpStep === 1 && (
                <>
                  <p className="text-sm text-gray-600 mb-6">
                    Verify your identity through Aadhar-based OTP generated by UIDAI and complete the application
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Enter 12-Digit Aadhaar Number/VID Number*</label>
                    <input 
                      type="tel" 
                      maxLength={12}
                      value={modalAadhaar} 
                      onChange={(e) => setModalAadhaar(sanitizeDigits(e.target.value, 12))}
                      placeholder="12-digit Aadhaar Number" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="bg-[#f4f2ff] p-4 rounded-lg border-l-4 border-[#225091] mb-8">
                    <p className="text-sm text-gray-700 font-medium">
                      An OTP will be sent to the mobile number and Email ID linked to your Aadhaar card.
                    </p>
                  </div>

                  <button 
                    onClick={handleGetOtp}
                    type="button"
                    className="w-full py-3.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors"
                  >
                    Get OTP
                  </button>
                </>
              )}
              
              {otpStep === 2 && (
                <>
                  <p className="text-sm text-gray-600 mb-6">
                    Verify your identity through Aadhar-based OTP generated by UIDAI and complete the application
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-2">Verify Aadhaar With OTP</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Enter The OTP Sent To The Mobile Number linked To Your Aadhaar
                    </p>
                    
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Enter OTP</h4>
                    <div className="flex gap-2 justify-between mb-2">
                      {otpDigits.map((digit, i) => (
                        <input 
                          key={i} 
                          type="tel" 
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(e.target.value, i)}
                          className="w-12 h-12 text-center border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:border-[#225091] focus:ring-1 focus:ring-[#225091]" 
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">Attempts left: 3</span>
                      <div className="text-right">
                        <button type="button" onClick={handleGetOtp} className="text-xs font-semibold text-gray-600 hover:text-gray-800">Resend OTP</button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleVerifyOtp}
                    type="button"
                    className="w-full py-3.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors mt-6"
                  >
                    Verify
                  </button>
                </>
              )}

              {otpStep === 3 && (
                <>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    This address is already available in our records. Please confirm or update it to proceed.
                  </p>
                  
                  <div className="border border-gray-200 rounded-xl p-5 mb-8 bg-white shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input type="radio" className="w-5 h-5 text-[#225091] border-[#225091] focus:ring-[#225091] accent-[#225091]" defaultChecked />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-[15px] mb-3">Yes, this is current residential address</h4>
                        <div className="text-[15px] text-gray-800 leading-relaxed">
                          Amit Dutta<br/>
                          01/01/1996<br/>
                          Pimpri Chinchwad, Pune, 411061
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to="/leads"
                    className="block text-center w-full py-3.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors"
                  >
                    ADD Customer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLead;
