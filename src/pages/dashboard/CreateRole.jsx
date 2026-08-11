import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { roleService } from '../../api/roleService';

const CreateRole = () => {
  const navigate = useNavigate();
  
  // Form State
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState(new Set()); // Store selected keys (e.g. 'dashboard.view')
  
  // Dynamic Modules State
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await roleService.getPermissions();
        if (response.success && response.data?.modules) {
          setModules(response.data.modules);
        }
      } catch (error) {
        console.error("Failed to load permissions:", error);
        toast.error("Failed to load system permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const togglePermission = (mod, permKey) => {
    const permObj = mod.permissions.find(p => p.key === permKey);
    const isView = permObj?.label.toLowerCase().includes('view');

    setPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permKey)) {
        if (isView) {
          mod.permissions.forEach(p => newSet.delete(p.key));
        } else {
          newSet.delete(permKey);
        }
      } else {
        newSet.add(permKey);
      }
      return newSet;
    });
  };

  const isPermDisabled = (mod, permKey) => {
    const permObj = mod.permissions.find(p => p.key === permKey);
    const isView = permObj?.label.toLowerCase().includes('view');
    if (isView) return false;
    
    const viewPerm = mod.permissions.find(p => p.label.toLowerCase().includes('view'));
    if (viewPerm && !permissions.has(viewPerm.key)) {
      return true;
    }
    return false;
  };

  const handleCreate = async () => {
    if (!roleName) {
      toast.error("Role Name is required.");
      return;
    }
    if (permissions.size === 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    setSubmitting(true);
    try {
      // Create code from name by uppercasing and replacing spaces
      const code = roleName.trim().toUpperCase().replace(/\s+/g, '_');
      
      const payload = {
        name: roleName,
        code: code,
        description: description || `Custom role for ${roleName}`,
        permissions: Array.from(permissions)
      };

      const response = await roleService.create(payload);
      if (response.success) {
        navigate('/roles-permissions');
      }
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error(error.response?.data?.message || "Failed to create role.");
    } finally {
      setSubmitting(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <input
              type="text"
              placeholder="Role description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Form Section: Permissions */}
      <div className="flex-1 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Permissions</h2>
          <span className="text-sm font-medium text-[#1cabb1] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            Selected: {permissions.size}
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading system permissions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {modules.map((mod, idx) => {
              const displayPerms = mod.label.toLowerCase() === 'dashboard'
                ? mod.permissions?.filter(p => p.label.toLowerCase().includes('view'))
                : mod.permissions;

              return (
                <div key={idx} className="bg-[#f8f9fc] rounded-xl p-5 border border-indigo-50/50 flex flex-col">
                  <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200/60">{mod.label}</h3>
                  <div className="space-y-3 flex-1">
                    {displayPerms?.map((perm, pIdx) => {
                      const disabled = isPermDisabled(mod, perm.key);
                      return (
                        <label key={pIdx} className={`flex items-center gap-3 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              className={`peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-[#1cabb1] checked:border-[#1cabb1] transition-colors ${disabled ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer'}`}
                              checked={permissions.has(perm.key)}
                              onChange={() => {
                                if (!disabled) togglePermission(mod, perm.key);
                              }}
                              disabled={disabled}
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
                          <span className={`text-sm font-medium transition-colors ${disabled ? 'text-gray-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {perm.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100 mt-auto">
        <button
          onClick={() => navigate('/roles-permissions')}
          className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={submitting || !roleName || permissions.size === 0}
          className="px-8 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
        >
          {submitting ? 'Creating...' : 'Create Role'}
        </button>
      </div>
    </div>
  );
};

export default CreateRole;
