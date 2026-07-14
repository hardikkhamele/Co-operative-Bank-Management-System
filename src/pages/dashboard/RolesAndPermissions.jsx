import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, Eye, Edit, Trash2, ChevronLeft, X, ChevronDown } from 'lucide-react';

const RolesAndPermissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const rolesData = [
    { id: 1, role: 'Regional Manager', category: 'Manager', totalPermissions: 50 },
    { id: 2, role: 'Branch Manager', category: 'Manager', totalPermissions: 45 },
    { id: 3, role: 'Collection Manager', category: 'Manager', totalPermissions: 40 },
    { id: 4, role: 'Sales Executive', category: 'Employee', totalPermissions: 36 },
    { id: 5, role: 'Tele-caller', category: 'Employee', totalPermissions: 20 },
    { id: 6, role: 'Operations Executive', category: 'Employee', totalPermissions: 21 },
    { id: 7, role: 'Collection Agent', category: 'Employee', totalPermissions: 34 },
    { id: 8, role: 'Disbursal Officer', category: 'Employee', totalPermissions: 22 },
  ];

  const filteredData = rolesData.filter(row => {
    const matchesSearch = row.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(row.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4285F4] mb-2">Roles</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1cabb1]">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Roles & Permissions</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Roles & Permissions</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors relative"
            >
              <SlidersHorizontal size={18} />
              {selectedCategories.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#5a5ce5] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </button>

            {/* Filter Popup */}
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-5 z-20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <button 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 bg-white"
                  >
                    <span>Category</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-md py-2 z-30">
                      {['Manager', 'Employee'].map(cat => (
                        <label key={cat} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <div className="relative flex items-center mr-3">
                            <input 
                              type="checkbox" 
                              className="peer appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5a5ce5] checked:border-[#5a5ce5] transition-colors cursor-pointer"
                              checked={selectedCategories.includes(cat)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedCategories([...selectedCategories, cat]);
                                else setSelectedCategories(selectedCategories.filter(c => c !== cat));
                              }}
                            />
                            <svg className="absolute inset-0 w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700">{cat}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setSelectedCategories([]); setIsCategoryDropdownOpen(false); }}
                    className="flex-1 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 text-sm font-medium transition-colors"
                  >
                    Reset Filter
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white text-sm font-medium transition-colors"
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Link 
          to="/roles-permissions/create"
          className="bg-[#1cabb1] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm"
        >
          + Create Roles
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50/50 text-gray-700 text-sm font-semibold border-b border-gray-100">
              <th className="py-4 px-6 text-center w-20">Sr.No.</th>
              <th className="py-4 px-6">Roles</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">Total Permissions</th>
              <th className="py-4 px-6 text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm text-gray-600">
                <td className="py-4 px-6 text-center">{index + 1}</td>
                <td className="py-4 px-6 font-medium text-gray-800">{row.role}</td>
                <td className="py-4 px-6">{row.category}</td>
                <td className="py-4 px-6">{row.totalPermissions}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-blue-500 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
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
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of {filteredData.length} Entries</div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white border border-[#1cabb1]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] hover:bg-[#1cabb1] hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesAndPermissions;
