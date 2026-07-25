import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Download, ChevronLeft, Eye, SlidersHorizontal, X } from 'lucide-react';

const KPAReport = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const tableData = [
    { id: 1, name: 'Clark Kent', designation: 'Branch Manager', branch: 'Mumbai Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 2, name: 'Tony Stark', designation: 'Collection Executive', branch: 'Mumbai Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 3, name: 'Bruce Wayne', designation: 'Assistant Branch Manager', branch: 'Jaipur Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 4, name: 'Barry Allen', designation: 'Loan Executive', branch: 'Nagpur Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 5, name: 'Steve Rogers', designation: 'Assistant Branch Manager', branch: 'Delhi Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 6, name: 'Clinton Barton', designation: 'Loan Executive', branch: 'Nagpur Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 7, name: 'Scott Lang', designation: 'Collection Executive', branch: 'Delhi Branch', phone: '98765 43210', email: 'example@gmail.com' },
    { id: 8, name: 'Peter Parker', designation: 'Branch Manager', branch: 'Delhi Branch', phone: '98765 43210', email: 'example@gmail.com' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">KPA Report</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1b58a6]">KPA Report</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#1cabb1] bg-gray-50/50"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="relative w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm shrink-0 bg-white"
            >
              <SlidersHorizontal size={20} />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1b58a6] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                2
              </span>
            </button>
          </div>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm">
            <Download size={18} /> Export Report
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fb]">
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap w-20">Sr.No.</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Employee Name</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Designation</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Branch</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Phone Number</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Email</th>
                <th className="py-4 px-6 text-center text-[13px] font-bold text-gray-700 whitespace-nowrap w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-gray-50 hover:bg-teal-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className="py-4 px-6 text-[14px] text-gray-600 font-medium">{row.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                        {row.name.charAt(0)}
                      </div>
                      <span className="text-[14px] font-semibold text-gray-800 whitespace-nowrap">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[14px] text-gray-600">
                     <span className="max-w-[150px] truncate block">{row.designation}</span>
                  </td>
                  <td className="py-4 px-6 text-[14px] text-gray-600">{row.branch}</td>
                  <td className="py-4 px-6 text-[14px] text-gray-600">{row.phone}</td>
                  <td className="py-4 px-6 text-[14px] text-gray-600">{row.email}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center">
                      <Link to={`/kpa-report/view/${row.id}`} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1cabb1] hover:bg-teal-50 transition-colors">
                        <Eye size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] font-medium text-gray-500">
            Showing 1 to 8 of 50 entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white text-[13px] font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-[13px] font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-[13px] font-bold transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-[13px] font-bold transition-colors">
              4
            </button>
            <span className="text-gray-400 px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-[18px] font-bold text-gray-800">Filter</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-2 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Designation</option>
                  <option value="manager">Manager</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">State/UT</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="delhi">Delhi</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Branch</option>
                  <option value="mumbai">Mumbai Branch</option>
                  <option value="delhi">Delhi Branch</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1]" />
                </div>
                <div className="flex-1">
                  <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1]" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-6 mt-2 flex gap-4">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-3 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 text-[15px] font-bold transition-colors"
              >
                Reset Filter
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-3 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white text-[15px] font-bold transition-colors shadow-sm"
              >
                Set Filter
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KPAReport;
