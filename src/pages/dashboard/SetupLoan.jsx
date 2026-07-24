import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SetupLoan = () => {
  const [showEmis, setShowEmis] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState(null);

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
        <div className="w-full md:w-1/3 shrink-0">
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
                <h4 className="text-gray-800 font-bold mb-4 text-[15px]">Select EMI Plan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setSelectedEmi(3)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedEmi === 3 ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 bg-white hover:border-[#1cabb1] hover:bg-teal-50/50'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">3 Months</span>
                      <span className="text-sm font-semibold text-[#1cabb1]">₹26,666/mo</span>
                    </div>
                    <div className="text-[13px] text-gray-500">Interest: 0% • Total: ₹80,000</div>
                  </div>
                  
                  {/* Option 2 */}
                  <div 
                    onClick={() => setSelectedEmi(6)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedEmi === 6 ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 bg-white hover:border-[#1cabb1] hover:bg-teal-50/50'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">6 Months</span>
                      <span className="text-sm font-semibold text-[#1cabb1]">₹13,583/mo</span>
                    </div>
                    <div className="text-[13px] text-gray-500">Interest: 1.5% • Total: ₹81,500</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setSelectedEmi(9)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedEmi === 9 ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 bg-white hover:border-[#1cabb1] hover:bg-teal-50/50'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">9 Months</span>
                      <span className="text-sm font-semibold text-[#1cabb1]">₹9,222/mo</span>
                    </div>
                    <div className="text-[13px] text-gray-500">Interest: 1.5% • Total: ₹83,000</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setSelectedEmi(12)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedEmi === 12 ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 bg-white hover:border-[#1cabb1] hover:bg-teal-50/50'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">12 Months</span>
                      <span className="text-sm font-semibold text-[#1cabb1]">₹7,083/mo</span>
                    </div>
                    <div className="text-[13px] text-gray-500">Interest: 1.5% • Total: ₹85,000</div>
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
          Submit & Setup Loan
        </button>
      </div>

    </div>
  );
};

export default SetupLoan;
