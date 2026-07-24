import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Eye, Printer, Download } from 'lucide-react';

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
          <div className="bg-[#fcfdff] border border-gray-100 rounded-xl p-6 mb-8">
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

              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm">
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Results Area */}
          {hasSearched && (
             <div className="border border-gray-200 rounded-xl p-6 flex flex-col max-w-sm animate-in fade-in duration-300">
                <div className="flex justify-center mb-6 pt-4">
                  <FileText className="w-20 h-20 text-[#ef3b3a]" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between gap-3">
                   <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-4 py-2 rounded-full text-[13px] font-semibold transition-colors">
                     <Eye size={16} /> View
                   </button>
                   <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-4 py-2 rounded-full text-[13px] font-semibold transition-colors">
                     <Printer size={16} /> Print
                   </button>
                   <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-4 py-2 rounded-full text-[13px] font-semibold transition-colors">
                     <Download size={16} /> Download
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
