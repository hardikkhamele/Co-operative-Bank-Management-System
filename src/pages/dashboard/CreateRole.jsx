import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CreateRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [category, setCategory] = useState('');

  const modules = [
    'Dashboard',
    'Module 1',
    'Module 2',
    'Module 3',
    'Module 4',
    'Module 5',
    'Module 6',
    'Module 7',
    'Module 8',
  ];

  const permissionOptions = [
    'View Only',
    'Create',
    'Edit',
    'Delete',
    'Name',
    'Name ',
    'Name  ',
  ];

  // State to hold permissions (simplified for UI demonstration)
  const [permissions, setPermissions] = useState({});

  const togglePermission = (mod, perm) => {
    setPermissions(prev => ({
      ...prev,
      [`${mod}-${perm}`]: !prev[`${mod}-${perm}`]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#4285F4] mb-2">Create Roles & Permissions</h1>
        <div className="flex items-center text-sm text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-[#1cabb1]">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Roles & Permissions</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/roles-permissions" className="hover:text-[#1cabb1]">Roles & Permissions</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Create Roles & Permissions</span>
        </div>
      </div>

      {/* Form Section: Roles */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Roles Name</label>
            <input
              type="text"
              placeholder="Enter role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-gray-600"
              >
                <option value="" disabled>Select</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section: Permissions */}
      <div className="flex-1 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((mod, idx) => (
            <div key={idx} className="bg-[#f8f9fc] rounded-xl p-5 border border-indigo-50/50">
              <h3 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200/60">{mod}</h3>
              <div className="space-y-3">
                {permissionOptions.map((perm, pIdx) => (
                  <label key={pIdx} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-[#5a5ce5] checked:border-[#5a5ce5] transition-colors cursor-pointer"
                        checked={permissions[`${mod}-${perm}`] || false}
                        onChange={() => togglePermission(mod, perm)}
                      />
                      <svg
                        className="absolute inset-0 w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{perm.trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
        <button
          onClick={() => navigate('/roles-permissions')}
          className="px-6 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          className="px-8 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white font-medium transition-colors"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default CreateRole;
