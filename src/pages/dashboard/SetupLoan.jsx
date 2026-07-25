import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, UploadCloud } from 'lucide-react';

const SetupLoan = () => {
  const [showEmis, setShowEmis] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState(6); // Default 6 months
  const [showFinalAmount, setShowFinalAmount] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const emiOptions = [
    { months: 3, amount: '26,500' },
    { months: 6, amount: '13,722' },
    { months: 9, amount: '9,333' },
    { months: 12, amount: '7,143' },
    { months: 15, amount: '5,843' },
    { months: 18, amount: '5,146' },
    { months: 24, amount: '4,146' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Setup Loan</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>CRM Management</span>
          <ChevronRight size={14} className="mx-1" />
          <Link to="/leads" className="hover:text-gray-800 transition-colors">Leads</Link>
          <ChevronRight size={14} className="mx-1" />
          <Link to="/leads/view" className="hover:text-gray-800 transition-colors">Lead Details</Link>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1b58a6]">Loan Setup</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Side: Product Card */}
        <div className="w-full md:w-1/3 shrink-0 sticky top-6">
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center">
            <div className="w-full h-48 rounded-lg overflow-hidden flex items-center justify-center mb-4 border-2 border-[#1cabb1] p-2 bg-gray-50">
              <img 
                src="https://images.unsplash.com/photo-1603898037225-502283a04e54?q=80&w=300&auto=format&fit=crop" 
                alt="iPhone 17" 
                className="h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="w-full text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Iphone 17</h3>
              <p className="text-sm text-gray-500 mb-1">Black</p>
              <p className="text-sm text-gray-500">256 GB ROM, 1 year warranty</p>
            </div>
          </div>
        </div>

        {/* Right Side: Setup Options */}
        <div className="w-full md:w-2/3">
          <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-8 flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-700">Product Price</label>
            <div className="flex gap-4 items-center">
              <input 
                type="text" 
                value="₹80,000" 
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none"
              />
              <button 
                onClick={() => setShowEmis(!showEmis)}
                className="px-6 py-3 rounded-full border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap"
              >
                {showEmis ? "Hide EMI's" : "See EMI's"}
              </button>
            </div>
            
            {/* EMI Options Display */}
            {showEmis && (
              <div className="mt-4 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="text-[#1b58a6] font-bold mb-4 text-[15px]">EMI Options</h4>
                <div className="flex flex-col gap-3">
                  {emiOptions.map((emi) => (
                    <label key={emi.months} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedEmi === emi.months ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="emi" 
                        className="w-4 h-4 text-green-500 focus:ring-green-500" 
                        checked={selectedEmi === emi.months} 
                        onChange={() => setSelectedEmi(emi.months)} 
                      />
                      <span className="text-[14px] text-gray-700 font-medium">₹{emi.amount}/month ({emi.months} Months)</span>
                    </label>
                  ))}
                </div>
                
                {!showFinalAmount && (
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={() => setShowFinalAmount(true)} 
                      className="bg-[#1b58a6] hover:bg-[#154685] text-white px-8 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Final Amount Section */}
            {showFinalAmount && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-[#1b58a6] rounded border-gray-300 focus:ring-[#1b58a6]" defaultChecked />
                      <span className="text-[14px] font-semibold text-[#1b58a6]">Purchase EMI Card</span>
                    </label>
                    <div className="w-full h-40 rounded-xl overflow-hidden shadow-sm relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-5 text-white flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-6 bg-white/20 rounded-md"></div>
                                <span className="font-bold text-sm">AMN</span>
                             </div>
                             <svg className="w-6 h-6 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
                          </div>
                          <div className="text-xl tracking-[0.2em] font-mono mt-4">1234 1234 1234 3472</div>
                          <div className="flex justify-between text-xs mt-4">
                             <div className="flex flex-col">
                               <span className="opacity-70 text-[10px]">CARD HOLDER</span>
                               <span className="font-medium tracking-wide">Amit Datta</span>
                             </div>
                             <div className="font-bold italic text-lg">VISA</div>
                          </div>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer mt-2">
                      <input type="checkbox" className="w-5 h-5 text-[#1b58a6] rounded border-gray-300 focus:ring-[#1b58a6]" defaultChecked />
                      <span className="text-[14px] font-semibold text-[#1b58a6]">Purchase Insurance</span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[#1b58a6] font-bold text-[15px]">Final Amount</h4>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                       <h5 className="text-[13px] font-bold text-gray-800 mb-1">Loan Details</h5>
                       <div className="flex justify-between text-[13px]"><span className="text-gray-500">Product Price</span><span className="text-gray-700 font-medium">₹80,000</span></div>
                       <div className="flex justify-between text-[13px]"><span className="text-gray-500">EMI Card Charges</span><span className="text-gray-700 font-medium">+₹999</span></div>
                       <div className="flex justify-between text-[13px]"><span className="text-gray-500">Loan Insurance</span><span className="text-gray-700 font-medium">+₹1199</span></div>
                       <div className="flex justify-between text-[13px] font-semibold text-gray-800 border-t border-gray-100 pt-3 mt-1"><span className="text-gray-700">Total Amount</span><span>₹82,198</span></div>
                       <div className="flex justify-between text-[13px] font-semibold text-red-500"><span className="">Down Payment</span><span>-₹16,000</span></div>
                       <div className="flex justify-between text-[13px] font-bold text-gray-800 border-t border-gray-100 pt-3 mt-1"><span className="text-gray-700">Total Loan Amount</span><span>₹66,198</span></div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                       <h5 className="text-[13px] font-bold text-gray-800 mb-1">EMI Info</h5>
                       <div className="flex justify-between text-[13px]"><span className="text-gray-500">Total EMI Amount</span><span className="text-gray-700 font-medium">₹66,198</span></div>
                       <div className="flex justify-between text-[13px]"><span className="text-gray-500">EMI Months</span><span className="text-gray-700 font-medium">{selectedEmi} Months</span></div>
                       <div className="flex justify-between text-[14px] font-bold text-gray-800 border-t border-gray-100 pt-3 mt-1"><span className="text-gray-700">EMI Amount</span><span className="text-[#1b58a6]">₹{emiOptions.find(e => e.months === selectedEmi)?.amount}/Month</span></div>
                    </div>
                  </div>
                </div>

                {!showBankDetails && (
                  <div className="flex justify-end mt-8">
                    <button 
                      onClick={() => setShowBankDetails(true)} 
                      className="bg-[#1b58a6] hover:bg-[#154685] text-white px-8 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bank Details Section */}
            {showBankDetails && (
              <div className="mt-8 pt-8 border-t border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-[#1b58a6] font-bold text-[15px]">Add Bank Account</h4>
                      <p className="text-[12px] text-gray-500 mt-1">Add a bank account for loan repayment.</p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[13px] font-semibold text-gray-700">Bank</label>
                      <select className="w-full px-4 py-2.5 text-[14px] text-gray-700 rounded-lg border border-gray-200 focus:outline-none focus:border-[#1cabb1] bg-white">
                        <option>State Bank Of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-gray-700">Account Number</label>
                      <input type="text" defaultValue="30207849230" className="w-full px-4 py-2.5 text-[14px] text-gray-700 rounded-lg border border-gray-200 focus:outline-none focus:border-[#1cabb1] bg-white" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-gray-700">IFSC</label>
                      <input type="text" defaultValue="SBIN0007234" className="w-full px-4 py-2.5 text-[14px] text-gray-700 rounded-lg border border-gray-200 focus:outline-none focus:border-[#1cabb1] bg-white" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-gray-700">Account Holder</label>
                      <input type="text" defaultValue="Amit Datta" className="w-full px-4 py-2.5 text-[14px] text-gray-700 rounded-lg border border-gray-200 focus:outline-none focus:border-[#1cabb1] bg-white" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[#1b58a6] font-bold text-[15px]">Signature</h4>
                    
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[13px] font-semibold text-gray-700">Upload Signature</label>
                      <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors mt-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <UploadCloud className="w-5 h-5 text-gray-500" />
                        </div>
                        <span className="text-[13px] text-gray-500 font-medium">Upload Image (jpg, png, svg)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <button className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm">
          Submit & Collect Down Payment
        </button>
      </div>

    </div>
  );
};

export default SetupLoan;
