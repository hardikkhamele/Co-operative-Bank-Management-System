import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Send, Printer, Download } from 'lucide-react';

const LettersAndPayroll = () => {
  const [activeTab, setActiveTab] = useState('Offer Letter');
  const [hasSearched, setHasSearched] = useState(false);

  const tabs = [
    'Offer Letter',
    'Confirmation Letter',
    'Performance Letter',
    'Promotion Letter',
    'Transfer Letter',
    'Salary Slip',
    'Salary Increment',
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Letters & Payroll</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1b58a6]">Letters & Payroll</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Tabs Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 p-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg text-[14px] font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-teal-50 text-[#1cabb1]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">{activeTab}</h2>

          {/* Filters Area */}
          <div className="bg-[#f2fdf5] border border-green-100 rounded-xl p-6 mb-8">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* State/UT */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-700">State/UT</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Select</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="karnataka">Karnataka</option>
                </select>
              </div>

              {/* Branch */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-700">Branch</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Select</option>
                  <option value="mumbai">Mumbai Branch</option>
                  <option value="pune">Pune Branch</option>
                </select>
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-700">Designation</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Select</option>
                  <option value="manager">Manager</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              {/* Employee */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-700">Employee</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Select</option>
                  <option value="emp1">Clark Kent</option>
                  <option value="emp2">Tony Stark</option>
                </select>
              </div>

              {/* Salary Increment current salary display */}
              {activeTab === 'Salary Increment' && (
                <div className="md:col-span-2 flex justify-center mt-2 mb-2">
                  <h3 className="text-[18px] font-bold text-[#1b58a6]">Current Salary: 6,00,000/Year</h3>
                </div>
              )}

              {/* Dynamic Fields based on activeTab */}
              {activeTab === 'Confirmation Letter' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-gray-700">Confirmation Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1]" />
                </div>
              )}

              {activeTab === 'Performance Letter' && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[14px] font-semibold text-gray-700">Write Letter</label>
                  <textarea rows="4" placeholder="Write letter" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#1cabb1] resize-none"></textarea>
                </div>
              )}

              {activeTab === 'Promotion Letter' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Promoted To</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                      <option>Select Designation</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Promotion Date</label>
                    <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1]" />
                  </div>
                </>
              )}

              {activeTab === 'Transfer Letter' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Transfer To</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                      <option>Select Branch</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Transfer Date</label>
                    <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1]" />
                  </div>
                </>
              )}

              {activeTab === 'Salary Slip' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">From Month</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                      <option>Select Month</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">To Month</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                      <option>Select Month</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Salary Increment' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Increment %</label>
                    <input type="number" placeholder="Enter %" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#1cabb1]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">From Month</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                      <option>Select Month</option>
                    </select>
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm">
                  {activeTab === 'Offer Letter' ? 'Search' : 'Generate'}
                </button>
              </div>
            </form>
          </div>

          {/* Results Area */}
          {hasSearched && (
             <div className="border border-gray-200 rounded-xl p-8 flex flex-col gap-8 max-w-[460px] animate-in fade-in duration-300">
                <div className="flex justify-start">
                  <svg width="60" height="76" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M48 16L32 0H8C3.58172 0 0 3.58172 0 8V56C0 60.4183 3.58172 64 8 64H40C44.4183 64 48 60.4183 48 56V16Z" fill="#F42C2C"/>
                    <path d="M48 16H36C33.7909 16 32 14.2091 32 12V0L48 16Z" fill="white"/>
                    <path d="M21.5 45.5C21.5 45.5 17 50.5 13 50.5C9 50.5 7.5 46.5 10 42.5C12.5 38.5 19 37.5 19 37.5C19 37.5 21 30.5 21.5 25.5C22 20.5 22.5 15.5 25 15.5C27.5 15.5 29 18 27.5 22C26 26 23.5 31.5 22 36C22 36 26 37 31 38C36 39 41 39 43.5 44C46 49 38 50 34 50C30 50 27.5 46 26 43C26 43 23 44 21.5 45.5ZM13.5 46.5C15 46.5 17.5 43.5 18.5 41C16 42.5 13.5 44 13.5 46.5ZM25 25.5C25 24 24.5 23 23.5 23.5C22.5 24 22 27 22 27C22.5 26 24.5 26 25 25.5ZM24.5 41C26 40.5 28 40 28 40C27.5 38.5 25.5 38 25.5 38C25 39 25 40.5 24.5 41ZM34.5 47C36.5 47 38.5 45.5 38.5 44C38.5 42.5 34.5 41 31.5 40.5C31.5 40.5 33 47 34.5 47Z" fill="white"/>
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                   <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors">
                     <Send size={18} /> Send
                   </button>
                   <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors">
                     <Printer size={18} /> Print
                   </button>
                   <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors">
                     <Download size={18} /> Download
                   </button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LettersAndPayroll;
