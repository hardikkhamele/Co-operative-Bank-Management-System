import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ChoosePaymentMethod = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState('UPI');
  const [selectedUpi, setSelectedUpi] = useState('PhonePe');

  // Hardcoded for demo, matching the mockup
  const emiPrice = 1000;
  const verificationPrice = 22000;
  const totalAmount = 23000;
  const cgst = 4700;
  const sgst = 4700;
  const totalPayable = 32400;

  const handleProceed = () => {
    navigate('/cards-credit/payment/success');
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">Choose Payment Method</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to="/cards-credit" className="hover:text-[#1b2559] transition-colors">EMI Cards & Verification Credits</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to="/cards-credit" className="hover:text-[#1b2559] transition-colors">Cards & Credit</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Choose Payment Method</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side - Price Summary */}
        <div className="w-full md:w-[400px] bg-[#ebfcf0] rounded-2xl p-6 border border-[#c1f5d6] shadow-sm flex-shrink-0">
          <h3 className="text-xl font-bold text-[#1b2559] mb-6">Price</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-[15px]">
              <span className="text-gray-600 font-medium">EMI Card (100 Qty.)</span>
              <span className="font-semibold text-gray-800">₹{emiPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-gray-600 font-medium">Verification Credit (200 Qty.)</span>
              <span className="font-semibold text-gray-800">₹{verificationPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-[15px] pt-2 border-t border-[#c1f5d6]/50">
              <span className="text-gray-600 font-medium">Total Amount</span>
              <span className="font-semibold text-gray-800">₹{totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-[15px]">
              <span className="text-gray-600 font-medium">CGST</span>
              <span className="font-semibold text-gray-800">+ ₹{cgst.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-[15px] pb-4 border-b border-[#c1f5d6]/50">
              <span className="text-gray-600 font-medium">SGST</span>
              <span className="font-semibold text-gray-800">+ ₹{sgst.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between pt-2">
              <span className="font-bold text-gray-800 text-[16px]">Total Payable Amount</span>
              <span className="font-bold text-[#1b2559] text-xl">₹{totalPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Methods */}
        <div className="flex-1 w-full max-w-[600px]">
          <h3 className="text-xl font-bold text-[#1b2559] mb-6">Make Payment</h3>
          
          <div className="space-y-4">
            {/* Credit / Debit / ATM Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'Card' ? null : 'Card')}
                className="w-full flex items-center justify-between p-5 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">CARD</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-[15px]">Credit / Debit / ATM Card</span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${expandedSection === 'Card' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* UPI */}
            <div className={`bg-white rounded-xl border transition-colors shadow-sm overflow-hidden ${expandedSection === 'UPI' ? 'border-[#1b84ff] bg-[#f8fbff]' : 'border-gray-200'}`}>
              <button 
                onClick={() => setExpandedSection(expandedSection === 'UPI' ? null : 'UPI')}
                className="w-full flex items-center justify-between p-5 focus:outline-none bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">UPI</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-[15px]">UPI</span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${expandedSection === 'UPI' ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSection === 'UPI' && (
                <div className="p-5 pt-0 mt-2 space-y-4">
                  {/* PhonePe */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="upi_method"
                        checked={selectedUpi === 'PhonePe'}
                        onChange={() => setSelectedUpi('PhonePe')}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 appearance-none checked:border-[#1b84ff] transition-colors"
                      />
                      {selectedUpi === 'PhonePe' && <div className="absolute w-2.5 h-2.5 bg-[#1b84ff] rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">पे</div>
                      <span className="text-[15px] font-medium text-gray-700">PhonePe</span>
                    </div>
                  </label>

                  {/* Gpay */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="upi_method"
                        checked={selectedUpi === 'Gpay'}
                        onChange={() => setSelectedUpi('Gpay')}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 appearance-none checked:border-[#1b84ff] transition-colors"
                      />
                      {selectedUpi === 'Gpay' && <div className="absolute w-2.5 h-2.5 bg-[#1b84ff] rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-[12px]">G</div>
                      <span className="text-[15px] font-medium text-gray-700">Gpay</span>
                    </div>
                  </label>

                  {/* Paytm */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="upi_method"
                        checked={selectedUpi === 'Paytm'}
                        onChange={() => setSelectedUpi('Paytm')}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 appearance-none checked:border-[#1b84ff] transition-colors"
                      />
                      {selectedUpi === 'Paytm' && <div className="absolute w-2.5 h-2.5 bg-[#1b84ff] rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#002970] text-white flex items-center justify-center text-[8px] font-bold">Paytm</div>
                      <span className="text-[15px] font-medium text-gray-700">Paytm</span>
                    </div>
                  </label>

                  {/* Other UPI ID */}
                  <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="upi_method"
                        checked={selectedUpi === 'Other'}
                        onChange={() => setSelectedUpi('Other')}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 appearance-none checked:border-[#1b84ff] transition-colors"
                      />
                      {selectedUpi === 'Other' && <div className="absolute w-2.5 h-2.5 bg-[#1b84ff] rounded-full"></div>}
                    </div>
                    <span className="text-[15px] font-medium text-gray-700">Other UPI ID</span>
                  </label>
                  
                  {selectedUpi === 'Other' && (
                    <div className="ml-8 pr-4">
                      <input 
                        type="text" 
                        placeholder="Enter UPI ID"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b84ff]/20 focus:border-[#1b84ff] bg-white text-sm"
                      />
                    </div>
                  )}

                  {/* QR Code Option */}
                  <div className="ml-8 mt-2">
                    <button className="text-[14px] text-gray-500 font-medium hover:text-gray-800 transition-colors border border-gray-300 px-4 py-2 rounded-lg bg-white">
                      Scan QR ID
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Net Banking */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'NetBanking' ? null : 'NetBanking')}
                className="w-full flex items-center justify-between p-5 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">NET</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-[15px]">Net Banking</span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${expandedSection === 'NetBanking' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button 
              onClick={() => navigate('/cards-credit')}
              className="px-8 py-3 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-[15px] bg-white"
            >
              Cancel
            </button>
            <button 
              onClick={handleProceed}
              className="px-8 py-3 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-md text-[15px]"
            >
              Proceed to Pay ₹{totalPayable.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePaymentMethod;
