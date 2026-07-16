import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, ChevronDown, Upload, X } from 'lucide-react';

const CreateLead = () => {
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = Get OTP, 2 = Enter OTP
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    setIsOtpModalOpen(true);
    setOtpStep(1);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Create Lead</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Lead Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/leads" className="hover:text-gray-700">Leads</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Create Lead</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleNext}>
          {/* Basic Information */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name (As Per PAN Card)</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm" required>
                    <option value="" disabled selected>Select</option>
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
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Mobile Number</label>
                <input type="tel" placeholder="Enter mobile number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Identity Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Number</label>
                <input type="text" placeholder="Enter PAN Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Card Image</label>
                <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Upload Image (jpg, jpeg, png, pdf)</span>
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Current Residential PIN Code</label>
                <input type="text" placeholder="Enter 6-digit current residential PIN code" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" required />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]" required />
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
              Next
            </button>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center p-4 bg-[#5a5ce5] text-white">
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
                      type="text" 
                      value={aadhaarNumber} 
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="Type" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="bg-[#f4f2ff] p-4 rounded-lg border-l-4 border-[#1cabb1] mb-8">
                    <p className="text-sm text-gray-700 font-medium">
                      An OTP will be sent to the mobile number and Email ID linked to your Aadhaar card.
                    </p>
                  </div>

                  <button 
                    onClick={() => setOtpStep(2)}
                    className="w-full py-3.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors"
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
                      Enter The OTP Sent To The Mobile Number Xxxxxx210 And Email ID Linked To Your Aadhaar
                    </p>
                    
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Enter OTP</h4>
                    <div className="flex gap-2 justify-between mb-2">
                      {[...Array(6)].map((_, i) => (
                        <input 
                          key={i} 
                          type="text" 
                          maxLength="1" 
                          className="w-12 h-12 text-center border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:border-[#1cabb1] focus:ring-1 focus:ring-[#1cabb1]" 
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">2 attempts left</span>
                      <div className="text-right">
                        <button className="text-xs font-semibold text-gray-600 hover:text-gray-800">Resend OTP</button>
                        <div className="text-[11px] text-gray-400">In 10:00 secs</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setOtpStep(3)}
                    className="w-full py-3.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors mt-6"
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
                        <input type="radio" className="w-5 h-5 text-[#1cabb1] border-[#1cabb1] focus:ring-[#1cabb1] accent-[#1cabb1]" defaultChecked />
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
                    className="block text-center w-full py-3.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors"
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
