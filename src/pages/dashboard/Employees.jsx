import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Eye, Edit, Trash2, X, Camera, SlidersHorizontal, Calendar, Mail, Phone, Lock, Map, MapPin, User } from 'lucide-react';

const mockEmployees = [
  { id: 1, name: 'Clark Kent', initials: 'CK', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', type: 'Sales Executive', region: 'Eastern Region', branch: 'Kolkata Branch', email: 'example@mail.com' },
  { id: 2, name: 'Tony Stark', initials: 'TS', type: 'Tele-caller', region: 'Western Region', branch: 'Mumbai Branch', email: 'example@mail.com' },
  { id: 3, name: 'Bruce Wayne', initials: 'BW', type: 'Credit Analyst', region: 'Northern Region', branch: 'Mumbai Branch', email: 'example@mail.com' },
  { id: 4, name: 'Barry Allen', initials: 'BA', type: 'Field Verification Off...', region: 'Southern Region', branch: 'Nagpur Branch', email: 'example@mail.com' },
  { id: 5, name: 'Steve Rogers', initials: 'SR', type: 'Operations Executive', region: 'Western Region', branch: 'Delhi Branch', email: 'example@mail.com' },
  { id: 6, name: 'Clinton Barton', initials: 'CB', type: 'Disbursal Officer', region: 'Southern Region', branch: 'Nagpur Branch', email: 'example@mail.com' },
  { id: 7, name: 'Scott Lang', initials: 'SL', type: 'Collection Agent', region: 'Eastern Region', branch: 'Delhi Branch', email: 'example@mail.com' },
  { id: 8, name: 'Peter Parker', initials: 'PP', type: 'Customer Support Execut...', region: 'Northern Region', branch: 'Kolkata Branch', email: 'example@mail.com' },
];

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const handleEditClick = (emp) => {
    setEmployeeToEdit(emp);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (emp) => {
    setEmployeeToView(emp);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#1b7ef7] mb-2">Employees</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>User Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b7ef7]">Employees</span>
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

        {/* Right Side: Add Employee Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white py-2.5 px-6 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap w-full md:w-auto"
          >
            +Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr.No.</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Employee Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Employee Type</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Region</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Branch</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockEmployees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#f4f2ff] text-[#5a5ce5] flex items-center justify-center text-xs font-bold">
                          {emp.initials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{emp.type}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{emp.region}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{emp.branch}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{emp.email}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button 
                        onClick={() => handleViewClick(emp)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(emp)}
                        className="text-gray-500 hover:text-[#5a5ce5] transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(emp)}
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

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Add Employee</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-8 pb-4 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4 relative">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#1cabb1] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Avatar Preview" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/3 bg-[#1cabb1] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Gender</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Date Of Birth</label>
                <div className="relative">
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Phone</label>
                <input type="tel" placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Email</label>
                <input type="email" placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Password</label>
                <input type="password" placeholder="Create Password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Manager Type</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="regional">Regional Manager</option>
                    <option value="branch">Branch Manager</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Region</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Branch</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-500 shadow-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="b1">Branch 1</option>
                    <option value="b2">Branch 2</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-4 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="py-2.5 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="py-2.5 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {isViewModalOpen && employeeToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Employee Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-8 pb-8 overflow-y-auto flex-1 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              
              {/* Profile Header */}
              <div className="flex items-center gap-5 mb-6">
                {employeeToView.avatar ? (
                  <img src={employeeToView.avatar} alt={employeeToView.name} className="w-20 h-20 rounded-full border-[3px] border-[#00bcd4] object-cover shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-full border-[3px] border-[#00bcd4] bg-white text-[#5a5ce5] flex items-center justify-center text-2xl font-bold shadow-sm">
                    {employeeToView.initials}
                  </div>
                )}
                <div>
                  <h3 className="text-[22px] font-bold text-gray-800 mb-2">{employeeToView.name}</h3>
                  <div className="inline-block px-4 py-1.5 bg-[#00bcd4] text-white text-xs font-semibold rounded-full shadow-sm">
                    {employeeToView.type}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full mb-6"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <User size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Gender</div>
                    <div className="text-[15px] font-semibold text-gray-800">Female</div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Calendar size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Date Of Birth</div>
                    <div className="text-[15px] font-semibold text-gray-800">28/07/1996</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Phone size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Phone</div>
                    <div className="text-[15px] font-semibold text-gray-800">9876543210</div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Mail size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Email</div>
                    <div className="text-[15px] font-semibold text-gray-800">{employeeToView.email || 'example@mail.com'}</div>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Lock size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Password</div>
                    <div className="text-[15px] font-semibold text-gray-800">Pass@12345</div>
                  </div>
                </div>

                {/* Region */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Map size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Region</div>
                    <div className="text-[15px] font-semibold text-gray-800">{employeeToView.region}</div>
                  </div>
                </div>

                {/* Branch */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <MapPin size={22} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Branch</div>
                    <div className="text-[15px] font-semibold text-gray-800">{employeeToView.branch}</div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full my-6"></div>

              {/* Registered On */}
              <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50 w-full md:w-[calc(50%-8px)]">
                <div className="mt-0.5">
                  <Calendar size={22} className="text-[#00bcd4]" />
                </div>
                <div>
                  <div className="text-[13px] text-gray-500 font-medium mb-1">Registered On</div>
                  <div className="text-[15px] font-semibold text-gray-800">January 1, 2026</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && employeeToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Edit Employee</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-8 pb-4 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4 relative">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#1cabb1] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm text-[#5a5ce5] text-2xl font-bold">
                    {employeeToEdit.avatar ? (
                      <img src={employeeToEdit.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      employeeToEdit.initials
                    )}
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/3 bg-[#1cabb1] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" defaultValue={employeeToEdit.name} placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Gender</label>
                <div className="relative">
                  <select defaultValue="female" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Date Of Birth</label>
                <div className="relative">
                  <input type="text" defaultValue="28/07/1996" placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Phone</label>
                <input type="tel" defaultValue="9876543210" placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Email</label>
                <input type="email" defaultValue={employeeToEdit.email || 'example@mail.com'} placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Password</label>
                <input type="password" defaultValue="Pass@12345" placeholder="Create Password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Manager Type</label>
                <div className="relative">
                  <select defaultValue="regional" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled>Select</option>
                    <option value="regional">Regional Manager</option>
                    <option value="branch">Branch Manager</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Region</label>
                <div className="relative">
                  <select defaultValue="east" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled>Select</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Branch</label>
                <div className="relative">
                  <select defaultValue="b1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
                    <option value="" disabled>Select</option>
                    <option value="b1">Branch 1</option>
                    <option value="b2">Branch 2</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-4 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2.5 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2.5 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
