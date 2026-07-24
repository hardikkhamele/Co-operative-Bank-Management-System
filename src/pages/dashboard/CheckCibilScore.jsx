import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, X, Download } from 'lucide-react';

const CheckCibilScore = () => {
  const [step, setStep] = useState('form'); // 'form' or 'result'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    mobileNumber: '',
    panNumber: '',
    email: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConsentChecked) return;
    // Mock API call or transition
    setStep('result');
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      mobileNumber: '',
      panNumber: '',
      email: '',
    });
    setIsConsentChecked(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {step === 'form' ? 'Check CIBIL Score' : 'CIBIL Score'}
        </h1>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/dashboard" className="hover:text-[#1cabb1] transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <span>Verification</span>
          <span>&gt;</span>
          <span className={step === 'form' ? "text-[#1cabb1] font-medium" : ""}>Check CIBIL Score</span>
          {step === 'result' && (
            <>
              <span>&gt;</span>
              <span className="text-[#1cabb1] font-medium">CIBIL Score</span>
            </>
          )}
        </div>
      </div>

      {step === 'form' ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Banner */}
          <div className="bg-[#1b58a6] rounded-xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md z-10">
              <ShieldCheck size={32} className="text-[#1cabb1]" />
            </div>
            <h2 className="text-2xl font-bold text-white z-10 tracking-wide">Credit Report</h2>
            {/* Background design elements */}
            <div className="absolute right-0 top-0 w-64 h-full bg-white/10 rounded-l-full transform translate-x-1/3"></div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Know Your CIBIL Score</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-semibold text-gray-700 block">Date Of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 appearance-none text-gray-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">PAN Card Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="Enter PAN number"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 uppercase"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#1cabb1] border-gray-300 rounded focus:ring-[#1cabb1] cursor-pointer"
                  required
                />
                <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  I hereby intend to receive my CIBIL score and credit information report from TransUnion CIBIL Limited ("TUCIBIL"). I confirm that I have read, understood and hereby agree to the{' '}
                  <button type="button" onClick={() => setIsModalOpen(true)} className="text-[#1b58a6] font-semibold hover:underline decoration-2 underline-offset-2">
                    Terms and Conditions of TUCIBIL
                  </button>
                  . I further confirm that the above mentioned details/information provided by me are true and correct.
                </label>
              </div>

              <div className="bg-[#eaf8e5] text-[#4caf50] px-4 py-3 rounded-lg text-sm font-medium mb-8 border border-[#c3ebc4]">
                Note: Mobile number must be linked with PAN Card.
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!isConsentChecked}
                  className="px-8 py-2.5 rounded-lg bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1cabb1]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center max-w-4xl mx-auto w-full relative overflow-hidden">
          {/* Confetti / background flair */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#1cabb1]/5 to-transparent"></div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-12 z-10">CIBIL Score</h2>
          
          {/* Gauge Meter implementation using SVG */}
          <div className="relative w-80 h-40 mb-10 z-10">
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              {/* Red Segment (300-500) */}
              <path d="M 20 90 A 70 70 0 0 1 55 30" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
              {/* Orange Segment (500-650) */}
              <path d="M 55 30 A 70 70 0 0 1 100 20" fill="none" stroke="#f97316" strokeWidth="16" />
              {/* Yellow Segment (650-750) */}
              <path d="M 100 20 A 70 70 0 0 1 145 30" fill="none" stroke="#eab308" strokeWidth="16" />
              {/* Green Segment (750-900) */}
              <path d="M 145 30 A 70 70 0 0 1 180 90" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" />
              
              {/* Needle pivot */}
              <circle cx="100" cy="90" r="8" fill="#374151" className="shadow-lg" />
              
              {/* Needle line (pointing to ~780 score, angle roughly 45 degrees from right) */}
              <g transform="rotate(50 100 90)">
                <line x1="100" y1="90" x2="100" y2="35" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
              </g>
            </svg>
            <div className="absolute bottom-0 left-0 -translate-x-1/2 text-sm font-bold text-gray-500">300</div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 text-sm font-bold text-gray-500">900</div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center w-72 mb-10 transform -translate-y-4 z-20">
            <span className="text-gray-500 font-medium mb-2">Your Score</span>
            <span className="text-6xl font-extrabold text-[#22c55e] mb-2 tracking-tight">780</span>
            <span className="text-[#22c55e] font-semibold bg-[#22c55e]/10 px-4 py-1 rounded-full text-sm">Excellent</span>
          </div>

          <button className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#1cabb1] text-white font-bold hover:bg-[#159a9f] transition-all shadow-lg shadow-[#1cabb1]/30 transform hover:-translate-y-0.5 active:scale-95 z-10">
            <Download size={20} />
            Download Report
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">CIBIL Terms & Conditions</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 leading-relaxed custom-scrollbar">
              <p className="mb-4">
                To,<br/>
                TransUnion CIBIL Limited<br/>
                (Formerly known as Credit Information Bureau (India) Limited)<br/>
                19th Floor, One World Centre, Tower 2A & 2B,<br/>
                841 Senapati Bapat Marg,<br/>
                Lower Parel,<br/>
                Mumbai - 400 013
              </p>
              <p className="font-semibold mb-4 text-gray-800">Sub: Grant of Consent</p>
              <p className="mb-4">Dear Sirs,</p>
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  In connection with submission of the application for my credit information ("Consumer Credit Information") and other related credit products (Credit Products) offered by TUCIBIL through [Insert Name of the Company] (referred to as the "Company") and delivery of the Consumer Credit Information and Credit Products to the Company, I hereby acknowledge and agree to the following:
                </li>
                <li>
                  The Company is my lawfully appointed agent and he / it has agreed to be my agent for the purposes, including, without limitation, to receive the Consumer Credit Information and Credit Products from TUCIBIL on my behalf.
                </li>
              </ol>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-center bg-gray-50">
              <button
                onClick={() => {
                  setIsConsentChecked(true);
                  setIsModalOpen(false);
                }}
                className="px-10 py-2.5 rounded-lg bg-[#1cabb1] text-white font-bold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1cabb1]/20 transform active:scale-95"
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCibilScore;
