import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockBranches = [
  { id: 1, srNo: 1, name: 'Mumbai Branch', regionName: 'Eastern Region', manager: 'Clark Kent', managerInitials: 'CK', managerBg: 'bg-purple-100 text-purple-600', totalEmployee: 123, avatar: 'https://ui-avatars.com/api/?name=Clark+Kent&background=random' },
  { id: 3, srNo: 3, name: 'Nagpur Branch', regionName: 'Eastern Region', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 145, avatar: '' },
  { id: 5, srNo: 5, name: 'Kolkata Branch', regionName: 'Eastern Region', manager: 'Steve Rogers', managerInitials: 'SR', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 181, avatar: '' },
  { id: 7, srNo: 7, name: 'Delhi Branch', regionName: 'Southern Region', manager: 'Scott Lang', managerInitials: 'SL', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 153, avatar: '' },
  { id: 8, srNo: 8, name: 'Chennai Branch', regionName: 'Central Region', manager: 'Peter Parker', managerInitials: 'PP', managerBg: 'bg-gray-200 text-gray-700', totalEmployee: 174, avatar: '' },
];

const Branch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b7ef7] mb-2">Branch</h1>
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Region & Branch Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#5a5ce5]">Branch</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative">
            <SlidersHorizontal size={18} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#5a5ce5] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">2</span>
          </button>
        </div>
        <button className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-sm flex-shrink-0">
          + Create Branch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9ff] text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sr.No.</th>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4">Region Name</th>
                <th className="px-6 py-4">Branch Manager</th>
                <th className="px-6 py-4">Total Employee</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{branch.srNo}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{branch.name}</td>
                  <td className="px-6 py-4 text-gray-700">{branch.regionName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {branch.srNo === 1 ? (
                         <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                           <img src={branch.avatar} alt={branch.manager} className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium shrink-0 ${branch.managerBg}`}>
                            {branch.managerInitials}
                         </div>
                      )}
                      <span className="text-gray-700">{branch.manager}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{branch.totalEmployee}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="text-[#ff4c4c] hover:text-red-700 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-800 font-medium">
            Showing 1 to 5 of 5 Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branch;
