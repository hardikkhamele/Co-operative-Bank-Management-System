import React from 'react';
import { X } from 'lucide-react';

const RegionModal = ({ isOpen, onClose, mode, initialData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#f4f3fb]">
          <h2 className="text-xl font-bold text-[#1b2559]">
            {mode === 'create' ? 'Add Region' : 'Edit Region'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {/* Form Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Region Name</label>
            <input 
              type="text" 
              placeholder="Enter Region name" 
              defaultValue={initialData?.name || ''}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Region Manager</label>
            <input 
              type="text" 
              placeholder="Enter Manager Name" 
              defaultValue={initialData?.manager || ''}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-sm shadow-sm" 
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-[#f4f3fb] border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="py-2 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="py-2 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-sm shadow-sm"
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionModal;
