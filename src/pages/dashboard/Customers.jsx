import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Eye, Edit, Trash2, X, SlidersHorizontal, Calendar, Mail, Phone, MapPin, User, Camera } from 'lucide-react';

const mockCustomers = [];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const handleEditClick = (customer) => {
    setCustomerToEdit(customer);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (customer) => {
    setCustomerToView(customer);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#225091] mb-2">Customers</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Lead Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#225091]">Customers</span>
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
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-[#225091] focus:border-[#225091] sm:text-sm bg-white"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-[42px] h-[42px] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#225091] transition-colors"
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
                  {/* Gender Filter */}
                  <div className="relative">
                    <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[13px] appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-xs"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-xs shadow-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add Customer Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#225091] hover:bg-[#163a6c] text-white py-2.5 px-6 rounded-full text-sm font-semibold transition-colors shadow-xs whitespace-nowrap w-full md:w-auto"
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Customer Name</th>
                <th className="py-3.5 px-5 font-semibold">Gender</th>
                <th className="py-3.5 px-5 font-semibold">Date Of Birth</th>
                <th className="py-3.5 px-5 font-semibold">Phone Number</th>
                <th className="py-3.5 px-5 font-semibold">Email</th>
                <th className="py-3.5 px-5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500 text-sm font-medium">
                    No customers found.
                  </td>
                </tr>
              ) : (
                mockCustomers.map((customer, idx) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt={customer.name} className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-xs" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center text-xs font-bold shadow-xs">
                            {customer.initials}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 capitalize">{customer.gender}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">{customer.dob}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{customer.phone}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">{customer.email}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button 
                          onClick={() => handleViewClick(customer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs"
                          title="View"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button 
                          onClick={() => handleEditClick(customer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs"
                          title="Edit"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(customer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs"
                          title="Delete"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
        <div className="mb-4 sm:mb-0 text-[13px] font-medium text-gray-600">
          Showing 1 to 10 of 30 Entries
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white font-medium shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] font-medium hover:bg-teal-50 transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] font-medium hover:bg-teal-50 transition-colors">
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

      {/* View Customer Modal */}
      {isViewModalOpen && customerToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Customer Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-8 pb-8 overflow-y-auto flex-1 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              
              {/* Profile Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-5">
                  {customerToView.avatar ? (
                    <img src={customerToView.avatar} alt={customerToView.name} className="w-20 h-20 rounded-full border-[3px] border-[#225091] object-cover shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-[3px] border-[#225091] bg-white text-[#225091] flex items-center justify-center text-2xl font-bold shadow-sm">
                      {customerToView.initials}
                    </div>
                  )}
                  <div>
                    <h3 className="text-[22px] font-bold text-gray-800 mb-2">{customerToView.name}</h3>
                    <div className="inline-block px-4 py-1.5 bg-[#225091] text-white text-xs font-semibold rounded-full shadow-sm">
                      Customer
                    </div>
                  </div>
                </div>
                
                <Link to={`/customers/${customerToView.id}/loans`} className="py-2.5 px-6 rounded-full border-2 border-[#225091] text-[#225091] font-semibold bg-white hover:bg-teal-50 transition-colors focus:outline-none text-[15px] shadow-sm block text-center">
                  See Loans
                </Link>
              </div>

              <div className="h-px bg-gray-200 w-full mb-6"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Gender */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <User size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Gender</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.gender}</div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Calendar size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Date Of Birth</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.dob}</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Phone size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Phone Number</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.phone}</div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Mail size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Email</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.email}</div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50 mb-6">
                <div className="mt-0.5">
                  <MapPin size={22} className="text-[#225091]" />
                </div>
                <div>
                  <div className="text-[13px] text-gray-500 font-medium mb-1">Address</div>
                  <div className="text-[15px] font-semibold text-gray-800">2464 Royal Ln. Mesa, New Jersey 45463</div>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full my-6"></div>

              {/* Registered On */}
              <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50 w-full md:w-[calc(50%-8px)]">
                <div className="mt-0.5">
                  <Calendar size={22} className="text-[#225091]" />
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

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Add Customer</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <form onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-8 pb-4 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4 relative">
                {/* Avatar Upload */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Avatar Preview" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/3 bg-[#225091] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Gender</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] appearance-none text-gray-500 shadow-sm">
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
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Phone <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  maxLength={10}
                  pattern="\d{10}"
                  onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                  placeholder="Enter 10-digit phone Number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" 
                  required
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  placeholder="Enter email address" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" 
                  required
                  title="Please enter a valid email address"
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Address</label>
                <input type="text" placeholder="Enter address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-4 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="py-2.5 px-8 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="py-2.5 px-8 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
              >
                Create
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && customerToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Edit Customer</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-8 pb-4 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4 relative">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm text-[#225091] text-2xl font-bold">
                    {customerToEdit.avatar ? (
                      <img src={customerToEdit.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      customerToEdit.initials
                    )}
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/3 bg-[#225091] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Full Name</label>
                <input type="text" defaultValue={customerToEdit.name} placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Gender</label>
                <div className="relative">
                  <select defaultValue={customerToEdit.gender.toLowerCase()} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
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
                  <input type="text" defaultValue={customerToEdit.dob} placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Phone</label>
                <input type="tel" defaultValue={customerToEdit.phone} placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Email</label>
                <input type="email" defaultValue={customerToEdit.email !== '-' ? customerToEdit.email : ''} placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Address</label>
                <input type="text" defaultValue="2464 Royal Ln. Mesa, New Jersey 45463" placeholder="Enter address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-4 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2.5 px-8 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2.5 px-8 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
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

export default Customers;
