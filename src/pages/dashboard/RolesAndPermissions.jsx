import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, Eye, Edit, Trash2, ChevronLeft, X, ChevronDown } from 'lucide-react';

const RolesAndPermissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState(null);


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
    return row.role.toLowerCase().includes(searchTerm.toLowerCase());
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
              <th className="py-4 px-6 text-center w-20">Sr. No.</th>
              <th className="py-4 px-6">Roles</th>
              <th className="py-4 px-6">Total Permissions</th>
              <th className="py-4 px-6 text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm text-gray-600">
                <td className="py-4 px-6 text-center">{index + 1}</td>
                <td className="py-4 px-6 font-medium text-gray-800">{row.role}</td>
                <td className="py-4 px-6">{row.totalPermissions}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => {
                        setSelectedRoleForView(row);
                        setIsViewModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <Link to="/roles-permissions/edit" className="text-gray-400 hover:text-blue-500 transition-colors">
                      <Edit size={18} />
                    </Link>
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

      {/* View Role Modal */}
      {isViewModalOpen && selectedRoleForView && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-[#f4f6fa] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-white rounded-t-xl">
              <h2 className="text-[17px] font-bold text-[#1e293b]">Roles & Permissions Details</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-[17px] font-bold text-[#3b82f6]">{selectedRoleForView.role}</h3>
              </div>
              
              <div className="text-[13px] font-medium text-gray-600 mb-3">Permissions</div>
              
              <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
                <div className="flex border-b border-gray-100 p-5">
                  <div className="w-1/3 font-bold text-gray-700 text-sm">Dashboard</div>
                  <div className="w-2/3 text-[13px] text-gray-500 leading-relaxed">Regional Manager can view the dashboard</div>
                </div>
                <div className="flex border-b border-gray-100 p-5 bg-[#fafafa]">
                  <div className="w-1/3 font-bold text-gray-700 text-sm">Module 1</div>
                  <div className="w-2/3 text-[13px] text-gray-500 leading-relaxed">Regional Manager can edit, block/unblock</div>
                </div>
                <div className="flex border-b border-gray-100 p-5">
                  <div className="w-1/3 font-bold text-gray-700 text-sm">Module 2</div>
                  <div className="w-2/3 text-[13px] text-gray-500 leading-relaxed">Regional Manager can View block/unblock, Attendance add Staff View Sales, edit and Delete.</div>
                </div>
                <div className="flex border-b border-gray-100 p-5 bg-[#fafafa]">
                  <div className="w-1/3 font-bold text-gray-700 text-sm">Module 3</div>
                  <div className="w-2/3 text-[13px] text-gray-500 leading-relaxed">Regional Manager View, add, edit and Delete.</div>
                </div>
                <div className="flex p-5">
                  <div className="w-1/3 font-bold text-gray-700 text-sm">Module 4</div>
                  <div className="w-2/3 text-[13px] text-gray-500 leading-relaxed">Regional Manager can View block/unblock, Attendance add Staff View Sales, edit and Delete.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesAndPermissions;
