import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const CardCreditSettingsModal = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState('add');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-[22px] font-bold text-[#1b2559]">Card & Credit Settings</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 pt-0 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          
          {/* Radio Buttons */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedType === 'add' ? 'border-[#1cabb1]' : 'border-gray-500'}`}>
                {selectedType === 'add' && <div className="w-3 h-3 rounded-full bg-[#1cabb1]" />}
              </div>
              <span className="text-[15px] text-gray-700">Add Card & Credit</span>
              <input 
                type="radio" 
                name="creditType" 
                value="add" 
                className="hidden" 
                checked={selectedType === 'add'}
                onChange={() => setSelectedType('add')}
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedType === 'transfer' ? 'border-[#1cabb1]' : 'border-gray-500'}`}>
                {selectedType === 'transfer' && <div className="w-3 h-3 rounded-full bg-[#1cabb1]" />}
              </div>
              <span className="text-[15px] text-gray-700">Transfer Card & Credit</span>
              <input 
                type="radio" 
                name="creditType" 
                value="transfer" 
                className="hidden" 
                checked={selectedType === 'transfer'}
                onChange={() => setSelectedType('transfer')}
              />
            </label>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2">State/UT</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-[15px] text-gray-600 shadow-sm appearance-none cursor-pointer">
                  <option>Maharashtra</option>
                  <option>Gujarat</option>
                  <option>Karnataka</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2">Branch</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-[15px] text-gray-600 shadow-sm appearance-none cursor-pointer">
                  <option>Mumbai</option>
                  <option>Pune</option>
                  <option>Nagpur</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Available Balances */}
          <div className="space-y-1.5 text-[#2e5b9f] text-[15px]">
            <div>Available EMI Card: 123</div>
            <div>Available Verification Credit: 123</div>
          </div>

          {/* Number Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2">EMI Card</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="Enter quantity" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-[15px] shadow-sm appearance-none" 
                  style={{ MozAppearance: 'textfield' }} // hides standard arrows in firefox
                />
                <div className="absolute inset-y-0 right-0 flex flex-col justify-center pr-3">
                  <button className="text-gray-500 hover:text-gray-800 p-0.5"><ChevronUp size={14} /></button>
                  <button className="text-gray-500 hover:text-gray-800 p-0.5"><ChevronDown size={14} /></button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2">Verification Credit</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="Enter quantity" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1] focus:border-transparent bg-white text-[15px] shadow-sm appearance-none" 
                  style={{ MozAppearance: 'textfield' }}
                />
                <div className="absolute inset-y-0 right-0 flex flex-col justify-center pr-3">
                  <button className="text-gray-500 hover:text-gray-800 p-0.5"><ChevronUp size={14} /></button>
                  <button className="text-gray-500 hover:text-gray-800 p-0.5"><ChevronDown size={14} /></button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="p-6 pt-2 pb-6 flex justify-end gap-4 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="py-2.5 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="py-2.5 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Hide default number input arrows globally for this component */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}} />
    </div>
  );
};

export default CardCreditSettingsModal;
