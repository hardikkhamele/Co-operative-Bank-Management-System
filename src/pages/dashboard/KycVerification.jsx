import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, CheckCircle2, User, Calendar, Users, MapPin, CreditCard, FileText } from 'lucide-react';

const KycVerification = () => {
  const [step, setStep] = useState('form'); // 'form' or 'result'
  const [activeTab, setActiveTab] = useState('aadhaar'); // 'aadhaar' or 'pan'
  
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
  });
  
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConsentChecked) return;
    setStep('result');
  };

  const handleReset = () => {
    setFormData({
      aadhaarNumber: '',
      panNumber: '',
    });
    setIsConsentChecked(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {step === 'form' ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-xl font-bold text-[#1b58a6] mb-2">KYC Verification</h1>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Link to="/dashboard" className="hover:text-[#1cabb1] transition-colors">Dashboard</Link>
              <span>&gt;</span>
              <span>Verification</span>
              <span>&gt;</span>
              <span className="text-[#1cabb1] font-medium">KYC Verification</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveTab('aadhaar'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'aadhaar'
                  ? 'bg-[#e2e8f0] text-[#1b58a6]'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
              }`}
            >
              <CreditCard size={18} />
              Aadhaar Verification
            </button>
            <button
              onClick={() => { setActiveTab('pan'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'pan'
                  ? 'bg-[#e2e8f0] text-[#1b58a6]'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
              }`}
            >
              <FileText size={18} />
              PAN Verification
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
            <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1b58a6]">
                {activeTab === 'aadhaar' ? 'Aadhaar Verification' : 'PAN Verification'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="max-w-md space-y-2 mb-8">
                <label className="text-sm font-semibold text-gray-700 block">
                  {activeTab === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'}
                </label>
                <input
                  type="text"
                  name={activeTab === 'aadhaar' ? 'aadhaarNumber' : 'panNumber'}
                  value={activeTab === 'aadhaar' ? formData.aadhaarNumber : formData.panNumber}
                  onChange={handleInputChange}
                  placeholder={activeTab === 'aadhaar' ? 'Enter aadhaar number' : 'Enter PAN number'}
                  className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 ${activeTab === 'pan' ? 'uppercase' : ''}`}
                  required
                />
              </div>

              <div className="mb-10 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  className="w-4 h-4 text-[#1cabb1] border-gray-300 rounded focus:ring-[#1cabb1] cursor-pointer"
                  required
                />
                <label htmlFor="consent" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                  I consent to verify my identity using DigiLocker.
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-2.5 rounded-full text-[#1cabb1] font-semibold border border-[#1cabb1] hover:bg-[#1cabb1]/5 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!isConsentChecked}
                  className="px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1cabb1]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                  Verify with DigiLocker
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {/* Result Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-xl font-bold text-[#1b58a6] mb-2">KYC Report</h1>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Link to="/dashboard" className="hover:text-[#1cabb1] transition-colors">Dashboard</Link>
              <span>&gt;</span>
              <span>Verification</span>
              <span>&gt;</span>
              <span className="text-gray-500 hover:text-[#1cabb1] cursor-pointer transition-colors" onClick={() => setStep('form')}>KYC Verification</span>
              <span>&gt;</span>
              <span className="text-[#1cabb1] font-medium">KYC Report</span>
            </div>
          </div>

          {/* Result Content */}
          <div className="bg-[#f8f9fa] rounded-xl border border-gray-100 p-8 flex flex-col gap-8 relative overflow-hidden">
             
            {/* User Profile Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 overflow-hidden border-2 border-indigo-50 shadow-sm relative">
                  <img 
                    src="https://ui-avatars.com/api/?name=Clark+Kent&background=6366f1&color=fff&size=128" 
                    alt="Clark Kent" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Clark Kent</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#22c55e] text-white rounded-full text-sm font-semibold shadow-sm shadow-[#22c55e]/20">
                <CheckCircle2 size={16} />
                {activeTab === 'aadhaar' ? 'Aadhaar Verified' : 'PAN Verified'}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1 text-[#1cabb1]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Gender</p>
                  <p className="text-sm font-semibold text-gray-800">Female</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1 text-[#1cabb1]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Date Of Birth</p>
                  <p className="text-sm font-semibold text-gray-800">28/07/1996</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1 text-[#1cabb1]">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Father Name</p>
                  <p className="text-sm font-semibold text-gray-800">Enrique Kent</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1 text-[#1cabb1]">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Address</p>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    2464 Royal Ln. Mesa, New Jersey 45463
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-bold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1cabb1]/30 transform hover:-translate-y-0.5 active:scale-95">
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycVerification;
