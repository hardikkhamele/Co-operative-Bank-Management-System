import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

const FileUploadField = ({ label, id, initialFile }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-semibold text-gray-800">{label}</label>
      <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-[#1cabb1] rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer group">
        <input 
          type="file" 
          id={id} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="image/*,.pdf"
        />
        <div className="flex flex-col items-center gap-1 text-[#1cabb1] transition-colors">
          <CheckCircle2 size={24} className="text-[#32c965]" />
          <span className="text-xs font-medium text-gray-700">{initialFile}</span>
          <span className="text-[10px] text-gray-500">Click to change</span>
        </div>
      </div>
    </div>
  );
};

const EditMerchant = () => {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Edit Merchant</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">Partner Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/merchant" className="hover:text-gray-700">Merchant</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Edit</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">General Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Shop Name</label>
              <input type="text" defaultValue="Tech Haven" placeholder="Enter shop name" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Shop Owner Name</label>
              <input type="text" defaultValue="Tony Stark" placeholder="Enter owner name" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email</label>
              <input type="email" defaultValue="tony@techhaven.com" placeholder="Enter email address" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Phone Number</label>
              <input type="tel" defaultValue="9876543210" placeholder="Enter phone number" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Owner Aadhar Number</label>
              <input type="text" defaultValue="1234 5678 9012" placeholder="Enter Aadhar number" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Owner PAN Number</label>
              <input type="text" defaultValue="ABCDE1234F" placeholder="Enter PAN number" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">GSTIN Number</label>
              <input type="text" defaultValue="27ABCDE1234F1Z5" placeholder="Enter GSTIN" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>
            
            <div>
              <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Password</label>
              <input type="password" placeholder="Change password (leave empty to keep current)" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm text-[15px]" />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Documents Upload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FileUploadField label="Owner Aadhar" id="aadhar-upload" initialFile="aadhar_card.jpg" />
            <FileUploadField label="Owner PAN" id="pan-upload" initialFile="pan_card.jpg" />
            <FileUploadField label="Shop Registration Certificate" id="reg-cert-upload" initialFile="shop_reg.pdf" />
            <FileUploadField label="GST Certificate" id="gst-cert-upload" initialFile="gst_cert.pdf" />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link to="/merchant" className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px]">
            Cancel
          </Link>
          <button className="px-8 py-3 rounded-full bg-[#1cabb1] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMerchant;
