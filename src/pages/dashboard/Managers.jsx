import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Eye, Edit, Trash2, X, Camera, Mail, Phone, Lock, Map, MapPin, Calendar, SlidersHorizontal } from 'lucide-react';

const mockManagers = [
  { id: 1, name: 'Clark Kent', initials: 'CK', type: 'Regional Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 2, name: 'Tony Stark', initials: 'TS', type: 'Branch Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 3, name: 'Bruce Wayne', initials: 'BW', type: 'Collection Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 4, name: 'Barry Allen', initials: 'BA', type: 'Regional Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 5, name: 'Steve Rogers', initials: 'SR', type: 'Branch Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 6, name: 'Clinton Barton', initials: 'CB', type: 'Collection Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 7, name: 'Scott Lang', initials: 'SL', type: 'Regional Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
  { id: 8, name: 'Peter Parker', initials: 'PP', type: 'Branch Manager', email: 'example@mail.com', phone: '9876543210', password: 'Password@123' },
];

const Managers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [managerToEdit, setManagerToEdit] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [managerToView, setManagerToView] = useState(null);



  const handleViewClick = (manager) => {
    setManagerToView(manager);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (manager) => {
    setManagerToEdit(manager);
    setIsEditModalOpen(true);
  };

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
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#1b7ef7] mb-2">Managers</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>User Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b7ef7]">Managers</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        {/* Left Side: Search & Filter */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] sm:text-sm bg-white"
              placeholder="Search by service name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-[42px] h-[42px] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] transition-colors"
            >
              <SlidersHorizontal size={20} className="text-gray-500" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 md:left-auto md:right-0 mt-2 w-72 bg-[#f8f9fb] border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-gray-800 text-[15px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Manager Type */}
                  <div className="relative">
                    <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[13px] appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Manager Type</option>
                      <option value="regional">Regional Manager</option>
                      <option value="branch">Branch Manager</option>
                      <option value="collection">Collection Manager</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Region */}
                  <div className="relative">
                    <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[13px] appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Region</option>
                      <option value="north">North</option>
                      <option value="south">South</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Branch */}
                  <div className="relative">
                    <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[13px] appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Branch</option>
                      <option value="b1">Branch 1</option>
                      <option value="b2">Branch 2</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-xs"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-xs shadow-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add Manager Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap w-full md:w-auto"
          >
            +Add Manager
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr.No.</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Manager Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Manager Type</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Phone</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Password</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockManagers.map((manager, idx) => (
                <tr key={manager.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f4f2ff] text-[#5a5ce5] flex items-center justify-center text-xs font-bold">
                        {manager.initials}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{manager.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600 max-w-[100px] leading-tight">
                      {manager.type}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{manager.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{manager.phone}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{manager.password}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button 
                        onClick={() => handleViewClick(manager)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(manager)}
                        className="text-gray-500 hover:text-[#5a5ce5] transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(manager)}
                        className="text-[#ff3d67] hover:text-[#e02e55] transition-colors"
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
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
        <div className="mb-4 sm:mb-0 font-medium">
          Showing 1 to 8 of 30 Entries
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1cabb1] text-white font-medium shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] font-medium hover:bg-teal-50 transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1cabb1] font-medium hover:bg-teal-50 transition-colors">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
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

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Add Manager</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-[#1cabb1] overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Avatar Preview" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-[#1cabb1] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
                <input type="email" placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone</label>
                <input type="tel" placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
                <input type="password" placeholder="Create Password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Manager Type</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="regional">Regional Manager</option>
                    <option value="branch">Branch Manager</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Region</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Branch</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="b1">Branch 1</option>
                    <option value="b2">Branch 2</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-[#f4f3fb] border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="py-2 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="py-2 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-sm shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      {isEditModalOpen && managerToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Edit Manager</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-[#1cabb1] overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
                    <div className="w-full h-full bg-[#f4f2ff] text-[#5a5ce5] flex items-center justify-center text-3xl font-bold">
                      {managerToEdit.initials}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-[#1cabb1] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" defaultValue={managerToEdit.name} placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
                <input type="email" defaultValue={managerToEdit.email} placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone</label>
                <input type="tel" defaultValue={managerToEdit.phone} placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
                <input type="password" defaultValue={managerToEdit.password} placeholder="Create Password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Manager Type</label>
                <div className="relative">
                  <select defaultValue={managerToEdit.type === 'Regional Manager' ? 'regional' : managerToEdit.type === 'Branch Manager' ? 'branch' : ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled>Select</option>
                    <option value="regional">Regional Manager</option>
                    <option value="branch">Branch Manager</option>
                    <option value="collection">Collection Manager</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Region</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Branch</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="b1">Branch 1</option>
                    <option value="b2">Branch 2</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-[#f4f3fb] border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-sm shadow-sm"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Manager Modal */}
      {isViewModalOpen && managerToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-8 pb-4 bg-[#f4f3fb]">
              <h2 className="text-2xl font-bold text-[#1b2559]">Manager Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={28} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-8 pt-4 overflow-y-auto flex-1 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {/* Profile Info */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-[84px] h-[84px] rounded-full border-[3px] border-[#00bcd4] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                  <div className="w-full h-full bg-[#f4f2ff] text-[#5a5ce5] flex items-center justify-center text-3xl font-bold">
                    {managerToView.initials}
                  </div>
                </div>
                <div>
                  <h3 className="text-[22px] font-semibold text-gray-900 mb-2">{managerToView.name}</h3>
                  <span className="inline-block px-4 py-1.5 bg-[#00bcd4] text-white text-[13px] font-medium rounded-full">
                    {managerToView.type}
                  </span>
                </div>
              </div>

              <hr className="border-gray-200 mb-8" />

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {/* Email */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Mail size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800 text-[15px]">{managerToView.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Phone size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-800 text-[15px]">{managerToView.phone}</p>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Lock size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Password</p>
                    <p className="font-semibold text-gray-800 text-[15px]">{managerToView.password}</p>
                  </div>
                </div>

                {/* Region */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Map size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Region</p>
                    <p className="font-semibold text-gray-800 text-[15px]">Eastern Region</p>
                  </div>
                </div>

                {/* Branch */}
                {managerToView.type !== 'Regional Manager' && (
                  <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                    <div className="mt-0.5">
                      <MapPin size={22} className="text-[#00bcd4]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Branch</p>
                      <p className="font-semibold text-gray-800 text-[15px]">Mumbai</p>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-200 mb-8" />

              {/* Registered On */}
              <div className="w-full md:w-1/2 pr-0 md:pr-2.5">
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Calendar size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Registered On</p>
                    <p className="font-semibold text-gray-800 text-[15px]">January 1, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
