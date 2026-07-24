import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, ChevronLeft, X } from 'lucide-react';

const ImportantDates = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const tableData = [
    { id: 1, name: 'Clark Kent', type: 'Branch Manager', state: 'Maharashtra', branch: 'Mumbai Branch', celebration: '2 Years Work Anniversary' },
    { id: 2, name: 'Tony Stark', type: 'Senior Clerk', state: 'Maharashtra', branch: 'Mumbai Branch', celebration: 'Birthday' },
    { id: 3, name: 'Bruce Wayne', type: 'Assistant Branch Manager', state: 'Rajasthan', branch: 'Jaipur Branch', celebration: '2nd Marriage Anniversary' },
    { id: 4, name: 'Barry Allen', type: 'Clerk', state: 'Karnataka', branch: 'Nagpur Branch', celebration: '24th Birthday' },
    { id: 5, name: 'Steve Rogers', type: 'Cashier', state: 'Delhi', branch: 'Delhi Branch', celebration: '36th Birthday' },
    { id: 6, name: 'Clinton Barton', type: 'Peon', state: 'Maharashtra', branch: 'Nagpur Branch', celebration: '3 Years Work Anniversary' },
    { id: 7, name: 'Scott Lang', type: 'Clerk', state: 'Delhi', branch: 'Delhi Branch', celebration: '31st Birthday' },
    { id: 8, name: 'Peter Parker', type: 'Human Resource', state: '--', branch: '--', celebration: '5 Years Work Anniversary' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 relative">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Important Dates</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1b58a6]">Important Dates</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100">
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fb]">
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap w-20">Sr.No.</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Employee Name</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Employee Type</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">State/UT</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Branch</th>
                <th className="py-4 px-6 text-left text-[13px] font-bold text-gray-700 whitespace-nowrap">Celebration</th>
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
                  <td className="py-4 px-6 text-[14px] text-gray-600">{row.type}</td>
                  <td className="py-4 px-6 text-[14px] text-gray-600">{row.state}</td>
                  <td className="py-4 px-6 text-[14px] text-gray-600">{row.branch}</td>
                  <td className="py-4 px-6 text-[14px] text-gray-800 font-medium">{row.celebration}</td>
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-800">Filter</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Celebration</option>
                  <option value="birthday">Birthday</option>
                  <option value="work_anniversary">Work Anniversary</option>
                  <option value="marriage_anniversary">Marriage Anniversary</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">State/UT</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="delhi">Delhi</option>
                  <option value="karnataka">Karnataka</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Branch</option>
                  <option value="mumbai">Mumbai Branch</option>
                  <option value="nagpur">Nagpur Branch</option>
                  <option value="kolkata">Kolkata Branch</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white appearance-none">
                  <option value="">Employee Type</option>
                  <option value="hr">Human Resource</option>
                  <option value="branch_manager">Branch Manager</option>
                  <option value="assistant_branch_manager">Assistant Branch Manager</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 text-[14px] font-semibold transition-colors"
              >
                Reset Filter
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white text-[14px] font-semibold transition-colors shadow-sm"
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

export default ImportantDates;
