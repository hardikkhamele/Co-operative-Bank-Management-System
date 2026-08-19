import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, Eye, Edit, Trash2, ChevronLeft, X, ChevronDown, Camera, Mail, Phone, Lock, Map, MapPin, Calendar } from 'lucide-react';

const mockManagers = [
  { id: 1, name: 'Clark Kent', initials: 'CK', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop', hasImage: true, type: 'Regional Manager', region: 'Eastern Region', branch: '—', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 2, name: 'Tony Stark', initials: 'TS', type: 'Branch Manager', region: 'Western Region', branch: 'Mumbai Branch', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 3, name: 'Bruce Wayne', initials: 'BW', type: 'Collection Manager', region: 'Northern Region', branch: 'Mumbai Branch', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 4, name: 'Barry Allen', initials: 'BA', type: 'Regional Manager', region: 'Southern Region', branch: '—', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 5, name: 'Steve Rogers', initials: 'SR', type: 'Branch Manager', region: 'Western Region', branch: 'Delhi Branch', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 6, name: 'Clinton Barton', initials: 'CB', type: 'Collection Manager', region: 'Southern Region', branch: 'Nagpur Branch', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 7, name: 'Scott Lang', initials: 'SL', type: 'Regional Manager', region: 'Eastern Region', branch: '—', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 8, name: 'Peter Parker', initials: 'PP', type: 'Branch Manager', region: 'Northern Region', branch: 'Kolkata Branch', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
];

const MultiSelectDropdown = ({ label, options, selectedValues, onChange }) => {

  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (option) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="relative mb-4">
      <div 
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center cursor-pointer shadow-sm text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedValues.length ? "text-gray-800 font-medium" : "text-gray-500"}>
          {selectedValues.length ? `${label} (${selectedValues.length})` : label}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                checked={selectedValues.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const Managers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const filteredData = mockManagers.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(row.type);
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(row.region);
    const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(row.branch);
    
    return matchesSearch && matchesType && matchesRegion && matchesBranch;
  });

  const handleDeleteClick = (manager) => {
    setManagerToDelete(manager);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Perform delete action here
    setIsDeleteModalOpen(false);
    setManagerToDelete(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Managers</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">User Management</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#1B58A6]">Managers</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm relative"
            >
              <SlidersHorizontal size={18} />
              {(selectedTypes.length > 0 || selectedRegions.length > 0 || selectedBranches.length > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1B58A6] rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white">
                  {selectedTypes.length + selectedRegions.length + selectedBranches.length}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 w-[320px] bg-[#f4f3fb] rounded-2xl shadow-2xl flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 pb-3">
                  <h2 className="text-xl font-bold text-[#1b2559]">Filter</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-5 pt-2 space-y-2">
                  <MultiSelectDropdown 
                    label="Manager Type" 
                    options={['Regional Manager', 'Branch Manager', 'Collection Manager']} 
                    selectedValues={selectedTypes} 
                    onChange={setSelectedTypes} 
                  />
                  <MultiSelectDropdown 
                    label="Region" 
                    options={['Eastern Region', 'Western Region', 'Northern Region', 'Southern Region']} 
                    selectedValues={selectedRegions} 
                    onChange={setSelectedRegions} 
                  />
                  <MultiSelectDropdown 
                    label="Branch" 
                    options={['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch', 'Delhi Branch']} 
                    selectedValues={selectedBranches} 
                    onChange={setSelectedBranches} 
                  />
                </div>
                
                <div className="p-5 pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedTypes([]);
                      setSelectedRegions([]);
                      setSelectedBranches([]);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full border-2 border-[#1D4ED8] text-[#1D4ED8] font-semibold hover:bg-teal-50 transition-colors bg-white text-sm"
                  >
                    Reset Filter
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#1D4ED8] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm"
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link 
          to="/managers/create"
          className="bg-[#1D4ED8] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm shadow-sm"
        >
          + Create Manager
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-indigo-50/50 text-gray-700 text-sm font-semibold border-b border-gray-200">
              <th className="py-4 px-6 text-center w-20">Sr.No.</th>
              <th className="py-4 px-6">Manager Name</th>
              <th className="py-4 px-6">Manager Type</th>
              <th className="py-4 px-6">Region</th>
              <th className="py-4 px-6">Branch</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6 text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((manager, idx) => (
              <tr key={manager.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm text-gray-600">
                <td className="py-4 px-6 text-center">{idx + 1}</td>
                <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${manager.hasImage ? '' : 'bg-[#f4f2ff] text-gray-800 font-bold text-[13px]'}`}>
                    {manager.hasImage ? (
                      <img src={manager.avatar} alt={manager.name} className="w-full h-full object-cover" />
                    ) : (
                      manager.initials
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">{manager.name}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="max-w-[120px] leading-tight">
                    {manager.type}
                  </div>
                </td>
                <td className="py-4 px-6">{manager.region}</td>
                <td className="py-4 px-6">{manager.branch}</td>
                <td className="py-4 px-6">{manager.email}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <Link 
                      to="/managers/view"
                      state={manager}
                      className="text-gray-800 hover:text-blue-500 transition-colors"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link 
                      to="/managers/edit"
                      state={manager}
                      className="text-gray-800 hover:text-blue-500 transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(manager)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 shrink-0">
        <div>Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of 30 Entries</div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1D4ED8] text-white border border-[#1D4ED8] shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors shadow-sm">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors shadow-sm">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[#ff3d67]">
              <Trash2 size={24} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3">Delete</h2>
            
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to delete?<br />
              This action is permanent and cannot be undone.
            </p>

            <div className="flex w-full gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-[#ff3d67] hover:bg-[#e02e55] text-white font-semibold rounded-full shadow-md transition-colors focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Managers;
