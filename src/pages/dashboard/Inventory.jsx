import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, Edit, Trash2, ChevronDown, X, ChevronLeft, RotateCcw } from 'lucide-react';

const mockInventory = [
  { id: 1, asset: 'Computer', quantity: '1,800' },
  { id: 2, asset: 'Laptop', quantity: '9,000' },
  { id: 3, asset: 'AC', quantity: '500' },
  { id: 4, asset: 'CCTV Camera', quantity: '20,000' },
  { id: 5, asset: 'Chair', quantity: '15,000' },
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
                className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]"
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

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(['Computer', 'Laptop']);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      
      {/* Breadcrumb Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 relative">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Inventory</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="hover:text-gray-800 transition-colors">CRM Management</span>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="text-[#1b58a6]">Inventory</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1cabb1] transition-shadow"
            />
          </div>
          
          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center w-[42px] h-[42px] bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative"
            >
              <SlidersHorizontal size={18} />
              {(selectedTypes.length > 0 || selectedBranches.length > 0) && (
                <span className="absolute -top-2 -right-2 bg-[#1b58a6] text-white text-[10px] font-bold w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-white">
                  {selectedTypes.length + selectedBranches.length}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-[320px] bg-[#f4f3fb] rounded-2xl shadow-2xl flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 pb-3">
                  <h2 className="text-xl font-bold text-[#1b2559]">Filter</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-5 pt-2 space-y-2">
                  <MultiSelectDropdown 
                    label="Asset Type" 
                    options={['Computer', 'Laptop', 'AC', 'CCTV Camera', 'Chair']} 
                    selectedValues={selectedTypes} 
                    onChange={setSelectedTypes} 
                  />
                  <MultiSelectDropdown 
                    label="Branch" 
                    options={['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch']} 
                    selectedValues={selectedBranches} 
                    onChange={setSelectedBranches} 
                  />
                </div>
                
                <div className="p-5 pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedTypes([]);
                      setSelectedBranches([]);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors bg-white text-sm"
                  >
                    Reset Filter
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm"
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="flex items-center justify-center px-6 py-2.5 border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
            Export
          </button>
          <Link 
            to="/inventory/create"
            className="flex items-center justify-center px-6 py-2.5 bg-[#1cabb1] hover:bg-[#159a9f] text-white rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            + Add Inventory
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-[15px] w-24">Sr.No.</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-[15px] w-1/2">Assets</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-[15px]">Quantity</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-[15px] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInventory.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[15px] text-gray-600 pl-8">{index + 1}</td>
                  <td className="py-4 px-6 text-[15px] text-gray-800">{item.asset}</td>
                  <td className="py-4 px-6 text-[15px] text-gray-600">{item.quantity}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}
                        className="text-gray-800 hover:text-black transition-colors" title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[14px] font-semibold text-gray-800">
            Showing 1 to 8 of 30 Entries
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Circular buttons */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white">
                <ChevronLeft size={16} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-bold shadow-sm">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 font-bold transition-colors bg-white">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 font-bold transition-colors bg-white">
                3
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors bg-white">
                <ChevronRight size={16} />
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Edit Inventory Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f4f3fb]">
              <h2 className="text-[17px] font-bold text-gray-800">Edit Inventory Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200/50">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-gray-700">Asset Name *</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem.asset}
                    placeholder="Enter asset name" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1cabb1]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-gray-700">Quantity *</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem.quantity.replace(/,/g, '')}
                    placeholder="Enter quantity" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1cabb1]"
                    required
                  />
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button 
                    type="submit" 
                    className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm"
                  >
                    Update
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
