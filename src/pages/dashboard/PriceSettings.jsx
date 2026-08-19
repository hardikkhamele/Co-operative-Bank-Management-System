import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Edit } from 'lucide-react';

const PriceSettings = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-[#1D4ED8] mb-2">Price Settings</h1>
        <div className="flex items-center text-sm font-medium">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-gray-600">Settings</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1D4ED8]">Price Settings</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">EMI Card Price</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">EMI Card Price For Customer</label>
            <div className="relative">
              <input
                type="text"
                defaultValue="Rs. 499"
                readOnly
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none appearance-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">EMI Card Price For Bank</label>
            <div className="relative">
              <input
                type="text"
                defaultValue="Rs. 100"
                readOnly
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none appearance-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 bg-[#1D4ED8] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm">
            <Edit size={16} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSettings;
